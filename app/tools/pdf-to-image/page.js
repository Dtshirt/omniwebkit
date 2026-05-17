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

                {/* SEO Content */}
                <div className="prose-premium max-w-4xl mx-auto mt-16 px-6">
                  <h2>PDF to Image Converter: Render Pages Instantly</h2>
                  
                  <p>Trying to share a single page of a PDF document on social media is impossible. Social platforms do not read PDFs, and emailing a heavy 50-page document just to show someone one specific chart is frustrating for everyone involved. That is why you need a dedicated PDF to image converter.</p>
                  
                  <p>This tool is built specifically to bridge that gap. It takes your standard PDF file and cleanly slices it into individual, high-resolution pictures. Whether you are a graphic designer needing a sharp PNG of a layout, or a student trying to turn lecture slides into a fast-loading WebP gallery, this tool delivers exact visual copies of your pages.</p>
                  
                  <p>I built this utility because I was tired of taking messy screenshots of my screen just to get an image out of a document. Screenshots are low-quality, they capture the wrong dimensions, and they look unprofessional. This web application reads the vector data directly and renders a perfect image file every single time.</p>
                  
                  <h2>The Problem with Browser-Based Rendering</h2>
                  
                  <p>If you have used other online converters, you might have noticed missing fonts, broken charts, or weird graphical glitches in the final picture. This happens because most free tools rely on your web browser's built-in PDF viewer to draw the page before taking a snapshot.</p>
                  
                  <p>That method is fast, but it is deeply flawed. Browsers are built to read HTML, not complex print documents. Our system works differently. When you hit convert, your file is processed on a secure server using PyMuPDF — an industrial-grade rendering engine. It handles CMYK color spaces, embedded custom fonts, and complex vector layers flawlessly. The image you download looks exactly like the printed document.</p>
                  
                  <h2>How to Convert PDF to Image (The Frictionless Guide)</h2>
                  
                  <p>You do not need an expensive Adobe subscription to extract pictures from your documents. Here is how you can render your entire file into a neat folder of images in a matter of seconds.</p>
                  
                  <ol>
                    <li><strong>Drop your document:</strong> Drag your PDF into the upload area above. The tool easily handles massive files with hundreds of pages.</li>
                    <li><strong>Choose your format:</strong> Select between PNG for lossless quality, JPG for smaller file sizes, or WebP for modern web publishing. You can also crank up the scale multiplier for Retina-level crispness.</li>
                    <li><strong>Start the conversion:</strong> Click the big convert button. The server engine rapidly renders every single page into your chosen format.</li>
                    <li><strong>Download your ZIP:</strong> Within seconds, your browser will download a single compressed ZIP file containing every rendered page neatly organized and numbered.</li>
                  </ol>
                  
                  <p>If your document is locked with a password, simply type the password into the optional field. The server will decrypt the file, render the pages, and hand you the images without any hassle.</p>
                  
                  <h2>Your Privacy & Security Anchor</h2>
                  
                  <p>Turning sensitive documents like bank statements or legal contracts into images requires serious trust. You cannot just upload sensitive data to a random server without knowing what happens next.</p>
                  
                  <p>Here is our strict, non-negotiable security policy. Your files are processed in an isolated memory environment. The absolute second that the conversion engine finishes packing your ZIP file and you download it, both the original PDF and the generated images are scheduled for permanent deletion. Within a maximum of one hour, every trace is wiped from the server.</p>
                  
                  <p>We do not look at your files. We never store your downloaded images. We do not use your private pages to train artificial intelligence. Your data remains strictly your own.</p>
                  
                  <h2>Key Features of the PDF to Image Converter</h2>
                  
                  <p>We stripped out the unnecessary bloat and focused on pure rendering quality and speed. Here is what this tool actually offers.</p>
                  
                  <ul>
                    <li><strong>Multiple Format Support:</strong> Export to lossless PNG for perfect quality, adjustable JPG for email attachments, or WebP for fast-loading website assets.</li>
                    <li><strong>Resolution Scaling:</strong> Need extreme detail? Push the scale up to 4× to generate massive, print-ready graphics where you can zoom in without seeing a single blurry pixel.</li>
                    <li><strong>Password Unlocking:</strong> Directly convert encrypted files by simply providing the password before you click convert.</li>
                    <li><strong>Bulk ZIP Delivery:</strong> Nobody wants to click 'Download' fifty times for a 50-page document. You get one neat ZIP file containing everything instantly.</li>
                  </ul>
                  
                  <h2>Technical Specifications</h2>
                  
                  <p>If you care about how your data is handled behind the scenes, here is the exact technical breakdown of this utility.</p>
                  
                  <table>
                    <thead>
                      <tr>
                        <th>Specification</th>
                        <th>Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Supported Output</strong></td>
                        <td>PNG, JPG, WebP</td>
                      </tr>
                      <tr>
                        <td><strong>Core Engine</strong></td>
                        <td>PyMuPDF backend renderer</td>
                      </tr>
                      <tr>
                        <td><strong>Max Scale Multiplier</strong></td>
                        <td>4× (Print Quality)</td>
                      </tr>
                      <tr>
                        <td><strong>Data Retention Policy</strong></td>
                        <td>Strict 1-hour automatic purge</td>
                      </tr>
                      <tr>
                        <td><strong>Entity Connection</strong></td>
                        <td>Powered by <a href="https://github.com/Dtshirt/omniwebkit">Lazydesigners</a></td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <p>Stop relying on messy screen grabs to share your documents visually. Upload your file to the tool above, pick your preferred format, and let the secure server render perfect, high-resolution images in seconds.</p>
                  
                  <hr />
                  <p><strong>Meta Title:</strong> PDF to Image Converter | Render High-Quality PNG & JPG</p>
                  <p><strong>Meta Description:</strong> Convert PDF to Image instantly. Extract pages into high-resolution PNG, JPG, or WebP formats using a secure, server-side rendering engine. Fast and free.</p>
                  <p><strong>Primary Keyword:</strong> pdf to image converter</p>
                  <p><strong>Word Count:</strong> 855</p>
                  <p><strong>Estimated Reading Time:</strong> 4 min read</p>
        
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "PDF to Image Converter",
                        "operatingSystem": "Web",
                        "applicationCategory": "UtilitiesApplication",
                        "description": "Convert PDF documents to high-resolution PNG, JPG, or WebP images using secure server-side rendering.",
                        "offers": {
                          "@type": "Offer",
                          "price": "0",
                          "priceCurrency": "USD"
                        },
                        "creator": {
                          "@type": "Organization",
                          "name": "Lazydesigners",
                          "url": "https://github.com/Dtshirt/omniwebkit"
                        }
                      })
                    }}
                  />
                </div>
            </div>
        </div>
    );
}
