'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Loader2, Check, AlertTriangle, Lock, Unlock, Shield, Eye, EyeOff, Server, Monitor, RefreshCw, FileText, X } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from '@/lib/api-config';

const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
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
    const [processTime, setProcessTime] = useState(0);
    const fileRef = useRef(null);
    const abortRef = useRef(null);
    const timerRef = useRef(null);

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
        unlockServer();
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
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">All files are processed securely using our high-performance server queue.</p>
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

                {/* ── SEO Content ── */}
                <div className="mt-16 prose-premium">
                    <div className="mb-8">
                        <h2>About the Tool</h2>
                        <p>
                            There are few things more frustrating than receiving an important document only to find you cannot print, copy, or highlight the text because it has been locked by the creator. That is why we built this reliable <strong>unlock pdf</strong> tool. We designed it to instantly strip away restrictions and give you full control back over your own files.
                        </p>
                        <p>
                            PDF encryption generally comes in two forms. The first is an "Owner Password" (which restricts copying, printing, and editing). If your document has this, our tool bypasses it instantly — no password required from you. The second is a "User Password" (which encrypts the file so it cannot even be opened). If your document has this, you will need to provide the password to open it, and our tool will permanently decrypt the file so you never have to type the password again.
                        </p>
                        <p>
                            Whether you are a paralegal dealing with restrictive court filings or a student trying to highlight lecture slides, this tool safely and permanently removes the encryption layer without altering a single pixel of your original document.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2>How to Use</h2>
                        <p>
                            Removing security restrictions should be fast and seamless. Here is the frictionless way to unlock your document:
                        </p>
                        <ol>
                            <li><strong>Upload your file:</strong> Drag your restricted PDF into the drop zone above. We support files up to 200 MB, covering almost any textbook or legal bundle.</li>
                            <li><strong>Provide the password (if necessary):</strong> If your file cannot be opened without a password, enter it into the text box. If your file opens normally but just won't let you print or copy, leave the password box completely blank.</li>
                            <li><strong>Unlock and download:</strong> Click the "Unlock PDF" button. The server will decrypt the file and instantly provide a clean, unrestricted version for you to download.</li>
                        </ol>
                        <p>
                            Once downloaded, your new file is permanently unlocked. You can freely edit, print, extract pages, or copy text without encountering any more error messages.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2>Privacy & Security Anchor</h2>
                        <p>
                            Because locked PDFs usually contain highly sensitive information like financial records or legal contracts, security is the absolute foundation of our conversion engine. 
                        </p>
                        <p>
                            When you upload a file, it is transmitted over a bank-grade encrypted connection. The decryption process happens entirely in isolated memory on our secure server cluster. We do not extract your text, we do not log your passwords, and we do not scan your data for AI training models.
                        </p>
                        <p>
                            The instant you download your unlocked file, our automated lifecycle protocol executes. Both your original encrypted file and the decrypted output are permanently purged from our servers within minutes. You retain absolute ownership of your data at every step.
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2>Features</h2>
                        <p>
                            Bypassing PDF encryption requires an incredibly robust server engine. Here is exactly what our system is doing under the hood:
                        </p>
                        <ul>
                            <li><strong>Owner Password Removal:</strong> Instantly strips away 128-bit and 256-bit AES encryption that restricts printing, text copying, page extraction, and form filling — without requiring the original password.</li>
                            <li><strong>User Password Decryption:</strong> Permanently removes the "open password" encryption. Once you supply the password once, the tool generates a clean file you can open freely forever.</li>
                            <li><strong>Zero Data Alteration:</strong> The engine only interacts with the encryption layer. Your document's layout, fonts, embedded images, and metadata remain exactly as the author intended.</li>
                            <li><strong>High-Performance Queue:</strong> Our infrastructure is built to handle massive 200 MB files that would normally crash standard browser-based decryption tools.</li>
                        </ul>
                    </div>

                    <div className="mb-8">
                        <h2>Technical Specifications</h2>
                        <p>
                            For IT professionals and security administrators who need to understand the exact parameters of our decryption engine, here is the technical breakdown:
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
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Supported Output</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Standard `.pdf` (Unencrypted)</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Maximum File Size</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">200 MB per upload</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Decryption Protocols Supported</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">RC4 (40-bit/128-bit), AES (128-bit/256-bit)</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Data Retention Policy</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Auto-deleted entirely post-download</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Owner Password Bypass</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Automatic (No password required)</td>
                                    </tr>
                                    <tr>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">User Password Decryption</td>
                                        <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Manual (Requires correct user password)</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <hr className="my-8 border-slate-200 dark:border-slate-700" />
                    
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p><strong>Meta Title:</strong> Unlock PDF Online Free | Remove Passwords Instantly</p>
                        <p><strong>Meta Description:</strong> Remove PDF passwords and printing restrictions instantly. Our free unlock pdf tool decrypts your secure files so you can copy, print, and edit without limits.</p>
                        <p><strong>Primary Keyword:</strong> unlock pdf</p>
                        <p><strong>Word Count:</strong> 850</p>
                        <p><strong>Estimated Reading Time:</strong> 4 min read</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
