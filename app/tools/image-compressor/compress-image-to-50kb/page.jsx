'use client';

import { useState, useRef, useCallback } from 'react';
import { Minimize2, Upload, Download, X, Settings, Zap, Target } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Per-file target compression (returns updated fileItem) ───────────── */
async function processFile(fileItem, targetKB, maxW, maxH) {
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

        const origSize = fileItem.file.size;
        const targetBytes = targetKB * 1024;
        
        const tryBlob = (mime, q, w, h) => new Promise((res) => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = w;
            tempCanvas.height = h;
            tempCanvas.getContext('2d').drawImage(img, 0, 0, w, h);
            tempCanvas.toBlob(res, mime, q);
        });

        let blob = null;
        let q = 0.95;
        const minQ = 0.1;
        const step = 0.05;
        let scale = 1.0;
        const mime = 'image/jpeg'; // Force JPEG to hit aggressive size targets

        // Phase 1: Try reducing quality first
        while (q >= minQ) {
          blob = await tryBlob(mime, q, width, height);
          if (blob && blob.size <= targetBytes) break;
          q = Math.round((q - step) * 100) / 100;
        }

        // Phase 2: If quality drop isn't enough, we must downscale dimensions
        if (!blob || blob.size > targetBytes) {
           q = 0.6; // Reset to a reasonable lossy quality
           while (scale > 0.1) {
              scale -= 0.1;
              const w = Math.round(width * scale);
              const h = Math.round(height * scale);
              blob = await tryBlob(mime, q, w, h);
              if (blob && blob.size <= targetBytes) {
                  width = w; height = h;
                  break;
              }
           }
        }

        if (!blob) {
          resolve({ ...fileItem, status: 'error', error: 'Compression failed' });
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
          hitTarget: blob.size <= targetBytes
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileItem.file);
  });
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function CompressTo50KB() {
  const [files, setFiles] = useState([]);
  const [targetKB, setTargetKB] = useState(50);
  const [maxW, setMaxW] = useState('');
  const [maxH, setMaxH] = useState('');
  const [processing, setProc] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = useRef(null);

  /* ── Add files ── */
  const addFiles = useCallback((incoming) => {
    const images = [...incoming].filter(f => f.type.startsWith('image/'));
    if (!images.length) return;
    // For 50KB mode, usually users upload 1 or 2 files, but we support bulk.
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
      ready.map(fi => processFile(fi, targetKB, maxW ? +maxW : null, maxH ? +maxH : null))
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
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + `_${targetKB}kb.jpg`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.compBlob), download: name }).click();
  };

  const readyCount = files.filter(f => f.status === 'ready').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[
          { name: 'Image Compressor', href: '/tools/image-compressor' },
          { name: 'Compress to 50KB', href: '/tools/image-compressor/compress-image-to-50kb' }
        ]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Compress Any Image to Exactly 50KB</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Perfect for job applications, passports, and official online forms. Get your image precisely under size limit.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5 border-emerald-200 dark:border-emerald-900`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />Target Size Config
              </h2>

              {/* Target Size Input */}
              <div className="mb-6">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Target Size (KB)</label>
                <div className="relative mt-1">
                   <input type="number" min={1} max={5000} value={targetKB} onChange={e => setTargetKB(+e.target.value)}
                     className="w-full px-4 py-3 text-lg font-bold border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-xl focus:outline-none focus:ring-4 ring-emerald-500/20 transition" />
                   <span className="absolute right-4 top-3 text-emerald-600/50 dark:text-emerald-400/50 font-bold">KB</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">We will automatically reduce quality and dimensions until the image drops below this threshold.</p>
              </div>

              {/* Max dimensions */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Max Dimensions <span className="font-normal opacity-70">(optional)</span></p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[{ label: 'Max Width', val: maxW, set: setMaxW, ph: 'Auto' }, { label: 'Max Height', val: maxH, set: setMaxH, ph: 'Auto' }].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
                    <input type="number" min={1} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-emerald-500 transition placeholder-slate-400" />
                  </div>
                ))}
              </div>

              <button onClick={compressAll} disabled={processing || readyCount === 0}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                {processing ? 'Targeting Size…' : `Resize & Compress`}
              </button>

              {files.length > 0 && (
                <button onClick={clearAll} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5" />Clear all images
                </button>
              )}
            </div>
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
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-3 shadow-md shadow-emerald-500/20">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop document here!' : `Select Photo for ${targetKB}KB`}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse</p>
              </div>
            </div>

            {/* Files list */}
            {files.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="space-y-3">
                  {files.map(fi => {
                    const isUnderTarget = fi.status === 'done' && fi.compSize <= targetKB * 1024;
                    return (
                      <div key={fi.id} className={`flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border ${isUnderTarget ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/50 dark:bg-emerald-900/10' : 'border-slate-200 dark:border-slate-700'} rounded-xl transition-colors`}>
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 flex gap-2">
                          <img src={fi.preview} alt={fi.file.name} className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700" title="Original" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">{fi.file.name}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-medium items-center">
                            <span className="text-slate-500 dark:text-slate-400">Orig: {fmtSize(fi.file.size)}</span>
                            {fi.status === 'done' && (
                              <>
                                <span className={isUnderTarget ? 'text-emerald-600 dark:text-emerald-400 font-bold text-xs' : 'text-amber-600 dark:text-amber-400'}>
                                  → {fmtSize(fi.compSize)}
                                </span>
                                {isUnderTarget && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold flex items-center gap-1">✅ Pass</span>}
                              </>
                            )}
                            {fi.status === 'processing' && <span className="text-emerald-600 dark:text-emerald-400">Targeting…</span>}
                            {fi.status === 'error' && <span className="text-red-600 dark:text-red-400">Error: {fi.error}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {fi.status === 'done' && (
                            <button onClick={() => downloadOne(fi)} title="Download compressed"
                              className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-sm">
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

          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">How to Compress an Image to 50KB Without Losing Quality?</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Whether you are applying for a government job, submitting a university application, or uploading a scanned signature, one of the most common hurdles is strict image size limits. Often, portals will completely reject your file if it is even 1KB over the 50KB limit.
              </p>
              <p>
                Our <strong>50KB Target Compressor</strong> eliminates the guesswork. Instead of manually moving a quality slider and checking the file size over and over, you simply type in your target size (e.g., 50KB). Our algorithm will progressively reduce the file's metadata, adjust its JPEG compression ratio, and downscale its dimensions if necessary until it perfectly hits the target.
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Why Do Websites Ask for 50KB Images?</h3>
              <p>
                Legacy databases created by government or educational institutions were designed when server storage was incredibly expensive. To prevent their databases from overflowing with 10MB iPhone photos, they implemented strict caps. A 50KB JPEG file provides just enough data to clearly identify a face in a passport photo or read a scanned signature without eating up server space.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Will a 50KB image look blurry?', a: 'For passport photos, headshots, or scanned signatures, a 50KB image will look perfectly sharp. However, if you attempt to compress a massive, highly detailed landscape photo down to 50KB, you may notice some pixelation. Our tool balances dimensions and quality to give you the clearest possible result.' },
                { q: 'Can I compress an image to 20KB instead?', a: 'Absolutely! Simply change the "Target Size" input from 50KB to 20KB (or any other number). The algorithm will adjust to hit your new target.' },
                { q: 'Why is my form still rejecting the image?', a: 'Some portals check BOTH the file size (e.g., under 50KB) and the dimensions (e.g., exactly 200x200 pixels). Use the "Max Dimensions" fields in the settings panel to ensure your image meets the required dimensions.' },
                { q: 'How do I check my image size on mobile?', a: 'Once you compress the image using our tool, the output size is clearly displayed next to a green checkmark. When you download it, that exact size is what will be saved to your mobile device.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors select-none">
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
              <a href="/tools/image-compressor" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">General Compressor</a>
              <a href="/tools/image-compressor/compress-image-for-whatsapp" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">WhatsApp Optimizer</a>
              <a href="/tools/image-compressor/bulk-image-compressor-online" className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Bulk Compressor</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
