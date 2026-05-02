'use client';

import { useState, useRef, useCallback } from 'react';
import { Minimize2, Upload, Download, X, Settings, Layers, Zap, FolderArchive } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Per-file compression ───────────────────────────────────────────── */
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
        const tryBlob = (mime, q) => new Promise((res) => canvas.toBlob(res, mime, q));

        let blob = null;
        let q = quality / 100;
        const minQ = 0.05;
        const step = 0.05;
        const isPNG = fileItem.file.type === 'image/png';
        const mime = isPNG ? 'image/jpeg' : 'image/jpeg';

        while (q >= minQ) {
          blob = await tryBlob(mime, q);
          if (blob && blob.size < origSize) break;
          q = Math.round((q - step) * 100) / 100;
        }

        if (!blob || blob.size >= origSize) {
          blob = await tryBlob('image/png', undefined);
        }

        if (!blob) {
          resolve({ ...fileItem, status: 'error', error: 'Compression failed' });
          return;
        }

        if (blob.size >= origSize) {
          const origBlob = new Blob([fileItem.file], { type: fileItem.file.type });
          resolve({
            ...fileItem, status: 'done', compBlob: origBlob, compSize: origSize,
            compUrl: URL.createObjectURL(origBlob), outW: width, outH: height, noGain: true,
          });
          return;
        }

        resolve({
          ...fileItem, status: 'done', compBlob: blob, compSize: blob.size,
          compUrl: URL.createObjectURL(blob), outW: width, outH: height, noGain: false,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileItem.file);
  });
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function BulkCompressor() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [maxW, setMaxW] = useState('');
  const [maxH, setMaxH] = useState('');
  const [processing, setProc] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = useRef(null);

  const PRESETS = [
    { label: 'Max Savings', q: 60, desc: 'For heavy archives', color: 'text-orange-500' },
    { label: 'Balanced', q: 80, desc: 'Recommended', color: 'text-blue-500' },
    { label: 'High Quality', q: 90, desc: 'For photography', color: 'text-cyan-600' },
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
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + `_bulk.${ext}`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.compBlob), download: name }).click();
  };

  const downloadAll = () => {
    const doneFiles = files.filter(f => f.status === 'done' && f.compBlob);
    doneFiles.forEach((fi, i) => {
      setTimeout(() => downloadOne(fi), i * 300); // Stagger downloads slightly to prevent browser blocking
    });
  };

  const readyCount = files.filter(f => f.status === 'ready').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[
          { name: 'Image Compressor', href: '/tools/image-compressor' },
          { name: 'Bulk Compressor', href: '/tools/image-compressor/bulk-image-compressor-online' }
        ]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <Layers className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Bulk Image Compressor</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Process hundreds of photos instantly. Save hours of manual work with multi-threaded browser compression.</p>
        </div>

        {/* Drop zone on top for bulk */}
        <div className={`${cardCls} overflow-hidden mb-6 border-blue-200 dark:border-blue-900`}>
          <div
            onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
            onDragLeave={() => setFileDrag(false)}
            onDrop={e => { e.preventDefault(); setFileDrag(false); addFiles(e.dataTransfer.files); }}
            onClick={() => fileRef.current?.click()}
            className={`p-12 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-md shadow-blue-500/20">
              <FolderArchive className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{fileDrag ? 'Drop folder/images here!' : 'Select up to 500 Images'}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Drag & drop an entire folder or click to browse.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Multi-threaded', 'Unlimited Data', '100% Private'].map(f => (
                <span key={f} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg">{f}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-blue-500" />Global Batch Settings
              </h2>

              {/* Quality presets */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Preset Level</p>
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => setQuality(p.q)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${quality === p.q ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    <div>{p.label}</div>
                    <div className="text-[10px] font-normal mt-0.5 opacity-70">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Quality slider */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quality (Applies to all)</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{quality}%</span>
                </div>
                <input type="range" min={10} max={100} step={1} value={quality} onChange={e => setQuality(+e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500" />
              </div>

              {/* Max dimensions */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Max Dimensions <span className="font-normal opacity-70">(optional)</span></p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[{ label: 'Max Width', val: maxW, set: setMaxW, ph: '1920' }, { label: 'Max Height', val: maxH, set: setMaxH, ph: '1080' }].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
                    <input type="number" min={1} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-500 transition placeholder-slate-400" />
                  </div>
                ))}
              </div>

              <button onClick={compressAll} disabled={processing || readyCount === 0}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                {processing ? 'Compressing Batch…' : `Start Bulk Compression`}
              </button>

              {files.length > 0 && (
                <button onClick={clearAll} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5" />Clear Queue
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
                <div className={`${cardCls} p-5 bg-blue-50/50 dark:bg-blue-900/10`}>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Batch Results</h3>
                  {[
                    { label: 'Files completed', val: `${doneCount}/${files.length}`, color: 'text-slate-900 dark:text-white' },
                    { label: 'Original total', val: fmtSize(origTotal), color: 'text-slate-900 dark:text-white' },
                    { label: 'Compressed total', val: fmtSize(compTotal), color: 'text-slate-900 dark:text-white' },
                    { label: 'Space saved', val: `${saved.toFixed(1)}%`, color: 'text-blue-600 dark:text-blue-400 font-bold' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex justify-between py-1.5 text-xs border-b border-slate-200 dark:border-slate-700/50 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className={color}>{val}</span>
                    </div>
                  ))}
                  
                  <button onClick={downloadAll} className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" /> Download All
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Right panel (List view) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Files list */}
            {files.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Queue ({files.length})
                  </h3>
                  {processing && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${(doneCount / files.length) * 100}%` }} />
                      </div>
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{Math.round((doneCount / files.length) * 100)}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map(fi => {
                    const saved = fi.status === 'done' && fi.file.size > 0
                      ? ((fi.file.size - fi.compSize) / fi.file.size * 100)
                      : 0;
                    return (
                      <div key={fi.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-lg">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-[250px]">{fi.file.name}</p>
                          <div className="hidden sm:flex flex-wrap gap-2 text-[10px] font-medium">
                            {fi.status === 'done' && (
                              <span className="text-blue-600 dark:text-blue-400">{fmtSize(fi.file.size)} → {fmtSize(fi.compSize)}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                           {fi.status === 'ready' && <span className="text-[10px] text-slate-400 font-bold px-2">Ready</span>}
                           {fi.status === 'processing' && <span className="text-[10px] text-blue-500 font-bold px-2 animate-pulse">Processing…</span>}
                           {fi.status === 'done' && (
                             <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded font-bold">-{saved.toFixed(1)}%</span>
                           )}
                           {fi.status === 'error' && <span className="text-[10px] text-red-500 font-bold px-2">Error</span>}
                          
                          <button onClick={() => removeFile(fi.id)} className="p-1 text-slate-400 hover:text-red-500 rounded transition">
                            <X className="w-3 h-3" />
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
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">The Fastest Way to Batch Compress Images Online</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                If you manage an e-commerce store, a photography portfolio, or a high-traffic blog, you know the pain of optimizing images one by one. Taking 200 high-resolution JPEGs and manually crushing their file sizes using Photoshop or single-file online tools can consume hours of your valuable time.
              </p>
              <p>
                The <strong>OmniWebKit Bulk Image Compressor</strong> is designed specifically for power users. You can drag and drop an entire folder of up to 500 images at once. The system applies your global compression rules (quality and max dimensions) to every single file in the queue simultaneously. 
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Desktop Software vs Online Bulk Compressors</h3>
              <p>
                Historically, batch compressing images required bulky, expensive software like Adobe Lightroom or obscure desktop utilities. Those apps are heavy, require installation, and often lock you into subscriptions. Our tool uses your browser's native JavaScript engine (via HTML5 Canvas) to process files concurrently. It utilizes your local CPU cores, meaning a modern laptop can crush 100 images in just seconds—all without ever uploading a single megabyte to an external server.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is there a limit to how many images I can batch compress?', a: 'You can select up to 500 images at a time. The only practical limit is your computer\'s RAM, as all processing is done locally in your browser.' },
                { q: 'Will my browser crash if I upload 1000 photos?', a: 'If you attempt to process thousands of 20MB RAW files simultaneously, it might freeze the browser tab. We recommend breaking massive jobs into batches of 200-500 images for the smoothest experience.' },
                { q: 'Can I convert all my bulk PNGs to WebP?', a: 'This tool currently focuses on reducing file sizes and defaults to JPEG for high-compression output. If you strictly need WebP format conversion, use our "Web Vitals Compressor" tool.' },
                { q: 'Do you store my images on your servers?', a: 'No! Everything is processed 100% locally on your machine. Your private photos never leave your device, ensuring maximum security and zero upload wait times.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors select-none">
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
              <a href="/tools/image-compressor" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">General Compressor</a>
              <a href="/tools/image-compressor/compress-image-to-50kb" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Compress to 50KB</a>
              <a href="/tools/image-compressor/compress-image-for-website-fast" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Web Vitals Compressor</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
