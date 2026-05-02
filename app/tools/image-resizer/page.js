'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload, Download, ImageIcon, Settings, X,
  RotateCw, Lock, Unlock, Zap, CheckCircle, AlertCircle, Archive
} from 'lucide-react';
import JSZip from 'jszip';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b && b !== 0) return '–';
  if (b === 0) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Browser-native resize via Canvas API ─────────────────────────────── */
async function resizeImageBrowser(file, targetW, targetH, maintainRatio, outputFormat, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let w = targetW || img.naturalWidth;
        let h = targetH || img.naturalHeight;

        if (maintainRatio) {
          const aspect = img.naturalWidth / img.naturalHeight;
          if (targetW && !targetH) h = Math.round(targetW / aspect);
          else if (targetH && !targetW) w = Math.round(targetH * aspect);
          else if (targetW && targetH) {
            // Fit within both dimensions
            const scaleW = targetW / img.naturalWidth;
            const scaleH = targetH / img.naturalHeight;
            const scale = Math.min(scaleW, scaleH);
            w = Math.round(img.naturalWidth * scale);
            h = Math.round(img.naturalHeight * scale);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // White bg for JPEG/BMP
        if (outputFormat === 'jpeg' || outputFormat === 'bmp') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);

        const mime = `image/${outputFormat}`;
        const q = (outputFormat === 'jpeg' || outputFormat === 'webp') ? quality / 100 : undefined;
        canvas.toBlob((blob) => {
          if (!blob) { reject(new Error('Resize failed')); return; }
          resolve({ blob, w, h });
        }, mime, q);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* ─── Get image natural dimensions ─────────────────────────────────────── */
function getImageDims(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
    img.onerror = () => { resolve({ w: null, h: null }); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

/* ─── Presets ────────────────────────────────────────────────────────────── */
const PRESETS = [
  { label: 'HD', w: 1280, h: 720 },
  { label: 'Full HD', w: 1920, h: 1080 },
  { label: '4K', w: 3840, h: 2160 },
  { label: 'Square 1K', w: 1000, h: 1000 },
  { label: 'Social Post', w: 1080, h: 1080 },
  { label: 'Twitter/X', w: 1200, h: 675 },
  { label: 'FB Cover', w: 820, h: 312 },
  { label: 'Thumbnail', w: 480, h: 360 },
];

const FORMATS = ['jpeg', 'png', 'webp'];
const FORMAT_LABELS = { jpeg: 'JPEG', png: 'PNG', webp: 'WebP' };

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function ImageResizer() {
  const [files, setFiles] = useState([]);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [maintainRatio, setRatio] = useState(true);
  const [outputFormat, setFormat] = useState('jpeg');
  const [quality, setQuality] = useState(90);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  /* ── Add files ── */
  const addFiles = useCallback(async (incoming) => {
    const images = [...incoming].filter(f => f.type.startsWith('image/'));
    if (!images.length) return;
    const items = await Promise.all(images.map(async (file) => {
      const dims = await getImageDims(file);
      return {
        id: Math.random().toString(36).slice(2),
        file,
        preview: URL.createObjectURL(file),
        origW: dims.w, origH: dims.h,
        status: 'ready',
        blob: null, outW: null, outH: null, outSize: null,
      };
    }));
    setFiles(p => [...p, ...items]);
  }, []);

  const removeFile = (id) => setFiles(p => p.filter(f => f.id !== id));
  const clearAll = () => setFiles([]);

  /* ── Apply preset ── */
  const applyPreset = (p) => {
    setWidth(String(p.w));
    setHeight(String(p.h));
    setRatio(false); // presets are exact
  };

  /* ── Resize all ── */
  const resizeAll = async () => {
    setError('');
    if (!width && !height) { setError('Please enter a width or height value.'); return; }
    const pending = files.filter(f => f.status === 'ready' || f.status === 'done');
    if (!pending.length) return;

    setProcessing(true);
    setFiles(p => p.map(f => ({ ...f, status: 'resizing' })));

    const results = await Promise.allSettled(
      pending.map(async (fi) => {
        const { blob, w, h } = await resizeImageBrowser(
          fi.file,
          width ? +width : null,
          height ? +height : null,
          maintainRatio,
          outputFormat,
          quality
        );
        return { id: fi.id, blob, outW: w, outH: h, outSize: blob.size };
      })
    );

    setFiles(p => {
      const map = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') map[r.value.id] = r.value;
      });
      return p.map(f => map[f.id]
        ? { ...f, ...map[f.id], status: 'done', outUrl: URL.createObjectURL(map[f.id].blob) }
        : { ...f, status: 'error' }
      );
    });
    setProcessing(false);
  };

  /* ── Download single ── */
  const downloadOne = (fi) => {
    if (!fi.blob) return;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + `.${ext}`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.blob), download: name }).click();
  };

  /* ── Download all as ZIP ── */
  const downloadAllZip = async () => {
    const doneFiles = files.filter(f => f.status === 'done' && f.blob);
    if (doneFiles.length === 0) return;
    setZipping(true);
    try {
      const zip = new JSZip();
      const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
      const usedNames = new Set();
      doneFiles.forEach(fi => {
        let baseName = fi.file.name.replace(/\.[^/.]+$/, '') + `.${ext}`;
        let name = baseName;
        let counter = 1;
        while (usedNames.has(name)) {
          name = fi.file.name.replace(/\.[^/.]+$/, '') + `${counter}.${ext}`;
          counter++;
        }
        usedNames.add(name);
        zip.file(name, fi.blob);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      Object.assign(document.createElement('a'), { href: url, download: `resized_images_${doneFiles.length}.zip` }).click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP creation failed:', err);
    } finally {
      setZipping(false);
    }
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const readyCount = files.filter(f => f.status === 'ready').length;
  const needQuality = outputFormat === 'jpeg' || outputFormat === 'webp';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Resizer', href: '/tools/image-resizer' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-rose-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Image Resizer</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Resize images to exact dimensions — free, instant, browser-based, no upload to server</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-rose-500" />Resize Settings
              </h2>

              {/* Error */}
              {error && (
                <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold">
                  {error}
                </div>
              )}

              {/* Dimensions */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Target Dimensions (px)</p>
              <div className="grid grid-cols-2 gap-2 mb-1">
                {[
                  { label: 'Width', val: width, set: setWidth, ph: 'e.g. 1920' },
                  { label: 'Height', val: height, set: setHeight, ph: 'e.g. 1080' },
                ].map(({ label, val, set, ph }) => (
                  <div key={label}>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
                    <input type="number" min={1} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                      className="w-full mt-1 px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-rose-500 transition placeholder-slate-400" />
                  </div>
                ))}
              </div>

              {/* Aspect ratio lock */}
              <button onClick={() => setRatio(r => !r)}
                className={`flex items-center gap-1.5 text-xs font-semibold mb-4 py-1.5 px-3 rounded-xl border transition-all ${maintainRatio ? 'border-rose-400 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}>
                {maintainRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                {maintainRatio ? 'Aspect ratio locked' : 'Aspect ratio free'}
              </button>

              {/* Presets */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Common Presets</p>
              <div className="grid grid-cols-2 gap-1.5 mb-4">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    className="py-1.5 px-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition text-left">
                    <div>{p.label}</div>
                    <div className="font-normal opacity-70">{p.w}×{p.h}</div>
                  </button>
                ))}
              </div>

              {/* Output format */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Output Format</p>
              <div className="flex gap-1.5 mb-4">
                {FORMATS.map(fmt => (
                  <button key={fmt} onClick={() => setFormat(fmt)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${outputFormat === fmt ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'}`}>
                    {FORMAT_LABELS[fmt]}
                  </button>
                ))}
              </div>

              {/* Quality */}
              {needQuality && (
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quality</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{quality}%</span>
                  </div>
                  <input type="range" min={10} max={100} step={1} value={quality} onChange={e => setQuality(+e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-rose-500" />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Smaller file</span><span>Best quality</span>
                  </div>
                </div>
              )}

              {/* Resize button */}
              <button onClick={resizeAll} disabled={processing || files.length === 0}
                className="w-full py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-rose-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                {processing ? 'Resizing…' : `Resize ${files.length > 0 ? files.length : ''} Image${files.length !== 1 ? 's' : ''}`}
              </button>

              {files.length > 0 && (
                <button onClick={clearAll} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5" />Clear all images
                </button>
              )}
            </div>

            {/* Stats */}
            {doneCount > 0 && (() => {
              const done = files.filter(f => f.status === 'done');
              const origTotal = done.reduce((s, f) => s + f.file.size, 0);
              const outTotal = done.reduce((s, f) => s + (f.outSize || 0), 0);
              const diff = origTotal - outTotal;
              return (
                <div className={`${cardCls} p-5`}>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Resize Results</h3>
                  {[
                    { label: 'Files resized', val: `${doneCount}` },
                    { label: 'Original total', val: fmtSize(origTotal) },
                    { label: 'Output total', val: fmtSize(outTotal) },
                    { label: diff > 0 ? 'Size saved' : 'Size increase', val: diff > 0 ? `-${fmtSize(diff)}` : `+${fmtSize(-diff)}`, green: diff > 0 },
                  ].map(({ label, val, green }) => (
                    <div key={label} className="flex justify-between py-1.5 text-xs border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className={`font-semibold ${green ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{val}</span>
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
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-rose-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl mb-3 shadow-md shadow-rose-500/20">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop images here!' : 'Upload Images to Resize'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse • Multiple files supported</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['JPG', 'PNG', 'WebP', 'GIF', 'BMP', 'TIFF'].map(f => (
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
                    <ImageIcon className="w-4 h-4 text-rose-500" />Images ({files.length})
                  </h3>
                  <div className="flex items-center gap-2">
                    {doneCount > 0 && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{doneCount} resized</span>
                    )}
                    {doneCount >= 2 && (
                      <button onClick={downloadAllZip} disabled={zipping}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-400 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:cursor-not-allowed">
                        {zipping ? <RotateCw className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                        {zipping ? 'Creating ZIP…' : `Download All as ZIP`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {files.map(fi => (
                    <div key={fi.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                      {/* Thumbnail */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <img src={fi.preview} alt={fi.file.name} className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700" title="Original" />
                        {fi.status === 'done' && fi.outUrl && (
                          <img src={fi.outUrl} alt="Resized" className="w-14 h-14 object-cover rounded-lg border border-rose-300 dark:border-rose-700" title="Resized" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">{fi.file.name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-medium">
                          <span className="text-slate-500 dark:text-slate-400">
                            {fi.origW && fi.origH ? `${fi.origW}×${fi.origH}` : '?'} · {fmtSize(fi.file.size)}
                          </span>
                          {fi.status === 'done' && fi.outW && (
                            <>
                              <span className="text-rose-600 dark:text-rose-400">→ {fi.outW}×{fi.outH} · {fmtSize(fi.outSize)}</span>
                              {fi.outSize < fi.file.size && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">
                                  {(((fi.file.size - fi.outSize) / fi.file.size) * 100).toFixed(1)}% smaller
                                </span>
                              )}
                            </>
                          )}
                          {fi.status === 'resizing' && <span className="text-rose-600 dark:text-rose-400">Resizing…</span>}
                          {fi.status === 'error' && <span className="text-red-600 dark:text-red-400">Failed</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {fi.status === 'done' && fi.blob && (
                          <button onClick={() => downloadOne(fi)} title="Download resized image"
                            className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-sm">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {fi.status === 'resizing' && <RotateCw className="w-4 h-4 text-rose-500 animate-spin" />}
                        {fi.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        {fi.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                        <button onClick={() => removeFile(fi.id)} disabled={fi.status === 'resizing'}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition disabled:opacity-40">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SEO Content ────────────────────────────────────────────────────── */}
        <div className="mt-12 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Image Resizer — Resize Images to Exact Pixel Dimensions Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every platform has a different image size requirement. Twitter wants 1200×675 pixels for a link card. Instagram requires 1080×1080 for a square post. YouTube thumbnails need to be 1280×720. A favicon must be 32×32 pixels. If you upload the wrong size, you get stretched images, cropped edges, blurry thumbnails, or outright upload rejections.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free online image resizer lets you set an exact width, height, or both — and outputs the resized file in your chosen format (JPEG, PNG, or WebP) in seconds. Everything runs in your browser. Your images never leave your device. There is no file size limit beyond your browser's available memory, and no watermarks are added.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Upload multiple images at once by dragging and dropping them onto the tool. All files are resized to the same dimensions in parallel. Each file shows the original and resized pixel dimensions, original and output file sizes, and a percentage reduction badge where applicable. Download each resized file individually with one click.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Standard Image Sizes for Every Platform</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Not sure what size to use? The built-in presets cover the most common platform specifications. Here is a detailed breakdown of the recommended image dimensions for every major platform in 2025:
            </p>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/50">
                    {['Platform / Use Case', 'Recommended Size', 'Notes'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Instagram Post (Square)', '1080 × 1080 px', 'Use PNG or JPEG at 85%+ quality'],
                    ['Instagram Story / Reel', '1080 × 1920 px', '9:16 aspect ratio'],
                    ['Twitter/X Post Image', '1200 × 675 px', '16:9 ratio for link cards'],
                    ['Twitter/X Profile Photo', '400 × 400 px', 'Displayed at smaller sizes'],
                    ['Facebook Cover Photo', '820 × 312 px', 'Full width desktop banner'],
                    ['Facebook Post Image', '1200 × 630 px', 'Optimal for link shares'],
                    ['LinkedIn Profile Banner', '1584 × 396 px', '4:1 aspect ratio'],
                    ['YouTube Thumbnail', '1280 × 720 px', 'Min 640×360; use 16:9'],
                    ['YouTube Channel Art', '2560 × 1440 px', 'Safe area: 1546×423 px'],
                    ['Website Hero Image', '1920 × 1080 px', 'Keep file under 200 KB (WebP recommended)'],
                    ['Blog Post Image', '1200 × 630 px', 'Doubles as Open Graph image for sharing'],
                    ['Email Header', '600 × 200 px', 'Most email clients cap width at 600px'],
                    ['Favicon', '32 × 32 px', 'Save as PNG; ICO format from separate tool'],
                    ['App Icon (iOS)', '1024 × 1024 px', 'App Store submission requirement'],
                    ['E-commerce Product Photo', '2000 × 2000 px', 'Square, white background, zoomable'],
                  ].map(([use, size, note], i) => (
                    <tr key={use} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800/30' : 'bg-slate-50 dark:bg-slate-900/20'}>
                      <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium text-xs border border-slate-200 dark:border-slate-700">{use}</td>
                      <td className="px-4 py-2.5 text-rose-600 dark:text-rose-400 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700">{size}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Use the preset buttons in the settings panel to instantly apply any of the common dimensions (HD, Full HD, 4K, Social Post, Twitter/X, Facebook Cover, and Thumbnail) without typing pixel values manually.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Aspect Ratio Lock — What It Does and When to Use It</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The aspect ratio is the relationship between an image's width and height. A 1920×1080 image has a 16:9 aspect ratio. A 1080×1080 image has a 1:1 ratio. When you resize an image without maintaining the aspect ratio, you are stretching or squeezing it — people and objects look distorted.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {[
                {
                  title: 'Aspect Ratio Locked (Recommended)',
                  icon: '🔒',
                  body: 'When the lock is on and you set only a width, the height is calculated automatically to maintain the original proportions. If you set both width and height, the image is scaled to fit within those bounds while keeping the proportions — this may result in slightly different dimensions than specified.',
                  use: 'Resizing photos, portraits, product images, any content where distortion is unacceptable'
                },
                {
                  title: 'Aspect Ratio Free (Stretch)',
                  icon: '🔓',
                  body: 'When the lock is off, the image is stretched or compressed to exactly match your specified width and height, regardless of the original proportions. This will distort the image unless your target dimensions happen to match the original ratio.',
                  use: 'Resizing icons, patterns, textures, or any image where exact pixel dimensions matter more than appearance'
                }
              ].map(({ title, icon, body, use }) => (
                <div key={title} className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className="text-2xl mb-2">{icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-2">{body}</p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Use for: {use}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Image Size Matters for Website Performance</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Oversized images are one of the most common and most impactful causes of slow web pages. If you upload a 4000×3000 pixel photograph to a website and it's displayed at 400×300 pixels, the browser still has to download the full 4000×3000 version — 100× more pixels than needed. That is a complete waste of bandwidth and a direct contributor to slow page loads.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Google's Core Web Vitals measurement called Largest Contentful Paint (LCP) measures how long it takes for the largest visible content element — usually an image — to load. An oversized unoptimised hero image can push LCP above 4 seconds, which Google classifies as "poor" and uses as a ranking signal. Resizing the same image to the actual display dimensions plus a 2× multiplier for retina screens (so 1920px wide for a full-width desktop image) and exporting as WebP can reduce the file size from 3–5 MB to under 200 KB — a 15–25× improvement.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              {[
                { icon: '📦', title: 'Reduce Transfer Size', body: 'A 4000px photo resized to 1200px at the same quality is typically 8–15× smaller. Less data = faster download for every visitor.' },
                { icon: '🚀', title: 'Improve LCP Score', body: 'Smaller images load faster. Getting your main image under 200 KB can move your LCP from 4+ seconds to under 2.5 — into Google\'s "good" range.' },
                { icon: '💸', title: 'Cut Bandwidth Costs', body: 'Every byte served costs money. Resized images mean lower CDN and hosting bandwidth bills, especially at scale with thousands of daily visitors.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <div className="text-2xl mb-2">{icon}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is my image uploaded to a server?', a: 'No. All resizing runs entirely in your browser using the HTML5 Canvas API. Your images never leave your device and are never stored anywhere.' },
                { q: 'Can I resize multiple images at once?', a: 'Yes. Drag and drop multiple image files onto the upload area, or use the file picker to select multiple files. All images are resized with the same target dimensions at the same time.' },
                { q: 'What happens if I only enter a width and leave height blank?', a: 'When aspect ratio lock is on (the default), the height is calculated automatically to match the original proportions. You only need to enter one dimension. If lock is off and you leave height blank, the original height is preserved and only the width changes.' },
                { q: 'What does the quality slider do?', a: 'For JPEG and WebP output, the quality slider controls the lossy compression level. Higher quality = larger file, less compression artefacts. Lower quality = smaller file, more compression. For PNG, quality is always lossless and the slider is hidden.' },
                { q: 'Which output format should I choose?', a: 'Choose JPEG for photographs and content where file size matters (social media, web). Choose PNG for images with transparency, logos, or screenshots. Choose WebP for websites — it produces 25–35% smaller files than JPEG with equivalent quality and is supported by all modern browsers.' },
                { q: 'Will resizing make my image blurry?', a: 'Increasing image size (upscaling) can reduce apparent sharpness because the browser interpolates new pixels from existing ones. Reducing image size (downscaling) generally preserves sharpness well. For the best quality upscaling, use a dedicated AI upscaling tool.' },
                { q: 'Can I resize an image to a specific file size (KB)?', a: 'Not directly — this tool resizes by pixel dimensions, not by file size. To hit a file size target, start with pixel resizing, then use the quality slider (for JPEG/WebP) to reduce the file size further. Alternatively, use the separate Image Compressor tool.' },
                { q: 'Is there a limit on how many images I can upload?', a: 'There is no hard limit. The tool processes images using your browser\'s memory. In practice, uploading 10–20 images at a time works well. Very large batch jobs (50+ large files) may be slow depending on your device.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span>
                    <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}