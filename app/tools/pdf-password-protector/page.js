'use client';
import { useState, useRef, useCallback } from 'react';
import {
  Lock, Upload, Download, Shield, Eye, EyeOff, FileText,
  Loader2, Check, AlertTriangle, KeyRound, X, Link2, Copy,
  RefreshCw, Clock, BarChart2, Share2, CheckCircle2
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.omniwebkit.com';
const ENDPOINT = `${API}/api/v1/tools/pdf-protect`;

/* ── Styles ── */
const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inp  = 'w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition';
const lbl  = 'text-xs font-black uppercase tracking-wide text-slate-400 mb-1.5 block';

/* ── Helpers ── */
function fmtSize(b) {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function daysLeft(ts) {
  if (!ts) return 0;
  return Math.max(0, Math.ceil((ts * 1000 - Date.now()) / 86400000));
}

/* ── Password strength ── */
function getStrength(pwd) {
  if (!pwd) return { label: '', color: 'bg-slate-300', text: 'text-slate-400', pct: 0 };
  let s = 0;
  if (pwd.length >= 8) s++;
  if (pwd.length >= 12) s++;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd)) s++;
  if (/[^a-zA-Z\d]/.test(pwd)) s++;
  const levels = [
    { label: 'Very Weak',  color: 'bg-red-500',     text: 'text-red-500',     pct: 20 },
    { label: 'Weak',       color: 'bg-orange-500',   text: 'text-orange-500',  pct: 40 },
    { label: 'Fair',       color: 'bg-yellow-500',   text: 'text-yellow-500',  pct: 60 },
    { label: 'Strong',     color: 'bg-emerald-400',  text: 'text-emerald-500', pct: 80 },
    { label: 'Very Strong',color: 'bg-emerald-500',  text: 'text-emerald-600', pct: 100 },
  ];
  return levels[Math.min(s, 4)];
}

function genPwd() {
  const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_+-=';
  return Array.from({ length: 16 }, () => c[Math.floor(Math.random() * c.length)]).join('');
}

/* ── Toggle ── */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} type="button"
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-rose-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/* ── Copy button ── */
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} title="Copy link"
      className="flex-shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-slate-500 hover:text-rose-600 transition">
      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

/* ══ Main ══════════════════════════════════════════════════════════════════ */
export default function PdfPasswordProtector() {
  const [file, setFile]           = useState(null);
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [perms, setPerms]         = useState({ print: true, copy: false, modify: false, annotate: false });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [dragOver, setDragOver]   = useState(false);
  const [result, setResult]       = useState(null);   // {job_id, share_token, protected_name, output_size, expires_at, download_count}
  const [dlCount, setDlCount]     = useState(null);   // live counter from /info
  const [refreshing, setRefreshing] = useState(false);
  const fileRef = useRef(null);

  /* share URL built from current host (proxied through site) or direct API */
  const shareUrl = result
    ? `${API}/api/v1/tools/pdf-protect/share/${result.share_token}`
    : '';

  const handleFile = (f) => {
    if (f?.type === 'application/pdf') { setFile(f); setResult(null); setError(''); }
    else if (f) setError('Please upload a PDF file');
  };

  const autoGenPwd = () => { const p = genPwd(); setPassword(p); setConfirm(p); setShowPwd(true); };

  const protect = async () => {
    if (!file || !password) return;
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 4)  { setError('Password must be at least 4 characters'); return; }

    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('password', password);
      fd.append('allow_print',    String(perms.print));
      fd.append('allow_copy',     String(perms.copy));
      fd.append('allow_modify',   String(perms.modify));
      fd.append('allow_annotate', String(perms.annotate));

      const res = await fetch(`${ENDPOINT}/`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setDlCount(data.download_count ?? 0);
    } catch (e) {
      setError(e.message || 'Encryption failed — please try again');
    } finally {
      setLoading(false);
    }
  };

  const refreshInfo = async () => {
    if (!result?.share_token) return;
    setRefreshing(true);
    try {
      const res = await fetch(`${ENDPOINT}/info/${result.share_token}`);
      if (res.ok) {
        const d = await res.json();
        setDlCount(d.download_count ?? 0);
      }
    } finally { setRefreshing(false); }
  };

  const strength = getStrength(password);
  const isValid  = file && password && password === confirm && password.length >= 4;
  const days     = result ? daysLeft(result.expires_at) : 0;

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
          <p className="text-slate-600 dark:text-slate-400 text-lg">Server-side AES-256 encryption — real password protection, shareable links &amp; 7-day cloud storage</p>
        </div>

        {/* AES badge */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {['AES-256 Encryption', 'Server-Side Processing', 'Shareable Links'].map(b => (
            <span key={b} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <Check className="w-3 h-3" />{b}
            </span>
          ))}
        </div>

        <div className={`${card} p-6`}>

          {/* Upload zone */}
          <div
            onClick={() => !result && fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`p-8 border-2 border-dashed rounded-2xl text-center transition mb-6 ${result ? 'cursor-default' : 'cursor-pointer'} ${
              dragOver ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/10'
              : file    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/10'
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
                {!result && (
                  <button onClick={e => { e.stopPropagation(); setFile(null); setError(''); }}
                    className="ml-2 p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">Drop PDF here or click to upload</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PDF files only · Max 100 MB</p>
              </>
            )}
          </div>

          {/* Password fields */}
          {!result && (
            <>
              <div className="space-y-4 mb-5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={lbl.replace('mb-1.5 block', '')}>Password</label>
                    <button onClick={autoGenPwd} className="flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 transition">
                      <KeyRound className="w-3 h-3" />Generate Strong
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPwd ? 'text' : 'password'} value={password}
                      onChange={e => setPassword(e.target.value)} placeholder="Enter password (min 4 chars)" className={inp} />
                    <button onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`} style={{ width: `${strength.pct}%` }} />
                      </div>
                      <span className={`text-[10px] font-bold ${strength.text}`}>{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className={lbl}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type={showPwd ? 'text' : 'password'} value={confirm}
                      onChange={e => setConfirm(e.target.value)} placeholder="Confirm password"
                      className={`${inp} pr-4 ${confirm && confirm !== password ? '!border-red-400 !ring-red-400' : ''}`} />
                  </div>
                  {confirm && confirm !== password && (
                    <p className="text-xs text-red-500 font-bold mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div className="mb-5">
                <p className={lbl}>Document Permissions</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'print',    label: 'Allow Printing',     desc: 'Users can print the PDF' },
                    { key: 'copy',     label: 'Allow Copying',      desc: 'Users can copy text/images' },
                    { key: 'modify',   label: 'Allow Editing',      desc: 'Users can modify content' },
                    { key: 'annotate', label: 'Allow Annotations',  desc: 'Users can add comments' },
                  ].map(p => (
                    <div key={p.key} className={`flex items-center justify-between p-3 rounded-xl border transition ${perms[p.key]
                        ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700'}`}>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                      </div>
                      <Toggle checked={perms[p.key]} onChange={v => setPerms(pr => ({ ...pr, [p.key]: v }))} />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button onClick={protect} disabled={!isValid || loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Encrypting with AES-256…</> : <><Lock className="w-5 h-5" />Protect PDF</>}
              </button>
            </>
          )}

          {/* ── Result panels ── */}
          {result && (
            <div className="space-y-4">

              {/* Success banner */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-700 rounded-xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-800/40 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">PDF encrypted with AES-256</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {result.protected_name} · {fmtSize(result.output_size)}
                  </p>
                </div>
              </div>

              {/* Download panel */}
              <div className={`${card} p-4`}>
                <p className="text-xs font-black uppercase tracking-wide text-slate-400 mb-3">Direct Download</p>
                <a
                  href={`${ENDPOINT}/download/${result.job_id}`}
                  download={result.protected_name}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-bold shadow-lg shadow-red-500/20 transition flex items-center justify-center gap-2 text-sm">
                  <Download className="w-5 h-5" />Download Protected PDF
                </a>
                <p className="text-[11px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />Available for {days} more day{days !== 1 ? 's' : ''} (expires {fmtDate(result.expires_at)})
                </p>
              </div>

              {/* Share link panel */}
              <div className={`${card} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">Shareable Link</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-300">
                    <BarChart2 className="w-3 h-3" />
                    {dlCount ?? result.download_count} download{(dlCount ?? result.download_count) !== 1 ? 's' : ''}
                    <button onClick={refreshInfo} disabled={refreshing} className="ml-1 text-slate-400 hover:text-rose-500 transition disabled:opacity-50">
                      <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </span>
                </div>

                <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mb-3">
                  <Link2 className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
                  <input readOnly value={shareUrl}
                    className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 outline-none min-w-0 font-mono"
                    onFocus={e => e.target.select()} />
                  <CopyBtn text={shareUrl} />
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <Share2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Anyone with this link can download the protected PDF. Link auto-expires in <strong>{days} day{days !== 1 ? 's' : ''}</strong>.</span>
                </div>
              </div>

              {/* Encrypt another */}
              <button onClick={() => { setFile(null); setResult(null); setError(''); setPassword(''); setConfirm(''); setDlCount(null); }}
                className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400 transition flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />Protect Another PDF
              </button>
            </div>
          )}
        </div>

        {/* SEO Content */}
        <div className="mt-10 space-y-5">
          <div className={`${card} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online PDF Password Protector — Real AES-256 Server-Side Encryption</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Unlike browser-based tools that use weak JavaScript encryption, this tool sends your PDF to our secure server where it is encrypted using <strong>AES-256 via pikepdf/QPDF</strong> — the same engine used by Adobe Acrobat. The resulting PDF will prompt for a password in every standard viewer including Adobe Reader, Chrome, Firefox, and macOS Preview.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              After encryption, you get two options: a <strong>direct download link</strong> for yourself, and a <strong>shareable link</strong> you can send to anyone. The share link tracks how many times the file has been downloaded. Both links automatically expire after <strong>7 days</strong> — after which the file is permanently deleted from our servers.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              You can also restrict document permissions: prevent printing, block text copying, disable editing, and disallow annotations — all enforced at the encryption level.
            </p>
          </div>

          <div className={`${card} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Why is server-side encryption better?', a: 'Browser-based PDF encryption (pdf-lib, ilovepdf clones) does not apply real AES encryption — most PDF viewers open those files without asking for a password. Our server uses pikepdf/QPDF which applies true AES-256 encryption that every standard PDF viewer enforces.' },
                { q: 'Is my file stored permanently?', a: 'No. Your original and encrypted PDFs are stored on our server for a maximum of 7 days. After that they are permanently and automatically deleted by our cleanup system. We never share your files with third parties.' },
                { q: 'What is the shareable link?', a: 'After encryption you receive a unique share link. Anyone who opens this link will automatically download the password-protected PDF. The link tracks download count and expires after 7 days.' },
                { q: 'What encryption standard is used?', a: 'AES-256 with PDF revision 6 (the highest level), equivalent to what Adobe Acrobat applies. The encryption is handled by pikepdf which wraps the QPDF C++ library — a battle-tested, production-grade PDF engine.' },
                { q: 'What if I forget the password?', a: 'There is no way to recover the password — AES-256 encryption cannot be reversed without it. Always save your password in a secure password manager. Keep the original unprotected file as a backup.' },
                { q: 'Do document permissions actually work?', a: 'Yes. Permissions (printing, copying, editing, annotations) are set at the QPDF encryption layer and enforced by compliant PDF viewers. Note that a determined user with the owner password or a PDF editor tool could still bypass them — permissions are a deterrent, not a hard lock.' },
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
