'use client';
import { useState } from 'react';
import { Play, Pause, Plus, Trash2, Copy, Download, CheckCircle, Sparkles, Wand2 } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6';
const inputCls = 'w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition';
const labelCls = 'block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5';

const PRESETS = {
  bounce: { name: 'bounce', duration: 1, timing: 'ease', iter: 'infinite', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }, { id: 2, p: 25, t: 'translateX(0px) translateY(-50px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }, { id: 3, p: 50, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }, { id: 4, p: 75, t: 'translateX(0px) translateY(-25px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }, { id: 5, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }] },
  fadeIn: { name: 'fadeIn', duration: 1, timing: 'ease-in', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 0, bg: '#8b5cf6' }, { id: 2, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }] },
  slideIn: { name: 'slideIn', duration: 0.8, timing: 'ease-out', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(-200px) translateY(0px) rotate(0deg) scale(1)', o: 0, bg: '#8b5cf6' }, { id: 2, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }] },
  popup: { name: 'popup', duration: 0.5, timing: 'ease-out', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(0)', o: 0, bg: '#8b5cf6' }, { id: 2, p: 60, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1.1)', o: 1, bg: '#8b5cf6' }, { id: 3, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }] },
  shake: { name: 'shake', duration: 0.6, timing: 'ease-in-out', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#ec4899' }, { id: 2, p: 25, t: 'translateX(-10px) translateY(0px) rotate(-5deg) scale(1)', o: 1, bg: '#ec4899' }, { id: 3, p: 50, t: 'translateX(10px) translateY(0px) rotate(5deg) scale(1)', o: 1, bg: '#ec4899' }, { id: 4, p: 75, t: 'translateX(-10px) translateY(0px) rotate(-5deg) scale(1)', o: 1, bg: '#ec4899' }, { id: 5, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#ec4899' }] },
  pulse: { name: 'pulse', duration: 1.5, timing: 'ease-in-out', iter: 'infinite', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }, { id: 2, p: 50, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1.2)', o: 0.7, bg: '#a78bfa' }, { id: 3, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }] },
  spin: { name: 'spin', duration: 2, timing: 'linear', iter: 'infinite', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }, { id: 2, p: 100, t: 'translateX(0px) translateY(0px) rotate(360deg) scale(1)', o: 1, bg: '#8b5cf6' }] },
  wobble: { name: 'wobble', duration: 1, timing: 'ease-in-out', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#f59e0b' }, { id: 2, p: 20, t: 'translateX(-25px) translateY(0px) rotate(-5deg) scale(1)', o: 1, bg: '#f59e0b' }, { id: 3, p: 40, t: 'translateX(20px) translateY(0px) rotate(3deg) scale(1)', o: 1, bg: '#f59e0b' }, { id: 4, p: 60, t: 'translateX(-10px) translateY(0px) rotate(-2deg) scale(1)', o: 1, bg: '#f59e0b' }, { id: 5, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#f59e0b' }] },
  flip: { name: 'flip', duration: 1, timing: 'ease-in-out', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#8b5cf6' }, { id: 2, p: 50, t: 'translateX(0px) translateY(0px) rotate(180deg) scale(1.2)', o: 1, bg: '#ec4899' }, { id: 3, p: 100, t: 'translateX(0px) translateY(0px) rotate(360deg) scale(1)', o: 1, bg: '#8b5cf6' }] },
  heartbeat: { name: 'heartbeat', duration: 1.3, timing: 'ease-in-out', iter: 'infinite', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#ef4444' }, { id: 2, p: 14, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1.3)', o: 1, bg: '#ef4444' }, { id: 3, p: 28, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#ef4444' }, { id: 4, p: 42, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1.3)', o: 1, bg: '#ef4444' }, { id: 5, p: 70, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#ef4444' }] },
  slideUp: { name: 'slideUp', duration: 0.7, timing: 'ease-out', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(80px) rotate(0deg) scale(1)', o: 0, bg: '#06b6d4' }, { id: 2, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#06b6d4' }] },
  zoomOut: { name: 'zoomOut', duration: 0.6, timing: 'ease-in', iter: '1', kf: [{ id: 1, p: 0, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(1)', o: 1, bg: '#10b981' }, { id: 2, p: 100, t: 'translateX(0px) translateY(0px) rotate(0deg) scale(0)', o: 0, bg: '#10b981' }] },
};
const ICONS = { bounce: '🏀', fadeIn: '👁️', slideIn: '➡️', popup: '💥', shake: '📳', pulse: '💓', spin: '🌀', wobble: '🫨', flip: '🔄', heartbeat: '❤️', slideUp: '⬆️', zoomOut: '🔍' };

const parseT = (t) => ({
  translateX: Number(t.match(/translateX\((-?\d+(?:\.\d+)?)px\)/)?.[1] || 0),
  translateY: Number(t.match(/translateY\((-?\d+(?:\.\d+)?)px\)/)?.[1] || 0),
  rotate: Number(t.match(/rotate\((-?\d+(?:\.\d+)?)deg\)/)?.[1] || 0),
  scale: Number(t.match(/scale\(([0-9.]+)\)/)?.[1] || 1),
});
const buildT = (tx, ty, r, sc) => `translateX(${tx}px) translateY(${ty}px) rotate(${r}deg) scale(${sc})`;

const toKf = (raw) => raw.kf.map(k => ({ id: k.id, percent: k.p, transform: k.t, opacity: k.o, background: k.bg }));

export default function CSSAnimationBuilder() {
  const init = PRESETS.bounce;
  const [keyframes, setKeyframes] = useState(toKf(init));
  const [animName, setAnimName] = useState(init.name);
  const [duration, setDuration] = useState(init.duration);
  const [timing, setTiming] = useState(init.timing);
  const [iter, setIter] = useState(init.iter);
  const [dir, setDir] = useState('normal');
  const [fill, setFill] = useState('none');
  const [playing, setPlaying] = useState(true);
  const [selId, setSelId] = useState(1);
  const [fmt, setFmt] = useState('css');
  const [copied, setCopied] = useState(false);

  const load = (name) => {
    const p = PRESETS[name];
    const kf = toKf(p);
    setKeyframes(kf); setAnimName(p.name); setDuration(p.duration);
    setTiming(p.timing); setIter(p.iter); setSelId(kf[0].id); setPlaying(true);
  };

  const updateKf = (id, field, value) => setKeyframes(prev => prev.map(kf => {
    if (kf.id !== id) return kf;
    if (field.startsWith('t.')) {
      const sub = field.split('.')[1]; const p = parseT(kf.transform); p[sub] = Number(value);
      return { ...kf, transform: buildT(p.translateX, p.translateY, p.rotate, p.scale) };
    }
    return { ...kf, [field]: field === 'percent' ? Number(value) : value };
  }));

  const addKf = () => {
    const newId = Math.max(...keyframes.map(k => k.id)) + 1;
    const last = keyframes[keyframes.length - 1];
    setKeyframes([...keyframes, { id: newId, percent: Math.min(last.percent + 10, 100), transform: last.transform, opacity: last.opacity, background: last.background }]);
    setSelId(newId);
  };

  const delKf = (id) => {
    if (keyframes.length <= 2) return;
    setKeyframes(p => p.filter(k => k.id !== id));
    if (selId === id) setSelId(keyframes[0].id);
  };

  const genCSS = () => {
    const s = [...keyframes].sort((a, b) => a.percent - b.percent);
    let c = `@keyframes ${animName} {\n`;
    s.forEach(k => { c += `  ${k.percent}% {\n    transform: ${k.transform};\n    opacity: ${k.opacity};\n    background: ${k.background};\n  }\n`; });
    c += `}\n\n.animated-element {\n  animation: ${animName} ${duration}s ${timing} ${iter};\n`;
    if (dir !== 'normal') c += `  animation-direction: ${dir};\n`;
    if (fill !== 'none') c += `  animation-fill-mode: ${fill};\n`;
    return c + '}';
  };

  const genTW = () => {
    const s = [...keyframes].sort((a, b) => a.percent - b.percent);
    let c = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      keyframes: {\n        ${animName}: {\n`;
    s.forEach(k => { c += `          '${k.percent}%': { transform: '${k.transform}', opacity: '${k.opacity}', background: '${k.background}' },\n`; });
    c += `        },\n      },\n      animation: {\n        '${animName}': '${animName} ${duration}s ${timing} ${iter}',\n      },\n    },\n  },\n};\n\n// Usage:\n// <div className="animate-${animName}">element</div>`;
    return c;
  };

  const genReact = () => {
    const s = [...keyframes].sort((a, b) => a.percent - b.percent);
    let c = `import { keyframes, css } from '@emotion/react';\n\nconst ${animName}Anim = keyframes\`\n`;
    s.forEach(k => { c += `  ${k.percent}% { transform: ${k.transform}; opacity: ${k.opacity}; background: ${k.background}; }\n`; });
    c += `\`;\n\nconst style = css\`\n  animation: \${${animName}Anim} ${duration}s ${timing} ${iter};\n\`;\n// <div css={style}>element</div>`;
    return c;
  };

  const getOut = () => fmt === 'css' ? genCSS() : fmt === 'tailwind' ? genTW() : genReact();

  const copyOut = () => { navigator.clipboard.writeText(getOut()); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const dlOut = () => {
    const ext = fmt === 'css' ? 'css' : fmt === 'tailwind' ? 'js' : 'jsx';
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([getOut()], { type: 'text/plain' })), download: `${animName}.${ext}` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const selKf = keyframes.find(k => k.id === selId);
  const parsed = selKf ? parseT(selKf.transform) : {};

  const animCss = `@keyframes ${animName}{${[...keyframes].sort((a, b) => a.percent - b.percent).map(k => `${k.percent}%{transform:${k.transform};opacity:${k.opacity};background:${k.background};}`).join('')}}.preview-box{animation:${animName} ${duration}s ${timing} ${iter};animation-play-state:${playing ? 'running' : 'paused'};animation-direction:${dir};animation-fill-mode:${fill};}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'Animation Generator', href: '/tools/animation-generator' }]} />
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">CSS Animation Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Build custom CSS keyframe animations visually. Pick a preset, adjust properties with live sliders, and export clean CSS, Tailwind, or React code instantly.
          </p>
        </div>

        {/* Presets row */}
        <div className={`${cardCls} mb-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Animation Presets</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">— click any to load instantly</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Object.keys(PRESETS).map(name => (
              <button key={name} onClick={() => load(name)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 text-xs font-semibold capitalize transition-all ${animName === name ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400'}`}>
                <span className="text-xl">{ICONS[name]}</span>{name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Settings */}
          <div className="space-y-5">
            <div className={cardCls}>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Animation Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Animation Name</label>
                  <input type="text" value={animName} onChange={e => setAnimName(e.target.value)} className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Duration (s)</label>
                    <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min="0.1" step="0.1" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Iterations</label>
                    <select value={iter} onChange={e => setIter(e.target.value)} className={inputCls}>
                      {['1', '2', '3', '5', '10', 'infinite'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Timing Function</label>
                  <select value={timing} onChange={e => setTiming(e.target.value)} className={inputCls}>
                    {['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(0.68,-0.55,0.27,1.55)'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Direction</label>
                    <select value={dir} onChange={e => setDir(e.target.value)} className={inputCls}>
                      {['normal', 'reverse', 'alternate', 'alternate-reverse'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Fill Mode</label>
                    <select value={fill} onChange={e => setFill(e.target.value)} className={inputCls}>
                      {['none', 'forwards', 'backwards', 'both'].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {selKf && (
              <div className={cardCls}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Keyframe Editor — {selKf.percent}%</h2>
                  {keyframes.length > 2 && <button onClick={() => delKf(selId)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition"><Trash2 size={15} /></button>}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Position (%)</label>
                    <input type="number" value={selKf.percent} onChange={e => updateKf(selId, 'percent', e.target.value)} min="0" max="100" className={inputCls} />
                  </div>
                  {[
                    { label: 'X (px)', field: 't.translateX', val: parsed.translateX, min: -300, max: 300, step: 1, unit: 'px' },
                    { label: 'Y (px)', field: 't.translateY', val: parsed.translateY, min: -300, max: 300, step: 1, unit: 'px' },
                    { label: 'Rotate', field: 't.rotate', val: parsed.rotate, min: -360, max: 360, step: 1, unit: '°' },
                    { label: 'Scale', field: 't.scale', val: parsed.scale, min: 0, max: 3, step: 0.05, unit: 'x' },
                    { label: 'Opacity', field: 'opacity', val: selKf.opacity, min: 0, max: 1, step: 0.05, unit: '' },
                  ].map(({ label, field, val, min, max, step, unit }) => (
                    <div key={field}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
                        <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">{val}{unit}</span>
                      </div>
                      <input type="range" value={val} min={min} max={max} step={step} onChange={e => updateKf(selId, field, e.target.value)} className="w-full accent-purple-500" />
                    </div>
                  ))}
                  <div>
                    <label className={labelCls}>Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={selKf.background} onChange={e => updateKf(selId, 'background', e.target.value)} className="w-10 h-10 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer flex-shrink-0" />
                      <input type="text" value={selKf.background} onChange={e => updateKf(selId, 'background', e.target.value)} className={`${inputCls} font-mono`} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Middle: Preview + Timeline */}
          <div className="space-y-5">
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Live Preview</h2>
                <button onClick={() => setPlaying(!playing)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition">
                  {playing ? <Pause size={14} /> : <Play size={14} />}{playing ? 'Pause' : 'Play'}
                </button>
              </div>
              <style>{animCss}</style>
              <div className="relative bg-slate-100 dark:bg-slate-900/60 rounded-xl h-64 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="preview-box absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-xl shadow-lg" />
                <div className="absolute bottom-2 right-3 text-xs text-slate-400 dark:text-slate-500 font-mono">{duration}s · {timing} · {iter}</div>
              </div>
            </div>

            <div className={cardCls}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Timeline — {keyframes.length} keyframes</h2>
                <button onClick={addKf} className="flex items-center gap-1 text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition font-medium">
                  <Plus size={13} /> Add
                </button>
              </div>
              <div className="relative bg-slate-100 dark:bg-slate-900/60 rounded-xl p-5 h-16 mb-2 border border-slate-200 dark:border-slate-700">
                <div className="absolute inset-x-5 top-1/2 h-0.5 bg-slate-300 dark:bg-slate-600 rounded" />
                {[...keyframes].sort((a, b) => a.percent - b.percent).map(kf => (
                  <button key={kf.id} onClick={() => setSelId(kf.id)} title={`${kf.percent}%`}
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow transition-all ${selId === kf.id ? 'scale-125 ring-2 ring-purple-400' : ''}`}
                    style={{ left: `calc(${kf.percent}%*0.88+4%)`, background: kf.background }} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 px-1 mb-3"><span>0%</span><span>50%</span><span>100%</span></div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto">
                {[...keyframes].sort((a, b) => a.percent - b.percent).map(kf => (
                  <button key={kf.id} onClick={() => setSelId(kf.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition border ${selId === kf.id ? 'border-purple-300 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0 border border-white dark:border-slate-700 shadow-sm" style={{ background: kf.background }} />
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400 text-xs w-10">{kf.percent}%</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono flex-1">{kf.transform.substring(0, 36)}…</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Output */}
          <div className={cardCls}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Generated Code</h2>
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                {['css', 'tailwind', 'react'].map(f => (
                  <button key={f} onClick={() => setFmt(f)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold uppercase transition ${fmt === f ? 'bg-purple-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-950 rounded-xl p-4 overflow-auto max-h-[420px] mb-4">
              <pre className="text-xs font-mono text-slate-300 whitespace-pre leading-relaxed">{getOut()}</pre>
            </div>
            <div className="flex gap-2">
              <button onClick={copyOut} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition">
                {copied ? <CheckCircle size={15} className="text-emerald-500" /> : <Copy size={15} />}{copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={dlOut} className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold transition">
                <Download size={15} /> Download
              </button>
            </div>
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
              <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                <strong>Tip:</strong> Add the <code className="bg-purple-100 dark:bg-purple-900/40 px-1 rounded">animated-element</code> class to any HTML element to apply this animation.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-16 space-y-6">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free CSS Animation Generator — Build Keyframe Animations Visually</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">CSS animations can make your website feel alive. A smooth fade-in, a bouncing button, or a subtle pulse effect dramatically improves user engagement. But writing keyframe animations by hand takes time — especially when you need to adjust multiple properties across several keyframes.</p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">The OmniWebKit CSS Animation Generator removes that friction entirely. It gives you a visual, real-time editor where you adjust transform values, opacity, colours, timing, and more with simple sliders — and watch your animation play instantly. When done, export clean CSS, a Tailwind config snippet, or a React/Emotion code block.</p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">No design software or Node.js required. Whether you are a frontend developer, a designer who codes, or a beginner learning CSS, this tool makes animation accessible to everyone.</p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Create a CSS Animation in 5 Steps</h2>
            <div className="space-y-4">
              {[
                { n: '1', t: 'Choose a preset or start from scratch', d: 'Click any of the 12 animation presets — bounce, fade in, slide in, shake, heartbeat, spin, and more — to load a ready-made animation. You can customise it further or build your own from nothing.' },
                { n: '2', t: 'Adjust the animation settings', d: 'Set the duration in seconds, choose a timing function (ease, linear, ease-in-out, or cubic-bezier), configure the iteration count, and optionally set direction and fill mode for precise control.' },
                { n: '3', t: 'Edit keyframes with sliders', d: 'Click any keyframe dot on the timeline to select it. Use sliders to adjust X/Y position, rotation, scale, and opacity. Pick a background colour with the combined colour picker and text input.' },
                { n: '4', t: 'Add or remove keyframes', d: 'Click Add to insert a new keyframe. Delete any keyframe you do not need (minimum two keyframes required). Each keyframe appears as a coloured dot on the timeline — its colour matches the element background at that point.' },
                { n: '5', t: 'Export your code', d: 'Switch between CSS, Tailwind, and React output using the tabs. Click Copy to grab the code, or Download to save it as a file. Paste directly into your project — no edits required.' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold flex items-center justify-center">{n}</div>
                  <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{t}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">CSS Animation Properties Explained</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">Understanding what each property controls will help you get the effect you want. Here is a plain-English breakdown of the key settings in this tool.</p>
            <div className="space-y-3">
              {[
                { k: 'animation-duration', v: 'How long one cycle of the animation takes. 0.5s is fast (good for UI feedback). 2s is moderate. 4s+ is slow and decorative. Shorter durations keep interactions feeling snappy and responsive.' },
                { k: 'animation-timing-function', v: 'Controls the speed curve. Ease starts slow, speeds up, then slows down. Linear stays constant throughout. Ease-in-out is the most natural-feeling for most UI elements — slow start, fast middle, slow end.' },
                { k: 'animation-iteration-count', v: 'How many times the animation plays. Use 1 for one-time entrances (fade in, slide in). Use infinite for continuous effects (spinner, heartbeat). Use a fixed number like 3 for short repeating alerts.' },
                { k: 'animation-direction', v: 'Normal plays keyframes forward. Reverse plays them backward. Alternate goes forward then backward — great for back-and-forth motion without duplicating keyframes. Alternate-reverse starts in reverse.' },
                { k: 'animation-fill-mode', v: 'Forwards holds the final keyframe style after the animation ends. Backwards applies the first keyframe style during the animation delay. Both combines both behaviours for maximum control.' },
                { k: 'transform', v: 'Handles movement (translateX/Y), rotation, and scaling in one GPU-accelerated property. Animating transform is much more performant than animating position (top/left) or dimensions, making it the right choice for smooth animations.' },
                { k: 'opacity', v: 'Controls transparency from 0 (invisible) to 1 (fully visible). Like transform, opacity animation is GPU-accelerated. Combining opacity and transform gives you smooth, performant fade and motion effects with no layout reflow.' },
              ].map(({ k, v }) => (
                <div key={k} className="border border-slate-100 dark:border-slate-700 rounded-xl p-4">
                  <code className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">{k}</code>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{v}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">CSS, Tailwind, and React Output Explained</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">This tool generates three output formats. Here is when to use each one based on your tech stack.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'CSS', desc: 'Standard @keyframes + .animated-element class. Works in any HTML, React, Vue, or Angular project. Paste into any .css or .scss file.', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { title: 'Tailwind', desc: 'Extends tailwind.config.js with custom keyframes and animation shorthand. Use animate-yourName directly as a class — no CSS file needed.', c: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
                { title: 'React', desc: 'Uses @emotion/react to define animations as JavaScript template literals. Ideal for CSS-in-JS projects using Emotion, Styled Components, or similar libraries.', c: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
              ].map(({ title, desc, c, bg }) => (
                <div key={title} className={`${bg} rounded-xl p-5 border border-slate-100 dark:border-slate-700`}>
                  <p className={`font-bold text-sm ${c} mb-2`}>{title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this CSS animation generator free?', a: 'Yes, 100% free. No account, no installation, no usage limits. All processing happens in your browser — nothing is sent to any server.' },
                { q: 'What is a CSS keyframe animation?', a: 'A CSS keyframe animation uses the @keyframes rule to define how an element looks at different points in time. You define styles at percentages (0%, 50%, 100%) and the browser smoothly transitions between them. The animation property applies it to any element.' },
                { q: 'How do I make a smooth CSS animation?', a: 'Animate only transform and opacity — both are GPU-accelerated in all modern browsers, making them far smoother than animating width, height, top, or left. Use ease-in-out timing for natural motion, and keep UI interaction durations between 150ms and 500ms.' },
                { q: 'Can I export the animation for Tailwind CSS?', a: 'Yes. Switch to the Tailwind tab. The tool outputs a tailwind.config.js snippet that adds a custom keyframes entry and an animation shorthand. Add it to your config and use animate-yourName as a class on any element.' },
                { q: 'What are the 12 built-in animation presets?', a: 'The presets are: Bounce, Fade In, Slide In, Popup, Shake, Pulse, Spin, Wobble, Flip, Heartbeat, Slide Up, and Zoom Out. Each is fully editable after loading — adjust every keyframe, timing, direction and fill mode.' },
                { q: 'Does the preview update in real time?', a: 'Yes. As soon as you move any slider or change any setting, the preview updates immediately without any delay. You can also pause and resume the animation at any time using the Pause/Play button above the preview.' },
                { q: 'Can I use this without knowing CSS?', a: 'Yes. The tool is designed for visual editing — you move sliders and pick colours, and the code is generated automatically. You do need to paste the output into a CSS file or component, but the code is clearly formatted and easy to integrate.' },
                { q: 'What does animation-fill-mode forwards do?', a: 'It makes the element hold the styles from the final keyframe after the animation ends. Without it, the element snaps back to its original styles when the animation completes. Use forwards for one-time entrance animations like fade-in or slide-in.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                    <span>{q}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
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