'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from "@/lib/api-config";
import {
  Upload, Download, ImageIcon, Settings, X, RotateCw,
  CheckCircle, AlertCircle, Zap, ArrowRight, Shield, Cpu, Info
} from 'lucide-react';
import Link from "next/link";

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b && b !== 0) return '–';
  if (b === 0) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const VALID_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'gif', 'bmp', 'ico'];
const FORMAT_LABELS = { jpeg: 'JPEG', png: 'PNG', webp: 'WebP', avif: 'AVIF', gif: 'GIF', bmp: 'BMP', ico: 'ICO' };
const FORMAT_GROUPS = {
  'Recommended': ['webp', 'avif', 'png', 'jpeg'],
  'Legacy': ['gif', 'bmp', 'ico'],
};
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── HEIC decoder (lazy-loaded) ────────────────────────────────────────── */
let heic2anyModule = null;
async function decodeHEIC(file) {
  if (!heic2anyModule) {
    heic2anyModule = (await import('heic2any')).default;
  }
  const blob = await heic2anyModule({ blob: file, toType: 'image/png', quality: 1 });
  // heic2any may return a single blob or an array
  return Array.isArray(blob) ? blob[0] : blob;
}

/* ─── AVIF output feature detection ─────────────────────────────────────── */
let _avifSupported = null;
async function checkAvifSupport() {
  if (_avifSupported !== null) return _avifSupported;
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const blob = await new Promise(r => c.toBlob(r, 'image/avif', 0.5));
    _avifSupported = blob?.type === 'image/avif';
  } catch { _avifSupported = false; }
  return _avifSupported;
}

/* ─── ICO encoder (16x16 PNG in .ico wrapper) ───────────────────────────── */
async function encodeICO(canvas) {
  // Resize to 256x256 max for ICO
  const size = Math.min(256, canvas.width, canvas.height);
  const c2 = document.createElement('canvas');
  c2.width = c2.height = size;
  const ctx2 = c2.getContext('2d');
  ctx2.drawImage(canvas, 0, 0, size, size);
  const pngBlob = await new Promise(r => c2.toBlob(r, 'image/png'));
  const pngBuf = new Uint8Array(await pngBlob.arrayBuffer());
  // ICO header: 6 bytes + 16 bytes entry + PNG data
  const ico = new ArrayBuffer(6 + 16 + pngBuf.length);
  const v = new DataView(ico);
  v.setUint16(0, 0, true); // reserved
  v.setUint16(2, 1, true); // type: ICO
  v.setUint16(4, 1, true); // count
  // Entry
  const u8 = new Uint8Array(ico);
  u8[6] = size >= 256 ? 0 : size; // width
  u8[7] = size >= 256 ? 0 : size; // height
  u8[8] = 0; // palette
  u8[9] = 0; // reserved
  v.setUint16(10, 1, true); // color planes
  v.setUint16(12, 32, true); // bpp
  v.setUint32(14, pngBuf.length, true); // image size
  v.setUint32(18, 22, true); // offset
  u8.set(pngBuf, 22);
  return new Blob([ico], { type: 'image/x-icon' });
}

/* ─── Browser-native image conversion via Canvas API ───────────────────── */
async function convertImageBrowser(file, targetFormat, quality) {
  // Step 1: Decode HEIC/HEIF files first
  let sourceFile = file;
  const ext = file.name?.toLowerCase() || '';
  const isHEIC = file.type === 'image/heic' || file.type === 'image/heif' ||
    ext.endsWith('.heic') || ext.endsWith('.heif');
  if (isHEIC) {
    sourceFile = await decodeHEIC(file);
  }

  // Step 2: Load into Image element
  const img = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const image = new window.Image();
      image.onerror = () => reject(new Error('Failed to decode image — format may not be supported by your browser'));
      image.onload = () => resolve(image);
      image.src = e.target.result;
    };
    reader.readAsDataURL(sourceFile);
  });

  // Step 3: Draw to canvas
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');

  // Fill white bg for formats that don't support transparency
  if (targetFormat === 'jpeg' || targetFormat === 'bmp') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  // Step 4: Encode to target format
  if (targetFormat === 'ico') {
    return encodeICO(canvas);
  }

  const mime = `image/${targetFormat}`;
  const q = ['jpeg', 'webp', 'avif'].includes(targetFormat) ? quality / 100 : undefined;
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) { reject(new Error('Conversion failed — your browser may not support this output format')); return; }
      // Verify browser actually encoded in the requested format (fallback detection)
      if (b.type !== mime && targetFormat === 'avif') {
        reject(new Error('AVIF encoding not supported by your browser. Try Chrome 121+ or Firefox 113+.'));
        return;
      }
      resolve(b);
    }, mime, q);
  });
  return blob;
}

const INPUT_FORMATS = ['JPG', 'PNG', 'WebP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'ICO', 'HEIC', 'HEIF', 'SVG'];

/* ─── Hash-based format sync ────────────────────────────────────────────── */
const getFormatFromHash = () => {
  if (typeof window === 'undefined') return 'png';
  const h = window.location.hash.replace('#', '').toLowerCase();
  const norm = h === 'jpg' ? 'jpeg' : h;
  return VALID_FORMATS.includes(norm) ? norm : 'png';
};

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
export default function ImageConverter() {
  const [files, setFiles]           = useState([]);
  const [processing, setProcessing] = useState(false);
  const [zipping, setZipping]       = useState(false);
  const [outputFmt, setOutputFmt]   = useState('png');
  const [quality, setQuality]       = useState(90);
  const [fileDrag, setFileDrag]     = useState(false);
  const fileRef = useRef(null);

  // Init & sync format from URL hash
  useEffect(() => {
    setOutputFmt(getFormatFromHash());
    const onChange = () => setOutputFmt(getFormatFromHash());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const handleFmtChange = (fmt) => {
    setOutputFmt(fmt);
    window.location.hash = fmt === 'jpeg' ? 'jpg' : fmt;
  };

  /* ── Add files ── */
  const addFiles = useCallback((incoming) => {
    const images = [...incoming].filter(f => {
      if (f.type.startsWith('image/')) return true;
      const name = f.name?.toLowerCase() || '';
      return name.endsWith('.heic') || name.endsWith('.heif') || name.endsWith('.tiff') || name.endsWith('.tif');
    });
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
  const clearAll = () => { setFiles([]); window.location.hash = ''; };

  /* ── Server Fallback ── */
  const convertImageServer = async (file, targetFormat, quality) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);
    formData.append('quality', quality);

    const res = await fetch(`${API_V1}/tools/image-convert`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Server conversion failed: ${errorText}`);
    }

    const blob = await res.blob();
    return blob;
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
          // Attempt 1: Browser Canvas API
          const blob = await convertImageBrowser(fi.file, outputFmt, quality);
          return { id: fi.id, blob, outSize: blob.size, status: 'done' };
        } catch (browserErr) {
          try {
            // Attempt 2: Server Fallback (Handles AVIF/HEIC when unsupported)
            const blob = await convertImageServer(fi.file, outputFmt, quality);
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
    const extMap = { jpeg: 'jpg', ico: 'ico' };
    const ext = extMap[outputFmt] || outputFmt;
    const name = fi.file.name.replace(/\.[^/.]+$/, '') + `.${ext}`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(fi.blob), download: name }).click();
  };

  /* ── Download ALL as ZIP (pure browser, no external library) ── */
  const downloadAll = async () => {
    const done = files.filter(f => f.status === 'done' && f.blob);
    if (!done.length) return;
    // Single file — just download it directly
    if (done.length === 1) { downloadOne(done[0]); return; }

    setZipping(true);
    try {
      const extMap = { jpeg: 'jpg', ico: 'ico' };
      const ext = extMap[outputFmt] || outputFmt;
      // Build a minimal valid ZIP (PKZIP / ZIP 2.0, stored — no compression needed;
      // files are already compressed by the image codec)
      const localHeaders = [];
      const centralDir = [];
      let offset = 0;

      for (const fi of done) {
        const name = fi.file.name.replace(/\.[^/.]+$/, '') + `.${ext}`;
        const nameBytes = new TextEncoder().encode(name);
        const data = new Uint8Array(await fi.blob.arrayBuffer());
        const crc = crc32(data);
        const size = data.byteLength;

        // Local file header
        const lh = new DataView(new ArrayBuffer(30 + nameBytes.length));
        lh.setUint32(0, 0x504b0304, false); // signature
        lh.setUint16(4, 20, true);           // version needed
        lh.setUint16(6, 0, true);            // flags
        lh.setUint16(8, 0, true);            // compression: stored
        lh.setUint16(10, 0, true);            // mod time
        lh.setUint16(12, 0, true);            // mod date
        lh.setUint32(14, crc, true);          // crc-32
        lh.setUint32(18, size, true);         // compressed size
        lh.setUint32(22, size, true);         // uncompressed size
        lh.setUint16(26, nameBytes.length, true); // name length
        lh.setUint16(28, 0, true);            // extra length
        new Uint8Array(lh.buffer).set(nameBytes, 30);
        localHeaders.push({ header: new Uint8Array(lh.buffer), data, name: nameBytes, offset, crc, size });
        offset += lh.buffer.byteLength + data.byteLength;
      }

      // Central directory headers
      for (const e of localHeaders) {
        const cd = new DataView(new ArrayBuffer(46 + e.name.length));
        cd.setUint32(0, 0x504b0102, false); // signature
        cd.setUint16(4, 20, true);           // version made by
        cd.setUint16(6, 20, true);           // version needed
        cd.setUint16(8, 0, true);            // flags
        cd.setUint16(10, 0, true);            // compression: stored
        cd.setUint16(12, 0, true);            // mod time
        cd.setUint16(14, 0, true);            // mod date
        cd.setUint32(16, e.crc, true);
        cd.setUint32(20, e.size, true);
        cd.setUint32(24, e.size, true);
        cd.setUint16(28, e.name.length, true);
        cd.setUint16(30, 0, true);  // extra
        cd.setUint16(32, 0, true);  // comment
        cd.setUint16(34, 0, true);  // disk start
        cd.setUint16(36, 0, true);  // int file attr
        cd.setUint32(38, 0, true);  // ext file attr
        cd.setUint32(42, e.offset, true); // local header offset
        new Uint8Array(cd.buffer).set(e.name, 46);
        centralDir.push(new Uint8Array(cd.buffer));
      }

      const cdOffset = offset;
      const cdSize = centralDir.reduce((s, b) => s + b.length, 0);

      // End of central directory record
      const eocd = new DataView(new ArrayBuffer(22));
      eocd.setUint32(0, 0x504b0506, false); // signature
      eocd.setUint16(4, 0, true);  // disk number
      eocd.setUint16(6, 0, true);  // disk with CD
      eocd.setUint16(8, localHeaders.length, true);
      eocd.setUint16(10, localHeaders.length, true);
      eocd.setUint32(12, cdSize, true);
      eocd.setUint32(16, cdOffset, true);
      eocd.setUint16(20, 0, true);  // comment length

      // Concatenate everything
      const parts = [];
      for (const e of localHeaders) { parts.push(e.header); parts.push(e.data); }
      for (const cd of centralDir) { parts.push(cd); }
      parts.push(new Uint8Array(eocd.buffer));

      const totalLen = parts.reduce((s, p) => s + p.length, 0);
      const zipBytes = new Uint8Array(totalLen);
      let pos = 0;
      for (const p of parts) { zipBytes.set(p, pos); pos += p.length; }

      const blob = new Blob([zipBytes], { type: 'application/zip' });
      Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'converted-images.zip' }).click();
    } finally {
      setZipping(false);
    }
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const readyCount = files.filter(f => f.status === 'ready').length;
  const needQuality = ['jpeg', 'webp', 'avif'].includes(outputFmt);

  const FORMAT_DESCS = {
    jpeg: 'Best for photos & social media',
    png: 'Lossless, supports transparency',
    webp: 'Modern format, 30% smaller than JPEG',
    avif: 'Next-gen, 50% smaller than JPEG',
    gif: 'Supports animation, 256 colours',
    bmp: 'Uncompressed, Windows native',
    ico: 'Favicon format for websites',
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Converter', href: '/tools/image-converter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-2xl mb-4 shadow-lg shadow-sky-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Free Image Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Convert between JPG, PNG, WebP, AVIF, HEIC, TIFF, GIF, BMP & ICO — free, instant, in-browser</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Processes Locally</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />11 Formats Supported</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-sky-500" />Conversion Settings
              </p>

              {/* Output format */}
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Output Format</p>
              <div className="space-y-3 mb-4">
                {Object.entries(FORMAT_GROUPS).map(([group, fmts]) => (
                  <div key={group}>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">{group}</p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {fmts.map(fmt => (
                        <button key={fmt} onClick={() => handleFmtChange(fmt)}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${outputFmt === fmt
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-400 shadow-sm shadow-sky-500/10'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                            }`}>
                          <span className="flex items-center gap-2">
                            {fmt === 'avif' && <span className="px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[9px] font-black rounded">NEW</span>}
                            {fmt === 'ico' && <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[9px] font-black rounded">FAV</span>}
                            {FORMAT_LABELS[fmt]}
                          </span>
                          <span className={`text-[10px] font-normal ${outputFmt === fmt ? 'text-sky-600 dark:text-sky-500' : 'text-slate-400'}`}>{FORMAT_DESCS[fmt]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quality slider — only for JPEG/WebP */}
              {needQuality && (
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Quality</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{quality}%</span>
                  </div>
                  <input type="range" min={10} max={100} step={1} value={quality} onChange={e => setQuality(+e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500" />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Smaller file</span><span>Best quality</span>
                  </div>
                </div>
              )}

              {/* Convert button */}
              <button onClick={convertAll} disabled={processing || readyCount === 0}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-600 hover:to-indigo-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                {processing ? 'Converting…' : `Convert ${readyCount > 0 ? readyCount : ''} Image${readyCount !== 1 ? 's' : ''}`}
              </button>

              {/* Download all button */}
              {doneCount > 1 && (
                <button onClick={downloadAll} disabled={zipping}
                  className="w-full mt-2 py-2.5 border border-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/10 disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2">
                  {zipping
                    ? <><RotateCw className="w-4 h-4 animate-spin"/>Building ZIP…</>
                    : <><Download className="w-4 h-4"/>Download All as ZIP ({doneCount})</>}
                </button>
              )}

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
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Conversion Summary</h3>
                  {[
                    { label: 'Converted', val: `${doneCount} file${doneCount !== 1 ? 's' : ''}` },
                    { label: 'Original total', val: fmtSize(origTotal) },
                    { label: 'Output total', val: fmtSize(outTotal) },
                    { label: diff > 0 ? 'Size reduced' : 'Size change', val: diff > 0 ? `-${fmtSize(diff)}` : `+${fmtSize(-diff)}`, green: diff > 0 },
                  ].map(({ label, val, green }) => (
                    <div key={label} className="flex justify-between py-1.5 text-xs border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className={`font-semibold ${green ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{val}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-soft">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                  🔥 Related Image Tools
                </h3>
                <div className="space-y-2">
                  <Link href="/tools/image-converter/avif-to-jpg" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Avif to Jpg Converter
                  </Link> 
                  <Link href="/tools/image-converter/jpg-to-avif" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Jpg to Avif Converter
                  </Link> 
                  <Link href="/tools/image-converter/jpg-to-png" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Jpg to Png Converter
                  </Link> 
                  <Link href="/tools/image-converter/jpg-to-webp" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Jpg to Webp Converter
                  </Link> 
                  <Link href="/tools/image-converter/png-to-jpg" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Png to Jpg Converter
                  </Link> 
                  <Link href="/tools/image-converter/png-to-ico" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Png to ICO Converter
                  </Link> 
                  <Link href="/tools/image-converter/heic-to-jpg" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Heic to Jpg Converter
                  </Link> 
                  <Link href="/tools/image-converter/png-to-webp" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Png to Webp Converter
                  </Link> 
                  <Link href="/tools/image-converter/heic-to-png" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Heic to Png Converter
                  </Link> 
                  <Link href="/tools/image-converter/webp-to-jpg" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors pb-2 border-b border-slate-100 dark:border-slate-700">
                    Webp to Jpg Converter
                  </Link> 
                  <Link href="/tools/image-converter/webp-to-png" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Webp to Png Converter
                  </Link>  
                </div>
              </div>
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
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${fileDrag ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/*,.heic,.heif,.tiff,.tif,.avif" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-500 rounded-2xl mb-3 shadow-md">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <p className="text-base font-bold text-slate-900 dark:text-white mb-1">{fileDrag ? 'Drop images here!' : 'Upload Images to Convert'}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse • HEIC, TIFF, AVIF & more supported</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {INPUT_FORMATS.map(f => (
                    <span key={f} className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      ['HEIC', 'HEIF', 'AVIF', 'TIFF'].includes(f)
                        ? 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>{f}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Files list */}
            {files.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-sky-500" />Images ({files.length})
                  </h3>
                  {doneCount > 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{doneCount} converted</span>
                  )}
                </div>

                <div className="space-y-3">
                  {files.map(fi => {
                    const saved = fi.status === 'done' && fi.file.size > 0 && fi.outSize
                      ? ((fi.file.size - fi.outSize) / fi.file.size * 100).toFixed(1)
                      : null;
                    const fmtExt = fi.file.name.split('.').pop()?.toUpperCase() || '?';
                    const outExt = FORMAT_LABELS[outputFmt];
                    return (
                      <div key={fi.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                        {/* Thumbnails */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <img src={fi.preview} alt={fi.file.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                          {fi.status === 'done' && fi.outUrl && (
                            <>
                              <ArrowRight className="w-3 h-3 text-slate-400 flex-shrink-0" />
                              <div className="relative w-12 h-12">
                                <img src={fi.outUrl} alt="Converted" className="w-12 h-12 object-cover rounded-lg border border-sky-300 dark:border-sky-700" />
                                <span className="absolute -top-1 -right-1 text-[8px] font-black bg-sky-500 text-white px-1 rounded">{outExt}</span>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mb-1">{fi.file.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] font-medium">
                            <span className="text-slate-400">{fmtExt} → {outExt}</span>
                            <span className="text-slate-500 dark:text-slate-400">{fmtSize(fi.file.size)}</span>
                            {fi.status === 'done' && fi.outSize && (
                              <>
                                <span className="text-sky-600 dark:text-sky-400">→ {fmtSize(fi.outSize)}</span>
                                {saved !== null && parseFloat(saved) > 0 && (
                                  <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">{saved}% smaller</span>
                                )}
                                {saved !== null && parseFloat(saved) < 0 && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full font-bold">{Math.abs(parseFloat(saved))}% larger</span>
                                )}
                              </>
                            )}
                            {fi.status === 'converting' && <span className="text-sky-600 dark:text-sky-400">Converting…</span>}
                            {fi.status === 'error' && <span className="text-red-600 dark:text-red-400" title={fi.errorMsg}>{fi.errorMsg?.slice(0, 50) || 'Conversion failed'}</span>}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {fi.status === 'done' && fi.blob && (
                            <button onClick={() => downloadOne(fi)} title="Download"
                              className="p-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition shadow-sm">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {fi.status === 'ready' && <CheckCircle className="w-4 h-4 text-slate-300" />}
                          {fi.status === 'converting' && <RotateCw className="w-4 h-4 text-sky-500 animate-spin" />}
                          {fi.status === 'done' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {fi.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                          <button onClick={() => removeFile(fi.id)} disabled={fi.status === 'converting'}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition disabled:opacity-40">
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

          {/* Introduction */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Free Online Image Converter — Convert JPG, PNG, WebP, GIF & BMP Instantly</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                Image format incompatibility is one of the most persistent and frustrating digital bottlenecks. You try to upload a profile picture, but the website only accepts PNG. You attempt to email a design mockup, but the TIFF file is 50MB and gets rejected by the mail server. You download a graphic from a modern website and receive a WebP file that your older photo editing software absolutely refuses to open.
              </p>
              <p className="text-lg leading-relaxed">
                The <strong>OmniWebKit Image Converter</strong> is engineered to eliminate these friction points entirely. This free, browser-based tool allows you to seamlessly convert between all major image formats (JPEG, PNG, WebP, GIF, and BMP) with zero quality loss and zero server uploads. Whether you are a web developer optimizing assets for Core Web Vitals, a photographer prepping images for client delivery, or just someone trying to upload a photo to a strict government portal, this tool provides an instant solution.
              </p>
              <p className="text-lg leading-relaxed">
                Unlike traditional online converters that upload your private photos to remote servers (raising significant privacy and security concerns), our converter utilizes advanced HTML5 Canvas APIs to process every pixel directly within your browser. The files never leave your device. This architecture not only guarantees absolute privacy but also makes the conversion process dramatically faster, as you aren't bottlenecked by your internet upload speed.
              </p>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="${cardCls} p-8 lg:p-12 bg-sky-50/50 dark:bg-sky-900/10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">How to Convert Images Online</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Upload Your Files', desc: 'Drag and drop your images directly into the upload zone, or click the "Browse Files" button. You can upload JPG, PNG, WebP, GIF, BMP, TIFF, and ICO files simultaneously. There is no strict file size limit—it depends entirely on your device\'s RAM.' },
                { step: '2', title: 'Select the Target Format', desc: 'Choose the output format you need: JPEG (best for photos), PNG (best for logos and transparency), WebP (best for modern web delivery), GIF (best for basic graphics), or BMP (best for legacy Windows systems).' },
                { step: '3', title: 'Adjust Compression Quality (Optional)', desc: 'If you select JPEG or WebP, a quality slider will appear. The default is 90% (which offers an excellent balance of high visual fidelity and low file size). Lowering this slider will compress the file further, reducing its size but potentially introducing visual artifacts.' },
                { step: '4', title: 'Review File Size Changes', desc: 'The converter works instantly in the background. Look at the file list to see a real-time comparison of your original file size versus the newly converted file size. A green badge indicates how much space you saved!' },
                { step: '5', title: 'Download Converted Images', desc: 'Click the download icon next to an individual file to save it, or click the "Download All" button at the top to save every converted image to your device in one swift action.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-sky-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md shadow-sky-500/30">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Key Features & Technical Advantages</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: '100% Client-Side Processing', desc: 'Privacy is paramount. When you upload a personal photo or a confidential corporate document, it stays on your computer. We use browser-native APIs to read the image data, translate it to the new format, and prompt the download locally.' },
                { title: 'Massive Batch Conversions', desc: 'Need to convert an entire folder of 50 high-res camera photos to WebP for a website? No problem. Drag them all in. The tool processes them concurrently using your browser\'s background threading capabilities.' },
                { title: 'Intelligent Quality Control', desc: 'Not all compression is created equal. Our WebP and JPEG encoders allow you to precisely dial in the quality-to-size ratio. See exactly how many kilobytes you save before committing to the download.' },
                { title: 'Preserves Image Dimensions', desc: 'This tool performs a pure format conversion. The pixel dimensions (width and height) of your original image are preserved with 100% accuracy, ensuring your layout or design doesn\'t break after conversion.' },
                { title: 'Transparency Handling', desc: 'When converting from a format that supports transparency (like PNG or WebP) to one that does not (like JPEG), our algorithm gracefully flattens the image against a pure white background, preventing ugly black artifacting.' },
                { title: 'Format Un-sticking', desc: 'If you\'ve downloaded an image that claims to be a JPG but fails to open in Photoshop, it might be a mislabeled WebP. Passing it through our converter strips out corrupted headers and generates a clean, standards-compliant file.' }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-sky-600 dark:text-sky-400">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Format Guide */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">The Ultimate Image Format Guide</h2>
            <div className="space-y-6">
              {[
                {
                  fmt: 'JPEG (JPG) — The Photography Standard',
                  when: 'Photographs, social media uploads, email attachments, massive gradients.',
                  avoid: 'Logos, UI icons, screenshots with text, anything requiring a transparent background.',
                  body: 'JPEG is the undisputed king of web photography. It utilizes lossy compression, permanently discarding mathematical frequency data to achieve stunningly small file sizes. A 10MB raw camera file can easily become a 500KB JPEG. However, because it discards data, high-contrast edges (like text) will show "ringing" or artifacts. It also strictly lacks support for an alpha channel (transparency).'
                },
                {
                  fmt: 'PNG — The Lossless Champion',
                  when: 'Logos, icons, UI elements, digital art, screenshots, graphics needing transparency.',
                  avoid: 'High-resolution photographs, as the file sizes will be massive and severely impact load times.',
                  body: 'PNG (Portable Network Graphics) uses a lossless compression algorithm. If you save an image as a PNG and reopen it, every single pixel is mathematically identical to the original. It fully supports 8-bit alpha transparency, making it the industry standard for overlay graphics. The trade-off is file size: photographic PNGs are often 5x to 10x larger than their JPEG counterparts.'
                },
                {
                  fmt: 'WebP — The Modern Web Format',
                  when: 'Website hero images, e-commerce product photos, modern blog posts, web banners.',
                  avoid: 'Email marketing (many email clients don\'t support it), legacy software workflows.',
                  body: 'Developed by Google, WebP was explicitly engineered to replace both JPEG and PNG on the web. It is a dual-threat format, supporting both lossy and lossless compression, as well as full alpha transparency. On average, WebP produces files 25–35% smaller than JPEG at equivalent visual quality. Adopting WebP is one of the easiest ways to improve your Google Lighthouse and Core Web Vitals scores.'
                },
                {
                  fmt: 'GIF — The Animation Pioneer',
                  when: 'Simple looping animations, low-color UI elements, memes.',
                  avoid: 'Photographs, anything requiring smooth gradients, high-quality prints.',
                  body: 'The Graphics Interchange Format is an ancient format (introduced in 1987) that survives almost entirely because of its animation capabilities. It is severely limited by a maximum palette of 256 colors per frame. If you try to save a photograph as a GIF, the colors will be dithered and banded, resulting in a heavily pixelated, retro appearance.'
                },
                {
                  fmt: 'BMP — The Uncompressed Behemoth',
                  when: 'Legacy Windows software compatibility, highly specific industrial or print workflows.',
                  avoid: 'Literally anywhere on the internet.',
                  body: 'Bitmap (BMP) stores pixel data exactly as it is, with absolutely zero compression. While this means the image is pristine, the file sizes are catastrophic. A standard 1080p image saved as a BMP will consume nearly 6 Megabytes. It should only be used when interacting with software that predates modern compression standards.'
                }
              ].map(({ fmt, when, avoid, body }) => (
                <details key={fmt} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors select-none text-base">
                    <span>{fmt}</span>
                    <span className="text-slate-400 text-2xl group-open:rotate-45 transition-transform flex-shrink-0 leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700 space-y-4">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{body}</p>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                         <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-2">✓ Best for</p>
                        <p className="text-emerald-600 dark:text-emerald-500 leading-relaxed">{when}</p>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2">✗ Avoid when</p>
                        <p className="text-red-600 dark:text-red-500 leading-relaxed">{avoid}</p>
                      </div>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Size Impact Table */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How Conversion Affects File Size & Quality</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              File size is often the primary motivation for format conversion, especially for web developers. However, understanding the relationship between compression and quality is crucial. Here is exactly what happens when you jump between major formats:
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50">
                    {['Conversion Path', 'Expected Size Impact', 'Visual Quality Impact'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['PNG to JPEG', 'Shrinks by 60–80%', 'Minor loss (due to lossy encoding)'],
                    ['PNG to WebP', 'Shrinks by 20–40%', 'Zero loss (WebP supports lossless mode)'],
                    ['JPEG to PNG', 'Explodes to 3–8× larger', 'No additional loss (but previous JPEG artifacts remain)'],
                    ['JPEG to WebP', 'Shrinks by 25–35%', 'Minimal loss (re-encoding artifacts possible)'],
                    ['JPEG to GIF', 'Similar or larger', 'Severe color reduction (banded gradients)'],
                    ['Any format to BMP', 'Explodes to 5–15× larger', 'Zero loss (completely uncompressed pixels)'],
                  ].map(([conv, size, qual], i) => (
                    <tr key={conv} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0 bg-white dark:bg-slate-900/20 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 text-slate-900 dark:text-white font-mono text-sm font-semibold">{conv}</td>
                      <td className="px-5 py-4 text-sky-600 dark:text-sky-400 font-medium">{size}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{qual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-400">
              <strong>Crucial Technical Note:</strong> Converting a low-quality JPEG into a PNG will <em>not</em> make the image look better. PNG will faithfully preserve the low-quality pixelation and blocking artifacts that were already present in the JPEG, while simultaneously inflating the file size. You cannot magically restore lost data by converting formats.
            </div>
          </div>

          {/* FAQs */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is my image uploaded to a server for conversion?', a: 'No. Absolute privacy is guaranteed. All image conversion logic runs entirely inside your web browser using HTML5 Canvas and native Web APIs. Your images are never uploaded, never transmitted, and never saved to any external database.' },
                { q: 'Which image formats can I convert between?', a: 'You can upload JPG, PNG, WebP, GIF, BMP, TIFF, and ICO files. The tool can export these inputs into JPEG, PNG, WebP, GIF, and BMP. You can convert in any direction between these supported formats.' },
                { q: 'Will converting to JPEG reduce my image quality?', a: 'JPEG is inherently a lossy format — it permanently discards frequency data to reduce file size. How much visual quality is lost depends entirely on the quality setting (10–100%). At 85% or above, the data loss is generally imperceptible to the human eye. Below 50%, you will begin to see noticeable blocking artifacts.' },
                { q: 'What does the quality slider actually do?', a: 'The quality slider (available for JPEG and WebP exports) dictates the compression algorithm\'s aggressiveness. Lowering the slider forces the algorithm to discard more data, resulting in a much smaller file size at the cost of visual fidelity. A setting of 80–90% is the industry standard for web delivery.' },
                { q: 'Can I convert 100 images at the same time?', a: 'Yes! You can drag and drop massive batches of files. The tool processes them in parallel using asynchronous browser threads. You can monitor the progress of each file and click "Download All" to save them as a bulk package once finished.' },
                { q: 'Why is Google Lighthouse telling me to "Serve images in next-gen formats"?', a: 'Google Lighthouse flags legacy formats like JPEG and PNG because they are less efficient than modern formats. Converting your website assets to WebP satisfies this audit. WebP provides superior compression, which drastically improves your Largest Contentful Paint (LCP) score and overall SEO.' },
                { q: 'Does converting a PNG to a JPEG remove its transparent background?', a: 'Yes. The JPEG format mathematically cannot support an alpha channel (transparency). When converting a transparent PNG to JPEG, the converter automatically fills the transparent regions with a solid white background. If you need to keep the background transparent while reducing file size, convert the PNG to a WebP instead.' },
                { q: 'Is there a file size limit for uploads?', a: 'Because the tool operates entirely locally without server constraints, there is no hard-coded file size limit. The limit is dictated purely by your computer\'s available RAM. Most modern laptops can easily process individual images up to 50MB, though extremely massive files (e.g., 200MB TIFFs) might cause the browser tab to lag or crash.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 transition-colors select-none">
                    <span className="text-base pr-4">{q}</span>
                    <span className="text-slate-400 text-2xl group-open:rotate-45 transition-transform flex-shrink-0 leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}