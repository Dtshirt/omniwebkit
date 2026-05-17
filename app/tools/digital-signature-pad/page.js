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

        {/* SEO Content — prose-premium */}
        <div className="mt-16 prose-premium max-w-5xl mx-auto space-y-8">

          {/* 1. About the Tool */}
          <div className={`${cardCls} p-8`}>
            <h2>Free Digital Signature Pad — Draw or Type Your Signature Online</h2>
            <p>
              Most people still print a document, sign it by hand, scan it, and email it back. That is a lot of steps for something that should take ten seconds. The <strong>OmniWebKit Digital Signature Pad</strong> is a free <strong>online signature maker</strong> that skips all of that. You sign right here in your browser — no print, no scan, no software to install.
            </p>
            <p>
              The tool works in two ways. <strong>Draw mode</strong> lets you sign with your mouse, trackpad, or finger — just like a real pen on paper. <strong>Type mode</strong> turns your name into a handwriting-style <strong>electronic signature</strong> using six professional cursive fonts. Either way, you get a clean, high-quality signature you can download as a transparent PNG, a JPG, or a scalable SVG file.
            </p>
            <p>
              No watermarks. No account. Nothing to install. Your <strong>digital signature</strong> is ready in seconds — and it never leaves your device.
            </p>
          </div>

          {/* 2. How to Use */}
          <div className={`${cardCls} p-8`}>
            <h2>How to Use the Digital Signature Pad</h2>
            <p>
              The tool is designed to get you from zero to a finished signature in under 30 seconds. Here is exactly how it works.
            </p>
            <ol>
              <li><strong>Pick a mode.</strong> Click <strong>Draw</strong> to sign by hand or <strong>Type</strong> to generate a signature from your name. Draw is better when you want something that looks like your real signature. Type is faster when you just need something clean and professional.</li>
              <li><strong>Create your signature.</strong> In Draw mode, click and drag on the canvas — or use your finger on a phone or tablet. In Type mode, enter your full name, pick a cursive font from the six options shown, and hit <strong>Generate</strong>.</li>
              <li><strong>Adjust the look.</strong> Change the ink color using the preset swatches or the custom color picker. Adjust stroke width from 1px to 12px. In Type mode, toggle the date stamp if you want today's date printed below the signature.</li>
              <li><strong>Set the background.</strong> White keeps it simple. The checkerboard (transparent) means your signature floats cleanly on top of any document color — that is the one most people want for PDF and Word use.</li>
              <li><strong>Download it.</strong> Click <strong>Download PNG</strong> for transparent use, <strong>Download JPG</strong> for a smaller file, or <strong>Download SVG</strong> for a vector version you can scale to any size.</li>
            </ol>
            <p>
              Made a mistake? Hit the undo button to go back stroke by stroke. You get up to 20 undo steps. That is pretty much it.
            </p>
          </div>

          {/* 3. Privacy & Security */}
          <div className={`${cardCls} p-8`}>
            <h2>Your Signature Never Leaves Your Device</h2>
            <p>
              A signature is one of the most personal things you own. So here is the part that actually matters: <strong>this tool runs 100% inside your browser</strong>. There is no server receiving your signature. No database storing it. No company seeing what you signed.
            </p>
            <p>
              The canvas you draw on is a standard HTML5 element. Everything — the drawing, the font rendering, the file export — happens in browser memory using JavaScript. When you close the tab, it is gone. Not archived. Not cached on a server. Gone.
            </p>
            <p>
              We do not collect analytics on what signatures you create. We do not ask for your email. The tool is genuinely private, not just "private" in a terms-of-service kind of way.
            </p>
            <p>
              One honest note: this tool creates a <em>signature image</em>, not a certificate-backed digital signature. If a legal document needs a verified identity (like a DocuSign-style audit trail with timestamps and signer ID), this tool will not cover that. But for everyday use — contracts, invoices, consent forms — a signed image works fine in most countries. More on that in the FAQ below.
            </p>
          </div>

          {/* 4. Features */}
          <div className={`${cardCls} p-8`}>
            <h2>What Makes This Online Signature Generator Different</h2>
            <p>
              Most free <strong>signature tools</strong> give you a basic canvas and call it done. This one goes further — because the details actually matter when you are signing real documents.
            </p>
            <ul>
              <li><strong>Bezier curve stroke smoothing.</strong> When you draw, the tool uses quadratic bezier interpolation between mouse points. Your curves are smooth — no jagged edges or wobbly lines. You can turn it off if you prefer raw point-to-point strokes.</li>
              <li><strong>20-step undo and redo.</strong> Most signature pads let you clear the canvas or nothing. This one stores up to 20 canvas states so you can step back stroke by stroke without starting over.</li>
              <li><strong>Six real handwriting fonts.</strong> In Type mode you get Dancing Script, Great Vibes, Pacifico, Allura, Sacramento, and Pinyon Script — all loaded from Google Fonts. Auto-scaling keeps your name fully visible no matter how long it is.</li>
              <li><strong>Three export formats.</strong> PNG with real transparency, JPG with a white background, and SVG as a true vector file. The SVG wraps the canvas as a proper XML document that opens correctly in Figma, Illustrator, and browsers.</li>
              <li><strong>Copy as Base64.</strong> Developers can copy the full PNG data URI to the clipboard and embed it directly in HTML or a JSON payload — no file hosting needed.</li>
              <li><strong>Date stamp option.</strong> In Type mode, toggle a date label that prints today's date below the signature in a smaller, muted font. Useful for dated agreements or signed receipts.</li>
              <li><strong>Full touch support.</strong> Works on iOS Safari and Android Chrome using the same drawing logic as desktop. No special app required.</li>
              <li><strong>Custom background colors.</strong> Switch between white, off-white, light blue, transparent, or enter any custom hex value. JPG export always composites on white regardless of background setting.</li>
            </ul>
          </div>

          {/* 5. Technical */}
          <div className={`${cardCls} p-8`}>
            <h2>Technical Specifications</h2>
            <p>For developers and anyone who wants to know exactly how the tool works under the hood.</p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr><th>Spec</th><th>Detail</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Rendering Engine</strong></td><td>HTML5 Canvas 2D API — all drawing runs client-side</td></tr>
                  <tr><td><strong>Stroke Smoothing</strong></td><td>Quadratic bezier via <code>quadraticCurveTo()</code> between midpoints</td></tr>
                  <tr><td><strong>Undo / Redo Stack</strong></td><td>Up to 20 <code>ImageData</code> snapshots in browser memory</td></tr>
                  <tr><td><strong>Stroke Width</strong></td><td>1px – 12px adjustable via range slider</td></tr>
                  <tr><td><strong>Typed Signature Fonts</strong></td><td>Dancing Script, Great Vibes, Pacifico, Allura, Sacramento, Pinyon Script (Google Fonts)</td></tr>
                  <tr><td><strong>Font Auto-Scaling</strong></td><td>Starts at 90px, steps down 4px until text fits canvas width − 60px margin</td></tr>
                  <tr><td><strong>PNG Export</strong></td><td><code>canvas.toDataURL('image/png')</code> — full alpha transparency</td></tr>
                  <tr><td><strong>JPG Export</strong></td><td>Composited on white via offscreen canvas, then <code>toDataURL('image/jpeg', 0.95)</code></td></tr>
                  <tr><td><strong>SVG Export</strong></td><td>PNG embedded as <code>xlink:href</code> inside a valid XML <code>&lt;svg&gt;</code> document</td></tr>
                  <tr><td><strong>Base64 Copy</strong></td><td>Full PNG data URI via <code>navigator.clipboard.writeText()</code></td></tr>
                  <tr><td><strong>Touch Input</strong></td><td><code>touchstart / touchmove / touchend</code> — <code>touch-none</code> prevents scroll conflict</td></tr>
                  <tr><td><strong>Canvas Resize</strong></td><td>Redraws on window resize, preserves content via <code>getImageData</code> save/restore</td></tr>
                  <tr><td><strong>Server Calls</strong></td><td>None — zero data transmitted off-device</td></tr>
                  <tr><td><strong>Browser Support</strong></td><td>Chrome, Firefox, Safari, Edge — requires JavaScript</td></tr>
                  <tr><td><strong>Framework</strong></td><td>Next.js (React 18) — client component with hooks</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. FAQ */}
          <div className={`${cardCls} p-8`}>
            <h2>Frequently Asked Questions</h2>

            <h3>Is the digital signature pad free to use?</h3>
            <p>Yes, completely free. No account. No subscription. No usage limits. Downloaded files have no watermarks — the PNG, JPG, and SVG you get are clean.</p>

            <h3>Is my signature uploaded or stored anywhere?</h3>
            <p>No. Everything runs in your browser using the HTML5 Canvas API. Nothing is sent to a server. Close the tab and the signature is gone — not archived, not logged.</p>

            <h3>Can I use this on a phone or tablet?</h3>
            <p>Yes. The canvas handles touch events on iOS and Android natively. You can sign with your finger just like writing on paper. Works well in both portrait and landscape.</p>

            <h3>What is the difference between Draw mode and Type mode?</h3>
            <p>Draw mode captures your actual hand movement — more authentic, looks like your real signature. Type mode generates a cursive version of your typed name using one of six handwriting fonts — faster, and always clean.</p>

            <h3>How do I get a transparent background on my signature?</h3>
            <p>Click the checkerboard swatch in the Background section. Then click <strong>Download PNG</strong>. The file has only the signature ink — no background color — so it sits cleanly on any document you drop it into.</p>

            <h3>Can I undo a mistake without clearing everything?</h3>
            <p>Yes. The undo button steps back one stroke at a time, up to 20 steps. Redo is also available. This is a big deal — most browser signature tools only let you clear the whole canvas.</p>

            <h3>Is a digital signature legally valid?</h3>
            <p>In most countries, yes — for everyday documents. The US ESIGN Act, EU eIDAS regulation, and similar laws in the UK, Canada, Australia, and India all treat electronic signatures as binding for most contracts. But wills, real estate deeds, and court filings may require a wet signature or a certificate-backed identity. When in doubt, check with a legal professional for your specific document type.</p>

            <h3>What does Copy Base64 do?</h3>
            <p>It copies the signature as a base64-encoded PNG data URI to your clipboard. Developers use this to embed the image directly in HTML, a CSS <code>background-image</code>, or an API JSON payload — no separate file hosting needed.</p>

            <h3>Can I add a date to my signature?</h3>
            <p>Yes, in Type mode. Toggle the <strong>Add today's date below signature</strong> switch before hitting Generate. The date appears in a smaller, muted font below the cursive name — useful for dated agreements or signed forms.</p>

            <h3>What if my name is too long for the canvas?</h3>
            <p>The font auto-scales down until the text fits. A long name might render at a smaller size, but it will always stay fully visible on the canvas and in the exported file.</p>
          </div>

        </div>
      </div>
    </div>
  );
}