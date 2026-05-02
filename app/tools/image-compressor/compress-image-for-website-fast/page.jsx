'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Download, X, Settings, Zap, Globe, FileCode2 } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Per-file WebP conversion ────────────────────────────────────────── */
async function processFile(fileItem, quality, maxW, maxH, toWebP) {
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
        
        // Output format logic for web
        const isPNG = fileItem.file.type === 'image/png';
        let mime = toWebP ? 'image/webp' : (isPNG ? 'image/png' : 'image/jpeg');
        // WebP supports transparency, so it's a great replacement for both JPEG and PNG.
        
        // If they want lossless PNG (when not forcing WebP)
        if (mime === 'image/png') {
            blob = await tryBlob('image/png', undefined);
        } else {
            // Progressive compression for lossy formats
            while (q >= minQ) {
              blob = await tryBlob(mime, q);
              if (blob && blob.size < origSize) break;
              q = Math.round((q - step) * 100) / 100;
            }
        }

        if (!blob || blob.size >= origSize) {
           // Fallback to original if we somehow couldn't compress (rare)
           const origBlob = new Blob([fileItem.file], { type: fileItem.file.type });
           resolve({
             ...fileItem, status: 'done', compBlob: origBlob, compSize: origSize,
             compUrl: URL.createObjectURL(origBlob), outW: width, outH: height, noGain: true,
             ext: fileItem.file.type === 'image/png' ? 'png' : 'jpg'
           });
           return;
        }

        resolve({
          ...fileItem, status: 'done', compBlob: blob, compSize: blob.size,
          compUrl: URL.createObjectURL(blob), outW: width, outH: height, noGain: false,
          ext: toWebP ? 'webp' : (mime === 'image/png' ? 'png' : 'jpg')
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(fileItem.file);
  });
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function WebVitalsCompressor() {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(75);
  const [maxW, setMaxW] = useState('');
  const [maxH, setMaxH] = useState('');
  const [toWebP, setToWebP] = useState(true);
  const [processing, setProc] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = useRef(null);

  const PRESETS = [
    { label: 'Aggressive', q: 60, desc: 'LCP Boost', color: 'text-rose-500' },
    { label: 'Web Optimized', q: 75, desc: 'PageSpeed Target', color: 'text-indigo-500' },
    { label: 'Retina Ready', q: 90, desc: 'For hero sections', color: 'text-purple-600' },
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
      ready.map(fi => processFile(fi, quality, maxW ? +maxW : null, maxH ? +maxH : null, toWebP))
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
    const ext = fi.ext || 'jpg';
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + `_opt.${ext}`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.compBlob), download: name }).click();
  };

  const readyCount = files.filter(f => f.status === 'ready').length;
  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[
          { name: 'Image Compressor', href: '/tools/image-compressor' },
          { name: 'Web Vitals Optimizer', href: '/tools/image-compressor/compress-image-for-website-fast' }
        ]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <Globe className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Supercharge Your Website Speed</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Ace your Google PageSpeed Insights. Convert and compress images to Next-Gen formats.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />Build Settings
              </h2>

              {/* Format Toggle */}
              <div className="mb-6 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl">
                <label className="flex items-center justify-between cursor-pointer">
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Next-Gen WebP</span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400">Convert JPG/PNG to WebP</span>
                   </div>
                   <div className="relative">
                      <input type="checkbox" checked={toWebP} onChange={(e) => setToWebP(e.target.checked)} className="sr-only" />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${toWebP ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${toWebP ? 'transform translate-x-4' : ''}`}></div>
                   </div>
                </label>
              </div>

              {/* Quality presets */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Compression Tier</p>
              <div className="grid grid-cols-3 gap-1.5 mb-4">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => setQuality(p.q)}
                    className={`py-2 px-1 rounded-xl border text-xs font-bold transition-all ${quality === p.q ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div>{p.label}</div>
                    <div className="text-[10px] font-normal mt-0.5 opacity-70">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Quality slider */}
              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Payload Quality</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{quality}%</span>
                </div>
                <input type="range" min={10} max={100} step={1} value={quality} onChange={e => setQuality(+e.target.value)}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500" />
              </div>

              {/* Max dimensions */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Viewport Bounds <span className="font-normal opacity-70">(px)</span></p>
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[{ label: 'Max Width', val: maxW, set: setMaxW, ph: '1200' }, { label: 'Max Height', val: maxH, set: setMaxH, ph: 'Auto' }].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase">{label}</label>
                    <input type="number" min={1} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs font-mono border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-indigo-500 transition placeholder-slate-400/50" />
                  </div>
                ))}
              </div>

              <button onClick={compressAll} disabled={processing || readyCount === 0}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                {processing ? 'Building Assets…' : `Generate Web Assets`}
              </button>

              {files.length > 0 && (
                <button onClick={clearAll} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5" />Clear workspace
                </button>
              )}
            </div>

            {/* Simulated PageSpeed Insights */}
            {doneCount > 0 && (() => {
              const done = files.filter(f => f.status === 'done');
              const origTotal = done.reduce((s, f) => s + f.file.size, 0);
              const compTotal = done.reduce((s, f) => s + f.compSize, 0);
              const savedPercent = origTotal > 0 ? ((origTotal - compTotal) / origTotal * 100) : 0;
              
              // Pseudo-logic to show a "PageSpeed" boost
              const baseScore = 65;
              const boost = Math.round(savedPercent * 0.3); // up to +30 points
              const finalScore = Math.min(baseScore + boost, 99);
              
              const isGreen = finalScore >= 90;
              const circleColor = isGreen ? 'text-emerald-500' : 'text-orange-500';

              return (
                <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5`}>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center justify-between">
                    <span>Performance Impact</span>
                    <span className="text-[10px] text-slate-400">Simulated</span>
                  </h3>
                  
                  <div className="flex items-center gap-4 mb-4 bg-slate-50 dark:bg-[#0B1120] p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                     <div className={`relative flex items-center justify-center w-14 h-14 ${circleColor}`}>
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                           <path className="text-slate-200 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                           <path className="transition-all duration-1000 ease-out" strokeDasharray={`${finalScore}, 100`} strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute text-sm font-bold">{finalScore}</span>
                     </div>
                     <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Est. PageSpeed Score</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+{boost} points vs original</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Bandwidth Saved</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fmtSize(origTotal - compTotal)}</span>
                    </div>
                    <div className="flex justify-between py-1 text-xs border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">LCP Improvement</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">~{(savedPercent * 0.015).toFixed(1)}s faster</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Drop zone */}
            <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden`}>
              <div
                onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                onDragLeave={() => setFileDrag(false)}
                onDrop={e => { e.preventDefault(); setFileDrag(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-3 shadow-md shadow-indigo-500/20">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop assets here!' : 'Upload Static Assets'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-mono text-xs">hero-banner.png, logo.jpg, background.webp</p>
              </div>
            </div>

            {/* Files list */}
            {files.length > 0 && (
              <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-5`}>
                <div className="space-y-3">
                  {files.map(fi => {
                    const saved = fi.status === 'done' && fi.file.size > 0
                      ? ((fi.file.size - fi.compSize) / fi.file.size * 100)
                      : 0;
                    return (
                      <div key={fi.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/80 rounded-xl font-mono">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0 flex gap-2">
                          <img src={fi.preview} alt={fi.file.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" title="Original" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">{fi.file.name} <span className="text-slate-400 font-normal">→</span> {fi.status === 'done' ? `optimized.${fi.ext}` : ''}</p>
                          <div className="flex flex-wrap gap-2 text-[10px] font-medium items-center">
                            <span className="text-slate-500 dark:text-slate-400">[{fmtSize(fi.file.size)}]</span>
                            {fi.status === 'done' && (
                              <>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">[{fmtSize(fi.compSize)}]</span>
                                {!fi.noGain && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-md">-{saved.toFixed(1)}%</span>
                                )}
                              </>
                            )}
                            {fi.status === 'processing' && <span className="text-indigo-600 dark:text-indigo-400 animate-pulse">building...</span>}
                            {fi.status === 'error' && <span className="text-red-600 dark:text-red-400">err: {fi.error}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {fi.status === 'done' && (
                            <button onClick={() => downloadOne(fi)} title="Download ready image"
                              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => removeFile(fi.id)} title="Remove"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
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
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 lg:p-12`}>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">How Image Compression Improves Core Web Vitals</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              <p>
                Google uses Core Web Vitals to measure the user experience of a web page. One of the most critical metrics is <strong>Largest Contentful Paint (LCP)</strong>, which measures how long it takes for the largest visual element (usually a hero image or banner) to render on the screen.
              </p>
              <p>
                If your homepage features an unoptimized 3MB PNG, your LCP will be heavily penalized on mobile networks. By running your static assets through our Web Vitals Compressor, you can instantly reduce that footprint to a 200KB WebP file. This drastically lowers bandwidth consumption, improves TTFB (Time to First Byte), and boosts your LCP score into the "Good" (green) threshold.
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">WebP vs JPG: Which is Best for Websites?</h3>
              <p>
                Next-Gen formats like WebP (and AVIF) offer superior compression and quality characteristics compared to their older JPEG and PNG counterparts. WebP supports transparency (like PNG) and lossy compression (like JPEG), making it the ultimate universal format for modern web development. Using our converter, you can modernize your entire media library in minutes.
              </p>
            </div>
          </div>

          {/* FAQs */}
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'What is WebP and does my website support it?', a: 'WebP is an image format developed by Google that provides superior lossless and lossy compression. Today, over 97% of all web browsers globally support WebP natively. WordPress, Shopify, and modern frameworks like Next.js all support WebP images out of the box.' },
                { q: 'How much faster will my site load after compression?', a: 'It depends on your current setup. If your site currently serves 10MB of unoptimized images, compressing them to 1MB total can reduce page load times by 3-5 seconds on mobile 4G networks.' },
                { q: 'How to Fix "Serve Images in Next-Gen Formats" in PageSpeed Insights?', a: 'Google PageSpeed Insights flags sites that still use heavy JPEGs and PNGs. To fix this error, simply drag your flagged images into our tool, ensure the "Next-Gen WebP" toggle is active, and replace your old images with the generated WebP files.' },
                { q: 'Does compressing images affect my image SEO?', a: 'Positively! Search engines prioritize fast-loading pages. As long as you retain your alt text and descriptive file names when you re-upload the compressed images, your Image SEO will actually improve due to faster crawl and render times.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-[#0B1120]">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors select-none">
                    <span className="text-base pr-4">{q}</span>
                    <span className="text-slate-400 text-2xl group-open:rotate-45 transition-transform flex-shrink-0 leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-200 dark:border-slate-800/50">{a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Internal Linking */}
          <div className="mt-8 text-center bg-indigo-50/50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Explore the Optimization Suite</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">Fine-tune your images for other platforms:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/tools/image-compressor" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">General Compressor</a>
              <a href="/tools/image-compressor/bulk-image-compressor-online" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Bulk Batch Processing</a>
              <a href="/tools/image-compressor/compress-image-to-50kb" className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Target 50KB Limiter</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
