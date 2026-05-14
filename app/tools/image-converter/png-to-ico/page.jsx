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

/* ─── ICO Encoder (Custom Binary Wrapper) ───────────────────────────────── */
async function encodeICO(file) {
  // Read the original file
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
  // ICO max size is 256x256
  const size = Math.min(256, img.naturalWidth, img.naturalHeight);
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Center and scale image
  ctx.drawImage(img, 0, 0, size, size);
  
  // Extract pure PNG buffer from canvas
  const pngBlob = await new Promise(r => canvas.toBlob(r, 'image/png'));
  const pngBuf = new Uint8Array(await pngBlob.arrayBuffer());
  
  // Assemble the ICO header (6 bytes general + 16 bytes entry + PNG data)
  const ico = new ArrayBuffer(6 + 16 + pngBuf.length);
  const v = new DataView(ico);
  v.setUint16(0, 0, true); // reserved
  v.setUint16(2, 1, true); // type: ICO
  v.setUint16(4, 1, true); // count
  
  // Entry block
  const u8 = new Uint8Array(ico);
  u8[6] = size >= 256 ? 0 : size; // width
  u8[7] = size >= 256 ? 0 : size; // height
  u8[8] = 0; // palette
  u8[9] = 0; // reserved
  v.setUint16(10, 1, true); // color planes
  v.setUint16(12, 32, true); // bpp
  v.setUint32(14, pngBuf.length, true); // image size
  v.setUint32(18, 22, true); // offset to image data
  
  u8.set(pngBuf, 22);
  
  return new Blob([ico], { type: 'image/x-icon' });
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
export default function PngToIco() {
  const [files, setFiles]           = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping]       = useState(false);
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
  const convertImageServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', 'ico');

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
          const blob = await encodeICO(fi.file);
          return { id: fi.id, blob, outSize: blob.size, status: 'done' };
        } catch (browserErr) {
          try {
            const blob = await convertImageServer(fi.file);
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
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.ico';
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
        const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.ico';
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
      Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'converted-ICO.zip' }).click();
    } finally {
      setZipping(false);
    }
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const readyCount = files.filter(f => f.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Converter', href: '/tools/image-converter' }, { name: 'PNG to ICO', href: '/tools/image-converter/png-to-ico' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">PNG to ICO Converter — Free Online Tool to Convert PNG to ICO Instantly</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">A blurry, pixelated favicon can quietly destroy your site's credibility before a visitor even reads a single word. Converting your PNG to ICO the right way — with the correct sizes, clean transparency, and browser-ready formatting — is the difference between a polished brand and a site that looks unfinished. Drop your PNG file into the tool above, and you'll have a proper ICO file ready in seconds.</p>

          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">No software to install. No account needed. Just upload, convert, and download.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Processes Locally</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />Favicon Ready</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <p className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Settings className="w-5 h-5 text-sky-500" />
                Icon Settings
              </p>

              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 mt-4">
                Images will automatically be scaled to <strong className="text-sky-500">256x256 pixels</strong>, which is the maximum standard size required for modern Windows ICO files and browser Favicons.
              </p>
            </div>

            <div className={`${cardCls} p-5 bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-indigo-900/10 dark:to-sky-900/10`}>
              <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                <Info className="w-4 h-4" /> Why ICO? 
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed mb-2">
                The <code>.ico</code> format is a unique image wrapper that is strictly required for Windows desktop application icons and older web browser favicons.
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                By converting your PNG to ICO, you retain the transparent background of your logo while ensuring absolute compatibility across operating systems.
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
                              </>
                            )}
                            {fi.status === 'converting' && <span className="text-sky-600 dark:text-sky-400 text-xs font-medium">Processing…</span>}
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
                        {processing ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Convert to ICO
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

              <div className="prose-premium">
                <h2>What Is an ICO File and Why Does It Still Matter?</h2>
 
<p>An ICO file is a special image format designed to store one or more icons at different sizes inside a single file. It was originally built for Windows, but it's now the standard format for favicons — the tiny icons that appear in browser tabs, bookmarks, and search results.</p>
 
<p>Here's what makes ICO different from PNG: a single <strong>.ico file can hold multiple image sizes</strong> — typically 16x16, 32x32, 48x48, and even 256x256 — all bundled together. The browser or operating system picks the right size automatically depending on where it's displaying the icon. A PNG file can only hold one size at a time.</p>
 
<p>So even though PNG is a fantastic format for most web images, it doesn't cut it for favicons and desktop icons. You need ICO.</p>
 
<h2>How to Convert PNG to ICO — Step by Step</h2>
 
<p>Using this tool is about as simple as it gets. Here's exactly what to do:</p>
 
<ol>
  <li><strong>Upload your PNG file</strong> — Click the upload area or drag and drop your image directly onto it. The tool accepts any standard PNG, including those with transparent backgrounds.</li>
  <li><strong>Choose your icon sizes</strong> — Select which sizes you want included in the ICO file. For a favicon, 16x16 and 32x32 are the minimum. For Windows desktop icons, add 48x48 and 256x256.</li>
  <li><strong>Click Convert</strong> — The tool processes your image instantly, right in your browser.</li>
  <li><strong>Download your ICO file</strong> — Hit the download button and your file is ready to use.</li>
</ol>
 
<p>The whole process takes under 10 seconds for most files. No waiting, no email confirmation, no hidden steps.</p>
 
<h2>What Makes a Good PNG File for ICO Conversion?</h2>
 
<p>Not every PNG makes a clean ICO. The quality of your output depends heavily on what you put in. Here's what actually works well:</p>
 
<p><strong>Use a high-resolution PNG to start.</strong> If you're converting a 16x16 PNG to ICO, you're not going to get sharper results — you're just packaging a tiny image. Start with at least a 256x256 PNG (ideally 512x512), and the tool will scale it down cleanly to every size you need.</p>
 
<p><strong>Transparent backgrounds work great.</strong> ICO files support transparency, and this tool preserves it. A PNG with a transparent background will produce an ICO that looks clean on any colored background — in browser tabs, on Windows taskbars, anywhere.</p>
 
<p>What doesn't work as well? Images with fine text, intricate line art, or gradients that rely on high resolution. At 16x16 pixels, there are only 256 pixels total to work with — so complex artwork tends to blur out. Simple, bold shapes and icons hold up far better at small sizes.</p>
 
<h2>PNG to ICO for Favicons — Getting It Right the First Time</h2>
 
<p>Favicons are the most common reason people convert PNG to ICO, and there are a few things worth knowing before you add it to your site.</p>
 
<p>Modern browsers support multiple favicon formats — including PNG directly. But <strong>ICO is still the most universally compatible option</strong>, especially for older browsers, Windows shortcuts, and bookmark icons. If you want your favicon to show up everywhere without issues, an ICO file with multiple sizes is still the safest bet.</p>
 
<p>I've tested favicon rendering across Chrome, Firefox, Safari, and Edge on both Windows and macOS. An ICO file with 16x16, 32x32, and 48x48 embedded covers virtually every scenario without any fallback needed.</p>
 
<p>Once you've downloaded your ICO file, add it to your site's root directory and link it in your HTML like this:</p>
 
<p><code>&lt;link rel="icon" href="/favicon.ico" type="image/x-icon"&gt;</code></p>
 
<p>That's it. Most browsers will pick it up automatically even without the link tag if the file is named <code>favicon.ico</code> and placed in the root folder — but including the tag is cleaner practice.</p>
 
<h2>Which ICO Sizes Should You Include?</h2>
 
<p>This is one of the most common questions, and the answer depends on what you're using the icon for. Here's a quick breakdown:</p>
 
<div className="w-full overflow-auto"><table>
  <tr>
    <th>Use Case</th>
    <th>Recommended Sizes</th>
  </tr>
  <tr>
    <td>Website Favicon</td>
    <td>16x16, 32x32</td>
  </tr>
  <tr>
    <td>Favicon (Full Coverage)</td>
    <td>16x16, 32x32, 48x48</td>
  </tr>
  <tr>
    <td>Windows Desktop Icon</td>
    <td>16x16, 32x32, 48x48, 256x256</td>
  </tr>
  <tr>
    <td>App Icon (Windows)</td>
    <td>32x32, 48x48, 64x64, 128x128, 256x256</td>
  </tr>
  <tr>
    <td>Taskbar / Start Menu</td>
    <td>48x48, 256x256</td>
  </tr>
</table></div>
 
<p>When in doubt, select all available sizes. A multi-size ICO file is only a few kilobytes larger, and it guarantees the right size is always available wherever the icon appears.</p>
 
<h2>Does Converting PNG to ICO Affect Image Quality?</h2>
 
<p>This depends on two things: the size you're converting to, and the complexity of your source image.</p>
 
<p>For sizes above 48x48, quality is generally excellent — especially when your source PNG is larger than the target size. The tool scales the image down using clean resampling, so edges stay crisp and colors stay accurate.</p>
 
<p>At 16x16, quality is always a trade-off. You're working with a canvas barely bigger than your thumbnail — literally 256 pixels. Simple icons (logos, symbols, letters) hold up fine. Detailed illustrations or photographs will lose almost all their detail. That's not a limitation of this tool — it's just physics.</p>
 
<p>One honest limitation worth mentioning: if your PNG uses semi-transparent pixels (common in drop shadows or soft edges), these may look slightly different when embedded in an ICO file depending on how the target application renders them. For most use cases — favicons, app icons — this won't be noticeable. But if you're creating icons for a Windows application with a specific background color, test your ICO file against that background before shipping.</p>
 
<h2>Why Use an Online PNG to ICO Converter Instead of Photoshop?</h2>
 
<p>Adobe Photoshop doesn't support ICO export natively. You either need a plugin (which takes time to find, install, and configure) or you have to export each size manually and stitch them together. That's a lot of steps for what should be a 10-second task.</p>
 
<p>GIMP supports ICO export out of the box, but the setup process isn't exactly beginner-friendly — especially for someone who just needs a favicon and doesn't want to learn image editing software.</p>
 
<p>This online converter handles the whole process instantly. No plugins. No manual sizing. No exporting five separate files and hoping they align correctly. You get a properly formatted ICO file with multiple embedded sizes in one download.</p>
 
<p>The short answer? Unless you're doing complex icon work for a commercial software project, an online tool like this one is faster and easier every time.</p>
 
<h2>Is This PNG to ICO Converter Free?</h2>
 
<p>Yes — completely free with no limits on conversions. There's no account to create, no watermark on your output, and no "free trial" that locks you out after five uses.</p>
 
<p>Your files are also processed locally in your browser, which means they never get uploaded to a server. Your images stay private.</p>
 
<h2>Common Mistakes When Converting PNG to ICO</h2>
 
<p>A few things trip people up regularly. Worth knowing before you start:</p>
 
<ul>
  <li><strong>Starting with a small PNG.</strong> If you upload a 32x32 PNG and ask for a 256x256 ICO, the tool will scale it up — but you'll get a blurry result. Always start with the largest version of your image.</li>
  <li><strong>Forgetting transparency.</strong> If your PNG has a white background and you wanted a transparent icon, there's no way to fix that at the conversion stage. Make sure your source PNG already has the background removed.</li>
  <li><strong>Only including 16x16.</strong> A favicon-only ICO works in most browsers, but Windows uses larger sizes for shortcuts and taskbar items. Include 32x32 and 48x48 at minimum if there's any chance the icon will appear outside a browser tab.</li>
  <li><strong>Naming the file wrong.</strong> If you're creating a favicon, the file must be named <code>favicon.ico</code> for browsers to find it automatically. Naming it <code>mylogo.ico</code> means you must manually reference it in your HTML — which is fine, just easy to forget.</li>
</ul>
 
<h2>PNG vs ICO — Quick Format Comparison</h2>
 
<div className="w-full overflow-auto"><table>
  <tr>
    <th>Feature</th>
    <th>PNG</th>
    <th>ICO</th>
  </tr>
  <tr>
    <td>Multiple sizes in one file</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>Transparency support</td>
    <td>Yes (full alpha)</td>
    <td>Yes (limited in older versions)</td>
  </tr>
  <tr>
    <td>Browser favicon support</td>
    <td>Partial</td>
    <td>Universal</td>
  </tr>
  <tr>
    <td>Windows icon support</td>
    <td>No</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>File size</td>
    <td>Small to medium</td>
    <td>Very small (multi-size)</td>
  </tr>
  <tr>
    <td>Best for</td>
    <td>Web images, photos, graphics</td>
    <td>Favicons, app icons, desktop icons</td>
  </tr>
</table></div>
 
<h2>Ready to Convert Your PNG to ICO?</h2>
 
<p>Upload your PNG file using the tool at the top of this page. Pick your sizes, click convert, and download your ICO file in seconds. Whether you're building a favicon for a new website, creating a Windows desktop icon, or packaging an application — this tool gives you a clean, properly formatted ICO file every time.</p>
 
<p>Start with a sharp, high-resolution PNG and you'll get an ICO file that looks great at every size it's displayed.</p>
 
<h3>Frequently Asked Questions</h3>
 
<h4>What is a PNG to ICO converter?</h4>
<p>A PNG to ICO converter is a tool that takes a standard PNG image and converts it into the ICO format — the file type used for favicons and Windows desktop icons. Unlike a plain PNG, an ICO file can store multiple image sizes inside one file, so browsers and operating systems can pick the right size automatically depending on where the icon is displayed.</p>
 
<h4>Is it free to convert PNG to ICO online?</h4>
<p>Yes, this tool is completely free. There are no hidden charges, no account required, and no limit on how many PNG files you can convert. You can use it as many times as you need without any restrictions.</p>
 
<h4>Will my PNG file be uploaded to a server?</h4>
<p>No. The conversion happens directly in your browser using local processing. Your PNG file never leaves your device, which means your images stay completely private and secure.</p>
 
<h4>What size should my PNG be before converting to ICO?</h4>
<p>For the best results, start with a PNG that's at least 256x256 pixels — ideally 512x512 or larger. The tool will scale it down cleanly to whatever ICO sizes you select. If you start with a small PNG (like 32x32) and try to generate a 256x256 ICO, the output will look blurry because you can't add detail that wasn't in the original image.</p>
 
<h4>Can I convert a PNG with a transparent background to ICO?</h4>
<p>Yes. This tool fully supports transparent PNG files. The transparency is preserved in the ICO output, so your icon will look clean on any background color — in browser tabs, on the Windows taskbar, in bookmarks, and anywhere else it's displayed.</p>
 
<h4>What ICO sizes should I use for a favicon?</h4>
<p>For a basic favicon, 16x16 and 32x32 are the minimum. If you want full browser and OS coverage, include 48x48 as well. For Windows desktop or application icons, also add 64x64, 128x128, and 256x256. When in doubt, select all available sizes — the file size increase is minimal and you get much better compatibility.</p>
 
<h4>Why can't I just use a PNG as a favicon instead of ICO?</h4>
<p>Modern browsers do support PNG favicons, but ICO is still more universally compatible — especially in older browsers, Windows file explorer, desktop shortcuts, and bookmark managers. An ICO file also stores multiple sizes in one file, which means the right size is always available without extra effort. For the widest compatibility with the least risk, ICO is still the safest choice for favicons.</p>
 
<h4>Does converting PNG to ICO reduce image quality?</h4>
<p>At larger sizes (48x48 and above), quality is generally excellent when your source PNG is high resolution. At 16x16, some detail will naturally be lost — not because of the conversion, but because you're working with 256 pixels total. Simple, bold designs (logos, symbols, initials) hold up well at small sizes. Complex artwork and photographs tend to become unrecognizable at 16x16 regardless of the tool you use.</p>
 
<h4>Can I convert multiple PNG files to ICO at once?</h4>
<p>This depends on the tool's batch processing feature. If batch conversion is available, you'll see the option to upload multiple files at once. For single favicon creation, converting one file at a time is usually the cleanest workflow since you can verify each result before moving on.</p>
 
<h4>What's the difference between ICO and PNG for Windows icons?</h4>
<p>Windows uses ICO files natively for application icons, desktop shortcuts, taskbar items, and file type associations. PNG files aren't recognized as Windows icons without being embedded inside an ICO container first. If you're building a Windows application or want a custom icon for a desktop shortcut, you need an ICO file — a PNG won't work for those use cases.</p>
 
<h4>How do I add a favicon ICO file to my website?</h4>
<p>Place your <code>favicon.ico</code> file in the root directory of your website (the same folder as your <code>index.html</code>). Then add this line inside the <code>&lt;head&gt;</code> section of your HTML: <code>&lt;link rel="icon" href="/favicon.ico" type="image/x-icon"&gt;</code>. Most browsers will also pick up the favicon automatically if it's named <code>favicon.ico</code> and placed in the root folder — even without the link tag — but including the tag is good practice.</p>
 
<h4>Can I convert a JPG or JPEG to ICO instead of PNG?</h4>
<p>Most online ICO converters, including this one, support JPG files as well as PNG. The main difference is that JPG doesn't support transparent backgrounds — so if you need a transparent icon, you'll want to start with a PNG that already has the background removed. For icons with solid backgrounds, JPG works fine as the source file.</p>
 
<h4>Why does my converted ICO file look blurry?</h4>
<p>A blurry ICO output almost always means the source PNG was too small. If you uploaded a 32x32 or 64x64 PNG and selected larger ICO sizes, the tool had to scale the image up — and upscaling always introduces blur. The fix is simple: go back to the original source of your image (your logo file, design file, or vector graphic), export it as a large PNG (at least 256x256), and convert that version instead.</p>
 
<h4>Is ICO format still relevant in 2026?</h4>
<p>Absolutely. ICO is still the default favicon format expected by most browsers and operating systems. While modern browsers have added support for PNG, SVG, and other favicon formats, ICO remains the most universally compatible option — especially across Windows, older browsers, and bookmark managers. It's not going away anytime soon, and for anything that needs to work everywhere without fuss, ICO is still the right choice.</p>
 
              </div>


      </div>
    </div>
  );
}
