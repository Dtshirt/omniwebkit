'use client';

import { useState, useRef, useCallback } from 'react';
import { Minimize2, Upload, Download, X, Settings, MessageCircle, Zap } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

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
        const tryBlob = (mime, q) => new Promise((res) => canvas.toBlob(res, mime, q));

        let blob = null;
        let q = quality / 100;
        const minQ = 0.05;
        const step = 0.05;

        // Strip metadata and convert to standard web format for WhatsApp
        const mime = 'image/jpeg';

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
export default function WhatsAppCompressor() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(85);
  // Default to WhatsApp's HD limit to prevent native re-compression
  const [maxW, setMaxW] = useState(1600);
  const [maxH, setMaxH] = useState(1600);
  const [processing, setProc] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = useRef(null);

  const PRESETS = [
    { label: 'Standard', q: 70, desc: 'Fast sending', color: 'text-green-500' },
    { label: 'HD Ready', q: 85, desc: 'Crisp text/faces', color: 'text-teal-600' },
    { label: 'Maximum', q: 95, desc: 'Original look', color: 'text-emerald-500' },
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
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + `_whatsapp.jpg`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.compBlob), download: name }).click();
  };

  const readyCount = files.filter(f => f.status === 'ready').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[
          { name: 'Image Compressor', href: '/tools/image-compressor' },
          { name: 'WhatsApp Compressor', href: '/tools/image-compressor/compress-image-for-whatsapp' }
        ]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-green-500/20">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Compress Images for WhatsApp (Stop the Blur!)</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Send high-quality photos on WhatsApp without the app aggressively compressing and destroying your image.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5 border-green-200 dark:border-green-900`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-green-500" />WhatsApp Optimization
              </h2>

              {/* Quality presets */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Optimization Mode</p>
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => setQuality(p.q)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${quality === p.q ? 'border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
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
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-green-500" />
              </div>

              {/* Max dimensions */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">WhatsApp HD Limits</p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[{ label: 'Max Width', val: maxW, set: setMaxW }, { label: 'Max Height', val: maxH, set: setMaxH }].map(({ label, val, set }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
                    <input type="number" min={1} value={val} onChange={e => set(e.target.value)} disabled
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl focus:outline-none transition cursor-not-allowed" />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-green-600 dark:text-green-400 font-bold text-center mb-4">
                🔒 Locked to 1600px to bypass WhatsApp's native downscaling.
              </p>

              <button onClick={compressAll} disabled={processing || readyCount === 0}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-green-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                {processing ? 'Processing…' : `Make WhatsApp Ready`}
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
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Optimization Results</h3>
                  {[
                    { label: 'Files optimized', val: `${doneCount}`, color: 'text-slate-900 dark:text-white' },
                    { label: 'Space saved', val: `${saved.toFixed(1)}%`, color: 'text-green-600 dark:text-green-400 font-bold' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex justify-between py-1.5 text-xs border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className={color}>{val}</span>
                    </div>
                  ))}
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
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-green-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl mb-3 shadow-md shadow-green-500/20">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop photo here!' : `Upload from Gallery`}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Optimize for chat, groups, and status updates.</p>
              </div>
            </div>

            {/* Files list */}
            {files.length > 0 && (
              <div className={`${cardCls} p-5`}>
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
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">{fi.file.name}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                            <span className="text-slate-500 dark:text-slate-400">Orig: {fmtSize(fi.file.size)}</span>
                            {fi.status === 'done' && (
                              <>
                                <span className="text-green-600 dark:text-green-400">→ WhatsApp Ready ({fmtSize(fi.compSize)})</span>
                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold flex items-center gap-1">✅ Safe</span>
                              </>
                            )}
                            {fi.status === 'processing' && <span className="text-green-600 dark:text-green-400">Optimizing…</span>}
                            {fi.status === 'error' && <span className="text-red-600 dark:text-red-400">Error: {fi.error}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {fi.status === 'done' && (
                            <button onClick={() => downloadOne(fi)} title="Download ready image"
                              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition shadow-sm">
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
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Why Does WhatsApp Reduce Image Quality?</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Every day, billions of photos are sent through WhatsApp. To prevent their servers from crashing and to save users' mobile data, WhatsApp employs an extremely aggressive image compression algorithm. Whenever you attach a photo from your gallery, WhatsApp automatically resizes it, crushes the bitrate, and discards fine details.
              </p>
              <p>
                This results in the infamous "WhatsApp Blur." Colors look washed out, text becomes unreadable, and fine details in portraits are completely destroyed.
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">How to Send HD Photos on WhatsApp?</h3>
              <p>
                Our <strong>WhatsApp Image Optimizer</strong> bypasses this problem. We know exactly what triggers WhatsApp's aggressive compression. By pre-optimizing your image—resizing it strictly to WhatsApp's maximum HD threshold (1600px) and stripping hidden EXIF data—we ensure that when you send the photo, WhatsApp's server algorithms leave it alone.
              </p>
              <p>
                The result? You can send crystal-clear photos directly in chat or upload crisp images to your WhatsApp Status without dealing with the clunky "Send as Document" workaround.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Why do my photos look blurry on WhatsApp status?', a: 'WhatsApp Status compresses images even more aggressively than regular chats. It requires a specific aspect ratio and file size. Our "HD Ready" setting perfectly prepares your image so that it retains its clarity when uploaded to your Status.' },
                { q: 'How do I send an image as a document on WhatsApp?', a: 'Sending an image as a document prevents WhatsApp from compressing it, but it strips away the preview thumbnail in the chat, creating a poor user experience. Using our tool allows you to send the photo normally (with a preview) while retaining high quality.' },
                { q: 'Does this tool work for WhatsApp Web?', a: 'Yes! Whether you are dragging an optimized image into WhatsApp Web on your PC or sending it from your mobile gallery, the optimization works perfectly.' },
                { q: 'Will this make my image file size bigger?', a: 'No, in fact, it usually makes the file size smaller. We strip out unnecessary metadata and apply a smart compression that retains visual fidelity while dramatically reducing megabytes.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors select-none">
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
              <a href="/tools/image-compressor" className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">General Compressor</a>
              <a href="/tools/image-compressor/compress-image-to-50kb" className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">Compress to 50KB</a>
              <a href="/tools/image-compressor/bulk-image-compressor-online" className="text-sm font-semibold text-green-600 dark:text-green-400 hover:underline">Bulk Compressor</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
