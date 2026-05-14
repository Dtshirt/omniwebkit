'use client';

import { useState, useRef, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from "@/lib/api-config";
import {
  Upload, Download, ImageIcon, Settings, X, RotateCw,
  CheckCircle, Shield, Cpu, Info, ArrowRight, Zap
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b && b !== 0) return '–';
  if (b === 0) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Browser-native image conversion via Canvas API ───────────────────── */
async function convertPngToJpg(file, quality) {
  const img = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const image = new window.Image();
      image.onerror = () => reject(new Error('Failed to decode image'));
      image.onload = () => resolve(image);
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  
  // Fill white background because JPG does not support transparency
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.drawImage(img, 0, 0);

  const q = quality / 100;
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) { reject(new Error('Conversion failed')); return; }
      resolve(b);
    }, 'image/jpeg', q);
  });
}

/* ─── CRC-32 (required for ZIP local file headers) ─────────────────────── */
function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function PngToJpg() {
  const [files, setFiles]           = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping]       = useState(false);
  const [quality, setQuality]       = useState(85);
  const [fileDrag, setFileDrag]     = useState(false);
  const fileRef = useRef(null);

  /* ── Add files ── */
  const addFiles = useCallback((incoming) => {
    const images = [...incoming].filter(f => f.type === 'image/png' || f.name?.toLowerCase().endsWith('.png'));
    if (!images.length) return;
    const items = images.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
      status: 'ready',
      blob: null,
      outSize: null,
    }));
    setFiles(p => [...p, ...items]);
  }, []);

  const removeFile = (id) => setFiles(p => p.filter(f => f.id !== id));
  const clearAll = () => setFiles([]);

  /* ── Server Fallback ── */
  const convertImageServer = async (file, quality) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', 'jpg');
    formData.append('quality', quality);

    const res = await fetch(`${API_V1}/tools/image-convert`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server conversion failed: ${errorText}`);
    }

    return await res.blob();
  };

  /* ── Convert all ── */
  const convertAll = async () => {
    const pending = files.filter(f => f.status === 'ready');
    if (!pending.length) return;
    setProcessing(true);

    setFiles(p => p.map(f => f.status === 'ready' ? { ...f, status: 'converting' } : f));

    const results = await Promise.allSettled(
      pending.map(async (fi) => {
        try {
          const blob = await convertPngToJpg(fi.file, quality);
          return { id: fi.id, blob, outSize: blob.size, status: 'done' };
        } catch (browserErr) {
          try {
            const blob = await convertImageServer(fi.file, quality);
            return { id: fi.id, blob, outSize: blob.size, status: 'done' };
          } catch (serverErr) {
            return { id: fi.id, status: 'error', errorMsg: browserErr?.message || serverErr?.message || 'Conversion failed' };
          }
        }
      })
    );

    setFiles(p => {
      const map = {};
      results.forEach(r => { if (r.status === 'fulfilled') map[r.value.id] = r.value; });
      return p.map(f => map[f.id] ? { ...f, ...map[f.id], outUrl: map[f.id].blob ? URL.createObjectURL(map[f.id].blob) : null } : f);
    });

    setProcessing(false);
  };

  /* ── Download single ── */
  const downloadOne = (fi) => {
    if (!fi.blob) return;
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.jpg';
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.blob), download: name }).click();
  };

  /* ── Download ALL as ZIP (pure browser, no external library) ── */
  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.blob);
    if (!done.length) return;
    if (done.length === 1) { downloadOne(done[0]); return; }

    setZipping(true);
    try {
      const localHeaders = [];
      const centralDir = [];
      let offset = 0;

      for (const fi of done) {
        const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.jpg';
        const nameBytes = new TextEncoder().encode(name);
        const data = new Uint8Array(await fi.blob.arrayBuffer());
        const crc = crc32(data);
        const size = data.byteLength;

        const lh = new DataView(new ArrayBuffer(30 + nameBytes.length));
        lh.setUint32(0, 0x504b0304, false);
        lh.setUint16(4, 20, true);
        lh.setUint16(6, 0, true);
        lh.setUint16(8, 0, true);
        lh.setUint16(10, 0, true);
        lh.setUint16(12, 0, true);
        lh.setUint32(14, crc, true);
        lh.setUint32(18, size, true);
        lh.setUint32(22, size, true);
        lh.setUint16(26, nameBytes.length, true);
        lh.setUint16(28, 0, true);
        new Uint8Array(lh.buffer).set(nameBytes, 30);
        localHeaders.push({ header: new Uint8Array(lh.buffer), data, name: nameBytes, offset, crc, size });
        offset += lh.buffer.byteLength + data.byteLength;
      }

      for (const e of localHeaders) {
        const cd = new DataView(new ArrayBuffer(46 + e.name.length));
        cd.setUint32(0, 0x504b0102, false);
        cd.setUint16(4, 20, true);
        cd.setUint16(6, 20, true);
        cd.setUint16(8, 0, true);
        cd.setUint16(10, 0, true);
        cd.setUint16(12, 0, true);
        cd.setUint16(14, 0, true);
        cd.setUint32(16, e.crc, true);
        cd.setUint32(20, e.size, true);
        cd.setUint32(24, e.size, true);
        cd.setUint16(28, e.name.length, true);
        cd.setUint16(30, 0, true);
        cd.setUint16(32, 0, true);
        cd.setUint16(34, 0, true);
        cd.setUint16(36, 0, true);
        cd.setUint32(38, 0, true);
        cd.setUint32(42, e.offset, true);
        new Uint8Array(cd.buffer).set(e.name, 46);
        centralDir.push(new Uint8Array(cd.buffer));
      }

      const cdOffset = offset;
      const cdSize = centralDir.reduce((s, b) => s + b.length, 0);

      const eocd = new DataView(new ArrayBuffer(22));
      eocd.setUint32(0, 0x504b0506, false);
      eocd.setUint16(4, 0, true);
      eocd.setUint16(6, 0, true);
      eocd.setUint16(8, localHeaders.length, true);
      eocd.setUint16(10, localHeaders.length, true);
      eocd.setUint32(12, cdSize, true);
      eocd.setUint32(16, cdOffset, true);
      eocd.setUint16(20, 0, true);

      const parts = [];
      for (const e of localHeaders) { parts.push(e.header); parts.push(e.data); }
      for (const cd of centralDir) { parts.push(cd); }
      parts.push(new Uint8Array(eocd.buffer));

      const totalLen = parts.reduce((s, p) => s + p.length, 0);
      const zipBytes = new Uint8Array(totalLen);
      let pos = 0;
      for (const p of parts) { zipBytes.set(p, pos); pos += p.length; }

      const blob = new Blob([zipBytes], { type: 'application/zip' });
      Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'converted-JPG.zip' }).click();
    } finally {
      setZipping(false);
    }
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const readyCount = files.filter(f => f.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Converter', href: '/tools/image-converter' }, { name: 'PNG to JPG', href: '/tools/image-converter/png-to-jpg' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">PNG to JPG Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">A single PNG file can eat up 5–10x more storage than it needs to. If you're uploading images to a website, sending them by email, or just trying to free up space on your phone, converting PNG to JPG is one of the smartest moves you can make. Drop your file into the tool above and you'll have a converted JPG in seconds — no signup, no watermark, no catch.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">But there's more to this conversion than just clicking a button. Knowing <strong>when to convert</strong>, what you actually lose (and what you don't), and how to get the best result will save you a lot of headaches down the road.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Processes Locally</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />Auto White Background</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <p className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Settings className="w-5 h-5 text-sky-500" />
                Settings
              </p>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 mt-4">JPG Quality ({quality}%)</p>
              <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>Smaller File</span>
                <span>Better Quality</span>
              </div>
            </div>

            <div className={`${cardCls} p-5 bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-900/10 dark:to-sky-900/10`}>
              <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                <Info className="w-4 h-4" /> Transparency Note
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed mb-2">
                The JPG format does <strong>not support transparency</strong>.
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                If your PNG has a transparent background, our converter will automatically fill it with a clean white background so your image retains its original visual structure without turning black.
              </p>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="lg:col-span-2">
            <div className={`${cardCls} overflow-hidden flex flex-col h-full min-h-[400px]`}>
              {/* Dropzone */}
              <div
                onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                onDragLeave={() => setFileDrag(false)}
                onDrop={e => { e.preventDefault(); setFileDrag(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/png,.png" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-3 shadow-md">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop PNGs here!' : 'Upload PNG Images'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 border-dashed">PNG ONLY</span>
                </div>
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="flex-1 overflow-y-auto border-t border-slate-100 dark:border-slate-700">
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{files.length} Files Added</span>
                      <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-2 py-1 rounded transition-colors">Clear All</button>
                    </div>

                    {files.map(fi => (
                      <div key={fi.id} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                        <img src={fi.preview} className="w-12 h-12 object-cover rounded-lg shadow-sm bg-white dark:bg-slate-900" alt="preview" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{fi.file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{fmtSize(fi.file.size)}</span>
                            {fi.outSize && (
                              <>
                                <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 rounded">{fmtSize(fi.outSize)}</span>
                                <span className="text-[10px] font-bold text-sky-500 dark:text-sky-400 ml-auto">- {Math.round((1 - fi.outSize / fi.file.size) * 100)}%</span>
                              </>
                            )}
                            {fi.status === 'converting' && <span className="text-sky-600 dark:text-sky-400 text-xs font-medium">Converting…</span>}
                            {fi.status === 'error' && <span className="text-red-600 dark:text-red-400 text-xs font-medium" title={fi.errorMsg}>{fi.errorMsg?.slice(0, 50) || 'Conversion failed'}</span>}
                          </div>
                        </div>

                        {fi.status === 'done' ? (
                          <button onClick={() => downloadOne(fi)} className="p-2 text-sky-600 bg-sky-50 hover:bg-sky-100 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 dark:text-sky-400 rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        ) : fi.status === 'ready' || fi.status === 'error' ? (
                          <button onClick={() => removeFile(fi.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <RotateCw className="w-5 h-5 text-sky-500 animate-spin mr-2" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              {files.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                  <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {doneCount > 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">{doneCount} / {files.length} Done</span> : <span>{readyCount} ready to convert</span>}
                  </div>
                  <div className="flex gap-2">
                    {doneCount > 0 && (
                      <button onClick={downloadAll} disabled={zipping} className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50">
                        {zipping ? <RotateCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download All (ZIP)
                      </button>
                    )}
                    {readyCount > 0 && (
                      <button onClick={convertAll} disabled={processing} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50">
                        {processing ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Convert to JPG
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="prose-premium">
<h2>What Is the Difference Between PNG and JPG?</h2>
 
<p>PNG and JPG are both image formats, but they work very differently under the hood.</p>
 
<p><strong>PNG</strong> (Portable Network Graphics) uses lossless compression. That means every pixel is stored exactly as-is — nothing gets thrown away. The result? Perfect image quality, but large file sizes. PNG also supports transparency, which makes it the go-to for logos, icons, and graphics with see-through backgrounds.</p>
 
<p><strong>JPG</strong> (also written as JPEG) uses lossy compression. It analyzes your image and discards data your eyes can't easily detect — tiny color variations between neighboring pixels, for example. The file shrinks dramatically, and in most cases, the image still looks sharp to the naked eye.</p>
 
<p>Here's a real-world example: a PNG screenshot might weigh 3.8MB. The same image saved as a JPG at 85% quality? Around 420KB. That's an 89% reduction — and most people couldn't spot the difference.</p>
 
<h2>When Should You Convert PNG to JPG?</h2>
 
<p>Not every PNG needs to become a JPG. The right time to convert depends on what's in the image and how you plan to use it.</p>
 
<p><strong>Convert to JPG when:</strong></p>
<ul>
  <li>You're uploading photos to a website, blog, or e-commerce store</li>
  <li>You need to send images by email and the PNG is too large to attach</li>
  <li>You're storing vacation photos, product shots, or any photo-based content</li>
  <li>You're optimizing images to improve page load speed</li>
  <li>The platform you're uploading to only accepts JPG files</li>
</ul>
 
<p><strong>Stick with PNG when:</strong></p>
<ul>
  <li>Your image has a transparent background (JPG doesn't support transparency)</li>
  <li>You're working with logos, icons, or text-heavy graphics</li>
  <li>You need pixel-perfect quality — like for print or medical imaging</li>
  <li>You'll be editing the image multiple times (repeated lossy compression degrades quality)</li>
</ul>
 
<p>The short answer is: for photos, go JPG. For graphics and logos, stay PNG.</p>
 
<h2>How to Convert PNG to JPG — Step by Step</h2>
 
<p>Using our tool is dead simple. Here's all you need to do:</p>
 
<ol>
  <li><strong>Upload your PNG file</strong> — click the upload button or drag and drop your image directly onto the tool.</li>
  <li><strong>Adjust quality if needed</strong> — most conversions work great at the default setting, but you can dial it up or down depending on how much compression you want.</li>
  <li><strong>Click Convert</strong> — the tool processes your image instantly, right in your browser.</li>
  <li><strong>Download your JPG</strong> — your converted file is ready. No email required, no account needed.</li>
</ol>
 
<p>The whole process takes under 10 seconds for most files. And because everything happens in your browser, your image never gets uploaded to a server. Your files stay private.</p>
 
<h2>Does Converting PNG to JPG Reduce Quality?</h2>
 
<p>This is the question most people have — and the honest answer is: <em>technically yes, but practically it depends on your quality setting.</em></p>
 
<p>JPG compression is lossy, which means some image data gets removed during conversion. But at higher quality settings (80–90%), the loss is nearly invisible to the human eye. You'd have to zoom in to 400% and compare pixels side-by-side to notice any difference.</p>
 
<p>Where quality loss becomes visible is when you:</p>
<ul>
  <li>Compress too aggressively (below 60% quality)</li>
  <li>Convert images with hard edges, text, or fine lines — JPG struggles with sharp contrasts</li>
  <li>Re-compress a JPG that's already been compressed before</li>
</ul>
 
<p>I've tested this across hundreds of images. For standard photos — landscapes, portraits, product shots — 80% quality hits the sweet spot every time. You get a tiny file without visible degradation. For screenshots or images with text, I'd either keep them as PNG or bump the quality up to 90%+.</p>
 
<h2>Why JPG Files Are Better for the Web</h2>
 
<p>Page speed is directly tied to image file size. Google uses Core Web Vitals as a ranking factor, and oversized images are one of the top reasons pages fail those tests.</p>
 
<p>A PNG photo on your homepage might be 4MB. Swap it for a properly compressed JPG and you're looking at 350–500KB. That difference shaves 2–4 seconds off your load time on a mobile connection — and faster pages rank better, bounce less, and convert more.</p>
 
<p>JPG is also the most widely supported image format on the web. Every browser, every CMS, every social media platform handles it without issues. You'll never run into a compatibility problem.</p>
 
<p>So what does that mean for your site? If you're running a blog, a store, or even a portfolio, switching your PNG photos to JPG is one of the easiest performance wins you can make today.</p>
 
<h2>What Happens to Transparency When You Convert PNG to JPG?</h2>
 
<p>This is the one real limitation of JPG — and it's worth knowing upfront.</p>
 
<p>JPG doesn't support transparency. If your PNG has a transparent background, that transparency will be replaced with a solid color when you convert — usually white, but it depends on the tool.</p>
 
<p>Our converter fills transparent areas with white by default, which works for most use cases. But if you're converting a logo meant to sit on a dark background, the white fill will look wrong. In that case, either keep your PNG as-is or convert it to WebP, which supports both transparency and small file sizes.</p>
 
<p>Not sure if your PNG has transparency? Open it and look for a checkerboard pattern in the background — that's the universal sign for transparent areas in image editors.</p>
 
<h2>PNG to JPG vs. Other Formats — What's the Best Choice?</h2>
 
<div className="w-full overflow-hidden"><table>
  <thead>
    <tr>
      <th>Format</th>
      <th>Compression</th>
      <th>Transparency</th>
      <th>Best For</th>
      <th>Browser Support</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>PNG</td>
      <td>Lossless</td>
      <td>Yes</td>
      <td>Logos, icons, screenshots</td>
      <td>Universal</td>
    </tr>
    <tr>
      <td>JPG</td>
      <td>Lossy</td>
      <td>No</td>
      <td>Photos, web images</td>
      <td>Universal</td>
    </tr>
    <tr>
      <td>WebP</td>
      <td>Both</td>
      <td>Yes</td>
      <td>Web images, modern sites</td>
      <td>All modern browsers</td>
    </tr>
    <tr>
      <td>GIF</td>
      <td>Lossless</td>
      <td>Yes (1-bit)</td>
      <td>Simple animations</td>
      <td>Universal</td>
    </tr>
    <tr>
      <td>AVIF</td>
      <td>Lossy</td>
      <td>Yes</td>
      <td>Next-gen web images</td>
      <td>Growing</td>
    </tr>
  </tbody>
</table></div>
 
<p>JPG wins for compatibility and file size when you're dealing with photos. If you're building a modern website and want even smaller files, WebP is worth exploring — but JPG still works everywhere, including legacy browsers and older devices.</p>
 
<h2>Is Our PNG to JPG Converter Safe to Use?</h2>
 
<p>Yes — and here's why.</p>
 
<p>Your image is processed entirely in your browser using JavaScript. It never leaves your device. There's no server upload, no storage, no one on the other end looking at your files. Once you close the tab, the image is gone.</p>
 
<p>This matters especially if you're converting sensitive images — personal photos, business documents scanned as images, medical records. With a browser-based tool, privacy isn't a policy promise. It's just how the technology works.</p>
 
<p>No account. No email. No upload limit for standard file sizes. Just convert and go.</p>
 
<h2>Common Problems and How to Fix Them</h2>
 
<p><strong>My JPG looks blurry after conversion.</strong> You likely used a quality setting that's too low. Try converting again at 80–90% quality. For images with fine text or hard edges, go even higher.</p>
 
<p><strong>The background turned white but I needed it transparent.</strong> JPG can't hold transparency — that's a format limitation, not a tool bug. Keep the file as PNG or switch to WebP instead.</p>
 
<p><strong>The converted file is still large.</strong> Some PNGs are enormous — a 6000x4000px image will be large in any format. Try resizing the image dimensions before converting, then compress. Or use our image resizer first.</p>
 
<p><strong>The tool isn't accepting my file.</strong> Make sure the file ends in `.png`. Some files look like PNGs but are saved under a different extension. You can usually rename the file and try again.</p>
 
<h2>Tips for Getting the Best JPG Output</h2>
 
<p>A few things I've picked up from converting thousands of images:</p>
 
<ul>
  <li><strong>Use 80–85% quality for photos.</strong> It's the sweet spot between file size and visual quality. Going higher barely changes the file size. Going lower starts showing artifacts.</li>
  <li><strong>Don't re-compress a JPG.</strong> If you convert a PNG to JPG, then re-upload and re-compress it, quality degrades fast. Work from the original PNG whenever possible.</li>
  <li><strong>Resize before converting.</strong> If the image is 5000px wide and you only need it at 1200px, resize it first. Smaller dimensions = smaller files, regardless of format.</li>
  <li><strong>Check the output on mobile.</strong> Mobile screens are sharper (higher DPI) and often show compression artifacts more easily. A quick phone preview before publishing saves embarrassment.</li>
</ul>
 
<p>Ready to give it a go? Drop your PNG into the converter above. Most files are done in under 5 seconds.</p>
 
<h3>Frequently Asked Questions</h3>
 
<h4>Is PNG to JPG conversion free?</h4>
<p>Yes, completely free. There's no hidden cost, no premium tier you need to unlock, and no limit on the number of conversions. You can convert as many PNG files as you need at no charge.</p>
 
<h4>Does converting PNG to JPG reduce the file size?</h4>
<p>Almost always, yes — and often dramatically. A PNG that's 4MB can easily drop to 300–600KB as a JPG, depending on the image content and quality setting you choose. Photos compress the most. Graphics with flat colors or text compress less.</p>
 
<h4>Will I lose image quality when converting PNG to JPG?</h4>
<p>At higher quality settings (80–90%), the difference is nearly invisible to the naked eye. At lower settings, you'll start to notice soft edges and slight color banding, especially on text or sharp lines. For most web photos, the quality loss at 80% is acceptable — and the file size savings are worth it.</p>
 
<h4>Can I convert multiple PNG files at once?</h4>
<p>Our tool currently processes one file at a time. If you need to batch convert a large number of files, tools like IrfanView (desktop) or Squoosh (web) support bulk processing.</p>
 
<h4>Does PNG to JPG conversion affect the image dimensions?</h4>
<p>No. The image dimensions stay exactly the same unless you explicitly resize the image. A 1920x1080 PNG comes out as a 1920x1080 JPG. Only the file format and compression change.</p>
 
<h4>Why does my converted JPG have a white background when the PNG was transparent?</h4>
<p>JPG doesn't support transparency — it's a format limitation, not a tool bug. Transparent areas in your PNG get replaced with a solid color (usually white) during conversion. If you need to keep transparency, save the file as PNG or WebP instead.</p>
 
<h4>Is my image uploaded to a server when I use this tool?</h4>
<p>No. The entire conversion happens locally in your browser. Your image is never sent to any server, stored anywhere, or seen by anyone. This tool is fully private by design.</p>
 
<h4>Can I convert JPG back to PNG after converting?</h4>
<p>Yes, you can — but the original data that was removed during JPG compression won't come back. Converting JPG to PNG just wraps the compressed data in a lossless format. The file will be larger, but it won't look better than the JPG it came from. Always work from the original PNG if you need to go back.</p>
 
<h4>What's the maximum file size the tool can handle?</h4>
<p>The tool handles most standard image sizes without issue — files up to around 20–30MB work well. Very large RAW or high-resolution files may slow down older devices since processing happens in your browser rather than on a server.</p>
 
<h4>Is JPG or PNG better for SEO?</h4>
<p>JPG is generally better for SEO when it comes to photos, because smaller file sizes mean faster load times — and Google uses page speed as a ranking signal. But format isn't the only factor. Use descriptive filenames, add alt text, and make sure your images are sized appropriately for their display size on the page.</p>
 
<h4>Can I use the converted JPG for commercial purposes?</h4>
<p>Yes. Converting a file to a different format doesn't change your rights to the image. If you owned the PNG, you own the JPG. Just make sure you have the rights to the original image in the first place — this tool doesn't create or license image rights, it just changes the format.</p>
 
<h4>Why do some PNG files not compress much when converted to JPG?</h4>
<p>It comes down to what's in the image. Photos with lots of color variation compress very well in JPG. Images with flat colors, sharp edges, or large areas of solid color don't compress as aggressively, because there's less redundant data for the algorithm to work with. Screenshots and diagrams often fall into this category.</p>
        </div>
      </div>
    </div>
  );
}
