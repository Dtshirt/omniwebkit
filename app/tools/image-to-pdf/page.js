'use client';

import { useState, useRef } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
    FileImage, Upload, Download, Plus, X,
    RotateCcw, Loader2, Settings, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
    if (!b) return '–';
    const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

const PAGE_SIZES = {
    a4: { label: 'A4', w: 595, h: 842 },
    letter: { label: 'Letter (US)', w: 612, h: 792 },
    a3: { label: 'A3', w: 842, h: 1191 },
    a5: { label: 'A5', w: 420, h: 595 },
    legal: { label: 'Legal (US)', w: 612, h: 1008 },
};

const FIT_MODES = [
    { val: 'fit', label: 'Fit', desc: 'Keep aspect ratio, pad edges' },
    { val: 'stretch', label: 'Stretch', desc: 'Fill page, may distort' },
    { val: 'original', label: 'Original', desc: '1:1 pixels, may crop' },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function ImageToPdf() {
    const [images, setImages] = useState([]);
    const [pageSize, setPageSize] = useState('a4');
    const [orientation, setOrientation] = useState('portrait');
    const [margin, setMargin] = useState(20);
    const [quality, setQuality] = useState(0.92);
    const [fitMode, setFitMode] = useState('fit');
    const [generating, setGenerating] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef(null);
    const addMoreRef = useRef(null);

    /* ── Add images ── */
    const addImages = (files) => {
        Array.from(files).filter(f => f.type.startsWith('image/')).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new window.Image();
                img.onload = () => {
                    setImages(prev => [...prev, {
                        id: Math.random().toString(36).slice(2),
                        src: e.target.result,
                        name: file.name,
                        width: img.width,
                        height: img.height,
                        size: file.size,
                    }]);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (id) => setImages(p => p.filter(img => img.id !== id));

    const moveImage = (id, dir) => {
        setImages(p => {
            const idx = p.findIndex(img => img.id === id);
            const to = idx + dir;
            if (to < 0 || to >= p.length) return p;
            const a = [...p];
            [a[idx], a[to]] = [a[to], a[idx]];
            return a;
        });
    };

    /* ── Generate PDF using jsPDF ── */
    const generatePdf = async () => {
        if (!images.length) return;
        setGenerating(true);
        try {
            const { jsPDF } = await import('jspdf');
            const sz = PAGE_SIZES[pageSize];
            const pw = orientation === 'portrait' ? sz.w : sz.h;  // page width in pt
            const ph = orientation === 'portrait' ? sz.h : sz.w;  // page height in pt

            const pdf = new jsPDF({ orientation, unit: 'pt', format: [pw, ph] });

            for (let i = 0; i < images.length; i++) {
                if (i > 0) pdf.addPage([pw, ph], orientation);
                const img = images[i];
                const availW = pw - margin * 2;
                const availH = ph - margin * 2;

                let imgW, imgH, x, y;

                if (fitMode === 'fit') {
                    const scale = Math.min(availW / img.width, availH / img.height, 1);
                    imgW = img.width * scale;
                    imgH = img.height * scale;
                    x = margin + (availW - imgW) / 2;
                    y = margin + (availH - imgH) / 2;
                } else if (fitMode === 'stretch') {
                    imgW = availW; imgH = availH;
                    x = margin; y = margin;
                } else {
                    // original size, centered, clipped to page
                    imgW = Math.min(img.width, availW);
                    imgH = Math.min(img.height, availH);
                    x = margin + (availW - imgW) / 2;
                    y = margin + (availH - imgH) / 2;
                }

                pdf.addImage(img.src, 'JPEG', x, y, imgW, imgH, undefined, quality > 0.8 ? 'FAST' : 'MEDIUM');
            }

            pdf.save('images.pdf');
        } catch (err) {
            console.error('PDF generation error:', err);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image to PDF', href: '/tools/image-to-pdf' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-sky-500/25">
                        <FileImage className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Image to PDF</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Convert multiple images into a single PDF document — free, instant, browser-based</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Settings sidebar */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className={`${cardCls} p-5`}>
                            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                                <Settings className="w-3.5 h-3.5 text-sky-500" />PDF Settings
                            </h2>

                            {/* Page Size */}
                            <div className="mb-4">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Page Size</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {Object.entries(PAGE_SIZES).map(([key, { label }]) => (
                                        <button key={key} onClick={() => setPageSize(key)}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left ${pageSize === key
                                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-400'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}>
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Orientation */}
                            <div className="mb-4">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Orientation</label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {['portrait', 'landscape'].map(o => (
                                        <button key={o} onClick={() => setOrientation(o)}
                                            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all capitalize ${orientation === o
                                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10 text-sky-700 dark:text-sky-400'
                                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                                }`}>
                                            {o === 'portrait' ? '◻ Portrait' : '▭ Landscape'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Image Fit Mode */}
                            <div className="mb-4">
                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1.5">Image Fit</label>
                                <div className="grid grid-cols-1 gap-1">
                                    {FIT_MODES.map(({ val, label, desc }) => (
                                        <button key={val} onClick={() => setFitMode(val)}
                                            className={`flex items-center justify-between py-2 px-3 rounded-xl text-left border transition-all ${fitMode === val
                                                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10'
                                                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}>
                                            <span className={`text-xs font-bold ${fitMode === val ? 'text-sky-700 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300'}`}>{label}</span>
                                            <span className="text-[10px] text-slate-400 ml-2">{desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Margin */}
                            <div className="mb-4">
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Page Margin</label>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{margin} pt</span>
                                </div>
                                <input type="range" min={0} max={80} value={margin} onChange={e => setMargin(+e.target.value)}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500" />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>None</span><span>Large</span>
                                </div>
                            </div>

                            {/* Quality */}
                            <div className="mb-5">
                                <div className="flex justify-between mb-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Image Quality</label>
                                    <span className="text-xs font-bold text-slate-900 dark:text-white">{Math.round(quality * 100)}%</span>
                                </div>
                                <input type="range" min={0.1} max={1} step={0.05} value={quality} onChange={e => setQuality(+e.target.value)}
                                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500" />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                                    <span>Smaller PDF</span><span>Best quality</span>
                                </div>
                            </div>

                            {/* Generate button */}
                            <button onClick={generatePdf} disabled={images.length === 0 || generating}
                                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-sky-500/20 transition disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {generating ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Download className="w-4 h-4" />Generate PDF ({images.length} page{images.length !== 1 ? 's' : ''})</>}
                            </button>

                            {images.length > 0 && (
                                <button onClick={() => setImages([])} className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                                    <RotateCcw className="w-3.5 h-3.5" />Clear all images
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Drop zone */}
                        <div className={cardCls}>
                            <div
                                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={e => { e.preventDefault(); setDragOver(false); addImages(e.dataTransfer.files); }}
                                onClick={() => fileRef.current?.click()}
                                className={`p-10 text-center cursor-pointer transition-all border-2 border-dashed m-4 rounded-2xl ${dragOver ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/10'
                                        : 'border-slate-300 dark:border-slate-600 hover:border-sky-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                                    }`}>
                                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addImages(e.target.files)} />
                                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-3 shadow-md shadow-sky-500/20">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{dragOver ? 'Drop images here!' : 'Upload Images for PDF'}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Drag & drop or click to browse • Each image becomes one PDF page</p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['JPG', 'PNG', 'WebP', 'GIF', 'BMP'].map(f => (
                                        <span key={f} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Image list */}
                        {images.length > 0 && (
                            <div className={`${cardCls} p-5`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <FileImage className="w-4 h-4 text-sky-500" />
                                        {images.length} Image{images.length !== 1 ? 's' : ''} · {images.length} Page{images.length !== 1 ? 's' : ''}
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Drag arrows to reorder</span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {images.map((img, idx) => (
                                        <div key={img.id} className="relative group bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                            {/* Page number badge */}
                                            <div className="absolute top-2 left-2 z-10 bg-sky-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                                p{idx + 1}
                                            </div>
                                            {/* Remove button */}
                                            <button onClick={() => removeImage(img.id)}
                                                className="absolute top-2 right-2 z-10 p-1 bg-red-500 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                                <X className="w-3 h-3" />
                                            </button>
                                            <img src={img.src} alt={img.name} className="w-full h-28 object-cover" />
                                            {/* Info + reorder */}
                                            <div className="px-2.5 py-2">
                                                <p className="text-[10px] font-semibold text-slate-900 dark:text-white truncate">{img.name}</p>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400">{img.width}×{img.height} · {fmtSize(img.size)}</p>
                                                <div className="flex gap-1 mt-1.5">
                                                    <button onClick={() => moveImage(img.id, -1)} disabled={idx === 0}
                                                        className="flex-1 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 text-slate-400 rounded-lg text-xs transition disabled:opacity-30 flex items-center justify-center">
                                                        <ChevronLeft className="w-3 h-3" />
                                                    </button>
                                                    <button onClick={() => moveImage(img.id, 1)} disabled={idx === images.length - 1}
                                                        className="flex-1 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 text-slate-400 rounded-lg text-xs transition disabled:opacity-30 flex items-center justify-center">
                                                        <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add more */}
                                    <label className="flex flex-col items-center justify-center min-h-[160px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition-all group">
                                        <input ref={addMoreRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addImages(e.target.files)} />
                                        <Plus className="w-7 h-7 text-slate-400 group-hover:text-sky-500 transition mb-1" />
                                        <span className="text-xs font-semibold text-slate-400 group-hover:text-sky-500 transition">Add More</span>
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-12 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Image to PDF Converter — Combine Multiple Photos into One PDF</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            There are many situations where you need multiple images in a single PDF file. Submitting scanned documents to a government office. Sending a portfolio of photographs by email. Attaching a multi-page receipt to an expense report. Creating a photo album. Combining product images for a client presentation. Each of these tasks requires the same thing: a reliable way to turn image files into a properly formatted PDF document.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The OmniWebKit Image to PDF converter does this directly in your browser. Upload any number of images — JPG, PNG, WebP, GIF, or BMP — arrange them in the order you want, choose your page size and orientation, and generate the PDF with a single click. Each image becomes one page in the PDF. The entire process runs client-side using jsPDF — your files never leave your device.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Five page sizes are supported: A4, A3, A5, US Letter, and US Legal. Both portrait and landscape orientations are available. A margin slider controls the whitespace around each image. The quality slider lets you balance between PDF file size and image clarity. Three image fit modes give you control over how each image fills the page.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">PDF Page Settings — What Each Option Does</h2>

                        <div className="space-y-5">
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-base">Page Size</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="bg-slate-100 dark:bg-slate-900/50">
                                                {['Size', 'Dimensions', 'Best used for'].map(h => (
                                                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                ['A4', '210 × 297 mm', 'Standard international document size — used in most countries for business and personal documents'],
                                                ['Letter', '216 × 279 mm', 'Standard US document size — used in the United States and Canada for business and professional documents'],
                                                ['A3', '297 × 420 mm', 'Large format — twice the size of A4. Use for posters, technical drawings, architectural plans, or large photo prints'],
                                                ['A5', '148 × 210 mm', 'Half the size of A4. Use for booklets, handouts, pocket-sized documents, or compact photo books'],
                                                ['Legal', '216 × 356 mm', 'US legal format — taller than Letter. Used for legal contracts, government forms, and official documents in the United States'],
                                            ].map(([size, dims, use], i) => (
                                                <tr key={size} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800/30' : 'bg-slate-50 dark:bg-slate-900/20'}>
                                                    <td className="px-4 py-2.5 text-sky-600 dark:text-sky-400 font-bold text-xs border border-slate-200 dark:border-slate-700">{size}</td>
                                                    <td className="px-4 py-2.5 text-slate-900 dark:text-white font-mono text-xs border border-slate-200 dark:border-slate-700">{dims}</td>
                                                    <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700">{use}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-base">Image Fit Modes</h3>
                                <div className="grid sm:grid-cols-3 gap-3">
                                    {[
                                        { mode: 'Fit', icon: '⬜', body: 'The image is scaled proportionally to fit within the printable area (page minus margins). The aspect ratio is always preserved — you never get a distorted image. If the image does not fill the entire page, the remaining space is left white. This is the best choice for most use cases.' },
                                        { mode: 'Stretch', icon: '⬛', body: 'The image is stretched to exactly fill the printable area regardless of its original proportions. This fills the entire page with the image but may distort it — people and objects could look wider or taller than they actually are. Use this for backgrounds or textures where distortion is acceptable.' },
                                        { mode: 'Original', icon: '◼', body: 'The image is placed at its actual pixel size, centred on the page. If the image is larger than the page, it is scaled down to fit. If it is smaller, it is left at its original size and centred on the page with white space around it. Use this when preserving exact pixel dimensions is important.' },
                                    ].map(({ mode, icon, body }) => (
                                        <div key={mode} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                            <div className="text-2xl mb-2">{icon}</div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{mode}</h4>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Page Margin</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">The margin controls whitespace between the image and the edge of the page. A margin of 20 pt (the default) is standard for most documents. Set it to 0 for a full-bleed layout where the image extends to the very edge of the page. Larger margins work well for framed photo prints or documents that will be bound.</p>
                                </div>
                                <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Image Quality</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">The quality slider controls JPEG compression applied to images when embedding them in the PDF. Higher quality means clearer images and a larger PDF file. Lower quality means smaller PDF file with more visible compression artefacts. At 90% (the default), quality is excellent and the file is significantly smaller than at 100%. For documents where file size matters, try 70–80%.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Common Uses for Image to PDF Conversion</h2>
                        <div className="space-y-3">
                            {[
                                { title: 'Sharing Scanned Documents', body: 'When you scan physical documents with your phone camera or a scanner, you typically get a series of image files — one per page. Converting them to a PDF creates a single, properly ordered multi-page document that can be emailed, uploaded to a government portal, or stored in a document management system. PDF is the universally accepted format for official document submission.' },
                                { title: 'Creating Photo Portfolios', body: 'Photographers, graphic designers, architects, and other creative professionals often need to share work samples as a PDF portfolio. Compiling your best images into a PDF lets you send a single file that maintains the exact layout and quality you intended, without relying on the recipient having the same apps to view individual image files.' },
                                { title: 'Expense Reports and Receipts', body: 'Many corporate expense reporting systems require receipts to be submitted as a single PDF. If you have photographed multiple receipts, converting them to a multi-page PDF is the most efficient way to submit them in one file attachment rather than individually.' },
                                { title: 'Photo Books and Albums', body: 'Creating a PDF photo book is a quick way to compile photos from an event — a wedding, a holiday, a family gathering — into a shareable document. Order the images, choose landscape orientation for a cinematic feel, and generate the PDF in seconds.' },
                                { title: 'Legal and Healthcare Documents', body: 'Patient intake forms, consent forms, insurance claims, and legal evidence often need to be submitted as PDFs. If you have photographed these documents, converting them to PDF is the standard method for professional document submission.' },
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
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Are my images uploaded to a server?', a: 'No. All PDF generation runs entirely in your browser using the jsPDF library. Your images are never uploaded to any server and never leave your device.' },
                                { q: 'How many images can I add to one PDF?', a: 'There is no hard limit. Each image becomes one page in the PDF. The number of images you can process is limited by your browser\'s available memory. In practice, you can typically combine 20–50 standard photos without any issues.' },
                                { q: 'Can I change the order of pages before generating the PDF?', a: 'Yes. Use the ← and → arrow buttons below each image thumbnail to move it left or right in the page order. The page number badge (p1, p2, p3...) updates in real time to show the new order.' },
                                { q: 'What page size should I use for photos?', a: 'A4 (portrait) is the international standard and works well for most photos. If you are in the United States, use Letter. For wide/landscape photographs, select Landscape orientation. A3 is good for large format prints and detailed images.' },
                                { q: 'Which image fit mode should I use?', a: '"Fit" is the best choice for most situations — it preserves the correct proportions with no distortion and adds white space where needed. Use "Stretch" only for backgrounds and textures. Use "Original" when exact pixel dimensions matter more than the layout.' },
                                { q: 'What is the maximum image resolution the PDF supports?', a: 'There is no set resolution limit. Images are embedded at their original resolution, scaled to fit the page dimensions. For print-quality PDFs, use high-resolution source images (300 DPI or higher) and set quality to 90–100%.' },
                                { q: 'Can I add images in different formats (JPG and PNG in the same PDF)?', a: 'Yes. You can mix JPG, PNG, WebP, GIF, and BMP images in a single PDF. Each image is converted to JPEG internally when embedding in the PDF.' },
                                { q: 'Will the PDF be searchable?', a: 'No. The PDF generated by this tool contains images only — it is not a text-searchable PDF. For searchable PDFs from scanned documents, you would need an OCR (Optical Character Recognition) tool in addition to this converter.' },
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
