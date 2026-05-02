'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, FileText, Settings, Check, X, RefreshCw, Lock, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const selectCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition';
const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition placeholder-slate-400';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';

export default function PdfToImage() {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [format, setFormat] = useState('png');
    const [quality, setQuality] = useState(92);
    const [scale, setScale] = useState(2);
    const [notification, setNotification] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    const notify = useCallback((msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3500);
    }, []);

    const handleFile = (e) => { 
        const f = e.target.files?.[0]; 
        if (f?.type === 'application/pdf') {
            setFile(f);
        } else if (f) {
            notify('Please select a PDF file', 'error'); 
        }
        e.target.value = ''; 
    };

    const onDrop = (e) => { 
        e.preventDefault(); 
        setDragOver(false); 
        const f = e.dataTransfer.files?.[0]; 
        if (f?.type === 'application/pdf') {
            setFile(f);
        } else if (f) {
            notify('Please select a PDF file', 'error');
        }
    };

    const resetAll = () => { 
        setFile(null); 
        setPassword('');
    };

    const convert = async () => {
        if (!file) return;
        setLoading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);
        formData.append('format', format);
        formData.append('quality', quality);
        formData.append('scale', scale);

        try {
            const res = await fetch('/api/pdf-to-image/convert', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.detail || `Server error: ${res.status}`);
            }

            // Get the ZIP blob
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            // Trigger download
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `${file.name.replace('.pdf', '')}_images.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);

            notify('Conversion successful! ZIP downloaded.');
        } catch (err) {
            notify('Failed: ' + err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Breadcrumbs items={[{ name: 'PDF to Image', href: '/tools/pdf-to-image' }]} />
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleFile} />

                {/* Toast */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        {notification.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}{notification.msg}
                    </div>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
                        <ImageIcon className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">PDF to Image Converter</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Convert PDF pages to high-quality PNG, JPG, or WebP images instantly</p>
                    <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wide">
                        <Lock className="w-3 h-3" /> Secure Server-Side Rendering
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Upload / Selected File Area */}
                    {!file ? (
                        <div onClick={() => fileRef.current?.click()}
                            onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                            className={`${cardCls} border-2 border-dashed p-14 text-center cursor-pointer transition group ${dragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'}`}>
                            <div className="w-16 h-16 mx-auto mb-5 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Upload PDF</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Drag & drop or click to browse</p>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition">
                                <FileText className="w-4 h-4" />Select PDF
                            </div>
                        </div>
                    ) : (
                        <div className={`${cardCls} p-6 flex items-center justify-between`}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{file.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button onClick={resetAll} disabled={loading}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Settings Area */}
                    <div className={`${cardCls} p-6`}>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-5 flex items-center gap-1.5">
                            <Settings className="w-3.5 h-3.5 text-blue-500" />Conversion Settings
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className={labelCls}>Output Format</label>
                                <select value={format} onChange={e => setFormat(e.target.value)} disabled={loading} className={selectCls}>
                                    <option value="png">PNG (Lossless, High Quality)</option>
                                    <option value="jpg">JPG (Smaller File Size)</option>
                                    <option value="webp">WebP (Modern, Balanced)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Resolution / Scale</label>
                                <select value={scale} onChange={e => setScale(+e.target.value)} disabled={loading} className={selectCls}>
                                    <option value={1}>1× (Standard Quality)</option>
                                    <option value={2}>2× (High Quality / Retina)</option>
                                    <option value={3}>3× (Very High Quality)</option>
                                    <option value={4}>4× (Maximum Quality)</option>
                                </select>
                            </div>
                        </div>

                        {(format === 'jpg' || format === 'webp') && (
                            <div className="mb-5">
                                <div className="flex justify-between mb-1.5">
                                    <label className={labelCls.replace('mb-1.5', '')}>Image Quality</label>
                                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{quality}%</span>
                                </div>
                                <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(+e.target.value)} disabled={loading}
                                    className="w-full h-1.5 accent-blue-600 cursor-pointer disabled:opacity-50" />
                            </div>
                        )}

                        <div>
                            <label className={labelCls}>PDF Password (Optional)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    placeholder="Leave blank if not encrypted"
                                    disabled={loading}
                                    className={`${inputCls} pl-9`}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1.5">If the PDF is password-protected, enter it here to unlock and convert it.</p>
                        </div>
                    </div>

                    {/* Convert Button */}
                    <button 
                        onClick={convert} 
                        disabled={!file || loading}
                        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <><RefreshCw className="w-5 h-5 animate-spin" /> Processing PDF...</> : <><Download className="w-5 h-5" /> Convert & Download ZIP</>}
                    </button>
                    
                    <p className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-500" /> Files are automatically deleted from our servers immediately after conversion.
                    </p>

                </div>

                {/* ── SEO Content ── */}
                <div className="mt-16 space-y-6">
                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Server-Side PDF to Image Converter</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            There are many situations where you need images of PDF pages instead of the PDF file itself. Social media platforms do not display PDF documents — you need PNG, JPG, or WebP images. Presentation slides often require image versions of a report page. Designers need screenshot-quality images of layouts embedded in PDFs. 
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Unlike browser-based converters that struggle with complex vectors or large files, the OmniWebKit PDF to Image Converter uses a robust, server-side PyMuPDF rendering engine. This guarantees perfect, flawless output every single time, exactly matching the original document structure, fonts, and colors.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Upload any PDF — one page or hundreds — and every page is rendered as a sharp, high-resolution image and delivered to you instantly in a convenient ZIP file.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Output Formats Explained</h2>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { t: 'PNG (Lossless)', c: 'text-blue-600 dark:text-blue-400', b: 'PNG preserves every pixel of the rendered page with zero compression artifacts. Best for text-heavy documents, diagrams, screenshots, and any case where visual fidelity is critical. File sizes are larger than JPG or WebP.' },
                                { t: 'JPG (Smaller)', c: 'text-amber-600 dark:text-amber-400', b: 'JPG uses lossy compression to produce much smaller files. The quality slider (10–100%) controls how aggressive the compression is. Best for photographs and documents where slight quality loss is acceptable in exchange for smaller files.' },
                                { t: 'WebP (Modern)', c: 'text-teal-600 dark:text-teal-400', b: 'WebP is a modern image format developed by Google. It provides better compression than both PNG and JPG at the same visual quality. Supported by all modern browsers. Best for web publishing and digital sharing.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this PDF to image converter free?', a: 'Yes, completely free with no account, no watermarks, and no limits on pages or file size.' },
                                { q: 'Are my files stored permanently?', a: 'Absolutely not. To ensure your complete privacy, uploaded PDFs and generated images are automatically deleted from our servers the very second your download completes. No data is ever kept or backed up.' },
                                { q: 'Can I convert password-protected PDFs?', a: 'Yes! Unlike many other tools, we fully support encrypted PDFs. Simply type the password into the optional Password field, and our server will decrypt and render the pages for you.' },
                                { q: 'What resolution should I choose?', a: '1× is standard. 2× is equivalent to Retina displays (High Quality). Use 3× or 4× for print-ready quality or if you need to heavily zoom into the images without them blurring.' },
                                { q: 'What is the difference between PNG, JPG, and WebP?', a: 'PNG is lossless (largest files, perfect quality). JPG is lossy (smaller files, adjustable quality). WebP is modern and gives better compression than both at similar quality.' },
                                { q: 'How do I download the images?', a: 'Once the conversion is complete, a `.zip` file containing all the individual page images will automatically download to your device.' },
                                { q: 'What does the Quality slider do?', a: 'For JPG and WebP formats, the slider controls compression intensity (10–100%). Lower values = smaller files with more compression artifacts. Higher values = larger files with better quality. For PNG, quality has no effect (PNG is always lossless).' },
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
                    </section>

                </div>
            </div>
        </div>
    );
}
