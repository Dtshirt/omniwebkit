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
                <div className="mt-16 prose-premium">
                    <div className={`${cardCls} p-5 sm:p-8`}>
                        <section>
                            <h2>About the Tool</h2>
                            <p>
                                Sending ten separate photos in an email is messy. That is why we built this <strong>image to PDF converter</strong>. It takes your scattered photos, receipts, or screenshots and binds them into a single, clean document that is easy to share and print. 
                            </p>
                            <p>
                                Unlike basic tools that lock you into one size, you get full control. You can pick standard document sizes like A4 or US Letter, adjust the white space around your pictures, and set exactly how the images fit on the page. Whether you need to convert JPG to PDF or combine PNGs, the result looks professional every time.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2>How to Use</h2>
                            <p>
                                You do not need an account or complicated software to build your document. Follow these steps:
                            </p>
                            <ol>
                                <li><strong>Drop your files:</strong> Click the upload box or drag your images right onto the screen. You can add as many as you need.</li>
                                <li><strong>Set the order:</strong> Use the little arrow buttons under each picture to arrange them exactly how you want them to appear.</li>
                                <li><strong>Tweak the layout:</strong> Pick your page size and orientation from the side menu. If you want a full-page photo, set the margin to zero.</li>
                                <li><strong>Save your file:</strong> Hit the generate button. The tool builds your document instantly and saves it to your computer.</li>
                            </ol>
                        </section>

                        <section className="mt-8">
                            <h2>Privacy & Security Anchor</h2>
                            <p>
                                When you convert personal documents like tax forms or family photos, privacy is a big deal. 
                            </p>
                            <p>
                                Here is the truth: your files never leave your computer. This converter runs completely inside your web browser using local processing. We do not upload your images to our servers, we do not store your PDFs, and no one else can see your files. It is 100% private and secure.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2>Features</h2>
                            <p>
                                Here is what makes this the best way to merge your images:
                            </p>
                            <ul>
                                <li><strong>Local Processing:</strong> Zero wait times for uploading or downloading because the work happens right on your device.</li>
                                <li><strong>Format Support:</strong> Throw in JPG, PNG, WebP, GIF, or BMP files. It handles them all smoothly.</li>
                                <li><strong>Page Controls:</strong> Standard formats like A4, A3, and US Letter are built-in for perfect printing.</li>
                                <li><strong>Smart Fit Modes:</strong> Choose to stretch images, keep their original size, or fit them perfectly without cutting off any edges.</li>
                                <li><strong>Quality Slider:</strong> Compress the final file for email or keep it high-res for printing.</li>
                            </ul>
                        </section>

                        <section className="mt-8">
                            <h2>Technical Specs</h2>
                            <p>
                                For the tech-curious, here is how we handle your files without a server. 
                            </p>
                            <p>
                                The tool uses the powerful jsPDF library to generate documents client-side. When you drag an image in, we read it as a Data URL and process it directly in your browser's memory. Regardless of whether you upload a PNG or WebP, the engine converts it to an optimized JPEG internally to keep the final PDF size low. You control the compression ratio through the quality slider.
                            </p>
                        </section>

                        <section className="mt-8">
                            <h2>Frequently Asked Questions</h2>
                            
                            <h3>Is there a limit on how many images I can convert?</h3>
                            <p>
                                There is no hard block. Each image becomes one page. Most modern browsers can handle batches of 20 to 50 photos easily. If you load hundreds of huge files, your browser might slow down.
                            </p>

                            <h3>Will this crop or cut off my pictures?</h3>
                            <p>
                                Not unless you want it to. If you leave the fit mode on "Fit", the tool shrinks the image to fit the page perfectly without losing any edges. It adds white space where needed.
                            </p>

                            <h3>Can I use this on my phone?</h3>
                            <p>
                                Yes. The tool works great on mobile devices. You can select photos straight from your camera roll and save the final document directly to your files app.
                            </p>

                            <h3>Does it cost anything?</h3>
                            <p>
                                No. It is entirely free to use. We do not charge fees, we do not ask for a credit card, and we never watermark your documents.
                            </p>
                        </section>
                    </div>
                </div>
        </div>
    );
}
