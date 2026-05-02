'use client';
import { useState } from 'react';
import { Copy, Plus, Trash2, Check, RefreshCw, Download, Eye, EyeOff } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const hexToRgba = (hex, alpha) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${parseFloat(alpha / 100).toFixed(2)})`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';
const inputCls = 'w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500';

/* ─── Default state ───────────────────────────────────────────────────────── */
const DEFAULT_BOX_SHADOW = { id: 1, offsetX: 0, offsetY: 4, blur: 6, spread: 0, color: '#000000', opacity: 25, inset: false, enabled: true };
const DEFAULT_TEXT_SHADOW = { id: 1, offsetX: 2, offsetY: 2, blur: 4, color: '#000000', opacity: 60, enabled: true };

/* ─── Presets ─────────────────────────────────────────────────────────────── */
const BOX_PRESETS = [
  { name: 'Soft', shadows: [{ id: 1, offsetX: 0, offsetY: 2, blur: 8, spread: 0, color: '#000000', opacity: 10, inset: false, enabled: true }] },
  { name: 'Medium', shadows: [{ id: 1, offsetX: 0, offsetY: 4, blur: 6, spread: -1, color: '#000000', opacity: 12, inset: false, enabled: true }, { id: 2, offsetX: 0, offsetY: 2, blur: 4, spread: -1, color: '#000000', opacity: 7, inset: false, enabled: true }] },
  { name: 'Large', shadows: [{ id: 1, offsetX: 0, offsetY: 10, blur: 25, spread: -5, color: '#000000', opacity: 12, inset: false, enabled: true }, { id: 2, offsetX: 0, offsetY: 4, blur: 8, spread: -2, color: '#000000', opacity: 7, inset: false, enabled: true }] },
  { name: 'XL Float', shadows: [{ id: 1, offsetX: 0, offsetY: 25, blur: 50, spread: -12, color: '#000000', opacity: 25, inset: false, enabled: true }] },
  { name: 'Inset', shadows: [{ id: 1, offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: '#000000', opacity: 15, inset: true, enabled: true }] },
  { name: 'Neon Blue', shadows: [{ id: 1, offsetX: 0, offsetY: 0, blur: 10, spread: 2, color: '#3b82f6', opacity: 70, inset: false, enabled: true }, { id: 2, offsetX: 0, offsetY: 0, blur: 30, spread: 5, color: '#3b82f6', opacity: 40, inset: false, enabled: true }] },
  { name: 'Neon Purple', shadows: [{ id: 1, offsetX: 0, offsetY: 0, blur: 10, spread: 2, color: '#a855f7', opacity: 80, inset: false, enabled: true }, { id: 2, offsetX: 0, offsetY: 0, blur: 30, spread: 5, color: '#a855f7', opacity: 40, inset: false, enabled: true }] },
  { name: '3D', shadows: [{ id: 1, offsetX: 5, offsetY: 5, blur: 0, spread: 0, color: '#000000', opacity: 20, inset: false, enabled: true }, { id: 2, offsetX: 10, offsetY: 10, blur: 0, spread: 0, color: '#000000', opacity: 12, inset: false, enabled: true }] },
  { name: 'Neumorphic', shadows: [{ id: 1, offsetX: 6, offsetY: 6, blur: 12, spread: 0, color: '#b8b9be', opacity: 100, inset: false, enabled: true }, { id: 2, offsetX: -6, offsetY: -6, blur: 12, spread: 0, color: '#ffffff', opacity: 100, inset: false, enabled: true }] },
  { name: 'Crisp', shadows: [{ id: 1, offsetX: 4, offsetY: 4, blur: 0, spread: 0, color: '#000000', opacity: 100, inset: false, enabled: true }] },
  { name: 'Layered', shadows: [{ id: 1, offsetX: 0, offsetY: 1, blur: 1, spread: 0, color: '#00000026', opacity: 100, inset: false, enabled: true }, { id: 2, offsetX: 0, offsetY: 2, blur: 2, spread: 0, color: '#0000001a', opacity: 100, inset: false, enabled: true }, { id: 3, offsetX: 0, offsetY: 4, blur: 4, spread: 0, color: '#00000014', opacity: 100, inset: false, enabled: true }, { id: 4, offsetX: 0, offsetY: 8, blur: 8, spread: 0, color: '#0000000d', opacity: 100, inset: false, enabled: true }] },
  { name: 'Card', shadows: [{ id: 1, offsetX: 0, offsetY: 1, blur: 3, spread: 0, color: '#000000', opacity: 6, inset: false, enabled: true }, { id: 2, offsetX: 0, offsetY: 1, blur: 2, spread: 0, color: '#000000', opacity: 4, inset: false, enabled: true }] },
];

const TEXT_PRESETS = [
  { name: 'Soft', shadows: [{ id: 1, offsetX: 1, offsetY: 1, blur: 2, color: '#000000', opacity: 40, enabled: true }] },
  { name: 'Hard', shadows: [{ id: 1, offsetX: 2, offsetY: 2, blur: 0, color: '#000000', opacity: 80, enabled: true }] },
  { name: 'Neon', shadows: [{ id: 1, offsetX: 0, offsetY: 0, blur: 8, color: '#3b82f6', opacity: 100, enabled: true }, { id: 2, offsetX: 0, offsetY: 0, blur: 20, color: '#3b82f6', opacity: 60, enabled: true }] },
  { name: 'Retro', shadows: [{ id: 1, offsetX: 3, offsetY: 3, blur: 0, color: '#ff6b6b', opacity: 100, enabled: true }, { id: 2, offsetX: 6, offsetY: 6, blur: 0, color: '#ffd93d', opacity: 100, enabled: true }] },
  { name: 'Emboss', shadows: [{ id: 1, offsetX: -1, offsetY: -1, blur: 1, color: '#ffffff', opacity: 100, enabled: true }, { id: 2, offsetX: 1, offsetY: 1, blur: 2, color: '#000000', opacity: 30, enabled: true }] },
  { name: 'Outline', shadows: [{ id: 1, offsetX: 1, offsetY: 1, blur: 0, color: '#000000', opacity: 100, enabled: true }, { id: 2, offsetX: -1, offsetY: -1, blur: 0, color: '#000000', opacity: 100, enabled: true }, { id: 3, offsetX: 1, offsetY: -1, blur: 0, color: '#000000', opacity: 100, enabled: true }, { id: 4, offsetX: -1, offsetY: 1, blur: 0, color: '#000000', opacity: 100, enabled: true }] },
];

const PREVIEW_SHAPES = ['Square', 'Circle', 'Pill', 'Card', 'Button'];

export default function CSSShadowGenerator() {
  const [tab, setTab] = useState('box');       // 'box' | 'text'
  const [boxShadows, setBoxShadows] = useState([DEFAULT_BOX_SHADOW]);
  const [textShadows, setTextShadows] = useState([DEFAULT_TEXT_SHADOW]);
  const [copied, setCopied] = useState(false);
  const [previewBg, setPreviewBg] = useState('#f1f5f9');
  const [boxBg, setBoxBg] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#1e293b');
  const [previewShape, setPreviewShape] = useState('Square');
  const [fontSize, setFontSize] = useState(32);

  /* ── Generators ── */
  const generateBoxCSS = (list = boxShadows) => {
    const active = list.filter(s => s.enabled);
    if (!active.length) return 'none';
    return active.map(s => `${s.inset ? 'inset ' : ''} ${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`).join(',\n      ');
  };

  const generateTextCSS = (list = textShadows) => {
    const active = list.filter(s => s.enabled);
    if (!active.length) return 'none';
    return active.map(s => `${s.offsetX}px ${s.offsetY}px ${s.blur}px ${hexToRgba(s.color, s.opacity)}`).join(',\n      ');
  };

  const fullBoxCSS = `box-shadow: ${generateBoxCSS()};`;
  const fullTextCSS = `text-shadow: ${generateTextCSS()};`;
  const activeCSS = tab === 'box' ? fullBoxCSS : fullTextCSS;

  /* ── Actions ── */
  const copy = () => { navigator.clipboard.writeText(activeCSS).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  const download = () => {
    const blob = new Blob([`/* Generated by OmniWebKit CSS Shadow Generator */\n.element {\n  ${activeCSS}\n}`], { type: 'text/css' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'shadow.css' });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const resetBox = () => setBoxShadows([{ ...DEFAULT_BOX_SHADOW }]);
  const resetText = () => setTextShadows([{ ...DEFAULT_TEXT_SHADOW }]);

  /* ── Box shadow CRUD ── */
  const addBox = () => setBoxShadows(p => [...p, { ...DEFAULT_BOX_SHADOW, id: Math.max(...p.map(s => s.id)) + 1 }]);
  const removeBox = id => { if (boxShadows.length > 1) setBoxShadows(p => p.filter(s => s.id !== id)); };
  const updateBox = (id, prop, val) => setBoxShadows(p => p.map(s => s.id === id ? { ...s, [prop]: val } : s));

  /* ── Text shadow CRUD ── */
  const addText = () => setTextShadows(p => [...p, { ...DEFAULT_TEXT_SHADOW, id: Math.max(...p.map(s => s.id)) + 1 }]);
  const removeText = id => { if (textShadows.length > 1) setTextShadows(p => p.filter(s => s.id !== id)); };
  const updateText = (id, prop, val) => setTextShadows(p => p.map(s => s.id === id ? { ...s, [prop]: val } : s));

  /* ── Preset apply ── */
  const applyPreset = preset => {
    if (tab === 'box') setBoxShadows(preset.shadows);
    else setTextShadows(preset.shadows);
  };

  /* ── Preview shape classes ── */
  const shapeStyle = () => {
    switch (previewShape) {
      case 'Circle': return { width: 160, height: 160, borderRadius: '50%' };
      case 'Pill': return { width: 280, height: 80, borderRadius: 999 };
      case 'Card': return { width: 260, height: 180, borderRadius: 16 };
      case 'Button': return { width: 200, height: 52, borderRadius: 10 };
      default: return { width: 160, height: 160, borderRadius: 16 };
    }
  };

  const isBox = tab === 'box';
  const shadows = isBox ? boxShadows : textShadows;
  const presets = isBox ? BOX_PRESETS : TEXT_PRESETS;

  /* ── Slider row component (inline) ── */
  const SliderRow = ({ label, val, min, max, onChange }) => (
    <div>
      <label className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
        <span>{label}</span><span className="font-mono text-indigo-600 dark:text-indigo-400">{val}px</span>
      </label>
      <input type="range" min={min} max={max} value={val} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full accent-indigo-600 cursor-pointer" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'CSS Shadow Generator', href: '/tools/css-shadow-generator' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3">CSS Shadow Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Create stunning box shadows and text shadows with live preview — copy production-ready CSS instantly</p>
        </div>

        {/* Tab bar */}
        <div className={`${cardCls} p-2 mb-5 flex gap-2 max-w-xs mx-auto`}>
          {['box', 'text'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              {t === 'box' ? 'Box Shadow' : 'Text Shadow'}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── Preview panel ── */}
          <div className={`${cardCls} p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Preview</h2>
              <button onClick={isBox ? resetBox : resetText} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition">
                <RefreshCw className="w-3.5 h-3.5" />Reset
              </button>
            </div>

            {/* Shape selector */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {PREVIEW_SHAPES.map(s => (
                <button key={s} onClick={() => setPreviewShape(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${previewShape === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                  {s}
                </button>
              ))}
            </div>

            {/* Canvas */}
            <div className="w-full rounded-xl flex items-center justify-center mb-5 transition-colors" style={{ backgroundColor: previewBg, minHeight: 280 }}>
              {isBox ? (
                <div style={{ ...shapeStyle(), backgroundColor: boxBg, boxShadow: generateBoxCSS(), transition: 'box-shadow 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-xs font-semibold text-slate-400 select-none">Preview</span>
                </div>
              ) : (
                <p style={{ textShadow: generateTextCSS(), color: textColor, fontSize, fontWeight: 700, transition: 'text-shadow 0.2s', userSelect: 'none', textAlign: 'center', padding: '0 20px' }}>
                  Shadow Text
                </p>
              )}
            </div>

            {/* Colour controls */}
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Preview Background</label>
                <div className="flex gap-2">
                  <input type="color" value={previewBg} onChange={e => setPreviewBg(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-slate-300 dark:border-slate-600" />
                  <input type="text" value={previewBg} onChange={e => setPreviewBg(e.target.value)} className={inputCls} />
                </div>
              </div>
              {isBox ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Element Colour</label>
                  <div className="flex gap-2">
                    <input type="color" value={boxBg} onChange={e => setBoxBg(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-slate-300 dark:border-slate-600" />
                    <input type="text" value={boxBg} onChange={e => setBoxBg(e.target.value)} className={inputCls} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Text Colour</label>
                    <div className="flex gap-2">
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-slate-300 dark:border-slate-600" />
                      <input type="text" value={textColor} onChange={e => setTextColor(e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Font Size — {fontSize}px</label>
                    <input type="range" min={16} max={80} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-indigo-600 mt-2" />
                  </div>
                </div>
              )}
            </div>

            {/* CSS output */}
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Generated CSS</span>
                <div className="flex gap-2">
                  <button onClick={copy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${copied ? 'bg-emerald-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    {copied ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                  </button>
                  <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition">
                    <Download className="w-3 h-3" />Download
                  </button>
                </div>
              </div>
              <code className="text-xs text-emerald-400 font-mono leading-relaxed whitespace-pre-wrap break-all">{activeCSS}</code>
            </div>
          </div>

          {/* ── Controls panel ── */}
          <div className={`${cardCls} p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shadow Layers</h2>
              <button onClick={isBox ? addBox : addText} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition shadow-sm">
                <Plus className="w-4 h-4" />Add Layer
              </button>
            </div>

            {/* Presets */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Presets</h3>
              <div className="grid grid-cols-3 gap-1.5">
                {presets.map(p => (
                  <button key={p.name} onClick={() => applyPreset(p)}
                    className="px-2 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 rounded-lg text-xs font-semibold transition truncate">
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Layers */}
            <div className="space-y-4 max-h-[680px] overflow-y-auto pr-1">
              {shadows.map((shadow, idx) => (
                <div key={shadow.id} className={`rounded-xl p-4 border transition-all ${shadow.enabled ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700' : 'bg-slate-100/50 dark:bg-slate-900/20 border-dashed border-slate-300 dark:border-slate-700 opacity-60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Layer {idx + 1}</h3>
                    <div className="flex items-center gap-2">
                      <button onClick={() => isBox ? updateBox(shadow.id, 'enabled', !shadow.enabled) : updateText(shadow.id, 'enabled', !shadow.enabled)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-500 dark:text-slate-400" title={shadow.enabled ? 'Disable' : 'Enable'}>
                        {shadow.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      {shadows.length > 1 && (
                        <button onClick={() => isBox ? removeBox(shadow.id) : removeText(shadow.id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <SliderRow label="Offset X" val={shadow.offsetX} min={-60} max={60} onChange={v => isBox ? updateBox(shadow.id, 'offsetX', v) : updateText(shadow.id, 'offsetX', v)} />
                    <SliderRow label="Offset Y" val={shadow.offsetY} min={-60} max={60} onChange={v => isBox ? updateBox(shadow.id, 'offsetY', v) : updateText(shadow.id, 'offsetY', v)} />
                    <SliderRow label="Blur" val={shadow.blur} min={0} max={100} onChange={v => isBox ? updateBox(shadow.id, 'blur', v) : updateText(shadow.id, 'blur', v)} />
                    {isBox && <SliderRow label="Spread" val={shadow.spread} min={-50} max={50} onChange={v => updateBox(shadow.id, 'spread', v)} />}
                    <SliderRow label="Opacity" val={shadow.opacity} min={0} max={100} onChange={v => isBox ? updateBox(shadow.id, 'opacity', v) : updateText(shadow.id, 'opacity', v)} />
                  </div>

                  {/* Colour row */}
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Shadow Colour</label>
                    <div className="flex gap-2">
                      <input type="color" value={shadow.color} onChange={e => isBox ? updateBox(shadow.id, 'color', e.target.value) : updateText(shadow.id, 'color', e.target.value)} className="w-10 h-9 rounded cursor-pointer flex-shrink-0 border border-slate-300 dark:border-slate-600" />
                      <input type="text" value={shadow.color} onChange={e => isBox ? updateBox(shadow.id, 'color', e.target.value) : updateText(shadow.id, 'color', e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  {/* Inset toggle (box only) */}
                  {isBox && (
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <div onClick={() => updateBox(shadow.id, 'inset', !shadow.inset)} className={`relative w-9 h-5 rounded-full transition ${shadow.inset ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${shadow.inset ? 'translate-x-4' : ''}`} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Inset Shadow</span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-16 space-y-6">
          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free CSS Shadow Generator — Create Box Shadows and Text Shadows Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Shadows are one of the most powerful tools in web design. A well-placed shadow adds depth, creates visual hierarchy, and makes flat interfaces feel alive and clickable. But writing CSS shadow code by hand is tedious. Getting the offset, blur radius, spread radius, and colour exactly right takes multiple rounds of trial and error — especially when you're stacking multiple shadow layers. That's exactly what this CSS shadow generator is built for.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit CSS Shadow Generator handles both <strong className="text-slate-900 dark:text-white">box-shadow</strong> and <strong className="text-slate-900 dark:text-white">text-shadow</strong> in one place. You adjust sliders, choose colours, and watch the live preview update in real time. When you're happy, copy the CSS or download it as a .css file. No signup. No limits.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Whether you're a beginner learning CSS or a senior developer who just wants to speed up your workflow, this tool gives you production-ready shadow code that's clean and cross-browser compatible. The generated CSS works in every modern browser including Chrome, Firefox, Safari, and Edge.
            </p>
          </section>

          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding CSS box-shadow — All Five Parameters Explained</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              The CSS <code className="bg-slate-100 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono text-sm">box-shadow</code> property takes up to five values. Understanding each one is key to creating the exact shadow effect you're after.
            </p>
            <div className="space-y-3">
              {[
                { prop: 'offset-x', ex: '-10px to 10px', desc: 'Moves the shadow horizontally. A positive value pushes the shadow right. A negative value pushes it left. Zero centres it directly behind the element.' },
                { prop: 'offset-y', ex: '-10px to 10px', desc: 'Moves the shadow vertically. A positive value pushes it down (the most natural-looking direction since light usually comes from above). Negative means upward.' },
                { prop: 'blur-radius', ex: '0 to 100px', desc: 'Controls how soft the shadow edges are. Zero means a hard, sharp edge — like a flat sticker. Higher values make the shadow softer and more diffuse. Most real-world designs use 8–25px.' },
                { prop: 'spread-radius', ex: '-20px to 20px', desc: 'Expands or contracts the shadow before blur is applied. Negative spread with high blur creates a subtle depth effect. Positive spread makes the shadow larger than the element — great for glows.' },
                { prop: 'color', ex: 'rgba / hex', desc: 'The shadow colour. Using rgba() lets you control opacity separately from the colour, which is the most flexible approach. Avoid solid black — most natural shadows use rgba(0,0,0,0.1) to rgba(0,0,0,0.3).' },
              ].map(({ prop, ex, desc }) => (
                <div key={prop} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                  <div className="flex-shrink-0">
                    <code className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg block">{prop}</code>
                    <span className="text-xs text-slate-400 font-mono block mt-1 text-center">{ex}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm mb-2">The inset keyword</h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-300 leading-relaxed">
                Adding <code className="bg-white dark:bg-slate-800 px-1 rounded font-mono">inset</code> before the values turns a drop shadow into an inner shadow — the shadow appears inside the element instead of outside. This is great for pressed button states, embedded wells, or sunken input fields. Toggle the "Inset Shadow" switch per layer in the tool above.
              </p>
            </div>
          </section>

          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Layering Multiple Shadows — The Secret to Professional UI Design</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              CSS allows multiple shadows on a single element by separating them with commas. This is where the real magic happens. A single shadow looks flat. Two or more shadows stacked together create the kind of depth that makes interfaces look genuinely polished.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Here's why layering works: in real life, shadows aren't uniformly blurred. An object casts a sharp, dark shadow close up and a soft, faint shadow further away. To replicate this in CSS, you layer a tight, more opaque shadow with a wide, barely-there ambient shadow.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: 'Tailwind-style shadow-md equivalent', css: 'box-shadow:\n  0 4px 6px -1px rgba(0,0,0,0.10),\n  0 2px 4px -1px rgba(0,0,0,0.06);' },
                { name: 'Large card with ambient light', css: 'box-shadow:\n  0 20px 40px -10px rgba(0,0,0,0.20),\n  0 4px 8px -2px rgba(0,0,0,0.08);' },
                { name: 'Neon glow effect', css: 'box-shadow:\n  0 0 10px 2px rgba(59,130,246,0.7),\n  0 0 30px 5px rgba(59,130,246,0.3);' },
                { name: 'Neumorphism (soft UI)', css: 'box-shadow:\n  6px 6px 12px #b8b9be,\n  -6px -6px 12px #ffffff;' },
              ].map(({ name, css }) => (
                <div key={name} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-xs mb-2">{name}</h3>
                  <pre className="text-xs font-mono text-emerald-600 dark:text-emerald-400 leading-relaxed whitespace-pre-wrap">{css}</pre>
                </div>
              ))}
            </div>
          </section>

          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">CSS text-shadow — Adding Depth to Typography</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Text shadows work slightly differently from box shadows. The syntax is <code className="bg-slate-100 dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded font-mono text-sm">text-shadow: offsetX offsetY blur color</code>. There is no spread parameter, and no inset keyword. But you can still layer multiple shadows for dramatic typographic effects.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mb-5">
              {[
                { name: 'Subtle lift', desc: 'Small offset, some blur, low opacity. Used for body text on coloured backgrounds to improve legibility.' },
                { name: 'Neon glow', desc: 'Zero offset, large blur, vivid colour. Creates the glowing text effect popular in dark-mode designs and gaming UIs.' },
                { name: 'Hard outline', desc: 'Four shadows at ±1px offset, zero blur. Creates a solid text outline using only CSS shadows — no -webkit-text-stroke needed.' },
              ].map(({ name, desc }) => (
                <div key={name} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-2">{name}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              Switch to the <strong className="text-slate-900 dark:text-white">Text Shadow</strong> tab in the generator above. You'll find six presets including Soft, Hard, Neon, Retro, Emboss, and Outline — each demonstrating a different text shadow technique. Adjust the sliders to customize them, then copy the CSS.
            </p>
          </section>

          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this CSS shadow generator free?', a: 'Yes, completely free. No account, no login, no watermarks. You can use it as many times as you need. The generated CSS is yours to use in any project, commercial or personal.' },
                { q: 'Does the generated CSS work in all browsers?', a: 'Yes. The box-shadow and text-shadow properties are fully supported in all modern browsers including Chrome, Firefox, Safari, Edge, and Opera. No vendor prefixes are needed for modern targets. If you need to support very old browsers like IE9, the prefix -webkit-box-shadow is also accepted but is rarely needed today.' },
                { q: 'Can I layer multiple shadows?', a: 'Yes — click "Add Layer" to add as many shadow layers as you need. Each layer is configurable independently. The generated CSS combines them all into a comma-separated list which the browser renders simultaneously.' },
                { q: 'What is the inset keyword in box-shadow?', a: 'Inset creates an inner shadow that appears inside the element rather than outside. It works by reversing the shadow direction. Inset shadows are great for pressed button states, sunken input fields, and the neumorphism UI trend.' },
                { q: 'What is the spread radius?', a: 'Spread radius (the 4th value in box-shadow) expands or contracts the shadow size before blur is applied. A negative spread with a large blur creates a very natural-looking shadow that appears to recede. A positive spread can create a solid border-like effect.' },
                { q: 'What is neumorphism?', a: 'Neumorphism (also called soft UI) is a design trend where elements appear to be extruded from the background. It uses two box shadows — one lighter, one darker — applied to elements that are the same colour as the background. The preset "Neumorphic" in this tool demonstrates the technique.' },
                { q: 'Can I download the generated CSS?', a: 'Yes. Click the Download button next to the Copy button to save a ready-to-use .css file named shadow.css. It includes a comment crediting the generator and the .element selector wrapping the shadow property.' },
                { q: 'Can I use this tool for text-shadow?', a: 'Yes. Click the "Text Shadow" tab at the top of the tool. You will get sliders for offsetX, offsetY, blur, colour, and opacity — all with a live preview showing the shadow applied to text. Six text-shadow presets are included: Soft, Hard, Neon, Retro, Emboss, and Outline.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}