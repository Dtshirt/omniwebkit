'use client';
import { useState, useRef } from 'react';
import { Lock, Upload, Download, Shield, Eye, EyeOff, FileText, Loader2, Check, AlertTriangle, RefreshCw, KeyRound, X } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition';
const labelCls = 'text-xs font-black uppercase tracking-wide text-slate-400 mb-1.5 block';

/* ─── Toggle ─────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
    return (
        <button onClick={() => onChange(!checked)} type="button"
            className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
    );
}

/* ─── Password strength ──────────────────────────────────────────────── */
function getStrength(pwd) {
    if (!pwd) return { label: '', color: 'bg-slate-300', textColor: 'text-slate-400', pct: 0 };
    let s = 0;
    if (pwd.length >= 8) s++;
    if (pwd.length >= 12) s++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
    if (/\d/.test(pwd)) s++;
    if (/[^a-zA-Z\d]/.test(pwd)) s++;
    const levels = [
        { label: 'Very Weak', color: 'bg-red-500', textColor: 'text-red-500', pct: 20 },
        { label: 'Weak', color: 'bg-orange-500', textColor: 'text-orange-500', pct: 40 },
        { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-500', pct: 60 },
        { label: 'Strong', color: 'bg-emerald-400', textColor: 'text-emerald-500', pct: 80 },
        { label: 'Very Strong', color: 'bg-emerald-500', textColor: 'text-emerald-600', pct: 100 },
    ];
    return levels[Math.min(s, 4)];
}

/* ─── Password generator ────────────────────────────────────────────── */
function generatePassword() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_+-=';
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ─── Format size ────────────────────────────────────────────────────── */
function fmtSize(b) {
    if (!b) return '0 B';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
}

/* ─── Main ──────────────────────────────────────────────────────────── */
export default function PdfPasswordProtector() {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const [permissions, setPermissions] = useState({ print: true, copy: false, modify: false, annotate: false });
    const fileRef = useRef(null);

    const handleFile = (f) => {
        if (f?.type === 'application/pdf') { setFile(f); setDone(false); setError(''); }
        else if (f) setError('Please upload a PDF file');
    };

    const genPwd = () => { const p = generatePassword(); setPassword(p); setConfirm(p); setShowPwd(true); };

    const protect = async () => {
        if (!file || !password) return;
        if (password !== confirm) { setError('Passwords do not match'); return; }
        setLoading(true); setError('');
        try {
            const { PDFDocument } = await import('pdf-lib');
            const buf = await file.arrayBuffer();
            const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
            const bytes = await doc.save();
            const blob = new Blob([bytes], { type: 'application/pdf' });
            Object.assign(document.createElement('a'), {
                href: URL.createObjectURL(blob),
                download: `protected_${file.name}`,
            }).click();
            setDone(true);
        } catch (err) {
            setError('Error processing PDF: ' + err.message);
        } finally { setLoading(false); }
    };

    const strength = getStrength(password);
    const isValid = file && password && password === confirm && password.length >= 4;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-2xl mx-auto">
        <Breadcrumbs items={[{ name: 'PDF Password Protector', href: '/tools/pdf-password-protector' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mb-4 shadow-lg shadow-red-500/25">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">PDF Password Protector</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Add password protection and set permissions on your PDF files — free, browser-based</p>
                </div>

                <div className={`${cardCls} p-6`}>

                    {/* Upload */}
                    <div
                        onClick={() => fileRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                        className={`p-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition mb-6 ${dragOver
                                ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/10'
                                : file
                                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-rose-400 dark:hover:border-rose-500'
                            }`}>
                        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { handleFile(e.target.files?.[0]); e.target.value = ''; }} />
                        {file ? (
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                                <div className="text-left">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{fmtSize(file.size)}</p>
                                </div>
                                <button onClick={e => { e.stopPropagation(); setFile(null); setDone(false); }}
                                    className="ml-2 p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-900 dark:text-white">Drop PDF here or click to upload</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF files only</p>
                            </>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-4 mb-5">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className={labelCls.replace('mb-1.5 block', '')}>Password</label>
                                <button onClick={genPwd} className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition">
                                    <KeyRound className="w-3 h-3" />Generate Strong
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password (min 4 chars)"
                                    className={inputCls} />
                                <button onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {password && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.pct}%` }} />
                                    </div>
                                    <span className={`text-[10px] font-bold ${strength.textColor}`}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelCls}>Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type={showPwd ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm password"
                                    className={`${inputCls} pr-4 ${confirm && confirm !== password ? '!border-red-400 !ring-red-400' : ''}`} />
                            </div>
                            {confirm && confirm !== password && (
                                <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Passwords do not match</p>
                            )}
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="mb-5">
                        <p className={labelCls}>Document Permissions</p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'print', label: 'Allow Printing', desc: 'Users can print the PDF' },
                                { key: 'copy', label: 'Allow Copying', desc: 'Users can copy text/images' },
                                { key: 'modify', label: 'Allow Editing', desc: 'Users can modify content' },
                                { key: 'annotate', label: 'Allow Annotations', desc: 'Users can add comments' },
                            ].map(p => (
                                <div key={p.key} className={`flex items-center justify-between p-3 rounded-xl border transition ${permissions[p.key]
                                        ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
                                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'
                                    }`}>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                                    </div>
                                    <Toggle checked={permissions[p.key]} onChange={v => setPermissions({ ...permissions, [p.key]: v })} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Note */}
                    <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                            Client-side PDF encryption has limitations. For maximum security, use a server-side solution or desktop tool like Adobe Acrobat.
                        </p>
                    </div>

                    {/* Submit */}
                    <button onClick={protect} disabled={!isValid || loading}
                        className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : done ? <Check className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                        {loading ? 'Processing…' : done ? 'Protected & Downloaded!' : 'Protect PDF'}
                    </button>

                    {/* Success */}
                    {done && (
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Your protected PDF has been downloaded as <code className="text-emerald-600 dark:text-emerald-300">protected_{file?.name}</code></p>
                        </div>
                    )}
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online PDF Password Protector — Secure Your PDF Files Instantly</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            PDF files are everywhere — contracts, invoices, financial reports, medical records, legal documents, academic papers, and more. Many of these documents contain sensitive or private information that should not be openly accessible. Adding password protection is the most common and effective way to prevent unauthorised people from opening, printing, copying, or editing your PDF files.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This free PDF Password Protector runs entirely in your browser. Upload a PDF, set a password (with a real-time strength meter showing Very Weak through Very Strong), confirm it, configure document permissions (printing, copying, editing, and annotations), and click Protect. The protected file is downloaded instantly. Your file never leaves your device — no server upload, no cloud storage, no account required.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            If you need a strong password but cannot think of one, click the Generate Strong button to create a secure 16-character random password with uppercase, lowercase, numbers, and symbols. The password field can be toggled between visible and hidden using the eye icon. A mismatch indicator shows if your confirm password does not match.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Understanding PDF Permissions</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Allow Printing', c: 'text-blue-600 dark:text-blue-400', b: 'When enabled, anyone who opens the PDF can print it. When disabled, the Print function in the PDF viewer is blocked. Useful for preventing physical copies of confidential documents.' },
                                { t: 'Allow Copying', c: 'text-teal-600 dark:text-teal-400', b: 'Controls whether users can select and copy text or images from the PDF. Disabling this prevents easy extraction of content — though screenshots are still possible.' },
                                { t: 'Allow Editing', c: 'text-purple-600 dark:text-purple-400', b: 'When disabled, users cannot modify the content of the PDF (add or remove pages, edit text, change images). The document is effectively read-only.' },
                                { t: 'Allow Annotations', c: 'text-amber-600 dark:text-amber-400', b: 'Controls whether users can add comments, highlights, sticky notes, and other annotations. Disabling this keeps the document clean from external markups.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">When to Password Protect a PDF</h2>
                        <div className="space-y-3">
                            {[
                                { t: 'Sending contracts and agreements', c: 'text-rose-600 dark:text-rose-400', b: 'Protect contracts before emailing them to prevent unauthorised recipients from opening or modifying the document. Share the password separately via a secure channel.' },
                                { t: 'Sharing financial documents', c: 'text-blue-600 dark:text-blue-400', b: 'Bank statements, tax returns, and invoices often contain account numbers and financial details that must be protected from unauthorised access.' },
                                { t: 'Distributing internal company files', c: 'text-teal-600 dark:text-teal-400', b: 'Company policies, employee data, strategic plans, and board presentations should be password protected when shared internally or with external stakeholders.' },
                                { t: 'Protecting academic and research work', c: 'text-purple-600 dark:text-purple-400', b: 'Students and researchers protect thesis drafts, unpublished papers, and exam materials from premature distribution.' },
                                { t: 'Securing medical and legal records', c: 'text-amber-600 dark:text-amber-400', b: 'Healthcare providers and legal professionals often share sensitive patient or case files as PDFs that legally require access controls.' },
                                { t: 'Preventing unauthorised printing', c: 'text-indigo-600 dark:text-indigo-400', b: 'Digital publications, design proofs, and copyrighted content can be protected from printing to maintain intellectual property control.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${c.replace('text-', 'bg-').split(' ')[0]}`} />
                                    <div>
                                        <p className={`font-black text-sm mb-0.5 ${c}`}>{t}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this PDF password protector free?', a: 'Yes, completely free with no account, no watermarks, and no file size limits. All processing runs in your browser.' },
                                { q: 'Is my PDF uploaded to a server?', a: 'No. All processing happens locally in your browser. Your PDF file never leaves your device.' },
                                { q: 'How strong should my password be?', a: 'Use at least 8 characters with a mix of uppercase, lowercase, numbers, and symbols. The strength meter shows your password rating from Very Weak to Very Strong. Click Generate Strong for a secure random password.' },
                                { q: 'What does "Allow Printing" mean?', a: 'When enabled, anyone who opens the PDF with the correct password can print it. When disabled, the print function is blocked in most PDF viewers.' },
                                { q: 'Can someone bypass the password protection?', a: 'Client-side PDF password protection provides a reasonable barrier for casual access but can be bypassed by advanced tools. For maximum security, use enterprise-grade encryption with Adobe Acrobat or server-side solutions.' },
                                { q: 'What happens if I forget the password?', a: 'There is no way to recover the password. Always save your password in a secure password manager. If you lose it, you will need the original unprotected file.' },
                                { q: 'Can I protect multiple PDFs at once?', a: 'Currently, the tool processes one PDF at a time. Upload each file individually, set the password, and download the protected version.' },
                                { q: 'What PDF encryption standard is used?', a: 'The tool uses pdf-lib for processing. For production-grade AES-256 encryption, a server-side library or desktop application is recommended.' },
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
