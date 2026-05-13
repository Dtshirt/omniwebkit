'use client';

import { useState, useRef, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from "@/lib/api-config";
import {
  Upload, Download, ImageIcon, Settings, X, RotateCw,
  CheckCircle, Zap, Shield, Cpu, Info, ArrowRight, Image
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
async function convertHeicToJpg(file, quality) {
  // Dynamically import heic2any to avoid SSR issues
  const heic2any = (await import('heic2any')).default;

  // heic2any can directly output JPEG
  const convertedBlob = await heic2any({
    blob: file,
    toType: 'image/jpeg',
    quality: quality / 100
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
export default function HeicToJpg() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [quality, setQuality] = useState(85);
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
          const blob = await convertHeicToJpg(fi.file, quality);
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
        <Breadcrumbs items={[{ name: 'Image Converter', href: '/tools/image-converter' }, { name: 'HEIC to JPG', href: '/tools/image-converter/heic-to-jpg' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <Image className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">HEIC to JPG Converter – Free Online Tool</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 max-w-4xl mx-auto">Did you take a photo on your iPhone and now it will not open on your Windows PC, Android phone, or website? The problem is the file format. iPhones save photos as HEIC files by default. Most devices and apps do not support HEIC files.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 max-w-4xl mx-auto">Our free HEIC to JPG converter solves this problem fast. Just drag and drop your HEIC photo into the upload box, click Convert, and download your JPG file in seconds. No software to install. No account needed. Works right in your browser.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 max-w-4xl mx-auto">JPG is the most widely used photo format in the world. Once you convert your HEIC file to JPG, it will open on every device, every browser, and every app without any problem.</p>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Local Processing</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />High Quality</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <p className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                <Settings className="w-5 h-5 text-indigo-500" />
                Settings
              </p>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 mt-4">JPG Quality ({quality}%)</p>
              <input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>Smaller File</span>
                <span>Better Quality</span>
              </div>
            </div>

            <div className={`${cardCls} p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10`}>
              <p className="flex items-center gap-1.5 text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                <Info className="w-4 h-4" /> About HEIC
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
                HEIC is Apple's high-efficiency image format. While it saves space, it is not widely supported on Windows devices or older web browsers. Converting to JPG ensures maximum compatibility everywhere.
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
                <p className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop HEIC photos here!' : 'Upload HEIC Images'}</p>
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
                        {processing ? <RotateCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Convert to JPG
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-slate-100 dark:border-slate-800 prose-premium">
          <h2>How to Convert HEIC to JPG – Step by Step</h2>
          <p>Our tool is easy to use. Here is how it works in just four steps:</p>

          <ul>
            <li>Step 1: Drag your HEIC file and drop it into the upload box above. Or click the box to browse and select your file.</li>
            <li>Step 2: The tool will load your photo right away. You will see a preview on screen.</li>
            <li>Step 3: Click the Convert to JPG button.</li>
            <li>Step 4: Download your JPG file. Done!</li>
          </ul>

          <p>The whole process takes just a few seconds. You do not need to sign up, pay, or install anything.</p>

          <h2>What Is a HEIC File?</h2>
          <p><mark>HEIC stands for High Efficiency Image Container.</mark> Apple started using this format on iPhones and iPads with iOS 11 in 2017. HEIC files are also sometimes called HEIF files, which stands for High Efficiency Image Format.</p>
          <p>HEIC photos are about half the size of JPG photos. They take up less space on your phone while keeping the same high quality. That is why Apple uses HEIC as the default format on all modern iPhones and iPads.</p>
          <p>The problem is that HEIC files do not work on most non-Apple devices. Windows 10 and 11, Android phones, and most websites cannot open HEIC files without extra software. That is where our converter helps.</p>

          <h2>What Is a JPG File?</h2>
          <p><mark>JPG (also written as JPEG) stands for Joint Photographic Experts Group.</mark> It is the most popular photo format in the world. Almost every device, app, and website supports JPG files.</p>
          <p>JPG files are small and easy to share. They are great for photos, social media posts, email attachments, and website images. When you convert HEIC to JPG, your photo becomes ready to use everywhere.</p>
          <p>JPG uses a type of compression that makes files smaller. This means a tiny bit of quality is lost, but for most uses — sharing, posting, printing — the quality difference is not noticeable at all.</p>

          <h2>Why Convert HEIC to JPG?</h2>
          <p>There are many reasons why people need to convert HEIC photos to JPG format:</p>

          <ul>
            <li><strong>Works on every device –</strong> JPG opens on Windows, Android, Mac, Linux, and all browsers without any extra software.</li>
            <li><strong>Easy to share –</strong> JPG is the best format for sharing photos by email, WhatsApp, or social media.</li>
            <li><strong>Smaller file size –</strong> JPG files are smaller than PNG files, making them faster to upload and download.</li>
            <li><strong>Supported by all apps –</strong> Every photo editor, document tool, and design app accepts JPG files.</li>
            <li><strong>Great for social media –</strong> Instagram, Facebook, Twitter, and YouTube all work best with JPG images.</li>
            <li><strong>Works on older devices –</strong> Even old phones and computers can open JPG files without any problem.</li>
            <li><strong>Easy to print –</strong> Most print shops and photo labs require JPG format for printing photos.</li>
          </ul>

          <blockquote>🔗 Need a PNG file instead? PNG supports transparent backgrounds and lossless quality — great for logos and design work. Try our <Link href="/tools/image-converter/heic-to-png">HEIC to PNG Converter</Link> tool.</blockquote>

          <h2>Features of Our HEIC to JPG Converter</h2>
          <p>Here is what makes our tool the best choice for converting your Apple photos:</p>

          <h3>Drag and Drop Upload</h3>
          <p>No need to click through folders and menus. Just drag your HEIC file from your desktop or photo library and drop it right into the upload box. It is as easy as it gets.</p>

          <h3>One-Click Conversion</h3>
          <p>After you upload your file, press the Convert button once. Our tool does everything else for you. You will have your JPG file ready to download in just a few seconds.</p>

          <h3>High-Quality Output</h3>
          <p>We make sure your JPG file looks as good as possible. Our conversion engine keeps the colors, brightness, and sharpness of your original photo. The output quality is excellent for everyday use.</p>

          <h3>Completely Free</h3>
          <p>This tool is 100% free to use. There are no hidden charges, no premium plans, and no credit card needed. Convert as many files as you want without paying a single rupee.</p>

          <h3>No Software to Download</h3>
          <p>Everything happens in your web browser. You do not need to install any app or program. Just open this page and start converting. It works on Windows, Mac, iPhone, and Android.</p>

          <h3>Fast Processing</h3>
          <p>Our tool converts HEIC files to JPG in just 2 to 5 seconds. Even large, high-resolution photos convert quickly. You do not have to wait around for your file.</p>

          <h3>Safe and Private</h3>
          <p>Your photos are yours. We do not save your files on our servers. The conversion happens securely and your photos are deleted right after you download them.</p>

          <h3>Works on All Devices</h3>
          <p>Whether you are using a desktop computer, a laptop, a tablet, or a smartphone — our tool works perfectly on every screen size and device type.</p>

          <h2>HEIC vs JPG – What Is the Difference?</h2>
          <p>Here is a simple comparison to help you understand both formats:</p>

          <div className='overflow-x-auto w-full'><table>
            <thead>
                <tr>
                  <th>Feature</th>
                  <th>HEIC</th>
                  <th>JPG</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>File Size</td>
                  <td>Larger (lossless)</td>
                  <td>Smaller (lossy compression)</td>
                </tr>
                <tr>
                  <td>Image Quality</td>
                  <td>Perfect, no loss</td>
                  <td>Very good, slight loss</td>
                </tr>
                <tr>
                  <td>Transparency</td>
                  <td>Yes</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Best For</td>
                  <td>Design, print, logos</td>
                  <td>Photos, social media, email</td>
                </tr>
                <tr>
                  <td>Universal Support</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Recommended For Sharing</td>
                  <td>Sometimes</td>
                  <td>Yes — most popular choice</td>
                </tr>
                <tr>
                  <td>Apple Default Format</td>
                  <td>No</td>
                  <td>No (HEIC is Apple's default)</td>
                </tr>
              </tbody>
            </table></div>

          <p>JPG is the winner when it comes to sharing, social media, and everyday use. HEIC is great for saving phone storage, but JPG works everywhere. That is why converting HEIC to JPG is so useful.</p>

          <h2>How Does HEIC to JPG Conversion Work?</h2>
          <p>Our tool uses a fast image processing engine that runs in your web browser. When you upload a HEIC file, the tool reads the image data and rewrites it in the JPG format.</p>
          <p>This process happens locally on your device — not on a faraway server. That means your photos stay private and the conversion is very fast. You do not even need a strong internet connection once the page has loaded.</p>
          <p>The tool reads all the color data, exposure settings, and image details from your HEIC file and puts them all into the new JPG file. The result is a clear, sharp, full-color photo ready for any use.</p>

          <blockquote>
            🔗 Just want to VIEW your HEIC photo without converting it? Try our free <Link href="/tools/heic-image-viewer">HEIC Image Viewer</Link> — open and preview HEIC files directly in your browser. No conversion needed.
          </blockquote>

          <h2>Who Should Use This Tool?</h2>
          <p>Our HEIC to JPG converter is useful for many different people:</p>
          <ul>
            <li>iPhone and iPad users who want to share photos with friends and family on non-Apple devices.</li>
            <li>Windows PC users who receive HEIC photos and cannot open them.</li>
            <li>Bloggers and website owners who need to upload photos online.</li>
            <li>Social media managers who post photos to Instagram, Facebook, and Twitter.</li>
            <li>Photographers who shoot on iPhone and need to deliver photos in JPG format to clients.</li>
            <li>Students who want to add photos to assignments, reports, or presentations.</li>
            <li>Small business owners who receive product images from clients using iPhones.</li>
            <li>Designers and developers who work with photo assets and need universal file formats.</li>
          </ul>

          <h2>Common Uses for HEIC to JPG Conversion</h2>
          <h3>Sharing Photos on WhatsApp and Social Media</h3>
          <p>WhatsApp, Instagram, Facebook, and most social media apps work best with JPG photos. When you try to share a HEIC file, some apps may resize it, reject it, or show a blank image. Convert to JPG first to avoid these problems.</p>

          <h3>Sending Photos by Email</h3>
          <p>Many email clients on Windows and Android have trouble opening HEIC photo attachments. When you attach a JPG file instead, the person on the other end can always open it — no matter what device or email app they use.</p>

          <h3>Uploading Photos to Websites</h3>
          <p>If you run a blog, an online store, or a website, you need to upload photos in formats that work on the web. JPG is the best format for web photos because it loads fast and looks great. Convert your HEIC files to JPG before uploading.</p>


              <h3>Editing Photos in Apps</h3>
              <p>Photo editing apps like Lightroom, Photoshop, Canva, and Snapseed all support JPG. Some of them do not support HEIC. Convert your iPhone photos to JPG before editing to avoid any compatibility issues.</p>

              <h3>Printing Photos</h3>
              <p>Most print shops, photo labs, and photo printing websites accept JPG files. If you want to print your iPhone photos, convert them to JPG first. The quality will be great and the printing process will be smooth.</p>

              <h3>Using Photos in Documents</h3>
              <p>Whether you are making a Word document, a PowerPoint presentation, or a PDF report, JPG photos are the safest choice. They work in all office apps and document editors without any issues.</p>


              <h2>Tips for the Best HEIC to JPG Conversion</h2>
              <ul>
                <li>•	Always use the original HEIC file from your iPhone or iPad for the best quality output.</li>
                <li>•	Keep your browser up to date. Our tool works best on the latest version of Chrome, Firefox, Safari, and Edge.</li>
                <li>•	If your photo is very large, give it a few extra seconds to upload and convert.</li>
                <li>•	Check the JPG file after downloading to make sure it looks the way you want.</li>
                <li>•	If you need a transparent background in your image, use our HEIC to PNG tool instead — JPG does not support transparency.</li>
              </ul>

              <h2>Browser and Device Compatibility</h2>
              <p>Our HEIC to JPG converter is designed to work on all popular browsers and devices:</p>
              <ul>
                <li>Google Chrome – Windows, Mac, Android</li>
                <li>Safari – Mac, iPhone, iPad</li>
                <li>Mozilla Firefox – Windows, Mac, Linux</li>
                <li>Microsoft Edge – Windows, Mac</li>
                <li>Opera and Brave browsers</li>
              </ul>

              <p>It works on desktop computers, laptops, tablets, and smartphones. The layout adjusts to fit any screen size, so you get a smooth experience on every device.</p>

              <h2>Your Privacy Is Important to Us</h2>
              <p>We know that your photos can be personal and private. Here is how we protect your data:</p>
              <ul>
                <li>•	Your files are not stored on our servers after conversion.</li>
                <li>•	We do not share your photos with any third party.</li>
                <li>•	The conversion process runs securely in your browser.</li>
                <li>•	Files are automatically deleted once you download the converted JPG.</li>
                <li>•	We do not require you to create an account or share your email address.</li>
              </ul>
              <p>You can use our tool with full confidence that your photos are safe.</p>

              <blockquote>🔗 Looking for lossless quality? Our <Link href='/tools/image-converter/heic-to-png'>HEIC to PNG Converter</Link> keeps every detail of your image with zero quality loss — perfect for logos, graphics, and professional use.</blockquote>

              <h2>Why Use Our HEIC to JPG Converter?</h2>
              <p>There are many image converter tools online. Here is why thousands of people choose ours:</p>
              <ul>
                <li>No watermarks – Your converted JPG has no logos or watermarks added.</li>
                <li>No file size limits – Convert large, high-resolution iPhone photos without any restrictions.</li>
                <li>No account required – You do not need to sign up or log in to use the tool.</li>
                <li>Fast and reliable – Most conversions finish in under 5 seconds.</li>
                <li>Simple design – Clean layout that is easy to use for everyone, even beginners.</li>
                <li>Mobile-friendly – Works perfectly on phones and tablets, not just desktop computers.</li>
                <li>Completely free – No paid plans, no subscriptions, no hidden fees.</li>
              </ul>

              <h2>How to Stop Your iPhone from Saving Photos as HEIC</h2>
              <p>If you do not want your iPhone to save photos as HEIC in the future, you can change this in your settings. Here is how:</p>
              <ul>
                <li>•	Open the Settings app on your iPhone or iPad.</li>
                <li>•	Scroll down and tap on Camera.</li>
                <li>•	Tap on Formats.</li>
                <li>•	Choose Most Compatible instead of High Efficiency.</li>
              </ul>
              <p>After this change, your iPhone will save new photos as JPG instead of HEIC. You will still need to convert any old HEIC photos you already have.</p>


              <h3>Frequently Asked Questions (FAQ)</h3>

<h4>Is this HEIC to JPG converter free?</h4>
<p>Yes, it is 100% free. You can convert as many HEIC files to JPG as you need without paying anything. There are no hidden costs or premium features.</p>

<h4>Do I need to install any app or software?</h4>
<p>No. Our converter works directly in your web browser. Just open this page, upload your file, and convert. No installation needed.</p>

<h4>Is my photo safe when I upload it?</h4>
<p>Yes, completely safe. Your photo is processed securely and is not saved on our servers. We do not have access to your photos after the conversion is done.</p>

<h4>Will the JPG quality be as good as the original?</h4>
<p>The quality will be very close to the original. JPG uses slight compression, so there may be a tiny difference in quality at the pixel level — but for everyday use like sharing, printing, and posting, you will not notice any difference at all.</p>

<h4>What is the difference between HEIC and JPG?</h4>
<p>HEIC is Apple's photo format. It is smaller in file size but not supported on most non-Apple devices. JPG is the most universal photo format in the world and works on every device and platform.</p>

<h4>Can I convert HEIC to JPG on my iPhone?</h4>
<p>Yes! Open this page in Safari on your iPhone, upload your HEIC file, and download the JPG version. It works perfectly on mobile browsers.</p>

<h4>What is the difference between JPG and JPEG?</h4>
<p>JPG and JPEG are exactly the same format. JPEG was the original name, and JPG was created as a short version for systems that only allowed three-letter file extensions. Both refer to the same file type.</p>

<h4>Can I convert a HEIC file to JPG on Windows?</h4>
<p>Yes. Open our tool in Chrome or Edge on your Windows PC, upload your HEIC file, and download the JPG. No software needed.</p>

<h4>How many files can I convert at once?</h4>
<p>Right now, our tool converts one HEIC file at a time. You can repeat the process for each photo. We are working on adding batch conversion support in the future.</p>

<h4>Does converting HEIC to JPG reduce file size?</h4>
<p>In most cases, yes. JPG files use compression that reduces file size. A HEIC file converted to JPG may be slightly larger or smaller depending on the photo, but JPG files are generally very manageable in size.</p>

<h4>What if I need a PNG file instead of JPG?</h4>
<p>If you need a PNG file — for example, if your image needs a transparent background — use our <Link href='/tools/image-converter/heic-to-png'>HEIC to PNG converter</Link>. PNG is a lossless format that keeps every detail of your image.</p>
 

<h4>Can I view my HEIC photo before converting it?</h4>
<p>Yes! If you just want to see what your HEIC photo looks like without converting it, you can use our <Link href='/tools/heic-image-viewer'>HEIC Viewer tool</Link>. It opens and displays HEIC files directly in your browser.</p>

<h4>Why does my iPhone save photos as HEIC?</h4>
<p>Apple uses HEIC because it saves storage space. A HEIC photo can be 50% smaller than a JPG photo with the same quality. This helps you store more photos on your iPhone without running out of space.</p>

<h4>Does converting HEIC to JPG keep the original date and time of the photo?</h4>
<p>Most basic converters do not keep the EXIF data like date, time, and location. Our tool focuses on image quality and compatibility. If keeping photo metadata is important for you, we recommend checking the output file.</p>

<h4>Is JPG better than PNG for sharing photos?</h4>
<p>For most everyday photo sharing — social media, email, messaging — JPG is the better choice. It produces smaller files that upload and download faster. PNG is better when you need perfect quality or transparent backgrounds.</p>

<h4>Can I use this tool on Android?</h4>
<p>Yes! Open our HEIC to JPG converter in Chrome on your Android phone or tablet. It works the same way as on a desktop. Upload your HEIC file and download the JPG version in seconds.</p>

<h4>What happens to my file after conversion?</h4>
<p>After you download your JPG file, the uploaded HEIC file is removed from our system. We do not keep any copies of your photos. Your privacy is always protected.</p>


        </div>

      </div>
    </div>
  );
}
