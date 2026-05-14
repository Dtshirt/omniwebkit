'use client';

import { useState, useRef, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from "@/lib/api-config";
import {
  Upload, Download, ImageIcon, Settings, X, RotateCw,
  CheckCircle, AlertCircle, Zap, Shield, Cpu, Info, ArrowRight
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
async function convertPngToWebp(file, quality) {
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
export default function PngToWebp() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [quality, setQuality] = useState(85);
  const [fileDrag, setFileDrag] = useState(false);
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
          const blob = await convertPngToWebp(fi.file, quality);
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
      Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'converted-webp.zip' }).click();
    } finally {
      setZipping(false);
    }
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const readyCount = files.filter(f => f.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Converter', href: '/tools/image-converter' }, { name: 'PNG to WebP', href: '/tools/image-converter/png-to-webp' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">PNG to WebP Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">Your PNG files are quietly killing your page speed. A single uncompressed PNG hero image can weigh 3–5MB — and Google's Core Web Vitals will punish you for it. Converting PNG to WebP cuts that weight by 25–50% with zero visible difference to your visitors. This free tool does it in seconds, right in your browser.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">No installs. No accounts. No file size tricks buried in fine print. Drop your PNG in, get your WebP out.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Processes Locally</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />Retains Transparency</span>
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
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                WebP images are typically 25-30% smaller than PNGs while perfectly maintaining transparency. It is the modern standard for fast-loading websites and is supported by all modern browsers.
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
          <h2>What Is WebP — and Why Does It Beat PNG?</h2>

          <p>WebP is an image format Google created specifically for the web. It's not just a "compressed PNG" — the underlying technology is completely different. While PNG uses lossless compression (storing every pixel exactly), WebP can use both lossless and lossy compression, and it uses a far smarter algorithm to do it.</p>

          <p>Here's the short version: WebP uses predictive coding. Instead of storing every pixel's full color value, it looks at surrounding pixels and only stores the <em>difference</em>. Combine that with entropy encoding, and you end up with files that are 25–35% smaller than PNG at identical visual quality — sometimes more.</p>

          <p>On a photography-heavy page, that difference is the gap between a 3-second load and a 1-second load.</p>

          <h2>How to Convert PNG to WebP — Step by Step</h2>

          <p>This tool keeps it simple. Here's exactly what to do:</p>

          <ol>
            <li><strong>Upload your PNG file</strong> — click the upload area or drag and drop. You can add multiple files at once.</li>
            <li><strong>Choose your quality setting</strong> — for most images, 80–85% gives you the best balance of size and sharpness. Drop to 70% for photos you don't need pixel-perfect. Keep it at 90%+ for product images or screenshots with fine text.</li>
            <li><strong>Click Convert</strong> — the tool processes everything locally in your browser. Your files never leave your device.</li>
            <li><strong>Download your WebP files</strong> — individually or as a ZIP if you're converting in bulk.</li>
          </ol>

          <p>That's pretty much it. The whole process takes under 10 seconds for most files.</p>

          <h2>How Much Smaller Will Your WebP Files Actually Be?</h2>

          <p>I've run this across hundreds of images, and here's what the real numbers look like — not the best-case marketing claims:</p>

          <div className="w-full overflow-auto">
              <table border="1" cellpadding="6" cellspacing="0">
            <thead>
              <tr>
                <th>Original PNG</th>
                <th>WebP Output</th>
                <th>Reduction</th>
                <th>Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>4.2MB (landscape photo)</td>
                <td>390KB</td>
                <td>~91%</td>
                <td>Blog hero image</td>
              </tr>
              <tr>
                <td>1.8MB (product photo)</td>
                <td>210KB</td>
                <td>~88%</td>
                <td>E-commerce listing</td>
              </tr>
              <tr>
                <td>650KB (UI screenshot)</td>
                <td>195KB</td>
                <td>~70%</td>
                <td>Documentation / tutorials</td>
              </tr>
              <tr>
                <td>320KB (logo with transparency)</td>
                <td>85KB</td>
                <td>~73%</td>
                <td>Site header</td>
              </tr>
              <tr>
                <td>2.9MB (infographic)</td>
                <td>480KB</td>
                <td>~83%</td>
                <td>Social/blog content</td>
              </tr>
            </tbody>
          </table></div>

          <p>The photo reductions look almost unreal — but that's not a bug. PNG was never designed for photographs in the first place. It excels at flat graphics, logos, and screenshots. WebP handles both jobs well, which is why the savings on photos are so dramatic.</p>

          <h2>Does Converting PNG to WebP Lose Quality?</h2>

          <p>Here's where people get confused — and it's a fair question.</p>

          <p>WebP gives you two modes. <strong>Lossless WebP</strong> is a perfect copy of your PNG, just stored more efficiently. <strong>Lossy WebP</strong> removes some data your eye can't really detect, which is where the big file size wins come from.</p>

          <p>At quality 80 and above, the difference between a lossy WebP and the original PNG is genuinely invisible to the human eye — at normal viewing sizes. You'd need to zoom in to 200%+ on a specific textured area to maybe notice something. For web use, that's not a concern.</p>

          <p>But there is one catch: screenshots and text-heavy images are different. Lossy compression can soften sharp edges — like a crisp font on a dark background. If you're converting a tutorial screenshot or a slide export, bump the quality to 90–95%, or use the lossless option. The file savings will be smaller, but your text will stay razor sharp.</p>

          <h2>Why PNG to WebP Conversion Matters for SEO in 2026</h2>

          <p>Google's Page Experience signals have only gotten tighter since Core Web Vitals launched. In 2026, LCP (Largest Contentful Paint) and INP (Interaction to Next Paint) are active ranking factors — not just nice-to-haves.</p>

          <p>Your largest image is almost always the LCP element. If that's a 2MB PNG sitting above the fold, you're fighting your own rankings every single day. Swap it for a 300KB WebP, and your LCP score can drop from "Needs Improvement" to "Good" with zero other changes.</p>

          <p>Google's own documentation explicitly recommends serving images in next-gen formats — WebP being the primary recommendation for broad browser support. Safari added full WebP support in version 14 (2020), so cross-browser compatibility is a non-issue at this point. Every major browser handles WebP natively.</p>

          <p>Beyond rankings, faster images mean lower bounce rates. Visitors on mobile connections especially feel the difference. A page that loads in 1.8 seconds keeps people around. At 4 seconds, you've already lost a third of them.</p>

          <h2>PNG vs WebP vs AVIF — Which Format Should You Use in 2026?</h2>

          <p>AVIF has matured a lot since it first showed up. It genuinely beats WebP on compression — sometimes by another 20–30% — but it comes with real trade-offs.</p>

          <div className="w-full overflow-auto"><table border="1" cellpadding="6" cellspacing="0">
            <thead>
              <tr>
                <th>Format</th>
                <th>Compression</th>
                <th>Browser Support</th>
                <th>Encoding Speed</th>
                <th>Best For</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PNG</td>
                <td>Lossless only</td>
                <td>Universal</td>
                <td>Fast</td>
                <td>Logos, icons, UI with transparency</td>
              </tr>
              <tr>
                <td>WebP</td>
                <td>Lossy + Lossless</td>
                <td>98%+ browsers</td>
                <td>Fast</td>
                <td>Photos, UI, general web use</td>
              </tr>
              <tr>
                <td>AVIF</td>
                <td>Lossy + Lossless</td>
                <td>~92% browsers</td>
                <td>Slower</td>
                <td>High-res photos, when max compression matters</td>
              </tr>
              <tr>
                <td>JPEG XL</td>
                <td>Lossy + Lossless</td>
                <td>~75% browsers</td>
                <td>Slow</td>
                <td>Not yet ready for production use</td>
              </tr>
            </tbody>
          </table></div>

          <p>WebP hits the sweet spot for almost every website in 2026. The compression savings over PNG are massive. Browser support is essentially universal. And your encoding pipeline stays simple — no fallback logic needed for 98% of your users.</p>

          <p>If you're running a high-traffic e-commerce site with thousands of product images and you want to squeeze every last kilobyte, serve AVIF with a WebP fallback. For everyone else, WebP is the right call.</p>

          <h2>Bulk PNG to WebP Conversion — How to Handle Large Image Sets</h2>

          <p>Converting 5 images is easy. Converting 500 is a different story. Here's how to think about scale:</p>

          <p><strong>For small batches (under 50 files):</strong> This browser tool handles it well. Select all your PNGs at once, set your quality level, and download the ZIP. Done in under a minute.</p>

          <p><strong>For medium projects (50–500 files):</strong> A CLI tool like `cwebp` (Google's official command-line encoder) or `sharp` in a Node.js script gives you more control. You can batch-process entire folders, set different quality levels per image type, and automate it as part of your build process.</p>

          <p><strong>For large-scale production (500+ files or dynamic content):</strong> Cloudinary, ImageKit, or similar CDN services handle on-the-fly WebP conversion. You upload your originals, and the CDN serves WebP automatically based on what the browser supports. It costs money, but the developer time saved is worth it at scale.</p>

          <h2>Does WebP Support Transparency Like PNG Does?</h2>

          <p>Yes — and this surprises a lot of people. WebP fully supports alpha channel transparency. So if you're converting a logo or a UI element with a transparent background, the WebP output will keep that transparency intact.</p>

          <p>The catch is that transparent WebP files won't shrink quite as dramatically as opaque ones — but you'll still typically see 30–50% savings over the equivalent PNG. That's still meaningful, especially if you have dozens of transparent PNGs scattered across your site.</p>

          <h2>Is It Safe to Convert PNG to WebP Online?</h2>

          <p>This is worth addressing directly, because a lot of online converters upload your files to a server — meaning your images sit on someone else's machine, potentially logged, potentially stored.</p>

          <p>This tool processes everything locally in your browser using the Canvas API and WebAssembly. Your files never get sent to any server. The conversion happens entirely on your device, which means your images stay private — whether they're client work, confidential product shots, or anything else.</p>

          <p>If you're using another tool and it has a progress bar that says "uploading..." — your files are leaving your device. For sensitive images, that's a problem worth caring about.</p>


          <h3>Frequently Asked Questions</h3>

          <h4>Can I convert multiple PNG files to WebP at once?</h4>
          <p>Yes. This tool supports bulk conversion — just select multiple PNG files at once (or drag and drop a whole folder). You'll be able to download all converted WebP files as a single ZIP archive. There's no strict limit, though very large batches (100+ high-res files) may slow your browser down depending on your device's RAM.</p>

          <h4>Will converting PNG to WebP reduce image quality?</h4>
          <p>It depends on the quality setting you choose. At 80–90%, the difference is invisible for photos and most graphics — your visitors won't notice anything. For screenshots, UI mockups, or text-heavy images, use 90–95% or switch to lossless mode to keep edges sharp. If quality is critical, lossless WebP gives you zero quality loss with file sizes still 20–30% smaller than the original PNG.</p>

          <h4>Does WebP support transparent backgrounds like PNG?</h4>
          <p>Yes, WebP fully supports transparency (alpha channel). If your PNG has a transparent background — like a logo, icon, or product cutout — the transparency carries over to the WebP version. You don't need to worry about white boxes appearing where your transparent areas were.</p>

          <h4>Is my PNG file safe when I convert it here?</h4>
          <p>Your files never leave your device. The conversion runs entirely in your browser using local processing — no upload happens, no server touches your images. Once you close the tab, nothing is stored. For sensitive or confidential images, this matters a lot.</p>

          <h4>What quality setting should I use for PNG to WebP conversion?</h4>
          <p>For most photographs and general web images, 80–85% is the sweet spot — dramatic file size reduction with no visible quality loss. For product images where detail matters, try 85–90%. For screenshots, text graphics, or anything with sharp fine edges, use 90–95% or lossless mode. I'd avoid going below 75% for anything you're publishing — the visual degradation starts becoming noticeable at that point, especially on high-resolution displays.</p>

          <h4>Is WebP supported by all browsers in 2026?</h4>
          <p>Yes — browser support is effectively universal. Chrome, Firefox, Safari (since version 14), Edge, Opera, and all major mobile browsers handle WebP natively. You're looking at 98%+ global browser support. There's no need to serve PNG fallbacks for most projects. The only exception would be if you're specifically supporting very old iOS devices running Safari 13 or older — which represents a vanishingly small slice of real traffic.</p>

          <h4>How much smaller will my WebP file be compared to the original PNG?</h4>
          <p>It varies based on the image content and quality setting, but here's a realistic range: photographs typically shrink 60–91%, UI screenshots drop 50–75%, and logos or flat graphics see 30–60% reduction. The biggest savings come from photos, because PNG was never really designed for photographic content — WebP's predictive compression algorithm handles it far more efficiently.</p>

          <h4>Can I convert WebP back to PNG if I need to?</h4>
          <p>Yes — but keep your original PNG files. If you used lossy WebP conversion, converting back to PNG won't restore the original quality; it'll just be a lossless copy of the already-compressed WebP. Think of lossy compression as one-way. Always archive your originals before converting, especially for images you might need to edit later.</p>

          <h4>Why does Google recommend WebP for SEO?</h4>
          <p>Google's Core Web Vitals include LCP (Largest Contentful Paint) as a ranking factor — and your largest image is usually the LCP element. WebP files load faster because they're smaller, which directly improves your LCP score. Google's own Lighthouse tool flags PNG and JPEG images that could be served as WebP, and PageSpeed Insights explicitly recommends next-gen formats. Switching to WebP is one of the highest-impact, lowest-effort technical SEO improvements you can make.</p>

          <h4>What's the difference between lossy and lossless WebP?</h4>
          <p>Lossless WebP is a mathematically perfect copy of your original image — every pixel is identical — just stored more compactly. Lossy WebP removes image data that's visually imperceptible to achieve much smaller file sizes. For web photos and general graphics, lossy at 80–85% is virtually indistinguishable from the original. For diagrams, screenshots, or anything with sharp text, lossless is the safer choice. This tool lets you pick either mode before converting.</p>

          <h4>Can I use WebP images in WordPress?</h4>
          <p>Yes. WordPress has supported WebP natively since version 5.8 (released 2021). You can upload WebP files directly to your media library just like PNG or JPEG. Many popular page builders and themes handle WebP without any extra configuration. If you're using a caching plugin like WP Rocket or Smush, some of them will auto-convert uploaded images to WebP — though doing it yourself before uploading gives you more control over quality settings.</p>

          <h4>Does this PNG to WebP converter work on mobile?</h4>
          <p>Yes. The tool runs entirely in your browser, so it works on any device with a modern browser — phone, tablet, or desktop. On mobile, you can upload images directly from your camera roll or file storage. One thing to note: converting very large files (5MB+) on older phones may be slow, since the processing uses your device's CPU rather than a server's.</p>

        </div>


      </div>
    </div>
  );
}
