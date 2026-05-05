'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Loader2, Check, AlertTriangle, Lock, Unlock, Shield, Eye, EyeOff, Server, Monitor, RefreshCw, FileText, X } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from '@/lib/api-config';

const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const SERVER_THRESHOLD = 5 * 1024 * 1024;
const POLL_MS = 2000;

function fmtSize(b) {
    if (!b) return '0 B';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}

async function pollJob(jobId, onProgress, signal) {
    while (true) {
        if (signal?.aborted) throw new Error('Cancelled');
        await new Promise(r => setTimeout(r, POLL_MS));
        const res = await fetch(`${API_V1}/tools/unlock-pdf/status/${jobId}`, { signal });
        if (!res.ok) throw new Error('Status check failed');
        const d = await res.json();
        onProgress(Number(d.progress) || 0);
        if (d.status === 'done') return d;
        if (d.status === 'error') throw new Error(d.error || 'Processing failed');
    }
}

export default function UnlockPdf() {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [status, setStatus] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [mode, setMode] = useState('auto');
    const [processTime, setProcessTime] = useState(0);
    const fileRef = useRef(null);
    const abortRef = useRef(null);
    const timerRef = useRef(null);

    const actualMode = mode === 'auto' ? (file && file.size > SERVER_THRESHOLD ? 'server' : 'browser') : mode;

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.toLowerCase().endsWith('.pdf')) { setError('Please select a PDF file'); return; }
        if (f.size > 200 * 1024 * 1024) { setError('File too large (max 200 MB)'); return; }
        setFile(f); setStatus('idle'); setError(''); setResult(null); setProgress(0);
    };

    const reset = () => {
        setFile(null); setPassword(''); setStatus('idle'); setError(''); setResult(null); setProgress(0); setProcessTime(0);
        if (abortRef.current) abortRef.current.abort();
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const startTimer = () => {
        setProcessTime(0);
        const start = Date.now();
        timerRef.current = setInterval(() => setProcessTime(((Date.now() - start) / 1000).toFixed(1)), 200);
    };
    const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

    const unlockBrowser = useCallback(async () => {
        setStatus('processing'); setProgress(10); startTimer();
        try {
            const { PDFDocument } = await import('pdf-lib');
            setProgress(30);
            const bytes = await file.arrayBuffer();
            setProgress(50);
            let doc;
            try {
                doc = await PDFDocument.load(bytes, { password: password || undefined, ignoreEncryption: true });
            } catch (e) {
                if (e.message?.includes('password') || e.message?.includes('encrypt')) {
                    throw new Error('Incorrect password or unsupported encryption. Try server-side processing for stronger encryption.');
                }
                throw e;
            }
            setProgress(70);
            const newDoc = await PDFDocument.create();
            const pages = await newDoc.copyPages(doc, doc.getPageIndices());
            pages.forEach(p => newDoc.addPage(p));
            setProgress(85);
            const saved = await newDoc.save();
            setProgress(100);
            const blob = new Blob([saved], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const stem = file.name.replace(/\.pdf$/i, '');
            setResult({ url, name: `${stem}_unlocked.pdf`, size: saved.byteLength });
            setStatus('done');
        } catch (e) {
            setError(e.message || 'Failed to unlock PDF');
            setStatus('error');
        } finally { stopTimer(); }
    }, [file, password]);

    const unlockServer = useCallback(async () => {
        setStatus('uploading'); setProgress(0); startTimer();
        abortRef.current = new AbortController();
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('password', password);
            const uploadRes = await fetch(`${API_V1}/tools/unlock-pdf`, { method: 'POST', body: fd, signal: abortRef.current.signal });
            if (!uploadRes.ok) {
                const errData = await uploadRes.json().catch(() => ({}));
                throw new Error(errData.detail || `Server error ${uploadRes.status}`);
            }
            const ct = uploadRes.headers.get('content-type') || '';
            if (ct.includes('application/pdf')) {
                const blob = await uploadRes.blob();
                const url = URL.createObjectURL(blob);
                const stem = file.name.replace(/\.pdf$/i, '');
                setResult({ url, name: `${stem}_unlocked.pdf`, size: blob.size });
                setStatus('done'); setProgress(100); stopTimer(); return;
            }
            const data = await uploadRes.json();
            if (data.mode === 'queued' && data.job_id) {
                setStatus('processing'); setProgress(20);
                const final = await pollJob(data.job_id, (p) => setProgress(Math.max(20, p)), abortRef.current.signal);
                const dlRes = await fetch(`${API_V1}/tools/unlock-pdf/download/${data.job_id}`, { signal: abortRef.current.signal });
                if (!dlRes.ok) throw new Error('Download failed');
                const blob = await dlRes.blob();
                const url = URL.createObjectURL(blob);
                const stem = file.name.replace(/\.pdf$/i, '');
                setResult({ url, name: `${stem}_unlocked.pdf`, size: blob.size });
                setStatus('done'); setProgress(100);
                fetch(`${API_V1}/tools/unlock-pdf/cleanup/${data.job_id}`, { method: 'DELETE' }).catch(() => {});
            }
        } catch (e) {
            if (e.name !== 'AbortError') { setError(e.message || 'Server processing failed'); setStatus('error'); }
        } finally { stopTimer(); }
    }, [file, password]);

    const startUnlock = () => {
        setError('');
        if (actualMode === 'server') unlockServer();
        else unlockBrowser();
    };

    const downloadResult = () => {
        if (!result) return;
        const a = document.createElement('a');
        a.href = result.url; a.download = result.name; a.click();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: 'Unlock PDF' }]} />

                {/* Hero */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-4">
                        <Unlock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Unlock PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Remove PDF password security, giving you the freedom to use your PDFs as you want.</p>
                </div>

                {/* Mode Selector */}
                <div className={`${card} p-4 mb-6`}>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Processing:</span>
                        {[{ id: 'auto', label: 'Auto', icon: RefreshCw }, { id: 'browser', label: 'Browser', icon: Monitor }, { id: 'server', label: 'Server', icon: Server }].map(m => (
                            <button key={m.id} onClick={() => setMode(m.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === m.id ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-300 dark:ring-emerald-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                <m.icon className="w-3.5 h-3.5" />{m.label}
                            </button>
                        ))}
                        {file && <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">Using: {actualMode === 'browser' ? '🖥️ Browser' : '☁️ Server'}</span>}
                    </div>
                </div>

                {/* Upload */}
                {!file && status === 'idle' && (
                    <div onClick={() => fileRef.current?.click()} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                        className={`${card} p-12 text-center cursor-pointer transition-all group ${dragOver ? 'ring-2 ring-emerald-400 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10' : 'hover:border-emerald-300 dark:hover:border-emerald-700'}`}>
                        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                        <div className="w-16 h-16 mx-auto mb-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload Locked PDF</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-4">Drag & drop your password-protected PDF, or click to browse</p>
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">
                            <Lock className="w-4 h-4" /> Select PDF
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">Small files are unlocked in your browser. Large files use our secure server queue.</p>
                    </div>
                )}

                {/* File Selected */}
                {file && status === 'idle' && (
                    <div className={`${card} p-6 space-y-5`}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Lock className="w-6 h-6 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{fmtSize(file.size)}</p>
                            </div>
                            <button onClick={reset} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">PDF Password <span className="text-slate-400 font-normal">(leave empty if only permissions are restricted)</span></label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password if required…"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all pr-12" />
                                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button onClick={startUnlock}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold text-lg shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]">
                            <Unlock className="w-5 h-5" /> Unlock PDF
                        </button>
                    </div>
                )}

                {/* Processing */}
                {(status === 'uploading' || status === 'processing') && (
                    <div className={`${card} p-8 text-center`}>
                        <Loader2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{status === 'uploading' ? 'Uploading to server…' : 'Removing password protection…'}</h3>
                        <div className="w-full max-w-md mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{progress}% • {processTime}s elapsed</p>
                    </div>
                )}

                {/* Done */}
                {status === 'done' && result && (
                    <div className={`${card} p-8 text-center`}>
                        <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">PDF Unlocked Successfully!</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-2">Unlocked in {processTime}s • {fmtSize(result.size)}</p>
                        <div className="flex items-center justify-center gap-3 mt-5">
                            <button onClick={downloadResult} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold shadow-lg transition-all">
                                <Download className="w-5 h-5" /> Download Unlocked PDF
                            </button>
                            <button onClick={reset} className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">
                                <RefreshCw className="w-4 h-4" /> Unlock Another
                            </button>
                        </div>
                    </div>
                )}

                {/* Error */}
                {status === 'error' && (
                    <div className={`${card} p-8 text-center border-red-200 dark:border-red-800`}>
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unlock Failed</h3>
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button onClick={reset} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">Try Again</button>
                    </div>
                )}

                {error && status === 'idle' && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid sm:grid-cols-3 gap-4 mt-10">
                    {[
                        { icon: Shield, title: 'Private & Secure', desc: 'Small files are processed entirely in your browser. Your documents never leave your device.' },
                        { icon: Server, title: 'Handles Any Size', desc: 'Large or heavily encrypted files are processed via our secure server queue for reliable results.' },
                        { icon: Unlock, title: 'Full Freedom', desc: 'Removes all restrictions — print, copy, edit, and use your PDF without limitations.' },
                    ].map((c, i) => (
                        <div key={i} className={`${card} p-5`}>
                            <c.icon className="w-8 h-8 text-emerald-500 mb-3" />
                            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{c.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Content Section */}
                <div className={`${card} p-6 sm:p-8 mt-8`}>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Unlock a Password-Protected PDF</h2>
                    <div className="space-y-4 text-slate-600 dark:text-slate-400">
                        <p>Password-protected PDFs come in two forms: <strong className="text-slate-800 dark:text-slate-200">user passwords</strong> (required to open the file) and <strong className="text-slate-800 dark:text-slate-200">owner passwords</strong> (that restrict printing, copying, or editing). Our tool handles both.</p>
                        <ol className="list-decimal list-inside space-y-2">
                            <li><strong className="text-slate-800 dark:text-slate-200">Upload your locked PDF</strong> — drag and drop or click to browse.</li>
                            <li><strong className="text-slate-800 dark:text-slate-200">Enter the password</strong> — if the PDF requires one to open. Leave blank for permission-only locks.</li>
                            <li><strong className="text-slate-800 dark:text-slate-200">Click Unlock</strong> — the tool removes all security restrictions.</li>
                            <li><strong className="text-slate-800 dark:text-slate-200">Download</strong> — your unrestricted PDF is ready to use freely.</li>
                        </ol>
                        <p>Small files (under 5 MB) are unlocked instantly in your browser using advanced document processing — no upload needed. Larger files are sent to our secure processing queue, which handles millions of requests without downtime. Files are automatically deleted after processing.</p>
                    </div>
                </div>

                {/* FAQ */}
                <div className={`${card} p-6 sm:p-8 mt-6`}>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Frequently Asked Questions</h2>
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {[
                            { q: 'Can this tool unlock any PDF?', a: 'Yes — it removes both user passwords (open password) and owner passwords (restriction password). You must know the open password if one is set; we cannot bypass encryption without it.' },
                            { q: 'Is my PDF safe?', a: 'Absolutely. Small files are processed entirely in your browser and never leave your device. Server-processed files are automatically deleted after you download the result.' },
                            { q: 'What restrictions does it remove?', a: 'All of them — printing, copying text, editing, form filling, and annotation restrictions are fully removed from the unlocked PDF.' },
                            { q: 'Do I need to know the password?', a: 'Only if the PDF has an "open" password (required to view the file). If the PDF opens normally but restricts printing or copying, you can unlock it without entering any password.' },
                        ].map((f, i) => (
                            <div key={i} className="py-4">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.q}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
