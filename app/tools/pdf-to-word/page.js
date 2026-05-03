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
                <div className="mt-10 space-y-5">

                    <div className={`${card} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Real PDF to Word Conversion — Not Just Text Extraction</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Most free PDF to Word tools just extract raw text from the PDF and paste it into a .doc file. Formatting, tables, images, columns — all gone. This tool is fundamentally different. It uses LibreOffice, the same rendering engine used by millions of professionals, running in headless mode on the server.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            LibreOffice reads your PDF the same way a full office suite would, then renders it into a proper .docx file. This means tables stay as tables, fonts are mapped correctly, images are embedded, and page layout is preserved as closely as possible. The output opens natively in Microsoft Word, Google Docs, and any modern word processor.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Upload your PDF, wait a few seconds while LibreOffice processes it on the server, and download a real .docx file. Files are automatically deleted from the server after download. No watermarks, no account required, no limits on conversion quality.
                        </p>
                    </div>

                    <div className={`${card} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Why Server-Side Beats Browser-Based</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Real .docx output', c: 'text-blue-600 dark:text-blue-400', b: 'LibreOffice produces a proper OOXML .docx file — not an HTML file renamed to .doc. Opens natively in Word without compatibility mode.' },
                                { t: 'Formatting preserved', c: 'text-indigo-600 dark:text-indigo-400', b: 'Tables, columns, text styling, embedded images, headers, footers — all preserved by the LibreOffice rendering engine.' },
                                { t: 'Any PDF type', c: 'text-teal-600 dark:text-teal-400', b: 'Works with text-based PDFs, form PDFs, and PDFs with mixed content. Complex layouts are handled by the same engine that powers LibreOffice Writer.' },
                                { t: 'Fast processing', c: 'text-amber-600 dark:text-amber-400', b: 'Server-side LibreOffice processes PDFs in seconds, not minutes. Much faster than browser-based alternatives.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${card} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this PDF to Word converter free?', a: 'Yes, completely free. No account, no watermarks, no conversion limits.' },
                                { q: 'Is this browser-based or server-side?', a: 'Server-side. Your PDF is uploaded to a server running LibreOffice, which produces a real .docx file. This gives proper conversion with formatting preservation — unlike browser-based tools that only extract raw text.' },
                                { q: 'What output format does it produce?', a: 'A real .docx file (Office Open XML) that opens natively in Microsoft Word, Google Docs, LibreOffice, and all modern word processors. No compatibility mode needed.' },
                                { q: 'Does it preserve formatting?', a: 'Yes — tables, fonts, images, headers, footers, and page layout are preserved by LibreOffice. Complex multi-column layouts may have minor differences.' },
                                { q: 'Does it handle scanned/image PDFs?', a: 'LibreOffice will convert them but the result will contain the images, not editable text. For OCR (converting images to text), you would need a separate OCR tool.' },
                                { q: 'Are my files stored on the server?', a: 'Temporarily during conversion. Files are deleted from the server immediately after you download the result.' },
                                { q: 'What is the maximum file size?', a: 'Up to 100 MB per PDF file.' },
                                { q: 'How is this different from the old version?', a: 'The old version used PDF.js in the browser to extract raw text and wrap it in an HTML file renamed to .doc. This new version uses LibreOffice on the server to produce a real .docx with proper formatting.' },
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
