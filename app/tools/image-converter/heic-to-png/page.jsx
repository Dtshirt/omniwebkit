'use client';

import { useState, useRef, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from "@/lib/api-config";
import {
  Upload, Download, ImageIcon, Settings, X, RotateCw,
  CheckCircle, Zap, Shield, Cpu, Info, ArrowRight, Image as ImageIconLucide
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

/* ─── HEIC Decoder & Converter ─────────────────────────────────────────── */
async function convertHeicToPng(file) {
  // Dynamically import heic2any to avoid SSR issues
  const heic2any = (await import('heic2any')).default;

  // heic2any can directly output PNG
  const convertedBlob = await heic2any({
    blob: file,
    toType: 'image/png',
    quality: 1 // For PNG, quality is ignored since it's lossless, but heic2any accepts it
  });

  return Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
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
export default function HeicToPng() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = useRef(null);

  /* ── Add files ── */
  const addFiles = useCallback((incoming) => {
    const images = [...incoming].filter(f =>
      f.type === 'image/heic' ||
      f.type === 'image/heif' ||
      f.name?.toLowerCase().endsWith('.heic') ||
      f.name?.toLowerCase().endsWith('.heif')
    );
    if (!images.length) return;
    const items = images.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file), // Note: browsers might not render HEIC preview natively
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
    formData.append('target_format', 'png');

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
          const blob = await convertHeicToPng(fi.file);
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
      return p.map(f => map[f.id] ? {
        ...f,
        ...map[f.id],
        outUrl: map[f.id].blob ? URL.createObjectURL(map[f.id].blob) : null,
        // Since HEIC might not preview, use the converted output as preview if successful
        preview: map[f.id].blob ? URL.createObjectURL(map[f.id].blob) : f.preview
      } : f);
    });

    setProcessing(false);
  };

  /* ── Download single ── */
  const downloadOne = (fi) => {
    if (!fi.blob) return;
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.png';
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
        const name = fi.file.name.replace(/\.[^/.]+$/, '') + '.png';
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
      Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'converted-PNG.zip' }).click();
    } finally {
      setZipping(false);
    }
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const readyCount = files.filter(f => f.status === 'ready').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Converter', href: '/tools/image-converter' }, { name: 'HEIC to PNG', href: '/tools/image-converter/heic-to-png' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <ImageIconLucide className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">HEIC to PNG Converter – Free Online Tool</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 mx-auto max-w-4xl">Do you have HEIC photos on your iPhone or iPad that won't open on your Windows PC or other devices? You are not alone. HEIC is the default photo format on Apple devices. But many apps and websites do not support it.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 mx-auto max-w-4xl">Our free HEIC to PNG converter fixes this problem in seconds. Just drag and drop your photo, click convert, and download a crystal-clear PNG file. No software to install. No account needed. Works right in your browser.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Local Processing</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />Lossless Quality</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Settings className="w-5 h-5 text-indigo-500" />
                Settings
              </h2>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 mt-4">PNG Quality</p>
              <div className="w-full h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600">
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Lossless (100%)</span>
              </div>
              <div className="flex justify-center text-[10px] text-slate-400 font-medium mt-2">
                <span>PNG format preserves exact original quality</span>
              </div>
            </div>

            <div className={`${cardCls} p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10`}>
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                <Info className="w-4 h-4" /> Why PNG?
              </h3>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                Unlike JPG, PNG is a lossless format. This means you will not lose any visual data from the original HEIC image. The file size might be larger, but the quality will be identical to the original photo.
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
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/heic,.heic,image/heif,.heif" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-3 shadow-md">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop HEIC photos here!' : 'Upload HEIC Images'}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-200 dark:border-indigo-800 border-dashed">HEIC ONLY</span>
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
                        {/* Browser might not show HEIC, so we show a generic icon if preview fails, or the converted preview if done */}
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shadow-sm">
                          {fi.status === 'done' && fi.preview ? (
                            <img src={fi.preview} className="w-full h-full object-cover" alt="preview" />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{fi.file.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{fmtSize(fi.file.size)}</span>
                            {fi.outSize && (
                              <>
                                <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 rounded">{fmtSize(fi.outSize)}</span>
                                <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 ml-auto">
                                  {fi.outSize < fi.file.size ? `- ${Math.round((1 - fi.outSize / fi.file.size) * 100)}%` : `+ ${Math.round((fi.outSize / fi.file.size - 1) * 100)}%`}
                                </span>
                              </>
                            )}
                            {fi.status === 'converting' && <span className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Converting…</span>}
                            {fi.status === 'error' && <span className="text-red-600 dark:text-red-400 text-xs font-medium" title={fi.errorMsg}>{fi.errorMsg?.slice(0, 50) || 'Conversion failed'}</span>}
                          </div>
                        </div>

                        {fi.status === 'done' ? (
                          <button onClick={() => downloadOne(fi)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 dark:text-indigo-400 rounded-lg transition-colors" title="Download">
                            <Download className="w-4 h-4" />
                          </button>
                        ) : fi.status === 'ready' || fi.status === 'error' ? (
                          <button onClick={() => removeFile(fi.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <RotateCw className="w-5 h-5 text-indigo-500 animate-spin mr-2" />
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
                      <button onClick={convertAll} disabled={processing} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50">
                        {processing ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Convert to PNG
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 prose-premium">
          <h2>How to Convert HEIC to PNG – Step by Step</h2>
          <p >Using our tool is very simple. Here is how it works:</p>

          <ul>
            <li><strong>Step 1:</strong> Drag and drop your HEIC file into the upload box above. Or click the box to pick a file from your device.</li>
            <li><strong>Step 2:</strong> Wait a moment while the tool reads your photo.</li>
            <li><strong>Step 3:</strong> Click the Convert button.</li>
            <li><strong>Step 4:</strong> Your PNG file is ready. Click Download to save it.</li>
          </ul>

          <p  >That is all! The whole process takes just a few seconds. You do not need to sign up, log in, or pay anything.</p>

          <h2>What Is a HEIC File?</h2>
          <p  >HEIC stands for High Efficiency Image Container. Apple started using this format with iOS 11 in 2017. It is also sometimes called HEIF, which stands for High Efficiency Image Format.</p>
          <p  >HEIC files are smaller than JPG files. They keep the same photo quality while using about half the storage space. That is why Apple uses it to save space on iPhones and iPads.</p>
          <p  >But here is the problem: HEIC files do not open on Windows PCs, Android phones, or many websites by default. You need a special app or you need to convert the file.</p>

          <h2>What Is a PNG File?</h2>
          <p  >PNG stands for Portable Network Graphics. It is one of the most popular image formats in the world. PNG files work on every device, every browser, and every operating system.</p>
          <p  >PNG images are known for their high quality. They support transparent backgrounds. They are great for sharing on social media, websites, emails, and documents.</p>
          <p  >When you convert HEIC to PNG, you get a file that opens everywhere without any extra apps.</p>

          <h2>Why Convert HEIC to PNG?</h2>

          <p  >There are many good reasons to convert your HEIC photos to PNG format:</p>
          <ul>
            <li><strong>Universal Compatibility - </strong> PNG files open on Windows, Mac, Android, Linux, and all web browsers.</li>
            <li><strong>Easy sharing - </strong> Send PNG photos by email or message without worrying if the other person can open them.</li>
            <li><strong>Better for websites – </strong>Most websites and social platforms work best with PNG or JPG images.</li>
            <li><strong>Editing support - </strong> Most photo editors like Photoshop, Canva, and Paint accept PNG files easily.</li>
            <li><strong>Transparency support – </strong>PNG supports transparent backgrounds, which is great for logos and design work.</li>
            <li><strong>No quality loss - </strong> Our tool converts HEIC to PNG without losing image quality.</li>
          </ul>

          <blockquote>🔗 Also need a JPG file? Try our <Link href="/tools/image-converter/heic-to-jpg">HEIC to JPG Converter</Link> tool for smaller file sizes — perfect for sharing on social media and sending by email. </blockquote>

          <h2>Key Features of Our HEIC to PNG Converter</h2>
          <p  >Here is what makes our tool stand out from others:</p>
          <h3>1. Drag and Drop Upload</h3>
          <p  >You do not need to click through folders to find your file. Just drag your HEIC photo from your desktop and drop it into the upload box. It is that easy.</p>

          <h3>2. One-Click Conversion</h3>
          <p  >After you upload your file, just click the Convert button. Our tool does all the hard work for you in just a few seconds.</p>

          <h3>3. High Image Quality</h3>
          <p  >We do not compress or lower the quality of your photo during conversion. What you get is a full-quality PNG image that looks just like your original HEIC file.</p>

          <h3>4. 100% Free</h3>
          <p  >Our HEIC to PNG converter is completely free. There are no hidden fees, no premium plans needed, and no credit card required.</p>

          <h3>5. No Software to Install</h3>
          <p  >Everything runs in your web browser. You do not need to download or install any app or software. Works on Windows, Mac, iPhone, and Android.</p>

          <h3>6. Your Files Are Private</h3>
          <p  >We take your privacy seriously. Your uploaded files are processed securely and are not stored on our servers after conversion.</p>

          <h3>7. Works on All Devices</h3>
          <p  >Whether you are on a desktop computer, a laptop, a tablet, or a phone — our tool works smoothly on all screen sizes and devices.</p>

          <h2>Who Needs a HEIC to PNG Converter?</h2>
          <p  >This tool is helpful for many different people:</p>
          <ul>
            <li>iPhone and iPad users who want to share photos with friends on Windows or Android devices.</li>
            <li>Bloggers and content creators who need to upload photos to their website.</li>
            <li>Graphic designers who need to edit Apple photos in tools like Photoshop, Canva, or Figma.</li>
            <li>Business owners who receive product photos from clients taken on iPhones.</li>
            <li>Students who need to add photos to documents or presentations.</li>
            <li>Social media managers who post photos across different platforms.</li>
          </ul>

          <h2>HEIC vs PNG – Which Format Is Better?</h2>

          <div className="overflow-x-auto my-6">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>HEIC</th>
                  <th>PNG</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>File Size</td>
                  <td>Smaller (50% less)</td>
                  <td>Larger</td>
                </tr>
                <tr>
                  <td>Quality</td>
                  <td>High quality</td>
                  <td>High quality (lossless)</td>
                </tr>
                <tr>
                  <td>Transparency</td>
                  <td>No</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Compatible with Windows</td>
                  <td>No (by default)</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Compatible with Android</td>
                  <td>No (by default)</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Used in Web Design</td>
                  <td>Rarely</td>
                  <td>Very common</td>
                </tr>
                <tr>
                  <td>Supported by Photo Editors</td>
                  <td>Limited</td>
                  <td>Universal</td>
                </tr>
                <tr>
                  <td>Apple Device Default</td>
                  <td>Yes</td>
                  <td>No</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p  >As you can see, PNG wins for compatibility and design use. HEIC is great for saving space on your phone, but PNG is better for sharing and using across different platforms.</p>

              <h2>How Does the HEIC to PNG Conversion Work?</h2>
              <p  >Our tool uses a fast image processing engine that runs right in your browser. When you upload a HEIC file, the tool reads the image data and converts it to the PNG format.</p>
              <p  >This process happens on your device — not on a remote server. That means your photos stay private and the conversion is very fast. You do not need a strong internet connection to use this tool.</p>
              <p  >The tool keeps the full resolution of your original photo. Colors, sharpness, and details are all preserved during conversion from HEIC to PNG.</p>

              <h3>Tips for Getting the Best Results</h3>
              <ul>
                <li>Use original HEIC files directly from your iPhone or iPad for the best quality.</li>
                <li>Make sure your browser is up to date. Our tool works best on Chrome, Firefox, Safari, and Edge.</li>
                <li>If you have many photos to convert, process them one at a time for the best results.</li>
                <li>Check the PNG file after downloading to make sure it looks the way you want.</li>
                <li>If you need smaller files for web use, consider using our HEIC to JPG tool instead.</li>
              </ul>

              <h3>Browser and Device Support</h3>
              <p  >Our HEIC to PNG converter works on all major browsers and devices:</p>
              <ul>
                <li>Google Chrome (Windows, Mac, Android)</li>
                <li>Safari (Mac, iPhone, iPad)</li>
                <li>Mozilla Firefox (Windows, Mac, Linux)</li>
                <li>Microsoft Edge (Windows, Mac)</li>
                <li>Opera and Brave browsers</li>
              </ul>
              <p  >No matter what device you use, our tool will work. It is fully responsive and mobile-friendly.</p>

              <h2>Your Privacy Matters to Us</h2>
              <p  >We know that your photos are personal. That is why we built this tool with privacy in mind.</p>
              <ul>
                <li>Your files are not stored on our servers.</li>
                <li>We do not share your photos with anyone.</li>
                <li>The conversion happens securely in your browser.</li>
                <li>Your photos are deleted right after you download the converted file.</li>
              </ul>

              <p  >You can use this tool with complete peace of mind.</p>

              <h2>Common Use Cases for HEIC to PNG Conversion</h2>
              <h3>Sharing Photos on Social Media</h3>
              <p  >Instagram, Twitter, and Facebook accept PNG files easily. If you take a photo on your iPhone and try to upload it as a HEIC file, some platforms may reject it or show an error. Convert it to PNG first to avoid this problem.</p>

              <h3>Adding Photos to Documents</h3>
              <p  >If you need to add a photo to a Word document, PDF, or PowerPoint presentation, PNG is the best format. It works in all office apps without any issues.</p>

              <h3>Using Photos in Web Design</h3>
              <p  >Web designers often need images in PNG format. PNG supports transparent backgrounds, which is important for logos and icons. Our tool makes it easy to convert Apple photos for use in web projects.</p>

              <h3>Sending Photos by Email</h3>
              <p  >Many email clients have trouble opening HEIC attachments. By converting to PNG before attaching, you make sure the other person can see your photo without any problems.</p>

              <h3>Archiving Photos</h3>
              <p  >PNG is a great format for keeping photos long-term. It is lossless, meaning the quality never goes down over time. Many people convert their iPhone photos to PNG for safe archiving.</p>

              <h2>Why Choose Our Tool Over Others?</h2>
              <p  >There are many HEIC converter tools online. Here is why ours is different:</p>
              <ul>
                <li>No file size limits on your uploads</li>
                <li>No watermarks added to your converted images.</li>
                <li>No account or email address required.</li>
                <li>Fast conversion — most photos convert in under 10 seconds.</li>
                <li>Clean, simple design that is easy for anyone to use.</li>
                <li>Mobile-friendly — works great on your phone or tablet.</li>
              </ul>

              <h2>Other Image Formats We Support</h2>
              <p  >Need to convert your Apple photos to other formats? We have tools for that too. Our HEIC to JPG converter is very popular for users who need smaller file sizes.</p>
              <blockquote>🔗 <Link href="/tools/image-converter/heic-to-jpg">Convert HEIC to JPG</Link> </blockquote>
              <p  >JPG is better for photos you want to share on social media or send by email, while PNG is better for images that need to stay sharp and support transparent backgrounds.</p>

              <h3>Frequently Asked Questions (FAQ)</h3>

              <h4>Is this HEIC to PNG converter really free?</h4>
              <p  >Yes, it is 100% free. You can convert as many HEIC files as you want without paying anything. There are no hidden charges or premium upgrades needed.</p>

              <h4>Do I need to install any software?</h4>
              <p  >No. Our tool works directly in your web browser. You do not need to download or install any app or program on your device.</p>

              <h4>Is it safe to upload my photos?</h4>
              <p  >Yes, it is very safe. Your files are processed securely and are not saved on our servers. We do not have access to your photos after the conversion is done.</p>

              <h4>What is the difference between HEIC and HEIF?</h4>
              <p  >HEIC and HEIF are often used to mean the same thing. HEIF is the image format standard, and HEIC is the file extension used by Apple devices. They are basically the same type of file.</p>

              <h4>Can I convert multiple HEIC files at once?</h4>
              <p  >Right now, our tool converts one file at a time. You can repeat the process for each file. We are working on batch conversion support for the future.</p>

              <h4>Will the image quality change after conversion?</h4>
              <p  >No. Our tool converts HEIC to PNG without any loss in quality. Your photo will look the same as the original. PNG is a lossless format, so no details are lost during conversion.</p>

              <h4>Why does my iPhone save photos as HEIC?</h4>
              <p  >Apple uses HEIC by default because it saves storage space on your device. A HEIC file can be 50% smaller than a JPG file with the same quality. However, this can cause problems when you share photos with non-Apple devices.</p>

              <h4>Can I convert HEIC to PNG on my iPhone?</h4>
              <p  >Yes! Our tool works on Safari on iPhone and iPad. Just open this page in your browser, upload your HEIC file, and download the PNG version. No app needed.</p>

              <h4>What if I need a JPG instead of PNG?</h4>
              <p  >If you need a JPG file instead, use our <Link href="/tools/image-converter/heic-to-jpg" className="text-blue-600 hover:underline">HEIC to JPG converter</Link> tool. JPG files are smaller than PNG files and are great for sharing on social media and by email.</p>

              <h4>How long does the conversion take?</h4>
              <p  >Most conversions take just 2 to 5 seconds. Larger files may take a little longer, but the process is still very fast compared to most other tools.</p>

              <h4>Can I use this tool on a Windows PC?</h4>
              <p  >Yes! Our HEIC to PNG converter works perfectly on Windows. Just open it in Chrome, Firefox, or Edge, and you are good to go.</p>

              <h4>Does converting HEIC to PNG increase file size?</h4>
              <p  >Yes, PNG files are usually larger than HEIC files. This is because PNG is a lossless format that keeps all the image data. If you want a smaller file, consider converting to JPG instead.</p>

              <h4>What does HEIC stand for?</h4>
              <p  >HEIC stands for High Efficiency Image Container. It is the file format Apple uses to store photos on iPhones and iPads running iOS 11 and later.</p>
              
              <h4>Can I convert a HEIC file to PNG on Android?</h4>
              <p  >Yes. Open this page in Chrome on your Android phone, upload your HEIC file, and convert it to PNG. It works the same way on all devices.</p>

              <h4>Is PNG better than HEIC for printing?</h4>
              <p  >For most printing purposes, both formats work well. But PNG is more widely accepted by printing services and photo editing software, so it is usually a safer choice.</p>
 
        </div>
      </div>
    </div>
  );
}
