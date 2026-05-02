'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Download, Trash2, Edit3, Type, Check, Palette, Undo2, Redo2, Copy, Share2, Pen } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const FONTS = ['Dancing Script', 'Great Vibes', 'Pacifico', 'Allura', 'Sacramento', 'Pinyon Script'];
const COLOR_PRESETS = ['#000000', '#1e3a8a', '#dc2626', '#059669', '#7c3aed', '#d97706', '#be185d'];
const BG_PRESETS = [
  { label: 'White', value: '#ffffff', style: { backgroundColor: '#ffffff' } },
  { label: 'Off-white', value: '#fafaf8', style: { backgroundColor: '#fafaf8' } },
  { label: 'Light blue', value: '#eff6ff', style: { backgroundColor: '#eff6ff' } },
  { label: 'Transparent', value: 'transparent', style: { background: 'repeating-conic-gradient(#cbd5e1 0% 25%,#f1f5f9 0% 50%) 0/14px 14px' } },
];

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';
const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2';
const inputCls = 'w-full px-4 py-3 border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition';

export default function DigitalSignaturePad() {
  const canvasRef = useRef(null);
  const historyRef = useRef([]);  // undo stack (array of ImageData)
  const redoRef = useRef([]);  // redo stack
  const isDrawRef = useRef(false);
  const lastPtRef = useRef(null);

  const [mode, setMode] = useState('draw');
  const [typedName, setTypedName] = useState('');
  const [penColor, setPenColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(3);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Dancing Script');
  const [hasSigned, setHasSigned] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addTimestamp, setAddTimestamp] = useState(false);
  const [smoothing, setSmoothing] = useState(true);

  /* ── Load Google Fonts once ── */
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&family=Allura&family=Sacramento&family=Pinyon+Script&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  /* ── Resize canvas ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fillBg = () => {
      const rect = canvas.getBoundingClientRect();
      const saved = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      if (bgColor !== 'transparent') { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      if (hasSigned) ctx.putImageData(saved, 0, 0);
    };
    fillBg();
    window.addEventListener('resize', fillBg);
    return () => window.removeEventListener('resize', fillBg);
  }, [bgColor]);

  /* ── Snapshot helpers (undo/redo) ── */
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snap = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current = [...historyRef.current.slice(-19), snap];
    redoRef.current = [];
    setCanUndo(true); setCanRedo(false);
  }, []);

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length < 2) return;
    const cur = historyRef.current.pop();
    redoRef.current.push(cur);
    const prev = historyRef.current[historyRef.current.length - 1];
    canvas.getContext('2d').putImageData(prev, 0, 0);
    setCanUndo(historyRef.current.length > 1);
    setCanRedo(true);
    setHasSigned(historyRef.current.length > 1);
  };

  const redo = () => {
    const canvas = canvasRef.current;
    if (!canvas || !redoRef.current.length) return;
    const snap = redoRef.current.pop();
    historyRef.current.push(snap);
    canvas.getContext('2d').putImageData(snap, 0, 0);
    setCanUndo(true); setCanRedo(redoRef.current.length > 0);
    setHasSigned(true);
  };

  /* ── Drawing ── */
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src = e.touches?.[0] ?? e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (mode !== 'draw') return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    isDrawRef.current = true;
    lastPtRef.current = pos;
    setHasSigned(true);
  };

  const draw = (e) => {
    if (!isDrawRef.current || mode !== 'draw') return;
    e.preventDefault();
    const pos = getPos(e);
    const ctx = canvasRef.current.getContext('2d');
    if (smoothing && lastPtRef.current) {
      const mid = { x: (pos.x + lastPtRef.current.x) / 2, y: (pos.y + lastPtRef.current.y) / 2 };
      ctx.quadraticCurveTo(lastPtRef.current.x, lastPtRef.current.y, mid.x, mid.y);
    } else {
      ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();
    lastPtRef.current = pos;
  };

  const stopDrawing = () => {
    if (!isDrawRef.current) return;
    isDrawRef.current = false;
    lastPtRef.current = null;
    saveSnapshot();
  };

  /* ── Clear ── */
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (bgColor !== 'transparent') { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current = []; redoRef.current = [];
    setHasSigned(false); setCanUndo(false); setCanRedo(false); setTypedName('');
    /* save blank snapshot */
    const blank = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(blank);
  };

  /* ── Typed signature ── */
  const generateTyped = () => {
    if (!typedName.trim()) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (bgColor !== 'transparent') { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
    let fs = 90;
    ctx.font = `${fs}px "${fontFamily}", cursive`;
    while (ctx.measureText(typedName).width > canvas.width - 60 && fs > 20) {
      fs -= 4; ctx.font = `${fs}px "${fontFamily}", cursive`;
    }
    ctx.fillStyle = penColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, addTimestamp ? canvas.height / 2 - 18 : canvas.height / 2);
    if (addTimestamp) {
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillStyle = penColor + '99';
      ctx.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), canvas.width / 2, canvas.height / 2 + fs / 2 + 8);
    }
    setHasSigned(true);
    saveSnapshot();
  };

  /* ── Download ── */
  const download = (fmt) => {
    const canvas = canvasRef.current;
    let href, name;
    if (fmt === 'jpg') {
      const tmp = document.createElement('canvas');
      tmp.width = canvas.width; tmp.height = canvas.height;
      const tc = tmp.getContext('2d');
      tc.fillStyle = '#ffffff'; tc.fillRect(0, 0, tmp.width, tmp.height);
      tc.drawImage(canvas, 0, 0);
      href = tmp.toDataURL('image/jpeg', 0.95); name = 'signature.jpg';
    } else if (fmt === 'svg') {
      const d = canvas.toDataURL('image/png');
      const s = `<?xml version="1.0"?><svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><image width="${canvas.width}" height="${canvas.height}" xlink:href="${d}"/></svg>`;
      href = URL.createObjectURL(new Blob([s], { type: 'image/svg+xml' })); name = 'signature.svg';
    } else {
      href = canvas.toDataURL('image/png'); name = 'signature.png';
    }
    const a = Object.assign(document.createElement('a'), { href, download: name });
    a.click();
    if (fmt === 'svg') URL.revokeObjectURL(href);
  };

  /* ── Copy as base64 ── */
  const copyBase64 = () => {
    navigator.clipboard.writeText(canvasRef.current.toDataURL('image/png')).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Digital Signature Pad', href: '/tools/digital-signature-pad' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl mb-4 shadow-sm">
            <Pen className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3">Digital Signature Pad</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Draw, type, or generate your signature — download as PNG, JPG, or SVG</p>
        </div>

        {/* Mode toggle */}
        <div className={`${cardCls} p-2 mb-5 flex gap-2 max-w-sm mx-auto`}>
          {[{ k: 'draw', label: 'Draw', icon: Edit3 }, { k: 'type', label: 'Type', icon: Type }].map(({ k, label, icon: Icon }) => (
            <button key={k} onClick={() => { setMode(k); clearCanvas(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${mode === k ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Type mode controls */}
        {mode === 'type' && (
          <div className={`${cardCls} p-6 mb-5`}>
            <label className={labelCls}>Your Name</label>
            <div className="flex gap-3 mb-5">
              <input type="text" value={typedName} onChange={e => setTypedName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateTyped()} placeholder="Type your full name…" maxLength={50} className={inputCls} />
              <button onClick={generateTyped} disabled={!typedName.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center gap-2 flex-shrink-0">
                <Check className="w-4 h-4" />Generate
              </button>
            </div>

            <label className={labelCls}>Font Style</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {FONTS.map(f => (
                <button key={f} onClick={() => setFontFamily(f)}
                  className={`px-3 py-3 rounded-xl text-sm transition-all border-2 ${fontFamily === f ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-300'}`}
                  style={{ fontFamily: `"${f}",cursive` }}>
                  {typedName || f}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <div onClick={() => setAddTimestamp(v => !v)}
                className={`relative w-9 h-5 rounded-full transition ${addTimestamp ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${addTimestamp ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add today's date below signature</span>
            </label>
          </div>
        )}

        {/* Canvas area */}
        <div className={`${cardCls} p-6 mb-5`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Signature Canvas</h2>
            <div className="flex items-center gap-2">
              <button onClick={undo} disabled={!canUndo} title="Undo"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed">
                <Undo2 className="w-4 h-4" />
              </button>
              <button onClick={redo} disabled={!canRedo} title="Redo"
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed">
                <Redo2 className="w-4 h-4" />
              </button>
              <button onClick={clearCanvas}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-sm font-bold transition">
                <Trash2 className="w-4 h-4" />Clear
              </button>
            </div>
          </div>

          <div className="relative border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner"
            style={bgColor === 'transparent' ? { background: 'repeating-conic-gradient(#cbd5e1 0% 25%,#f1f5f9 0% 50%) 0/14px 14px' } : { backgroundColor: bgColor }}>
            <canvas ref={canvasRef}
              onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
              onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
              className={`w-full touch-none ${mode === 'draw' ? 'cursor-crosshair' : ''}`}
              style={{ height: 320, display: 'block' }} />
            {!hasSigned && mode === 'draw' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Edit3 className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">Sign here using your mouse or touch</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings row */}
        <div className="grid md:grid-cols-2 gap-5 mb-5">
          {/* Pen settings */}
          <div className={`${cardCls} p-6`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />Pen Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Ink Colour</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PRESETS.map(c => (
                    <button key={c} onClick={() => setPenColor(c)} style={{ backgroundColor: c }}
                      className={`w-9 h-9 rounded-lg border-2 transition-all ${penColor === c ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} />
                  ))}
                  <input type="color" value={penColor} onChange={e => setPenColor(e.target.value)}
                    className="w-9 h-9 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600 bg-transparent" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Stroke Width — {penWidth}px</label>
                <input type="range" min="1" max="12" value={penWidth} onChange={e => setPenWidth(Number(e.target.value))}
                  className="w-full accent-indigo-600" />
                <div className="flex justify-between text-xs text-slate-400 mt-1"><span>Fine</span><span>Bold</span></div>
              </div>
              {mode === 'draw' && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div onClick={() => setSmoothing(v => !v)}
                    className={`relative w-9 h-5 rounded-full transition ${smoothing ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${smoothing ? 'translate-x-4' : ''}`} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Smooth strokes</span>
                </label>
              )}
            </div>
          </div>

          {/* Background settings */}
          <div className={`${cardCls} p-6`}>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Background</h3>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Background Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {BG_PRESETS.map(({ label, value, style }) => (
                    <button key={value} onClick={() => setBgColor(value)} title={label}
                      className={`h-10 rounded-xl border-2 transition-all ${bgColor === value ? 'border-indigo-500 scale-105 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:scale-105'}`}
                      style={style} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">PNG export supports transparency · JPG uses white background</p>
              </div>
              <div>
                <label className={labelCls}>Custom Colour</label>
                <div className="flex gap-2">
                  <input type="color" value={bgColor === 'transparent' ? '#ffffff' : bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600" />
                  <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download row */}
        <div className={`${cardCls} p-6`}>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-500" />Download Signature
          </h3>
          <div className="flex flex-wrap gap-3">
            {[{ fmt: 'png', label: 'PNG', color: 'bg-indigo-600 hover:bg-indigo-700' }, { fmt: 'jpg', label: 'JPG', color: 'bg-emerald-600 hover:bg-emerald-700' }, { fmt: 'svg', label: 'SVG', color: 'bg-purple-600 hover:bg-purple-700' }].map(({ fmt, label, color }) => (
              <button key={fmt} onClick={() => download(fmt)} disabled={!hasSigned}
                className={`flex-1 min-w-[130px] px-5 py-3 ${color} disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center justify-center gap-2`}>
                <Download className="w-4 h-4" />Download {label}
              </button>
            ))}
            <button onClick={copyBase64} disabled={!hasSigned}
              className={`flex-1 min-w-[130px] px-5 py-3 ${copied ? 'bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'} disabled:bg-slate-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition flex items-center justify-center gap-2`}>
              <Copy className="w-4 h-4" />{copied ? 'Copied!' : 'Copy Base64'}
            </button>
          </div>
          {!hasSigned && <p className="text-slate-400 dark:text-slate-500 text-sm text-center mt-3">Create a signature above to enable download</p>}
        </div>

        {/* SEO Content */}
        <div className="mt-16 space-y-5">
          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Digital Signature Pad — Create and Download Your Signature Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Signatures are everywhere — contracts, legal forms, invoices, offer letters, NDAs, and dozens of other documents pass through our hands every week. In a world where most of that paperwork is digital, you need a way to sign without printing, scanning, or buying expensive software. The OmniWebKit Digital Signature Pad gives you exactly that: a free, browser-based signature creator that works on any device, any screen, any time.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Use your mouse, trackpad, or finger to sign naturally in Draw mode — or let the tool generate a handwriting-style signature from your name using premium cursive fonts in Type mode. When you're done, download your signature as a transparent PNG, a JPG, or a scalable SVG. No watermarks. No account required. No software to install.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Everything happens in your browser. Your signature is never uploaded to any server. It stays completely private from creation to download.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Two Ways to Create Your Digital Signature</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-base mb-3 flex items-center gap-2"><Edit3 className="w-4 h-4" />Draw Mode</h3>
                <p className="text-indigo-800 dark:text-indigo-300 text-sm leading-relaxed mb-3">
                  Click and drag (or touch and drag on mobile) to draw your signature just like you would with a pen on paper. This produces the most natural, authentic signature because it captures the actual movement of your hand.
                </p>
                <ul className="text-indigo-700 dark:text-indigo-400 text-xs space-y-1">
                  <li>• Smooth stroke interpolation for natural curves</li>
                  <li>• Adjustable ink width from 1px to 12px</li>
                  <li>• Undo and redo any stroke</li>
                  <li>• Touch-screen friendly for phones and tablets</li>
                </ul>
              </div>
              <div className="p-5 bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800 rounded-2xl">
                <h3 className="font-bold text-violet-900 dark:text-violet-200 text-base mb-3 flex items-center gap-2"><Type className="w-4 h-4" />Type Mode</h3>
                <p className="text-violet-800 dark:text-violet-300 text-sm leading-relaxed mb-3">
                  Type your name and the tool instantly renders it in a professional cursive font. Choose from six handwriting-style fonts including Dancing Script, Great Vibes, Pacifico, Allura, Sacramento, and Pinyon Script. The text scales automatically to fill the canvas.
                </p>
                <ul className="text-violet-700 dark:text-violet-400 text-xs space-y-1">
                  <li>• Six premium Google Fonts cursive styles</li>
                  <li>• Full-colour ink picker</li>
                  <li>• Optional date stamp below the signature</li>
                  <li>• Instant regeneration when you switch fonts</li>
                </ul>
              </div>
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Which Export Format Is Right for You?</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              The tool exports your signature in three formats, each suited to a different use case. Choosing the right one takes less than a second once you understand the difference.
            </p>
            <div className="space-y-3">
              {[
                { fmt: 'PNG', color: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800', tc: 'text-indigo-900 dark:text-indigo-200', dc: 'text-indigo-700 dark:text-indigo-300', desc: 'Best for most digital document use. PNG preserves transparency — if you set the canvas background to transparent, your signature will sit cleanly on top of any document colour when you place it in Word, Google Docs, or PDF software. This is the format most people need.' },
                { fmt: 'JPG', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800', tc: 'text-emerald-900 dark:text-emerald-200', dc: 'text-emerald-700 dark:text-emerald-300', desc: 'A smaller file size option with a white background. JPG does not support transparency. Use it when file size matters, when you need to embed the signature in a system that only accepts JPEG images, or when a white background is acceptable.' },
                { fmt: 'SVG', color: 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800', tc: 'text-purple-900 dark:text-purple-200', dc: 'text-purple-700 dark:text-purple-300', desc: 'A vector-based file that scales perfectly to any size — from a tiny email footer to a large printed page — without any pixelation. SVG is ideal for developers who need to embed the signature in a website or app, or for use cases where the signature will appear at many different sizes.' },
              ].map(({ fmt, color, tc, dc, desc }) => (
                <div key={fmt} className={`p-5 ${color} border rounded-2xl`}>
                  <h3 className={`font-bold ${tc} text-sm mb-2`}>{fmt} Export</h3>
                  <p className={`${dc} text-sm leading-relaxed`}>{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Copy as Base64</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">The Copy Base64 button copies the raw PNG image data as a base64-encoded string to your clipboard. This is useful for developers who want to embed the signature directly into HTML, CSS, or a JSON payload without storing a separate file.</p>
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Is a Digital Signature Legally Valid?</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This is one of the most common questions about digital signatures. The short answer is: it depends on the country and the type of document.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              In the United States, the ESIGN Act and UETA give electronic signatures the same legal weight as handwritten signatures for most contracts and agreements. In the European Union, the eIDAS regulation similarly validates electronic signatures. The UK, Australia, India, Canada, and most other countries have equivalent legislation.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              However, there are exceptions. Some documents — last wills, real estate deeds, powers of attorney, court filings — may require a wet (physical) signature or a more formally verified electronic signature (like those provided by DocuSign or Adobe Sign, which use certificate-based identity verification).
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              For everyday use — client agreements, contractor invoices, internal forms, consent forms, email attachments — a digital signature image is widely accepted. When in doubt about legal requirements for a specific document, consult a licensed legal professional in your jurisdiction.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is the digital signature pad free to use?', a: 'Yes, completely free. There is no account, no subscription, no limits on usage, and no watermarks on downloaded files.' },
                { q: 'Is my signature uploaded anywhere?', a: 'No. Your signature is generated and stored entirely in your browser session. Nothing is sent to any server. When you close the tab, the signature is gone.' },
                { q: 'Can I use this on a mobile phone or tablet?', a: 'Yes. The drawing canvas fully supports touch input on iOS and Android devices. You can sign with your finger just like you would on a paper form.' },
                { q: 'What is the difference between Draw mode and Type mode?', a: 'Draw mode lets you create a freehand signature using your mouse, trackpad, or finger. Type mode generates a stylized cursive signature from your name using one of six premium handwriting fonts.' },
                { q: 'How do I get a transparent background?', a: 'Click the checkerboard pattern in the Background section to set transparency. Then download in PNG format. The resulting file will have no background — the signature ink sits on a transparent layer.' },
                { q: 'Can I undo a stroke?', a: 'Yes. Click the undo button (↩) at the top of the canvas to remove the last stroke. You can undo up to 20 actions and redo them as needed.' },
                { q: 'What does Copy Base64 do?', a: 'It copies the raw PNG image encoded as a base64 data URI to your clipboard. Developers use this to embed images directly in HTML, CSS, or API payloads without needing a separate image file.' },
                { q: 'Can I add a date to my typed signature?', a: 'Yes. In Type mode, enable the "Add today\'s date below signature" toggle before clicking Generate. The current date will appear in a smaller font beneath the cursive signature.' },
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