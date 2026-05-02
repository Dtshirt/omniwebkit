'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  ImageIcon, Type, Settings, Download, Upload,
  RotateCcw, Zap, CheckCircle, Grid3X3
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

const POSITIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Centre' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'middle-left', label: 'Middle Left' },
  { value: 'middle-center', label: 'Centre' },
  { value: 'middle-right', label: 'Middle Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Centre' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

/* ─── Canvas watermark helpers ──────────────────────────────────────────── */
function getXY(position, canvasW, canvasH, wW, wH, margin) {
  const [vert, horiz] = position.split('-');
  let x, y;
  if (horiz === 'left') x = margin;
  else if (horiz === 'right') x = canvasW - wW - margin;
  else x = (canvasW - wW) / 2;
  if (vert === 'top') y = margin;
  else if (vert === 'bottom') y = canvasH - wH - margin;
  else y = (canvasH - wH) / 2;
  return { x, y };
}

async function loadImg(src) {
  return new Promise((res, rej) => {
    const img = new window.Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error('Failed to load image'));
    img.src = src;
  });
}

async function applyTextWatermark(mainSrc, cfg) {
  const base = await loadImg(mainSrc);
  const canvas = document.createElement('canvas');
  canvas.width = base.naturalWidth;
  canvas.height = base.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(base, 0, 0);

  const fontSize = Math.max(cfg.fontSize, 8);
  ctx.save();
  ctx.globalAlpha = cfg.opacity;
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.fillStyle = cfg.color;

  const metrics = ctx.measureText(cfg.text);
  const textW = metrics.width + cfg.padding * 2;
  const textH = fontSize + cfg.padding * 2;
  const { x, y } = getXY(cfg.position, canvas.width, canvas.height, textW, textH, cfg.margin);

  if (cfg.rotation !== 0) {
    ctx.translate(x + textW / 2, y + textH / 2);
    ctx.rotate((cfg.rotation * Math.PI) / 180);
    ctx.translate(-(textW / 2), -(textH / 2));
    if (cfg.backgroundColor) {
      ctx.fillStyle = cfg.backgroundColor;
      ctx.fillRect(0, 0, textW, textH);
    }
    ctx.fillStyle = cfg.color;
    ctx.fillText(cfg.text, cfg.padding, fontSize + cfg.padding - 2);
  } else {
    if (cfg.backgroundColor) {
      ctx.fillStyle = cfg.backgroundColor;
      ctx.fillRect(x, y, textW, textH);
    }
    ctx.fillStyle = cfg.color;
    ctx.fillText(cfg.text, x + cfg.padding, y + fontSize + cfg.padding - 2);
  }
  ctx.restore();

  return new Promise(res => canvas.toBlob(res, 'image/png'));
}

async function applyImageWatermark(mainSrc, wmSrc, cfg) {
  const [base, wm] = await Promise.all([loadImg(mainSrc), loadImg(wmSrc)]);
  const canvas = document.createElement('canvas');
  canvas.width = base.naturalWidth;
  canvas.height = base.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(base, 0, 0);

  const wmW = base.naturalWidth * cfg.scale;
  const wmH = (wm.naturalHeight / wm.naturalWidth) * wmW;
  const { x, y } = getXY(cfg.position, canvas.width, canvas.height, wmW, wmH, cfg.margin);

  ctx.save();
  ctx.globalAlpha = cfg.opacity;
  if (cfg.rotation !== 0) {
    ctx.translate(x + wmW / 2, y + wmH / 2);
    ctx.rotate((cfg.rotation * Math.PI) / 180);
    ctx.drawImage(wm, -wmW / 2, -wmH / 2, wmW, wmH);
  } else {
    ctx.drawImage(wm, x, y, wmW, wmH);
  }
  ctx.restore();

  return new Promise(res => canvas.toBlob(res, 'image/png'));
}

async function applyTiledWatermark(mainSrc, cfg) {
  const base = await loadImg(mainSrc);
  const canvas = document.createElement('canvas');
  canvas.width = base.naturalWidth;
  canvas.height = base.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(base, 0, 0);

  ctx.save();
  ctx.globalAlpha = cfg.opacity;
  ctx.font = `bold ${cfg.fontSize}px sans-serif`;
  ctx.fillStyle = cfg.color || '#FFFFFF';

  const rad = (cfg.rotation * Math.PI) / 180;
  const sp = cfg.spacing;
  for (let col = -canvas.width; col < canvas.width * 2; col += sp) {
    for (let row = -canvas.height; row < canvas.height * 2; row += sp) {
      ctx.save();
      ctx.translate(col, row);
      ctx.rotate(rad);
      ctx.fillText(cfg.text, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();

  return new Promise(res => canvas.toBlob(res, 'image/png'));
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function ImageWatermark() {
  const [mainImage, setMainImage] = useState(null);
  const [wmImage, setWmImage] = useState(null);
  const [wmType, setWmType] = useState('text');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [textCfg, setTextCfg] = useState({
    text: 'OmniWebKit.com', fontSize: 24, color: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.45)', opacity: 0.85,
    position: 'bottom-right', margin: 16, padding: 10, rotation: 0,
  });
  const [imgCfg, setImgCfg] = useState({
    opacity: 0.7, scale: 0.2, position: 'bottom-right', margin: 16, rotation: 0,
  });
  const [tileCfg, setTileCfg] = useState({
    text: 'OmniWebKit.com', fontSize: 28, color: '#FFFFFF',
    opacity: 0.12, spacing: 220, rotation: -45,
  });

  const mainFileRef = useRef(null);
  const wmFileRef = useRef(null);

  /* ── Helpers ── */
  const setTxt = (k, v) => setTextCfg(p => ({ ...p, [k]: v }));
  const setImg = (k, v) => setImgCfg(p => ({ ...p, [k]: v }));
  const setTile = (k, v) => setTileCfg(p => ({ ...p, [k]: v }));

  const handleMainFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setMainImage({ file, preview: URL.createObjectURL(file) });
    setResult(null); setError(''); setSuccess(false);
  };

  const handleWmFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setWmImage({ file, preview: URL.createObjectURL(file) });
  };

  /* ── Apply watermark ── */
  const apply = async () => {
    if (!mainImage) { setError('Please upload an image first.'); return; }
    if (wmType === 'image' && !wmImage) { setError('Please select a watermark image.'); return; }
    setError(''); setProcessing(true); setSuccess(false);
    try {
      let blob;
      if (wmType === 'text') blob = await applyTextWatermark(mainImage.preview, textCfg);
      if (wmType === 'image') blob = await applyImageWatermark(mainImage.preview, wmImage.preview, imgCfg);
      if (wmType === 'tiled') blob = await applyTiledWatermark(mainImage.preview, tileCfg);
      setResult({ blob, url: URL.createObjectURL(blob) });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError('Watermark failed: ' + e.message);
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    Object.assign(document.createElement('a'), {
      href: result.url,
      download: `watermarked_${Date.now()}.png`,
    }).click();
  };

  const reset = () => {
    setMainImage(null); setWmImage(null); setResult(null); setError(''); setSuccess(false);
  };

  /* ── Shared slider ── */
  const Slider = ({ label, value, min, max, step = 1, onChange, display }) => (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</label>
        <span className="text-xs font-bold text-slate-900 dark:text-white">{display ?? value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-teal-500" />
    </div>
  );

  const selectCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-teal-500 transition';
  const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-teal-500 transition placeholder-slate-400';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Watermark Tool', href: '/tools/image-watermark' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-teal-500/25">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Image Watermark</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Add text, logo, or tiled watermarks to your images — free, instant, browser-based</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-teal-500" />Watermark Settings
              </h2>

              {/* Type selector */}
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Watermark Type</p>
              <div className="grid grid-cols-3 gap-1.5 mb-5">
                {[
                  { val: 'text', Icon: Type, label: 'Text' },
                  { val: 'image', Icon: ImageIcon, label: 'Logo' },
                  { val: 'tiled', Icon: Grid3X3, label: 'Tiled' },
                ].map(({ val, Icon, label }) => (
                  <button key={val} onClick={() => setWmType(val)}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-bold transition-all ${wmType === val
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10 text-teal-700 dark:text-teal-400'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                      }`}>
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* ── TEXT settings ── */}
              {wmType === 'text' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Watermark Text</label>
                    <input type="text" value={textCfg.text} onChange={e => setTxt('text', e.target.value)}
                      placeholder="e.g. © YourBrand.com" className={inputCls} />
                  </div>
                  <Slider label="Font Size" value={textCfg.fontSize} min={8} max={96}
                    onChange={v => setTxt('fontSize', v)} display={`${textCfg.fontSize}px`} />
                  <Slider label="Opacity" value={textCfg.opacity} min={0.05} max={1} step={0.05}
                    onChange={v => setTxt('opacity', v)} display={`${Math.round(textCfg.opacity * 100)}%`} />
                  <Slider label="Rotation" value={textCfg.rotation} min={-90} max={90}
                    onChange={v => setTxt('rotation', v)} display={`${textCfg.rotation}°`} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Text Color</label>
                      <input type="color" value={textCfg.color} onChange={e => setTxt('color', e.target.value)}
                        className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Position</label>
                      <select value={textCfg.position} onChange={e => setTxt('position', e.target.value)} className={selectCls}>
                        {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* ── IMAGE (Logo) settings ── */}
              {wmType === 'image' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Watermark Image (Logo)</label>
                    <button onClick={() => wmFileRef.current?.click()}
                      className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-400 text-slate-500 dark:text-slate-400 hover:text-teal-600 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2">
                      <Upload className="w-3.5 h-3.5" />{wmImage ? 'Change Logo' : 'Upload Logo / Image'}
                    </button>
                    <input ref={wmFileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleWmFile(e.target.files[0])} />
                    {wmImage && <img src={wmImage.preview} alt="Logo" className="mt-2 w-16 h-16 object-contain rounded-lg border border-slate-200 dark:border-slate-700" />}
                  </div>
                  <Slider label="Logo Size" value={imgCfg.scale} min={0.05} max={0.6} step={0.05}
                    onChange={v => setImg('scale', v)} display={`${Math.round(imgCfg.scale * 100)}%`} />
                  <Slider label="Opacity" value={imgCfg.opacity} min={0.05} max={1} step={0.05}
                    onChange={v => setImg('opacity', v)} display={`${Math.round(imgCfg.opacity * 100)}%`} />
                  <Slider label="Rotation" value={imgCfg.rotation} min={-90} max={90}
                    onChange={v => setImg('rotation', v)} display={`${imgCfg.rotation}°`} />
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Position</label>
                    <select value={imgCfg.position} onChange={e => setImg('position', e.target.value)} className={selectCls}>
                      {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* ── TILED settings ── */}
              {wmType === 'tiled' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Watermark Text</label>
                    <input type="text" value={tileCfg.text} onChange={e => setTile('text', e.target.value)}
                      placeholder="e.g. CONFIDENTIAL" className={inputCls} />
                  </div>
                  <Slider label="Font Size" value={tileCfg.fontSize} min={12} max={72}
                    onChange={v => setTile('fontSize', v)} display={`${tileCfg.fontSize}px`} />
                  <Slider label="Opacity" value={tileCfg.opacity} min={0.03} max={0.4} step={0.01}
                    onChange={v => setTile('opacity', v)} display={`${Math.round(tileCfg.opacity * 100)}%`} />
                  <Slider label="Tile Spacing" value={tileCfg.spacing} min={80} max={500} step={20}
                    onChange={v => setTile('spacing', v)} display={`${tileCfg.spacing}px`} />
                  <Slider label="Rotation" value={tileCfg.rotation} min={-90} max={90}
                    onChange={v => setTile('rotation', v)} display={`${tileCfg.rotation}°`} />
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Text Color</label>
                    <input type="color" value={tileCfg.color || '#ffffff'} onChange={e => setTile('color', e.target.value)}
                      className="w-full h-9 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer" />
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 font-semibold">{error}</div>
              )}

              {/* Apply button */}
              <button onClick={apply} disabled={processing || !mainImage}
                className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-teal-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {processing
                  ? <><RotateCcw className="w-4 h-4 animate-spin" />Applying…</>
                  : success
                    ? <><CheckCircle className="w-4 h-4" />Applied!</>
                    : <><Zap className="w-4 h-4" />Apply Watermark</>}
              </button>

              {(mainImage || result) && (
                <button onClick={reset} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />Reset All
                </button>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* Drop zone */}
            <div className={cardCls}>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleMainFile(e.dataTransfer.files?.[0]); }}
                onClick={() => mainFileRef.current?.click()}
                className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${dragOver ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/10'
                    : mainImage ? 'border-slate-200 dark:border-slate-700 hover:border-teal-400'
                      : 'border-slate-300 dark:border-slate-600 hover:border-teal-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                  }`}>
                <input ref={mainFileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => e.target.files?.[0] && handleMainFile(e.target.files[0])} />
                {mainImage ? (
                  <img src={mainImage.preview} alt="Source" className="max-h-64 mx-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700" />
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-3 shadow-md shadow-teal-500/20">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{dragOver ? 'Drop image here!' : 'Upload Image to Watermark'}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['JPG', 'PNG', 'WebP', 'GIF', 'BMP'].map(f => (
                        <span key={f} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{f}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Result */}
            {result && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />Watermarked Image
                  </h3>
                  <button onClick={download}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition shadow-sm">
                    <Download className="w-3.5 h-3.5" />Download PNG
                  </button>
                </div>
                <img src={result.url} alt="Watermarked" className="max-w-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
              </div>
            )}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-12 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Image Watermark Tool — Add Text, Logo & Tiled Watermarks to Photos</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A watermark is a visible overlay added to an image to identify who created it or owns it. Photographers use watermarks to stop others from using their photos without permission. Businesses use them to brand images before sharing on social media. Designers add "DRAFT" or "CONFIDENTIAL" text watermarks to documents before client review. The OmniWebKit Image Watermark tool lets you do all of this directly in your browser — no account required, no file upload to a server, completely free.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Upload any image, choose your watermark type (text, logo, or tiled pattern), customise every setting — font size, opacity, position, rotation, colour — and download the watermarked image as a PNG file in seconds. All processing runs client-side using the HTML5 Canvas API. Your original images remain private.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Three watermark modes cover every use case: a single text label at any of nine positions for simple branding, a logo overlay for professional watermarks with your own image/icon, and a tiled repeating pattern for maximum copyright protection. Each mode has full controls for opacity, rotation, and positioning.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Three Watermark Types — What Each One Does</h2>
            <div className="space-y-3">
              {[
                {
                  title: 'Text Watermark — Simple Branding',
                  icon: '🔤',
                  body: 'A text watermark places a single line of custom text on your image at a position of your choice. You set the text (your name, website URL, copyright notice, or any label), the font size, the text colour, the background fill colour, the opacity, and the rotation angle. Position it in any of nine spots: all four corners, all four edge centres, or the middle of the image. Text watermarks are the most common type. They are quick to apply, easy to read, and effective for everyday content protection.',
                  best: 'Photographers branding portfolio images, social media posts, website images, content creators adding their handle'
                },
                {
                  title: 'Logo Watermark — Professional Branding',
                  icon: '🏷️',
                  body: 'A logo watermark uses your own image file — typically a logo, icon, signature, or brand mark — as the watermark overlay. Upload your logo (PNG with transparency works best so the background is invisible), set the size as a percentage of the original image width, control the opacity, set a rotation if needed, and position it on the image. Logo watermarks look more professional than text because they use your actual brand identity rather than plain text. They are commonly used by commercial photographers, marketing agencies, and businesses.',
                  best: 'Commercial photography, brand asset protection, product photos, professional portfolios, agency watermarks'
                },
                {
                  title: 'Tiled Pattern Watermark — Maximum Protection',
                  icon: '🔲',
                  body: 'A tiled watermark repeats your text in a diagonal grid pattern across the entire image. This is the most effective type for copyright protection because it is much harder to crop or remove than a corner watermark — every part of the image has the watermark visible. The tiled pattern is used with a low opacity (typically 5–15%) so it doesn\'t obscure the image content but is clearly visible. The rotation, spacing, font size, and opacity are all adjustable. Common applications include "CONFIDENTIAL" notices on documents, "SAMPLE" watermarks on product previews, and full-coverage copyright protection on photography.',
                  best: 'Document watermarking, sample previews sent to clients, legal document protection, stock photo watermarking'
                },
              ].map(({ title, icon, body, best }) => (
                <details key={title} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span className="flex items-center gap-2"><span>{icon}</span>{title}</span>
                    <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                    <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">✓ Best for: {best}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Watermark Settings Explained</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Opacity', body: 'Controls how transparent the watermark is. 100% is fully opaque (solid, not see-through). 10–20% is very subtle — the watermark is visible but does not strongly interfere with the image. Most photographers use 50–80% for visible-but-not-distracting text watermarks.' },
                { label: 'Position', body: 'Nine positions are available: all four corners, all four edge centres, and the exact centre of the image. Bottom-right is the most common position for copyright watermarks. Centre is often used for sample/draft watermarks.' },
                { label: 'Rotation', body: 'Rotates the watermark text or logo by the specified angle (−90° to +90°). A slight diagonal (10–20°) makes watermarks harder to crop out. The tiled mode uses rotation to create the diagonal repeating pattern.' },
                { label: 'Font Size', body: 'Controls the size of text in pixels. Larger text is more visible and harder to remove. Smaller text is more subtle. For a 3000px wide photo, a font size of 60–80px is typically visible without being distracting.' },
                { label: 'Logo Size', body: 'For logo watermarks, the size is expressed as a percentage of the original image width. 20% means the logo will be 20% as wide as the image. Adjust based on the complexity of your logo — simple icons work at smaller sizes, detailed logos may need 25–35%.' },
                { label: 'Tile Spacing', body: 'For tiled watermarks, spacing controls the distance between each repetition of the text. Smaller spacing = more instances of the watermark = denser coverage. Larger spacing = fewer, more spread out. 150–250px works well for most images.' },
              ].map(({ label, body }) => (
                <div key={label} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{label}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is my image uploaded to a server?', a: 'No. All watermark processing runs in your browser using the HTML5 Canvas API. Your files never leave your device.' },
                { q: 'What image formats can I watermark?', a: 'You can upload JPG, PNG, WebP, GIF, and BMP images. The output is always saved as PNG to preserve the best quality, including any transparency in logo watermarks.' },
                { q: 'Can I use a PNG logo with a transparent background as a watermark?', a: 'Yes. Upload your PNG logo as the watermark image in Logo mode. The transparent areas of the PNG will be preserved — only the visible parts of the logo appear on the image.' },
                { q: 'What opacity should I use for a professional watermark?', a: 'For visible but non-distracting branding, 60–80% works well for text watermarks. For tiled pattern watermarks, use 8–15% — enough to be seen but not enough to obscure the image content.' },
                { q: 'How do I make the watermark as hard to remove as possible?', a: 'Use the Tiled mode with a rotation of around −30° to −45°, a medium opacity (12–18%), and small-to-medium spacing. Tiled watermarks covering the entire image are much harder to remove than a corner watermark that can be cropped out.' },
                { q: 'Can I batch-watermark multiple images?', a: 'This tool processes one image at a time. For batch watermarking, upload each image, apply the same settings, and download. The settings are preserved between uploads so you only configure them once.' },
                { q: 'Why does the watermark look different on the downloaded image vs the preview?', a: 'The preview image is displayed scaled to fit the screen. The download is the full-resolution version. The watermark is applied at the original image resolution, so font sizes and positions are relative to the full-size image.' },
                { q: 'What is the best watermark for protecting photography?', a: 'For maximum protection, use a tiled text watermark with your name or website URL at −30° to −45° rotation, font size 30–50px, and opacity 10–18%. This covers every corner and cannot be cropped out.' },
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