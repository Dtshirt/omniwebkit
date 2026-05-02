'use client';
import React, { useState, useEffect } from 'react';
import { Palette, Copy, Check, Plus, Trash2, ArrowRight, Wand2, RefreshCw } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { toast } from 'react-hot-toast';
import chroma from 'chroma-js';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

const RADIAL_POSITIONS = [
    'center', 'top left', 'top', 'top right', 'left', 'right', 'bottom left', 'bottom', 'bottom right'
];

export default function CssGradientClient() {
    const [type, setType] = useState('linear');
    const [linearAngle, setLinearAngle] = useState(90);
    const [radialShape, setRadialShape] = useState('circle');
    const [radialPos, setRadialPos] = useState('center');
    const [conicAngle, setConicAngle] = useState(0);
    const [conicPos, setConicPos] = useState('center');
    
    const [stops, setStops] = useState([
        { id: 1, color: '#3b82f6', position: 0 },
        { id: 2, color: '#8b5cf6', position: 100 }
    ]);
    
    const [copied, setCopied] = useState(false);
    
    // Smooth Scale Generator state
    const [scaleCount, setScaleCount] = useState(5);
    const [scaleMode, setScaleMode] = useState('lch');

    // Generate CSS
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

    let gradientString = '';
    if (type === 'linear') {
        gradientString = `linear-gradient(${linearAngle}deg, ${stopsString})`;
    } else if (type === 'radial') {
        gradientString = `radial-gradient(${radialShape} at ${radialPos}, ${stopsString})`;
    } else if (type === 'conic') {
        gradientString = `conic-gradient(from ${conicAngle}deg at ${conicPos}, ${stopsString})`;
    }

    const cssCode = `background: ${gradientString};`;

    const handleCopy = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        toast.success('CSS copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    const addStop = () => {
        const newId = Math.max(0, ...stops.map(s => s.id)) + 1;
        // Find a gap or add at the end
        setStops([...stops, { id: newId, color: '#ffffff', position: 50 }]);
    };

    const removeStop = (id) => {
        if (stops.length <= 2) {
            toast.error('You need at least 2 color stops');
            return;
        }
        setStops(stops.filter(s => s.id !== id));
    };

    const updateStop = (id, field, value) => {
        setStops(stops.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const generateSmoothScale = () => {
        if (stops.length < 2) return;
        const startColor = sortedStops[0].color;
        const endColor = sortedStops[sortedStops.length - 1].color;
        
        try {
            const scale = chroma.scale([startColor, endColor]).mode(scaleMode).colors(scaleCount);
            const newStops = scale.map((color, i) => ({
                id: Date.now() + i,
                color: color,
                position: Math.round((i / (scaleCount - 1)) * 100)
            }));
            setStops(newStops);
            toast.success(`Generated ${scaleCount} smooth stops!`);
        } catch (e) {
            toast.error('Error generating scale');
        }
    };
    
    const randomize = () => {
        const newStops = [...stops];
        newStops.forEach(s => {
            s.color = chroma.random().hex();
        });
        setStops(newStops);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <Breadcrumbs items={[{ name: 'CSS Gradient Generator', href: '/tools/css-gradient-generator' }]} />

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #ec4899)' }}>
                        <Palette className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3">CSS Gradient Generator</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">Build beautiful linear, radial, and conic gradients with live preview. Powered by chroma.js for perfectly smooth color scales.</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left Panel: Controls */}
                    <div className="lg:col-span-5 space-y-6">
                        
                        {/* Type & Direction Controls */}
                        <div className={`${cardCls} p-6 shadow-sm`}>
                            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-6">
                                {['linear', 'radial', 'conic'].map(t => (
                                    <button key={t} onClick={() => setType(t)}
                                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold capitalize transition-all ${type === t ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                {type === 'linear' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Angle</label>
                                            <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400">{linearAngle}°</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input type="range" min="0" max="360" value={linearAngle} onChange={(e) => setLinearAngle(e.target.value)} className="w-full accent-blue-500" />
                                            <div className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 relative flex-shrink-0" style={{ transform: `rotate(${linearAngle}deg)` }}>
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-blue-500 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {type === 'radial' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Shape</label>
                                            <select value={radialShape} onChange={e => setRadialShape(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-blue-500">
                                                <option value="circle">Circle</option>
                                                <option value="ellipse">Ellipse</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Position</label>
                                            <select value={radialPos} onChange={e => setRadialPos(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-blue-500 capitalize">
                                                {RADIAL_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {type === 'conic' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Angle: {conicAngle}°</label>
                                            <input type="range" min="0" max="360" value={conicAngle} onChange={(e) => setConicAngle(e.target.value)} className="w-full accent-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Center</label>
                                            <select value={conicPos} onChange={e => setConicPos(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-blue-500 capitalize">
                                                {RADIAL_POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Color Stops Manager */}
                        <div className={`${cardCls} p-6 shadow-sm flex flex-col h-[400px]`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                                    Color Stops
                                </h2>
                                <button onClick={randomize} className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors">
                                    <RefreshCw className="w-3.5 h-3.5" /> Randomize
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {sortedStops.map((stop, i) => (
                                    <div key={stop.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 group">
                                        <div className="relative shrink-0">
                                            <input type="color" value={stop.color} onChange={(e) => updateStop(stop.id, 'color', e.target.value)} 
                                                className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 opacity-0 absolute inset-0" />
                                            <div className="w-10 h-10 rounded-lg shadow-inner border border-slate-200 dark:border-slate-600 pointer-events-none" style={{ backgroundColor: stop.color }} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">{stop.color}</span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{stop.position}%</span>
                                            </div>
                                            <input type="range" min="0" max="100" value={stop.position} onChange={(e) => updateStop(stop.id, 'position', Number(e.target.value))} 
                                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none outline-none accent-blue-500" />
                                        </div>
                                        <button onClick={() => removeStop(stop.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                            <button onClick={addStop} className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" /> Add Color Stop
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Preview & Chroma Scale */}
                    <div className="lg:col-span-7 space-y-6 flex flex-col">
                        
                        {/* Live Preview */}
                        <div className={`${cardCls} p-2 shadow-sm flex-1 flex flex-col min-h-[400px]`}>
                            <div className="flex-1 rounded-xl w-full h-full relative overflow-hidden" style={{ background: gradientString }}>
                                {/* Optional subtle grid overlay to show transparency if any (omitted for clean gradient view) */}
                            </div>
                        </div>

                        {/* Chroma Smooth Scale Generator */}
                        <div className={`${cardCls} p-6 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-100 dark:border-indigo-800/50`}>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                                    <Wand2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">Smooth Scale Generator</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Use chroma.js color math to automatically generate a perfectly smooth gradient between your first and last color stops.</p>
                                    
                                    <div className="flex flex-wrap items-end gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Number of Stops</label>
                                            <input type="number" min="3" max="20" value={scaleCount} onChange={e => setScaleCount(Number(e.target.value))} 
                                                className="w-24 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Color Space</label>
                                            <select value={scaleMode} onChange={e => setScaleMode(e.target.value)} className="w-32 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white outline-none focus:border-indigo-500 uppercase">
                                                <option value="rgb">RGB</option>
                                                <option value="hsl">HSL</option>
                                                <option value="lch">LCH (Best)</option>
                                                <option value="lab">LAB</option>
                                            </select>
                                        </div>
                                        <button onClick={generateSmoothScale} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
                                            Generate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CSS Output */}
                        <div className={`${cardCls} shadow-sm overflow-hidden`}>
                            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">CSS Output</h3>
                                <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copied ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'Copied!' : 'Copy CSS'}
                                </button>
                            </div>
                            <div className="p-4 bg-slate-900 text-slate-300 font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
                                {cssCode}
                            </div>
                        </div>
                        
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-14 space-y-5">
                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free CSS Gradient Generator</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Gradients are an essential part of modern web design, adding depth, branding, and visual interest to buttons, backgrounds, and text. Writing complex gradient syntax by hand can be tedious and error-prone. The OmniWebKit CSS Gradient Generator provides a visual, real-time playground to build the perfect gradient and instantly copy the production-ready CSS code.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Our generator supports full customization of <strong>Linear</strong>, <strong>Radial</strong>, and <strong>Conic</strong> gradients. You have complete control over the angle, focal points, and unlimited color stops. Best of all, everything runs instantly in your browser without requiring a server upload.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Powered by Chroma.js</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                            One of the hardest parts of creating a beautiful gradient is avoiding "dead zones"—muddy, greyish transitions that happen when the browser interpolates between two clashing colors using standard RGB math.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            To solve this, we've integrated the <strong>Smooth Scale Generator</strong> powered by <code>chroma-js</code>. By selecting a start and end color, our engine can automatically calculate and insert perfectly spaced color stops using advanced perceptual color spaces like <strong>LCH</strong> (Lightness, Chroma, Hue). This ensures incredibly smooth, vibrant transitions that standard CSS simply cannot achieve on its own.
                        </p>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #475569;
                }
            `}</style>
        </div>
    );
}
