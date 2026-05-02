'use client';
import { useState, useMemo } from 'react';
import { Copy, Check, Layers, Sun } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Color math ────────────────────────────────────────────────────── */
function adjustColor(hex, amount) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amount));
  return `rgba(${r},${g},${b},0.6)`;
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

// Relative luminance → pick text color
function textColorFor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? '#374151' : '#f9fafb';
}

/* ─── Shadow generation ─────────────────────────────────────────────── */
const LIGHT_POS = {
  'top-left': { x: -1, y: -1 },
  'top-right': { x: 1, y: -1 },
  'bottom-left': { x: -1, y: 1 },
  'bottom-right': { x: 1, y: 1 },
};

function generateShadows({ distance, intensity, blur, shape, lightSource, bgColor }) {
  const pos = LIGHT_POS[lightSource];
  const lx = distance * pos.x, ly = distance * pos.y;
  const dx = distance * -pos.x, dy = distance * -pos.y;
  const light = adjustColor(bgColor, intensity * 100);
  const dark = adjustColor(bgColor, -intensity * 100);
  if (shape === 'flat') return `${lx}px ${ly}px ${blur}px ${light}, ${dx}px ${dy}px ${blur}px ${dark}`;
  if (shape === 'concave') return `inset ${dx}px ${dy}px ${blur}px ${dark}, inset ${lx}px ${ly}px ${blur}px ${light}`;
  /* convex */             return `${dx}px ${dy}px ${blur}px ${dark}, ${lx}px ${ly}px ${blur}px ${light}`;
}

function generateCSS({ radius, bgColor, size, ...rest }) {
  const shadows = generateShadows({ ...rest, bgColor });
  return `border-radius: ${radius}px;\nbackground: ${bgColor};\nbox-shadow: ${shadows};`;
}

/* ─── Color presets ─────────────────────────────────────────────────── */
const COLOR_PRESETS = [
  { label: 'Classic', color: '#e0e5ec' },
  { label: 'Slate', color: '#c8d6e5' },
  { label: 'Warm', color: '#f0e6d3' },
  { label: 'Rose', color: '#f3dde0' },
  { label: 'Sage', color: '#dde8de' },
  { label: 'Lavender', color: '#e8e0f3' },
  { label: 'Dark', color: '#2d3748' },
  { label: 'Midnight', color: '#1a202c' },
];

/* ─── Slider ─────────────────────────────────────────────────────────── */
function Slider({ label, value, min, max, step = 1, unit = '', onChange, accent }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-black uppercase tracking-wide" style={{ color: accent }}>{label}</span>
        <span className="text-xs font-black font-mono" style={{ color: accent }}>{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer outline-none appearance-none"
        style={{
          background: `linear-gradient(to right, #667eea 0%, #667eea ${pct}%, rgba(0,0,0,0.12) ${pct}%, rgba(0,0,0,0.12) 100%)`,
        }}
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
const DEFAULTS = { size: 200, radius: 50, distance: 20, intensity: 0.15, blur: 60, shape: 'flat', lightSource: 'top-left', bgColor: '#e0e5ec' };

export default function NeumorphismGenerator() {
  const [cfg, setCfg] = useState(DEFAULTS);
  const [copied, setCopied] = useState('');

  const set = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  const shadows = useMemo(() => generateShadows(cfg), [cfg]);
  const css = useMemo(() => generateCSS(cfg), [cfg]);
  const fgColor = useMemo(() => textColorFor(cfg.bgColor), [cfg.bgColor]);

  const copy = (which) => {
    const text = which === 'css' ? css
      : `.neumorphic {\n  ${css.replace(/\n/g, '\n  ')}\n}`;
    navigator.clipboard.writeText(text);
    setCopied(which); setTimeout(() => setCopied(''), 2000);
  };

  /* Neumorphic button style (for shape selector) */
  const nmBase = { background: cfg.bgColor, boxShadow: `5px 5px 10px ${adjustColor(cfg.bgColor, -cfg.intensity * 100)}, -5px -5px 10px ${adjustColor(cfg.bgColor, cfg.intensity * 100)}`, transition: 'all 0.25s ease', border: 'none', cursor: 'pointer', borderRadius: '10px', fontWeight: 700, fontSize: '12px', textTransform: 'capitalize' };
  const nmActive = { boxShadow: `inset 4px 4px 8px ${adjustColor(cfg.bgColor, -cfg.intensity * 100)}, inset -4px -4px 8px ${adjustColor(cfg.bgColor, cfg.intensity * 100)}` };

  /* Light source indicator */
  const lsDot = (pos) => {
    const active = cfg.lightSource === pos;
    return (
      <div onClick={() => set('lightSource', pos)}
        style={{
          width: 14, height: 14, borderRadius: '50%', cursor: 'pointer', transition: 'all 0.3s ease',
          background: active ? '#667eea' : 'rgba(0,0,0,0.15)',
          boxShadow: active ? '0 0 14px rgba(102,126,234,0.7)' : 'none',
        }} title={pos} />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">

      {/* Header */}
      <div className="text-center mb-8 max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Neumorphism Generator', href: '/tools/neumorphism-generator' }]} />
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
          <Layers className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Neumorphism Generator</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Create soft UI CSS neumorphism effects with live preview and one-click copy</p>
      </div>

      <div className="max-w-6xl mx-auto">

        {/* Color presets */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide self-center mr-1">Presets:</span>
          {COLOR_PRESETS.map(p => (
            <button key={p.color} onClick={() => set('bgColor', p.color)} title={p.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition hover:scale-105 ${cfg.bgColor === p.color ? 'border-indigo-400 ring-2 ring-indigo-200' : 'border-transparent'}`}
              style={{ background: p.color, color: textColorFor(p.color) }}>
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-5">

          {/* Preview */}
          <div className="rounded-2xl relative flex items-center justify-center" style={{ background: cfg.bgColor, minHeight: 400 }}>
            {/* Light source dots — clickable corners */}
            <div className="absolute top-4 left-4">  {lsDot('top-left')}    </div>
            <div className="absolute top-4 right-4"> {lsDot('top-right')}   </div>
            <div className="absolute bottom-4 left-4">{lsDot('bottom-left')}</div>
            <div className="absolute bottom-4 right-4">{lsDot('bottom-right')}</div>
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-40 flex items-center gap-1" style={{ color: fgColor }}>
              <Sun className="w-3 h-3" />Click corner dot to set light source
            </span>

            {/* Preview element */}
            <div style={{
              width: cfg.size, height: cfg.size,
              borderRadius: cfg.radius,
              background: cfg.bgColor,
              boxShadow: shadows,
              transition: 'all 0.3s ease',
            }} />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">

            {/* Shape type */}
            <div className="rounded-2xl p-5" style={{ background: cfg.bgColor }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: fgColor, opacity: 0.6 }}>Shape Type</p>
              <div className="flex gap-2">
                {['flat', 'concave', 'convex'].map(s => (
                  <button key={s} onClick={() => set('shape', s)}
                    style={{ ...nmBase, ...(cfg.shape === s ? nmActive : {}), color: cfg.shape === s ? '#667eea' : fgColor, opacity: cfg.shape === s ? 1 : 0.7, flex: 1, padding: '10px 0' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="rounded-2xl p-5" style={{ background: cfg.bgColor }}>
              <Slider label="Size" value={cfg.size} min={100} max={350} onChange={v => set('size', v)} unit="px" accent={fgColor} />
              <Slider label="Radius" value={cfg.radius} min={0} max={175} onChange={v => set('radius', v)} unit="px" accent={fgColor} />
              <Slider label="Distance" value={cfg.distance} min={5} max={50} onChange={v => set('distance', v)} unit="px" accent={fgColor} />
              <Slider label="Blur" value={cfg.blur} min={10} max={100} onChange={v => set('blur', v)} unit="px" accent={fgColor} />
              <Slider label="Intensity" value={cfg.intensity} min={0.05} max={0.3} step={0.01} onChange={v => set('intensity', v)} accent={fgColor} />

              <div className="mt-2">
                <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: fgColor, opacity: 0.6 }}>Background Color</p>
                <input type="color" value={cfg.bgColor} onChange={e => set('bgColor', e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer border-0"
                  style={{ boxShadow: `inset 4px 4px 8px ${adjustColor(cfg.bgColor, -cfg.intensity * 100)}, inset -4px -4px 8px ${adjustColor(cfg.bgColor, cfg.intensity * 100)}` }} />
              </div>
            </div>

            {/* CSS Output */}
            <div className="bg-slate-900 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">CSS Output</span>
                <div className="flex gap-2">
                  <button onClick={() => copy('css')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-bold transition">
                    {copied === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'css' ? 'Copied' : 'Copy CSS'}
                  </button>
                  <button onClick={() => copy('class')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition">
                    {copied === 'class' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'class' ? 'Copied' : 'With Class'}
                  </button>
                </div>
              </div>
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto bg-slate-950 rounded-xl p-4">
                {css}
              </pre>
            </div>

          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Neumorphism CSS Generator — Create Soft UI Effects Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Neumorphism (also called Neu-morphism or Soft UI) is one of the most distinctive UI design trends of the last few years. It creates a sense of depth by combining a background-matching element color with carefully calculated dual box shadows — one lighter than the background and one darker. The result is a clean, tactile, almost physical appearance that makes interface elements look like they are molded from the same material as the background itself.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free Neumorphism Generator lets you design and export CSS neumorphic styles in seconds. Adjust the size, border radius, shadow distance, blur radius, shadow intensity, and background color using the live controls. Choose from three shape modes — Flat (standard raised neumorphic), Concave (inset/pressed appearance), or Convex (bulging outward) — and click any corner dot in the preview to set the virtual light source direction. The CSS output updates in real time, and you can copy it as plain CSS properties or as a complete CSS class block with one click.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Eight color presets (Classic, Slate, Warm, Rose, Sage, Lavender, Dark, Midnight) are available for quick starting points, and the custom color picker lets you use any background color you choose. The tool also automatically calculates readable text colors for the control panel based on your chosen background, so labels remain readable at all times.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Understanding Neumorphism — How It Works</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Neumorphism achieves its depth effect through a single CSS property: <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400">box-shadow</code>. Unlike traditional skeuomorphism (which used gradients and textures to simulate real-world materials) or flat design (which removes all depth cues), neumorphism uses two shadows from opposite directions:
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {[
                { t: 'Light shadow', c: 'text-amber-600 dark:text-amber-400', b: 'A lighter version of the background color cast from the direction of the virtual light source. This simulates the part of the element facing the light.' },
                { t: 'Dark shadow', c: 'text-slate-600 dark:text-slate-400', b: 'A darker version of the background color cast from the opposite direction. This simulates the shadow on the side facing away from the light.' },
                { t: 'Raised (Flat)', c: 'text-blue-600 dark:text-blue-400', b: 'Both shadows are external (no `inset`). The element appears to protrude from the background surface, like a button raised from a panel.' },
                { t: 'Concave', c: 'text-violet-600 dark:text-violet-400', b: 'Both shadows are `inset`. The element appears to be pressed into the background, like a selected/active button or an input field.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The key constraint of neumorphism is that the element&apos;s background color must match the page background color. The shadow colors are calculated as lighter and darker variants of that same color using the <strong>Intensity</strong> slider, which controls how much lighter and darker the shadow colors are relative to the base. A higher intensity produces more visible, more contrasted shadows. A lower intensity gives a more subtle, refined look.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Controls Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2 px-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Control</th>
                    <th className="py-2 px-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Range</th>
                    <th className="py-2 px-3 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase">Effect</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { c: 'Size', r: '100–350px', e: 'Width and height of the preview element.' },
                    { c: 'Radius', r: '0–175px', e: 'Border radius. 0 = sharp corners, 50% of size = circle.' },
                    { c: 'Distance', r: '5–50px', e: 'X and Y offset of both shadows from the element. Higher = more pronounced depth.' },
                    { c: 'Blur', r: '10–100px', e: 'Spread/softness of the shadows. Higher = softer, more diffuse shadows.' },
                    { c: 'Intensity', r: '0.05–0.30', e: 'How much lighter/darker the shadow colors are vs the background. Higher = more contrast.' },
                    { c: 'Shape Type', r: 'Flat/Concave/Convex', e: 'Controls whether shadows are external (raised), inset (pressed), or reversed external (convex).' },
                    { c: 'Light Source', r: '4 corners', e: 'Direction the virtual light comes from. Determines which shadow is light and which is dark.' },
                    { c: 'Background Color', r: 'Any hex', e: 'The base color for the background and element. Shadow colors are derived from this.' },
                  ].map(({ c, r, e }, i) => (
                    <tr key={c} className={`border-b border-slate-100 dark:border-slate-700/50 ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
                      <td className="py-2.5 px-3 font-bold text-indigo-600 dark:text-indigo-400 text-xs">{c}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-500 dark:text-slate-400">{r}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-600 dark:text-slate-400">{e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'What is neumorphism in web design?', a: 'Neumorphism is a UI design style that creates soft, extruded elements by using dual box shadows — one lighter than the background and one darker — applied to elements that match the background color. It creates a physical, tactile depth effect without heavy gradients or textures.' },
                { q: 'What browsers support neumorphic CSS box-shadow?', a: 'All modern browsers support the CSS `box-shadow` property, including Chrome, Firefox, Safari, Edge, and Opera. Neumorphic styles work in any browser that supports `box-shadow` and `border-radius`, which is effectively all browsers in active use today.' },
                { q: 'Why does neumorphism require matching background colors?', a: 'The depth illusion breaks if the element color differs from the background. The shadows simulate raised or pressed surfaces on a uniform material — if the element has a different color, it no longer looks like it is part of the same surface.' },
                { q: 'Is neumorphism accessible?', a: 'Standard neumorphism has known accessibility issues: the low contrast between element and background makes it hard for users with visual impairments to distinguish interactive elements. For production apps, pair neumorphic design with clear focus indicators, sufficient text contrast, and ARIA labels.' },
                { q: 'What is the difference between flat, concave, and convex modes?', a: 'Flat = element raised above the surface (external shadows). Concave = element pressed into the surface (inset shadows). Convex = element with reversed raised appearance (swapped shadow positions).' },
                { q: 'How do I use the copied CSS?', a: 'Paste the "Copy CSS" output directly into an element\'s style rule in your CSS file. Or use "With Class" to copy the CSS wrapped in a `.neumorphic {}` class block, ready to add to a stylesheet.' },
                { q: 'Can I use neumorphism with dark backgrounds?', a: 'Yes. Select the "Dark" or "Midnight" preset, or any dark color with the color picker. The shadow algorithm adapts to dark backgrounds automatically, lightening and darkening the base color accordingly.' },
                { q: 'What is the light source in the preview?', a: 'The four corner dots in the preview area represent the location of the virtual light source. Clicking a dot changes the direction the light is "coming from", which reverses which shadow is lighter and which is darker.' },
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