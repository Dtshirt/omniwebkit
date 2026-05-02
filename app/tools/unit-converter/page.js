'use client';
import { useState, useEffect } from 'react';
import { Calculator, ArrowRightLeft, Info, Copy, Check, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition font-medium';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

function useToast() {
  const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
  const el = msg ? (<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}</div>) : null;
  return { show, el };
}

const CATS = {
  'data-transfer': { name: 'Data Transfer Rate', icon: '\uD83D\uDCE1', units: { bps: { name: 'Bits per second (bps)', base: 1 }, kbps: { name: 'Kilobits/s (Kbps)', base: 1000 }, mbps: { name: 'Megabits/s (Mbps)', base: 1e6 }, gbps: { name: 'Gigabits/s (Gbps)', base: 1e9 }, tbps: { name: 'Terabits/s (Tbps)', base: 1e12 }, Bps: { name: 'Bytes/s (B/s)', base: 8 }, KBps: { name: 'Kilobytes/s (KB/s)', base: 8e3 }, MBps: { name: 'Megabytes/s (MB/s)', base: 8e6 }, GBps: { name: 'Gigabytes/s (GB/s)', base: 8e9 } } },
  'fuel-efficiency': { name: 'Fuel Efficiency', icon: '\u26FD', units: { 'mpg-us': { name: 'Miles/gallon (US)', base: 1 }, 'mpg-uk': { name: 'Miles/gallon (UK)', base: 1.20095 }, 'km-l': { name: 'Kilometers/liter', base: 2.35215 }, 'l-100km': { name: 'Liters/100 km', base: null, inverse: 235.215 }, 'mpg-us-inv': { name: 'Gallons/100 miles (US)', base: null, inverse: 100 } } },
  'astronomy': { name: 'Astronomical Distances', icon: '\uD83C\uDF0C', units: { km: { name: 'Kilometers', base: 1 }, au: { name: 'Astronomical Units (AU)', base: 149597870.7 }, ly: { name: 'Light Years', base: 9460730472580.8 }, pc: { name: 'Parsecs', base: 30856775814913.673 }, mi: { name: 'Miles', base: 1.60934 }, 'moon-dist': { name: 'Earth\u2013Moon Distance', base: 384400 }, 'sun-dist': { name: 'Earth\u2013Sun Distance', base: 149597870.7 } } },
  'typography': { name: 'Typography & Web Units', icon: '\uD83D\uDCCF', units: { px: { name: 'Pixels (px)', base: 1 }, pt: { name: 'Points (pt)', base: 1.333333 }, em: { name: 'Em (16px base)', base: 16 }, rem: { name: 'Root Em (16px)', base: 16 }, pcx: { name: 'Picas (pc)', base: 16 }, 'in': { name: 'Inches', base: 96 }, cm: { name: 'Centimeters', base: 37.795275591 }, mm: { name: 'Millimeters', base: 3.7795275591 }, vw: { name: 'Viewport Width (1920px)', base: 19.2 }, vh: { name: 'Viewport Height (1080px)', base: 10.8 } } },
  'pressure': { name: 'Pressure Units', icon: '\uD83C\uDF21\uFE0F', units: { pa: { name: 'Pascals (Pa)', base: 1 }, kpa: { name: 'Kilopascals (kPa)', base: 1e3 }, mpa: { name: 'Megapascals (MPa)', base: 1e6 }, bar: { name: 'Bar', base: 1e5 }, atm: { name: 'Atmospheres (atm)', base: 101325 }, psi: { name: 'PSI', base: 6894.757 }, torr: { name: 'Torr', base: 133.322 }, mmhg: { name: 'mmHg', base: 133.322 } } },
  'digital-storage': { name: 'Digital Storage (Binary)', icon: '\uD83D\uDCBE', units: { bit: { name: 'Bits', base: 1 }, byte: { name: 'Bytes', base: 8 }, kib: { name: 'Kibibytes (KiB)', base: 8192 }, mib: { name: 'Mebibytes (MiB)', base: 8388608 }, gib: { name: 'Gibibytes (GiB)', base: 8589934592 }, tib: { name: 'Tebibytes (TiB)', base: 8796093022208 }, kb: { name: 'Kilobytes (KB)', base: 8e3 }, mb: { name: 'Megabytes (MB)', base: 8e6 }, gb: { name: 'Gigabytes (GB)', base: 8e9 }, tb: { name: 'Terabytes (TB)', base: 8e12 } } },
  'angle': { name: 'Angle Measurements', icon: '\uD83D\uDCD0', units: { deg: { name: 'Degrees (\u00B0)', base: 1 }, rad: { name: 'Radians (rad)', base: 57.2957795131 }, grad: { name: 'Gradians (grad)', base: 0.9 }, turn: { name: 'Turns', base: 360 }, arcmin: { name: 'Arc minutes (\u2032)', base: 0.0166667 }, arcsec: { name: 'Arc seconds (\u2033)', base: 0.000277778 }, mrad: { name: 'Milliradians (mrad)', base: 0.0572957795 } } },
  'frequency': { name: 'Frequency', icon: '\uD83D\uDCFB', units: { hz: { name: 'Hertz (Hz)', base: 1 }, khz: { name: 'Kilohertz (kHz)', base: 1e3 }, mhz: { name: 'Megahertz (MHz)', base: 1e6 }, ghz: { name: 'Gigahertz (GHz)', base: 1e9 }, rpm: { name: 'RPM', base: 0.0166667 }, rps: { name: 'RPS', base: 1 }, bpm: { name: 'BPM', base: 0.0166667 } } },
};

const CAT_INFO = {
  'data-transfer': 'Data transfer rates measure how fast data moves. 1 byte = 8 bits. Network speeds are in bits/s, storage speeds in bytes/s.',
  'fuel-efficiency': 'Fuel efficiency measures distance per unit of fuel. L/100km is inverse — lower = better. US and UK gallons differ.',
  'astronomy': '1 AU = Earth\u2013Sun distance. 1 light year = distance light travels in a year. 1 parsec \u2248 3.26 light years.',
  'typography': 'Relative units (em, rem) scale with base font size (16px). Absolute units (px, pt, in) are fixed. Viewport units (vw, vh) scale with screen.',
  'pressure': 'Pascal (Pa) is the SI unit. 1 atm = sea-level air pressure. PSI is common in the US. Bar is used in meteorology.',
  'digital-storage': 'Binary (KiB, MiB) use base 1024. Decimal (KB, MB) use base 1000. OS uses binary, manufacturers use decimal.',
  'angle': 'Degrees: 360\u00B0/circle. Radians: 2\u03C0/circle. Gradians: 400/circle. Milliradians are used in military applications.',
  'frequency': 'Hertz = cycles/second. Used for sound, radio, processors, rotation. 1 RPM = 1/60 Hz.',
};

function convertVal(val, from, to, cat) {
  if (!val || isNaN(val) || !CATS[cat]) return '';
  const c = CATS[cat]; if (!c.units[from] || !c.units[to]) return '';
  const f = c.units[from], t = c.units[to]; const v = parseFloat(val);
  if (f.inverse) { const b = f.inverse / v; return t.inverse ? (t.inverse / b).toFixed(6) : (b / t.base).toFixed(6); }
  if (t.inverse) { return (t.inverse / (v * f.base)).toFixed(6); }
  return ((v * f.base) / t.base).toFixed(6);
}
function fmt(n) { if (!n) return ''; const v = parseFloat(n); if (Math.abs(v) >= 1e6 || (Math.abs(v) < 0.0001 && v !== 0)) return v.toExponential(4); return parseFloat(v.toFixed(6)).toString(); }

export default function UnitConverter() {
  const [cat, setCat] = useState('data-transfer');
  const [fromU, setFromU] = useState('');
  const [toU, setToU] = useState('');
  const [fromV, setFromV] = useState('');
  const [toV, setToV] = useState('');
  const toast = useToast();

  useEffect(() => {
    const u = Object.keys(CATS[cat].units);
    if (u.length >= 2) { setFromU(u[0]); setToU(u[1]); }
    setFromV(''); setToV('');
  }, [cat]);

  const onFrom = (v) => { setFromV(v); setToV(v && fromU && toU ? convertVal(v, fromU, toU, cat) : ''); };
  const onTo = (v) => { setToV(v); setFromV(v && fromU && toU ? convertVal(v, toU, fromU, cat) : ''); };
  const swap = () => { const tu = fromU, tv = fromV; setFromU(toU); setToU(tu); setFromV(toV); setToV(tv); };
  const cp = (v) => { if (!v) return; navigator.clipboard.writeText(v); toast.show('Copied!'); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Unit Converter', href: '/tools/unit-converter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Unit Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Convert technical and specialised units instantly</p>
        </div>

        {/* Categories */}
        <div className={`${cardCls} p-5 mb-5`}>
          <label className={labelCls}>Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
            {Object.entries(CATS).map(([k, c]) => (
              <button key={k} onClick={() => setCat(k)}
                className={`p-3 rounded-xl text-xs font-bold transition ${cat === k ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}>
                <div className="text-xl mb-1">{c.icon}</div>{c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Converter */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* From */}
          <div className={`${cardCls} p-5`}>
            <label className={labelCls}>From</label>
            <select value={fromU} onChange={e => { setFromU(e.target.value); if (fromV && toU) setToV(convertVal(fromV, e.target.value, toU, cat)); }} className={`${inputCls} mb-3`}>
              {CATS[cat] && Object.entries(CATS[cat].units).map(([k, u]) => <option key={k} value={k}>{u.name}</option>)}
            </select>
            <div className="relative">
              <input type="number" value={fromV} onChange={e => onFrom(e.target.value)} placeholder="Enter value"
                className={`${inputCls} text-lg font-mono pr-10`} />
              {fromV && <button onClick={() => cp(fromV)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"><Copy className="w-4 h-4 text-slate-400" /></button>}
            </div>
          </div>
          {/* To */}
          <div className={`${cardCls} p-5`}>
            <label className={labelCls}>To</label>
            <select value={toU} onChange={e => { setToU(e.target.value); if (fromV && fromU) setToV(convertVal(fromV, fromU, e.target.value, cat)); }} className={`${inputCls} mb-3`}>
              {CATS[cat] && Object.entries(CATS[cat].units).map(([k, u]) => <option key={k} value={k}>{u.name}</option>)}
            </select>
            <div className="relative">
              <input type="number" value={toV} onChange={e => onTo(e.target.value)} placeholder="Result"
                className="w-full px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl text-lg font-mono font-bold text-blue-600 dark:text-blue-400 outline-none focus:ring-2 focus:ring-blue-500/40 transition pr-10" />
              {toV && <button onClick={() => cp(toV)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition"><Copy className="w-4 h-4 text-blue-400" /></button>}
            </div>
          </div>
        </div>

        {/* Swap */}
        <div className="flex justify-center mb-5">
          <button onClick={swap} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg shadow-blue-500/25 transition hover:scale-110 group" title="Swap units">
            <ArrowRightLeft className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* Result */}
        {toV && CATS[cat]?.units[toU] && (
          <div className={`${cardCls} p-5 mb-5`}>
            <div className="text-center">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono mb-1">{fmt(toV)}</div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{CATS[cat].units[toU].name}</p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-500 dark:text-slate-400">{fmt(fromV)} {CATS[cat].units[fromU]?.name} = {fmt(toV)} {CATS[cat].units[toU].name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category info */}
        <div className={`${cardCls} p-5 mb-5`}>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />About {CATS[cat].name}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{CAT_INFO[cat]}</p>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Unit Converter — Technical & Specialised Units</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Most unit converters cover the basics — length, weight, and temperature. But what about data transfer rates, astronomical distances, typography units, or pressure measurements? This Unit Converter is built for technical professionals, developers, engineers, students, and anyone who works with specialised units that are not found in standard converters.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Choose from eight categories: Data Transfer Rate, Fuel Efficiency, Astronomical Distances, Typography and Web Units, Pressure, Digital Storage (binary vs decimal), Angle Measurements, and Frequency. Each category has a curated set of units with accurate conversion factors. Conversions happen instantly as you type.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The tool handles inverse units like liters per 100 km (where lower is better), very large numbers like light years, and very small numbers like arc seconds. Results are displayed with smart formatting — scientific notation for extreme values, and up to six decimal places for precision. Copy any value to your clipboard with one click. Swap units instantly with the swap button. Everything runs in your browser.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Supported Unit Categories</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Data Transfer Rate', c: 'text-blue-600 dark:text-blue-400', b: 'Convert between bps, Kbps, Mbps, Gbps, Tbps and their byte equivalents. Essential for network engineers and ISP comparisons.' },
                { t: 'Fuel Efficiency', c: 'text-emerald-600 dark:text-emerald-400', b: 'MPG (US/UK), km/L, L/100km, gallons/100mi. Handles inverse units where lower means more efficient.' },
                { t: 'Astronomical Distances', c: 'text-violet-600 dark:text-violet-400', b: 'Kilometers, AU, light years, parsecs, miles, Earth\u2013Moon and Earth\u2013Sun distances. Built for very large numbers.' },
                { t: 'Typography & Web Units', c: 'text-rose-600 dark:text-rose-400', b: 'Pixels, points, em, rem, picas, inches, cm, mm, vw, vh. Indispensable for web designers and developers.' },
                { t: 'Pressure', c: 'text-amber-600 dark:text-amber-400', b: 'Pascals, kPa, MPa, bar, atmospheres, PSI, torr, mmHg. Covers engineering, weather, and medical applications.' },
                { t: 'Digital Storage', c: 'text-cyan-600 dark:text-cyan-400', b: 'Binary (KiB, MiB, GiB) vs decimal (KB, MB, GB). Explains the size difference between OS and manufacturer numbers.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this unit converter free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
                { q: 'What makes it different from standard converters?', a: 'It covers niche categories like data transfer, astronomy, typography, and binary storage that most converters skip.' },
                { q: 'How accurate are the conversions?', a: 'Conversion factors are sourced from official standards. Results are displayed to six decimal places or in scientific notation.' },
                { q: 'Does it handle inverse units?', a: 'Yes. Units like L/100km use inverse conversion where lower values mean greater efficiency.' },
                { q: 'Can I copy the result?', a: 'Yes. Click the copy icon next to any value to copy it to your clipboard.' },
                { q: 'What is the difference between KiB and KB?', a: 'KiB (kibibyte) = 1024 bytes (binary). KB (kilobyte) = 1000 bytes (decimal). This distinction matters for digital storage.' },
                { q: 'Does it send data to a server?', a: 'No. All calculations run entirely in your browser. Your data never leaves your device.' },
                { q: 'Does it work on mobile?', a: 'Yes. Fully responsive layout that adapts to any screen size.' },
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