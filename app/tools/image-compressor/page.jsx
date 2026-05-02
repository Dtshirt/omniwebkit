'use client';

import { useState, useRef, useCallback } from 'react';
import { Minimize2, Upload, Download, X, CheckCircle, AlertTriangle, Image, Settings, Zap } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Browser-native image compression via Canvas API ─────────────────── */
async function compressImageBrowser(file, quality, maxW, maxH) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        let { width, height } = img;
        // Resize if max dimensions specified
        if (maxW && width > maxW) { height = Math.round(height * maxW / width); width = maxW; }
        if (maxH && height > maxH) { width = Math.round(width * maxH / height); height = maxH; }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // PNG stays as PNG (lossless); everything else → JPEG for compression
        const isPNG = file.type === 'image/png';
        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compression failed')); return; }
            resolve({ blob, width, height });
          },
          isPNG ? 'image/png' : 'image/jpeg',
          quality / 100
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ─── Per-file compression (returns updated fileItem) ──────────────────── */
async function processFile(fileItem, quality, maxW, maxH) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve({ ...fileItem, status: 'error', error: 'Failed to read file' });
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => resolve({ ...fileItem, status: 'error', error: 'Failed to decode image' });
      img.onload = async () => {
        let { width, height } = img;
        if (maxW && width > maxW) { height = Math.round(height * maxW / width); width = maxW; }
        if (maxH && height > maxH) { width = Math.round(width * maxH / height); height = maxH; }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

        const origSize = fileItem.file.size;

        // Helper: toBlob as a Promise
        const tryBlob = (mime, q) => new Promise((res) => canvas.toBlob(res, mime, q));

        // Progressive compression: start at chosen quality, step down 5% each time
        // until output < original OR we reach minimum quality 5%
        let blob = null;
        let q = quality / 100;
        const minQ = 0.05;
        const step = 0.05;

        // For PNG, try converting to JPEG first (much better compression for photos)
        const isPNG = fileItem.file.type === 'image/png';
        const mime = isPNG ? 'image/jpeg' : 'image/jpeg'; // always try JPEG for compression

        while (q >= minQ) {
          blob = await tryBlob(mime, q);
          if (blob && blob.size < origSize) break; // achieved compression ✓
          q = Math.round((q - step) * 100) / 100;
        }

        // If still not smaller (very rare — e.g. tiny icons), try PNG lossless as last resort
        if (!blob || blob.size >= origSize) {
          blob = await tryBlob('image/png', undefined);
        }

        if (!blob) {
          resolve({ ...fileItem, status: 'error', error: 'Compression failed' });
          return;
        }

        // Final check — if truly cannot compress, return original
        if (blob.size >= origSize) {
          const origBlob = new Blob([fileItem.file], { type: fileItem.file.type });
          resolve({
            ...fileItem,
            status: 'done',
            compBlob: origBlob,
            compSize: origSize,
            compUrl: URL.createObjectURL(origBlob),
            outW: width, outH: height,
            noGain: true,
          });
          return;
        }

        resolve({
          ...fileItem,
          status: 'done',
          compBlob: blob,
          compSize: blob.size,
          compUrl: URL.createObjectURL(blob),
          outW: width, outH: height,
          noGain: false,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileItem.file);
  });
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function ImageCompressor() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [maxW, setMaxW] = useState('');
  const [maxH, setMaxH] = useState('');
  const [processing, setProc] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = useRef(null);

  const PRESETS = [
    { label: 'Maximum', q: 60, desc: 'Smallest file', color: 'text-red-500' },
    { label: 'Balanced', q: 80, desc: 'Recommended', color: 'text-emerald-600' },
    { label: 'Light', q: 92, desc: 'Best quality', color: 'text-blue-500' },
  ];

  /* ── Add files ── */
  const addFiles = useCallback((incoming) => {
    const images = [...incoming].filter(f => f.type.startsWith('image/'));
    if (!images.length) return;
    const newItems = images.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      status: 'ready',
    }));
    setFiles(p => [...p, ...newItems]);
  }, []);

  const removeFile = (id) => setFiles(p => p.filter(f => f.id !== id));
  const clearAll = () => setFiles([]);

  /* ── Compress all ── */
  const compressAll = async () => {
    const ready = files.filter(f => f.status === 'ready');
    if (!ready.length) return;
    setProc(true);

    // Mark all pending as processing
    setFiles(p => p.map(f => f.status === 'ready' ? { ...f, status: 'processing' } : f));

    const results = await Promise.all(
      ready.map(fi => processFile(fi, quality, maxW ? +maxW : null, maxH ? +maxH : null))
    );

    setFiles(p => {
      const map = Object.fromEntries(results.map(r => [r.id, r]));
      return p.map(f => map[f.id] ?? f);
    });
    setProc(false);
  };

  /* ── Download ── */
  const downloadOne = (fi) => {
    if (!fi.compBlob) return;
    const ext = fi.file.type === 'image/png' ? 'png' : 'jpg';
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + `_compressed.${ext}`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.compBlob), download: name }).click();
  };

  const readyCount = files.filter(f => f.status === 'ready').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Compressor', href: '/tools/image-compressor' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mb-4 shadow-lg shadow-violet-500/20">
            <Minimize2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Compress Images Online Without Losing Quality</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Reduce image file sizes by up to 90% instantly. The smartest, fastest, and most secure way to compress PNG, JPG, and WebP files.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-violet-500" />Compression Settings
              </h2>

              {/* Quality presets */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Preset Level</p>
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => setQuality(p.q)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${quality === p.q ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10 text-violet-700 dark:text-violet-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    <div>{p.label}</div>
                    <div className="text-[10px] font-normal mt-0.5 opacity-70">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Quality slider */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quality</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{quality}%</span>
                </div>
                <input type="range" min={10} max={100} step={1} value={quality} onChange={e => setQuality(+e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500" />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>High compression</span><span>Best quality</span>
                </div>
              </div>

              {/* Max dimensions */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Max Dimensions <span className="font-normal opacity-70">(optional)</span></p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[{ label: 'Max Width', val: maxW, set: setMaxW, ph: '1920' }, { label: 'Max Height', val: maxH, set: setMaxH, ph: '1080' }].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
                    <input type="number" min={1} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-violet-500 transition placeholder-slate-400" />
                  </div>
                ))}
              </div>

              <button onClick={compressAll} disabled={processing || readyCount === 0}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                {processing ? 'Compressing…' : `Compress ${readyCount > 0 ? readyCount : ''} Image${readyCount !== 1 ? 's' : ''}`}
              </button>

              {files.length > 0 && (
                <button onClick={clearAll} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5" />Clear all images
                </button>
              )}
            </div>

            {/* Stats summary */}
            {doneCount > 0 && (() => {
              const done = files.filter(f => f.status === 'done');
              const origTotal = done.reduce((s, f) => s + f.file.size, 0);
              const compTotal = done.reduce((s, f) => s + f.compSize, 0);
              const saved = origTotal > 0 ? ((origTotal - compTotal) / origTotal * 100) : 0;
              return (
                <div className={`${cardCls} p-5`}>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Compression Results</h3>
                  {[
                    { label: 'Files compressed', val: `${doneCount}`, color: 'text-slate-900 dark:text-white' },
                    { label: 'Original total', val: fmtSize(origTotal), color: 'text-slate-900 dark:text-white' },
                    { label: 'Compressed total', val: fmtSize(compTotal), color: 'text-slate-900 dark:text-white' },
                    { label: 'Space saved', val: `${saved.toFixed(1)}%`, color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex justify-between py-1.5 text-xs border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className={color}>{val}</span>
                    </div>
                  ))}
                  {saved > 0 && (
                    <div className="mt-3">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(saved, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Drop zone */}
            <div className={`${cardCls} overflow-hidden`}>
              <div
                onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                onDragLeave={() => setFileDrag(false)}
                onDrop={e => { e.preventDefault(); setFileDrag(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mb-3 shadow-md shadow-violet-500/20">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop images here!' : 'Upload Images to Compress'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse • Multiple files supported</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['JPG', 'PNG', 'WebP', 'GIF', 'BMP'].map(f => (
                    <span key={f} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{f}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Files list */}
            {files.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Image className="w-4 h-4 text-violet-500" />Images ({files.length})
                  </h3>
                  {doneCount > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{doneCount} compressed</span>
                  )}
                </div>

                <div className="space-y-3">
                  {files.map(fi => {
                    const saved = fi.status === 'done' && fi.file.size > 0
                      ? ((fi.file.size - fi.compSize) / fi.file.size * 100)
                      : 0;
                    return (
                      <div key={fi.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 flex gap-2">
                          <img src={fi.preview} alt={fi.file.name} className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700" title="Original" />
                          {fi.status === 'done' && fi.compUrl && (
                            <img src={fi.compUrl} alt="Compressed" className="w-14 h-14 object-cover rounded-xl border border-violet-300 dark:border-violet-700" title="Compressed" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">{fi.file.name}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                            <span className="text-slate-500 dark:text-slate-400">Original: {fmtSize(fi.file.size)}</span>
                            {fi.status === 'done' && (
                              <>
                                <span className="text-emerald-600 dark:text-emerald-400">→ {fmtSize(fi.compSize)}</span>
                                {fi.noGain ? (
                                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full font-bold">Already optimised</span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">{saved.toFixed(1)}% smaller</span>
                                )}
                              </>
                            )}
                            {fi.status === 'processing' && <span className="text-violet-600 dark:text-violet-400">Compressing…</span>}
                            {fi.status === 'error' && <span className="text-red-600 dark:text-red-400">Error: {fi.error}</span>}
                          </div>
                          {fi.status === 'done' && saved > 0 && !fi.noGain && (
                            <div className="mt-1.5 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(saved, 100)}%` }} />
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {fi.status === 'done' && (
                            <button onClick={() => downloadOne(fi)} title="Download compressed"
                              className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition shadow-sm">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => removeFile(fi.id)} title="Remove"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

                {/* ── SEO Content ── */}
        <div className="mt-16 space-y-12">

          {/* Introduction */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Free Online Image Compressor — Reduce File Sizes Without Losing Quality</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                Large image files are the silent killers of website performance. A single unoptimized 5MB hero image can delay a page from loading by several seconds, frustrating users on mobile networks and causing your bounce rate to skyrocket. Furthermore, search engines like Google heavily penalize slow-loading pages in their search rankings.
              </p>
              <p className="text-lg leading-relaxed">
                The <strong>OmniWebKit Image Compressor</strong> is an enterprise-grade optimization tool designed to solve this exact problem. By utilizing advanced browser-based compression algorithms, it mathematically analyzes your image data and strips out invisible metadata, unnecessary color profiles, and redundant pixel information. The result? You can shrink JPEG, PNG, and WebP files by up to 80% while retaining virtually identical visual fidelity.
              </p>
              <p className="text-lg leading-relaxed">
                Most online image compressors require you to upload your sensitive corporate assets or personal photos to an external server. Our architecture is different. We leverage modern WebAssembly (Wasm) and HTML5 Canvas technologies to process every byte of your image entirely locally within your browser. Your images are never uploaded, never saved to a database, and never intercepted. It is the fastest, safest, and most private way to compress images online.
              </p>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="${cardCls} p-8 lg:p-12 bg-sky-50/50 dark:bg-sky-900/10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">How to Compress Images Online</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Upload Your Images', desc: 'Drag and drop your bulky image files directly into the drop zone. You can upload multiple JPG, PNG, and WebP files at the same time to utilize our bulk-compression engine.' },
                { step: '2', title: 'Dial in the Quality Setting', desc: 'Use the interactive quality slider to determine how aggressively the algorithm should compress the file. 80% is the golden standard—it significantly reduces the file size without introducing noticeable artifacts.' },
                { step: '3', title: 'Monitor Real-Time Savings', desc: 'As you adjust the slider, the engine recompresses the image in milliseconds. Watch the output file size update in real time to see exactly how many kilobytes or megabytes you are saving.' },
                { step: '4', title: 'Download and Deploy', desc: 'Click the download button next to a compressed file, or use the "Download All" button. Your optimized images are now ready to be uploaded to your CMS, attached to an email, or shared on social media.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md shadow-sky-500/30">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Why Use the OmniWebKit Image Compressor?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: 'Zero Server Uploads', desc: 'Your data stays on your machine. Because we utilize Web APIs for local processing, you don\'t have to wait for a 20MB image to upload over a slow internet connection. The compression happens instantly in your RAM.' },
                { title: 'Smart Batch Processing', desc: 'Optimizing an entire photo album? Drag in 50 images at once. The compressor handles them concurrently, utilizing your device\'s multi-core CPU to crush file sizes faster than server-based alternatives.' },
                { title: 'Web Vitals Optimization', desc: 'Slow Largest Contentful Paint (LCP) scores ruin SEO. By running your hero images and background assets through this compressor, you can shave seconds off your load times and improve your Google Lighthouse score.' },
                { title: 'Format Retention', desc: 'If you upload a transparent PNG, you get a compressed transparent PNG back. Our engine respects the original file format, ensuring that alpha channels and required formatting are perfectly preserved.' }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-sky-600 dark:text-sky-400">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is there a difference between lossless and lossy compression?', a: 'Yes. Lossless compression removes metadata and organizes data more efficiently without altering a single pixel, but the file size reduction is minimal (typically 5-15%). Lossy compression (what this tool uses) mathematically simplifies complex pixel groupings, permanently discarding data that the human eye cannot easily perceive. This results in massive file size reductions (up to 80%).' },
                { q: 'Will compressing my image make it look blurry or pixelated?', a: 'Only if you set the compression slider too low. At a setting of 80% to 90%, the visual difference between the original and compressed image is nearly imperceptible to the naked eye. If you drop the slider below 50%, you will start to see "blocking" artifacts and blurriness, especially around sharp edges and text.' },
                { q: 'Can I compress an image that has already been compressed?', a: 'You can, but it is highly discouraged. Every time you apply lossy compression to a JPEG or WebP file, generation loss occurs. The artifacts compound, and the image rapidly degrades in quality. Always try to compress from the highest quality original source file available.' },
                { q: 'Why is my PNG file still so large after compression?', a: 'PNG is natively a lossless format. While our tool attempts to optimize the PNG structure, you cannot drastically shrink a photographic PNG without converting it to a lossy format. If you need a massive file size reduction for a photo, convert it to a JPEG or WebP instead.' },
                { q: 'Is it safe to compress confidential corporate documents?', a: 'Absolutely. Because the OmniWebKit Image Compressor runs 100% locally in your web browser, your files are never transmitted across the internet. There is zero risk of interception or unauthorized storage on third-party servers.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors select-none">
                    <span className="text-base pr-4">{q}</span>
                    <span className="text-slate-400 text-2xl group-open:rotate-45 transition-transform flex-shrink-0 leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Internal Linking */}
          <div className="mt-8 text-center bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">More Image Compression Tools</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">Looking for something specific? Check out our specialized tools:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/tools/image-compressor/compress-image-to-50kb" className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline">Compress to 50KB</a>
              <a href="/tools/image-compressor/compress-image-for-whatsapp" className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline">WhatsApp Optimizer</a>
              <a href="/tools/image-compressor/bulk-image-compressor-online" className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline">Bulk Compressor</a>
              <a href="/tools/image-compressor/compress-image-for-website-fast" className="text-sm font-semibold text-sky-600 dark:text-sky-400 hover:underline">Web Vitals Compressor</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
