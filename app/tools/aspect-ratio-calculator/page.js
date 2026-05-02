'use client';
import { useState, useMemo } from 'react';
import { Ratio, Lock, Unlock, Copy, Check, RotateCcw, ArrowRight, Monitor, Smartphone, Tablet, Film, Camera } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const COMMON_RATIOS = [
    { name: '16:9', w: 16, h: 9, use: 'YouTube, Widescreen TV' },
    { name: '4:3', w: 4, h: 3, use: 'Classic TV, iPad' },
    { name: '21:9', w: 21, h: 9, use: 'Ultrawide, Cinema' },
    { name: '1:1', w: 1, h: 1, use: 'Instagram, Profile pics' },
    { name: '9:16', w: 9, h: 16, use: 'TikTok, Reels, Stories' },
    { name: '3:2', w: 3, h: 2, use: 'DSLR Photography' },
    { name: '5:4', w: 5, h: 4, use: 'Photo prints (8×10)' },
    { name: '2:1', w: 2, h: 1, use: 'Univisium, 18:9 phones' },
    { name: '4:5', w: 4, h: 5, use: 'Instagram Portrait' },
    { name: '2.39:1', w: 2.39, h: 1, use: 'Anamorphic Cinema' },
];

const DEVICE_PRESETS = [
    { name: 'iPhone 15', w: 1179, h: 2556, icon: 'phone' },
    { name: 'iPad Pro', w: 2048, h: 2732, icon: 'tablet' },
    { name: 'MacBook Pro', w: 3024, h: 1964, icon: 'monitor' },
    { name: 'Full HD', w: 1920, h: 1080, icon: 'monitor' },
    { name: '4K UHD', w: 3840, h: 2160, icon: 'monitor' },
    { name: 'YouTube', w: 1280, h: 720, icon: 'film' },
    { name: 'Instagram Post', w: 1080, h: 1080, icon: 'phone' },
    { name: 'Twitter Header', w: 1500, h: 500, icon: 'monitor' },
];

function gcd(a, b) { return b ? gcd(b, a % b) : a; }

export default function AspectRatioCalculator() {
    const [width, setWidth] = useState(1920);
    const [height, setHeight] = useState(1080);
    const [locked, setLocked] = useState('none'); // none, width, height
    const [copied, setCopied] = useState('');

    const ratio = useMemo(() => {
        if (!width || !height) return { w: 0, h: 0, decimal: 0, display: '—' };
        const g = gcd(Math.round(width), Math.round(height));
        const rw = Math.round(width) / g;
        const rh = Math.round(height) / g;
        return { w: rw, h: rh, decimal: (width / height).toFixed(4), display: `${rw}:${rh}` };
    }, [width, height]);

    const updateWidth = (val) => {
        const w = Number(val);
        setWidth(w);
        if (locked === 'height' && ratio.w && ratio.h) {
            setHeight(Math.round((w * ratio.h) / ratio.w));
        }
    };

    const updateHeight = (val) => {
        const h = Number(val);
        setHeight(h);
        if (locked === 'width' && ratio.w && ratio.h) {
            setWidth(Math.round((h * ratio.w) / ratio.h));
        }
    };

    const applyRatio = (rw, rh) => {
        const newH = Math.round((width * rh) / rw);
        setHeight(newH);
    };

    const applyPreset = (w, h) => { setWidth(w); setHeight(h); };

    const copyText = (text, key) => { navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(''), 1500); };

    const previewW = Math.min(300, width);
    const previewH = (previewW * height) / width;
    const clampedH = Math.min(previewH, 200);
    const clampedW = previewH > 200 ? (previewW * 200) / previewH : previewW;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Aspect Ratio Calculator', href: '/tools/aspect-ratio-calculator' }]} />
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mb-4 shadow-lg shadow-pink-500/25">
                        <Ratio className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Aspect Ratio Calculator</h1>
                    <p className="text-gray-500 dark:text-gray-400">Calculate and convert aspect ratios for any resolution</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Calculator */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Dimensions</h3>
                            <div className="flex items-end gap-4 mb-5">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Width (px)</label>
                                    <input type="number" value={width} onChange={e => updateWidth(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white outline-none text-center" />
                                </div>
                                <div className="pb-3 text-gray-400"><ArrowRight className="w-5 h-5" /></div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Height (px)</label>
                                    <input type="number" value={height} onChange={e => updateHeight(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold text-gray-900 dark:text-white outline-none text-center" />
                                </div>
                            </div>

                            {/* Lock ratio */}
                            <div className="flex gap-2 mb-5">
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Lock:</span>
                                {['none', 'width', 'height'].map(l => (
                                    <button key={l} onClick={() => setLocked(l)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all capitalize ${locked === l ? 'bg-pink-100 dark:bg-pink-900/20 text-pink-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                        {l === 'none' ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {l}
                                    </button>
                                ))}
                            </div>

                            {/* Result */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Aspect Ratio', value: ratio.display, key: 'ratio' },
                                    { label: 'Decimal', value: ratio.decimal, key: 'decimal' },
                                    { label: 'Total Pixels', value: (width * height).toLocaleString(), key: 'pixels' },
                                ].map(item => (
                                    <button key={item.key} onClick={() => copyText(item.value, item.key)}
                                        className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 text-center hover:ring-2 hover:ring-pink-500/30 transition-all group relative">
                                        <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.label}</p>
                                        <span className={`absolute top-1 right-1 transition-opacity ${copied === item.key ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                                            {copied === item.key ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Common Ratios */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Common Ratios</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                {COMMON_RATIOS.map((r, i) => (
                                    <button key={i} onClick={() => applyRatio(r.w, r.h)}
                                        className={`p-2.5 rounded-xl text-center transition-all ${ratio.display === r.name ? 'bg-pink-100 dark:bg-pink-900/20 ring-2 ring-pink-500' : 'bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700'}`}>
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{r.name}</p>
                                        <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">{r.use}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Device Presets */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Device Presets</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {DEVICE_PRESETS.map((d, i) => (
                                    <button key={i} onClick={() => applyPreset(d.w, d.h)}
                                        className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 transition-all">
                                        {d.icon === 'phone' && <Smartphone className="w-4 h-4 text-gray-400" />}
                                        {d.icon === 'tablet' && <Tablet className="w-4 h-4 text-gray-400" />}
                                        {d.icon === 'monitor' && <Monitor className="w-4 h-4 text-gray-400" />}
                                        {d.icon === 'film' && <Film className="w-4 h-4 text-gray-400" />}
                                        <div className="text-left">
                                            <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{d.name}</p>
                                            <p className="text-[9px] text-gray-400">{d.w}×{d.h}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 h-fit sticky top-8">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Preview</h3>
                        <div className="flex items-center justify-center mb-4" style={{ minHeight: '220px' }}>
                            <div className="rounded-xl border-2 border-pink-400 dark:border-pink-500 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/10 dark:to-rose-900/10 flex items-center justify-center"
                                style={{ width: `${clampedW}px`, height: `${clampedH}px` }}>
                                <span className="text-xs font-mono text-pink-500">{width}×{height}</span>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex justify-between"><span>Ratio</span><span className="font-bold text-gray-900 dark:text-white">{ratio.display}</span></div>
                            <div className="flex justify-between"><span>Orientation</span><span className="font-bold text-gray-900 dark:text-white">{width > height ? 'Landscape' : width < height ? 'Portrait' : 'Square'}</span></div>
                            <div className="flex justify-between"><span>Megapixels</span><span className="font-bold text-gray-900 dark:text-white">{((width * height) / 1000000).toFixed(2)} MP</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
