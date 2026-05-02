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
                <div className="mt-12 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Image to Base64 Converter — Convert Any Image to a Base64 Data URL Instantly</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Base64 is a way of encoding binary data — like an image file — into a string of printable ASCII characters. This is useful in many web development and programming scenarios where you need to embed image data directly into code, rather than linking to a separate file. The OmniWebKit Image to Base64 converter does this in your browser, instantly, without any server upload or file size limit.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Upload any image (PNG, JPG, WebP, GIF, SVG, BMP), and the tool immediately produces four ready-to-use output formats: the full Data URL (with MIME type prefix), the raw Base64 string, a CSS <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">background-image</code> declaration, and an HTML <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono">&lt;img&gt;</code> tag with the Base64 value embedded. Copy any format with one click.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            The tool also works in reverse: switch to "Base64 → Image" mode, paste any Base64 string or Data URL, and the tool decodes it back into a visible image preview that you can save as a file. This is useful for debugging email templates, API responses, or any system that stores images as Base64 strings.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">What is Base64 Encoding?</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Base64 is an encoding scheme that converts binary data into a text format. Computers store images as binary data — sequences of 1s and 0s — which cannot be reliably transmitted through all text-based protocols. Base64 solves this by mapping every 3 bytes of binary data to 4 printable ASCII characters using a fixed alphabet of 64 characters (A–Z, a–z, 0–9, +, /, and sometimes =).
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The resulting string can be safely included in HTML attributes, CSS style rules, JSON objects, XML documents, email bodies, and any other text-based format — without worrying about character encoding, binary corruption during transfer, or file path dependencies.
                        </p>
                        <div className={`p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl mb-4`}>
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-violet-500" />Base64 Size Penalty</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Base64 encoding increases file size by approximately 33%. A 100 KB image becomes roughly 133 KB as a Base64 string. This is the trade-off for embedding the image directly in text. For large images used repeatedly across a website, external files (referenced by URL) are more efficient. Base64 is best used for small images — icons, logos, data URIs — where the HTTP request overhead would be higher than the 33% size penalty.
                            </p>
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">When to Use Base64 for Images — Real-World Use Cases</h2>
                        <div className="space-y-3">
                            {[
                                {
                                    title: 'Email Templates and Newsletters',
                                    body: 'Email clients like Gmail, Outlook, and Apple Mail are notorious for blocking externally hosted images. Many corporate email servers strip image links for security reasons. Embedding images as Base64 Data URLs directly in the email HTML ensures the image is always displayed, regardless of whether the recipient\'s server allows external requests. This is especially useful for logos, headers, and signature images in HTML email templates.'
                                },
                                {
                                    title: 'CSS Inline Icons and Small UI Graphics',
                                    body: 'Small icons and decorative graphics can be embedded directly in a CSS file as Base64 Data URLs using the background-image property. This eliminates separate HTTP requests for icon files. For website critical path assets — like a loading spinner or a small logo that appears on every page — embedding as Base64 can improve page load time by removing one or more round-trip server requests, especially for HTTP/1.1 connections.'
                                },
                                {
                                    title: 'Single-File HTML Documents',
                                    body: 'Sometimes you need to send a complete, self-contained HTML file that includes all assets — no external files, no server. This is common for documentation, reports, offline tools, and quick prototypes. Embedding images as Base64 Data URLs means the entire web page, including all images, is contained in a single .html file that works locally in any browser without any internet connection.'
                                },
                                {
                                    title: 'API Payloads and JSON Data',
                                    body: 'REST APIs and JSON-based data formats cannot contain raw binary data. When an API needs to accept or return image data — for example, a document scanning API or an AI image generation endpoint — Base64 is the standard way to transmit image data in a JSON body. Many APIs (including Google\'s Vision API and OpenAI\'s image APIs) accept images as Base64-encoded strings in their request payloads.'
                                },
                                {
                                    title: 'Database Storage',
                                    body: 'Some database schemas store image data as text strings rather than binary BLOBs. This is common in NoSQL databases like MongoDB (when images are stored in document fields) and in SQLite applications. Base64 encoding allows image binary data to be stored safely in VARCHAR or TEXT columns.'
                                },
                                {
                                    title: 'Canvas and Dynamic Image Generation',
                                    body: 'When working with the HTML5 Canvas API, the toDataURL() method returns a Base64-encoded PNG or JPEG string representing the current canvas state. You will also encounter Base64 strings when working with image capture via the getUserMedia API, when processing images with JavaScript libraries, or when passing image data between Web Workers.'
                                },
                            ].map(({ title, body }) => (
                                <details key={title} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                                        <span>{title}</span>
                                        <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                                    </summary>
                                    <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{body}</div>
                                </details>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Base64 Output Formats Explained</h2>
                        <div className="space-y-4">
                            {[
                                { fmt: 'Data URL', code: 'data:image/png;base64,iVBORw0KGgo...', body: 'The complete Data URL includes the MIME type prefix (data:image/png;base64, or data:image/jpeg;base64, etc.). This is the most complete and portable format. You can use it directly as the src attribute value in an HTML <img> tag, as a CSS background-image value, or wherever a URL is expected. The MIME type tells the browser what kind of binary data follows.' },
                                { fmt: 'Raw Base64 String', code: 'iVBORw0KGgo...', body: 'The raw Base64 string is the encoded data without the data: prefix. Use this format when you are passing the image to an API that expects raw Base64 (not a Data URL), when constructing your own data URI in code, or when storing in a database field that handles its own type metadata.' },
                                { fmt: 'CSS background-image', code: 'background-image: url("data:image/png;base64,...");', body: 'Ready to paste directly into a CSS rule. Copy this output and paste it into your stylesheet — the image is embedded without any separate file. This is the standard way to embed icons and small graphics directly in CSS. Works in all modern browsers.' },
                                { fmt: 'HTML <img> tag', code: '<img src="data:image/png;base64,..." alt="image" />', body: 'A complete, ready-to-use HTML image element with the Base64 Data URL as the src. Copy and paste this directly into any HTML file. The image will render in any browser that supports Data URLs (all modern browsers, and most legacy ones too).' },
                            ].map(({ fmt, code, body }) => (
                                <div key={fmt} className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{fmt}</h3>
                                    <code className="block text-[10px] font-mono text-violet-600 dark:text-violet-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 mb-2 overflow-x-auto whitespace-nowrap">{code}</code>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is my image uploaded to a server?', a: 'No. All encoding and decoding runs entirely in your browser using the FileReader API and JavaScript. Your images never leave your device and are never stored anywhere.' },
                                { q: 'What image formats can I convert to Base64?', a: 'You can upload PNG, JPG, GIF, SVG, WebP, and BMP images. The output Data URL will include the correct MIME type for each format (e.g. data:image/png;base64,... or data:image/jpeg;base64,...).' },
                                { q: 'Why is the Base64 string so much longer than the original file?', a: 'Base64 encoding increases file size by approximately 33% because it maps every 3 bytes of binary data to 4 ASCII characters. A 100 KB image produces roughly a 133 KB Base64 string.' },
                                { q: 'Can I use the Base64 output directly in an HTML file?', a: 'Yes. Use the "HTML <img> tag" output format — it generates a complete <img> element with the Base64 Data URL as the src. Copy and paste it into any HTML file. No external files are needed.' },
                                { q: 'Can I decode a Base64 string back to an image?', a: 'Yes. Switch to "Base64 → Image" mode, paste your Base64 string (with or without the data:image/ prefix), and click Decode. The image is displayed as a preview and can be downloaded as a file.' },
                                { q: 'What is a Data URL?', a: 'A Data URL (also called a data URI) is a URL scheme that allows embedding small files directly in web pages as inline data rather than as external file references. Image data URLs have the format: data:[mime-type];base64,[base64-data].' },
                                { q: 'Should I use Base64 for large images on my website?', a: 'No. Base64 encoding increases file size by 33% and is not cached separately by the browser. For large images used on websites, external file references (with proper caching headers) are significantly more efficient. Use Base64 only for small assets like icons, favicons, and email template images.' },
                                { q: 'What does the "Raw Base64" format mean vs the full Data URL?', a: 'The Data URL includes the MIME type prefix (data:image/png;base64,). The Raw Base64 is only the encoded data string without the prefix. Some APIs and databases expect the raw string without the prefix — use the Raw Base64 format in those cases.' },
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
