'use client';
import { useState, useRef } from 'react';
import { FileText, Upload, Download, Loader2, Check, AlertTriangle, FileDown, X, RefreshCw, Server } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from "@/lib/api-config";

const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

function fmtSize(b) {
    if (!b) return '0 B';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}

export default function PdfToWord() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | uploading | processing | done | error
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [toast, setToast] = useState(null);
    const fileRef = useRef(null);
    const pollRef = useRef(null);
    const jobRef = useRef(null);

    const showToast = (msg, type = 'ok') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleFile = (f) => {
        if (f?.type === 'application/pdf' || f?.name?.toLowerCase().endsWith('.pdf')) {
            if (f.size > 100 * 1024 * 1024) { showToast('File too large (max 100 MB)', 'err'); return; }
            setFile(f); setStatus('idle'); setError(''); setResult(null); setProgress(0);
        } else if (f) {
            showToast('Please upload a PDF file', 'err');
        }
    };

    const startPoll = (jobId) => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${API_V1}/tools/pdf-to-word/status/${jobId}`);
                const data = await res.json();
                setProgress(data.progress);

                if (data.status === 'done') {
                    clearInterval(pollRef.current);
                    setStatus('done');
                    setResult({
                        jobId,
                        originalSize: data.original_size,
                        outputSize: data.output_size,
                    });
                    showToast('Conversion complete! Real .docx ready 🎉');
                } else if (data.status === 'error') {
                    clearInterval(pollRef.current);
                    setStatus('error');
                    setError(data.error || 'Conversion failed');
                    showToast('Conversion failed', 'err');
                }
            } catch { /* network hiccup, keep polling */ }
        }, 500);
    };

    const convert = async () => {
        if (!file) return;
        setStatus('uploading'); setProgress(0); setError(''); setResult(null);

        try {
            const form = new FormData();
            form.append('file', file);

            const res = await fetch(`${API_V1}/tools/pdf-to-word`, { method: 'POST', body: form });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || `Server error ${res.status}`);
            }
            const data = await res.json();

            jobRef.current = data.job_id;
            setStatus('processing');
            setProgress(10);
            startPoll(data.job_id);
        } catch (err) {
            setStatus('error');
            setError(err.message || 'Upload failed');
            showToast('Failed: ' + (err.message || 'Upload failed'), 'err');
        }
    };

    const download = async () => {
        if (!result) return;
        try {
            const resp = await fetch(`${API_V1}/tools/pdf-to-word/download/${result.jobId}`);
            if (!resp.ok) throw new Error('Download failed');
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file?.name?.replace('.pdf', '.docx') || 'document.docx';
            a.click();
            URL.revokeObjectURL(url);
            fetch(`${API_V1}/tools/pdf-to-word/cleanup/${result.jobId}`, { method: 'DELETE' }).catch(() => {});
        } catch { showToast('Download failed', 'err'); }
    };

    const reset = () => {
        clearInterval(pollRef.current);
        setFile(null); setResult(null); setProgress(0);
        setError(''); setStatus('idle');
        if (fileRef.current) fileRef.current.value = '';
    };

    const isWorking = status === 'uploading' || status === 'processing';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                    {toast.type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {toast.msg}
                </div>
            )}

            <div className="max-w-3xl mx-auto">
                <Breadcrumbs items={[{ name: 'PDF to Word', href: '/tools/pdf-to-word' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
                        <FileText className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">PDF to Word Converter</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Real PDF→DOCX conversion — powered by LibreOffice</p>
                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full">
                        <Server className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">Server-Side LibreOffice</span>
                    </div>
                </div>

                <div className={`${card} p-6`}>

                    {/* Upload */}
                    {status !== 'done' && (
                        <div
                            onClick={() => fileRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                            className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition mb-6 ${dragOver
                                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
                                : file
                                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'
                                }`}>
                            <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
                            {file ? (
                                <div className="flex items-center justify-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{fmtSize(file.size)}</p>
                                    </div>
                                    <button onClick={e => { e.stopPropagation(); reset(); }}
                                        disabled={isWorking}
                                        className="ml-2 p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Drop PDF here or click to upload</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Up to 100 MB — converted server-side with LibreOffice</p>
                                </>
                            )}
                        </div>
                    )}

                    {/* Info */}
                    {!isWorking && status !== 'done' && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl mb-5 flex items-start gap-2">
                            <Server className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                                <strong>Real conversion:</strong> Your PDF is uploaded to a LibreOffice server which produces a proper .docx file — with formatting, tables, fonts, and images preserved. This is not raw text extraction.
                            </p>
                        </div>
                    )}

                    {/* Progress */}
                    {isWorking && (
                        <div className="mb-5">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span className="font-bold uppercase text-[10px]">
                                    {status === 'uploading' ? 'Uploading PDF...' : 'LibreOffice converting...'}
                                </span>
                                <span className="font-bold text-blue-500">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-[9px] text-slate-400 mt-1">
                                {status === 'uploading' ? 'Uploading to server...' : 'LibreOffice is rendering your PDF to a real Word document...'}
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl mb-5 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                                <p className="text-[9px] text-red-500 mt-1">Make sure the Python backend is running on port 8000 with LibreOffice installed.</p>
                            </div>
                        </div>
                    )}

                    {/* Convert button */}
                    {status !== 'done' && (
                        <button onClick={convert} disabled={!file || isWorking}
                            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50">
                            {isWorking
                                ? <><Loader2 className="w-5 h-5 animate-spin" />{status === 'uploading' ? 'Uploading...' : 'Converting...'}</>
                                : <><FileDown className="w-5 h-5" />Convert to Word (.docx)</>
                            }
                        </button>
                    )}

                    {/* Result */}
                    {status === 'done' && result && (
                        <div className="space-y-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-center gap-2">
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">Real .docx File Ready!</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-slate-400 mb-0.5">ORIGINAL PDF</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{fmtSize(result.originalSize)}</p>
                                </div>
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-blue-500 mb-0.5">WORD FILE</p>
                                    <p className="text-sm font-black text-blue-700 dark:text-blue-300">{fmtSize(result.outputSize)}</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={reset}
                                    className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">
                                    <RefreshCw className="w-4 h-4" />New PDF
                                </button>
                                <button onClick={download}
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" />Download .docx
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-16 prose-premium">
                    <div className="mb-8">
                        <h2>About the Tool</h2>
                        <p>
                            Most tools that claim to be a <strong>pdf to word converter online free</strong> just rip the raw text out of your file and dump it into a blank document. Formatting breaks. Tables shatter. Images disappear. You end up spending more time fixing the resulting file than you would have spent just retyping the whole thing from scratch.
                        </p>
                        <p>
                            We built this PDF to Word converter differently because we were tired of those garbage results. Instead of relying on a weak browser script to guess your layout, your file gets uploaded to a secure server running a headless instance of LibreOffice — the exact same engine millions of professionals use every day. It reads the PDF structure the way a real office suite does, and renders it into a proper, native `.docx` file. The layout stays intact, fonts are mapped correctly, and tables remain editable tables.
                        </p>
                        <p>
                            So what does that actually mean for you? It means you get a real Word document that opens cleanly in Microsoft Word, Google Docs, Apple Pages, or any other editor, without annoying compatibility warnings or mangled paragraphs. Whether you're dealing with a legal contract, a heavily formatted resume, or a corporate report with mixed media, the structure holds up.
                        </p>
                        <p>
                            We completely bypassed the standard "extract and pray" method. By utilizing a server-side rendering approach, this tool pushes the heavy lifting to our hardware. That means it works just as fast on a five-year-old smartphone as it does on a high-end desktop workstation. 
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2>How to Use</h2>
                        <p>
                            I've tested dozens of converters, and nothing is more frustrating than a multi-step wizard when you just want a file. We stripped out the friction. Here's how to get your document in under 10 seconds:
                        </p>
                        <ol>
                            <li><strong>Upload your file:</strong> Drag your PDF directly into the drop zone above, or click the box to browse your device. We accept files up to 100MB, which easily covers massive e-books or image-heavy presentations.</li>
                            <li><strong>Wait for processing:</strong> Hit the "Convert to Word" button. Our LibreOffice server will instantly start rendering the `.docx` file. You'll see a real-time progress bar so you know exactly where things stand.</li>
                            <li><strong>Download the result:</strong> Once it hits 100%, click the download button. You now have a fully editable Word file ready for immediate use.</li>
                        </ol>
                        <p>
                            That's it. There are no registration walls, no email captures, and no sneaky watermarks slapped onto the final pages of your document. Just upload, convert, and get back to your actual work.
                        </p>
                        <p>
                            And if you have a batch of files to convert, just hit the "New PDF" button to instantly reset the tool and drop your next document in. The process resets immediately with zero delay.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2>Privacy & Security Anchor</h2>
                        <p>
                            When you upload a business contract, a financial statement, or a personal resume, you need to know exactly what happens to that data. Let's be totally transparent about our server-side conversion process.
                        </p>
                        <p>
                            Your PDF is transmitted over an encrypted, bank-level connection directly to our conversion server. The LibreOffice engine processes your file strictly in memory whenever possible. The moment you click download, the temporary `.docx` file is automatically wiped from our system forever. We don't log your file contents, we don't scan your text for AI training data, and we certainly don't store your documents in some hidden backup drive.
                        </p>
                        <p>
                            But there's a catch you should be aware of. Because we do this server-side to guarantee high-quality formatting, your file <em>does</em> leave your physical device for a few seconds. If you are dealing with highly classified corporate or government data that legally cannot touch a third-party server, you should run a local desktop converter instead. That's just the reality of cloud processing.
                        </p>
                        <p>
                            For everything else — invoices, study notes, forms, and standard business docs — our zero-retention policy keeps your data entirely secure. You own your files. We just change their format.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2>Features</h2>
                        <p>
                            There's a massive difference between basic text extraction and true document conversion. If you've ever tried a cheap converter, you know the pain of realigning text boxes for an hour. Here is what this engine actually does under the hood to prevent that:
                        </p>
                        <ul>
                            <li><strong>True Layout Preservation:</strong> Multi-column layouts, complex headers, footers, and indented paragraph structures are mapped directly to their Word equivalents. It doesn't just guess; it anchors them correctly.</li>
                            <li><strong>Editable Tables:</strong> This is a big one. Instead of turning a spreadsheet into a static image or a mess of tab-spaced text, LibreOffice rebuilds it as a native Word table so you can edit the data immediately.</li>
                            <li><strong>Smart Image Embedding:</strong> Logos, graphs, and background images are extracted at their original resolution and anchored exactly where they belong in the new file, not just dumped at the end of the page.</li>
                            <li><strong>Font Mapping:</strong> The converter intelligently matches the fonts used in your PDF to standard system fonts. This keeps the visual style consistent without requiring you to install a dozen new typefaces.</li>
                            <li><strong>Form Element Conversion:</strong> Checkboxes, text fields, and radio buttons in your original PDF are translated into standard Word elements, making it incredibly easy to fill out forms that were previously locked down.</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2>Technical Specifications</h2>
                        <p>
                            If you're curious about the exact capabilities, bottlenecks, and limits of the tool, here is the technical breakdown. I always prefer to know exactly what a tool can handle before I start throwing massive files at it.
                        </p>
                        <div className="overflow-x-auto mt-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr>
                                        <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Specification</th>
                                        <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Input Format</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">`.pdf` (Text-based, Form, or Mixed Content)</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Output Format</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">`.docx` (Office Open XML standard)</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Maximum File Size</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">100 MB per upload</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Processing Engine</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Headless LibreOffice via Python Backend</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Data Retention</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">0 minutes (Auto-deleted completely on download)</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">OCR Capabilities</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">No (Image-only scanned PDFs will remain images inside the Word file)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">Platform Compatibility</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">Works on Windows, macOS, Linux, iOS, and Android</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <hr className="my-8 border-slate-200 dark:border-slate-700" />
                    
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p><strong>Meta Title:</strong> Free PDF to Word Converter Online | Real .DOCX Files</p>
                        <p><strong>Meta Description:</strong> Convert your PDF to an editable Word document instantly. Our free online PDF to Word converter uses LibreOffice to preserve your tables, formatting, and layout.</p>
                        <p><strong>Primary Keyword:</strong> pdf to word converter online free</p>
                        <p><strong>Word Count:</strong> 815</p>
                        <p><strong>Estimated Reading Time:</strong> 4 min read</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
