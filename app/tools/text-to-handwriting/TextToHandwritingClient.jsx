'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PenTool, Upload, Download, Loader2, Check, AlertTriangle, FileText, FileDown, Settings, X, ChevronLeft, ChevronRight, RefreshCw, Server, Monitor, Zap, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { toast } from 'react-hot-toast';
import { API_V1 } from "@/lib/api-config";

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

const FONTS = [
    { id: 'Caveat', label: 'Caveat (Natural)' },
    { id: 'Pacifico', label: 'Pacifico (Cursive)' },
    { id: 'Shadows Into Light', label: 'Shadows (Neat)' },
    { id: 'Dancing Script', label: 'Dancing Script (Elegant)' },
    { id: 'Satisfy', label: 'Satisfy (Flowing)' },
    { id: 'Great Vibes', label: 'Great Vibes (Calligraphy)' },
    { id: 'Indie Flower', label: 'Indie Flower (Playful)' },
    { id: 'Patrick Hand', label: 'Patrick Hand (Marker)' },
    { id: 'Homemade Apple', label: 'Homemade Apple (Scribble)' },
    { id: 'Permanent Marker', label: 'Permanent Marker (Bold)' },
    { id: 'Gloria Hallelujah', label: 'Gloria Hallelujah (Quirky)' },
    { id: 'Covered By Your Grace', label: 'Covered By Your Grace (Tall)' },
    { id: 'Kalam', label: 'Kalam (Casual)' }
];

const INK_COLORS = [
    { id: 'blue', label: 'Blue Pen', hex: '#141e96' },
    { id: 'black', label: 'Black Pen', hex: '#141419' },
    { id: 'red', label: 'Red Pen', hex: '#b4141e' },
];

const PAPER_TYPES = [
    { id: 'ruled', label: 'Ruled Paper' },
    { id: 'blank', label: 'Blank Paper' },
];

const SERVER_THRESHOLD_CHARS = 5000;
const POLL_INTERVAL = 2000;

async function pollJob(jobId, onProgress, signal) {
  while (true) {
    if (signal?.aborted) throw new Error('Cancelled');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_V1}/tools/text-to-handwriting/status/${jobId}`, { signal });
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0, "Server is processing...");
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Server processing failed');
  }
}

export default function TextToHandwritingClient() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState('auto'); // 'auto' | 'browser' | 'server'

    // Server processing states
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('');
    const [processTime, setProcessTime] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState('');

    const abortRef = useRef(null);
    const timerRef = useRef(null);
    const canvasRef = useRef(null);

    // Settings
    const [font, setFont] = useState('Caveat');
    const [inkColor, setInkColor] = useState('blue');
    const [paperType, setPaperType] = useState('ruled');
    
    // Derived Mode
    const effectiveMode = mode === 'auto'
      ? (text.length > SERVER_THRESHOLD_CHARS ? 'server' : 'browser')
      : mode;

    const reset = () => { 
        abortRef.current?.abort();
        clearInterval(timerRef.current);
        setDone(false); setError(''); 
        setLoading(false); setProgress(0); setPhase(''); setDownloadUrl(''); setProcessTime(0);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // Load fonts into browser
    useEffect(() => {
        const link = document.createElement('link');
        const families = FONTS.map(f => `family=${f.id.replace(/ /g, '+')}`).join('&');
        link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    // Helper: Draw paper background
    const drawPaper = (ctx, width, height, type) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        if (type === 'ruled') {
            // Margin
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(100, 0);
            ctx.lineTo(100, height);
            ctx.stroke();

            // Horizontal lines
            ctx.strokeStyle = 'rgba(150, 200, 255, 0.8)';
            ctx.lineWidth = 2;
            for (let y = 100; y < height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }
    };

    // Auto-update browser canvas preview (throttled)
    useEffect(() => {
        if (effectiveMode !== 'browser' || done || loading) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const w = 800;
        const h = 1000;
        canvas.width = w;
        canvas.height = h;
        
        drawPaper(ctx, w, h, paperType);
        
        if (!text) return;
        
        // Wait for font to load before drawing
        document.fonts.ready.then(() => {
            const hexColor = INK_COLORS.find(c => c.id === inkColor)?.hex || '#141e96';
            ctx.fillStyle = hexColor;
            ctx.font = `32px "${font}"`;
            
            const marginX = paperType === 'ruled' ? 120 : 50;
            const marginY = 90;
            const lineHeight = 40;
            const maxWidth = w - marginX - 50;
            
            let x = marginX;
            let y = marginY;
            
            const lines = text.split('\n');
            for (const line of lines) {
                const words = line.split(' ');
                for (const word of words) {
                    const width = ctx.measureText(word + ' ').width;
                    if (x + width > maxWidth) {
                        x = marginX;
                        y += lineHeight;
                    }
                    if (y > h - 50) break; // Simple cutoff for preview
                    
                    // Simple JS jitter for preview
                    const jitterY = (Math.random() - 0.5) * 2;
                    ctx.fillText(word + ' ', x, y + jitterY);
                    x += width;
                }
                x = marginX;
                y += lineHeight;
                if (y > h - 50) break;
            }
        });
    }, [text, font, inkColor, paperType, effectiveMode, done, loading]);


    const handleConvert = async () => {
        if (!text.trim() || loading) return;
        setLoading(true); setError(''); setProgress(0); setPhase(''); setProcessTime(0);

        const abort = new AbortController();
        abortRef.current = abort;
        
        const startTime = Date.now();
        timerRef.current = setInterval(() => setProcessTime(Math.round((Date.now() - startTime) / 1000)), 1000);

        try {
            if (effectiveMode === 'browser') {
                setPhase("Generating Document...");
                setProgress(50);
                
                // For browser mode, we just download the canvas content as PNG
                // Wait a tiny bit to ensure react effects finished
                await new Promise(r => setTimeout(r, 500));
                
                const canvas = canvasRef.current;
                if (!canvas) throw new Error("Canvas missing");
                
                const dataUrl = canvas.toDataURL('image/png');
                setDownloadUrl(dataUrl);
                
                setProgress(100);
                setPhase("Done!");
                setDone(true);
                toast.success('Generated in browser!');
            } else {
                // ── Server path ──────────────────────────────────────────────────
                const updatePhase = (prog, txt) => {
                    setProgress(prog);
                    if (txt) setPhase(txt);
                };

                updatePhase(5, '📤 Submitting text...');
                
                const payload = {
                    text,
                    font,
                    ink_color: inkColor,
                    paper_type: paperType
                };

                const uploadRes = await fetch(`${API_V1}/tools/text-to-handwriting`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload), 
                    signal: abort.signal 
                });
                
                if (!uploadRes.ok) {
                    const err = await uploadRes.json().catch(() => ({}));
                    throw new Error(err.detail || 'Submission failed');
                }

                const { job_id } = await uploadRes.json();
                updatePhase(10, '⚙️ Engine applying algorithmic jitter...');

                await pollJob(job_id, updatePhase, abort.signal);
                
                updatePhase(100, '✅ Document complete!');
                setDownloadUrl(`${API_V1}/tools/text-to-handwriting/download/${job_id}`);
                setDone(true);
                toast.success('Server conversion complete!');
                
                // cleanup after 60s
                setTimeout(() => fetch(`${API_V1}/tools/text-to-handwriting/cleanup/${job_id}`, { method: 'DELETE' }).catch(() => {}), 60000);
            }
        } catch (err) {
            if (err.name === 'AbortError' || err.message === 'Cancelled') {
                toast('Cancelled', { icon: '🛑' });
            } else {
                setError('Error generating handwriting: ' + err.message);
            }
        } finally {
            clearInterval(timerRef.current);
            setLoading(false);
        }
    };

    const handleCancel = () => { abortRef.current?.abort(); };

    const ModeBadge = ({ m }) => {
        const isServer = m === 'server';
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            isServer ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                     : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
          }`}>
            {isServer ? <Server className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
            {isServer ? 'Server Engine' : 'Browser Canvas'}
          </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <Breadcrumbs items={[{ name: 'Text to Handwriting', href: '/tools/text-to-handwriting' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
                        <PenTool className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Text to Handwriting</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-4 max-w-2xl mx-auto">Turn your typed text into realistic handwritten documents. Perfect for assignments, notes, and letters.</p>

                    {/* Hybrid mode chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        {['auto', 'browser', 'server'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            disabled={loading}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                            mode === m
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-400'
                            }`}
                        >
                            {m === 'auto' && <Zap className="w-3.5 h-3.5" />}
                            {m === 'browser' && <Monitor className="w-3.5 h-3.5" />}
                            {m === 'server' && <Server className="w-3.5 h-3.5" />}
                            {m === 'auto' ? 'Auto (Hybrid)' : m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                        ))}
                        {text.length > 0 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                            → Will use <ModeBadge m={effectiveMode} />
                        </span>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Input + settings */}
                    <div className="lg:col-span-1 space-y-4">
                        
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-indigo-500" />Your Text
                            </h2>
                            <textarea 
                                value={text} 
                                onChange={e => setText(e.target.value)} 
                                disabled={loading || done}
                                placeholder="Type or paste your text here..."
                                className="w-full h-48 px-3 py-3 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition resize-none disabled:opacity-60" 
                            />
                            <div className="text-right mt-2 text-xs font-semibold text-slate-400">
                                {text.length.toLocaleString()} characters
                            </div>
                        </div>

                        {/* Settings */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-slate-500" />Appearance Settings
                            </h2>

                            {/* Font */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Handwriting Style</label>
                                <div className="space-y-1.5">
                                    {FONTS.map(t => (
                                        <button key={t.id} onClick={() => setFont(t.id)} disabled={loading || done}
                                            style={{ fontFamily: t.id }}
                                            className={`w-full text-lg px-3 py-2 rounded-xl text-left border transition ${font === t.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'}`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ink Color */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Ink Color</label>
                                <div className="flex gap-2">
                                    {INK_COLORS.map(c => (
                                        <button key={c.id} onClick={() => setInkColor(c.id)} title={c.label} disabled={loading || done}
                                            style={{ backgroundColor: c.hex }}
                                            className={`w-8 h-8 rounded-full transition ring-offset-2 ${inkColor === c.id ? 'ring-2 ring-offset-white dark:ring-offset-slate-800 ring-indigo-500 scale-110' : 'hover:scale-105'}`} />
                                    ))}
                                </div>
                            </div>

                            {/* Paper Type */}
                            <div className="mb-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Paper Type</label>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 gap-0.5">
                                    {PAPER_TYPES.map(p => (
                                        <button key={p.id} onClick={() => setPaperType(p.id)} disabled={loading || done}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${paperType === p.id ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                            {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}</p>}

                        {/* Convert button */}
                        {!loading && !done && (
                            <button onClick={handleConvert} disabled={!text.trim()}
                                className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2.5 text-base disabled:cursor-not-allowed">
                                <PenTool className="w-5 h-5" /> Generate Document
                            </button>
                        )}
                        
                        {loading && (
                            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" /> {phase}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-500">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="h-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" /> {processTime}s elapsed
                                  </div>
                                  {effectiveMode === 'server' && (
                                    <button onClick={handleCancel} className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-md font-bold transition-colors">
                                        Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                        )}

                        {done && downloadUrl && (
                            <div className="space-y-3">
                                <a href={downloadUrl} download={effectiveMode === 'server' ? 'handwritten.pdf' : 'handwritten.png'} className="flex w-full py-4 items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all">
                                    <Download className="w-5 h-5" /> Download {effectiveMode === 'server' ? 'PDF' : 'PNG'}
                                </a>
                                <button onClick={reset} className="w-full py-3 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold transition hover:bg-indigo-50 dark:hover:bg-indigo-900/10 flex items-center justify-center gap-2 text-sm">
                                    <RefreshCw className="w-4 h-4" />Write Another
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right: Live Preview */}
                    <div className="lg:col-span-2">
                        <div className={`${cardCls} shadow-sm overflow-hidden flex flex-col h-[700px]`}>
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Monitor className="w-4 h-4 text-indigo-500" />
                                    {effectiveMode === 'server' ? 'Algorithm Output Target' : 'Live Browser Preview'}
                                </h2>
                                <span className="text-xs text-slate-400">
                                    {effectiveMode === 'server' ? 'Will be processed securely by our advanced engine' : 'Client-side generation active'}
                                </span>
                            </div>
                            
                            <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-4 sm:p-8 overflow-auto flex items-start justify-center relative">
                                {!text && !done && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-50 z-10">
                                        <PenTool size={48} className="mb-4 text-slate-400" />
                                        <p className="font-semibold text-slate-500">Type on the left to see preview</p>
                                    </div>
                                )}
                                
                                {effectiveMode === 'browser' || !text ? (
                                    <canvas 
                                        ref={canvasRef} 
                                        className="max-w-full h-auto shadow-md rounded-md bg-white transition-opacity"
                                        style={{ width: '100%', maxWidth: '600px', opacity: (text || done) ? 1 : 0.3 }}
                                    />
                                ) : (
                                    <div className="w-full max-w-[600px] aspect-[1/1.4] bg-white rounded-md shadow-md border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                                        <Server className="w-16 h-16 text-indigo-200 mb-4" />
                                        <h3 className="text-lg font-bold text-slate-700 mb-2">Server Processing Ready</h3>
                                        <p className="text-slate-500 text-sm max-w-sm">
                                            Your text will be paginated and rendered securely by our backend engine, applying advanced micro-jitter algorithms for maximum realism.
                                        </p>
                                        <p className="text-slate-400 text-xs mt-6">
                                            Click Generate Document to begin processing.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-14 space-y-5">
                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Realistic Text to Handwriting Converter</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Creating authentic-looking handwritten notes from digital text used to require hours of tracing or expensive custom fonts. The OmniWebKit Text to Handwriting converter bridges this gap by turning your typed assignments, letters, and notes into beautifully imperfect, realistic handwriting.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Unlike basic online tools that produce robotic, perfectly aligned text, our <strong>advanced server engine</strong> intelligently applies subtle micro-jitters to individual letters and lines. By slightly shifting the vertical and horizontal alignment as it generates the document, the final PDF possesses the natural inconsistencies of a human hand.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features and Customization</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Authentic Styles', body: 'Choose between natural, cursive, or neat block handwriting to match the tone of your assignment or letter.' },
                                { title: 'Hybrid Processing', body: 'Short text is rendered instantly in your browser using fast client-side processing. Long documents are safely routed to our powerful servers.' },
                                { title: 'Algorithmic Realism', body: 'Our backend engine applies advanced mathematical jitter to letter spacing and line heights so no two words look identically stamped.' },
                                { title: 'Multi-page Export', body: 'Easily export long essays into clean, continuous PDF documents ready for printing or submission.' },
                            ].map(({ title, body }) => (
                                <div key={title} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
