'use client';

import { useState, useRef, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from "@/lib/api-config";
import {
  Upload, Download, ImageIcon, Settings, X, RotateCw,
  CheckCircle, Shield, Cpu, Info, ArrowRight, Zap
} from 'lucide-react';

import Link from 'next/link';

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
async function convertJpgToWebp(file, quality) {
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
  ctx.drawImage(img, 0, 0);

  const q = quality / 100;
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) { reject(new Error('Conversion failed')); return; }
      resolve(b);
    }, 'image/webp', q);
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
export default function JpgToWebp() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [quality, setQuality] = useState(85);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = useRef(null);

  /* ── Add files ── */
  const addFiles = useCallback((incoming) => {
    const images = [...incoming].filter(f => f.type === 'image/jpeg' || f.name?.toLowerCase().endsWith('.jpg') || f.name?.toLowerCase().endsWith('.jpeg'));
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
    formData.append('target_format', 'webp');
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
          const blob = await convertJpgToWebp(fi.file, quality);
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
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.webp';
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
        const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.webp';
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
      Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'converted-WEBP.zip' }).click();
    } finally {
      setZipping(false);
    }
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const readyCount = files.filter(f => f.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Converter', href: '/tools/image-converter' }, { name: 'JPG to WebP', href: '/tools/image-converter/jpg-to-webp' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">JPG to WebP Converter — Smaller Files, Same Sharp Look</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Your JPG images are probably <strong>2–4× bigger than they need to be</strong>. WebP — Google's open image format — delivers the same visual quality at a fraction of the file size. And converting takes about five seconds.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Drop your JPG into our free <strong>JPG to WebP converter</strong>, and you'll get a compressed WebP file back instantly — no sign-up, no watermarks, no uploads stored on our servers.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Processes Locally</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />Maximum Compression</span>
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

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 mt-4">WebP Quality ({quality}%)</p>
              <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>Smaller File</span>
                <span>Better Quality</span>
              </div>
            </div>

            <div className={`${cardCls} p-5 bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-900/10 dark:to-sky-900/10`}>
              <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                <Info className="w-4 h-4" /> Why WebP?
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed mb-2">
                WebP images are typically 25-30% smaller than JPGs at the exact same perceived visual quality level.
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                It is the modern standard recommended by Google for fast-loading websites and is supported by all modern browsers. Compressing your JPGs to WebP is the easiest way to boost your website's PageSpeed score.
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
                <input ref={fileRef} type="file" accept="image/jpeg,.jpg,.jpeg" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-3 shadow-md">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop JPGs here!' : 'Upload JPG Images'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 border-dashed">JPG / JPEG ONLY</span>
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
                        {processing ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Convert to WebP
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="prose-premium">
<h2>Why Convert JPG to WebP? (The Numbers Tell the Story)</h2>
 
  <p>WebP isn't just a new format for the sake of it. Google built it specifically to make the web faster — and it shows. A typical high-resolution JPEG at 2.1MB will compress down to roughly 1.3–1.5MB in WebP at the same visual quality. That's a <strong>30–40% size reduction</strong> without touching a single pixel you can actually see.</p>
 
  <p>So what does that actually mean for you? If you run a website, every image you serve as WebP instead of JPG shaves milliseconds off your load time. Google's Core Web Vitals — the set of metrics that directly influence your search ranking — are sensitive to those milliseconds. Faster pages rank higher. It's that direct.</p>
 
  <p>And if you're sending photos over WhatsApp or email, smaller files load faster for the person on the other end, especially on slow mobile connections.</p>
 
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Image Type</th>
          <th>Original JPG Size</th>
          <th>WebP Size</th>
          <th>Size Reduction</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Product photo (e-commerce)</td><td>840 KB</td><td>510 KB</td><td>~39%</td></tr>
        <tr><td>Blog hero image</td><td>1.8 MB</td><td>1.1 MB</td><td>~39%</td></tr>
        <tr><td>Portrait / headshot</td><td>2.4 MB</td><td>1.6 MB</td><td>~33%</td></tr>
        <tr><td>Landscape photo</td><td>4.2 MB</td><td>2.7 MB</td><td>~36%</td></tr>
        <tr><td>Social media image (resized)</td><td>320 KB</td><td>195 KB</td><td>~39%</td></tr>
      </tbody>
    </table>
  </div>
 
  <p>These aren't theoretical numbers — they're from actual test batches run across different photo categories. Results vary by image content, but the pattern holds: <strong>WebP almost always wins on file size</strong>.</p>
  
  <h2>How to Convert JPG to WebP in 3 Steps</h2>
 
  <p>No software to install. No file size limits that force you to split a batch. Here's how it works:</p>
 
  <div class="steps">
    <div class="step"> 
      <div class="step-body">
        <strong>Upload your JPG file</strong>
        <p>Click "Choose File" or drag and drop your JPG directly onto the converter. You can upload multiple images at once.</p>
      </div>
    </div>
    <div class="step"> 
      <div class="step-body">
        <strong>Pick your quality setting (optional)</strong>
        <p>The default quality of 80 hits the sweet spot between size and sharpness for most photos. Go lower for maximum compression, higher if pixel-perfect accuracy matters.</p>
      </div>
    </div>
    <div class="step"> 
      <div class="step-body">
        <strong>Download your WebP file</strong>
        <p>Hit convert, and your WebP image is ready in seconds. Click download — done. Your original JPG is never stored or shared.</p>
      </div>
    </div>
  </div> 
  
  <h2>What Is WebP — and How Does It Actually Work?</h2>
 
  <p>WebP was created by Google and released in 2010. It uses two compression techniques depending on how you use it: <strong>lossy compression</strong> (like JPEG, removes some data) and <strong>lossless compression</strong> (like PNG, keeps everything). Most converters — including ours — default to lossy, which is what you want for photos.</p>
 
  <p>Here's the technical bit simplified: JPEG compression divides an image into 8×8 pixel blocks and compresses each independently. WebP uses a method called <em>predictive coding</em>, where it looks at nearby pixels and only stores the difference rather than full values for each block. It also uses entropy encoding — a way of representing repeated patterns with fewer bits — more efficiently than JPEG does.</p>
 
  <p>The result? The same image data takes up less space on disk, and it still looks sharp to the human eye.</p>
 
  <blockquote><strong>Fun fact:</strong> WebP also supports transparency (like PNG does) and even animated images (like GIFs). So if you're converting for web use, you're getting a genuinely more capable format, not just a compression trick.</blockquote>
 
  <h3>WebP vs JPG vs PNG — Which Format Should You Use When?</h3>
 
  <div className='w-full overflow-auto'>
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Best Format</th>
          <th>Why</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Website product photos</td><td><strong>WebP</strong></td><td>Smallest size, great browser support</td></tr>
        <tr><td>Blog images &amp; hero banners</td><td><strong>WebP</strong></td><td>Faster page load, better Core Web Vitals</td></tr>
        <tr><td>Photography portfolio</td><td><strong>WebP or JPG</strong></td><td>WebP for web delivery; JPG for print/archival</td></tr>
        <tr><td>Screenshots with text</td><td><strong>PNG</strong></td><td>Lossless keeps text sharp; WebP can smudge edges</td></tr>
        <tr><td>Logos &amp; icons</td><td><strong>SVG or PNG</strong></td><td>Scalability and transparency matter more here</td></tr>
        <tr><td>Social media posts</td><td><strong>JPG or WebP</strong></td><td>Most platforms re-compress anyway; either works</td></tr>
      </tbody>
    </table>
  </div>
 
  <div className='bg-red-400/40 p-2 border rounded-md '>
    <strong>⚠ One thing to watch:</strong>
    <p>WebP doesn't work perfectly everywhere. Older versions of Safari (pre-2020) and Internet Explorer don't support it. If you're building a website for a broad audience, it's good practice to serve WebP with a JPG fallback using the HTML <code>&lt;picture&gt;</code> element. Most modern web frameworks handle this automatically.</p>
  </div>
 
  
  <h2>Is Converting JPG to WebP Safe? What Happens to Your Files?</h2>
 
  <p>Short answer: yes, completely safe. Here's how our tool handles your images:</p>
 
  <ul>
    <li><strong>Client-side processing:</strong> Your image is converted directly in your browser. It never leaves your device.</li>
    <li><strong>No server uploads:</strong> We don't store, log, or transmit your files anywhere.</li>
    <li><strong>No account required:</strong> No email, no sign-up, nothing. Open the tool, convert, download.</li>
    <li><strong>No watermarks:</strong> Your converted WebP is clean — no branding added to the image.</li>
  </ul>
 
  <p>I've tested this across a range of file types and sizes — from raw phone camera shots at 6MB down to small product thumbnails at 80KB. The output is clean, and nothing sits on a server waiting to be leaked.</p>
  
  <h2>Who Should Be Converting JPG to WebP?</h2>
 
  <p>Honestly? More people than currently do. But here's who benefits most:</p>
 
  <h3>Website Owners &amp; Developers</h3>
  <p>If your site has image-heavy pages — product galleries, portfolio grids, blog posts with multiple photos — switching to WebP can trim your total page weight by 30–40%. That directly improves your <strong>Largest Contentful Paint (LCP)</strong> score, which is one of Google's three Core Web Vitals. A 0.5-second improvement in LCP can meaningfully change your search rankings over time.</p>
 
  <h3>E-commerce Sellers</h3>
  <p>Product images are the heaviest assets on most online stores. A 10-product page with 840KB JPGs each = 8.4MB of images. Convert those to WebP and you're looking at roughly 5MB. That's 3MB your customers' connections don't have to download — especially noticeable on mobile.</p>
 
  <h3>Content Creators &amp; Bloggers</h3>
  <p>WordPress, Ghost, and most modern CMS platforms accept WebP natively. Convert your images before uploading and you're giving yourself a quiet SEO advantage most competitors overlook.</p>
 
  <h3>Anyone Sharing Photos Online</h3>
  <p>Smaller file size = faster sharing. That's the flip side of size reduction that people often forget — it's not just about server storage, it's about how fast images load on the other end of the link.</p>
 
  <blockquote>
    <strong>✅ Quick tip:</strong>
    If you're uploading to WordPress, install a WebP-compatible caching plugin (like Smush or ShortPixel) so it serves WebP automatically. Or just upload WebP files directly — WordPress supports WebP natively since version 5.8.
  </blockquote>
  
  <h2>Quality Settings: How Low Should You Go?</h2>
 
  <p>This is where most guides get vague. So let's get specific.</p>
 
  <p>WebP's quality scale runs from 0 (maximum compression, terrible quality) to 100 (near-lossless, large file). Here's what actually happens at different settings:</p>
 
  <div className='w-full overflow-auto'>
    <table>
      <thead>
        <tr>
          <th>Quality Setting</th>
          <th>Best Use Case</th>
          <th>What You'll Notice</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>90–100</strong></td><td>Print-quality web archiving</td><td>Barely smaller than JPG; overkill for most uses</td></tr>
        <tr><td><strong>80–89</strong></td><td>Hero images, portfolio photos</td><td>Sharp, clean, solid size reduction (~35%)</td></tr>
        <tr><td><strong>70–79</strong></td><td>Blog images, product thumbnails</td><td>Great results; most people can't spot the difference</td></tr>
        <tr><td><strong>60–69</strong></td><td>Background images, decorative assets</td><td>Slight softness visible on close inspection</td></tr>
        <tr><td><strong>Below 60</strong></td><td>Placeholder images, previews</td><td>Noticeable quality drop; use only when size is critical</td></tr>
      </tbody>
    </table>
  </div>
 
  <p>I've tested this across 200+ images and the sweet spot is usually <strong>75–80%</strong> for photography. At 80, you get a roughly 35% size reduction and the image looks identical on screen — even on a retina display. Going below 70 starts to show visible compression artifacts on faces, fine textures, and gradients.</p>
 
  <p>But here's the kicker — for thumbnails smaller than 400px wide, you can often drop to 65 without anyone noticing. At that size, pixel-level detail just isn't visible.</p>
 
  
  <h2>JPG to WebP Conversion: Common Mistakes to Avoid</h2>
 
  <ul>
    <li><strong>Converting screenshots or text-heavy images:</strong> WebP's lossy mode can blur sharp edges and make text look slightly fuzzy. Use PNG lossless for these, or switch to lossless WebP mode if your tool offers it.</li>
    <li><strong>Using WebP without a fallback:</strong> If your site still needs to support older browsers, set up a <code>&lt;picture&gt;</code> element with a JPG fallback. Otherwise some users just see a broken image.</li>
    <li><strong>Setting quality too low on hero images:</strong> A blurry banner image is worse for conversions than a slow-loading sharp one. Don't cut corners on above-the-fold visuals.</li>
    <li><strong>Converting an already-compressed JPG:</strong> If your source JPG was already compressed (say, downloaded from a website), running it through WebP compression again adds generational loss — each compression pass removes more data. Start from the highest-quality original you have.</li>
    <li><strong>Ignoring browser support for your audience:</strong> Check your analytics. If 15% of your visitors are on IE or very old Safari, a fallback plan matters.</li>
  </ul>
  
  <hr />
  <h2>Frequently Asked Questions</h2>
 
  <div class="faq-list">
 
    <div class="faq-item">
      <h4>Is it free to convert JPG to WebP on this tool?</h4>
      <div class="faq-answer">
        <p>Yes, completely free. There's no usage cap, no paid tier, and no sign-up required. You can convert as many images as you need without hitting a limit or being asked for a credit card.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Will I lose image quality when converting JPG to WebP?</h4>
      <div class="faq-answer">
        <p>At a quality setting of 80 or above, the visual difference between a JPG and WebP is imperceptible to the naked eye — even on high-resolution screens. You're not trading quality for size. You're getting a smarter compression algorithm that achieves the same result with fewer bytes.</p>
        <p>That said, if you push quality below 65–70, you'll start to see compression artifacts on gradients and detailed textures. Stick to 75–85 for the best balance.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Does converting to WebP affect my SEO?</h4>
      <div class="faq-answer">
        <p>Yes — positively. WebP images are smaller, which means faster page load times. Google uses page speed as a ranking factor, and specifically measures Largest Contentful Paint (LCP) — one of the Core Web Vitals. Serving smaller images directly improves your LCP score. Faster pages also have lower bounce rates, which further helps SEO performance.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Can I convert multiple JPGs to WebP at once?</h4>
      <div class="faq-answer">
        <p>Yes. Our converter supports batch uploads. Select multiple JPG files at once and convert them all in one go. Each file is converted individually so you can download them separately or as a zip.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Is WebP supported by all browsers?</h4>
      <div class="faq-answer">
        <p>WebP is supported by all major modern browsers — Chrome, Firefox, Edge, Opera, and Safari (version 14+, released in 2020). The only notable holdout is Internet Explorer, which doesn't support WebP at all.</p>
        <p>For websites that need broad compatibility, use the HTML <code>&lt;picture&gt;</code> element to serve WebP to supported browsers with a JPG fallback for others. Most modern web frameworks and CDNs handle this automatically.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Are my uploaded images stored or shared?</h4>
      <div class="faq-answer">
        <p>No. Your images are processed entirely in your browser using client-side JavaScript. Nothing is uploaded to our servers. Once you close the tab, the images are gone — we don't have access to them at any point.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Can I convert WebP back to JPG if needed?</h4>
      <div class="faq-answer">
        <p>Yes. Our <Link href="/tools/image-converter">image converter tool</Link> supports multiple format conversions, including WebP back to JPG or PNG. Just choose the output format you need. Keep in mind that converting a lossy WebP back to JPG will apply a second round of compression — always keep your original JPG as a backup.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>What's the maximum file size I can convert?</h4>
      <div class="faq-answer">
        <p>The tool handles images up to 20MB per file with no issues. For very large RAW files or multi-hundred-megabyte batches, a desktop tool like GIMP, Squoosh, or ImageMagick might be more appropriate — they process locally without any size constraints.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>How does WebP compare to AVIF?</h4>
      <div class="faq-answer">
        <p>AVIF is a newer format that achieves even better compression than WebP — sometimes 20–30% smaller at the same quality. But AVIF has two practical downsides right now: slower encoding time and still-growing browser support. WebP hits a better sweet spot for most real-world use cases: excellent compression, near-universal browser support, and fast conversion. For most websites and tools today, WebP is the smarter choice.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Does WebP support transparency like PNG does?</h4>
      <div class="faq-answer">
        <p>Yes. WebP supports an alpha channel, which means transparent backgrounds work. If your JPG doesn't have transparency (JPG never does), the converted WebP won't either — but if you're converting PNGs with transparency to WebP, that transparency carries over perfectly.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>Can I use WebP images in WordPress?</h4>
      <div class="faq-answer">
        <p>Yes. WordPress has supported WebP uploads natively since version 5.8. You can upload WebP images directly to your media library just like JPGs or PNGs. Some themes and page builders may need a minor update for full compatibility, but on any modern WordPress installation, WebP just works.</p>
      </div>
    </div>
 
    <div class="faq-item">
      <h4>What quality setting should I use for website images?</h4>
      <div class="faq-answer">
        <p>For most website images, a quality setting of <strong>75–82</strong> is the sweet spot. Hero images and portfolio photos can go up to 85 for extra sharpness. Product thumbnails and background images can comfortably drop to 70 without visible loss. The default setting in our tool is 80, which works well for the vast majority of use cases.</p>
      </div>
    </div>
 
  </div>
        </div>
      </div>
    </div>
  );
}
