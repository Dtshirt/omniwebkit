// src/app/tools/color-picker/page.js
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Palette, Copy, Download, RefreshCw, Check, Shuffle } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Color math helpers ─────────────────────────────────────────────────── */

const hexToRgb = (hex) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
};

const rgbToHex = (r, g, b) =>
  '#' + [r, g, b].map(x => Math.min(255, Math.max(0, Math.round(x))).toString(16).padStart(2, '0')).join('');

const hexToHsl = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const getColorValue = (hex, format) => {
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);
  switch (format) {
    case 'hex': return hex.toUpperCase();
    case 'rgb': return rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : '';
    case 'rgba': return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` : '';
    case 'hsl': return hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : '';
    case 'hsla': return hsl ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` : '';
    default: return hex;
  }
};

const getLuminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const getContrastRatio = (hex1, hex2) => {
  const l1 = getLuminance(hex1), l2 = getLuminance(hex2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

const wcagLabel = (ratio) => {
  if (ratio >= 7) return { label: 'AAA', cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' };
  if (ratio >= 4.5) return { label: 'AA', cls: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' };
  if (ratio >= 3) return { label: 'AA Large', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' };
  return { label: 'Fail', cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
};

/* Generate tints (lighter) and shades (darker) from an HSL base */
const generateTints = (hex) => {
  const hsl = hexToHsl(hex);
  if (!hsl) return [];
  return [90, 80, 70, 60, 50].map(l => hslToHex(hsl.h, hsl.s, l));
};
const generateShades = (hex) => {
  const hsl = hexToHsl(hex);
  if (!hsl) return [];
  return [40, 30, 20, 15, 8].map(l => hslToHex(hsl.h, hsl.s, l));
};
const generateHarmonies = (hex) => {
  const hsl = hexToHsl(hex);
  if (!hsl) return [];
  const { h, s, l } = hsl;
  return [
    { label: 'Complementary', color: hslToHex((h + 180) % 360, s, l) },
    { label: 'Analogous 1', color: hslToHex((h + 30) % 360, s, l) },
    { label: 'Analogous 2', color: hslToHex((h - 30 + 360) % 360, s, l) },
    { label: 'Triadic 1', color: hslToHex((h + 120) % 360, s, l) },
    { label: 'Triadic 2', color: hslToHex((h + 240) % 360, s, l) },
    { label: 'Split Comp 1', color: hslToHex((h + 150) % 360, s, l) },
    { label: 'Split Comp 2', color: hslToHex((h + 210) % 360, s, l) },
    { label: 'Tetradic 1', color: hslToHex((h + 90) % 360, s, l) },
  ];
};

const POPULAR = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E', '#14B8A6',
  '#3B82F6', '#8B5CF6', '#EC4899', '#64748B', '#F8FAFC', '#0F172A',
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
];

const FORMATS = [
  { key: 'hex', name: 'HEX' },
  { key: 'rgb', name: 'RGB' },
  { key: 'rgba', name: 'RGBA' },
  { key: 'hsl', name: 'HSL' },
  { key: 'hsla', name: 'HSLA' },
];

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6';

/* ─── Component ─────────────────────────────────────────────────────────── */

const ColorPicker = () => {
  const [selected, setSelected] = useState('#3B82F6');
  const [history, setHistory] = useState(['#3B82F6']);
  const [tints, setTints] = useState([]);
  const [shades, setShades] = useState([]);
  const [harmonies, setHarmonies] = useState([]);
  const [copied, setCopied] = useState(null);      // which format key was copied
  const [activeTab, setActiveTab] = useState('tints');   // 'tints' | 'shades' | 'harmony'

  const pickColor = useCallback((hex) => {
    setSelected(hex);
    setHistory(prev => prev.includes(hex) ? prev : [hex, ...prev.slice(0, 19)]);
  }, []);

  useEffect(() => {
    setTints(generateTints(selected));
    setShades(generateShades(selected));
    setHarmonies(generateHarmonies(selected));
  }, [selected]);

  const copyValue = (hex, format) => {
    const val = getColorValue(hex, format);
    navigator.clipboard.writeText(val)
      .then(() => { setCopied(format); toast.success(`Copied ${val}`); setTimeout(() => setCopied(null), 2000); })
      .catch(() => toast.error('Copy failed'));
  };

  const randomColor = () => {
    const hex = '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
    pickColor(hex);
  };

  const downloadPalette = () => {
    const all = [selected, ...tints, ...shades, ...harmonies.map(h => h.color)];
    const w = 100, h = 120, cols = all.length;
    const canvas = document.createElement('canvas');
    canvas.width = w * cols; canvas.height = h;
    const ctx = canvas.getContext('2d');
    all.forEach((c, i) => {
      ctx.fillStyle = c; ctx.fillRect(i * w, 0, w, 80);
      ctx.fillStyle = '#333'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
      ctx.fillText(c.toUpperCase(), i * w + w / 2, 100);
    });
    canvas.toBlob(blob => {
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `palette-${selected.slice(1)}.png` });
      a.click(); URL.revokeObjectURL(a.href);
    });
    toast.success('Palette downloaded!');
  };

  // Contrast against white and black
  const contrastWhite = getContrastRatio(selected, '#FFFFFF');
  const contrastBlack = getContrastRatio(selected, '#000000');
  const wcagW = wcagLabel(contrastWhite);
  const wcagB = wcagLabel(contrastBlack);
  const onDark = getLuminance(selected) < 0.179;
  const textOnColor = onDark ? '#FFFFFF' : '#111111';

  const currentPalette = activeTab === 'tints' ? tints : activeTab === 'shades' ? shades : harmonies.map(h => h.color);

  const hsl = hexToHsl(selected);
  const rgb = hexToRgb(selected);

  const SwatchGrid = ({ colors, onPick, labels }) => (
    <div className={`grid gap-2 ${labels ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-5 sm:grid-cols-5'}`}>
      {colors.map((c, i) => (
        <div key={i} className="group cursor-pointer" onClick={() => onPick(c)} title={c}>
          <div className="aspect-square rounded-xl border-2 border-slate-200 dark:border-slate-700 group-hover:scale-105 group-hover:shadow-lg transition-all"
            style={{ backgroundColor: c }} />
          <div className="mt-1 text-xs font-mono text-center text-slate-500 dark:text-slate-400 truncate">{c.toUpperCase()}</div>
          {labels && labels[i] && <div className="text-xs text-center text-slate-400 dark:text-slate-500 truncate">{labels[i]}</div>}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Color Picker', href: '/tools/color-picker' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 via-violet-500 to-indigo-500 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
            <Palette className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Color Picker &amp; Palette Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pick any colour and instantly get HEX, RGB, HSL values. Generate tints, shades, and colour harmonies. Check WCAG contrast scores for accessibility.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left / Main ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Colour picker card */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Colour Picker</h2>
                <button onClick={randomColor} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition">
                  <Shuffle className="h-3.5 w-3.5" /> Random
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                {/* Big swatch + native picker */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-36 h-36 rounded-2xl shadow-xl border-4 border-white dark:border-slate-700 flex items-end justify-center pb-2"
                    style={{ backgroundColor: selected }}>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(0,0,0,0.35)', color: '#fff' }}>
                      {selected.toUpperCase()}
                    </span>
                  </div>
                  <input type="color" value={selected} onChange={e => pickColor(e.target.value)}
                    className="w-36 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-600" />
                </div>

                {/* Format values */}
                <div className="flex-1 w-full space-y-2.5">
                  {FORMATS.map(f => (
                    <div key={f.key} className="flex items-center gap-2">
                      <span className="w-12 flex-shrink-0 text-xs font-bold text-slate-500 dark:text-slate-400 text-right">{f.name}</span>
                      <input readOnly value={getColorValue(selected, f.key)}
                        className="flex-1 px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white outline-none" />
                      <button onClick={() => copyValue(selected, f.key)}
                        className={`p-2 rounded-lg transition flex-shrink-0 ${copied === f.key ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                        title={`Copy ${f.name}`}>
                        {copied === f.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* HSL / RGB breakdown */}
              {hsl && rgb && (
                <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2 pt-5 border-t border-slate-100 dark:border-slate-700">
                  {[['R', rgb.r, 'text-red-600 dark:text-red-400'],
                  ['G', rgb.g, 'text-emerald-600 dark:text-emerald-400'],
                  ['B', rgb.b, 'text-blue-600 dark:text-blue-400'],
                  ['H', `${hsl.h}°`, 'text-violet-600 dark:text-violet-400'],
                  ['S', `${hsl.s}%`, 'text-pink-600 dark:text-pink-400'],
                  ['L', `${hsl.l}%`, 'text-amber-600 dark:text-amber-400'],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="text-center p-2 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                      <div className={`text-xs font-bold ${cls}`}>{label}</div>
                      <div className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WCAG Contrast card */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Accessibility — WCAG Contrast</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { bg: selected, fg: '#FFFFFF', label: 'On White Background', ratio: contrastWhite, wcag: wcagW },
                  { bg: selected, fg: '#000000', label: 'On Black Background', ratio: contrastBlack, wcag: wcagB },
                ].map(({ bg, fg, label, ratio, wcag }) => (
                  <div key={label} className="border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
                    <div className="h-16 flex items-center justify-center" style={{ backgroundColor: bg }}>
                      <span className="font-bold text-base" style={{ color: fg }}>Sample Text</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{ratio.toFixed(2)}:1</div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg ${wcag.cls}`}>{wcag.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">WCAG AA requires ≥ 4.5:1 for normal text. AAA requires ≥ 7:1. AA Large requires ≥ 3:1 for large text (18pt+).</p>
            </div>

            {/* Palette tabs */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Generated Palettes</h2>
                <button onClick={downloadPalette}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition">
                  <Download className="h-3.5 w-3.5" /> Download PNG
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl mb-5">
                {[['tints', 'Tints'], ['shades', 'Shades'], ['harmony', 'Harmonies']].map(([key, label]) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex-1 text-sm py-1.5 rounded-lg font-semibold transition ${activeTab === key ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === 'harmony'
                ? <SwatchGrid colors={harmonies.map(h => h.color)} onPick={pickColor} labels={harmonies.map(h => h.label)} />
                : <SwatchGrid colors={currentPalette} onPick={pickColor} />
              }
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-6">

            {/* History */}
            {history.length > 1 && (
              <div className={cardCls}>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Colours</h3>
                <div className="grid grid-cols-5 gap-2">
                  {history.slice(0, 15).map((c, i) => (
                    <div key={i} className="aspect-square rounded-lg border-2 border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }} onClick={() => pickColor(c)} title={c} />
                  ))}
                </div>
              </div>
            )}

            {/* Popular colours */}
            <div className={cardCls}>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Popular Colours</h3>
              <div className="grid grid-cols-4 gap-2">
                {POPULAR.map((c, i) => (
                  <div key={i} className="group cursor-pointer" onClick={() => pickColor(c)} title={c}>
                    <div className="aspect-square rounded-xl border-2 border-slate-200 dark:border-slate-700 group-hover:scale-105 group-hover:shadow-md transition-all" style={{ backgroundColor: c }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Colour tips */}
            <div className={cardCls}>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Colour Theory Tips</h3>
              <div className="space-y-2.5">
                {[
                  { tip: '60-30-10 Rule', desc: 'Use your dominant colour 60%, secondary 30%, accent 10% for balanced layouts.' },
                  { tip: 'Complementary Contrast', desc: 'Opposite hues on the colour wheel create maximum visual contrast and energy.' },
                  { tip: 'Analogous Harmony', desc: 'Adjacent hues create softer, more natural-feeling colour schemes.' },
                  { tip: 'WCAG Accessibility', desc: 'Ensure text has at least 4.5:1 contrast ratio against its background (AA standard).' },
                  { tip: 'Tints vs Shades', desc: 'Tints add white; shades add black. Both expand a palette without introducing new hues.' },
                ].map(({ tip, desc }) => (
                  <div key={tip} className="text-sm">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{tip}: </span>
                    <span className="text-slate-600 dark:text-slate-400">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-16 space-y-6">
          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Color Picker &amp; Palette Generator — HEX, RGB, HSL in One Click</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every design project starts with colour. The right colour combination sets the mood, defines the brand, and guides the user's eye through a layout. But finding the exact HEX code you need, converting it to RGB for CSS, checking whether it meets WCAG accessibility standards, and generating a complementary palette can involve four different tools. The OmniWebKit Color Picker combines all of that into one fast, free, browser-based tool.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Use the native colour picker or type any hex value to see the colour displayed instantly. All five CSS colour formats update automatically: HEX, RGB, RGBA, HSL, and HSLA. Each format has its own one-click copy button. Below the main picker, a breakdown shows the individual R, G, and B channel values alongside the H (hue), S (saturation), and L (lightness) values from the HSL model — giving you full visibility into the colour's composition.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The palette generator produces three types of palettes from your chosen colour: tints (lighter versions), shades (darker versions), and eight colour harmonies — complementary, analogous, triadic, split-complementary, and tetradic. Click any swatch to make it the active colour. Use the Download PNG button to export the entire palette as an image file, ready for a mood board, design system, or client presentation.
            </p>
          </section>

          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding Colour Formats — HEX, RGB, HSL, and When to Use Each</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Colours on screens can be expressed in several different formats. Each format has its own strengths, and different tools or contexts require different ones. Here is a practical guide to all five formats this tool supports.
            </p>
            <div className="space-y-4">
              {[
                { fmt: 'HEX (#RRGGBB)', use: 'The most common format for web and graphic design. HEX is a six-character code where each pair of characters represents a Red, Green, and Blue channel value from 00 (minimum) to FF (maximum). It is compact, easy to copy, and universally supported in CSS. Use HEX when you are working in HTML, CSS, Figma, Sketch, or any standard web design tool.' },
                { fmt: 'RGB (rgb(R,G,B))', use: 'The functional CSS notation for colour. RGB explicitly states the red, green, and blue channel values as integers from 0 to 255. It is easier to understand intuitively than HEX — you can see at a glance that rgb(255,0,0) is pure red. Use RGB when you need to manipulate channel values programmatically or when the tool you are using expects the functional CSS syntax.' },
                { fmt: 'RGBA (rgba(R,G,B,A))', use: 'The same as RGB but with an additional alpha (opacity) channel. The alpha value ranges from 0 (fully transparent) to 1 (fully opaque). RGBA is essential whenever you need semi-transparent colours — for overlays, glass effects, shadows, and background fills that allow content to show through.' },
                { fmt: 'HSL (hsl(H,S%,L%))', use: 'HSL stands for Hue, Saturation, and Lightness. Hue is the colour angle on a 360° wheel. Saturation controls how vivid the colour is. Lightness controls how bright or dark it is. HSL is far more intuitive for designers because adjusting only the L value lets you create tints and shades of a colour while keeping the hue identical. Most design systems use HSL under the hood.' },
                { fmt: 'HSLA (hsla(H,S%,L%,A))', use: 'HSL with an alpha channel for transparency. Provides the intuitive hue, saturation, lightness model combined with opacity control. Ideal for design systems that need consistent, transparent colour variants derived from a base palette.' },
              ].map(({ fmt, use }) => (
                <div key={fmt} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{fmt}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{use}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Colour Accessibility — Why WCAG Contrast Ratios Matter</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Roughly 8% of men and 0.5% of women have some form of colour vision deficiency. Many more users view content on screens in bright sunlight, with screen brightness turned low, or on ageing displays with reduced contrast. Accessibility is not just a legal requirement in many jurisdictions — it is fundamental good design.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The Web Content Accessibility Guidelines (WCAG) define three contrast standard levels. WCAG AA requires a minimum contrast ratio of 4.5:1 for normal body text and 3:1 for large text (18pt or 14pt bold). WCAG AAA requires 7:1 for normal text. These ratios apply between the text colour and its immediate background colour.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The accessibility panel in this tool calculates your selected colour's contrast ratio against both pure white (#FFFFFF) and pure black (#000000), and shows the WCAG rating (AA, AAA, AA Large, or Fail) for each. As a general rule, if a colour achieves WCAG AA against white, it is safe for light backgrounds. If it achieves WCAG AA against black, it is safe for dark backgrounds.
            </p>
          </section>

          <section className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this color picker free?', a: 'Yes, completely free with no account required. There are no usage limits. All colour processing happens in your browser — no data is sent to any server.' },
                { q: 'What colour formats does this tool support?', a: 'The tool outputs five CSS colour formats: HEX (#RRGGBB), RGB (rgb(R,G,B)), RGBA (rgba(R,G,B,A)), HSL (hsl(H,S%,L%)), and HSLA (hsla(H,S%,L%,A)). Each has a dedicated one-click copy button.' },
                { q: 'What is the difference between tints and shades?', a: 'Tints are created by mixing a colour with white, making it lighter. Shades are created by mixing a colour with black, making it darker. In the HSL model, tints increase the lightness value while shades decrease it, keeping the hue and saturation constant.' },
                { q: 'What are colour harmonies?', a: 'Colour harmonies are combinations of hues that are mathematically related on the colour wheel. This tool generates eight harmonies: complementary (180° opposite), two analogous (±30°), two triadic (±120°), two split-complementary (±150°), and one tetradic (90°). These combinations are proven to work well together in design.' },
                { q: 'What does WCAG contrast ratio mean?', a: 'WCAG (Web Content Accessibility Guidelines) contrast ratio is the measure of the luminosity difference between two colours, typically text and background. WCAG AA requires a ratio of at least 4.5:1 for readable body text. AAA (enhanced) requires 7:1. The tool automatically calculates and displays these ratings for your selected colour against white and black.' },
                { q: 'How do I download the generated palette?', a: 'Click the Download PNG button in the Generated Palettes card. This creates a PNG image containing all tints, shades, and harmony swatches with their HEX codes labelled below each swatch, ready for a mood board or design document.' },
                { q: 'Can I use the eyedropper to pick a colour from my screen?', a: 'The native browser colour picker input (the coloured circle you click) may trigger the OS colour picker, which on some browsers includes an eyedropper tool for picking colours from anywhere on your screen. This depends on your browser and operating system — Chrome on Windows and Mac supports it natively.' },
                { q: 'What is the 60-30-10 colour rule?', a: 'The 60-30-10 rule is a simple design principle: use your dominant colour for 60% of the design (backgrounds, large areas), your secondary colour for 30% (cards, sections, sidebars), and your accent colour for 10% (buttons, highlights, calls to action). This creates a balanced, professional-looking layout without visual overwhelm.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
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
};

export default ColorPicker;