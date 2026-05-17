'use client';

import { useState, useRef, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
    ImageIcon, Copy, Check, Download, Upload, RotateCcw,
    Code, FileText, Info, AlertCircle
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
    if (!b) return '0 B';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function ImageToBase64() {
    const [base64, setBase64] = useState('');
    const [preview, setPreview] = useState('');
    const [fileInfo, setFileInfo] = useState(null);
    const [copied, setCopied] = useState('');
    const [inputMode, setInputMode] = useState('encode');  // encode | decode
    const [decodePreview, setDecodePreview] = useState('');
    const [decodeError, setDecodeError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);

    /* ── Encode: Image → Base64 ── */
    const handleFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;
        setFileInfo({ name: file.name, size: file.size, type: file.type });
        const reader = new FileReader();
        reader.onload = (e) => {
            setBase64(e.target.result);
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    /* ── Decode: Base64 → Image ── */
    const decodeBase64 = useCallback(() => {
        if (!base64.trim()) return;
        setDecodeError('');
        try {
            const src = base64.trim().startsWith('data:image/')
                ? base64.trim()
                : `data:image/png;base64,${base64.trim()}`;
            // Validate by creating an img element
            const img = new window.Image();
            img.onload = () => setDecodePreview(src);
            img.onerror = () => setDecodeError('Invalid Base64 string — could not decode as an image. Make sure you\'ve pasted a valid image Base64 string or Data URL.');
            img.src = src;
        } catch {
            setDecodeError('Invalid Base64 string. Please paste a valid Base64 or Data URL.');
        }
    }, [base64]);

    /* ── Copy ── */
    const copy = async (text, key) => {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    /* ── Download decoded image ── */
    const downloadDecoded = () => {
        const src = decodePreview || preview;
        if (!src) return;
        const ext = (src.match(/data:image\/(\w+)/)?.[1] || 'png').replace('jpeg', 'jpg');
        Object.assign(document.createElement('a'), { href: src, download: `image.${ext}` }).click();
    };

    /* ── Output format helpers ── */
    const getDataUrl = () => base64 || '';
    const getRawBase64 = () => {
        if (!base64) return '';
        const i = base64.indexOf(',');
        return i > -1 ? base64.substring(i + 1) : base64;
    };
    const getCssUrl = () => base64 ? `background-image: url("${base64}");` : '';
    const getHtmlImg = () => base64 ? `<img src="${base64}" alt="image" />` : '';

    const reset = () => {
        setBase64(''); setPreview(''); setFileInfo(null);
        setDecodePreview(''); setDecodeError('');
    };

    const switchMode = (mode) => { setInputMode(mode); reset(); };

    const rawLen = getRawBase64().length;
    const b64Bytes = Math.round(rawLen * 3 / 4);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image to Base64', href: '/tools/image-to-base64' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
                        <Code className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Image to Base64</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Convert images to Base64 strings and Data URLs — free, instant, browser-based</p>
                </div>

                {/* Mode toggle */}
                <div className="flex justify-center mb-6">
                    <div className={`${cardCls} p-1 flex gap-1`}>
                        {[
                            { mode: 'encode', icon: <ImageIcon className="w-4 h-4" />, label: 'Image → Base64' },
                            { mode: 'decode', icon: <Code className="w-4 h-4" />, label: 'Base64 → Image' },
                        ].map(({ mode, icon, label }) => (
                            <button key={mode} onClick={() => switchMode(mode)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === mode
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}>
                                {icon}{label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── ENCODE MODE ── */}
                {inputMode === 'encode' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Upload panel */}
                        <div className={`${cardCls} p-5`}>
                            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <Upload className="w-3.5 h-3.5 text-violet-500" />Upload Image
                            </h2>
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleDrop}
                                onClick={() => fileRef.current?.click()}
                                className={`w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${dragOver ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/10'
                                        : preview ? 'border-slate-200 dark:border-slate-700' : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                    }`}>
                                <input type="file" ref={fileRef} accept="image/*" className="hidden"
                                    onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                                {preview ? (
                                    <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm" />
                                ) : (
                                    <>
                                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Drag & drop or click to upload</p>
                                        <p className="text-xs text-slate-400">PNG, JPG, GIF, SVG, WebP, BMP</p>
                                    </>
                                )}
                            </div>

                            {/* File info */}
                            {fileInfo && (
                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        {[
                                            { label: 'Filename', val: fileInfo.name },
                                            { label: 'Original size', val: fmtSize(fileInfo.size) },
                                            { label: 'Type', val: fileInfo.type },
                                            { label: 'Base64 length', val: `${rawLen.toLocaleString()} chars` },
                                            { label: 'Base64 size', val: fmtSize(b64Bytes) },
                                            { label: 'Size increase', val: b64Bytes > 0 ? `${(((b64Bytes - fileInfo.size) / fileInfo.size) * 100).toFixed(1)}% larger` : '–' },
                                        ].map(({ label, val }) => (
                                            <div key={label}>
                                                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">{label}</p>
                                                <p className="text-slate-900 dark:text-white font-semibold truncate" title={val}>{val}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={reset} className="w-full mt-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 transition flex items-center justify-center gap-2">
                                <RotateCcw className="w-3.5 h-3.5" />Reset
                            </button>
                        </div>

                        {/* Output formats */}
                        <div className="space-y-3">
                            {[
                                { label: 'Data URL (full)', sub: 'Includes MIME type prefix — use directly in HTML/CSS src', fn: getDataUrl, key: 'dataurl' },
                                { label: 'Raw Base64', sub: 'String only, no prefix — use in code that adds the header', fn: getRawBase64, key: 'raw' },
                                { label: 'CSS background-image', sub: 'Ready to paste into a CSS stylesheet rule', fn: getCssUrl, key: 'css' },
                                { label: 'HTML <img> tag', sub: 'Copy directly into HTML markup', fn: getHtmlImg, key: 'html' },
                            ].map(({ label, sub, fn, key }) => (
                                <div key={key} className={`${cardCls} p-4`}>
                                    <div className="flex items-start justify-between mb-1.5">
                                        <div>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{label}</span>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
                                        </div>
                                        <button onClick={() => copy(fn(), key)} disabled={!fn()}
                                            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-violet-100 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg transition text-slate-600 dark:text-slate-400 disabled:opacity-40 flex-shrink-0 ml-2">
                                            {copied === key ? <><Check className="w-3 h-3 text-emerald-500" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
                                        </button>
                                    </div>
                                    <code className="block text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 rounded-lg p-2.5 max-h-16 overflow-y-auto break-all font-mono leading-relaxed">
                                        {fn() || <span className="italic text-slate-400">Upload an image to see the Base64 output…</span>}
                                    </code>
                                </div>
                            ))}

                            {/* Copy all button */}
                            {base64 && (
                                <button onClick={() => copy(base64, 'all')}
                                    className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-violet-500/20 transition flex items-center justify-center gap-2">
                                    {copied === 'all' ? <><Check className="w-4 h-4" />Copied Data URL!</> : <><Copy className="w-4 h-4" />Copy Full Data URL</>}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* ── DECODE MODE ── */}
                {inputMode === 'decode' && (
                    <div className={`${cardCls} p-6`}>
                        <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
                            <Code className="w-3.5 h-3.5 text-violet-500" />Paste Base64 or Data URL
                        </h2>
                        <textarea
                            value={base64}
                            onChange={e => { setBase64(e.target.value); setDecodeError(''); setDecodePreview(''); }}
                            placeholder="Paste a Base64 string (e.g. /9j/4AAQSkZJRg...) or a full Data URL (e.g. data:image/png;base64,...)"
                            className="w-full h-40 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 mb-3 placeholder-slate-400" />
                        {base64.trim() && (
                            <p className="text-[10px] text-slate-400 mb-3">{base64.trim().length.toLocaleString()} characters pasted</p>
                        )}
                        {decodeError && (
                            <div className="mb-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-red-600 dark:text-red-400">{decodeError}</p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button onClick={decodeBase64} disabled={!base64.trim()}
                                className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                <ImageIcon className="w-4 h-4" />Decode to Image
                            </button>
                            {decodePreview && (
                                <button onClick={downloadDecoded}
                                    className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-slate-600 dark:text-slate-300 transition flex items-center gap-2 text-sm font-bold">
                                    <Download className="w-4 h-4" />Save
                                </button>
                            )}
                            <button onClick={reset}
                                className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-slate-400 hover:text-red-500 transition">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                        {decodePreview && (
                            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/60 rounded-xl text-center border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Decoded Image</p>
                                <img src={decodePreview} alt="Decoded image" className="max-h-72 mx-auto rounded-xl shadow-md border border-slate-200 dark:border-slate-700" />
                            </div>
                        )}
                    </div>
                )}

                {/* ── SEO Content ── */}
                <div className="mt-12 prose-premium">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 mb-6">
                        <h2>About the Tool: Your Local Image to Base64 Converter</h2>
                        <p>
                            If you build websites, write emails, or work with APIs, you know that managing tiny image files can be a real headache. That is where our <strong>image to Base64 converter</strong> steps in. Instead of linking to external files on a server, this tool turns your pictures directly into text. 
                        </p>
                        <p>
                            It takes your standard image formats and instantly turns them into a raw Base64 string or a complete Data URL. We built it for speed. It runs completely inside your browser, meaning you get instant results without waiting for uploads.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 mb-6">
                        <h2>How to Use This Tool</h2>
                        <p>We designed this page to stay out of your way. Here is exactly how to encode your images in just a few clicks:</p>
                        <ul>
                            <li><strong>Drop your file:</strong> Drag any photo onto the upload box, or click to pick a file.</li>
                            <li><strong>Pick your format:</strong> The tool instantly creates your Data URL, raw Base64 string, CSS background rule, and HTML img tag.</li>
                            <li><strong>Copy and paste:</strong> Click the copy button next to the format you need. Paste it straight into your code.</li>
                        </ul>
                        <p>And what if you need to go backwards? Just switch to the "Base64 → Image" mode. Paste your long text string in the box, and you'll get your original picture back immediately.</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 mb-6">
                        <h2>Privacy & Security Anchor</h2>
                        <p>
                            Here's the thing — we do not want your files. This converter runs 100% locally on your own machine. 
                        </p>
                        <p>
                            When you drop an image onto the page, your browser's internal engine does all the math. Your photos never leave your computer. There are no server uploads, no temporary storage bins, and absolutely zero risk of your private graphics being intercepted by someone else. You get total privacy by default.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 mb-6">
                        <h2>Features & Specs</h2>
                        <p>What makes this tool actually useful for developers?</p>
                        <ul>
                            <li><strong>Broad format support:</strong> Drop in PNG, JPG, WebP, GIF, SVG, or BMP files without a problem.</li>
                            <li><strong>Four instant outputs:</strong> Grab the exact code snippet you need, so you do not have to format strings by hand.</li>
                            <li><strong>Reverse decoding:</strong> Decode any Base64 string back into a viewable, downloadable picture.</li>
                            <li><strong>Live size tracking:</strong> See exactly how much larger your encoded string is compared to the original file.</li>
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 mb-6">
                        <h2>Technical Breakdown: Why Use Base64?</h2>
                        <p>
                            Computers naturally read images as binary data — streams of 1s and 0s. But many text-based systems, like JSON APIs or older email clients, break if you try to shove raw binary data through them. 
                        </p>
                        <p>
                            Base64 fixes this issue. It translates every 3 bytes of your image into 4 standard text characters. This lets you safely embed images anywhere that accepts plain text. 
                        </p>
                        <p>
                            But there's a catch. Because it adds extra text characters to do this translation, your file size grows by about 33%. That means you should only use this method for tiny assets like interface icons or CSS background patterns. For large hero photos, stick to standard file hosting so your web pages stay fast.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8 mb-6">
                        <h2>Frequently Asked Questions</h2>
                        <details className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-3">
                            <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                                <span>Does converting an image to Base64 lower its quality?</span>
                                <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                            </summary>
                            <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">
                                Not at all. Base64 simply changes how the data is written down. It doesn't compress or alter the actual picture. When you decode the string later, you get the exact same quality you started with.
                            </div>
                        </details>
                        <details className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-3">
                            <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                                <span>Why shouldn't I encode all my website images this way?</span>
                                <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                            </summary>
                            <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">
                                Encoding makes the file about 33% bigger. Plus, browsers cannot cache Base64 text the way they cache normal image files. If you encode large photos, your web page will load much slower.
                            </div>
                        </details>
                        <details className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-3">
                            <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                                <span>Can I put the CSS output straight into my stylesheet?</span>
                                <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                            </summary>
                            <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">
                                Yes. We format the CSS output as a complete background-image rule. Just copy it and paste it directly into your CSS file. It works perfectly in all modern browsers.
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
