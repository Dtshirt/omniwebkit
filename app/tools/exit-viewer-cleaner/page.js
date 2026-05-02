'use client';
import { useState, useCallback, useRef } from 'react';
import { Upload, Eye, EyeOff, Download, X, ImageIcon, AlertCircle, CheckCircle, Camera, MapPin, Calendar, Aperture, Shield, ShieldAlert, ShieldCheck, FileText, Copy, Check } from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

function DataRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-start gap-4 py-1.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 font-medium min-w-[130px] text-xs">{label}</span>
      <span className={`font-semibold text-right break-all text-xs ${highlight === 'danger' ? 'text-red-600 dark:text-red-400' :
          highlight === 'warning' ? 'text-amber-600 dark:text-amber-400' :
            highlight === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
              'text-slate-900 dark:text-white'
        }`}>{value}</span>
    </div>
  );
}

/* ─── EXIF parsing (full native implementation) ─────────────────────────── */
function readString(view, tiffOffset, valueOffset, count, type, littleEndian) {
  if (count > 4 && type === 2) {
    const off = tiffOffset + view.getUint32(valueOffset, littleEndian);
    if (off + count > view.byteLength) return null;
    let s = '';
    for (let i = 0; i < Math.min(count - 1, 200); i++) {
      const c = view.getUint8(off + i); if (c === 0) break; s += String.fromCharCode(c);
    }
    return s.trim() || null;
  } else if (count <= 4 && type === 2) {
    let s = '';
    for (let i = 0; i < Math.min(count - 1, 4); i++) {
      const c = view.getUint8(valueOffset + i); if (c === 0) break; s += String.fromCharCode(c);
    }
    return s.trim() || null;
  }
  return null;
}

function readRational(view, tiffOffset, valueOffset, littleEndian) {
  const off = tiffOffset + view.getUint32(valueOffset, littleEndian);
  if (off + 7 >= view.byteLength) return null;
  const num = view.getUint32(off, littleEndian);
  const den = view.getUint32(off + 4, littleEndian);
  return den !== 0 ? num / den : null;
}

function readGPSCoord(view, tiffOffset, valueOffset, count, littleEndian) {
  if (count !== 3) return null;
  const off = tiffOffset + view.getUint32(valueOffset, littleEndian);
  if (off + 23 >= view.byteLength) return null;
  const deg = view.getUint32(off, littleEndian) / view.getUint32(off + 4, littleEndian);
  const min = view.getUint32(off + 8, littleEndian) / view.getUint32(off + 12, littleEndian);
  const sec = view.getUint32(off + 16, littleEndian) / view.getUint32(off + 20, littleEndian);
  return deg + (min / 60) + (sec / 3600);
}

function parseExifBuffer(buf) {
  const view = new DataView(buf);
  const out = {
    hasExif: false, make: null, model: null, software: null, datetime: null, dateTimeOriginal: null,
    dateTimeDigitized: null, orientation: null, xResolution: null, yResolution: null, resolutionUnit: null,
    artist: null, copyright: null, exposureTime: null, fNumber: null, iso: null, focalLength: null,
    flash: null, whiteBalance: null, meteringMode: null, exposureProgram: null, colorSpace: null,
    imageDescription: null, userComment: null, gpsLatitude: null, gpsLongitude: null, gpsAltitude: null,
    gpsTimeStamp: null, gpsDateStamp: null
  };

  if (view.byteLength < 2 || view.getUint8(0) !== 0xFF || view.getUint8(1) !== 0xD8) return out;

  let offset = 2;
  while (offset < view.byteLength - 1) {
    if (view.getUint8(offset) !== 0xFF) break;
    const marker = view.getUint8(offset + 1);
    if (offset + 3 >= view.byteLength) break;
    const size = view.getUint16(offset + 2, false);
    if (marker === 0xE1 && offset + 9 < view.byteLength) {
      const id = String.fromCharCode(view.getUint8(offset + 4), view.getUint8(offset + 5), view.getUint8(offset + 6), view.getUint8(offset + 7));
      if (id === 'Exif') {
        out.hasExif = true;
        try {
          const to = offset + 10;
          const le = view.getUint16(to, false) === 0x4949;
          if (to + 7 < view.byteLength) {
            const ifd = view.getUint32(to + 4, le);
            parseIFD0(view, to, to + ifd, le, out);
          }
        } catch (e) { console.warn('EXIF parse error', e); }
        break;
      }
    }
    offset += 2 + size;
  }
  return out;
}

function parseIFD0(view, to, ifdOff, le, out) {
  if (ifdOff + 1 >= view.byteLength) return;
  const n = view.getUint16(ifdOff, le);
  for (let i = 0; i < Math.min(n, 100); i++) {
    const eo = ifdOff + 2 + (i * 12);
    if (eo + 11 >= view.byteLength) break;
    const tag = view.getUint16(eo, le), type = view.getUint16(eo + 2, le), count = view.getUint32(eo + 4, le), vo = eo + 8;
    try {
      switch (tag) {
        case 0x010F: out.make = readString(view, to, vo, count, type, le); break;
        case 0x0110: out.model = readString(view, to, vo, count, type, le); break;
        case 0x0131: out.software = readString(view, to, vo, count, type, le); break;
        case 0x0132: out.datetime = readString(view, to, vo, count, type, le); break;
        case 0x010E: out.imageDescription = readString(view, to, vo, count, type, le); break;
        case 0x013B: out.artist = readString(view, to, vo, count, type, le); break;
        case 0x8298: out.copyright = readString(view, to, vo, count, type, le); break;
        case 0x0112: out.orientation = view.getUint16(vo, le); break;
        case 0x011A: out.xResolution = readRational(view, to, vo, le); break;
        case 0x011B: out.yResolution = readRational(view, to, vo, le); break;
        case 0x0128: out.resolutionUnit = view.getUint16(vo, le); break;
        case 0x8769: parseExifIFD(view, to, to + view.getUint32(vo, le), le, out); break;
        case 0x8825: parseGPSIFD(view, to, to + view.getUint32(vo, le), le, out); break;
      }
    } catch (e) { }
  }
}

function parseExifIFD(view, to, ifdOff, le, out) {
  if (ifdOff + 1 >= view.byteLength) return;
  const n = view.getUint16(ifdOff, le);
  for (let i = 0; i < Math.min(n, 100); i++) {
    const eo = ifdOff + 2 + (i * 12);
    if (eo + 11 >= view.byteLength) break;
    const tag = view.getUint16(eo, le), type = view.getUint16(eo + 2, le), count = view.getUint32(eo + 4, le), vo = eo + 8;
    try {
      switch (tag) {
        case 0x829A: out.exposureTime = readRational(view, to, vo, le); break;
        case 0x829D: out.fNumber = readRational(view, to, vo, le); break;
        case 0x8827: out.iso = view.getUint16(vo, le); break;
        case 0x9003: out.dateTimeOriginal = readString(view, to, vo, count, type, le); break;
        case 0x9004: out.dateTimeDigitized = readString(view, to, vo, count, type, le); break;
        case 0x920A: out.focalLength = readRational(view, to, vo, le); break;
        case 0x9209: out.flash = view.getUint16(vo, le); break;
        case 0xA403: out.whiteBalance = view.getUint16(vo, le); break;
        case 0x9207: out.meteringMode = view.getUint16(vo, le); break;
        case 0x8822: out.exposureProgram = view.getUint16(vo, le); break;
        case 0xA001: out.colorSpace = view.getUint16(vo, le); break;
        case 0x9286: out.userComment = readString(view, to, vo, count, type, le); break;
      }
    } catch (e) { }
  }
}

function parseGPSIFD(view, to, ifdOff, le, out) {
  if (ifdOff + 1 >= view.byteLength) return;
  const n = view.getUint16(ifdOff, le);
  const g = {};
  for (let i = 0; i < Math.min(n, 50); i++) {
    const eo = ifdOff + 2 + (i * 12);
    if (eo + 11 >= view.byteLength) break;
    const tag = view.getUint16(eo, le), type = view.getUint16(eo + 2, le), count = view.getUint32(eo + 4, le), vo = eo + 8;
    try {
      switch (tag) {
        case 0x0001: g.latRef = readString(view, to, vo, count, type, le); break;
        case 0x0002: g.lat = readGPSCoord(view, to, vo, count, le); break;
        case 0x0003: g.lonRef = readString(view, to, vo, count, type, le); break;
        case 0x0004: g.lon = readGPSCoord(view, to, vo, count, le); break;
        case 0x0005: g.altRef = view.getUint8(vo); break;
        case 0x0006: g.alt = readRational(view, to, vo, le); break;
        case 0x001D: g.date = readString(view, to, vo, count, type, le); break;
      }
    } catch (e) { }
  }
  if (g.lat != null && g.lon != null) {
    out.gpsLatitude = (g.lat * (g.latRef === 'S' ? -1 : 1)).toFixed(6);
    out.gpsLongitude = (g.lon * (g.lonRef === 'W' ? -1 : 1)).toFixed(6);
  }
  if (g.alt != null) out.gpsAltitude = `${g.alt.toFixed(1)}m ${g.altRef === 1 ? 'below' : 'above'} sea level`;
  if (g.date) out.gpsDateStamp = g.date;
}

/* ─── Label decoders ────────────────────────────────────────────────────── */
const ORIENTATIONS = ['', 'Normal', 'Flipped H', 'Rotated 180°', 'Flipped V', '90° CCW + Flip', '90° CW', '90° CW + Flip', '90° CCW'];
const METERING = ['Unknown', 'Average', 'Center-weighted', 'Spot', 'Multi-spot', 'Pattern', 'Partial'];
const EXP_PROG = ['Not defined', 'Manual', 'Normal', 'Aperture priority', 'Shutter priority', 'Creative', 'Action', 'Portrait', 'Landscape'];
const getOrientation = v => ORIENTATIONS[v] ?? v;
const getFlash = v => v & 1 ? 'Fired' : 'Did not fire';
const getWB = v => v === 0 ? 'Auto' : 'Manual';
const getMetering = v => METERING[v] ?? `Mode ${v}`;
const getColorSpace = v => v === 1 ? 'sRGB' : v === 0xFFFF ? 'Uncalibrated' : `Unknown (${v})`;
const getExpProg = v => EXP_PROG[v] ?? `Unknown (${v})`;

/* ─── Privacy risk score ────────────────────────────────────────────────── */
function calcRisk(exif) {
  if (!exif?.hasExif) return { score: 0, level: 'none' };
  let score = 0;
  if (exif.gpsLatitude) score += 40;
  if (exif.dateTimeOriginal) score += 20;
  if (exif.make || exif.model) score += 15;
  if (exif.artist || exif.copyright) score += 15;
  if (exif.software) score += 5;
  if (exif.userComment || exif.imageDescription) score += 5;
  const level = score >= 60 ? 'high' : score >= 25 ? 'medium' : score > 0 ? 'low' : 'none';
  return { score: Math.min(score, 100), level };
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function ExifViewerCleaner() {
  const [image, setImage] = useState(null);
  const [exifData, setExifData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showExif, setShowExif] = useState(true);
  const [notification, setNotification] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const notify = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const processFile = async (file) => {
    if (!file?.type.startsWith('image/')) { notify('Please upload a valid image file (JPEG, PNG, WEBP, HEIC…)', 'error'); return; }
    setLoading(true); setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const exif = parseExifBuffer(buf);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setImage(ev.target.result);
          setExifData({ ...exif, format: file.type.split('/')[1].toUpperCase(), fileSize: (file.size / 1024).toFixed(1) + ' KB', dimensions: `${img.width} × ${img.height}`, width: img.width, height: img.height, lastModified: new Date(file.lastModified).toLocaleString() });
          setLoading(false);
          notify('Image loaded and analyzed');
        };
        img.onerror = () => { setLoading(false); notify('Could not decode image', 'error'); };
        img.src = ev.target.result;
      };
      reader.onerror = () => { setLoading(false); notify('Could not read file', 'error'); };
      reader.readAsDataURL(file);
    } catch (e) { setLoading(false); notify('Error processing image', 'error'); }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleFile = (e) => { const f = e.target.files?.[0]; if (f) processFile(f); };

  const removeExif = useCallback(() => {
    if (!image || !exifData) return;
    setLoading(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d').drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target.result);
          setExifData({ format: 'JPEG', fileSize: (blob.size / 1024).toFixed(1) + ' KB', dimensions: exifData.dimensions, width: exifData.width, height: exifData.height, hasExif: false, cleaned: true, lastModified: new Date().toLocaleString() });
          setLoading(false); notify('All EXIF metadata removed — image is now privacy-safe');
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.95);
    };
    img.src = image;
  }, [image, exifData]);

  const downloadImage = () => {
    if (!image) return;
    Object.assign(document.createElement('a'), { href: image, download: exifData?.cleaned ? `cleaned_${fileName}` : fileName }).click();
    notify('Image downloaded');
  };

  const exportJSON = () => {
    if (!exifData) return;
    const clean = Object.fromEntries(Object.entries(exifData).filter(([, v]) => v !== null && v !== false));
    const blob = new Blob([JSON.stringify(clean, null, 2)], { type: 'application/json' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${fileName}_exif.json` }).click();
    notify('EXIF data exported as JSON');
  };

  const copyExif = () => {
    if (!exifData) return;
    const lines = Object.entries(exifData).filter(([, v]) => v !== null && v !== false).map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(lines).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const reset = () => { setImage(null); setExifData(null); setFileName(''); setShowExif(true); };

  const risk = calcRisk(exifData);
  const RiskBadge = () => {
    const map = {
      none: { cls: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', label: 'No EXIF', Icon: Shield },
      low: { cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', label: 'Low Risk', Icon: ShieldCheck },
      medium: { cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', label: 'Medium Risk', Icon: ShieldAlert },
      high: { cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', label: 'High Risk', Icon: ShieldAlert }
    };
    const { cls, label, Icon } = map[risk.level];
    return <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${cls}`}><Icon className="w-3.5 h-3.5" />{label}</span>;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
      {/* Toast notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-2xl mb-4">
            <Camera className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">EXIF Viewer & Cleaner</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">View complete image metadata and strip EXIF data to protect your privacy</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Upload + controls panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`${cardCls} p-6 shadow-sm`}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />Upload Image
              </h2>

              {!image ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${dragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                  <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={loading} />
                  <Upload className={`mx-auto mb-3 ${dragging ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`} size={44} />
                  <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">{loading ? 'Processing…' : 'Drop image here, or click to browse'}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">JPEG, PNG, WEBP, HEIC, TIFF supported</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <img src={image} alt="Uploaded" className="w-full h-auto max-h-64 object-contain" />
                    <button onClick={reset} className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-xl shadow transition">
                      <X className="w-4 h-4" />
                    </button>
                    {exifData?.cleaned && (
                      <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-lg">✓ EXIF Removed</div>
                    )}
                  </div>

                  {exifData && (
                    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate max-w-[160px]">{fileName}</p>
                        <p className="text-slate-400 text-xs">{exifData.fileSize} · {exifData.dimensions}</p>
                      </div>
                      <RiskBadge />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={removeExif} disabled={loading || exifData?.cleaned}
                      className="py-3 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5">
                      <EyeOff className="w-4 h-4" />{exifData?.cleaned ? 'Cleaned' : 'Remove EXIF'}
                    </button>
                    <button onClick={downloadImage}
                      className="py-3 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5">
                      <Download className="w-4 h-4" />Download
                    </button>
                    <button onClick={exportJSON} disabled={!exifData}
                      className="py-3 px-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5">
                      <FileText className="w-4 h-4" />Export JSON
                    </button>
                    <button onClick={copyExif} disabled={!exifData}
                      className={`py-3 px-3 ${copied ? 'bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'} disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-1.5`}>
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}{copied ? 'Copied!' : 'Copy All'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy risk panel */}
            {exifData && !exifData.cleaned && (
              <div className={`${cardCls} p-5 shadow-sm`}>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />Privacy Risk Assessment
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${risk.level === 'high' ? 'bg-red-500' : risk.level === 'medium' ? 'bg-amber-500' : risk.level === 'low' ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      style={{ width: `${risk.score}%` }} />
                  </div>
                  <span className={`text-sm font-bold ${risk.level === 'high' ? 'text-red-600 dark:text-red-400' : risk.level === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {risk.score}%
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {exifData.gpsLatitude && <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold"><MapPin className="w-3 h-3" />GPS location embedded — HIGH risk</div>}
                  {exifData.dateTimeOriginal && <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400"><Calendar className="w-3 h-3" />Date/time when photo was taken</div>}
                  {(exifData.make || exifData.model) && <div className="flex items-center gap-2"><Camera className="w-3 h-3" />Device make and model exposed</div>}
                  {!exifData.gpsLatitude && !exifData.dateTimeOriginal && !exifData.make && <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400"><CheckCircle className="w-3 h-3" />No high-risk metadata found</div>}
                </div>
              </div>
            )}
          </div>

          {/* Metadata panel */}
          <div className={`lg:col-span-3 ${cardCls} p-6 shadow-sm`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />Metadata Analysis
              </h2>
              {exifData && (
                <button onClick={() => setShowExif(v => !v)} className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition" title={showExif ? 'Hide metadata' : 'Show metadata'}>
                  {showExif ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>

            {!exifData ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700">
                <ImageIcon size={56} className="mb-4" />
                <p className="text-slate-500 dark:text-slate-500 text-center">Upload an image to view its embedded metadata</p>
              </div>
            ) : !showExif ? (
              <div className="flex items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                <EyeOff className="w-6 h-6 mr-2" /><span>Metadata hidden</span>
              </div>
            ) : (
              <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
                {/* Cleaned banner */}
                {exifData.cleaned && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" size={20} />
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">EXIF Removed Successfully</p>
                      <p className="text-emerald-600 dark:text-emerald-400 text-xs">This image no longer contains any EXIF metadata.</p>
                    </div>
                  </div>
                )}

                {/* Privacy warning */}
                {exifData.hasExif && !exifData.cleaned && (
                  <div className={`border rounded-xl p-4 ${risk.level === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'}`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`flex-shrink-0 mt-0.5 ${risk.level === 'high' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`} size={18} />
                      <div>
                        <p className={`font-bold text-sm mb-1 ${risk.level === 'high' ? 'text-red-800 dark:text-red-300' : 'text-amber-800 dark:text-amber-300'}`}>
                          {risk.level === 'high' ? '⚠️ High Privacy Risk — GPS data found' : 'Privacy notice — EXIF metadata present'}
                        </p>
                        <p className={`text-xs ${risk.level === 'high' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          Click "Remove EXIF" to strip all metadata before sharing this image publicly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* No EXIF */}
                {!exifData.hasExif && !exifData.cleaned && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
                    <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={18} />
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">No EXIF data found</p>
                      <p className="text-emerald-600 dark:text-emerald-400 text-xs">This image is privacy-safe out of the box.</p>
                    </div>
                  </div>
                )}

                {/* File info */}
                <Section title="File Information" icon={<ImageIcon className="w-4 h-4" />} color="slate">
                  <DataRow label="File name" value={fileName} />
                  <DataRow label="Format" value={exifData.format} />
                  <DataRow label="File size" value={exifData.fileSize} />
                  <DataRow label="Dimensions" value={exifData.dimensions} />
                  <DataRow label="Last modified" value={exifData.lastModified} />
                </Section>

                {/* GPS */}
                {(exifData.gpsLatitude || exifData.gpsLongitude) && (
                  <Section title="GPS Location — Privacy Risk" icon={<MapPin className="w-4 h-4" />} color="red">
                    {exifData.gpsLatitude && <DataRow label="Latitude" value={exifData.gpsLatitude} highlight="danger" />}
                    {exifData.gpsLongitude && <DataRow label="Longitude" value={exifData.gpsLongitude} highlight="danger" />}
                    {exifData.gpsAltitude && <DataRow label="Altitude" value={exifData.gpsAltitude} highlight="danger" />}
                    {exifData.gpsDateStamp && <DataRow label="GPS Date" value={exifData.gpsDateStamp} />}
                    {exifData.gpsLatitude && exifData.gpsLongitude && (
                      <a href={`https://www.openstreetmap.org/?mlat=${exifData.gpsLatitude}&mlon=${exifData.gpsLongitude}&zoom=15`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
                        <MapPin className="w-3 h-3" />View on OpenStreetMap →
                      </a>
                    )}
                  </Section>
                )}

                {/* Camera */}
                {(exifData.make || exifData.model || exifData.software) && (
                  <Section title="Camera & Device" icon={<Camera className="w-4 h-4" />} color="blue">
                    {exifData.make && <DataRow label="Make" value={exifData.make} />}
                    {exifData.model && <DataRow label="Model" value={exifData.model} />}
                    {exifData.software && <DataRow label="Software" value={exifData.software} />}
                    {exifData.orientation && <DataRow label="Orientation" value={getOrientation(exifData.orientation)} />}
                  </Section>
                )}

                {/* Camera settings */}
                {(exifData.exposureTime || exifData.fNumber || exifData.iso || exifData.focalLength) && (
                  <Section title="Camera Settings" icon={<Aperture className="w-4 h-4" />} color="violet">
                    {exifData.exposureTime && <DataRow label="Exposure" value={`1/${Math.round(1 / exifData.exposureTime)}s`} />}
                    {exifData.fNumber && <DataRow label="Aperture" value={`f/${exifData.fNumber.toFixed(1)}`} />}
                    {exifData.iso && <DataRow label="ISO" value={exifData.iso} />}
                    {exifData.focalLength && <DataRow label="Focal length" value={`${exifData.focalLength.toFixed(1)}mm`} />}
                    {exifData.flash != null && <DataRow label="Flash" value={getFlash(exifData.flash)} />}
                    {exifData.whiteBalance != null && <DataRow label="White balance" value={getWB(exifData.whiteBalance)} />}
                    {exifData.meteringMode && <DataRow label="Metering" value={getMetering(exifData.meteringMode)} />}
                    {exifData.exposureProgram && <DataRow label="Exp. program" value={getExpProg(exifData.exposureProgram)} />}
                    {exifData.colorSpace != null && <DataRow label="Color space" value={getColorSpace(exifData.colorSpace)} />}
                  </Section>
                )}

                {/* Date/time */}
                {(exifData.datetime || exifData.dateTimeOriginal || exifData.dateTimeDigitized) && (
                  <Section title="Date & Time" icon={<Calendar className="w-4 h-4" />} color="amber">
                    {exifData.dateTimeOriginal && <DataRow label="Date taken" value={exifData.dateTimeOriginal} highlight="warning" />}
                    {exifData.datetime && <DataRow label="Modified" value={exifData.datetime} />}
                    {exifData.dateTimeDigitized && <DataRow label="Digitized" value={exifData.dateTimeDigitized} />}
                  </Section>
                )}

                {/* Extra */}
                {(exifData.artist || exifData.copyright || exifData.imageDescription || exifData.xResolution) && (
                  <Section title="Additional Metadata" icon={<FileText className="w-4 h-4" />} color="slate">
                    {exifData.artist && <DataRow label="Artist" value={exifData.artist} />}
                    {exifData.copyright && <DataRow label="Copyright" value={exifData.copyright} />}
                    {exifData.imageDescription && <DataRow label="Description" value={exifData.imageDescription} />}
                    {exifData.userComment && <DataRow label="User comment" value={exifData.userComment} />}
                    {exifData.xResolution && <DataRow label="X resolution" value={`${exifData.xResolution.toFixed(0)} dpi`} />}
                    {exifData.yResolution && <DataRow label="Y resolution" value={`${exifData.yResolution.toFixed(0)} dpi`} />}
                  </Section>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-14 space-y-5">
          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free EXIF Viewer & Metadata Cleaner — Remove Hidden Data from Your Photos</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every photo you take with a smartphone or digital camera contains far more than just the image itself. Embedded inside the file is a block of hidden data called EXIF metadata — short for Exchangeable Image File Format. This metadata records detailed information about when, where, and how the photo was taken. In many cases, it includes your exact GPS location, the make and model of your device, the software you're running, and even the precise timestamp down to the second.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit EXIF Viewer and Cleaner lets you read and remove this hidden data in seconds — completely free, with no upload to any server. Your images never leave your device. Everything is processed locally in your browser.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Drop any JPEG file onto the tool, and it will parse the raw binary EXIF data and display it in a clear, categorized format: file info, GPS location (with a direct map link), camera make and model, camera settings (exposure, aperture, ISO, focal length, white balance), dates and times, and any additional metadata like artist, copyright, and user comments. A privacy risk score tells you at a glance how much sensitive information is buried in the file.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">What EXIF Metadata Can Reveal About You</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Most people have no idea how much information a simple photo can expose. Here is a breakdown of the most sensitive categories of EXIF data and why each matters:
            </p>
            <div className="space-y-3">
              {[
                { icon: '📍', title: 'GPS Coordinates', body: 'This is the biggest privacy risk. When location services are enabled on your phone, every photo stores the exact latitude and longitude where it was taken — accurate to a few meters. Post that photo online, and anyone can determine your home address, where you work, which gym you go to, and places you visit regularly. This tool detects GPS data, displays it on a map link, and lets you remove it before sharing.' },
                { icon: '📅', title: 'Timestamps', body: 'EXIF stores three timestamps: when the photo was taken, when it was digitized, and when the file was last modified. Timestamps can reveal your daily patterns, confirm your alibi (or undermine it), or expose that you were at a certain place at a certain time — information you may not intend to share.' },
                { icon: '📷', title: 'Device Information', body: 'The camera make and model embedded in EXIF data can be used to identify which device you own. Combined with other metadata, this creates a fingerprint that can link photos taken on different platforms back to the same person. Journalists, activists, and privacy-conscious users should always clean this data before publishing.' },
                { icon: '🖥️', title: 'Software Details', body: 'EXIF records which software processed or edited the image — Adobe Lightroom, Apple Photos, Instagram, and so on. This tells an observer how and when the image was edited, and which platform or operating system you use.' },
                { icon: '🔒', title: 'Copyright and Artist Fields', body: 'If you\'ve set your camera to embed your name or copyright notice in every photo, that personal information travels with the file wherever it goes. For anonymous publishing, this needs to be removed first.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Remove EXIF Data Before Sharing Photos</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The safest approach is to strip EXIF data before posting any photo online — especially photos taken at home, personal locations, or private events. Here's how to do it with this tool in four steps:
            </p>
            <ol className="space-y-3">
              {[
                'Upload your JPEG image by clicking the upload area or dragging and dropping it in.',
                'Review the metadata analysis panel on the right. Check for GPS coordinates and any other data you want to remove.',
                'Click Remove EXIF to create a clean copy of the image with all metadata stripped.',
                'Click Download to save the clean image. The downloaded file will be named cleaned_[yourfile].jpg.',
              ].map((step, i) => (
                <li key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-300">
              <strong>Note:</strong> The EXIF removal works by redrawing the image on an HTML canvas and exporting it as a new JPEG. This process removes all metadata embedded in the original file. The visual quality is preserved at 95% JPEG quality.
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this EXIF viewer free?', a: 'Yes, completely free. No account, no subscription, no upload to any server. Everything runs locally in your browser using JavaScript.' },
                { q: 'Is my image uploaded anywhere?', a: 'No. Your image is never sent to any server. All EXIF parsing and metadata removal happens entirely within your browser. The image stays on your device throughout the process.' },
                { q: 'What image formats are supported?', a: 'EXIF data is primarily stored in JPEG files. PNG, WebP, and other formats typically do not contain EXIF data (PNG uses its own metadata format). This tool will read and display any available EXIF from JPEG images and can analyze basic file information from other formats.' },
                { q: 'Does removing EXIF affect image quality?', a: 'The EXIF removal process redraws the image on an HTML canvas and exports it at 95% JPEG quality. The visual difference is imperceptible for most images. File size may change slightly.' },
                { q: 'Will major social media platforms remove EXIF automatically?', a: 'Many platforms (Facebook, Instagram, Twitter) strip EXIF data on upload — but not all do, and you should not rely on this. LinkedIn and some file-sharing sites preserve EXIF data. It is safer to remove it yourself before uploading to any platform.' },
                { q: 'Can I export the EXIF data?', a: 'Yes. Click Export JSON to download the parsed metadata as a .json file, or click Copy All to copy all metadata fields to your clipboard as plain text.' },
                { q: 'What is the privacy risk score?', a: 'The privacy risk score is calculated based on which sensitive fields are present: GPS coordinates contribute most (40 points), followed by timestamps (20 points), device info (15 points), and other personal fields. A score above 60% indicates high risk — this almost always means GPS data is present.' },
                { q: 'Does the GPS map link share my location?', a: 'The map link opens OpenStreetMap in a new tab showing the location embedded in the photo. It does not share your current location — it only reads the coordinates from the image EXIF data.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
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

/* ─── Section wrapper ───────────────────────────────────────────────────── */
const SECTION_COLORS = {
  slate: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300',
  blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
  violet: 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300',
  amber: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
  red: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
};

function Section({ title, icon, color = 'slate', children }) {
  const cls = SECTION_COLORS[color];
  return (
    <div className={`rounded-xl p-4 border ${cls}`}>
      <h3 className="font-bold text-sm mb-3 flex items-center gap-2">{icon}{title}</h3>
      <div className="space-y-0">{children}</div>
    </div>
  );
}