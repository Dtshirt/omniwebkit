'use client';
import { useState, useCallback } from 'react';
import { PenTool, Download, Copy, Check, Code, Eye, Square, Circle, Type, Minus, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

function useToast() {
    const [msg, setMsg] = useState('');
    const [type, setType] = useState('ok');
    const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
    const el = msg ? (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
            {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}
        </div>
    ) : null;
    return { show, el };
}

const SHAPES = {
    rect: '<rect x="100" y="100" width="100" height="60" rx="8" fill="#3b82f6" opacity="0.8"/>',
    circle: '<circle cx="200" cy="150" r="40" fill="#ef4444" opacity="0.8"/>',
    ellipse: '<ellipse cx="200" cy="150" rx="60" ry="30" fill="#10b981" opacity="0.8"/>',
    line: '<line x1="50" y1="150" x2="350" y2="150" stroke="#f59e0b" stroke-width="3"/>',
    text: '<text x="200" y="150" text-anchor="middle" font-size="20" fill="#1f2937">Text</text>',
    path: '<path d="M100 200 Q200 100 300 200" fill="none" stroke="#8b5cf6" stroke-width="3"/>',
    polygon: '<polygon points="200,50 250,150 150,150" fill="#ec4899" opacity="0.8"/>',
    star: '<polygon points="200,60 215,110 270,110 225,140 240,190 200,160 160,190 175,140 130,110 185,110" fill="#f59e0b" opacity="0.8"/>',
};

export default function SvgEditor() {
    const [svg, setSvg] = useState(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect x="50" y="30" width="300" height="240" rx="20" fill="#6366f1" opacity="0.1" stroke="#6366f1" stroke-width="2"/>
  <circle cx="200" cy="120" r="50" fill="#8b5cf6" opacity="0.8"/>
  <text x="200" y="220" text-anchor="middle" font-size="24" font-family="Arial" fill="#1f2937" font-weight="bold">SVG Editor</text>
  <line x1="120" y1="260" x2="280" y2="260" stroke="#6366f1" stroke-width="3" stroke-linecap="round"/>
</svg>`);
    const [view, setView] = useState('split');
    const [opt, setOpt] = useState('');
    const toast = useToast();

    const optimize = useCallback(() => {
        const o = svg.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').replace(/\s+\/>/g, '/>').trim();
        setOpt(o); toast.show(`Optimised — saved ${Math.round((1 - new Blob([o]).size / new Blob([svg]).size) * 100)}%`);
    }, [svg]);

    const copy = (t) => { navigator.clipboard.writeText(t); toast.show('Copied!'); };

    const dl = (fmt) => {
        if (fmt === 'svg') { Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), download: 'image.svg' }).click(); toast.show('Downloaded SVG'); return; }
        const el = document.createElement('div'); el.innerHTML = svg; const s = el.querySelector('svg'); if (!s) return;
        const c = document.createElement('canvas'); const w = parseInt(s.getAttribute('width')) || 400; const h = parseInt(s.getAttribute('height')) || 300;
        c.width = w * 2; c.height = h * 2; const ctx = c.getContext('2d'); ctx.scale(2, 2);
        const img = new Image(); img.onload = () => { ctx.drawImage(img, 0, 0, w, h); Object.assign(document.createElement('a'), { href: c.toDataURL(`image/${fmt}`), download: `image.${fmt}` }).click(); toast.show(`Downloaded ${fmt.toUpperCase()}`); };
        img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
    };

    const insert = (k) => setSvg(svg.replace('</svg>', `  ${SHAPES[k]}\n</svg>`));

    const bytes = new Blob([svg]).size;
    const optBytes = opt ? new Blob([opt]).size : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {toast.el}
            <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'SVG Editor', href: '/tools/svg-editor' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-fuchsia-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-fuchsia-500/25">
                        <PenTool className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">SVG Editor</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Edit, preview, optimise, and export SVG graphics</p>
                </div>

                {/* Toolbar */}
                <div className={`${cardCls} p-3 mb-4`}>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide mr-1">Insert</span>
                        {[
                            { k: 'rect', icon: Square, l: 'Rect' }, { k: 'circle', icon: Circle, l: 'Circle' }, { k: 'line', icon: Minus, l: 'Line' }, { k: 'text', icon: Type, l: 'Text' },
                            { k: 'polygon', l: '\u25B3' }, { k: 'star', l: '\u2605' }, { k: 'path', l: '~' },
                        ].map(s => (
                            <button key={s.k} onClick={() => insert(s.k)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 border border-transparent hover:border-fuchsia-200 dark:hover:border-fuchsia-800 transition">
                                {s.icon ? <s.icon className="w-3 h-3" /> : s.l}{s.icon && s.l}
                            </button>
                        ))}

                        <div className="ml-auto flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5">
                            {['split', 'code', 'preview'].map(m => (
                                <button key={m} onClick={() => setView(m)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition capitalize ${view === m ? 'bg-white dark:bg-slate-700 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {m === 'code' ? <Code className="w-3 h-3" /> : m === 'preview' ? <Eye className="w-3 h-3" /> : 'Split'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Editor + Preview */}
                <div className={`grid gap-4 ${view === 'split' ? 'lg:grid-cols-2' : ''}`}>
                    {view !== 'preview' && (
                        <div className={`${cardCls} overflow-hidden`}>
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">SVG Code</span>
                                <span className="text-[10px] text-slate-400">{bytes.toLocaleString()} bytes</span>
                            </div>
                            <textarea value={svg} onChange={e => setSvg(e.target.value)} spellCheck={false}
                                className="w-full h-80 px-4 py-3 bg-slate-950 text-sm font-mono text-emerald-400 resize-none outline-none" />
                        </div>
                    )}
                    {view !== 'code' && (
                        <div className={`${cardCls} overflow-hidden`}>
                            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Preview</span>
                            </div>
                            <div className="p-4 flex items-center justify-center min-h-[320px] bg-white dark:bg-slate-900"
                                style={{ backgroundImage: 'repeating-conic-gradient(rgba(0,0,0,0.04) 0% 25%, transparent 0% 50%)', backgroundSize: '20px 20px' }}>
                                <div dangerouslySetInnerHTML={{ __html: svg }} className="max-w-full" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className={`${cardCls} p-4 mt-4`}>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => copy(svg)} className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition">
                            <Copy className="w-3.5 h-3.5" />Copy SVG
                        </button>
                        {[{ f: 'svg', c: 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400 hover:bg-fuchsia-100 dark:hover:bg-fuchsia-900/30' },
                        { f: 'png', c: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30' },
                        { f: 'jpeg', c: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30' }
                        ].map(({ f, c }) => (
                            <button key={f} onClick={() => dl(f)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${c}`}>
                                <Download className="w-3.5 h-3.5" />{f.toUpperCase()}
                            </button>
                        ))}
                        <button onClick={optimize} className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-fuchsia-500/25 transition">
                            Optimise
                        </button>
                    </div>

                    {opt && (
                        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Optimised ({optBytes} bytes, saved {Math.round((1 - optBytes / bytes) * 100)}%)</span>
                                <button onClick={() => copy(opt)} className="text-[10px] font-bold text-fuchsia-500 hover:text-fuchsia-600 transition">Copy</button>
                            </div>
                            <code className="text-[11px] text-slate-600 dark:text-slate-400 block whitespace-pre-wrap break-all font-mono">{opt.substring(0, 500)}{opt.length > 500 ? '...' : ''}</code>
                        </div>
                    )}
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online SVG Editor — Edit, Preview, and Export SVG Code</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            SVG (Scalable Vector Graphics) is the standard format for vector images on the web. Unlike PNG or JPEG, SVG files are written in XML. They scale to any size without losing quality, load fast, and are fully editable with code. They are used for icons, logos, illustrations, charts, animations, and interactive graphics. If you work with web design, development, or digital marketing, you will use SVG files regularly.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This free SVG Editor lets you write and edit SVG code in a dark-themed code editor with a live preview panel. You see changes instantly. Insert shapes from the toolbar — rectangles, circles, lines, text, polygons, stars, and paths — and customise them in code. When you are done, copy the SVG, download it as an SVG file, or export it as a high-resolution PNG or JPG image. You can also run the built-in optimiser to remove comments, collapse whitespace, and reduce file size.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Everything runs in your browser. No data is uploaded. No account required. The split-view layout lets you edit code and see the result side by side on desktop, and stacks vertically on mobile for a fully responsive experience.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">SVG Editor Features</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Live Code Editor', c: 'text-fuchsia-600 dark:text-fuchsia-400', b: 'Dark-themed code editor with monospace font. Write or paste SVG code and see changes reflected in the preview panel instantly.' },
                                { t: 'Shape Toolbar', c: 'text-violet-600 dark:text-violet-400', b: 'Insert rectangles, circles, ellipses, lines, text, polygons, stars, and bezier paths with one click. Customise attributes in code.' },
                                { t: 'Multi-Format Export', c: 'text-blue-600 dark:text-blue-400', b: 'Download as SVG for vector use, or export as 2x PNG or JPG for raster use. All exports are generated client-side in your browser.' },
                                { t: 'SVG Optimiser', c: 'text-emerald-600 dark:text-emerald-400', b: 'Remove comments, collapse whitespace, and strip unnecessary characters. See the byte count and percentage saved instantly.' },
                                { t: 'Split / Code / Preview', c: 'text-amber-600 dark:text-amber-400', b: 'Three view modes: split (side by side), code only, or preview only. The layout adapts to your screen size.' },
                                { t: 'Checkerboard Preview', c: 'text-rose-600 dark:text-rose-400', b: 'The preview panel uses a checkerboard background so you can clearly see transparent areas in your SVG.' },
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
                                { q: 'Is this SVG editor free?', a: 'Yes, completely free with no account, no watermark, and no limits on file size or usage.' },
                                { q: 'Can I import an existing SVG?', a: 'Yes. Paste your SVG code into the editor. The preview updates immediately.' },
                                { q: 'What export formats are supported?', a: 'SVG (vector), PNG (2x resolution raster), and JPG (2x resolution raster).' },
                                { q: 'Does the optimiser change my SVG?', a: 'It removes comments and collapses whitespace. It does not modify shapes, colours, or attributes.' },
                                { q: 'Does this tool send data to a server?', a: 'No. All editing, previewing, and exporting runs entirely in your browser.' },
                                { q: 'Can I add custom SVG elements from code?', a: 'Yes. The editor accepts any valid SVG code including filters, gradients, masks, animations, and embedded styles.' },
                                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive. On smaller screens, the editor and preview stack vertically.' },
                                { q: 'What is the checkerboard background?', a: 'It helps you see transparent areas in your SVG, similar to how image editors show transparency.' },
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
