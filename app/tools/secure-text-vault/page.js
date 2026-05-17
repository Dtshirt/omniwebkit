'use client';
import { useState } from 'react';
import { Lock, Unlock, Copy, Download, Shield, AlertCircle, CheckCircle2, Eye, EyeOff, Upload, Key, Check } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';

/* Toast */
function useToast() {
    const [msg, setMsg] = useState('');
    const [type, setType] = useState('ok');
    const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
    const el = msg ? (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
            }`}>
            {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}
        </div>
    ) : null;
    return { show, el };
}

/* ─── Constants ─────────────────────────────────────────────────────── */
const PROTECTED_MARKER = '§Ҩ';
const UNPROTECTED_MARKER = '¶Ӂ';
const CHUNK_DELIM = '$$X1$';
const METADATA_DELIM = '##M2#';
const FILE_SIGNATURE = 'STVAULT1.0';
const RECOVERY_DELIM = '##REC#';

const QUESTIONS_LIST = [
    "What is your mother's maiden name?", "What was the name of your first pet?",
    "What city were you born in?", "What is your favorite book?",
    "What was your childhood nickname?", "What is the name of your favorite teacher?",
    "What street did you grow up on?", "What is your father's middle name?",
    "What was the make of your first car?", "What is your favorite movie?",
];

/* ─── Crypto helpers ────────────────────────────────────────────────── */
const b2b64 = (b) => { const u = new Uint8Array(b); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s); };
const b64b = (s) => { const d = atob(s); const u = new Uint8Array(d.length); for (let i = 0; i < d.length; i++) u[i] = d.charCodeAt(i); return u.buffer; };
const chunk = (s) => { const c = []; let p = 0; while (p < s.length) { const sz = Math.floor(Math.random() * 8) + 4; c.push(s.slice(p, p + sz)); p += sz; } return c; };

const hashAns = async (a) => { const d = new TextEncoder().encode(a.toLowerCase().trim()); return b2b64(await crypto.subtle.digest('SHA-256', d)); };

const deriveKey = async (pw, salt) => {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
    return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, k, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};

const encPwAns = async (pw, ans) => {
    const d = new TextEncoder().encode(pw);
    const combined = ans.join('|').toLowerCase().trim();
    const s = crypto.getRandomValues(new Uint8Array(16));
    const k = await deriveKey(combined, s);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, d);
    return { ep: b2b64(enc), as: b2b64(s), ai: b2b64(iv) };
};

const decPwAns = async (ep, as, ai, ans) => {
    const combined = ans.join('|').toLowerCase().trim();
    const k = await deriveKey(combined, b64b(as));
    return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64b(ai) }, k, b64b(ep)));
};

const obfuscate = (salt, iv, enc, prot, rec = null) => {
    const m = prot ? PROTECTED_MARKER : UNPROTECTED_MARKER;
    let o = FILE_SIGNATURE + m + chunk(b2b64(salt)).join(CHUNK_DELIM) + METADATA_DELIM + chunk(b2b64(iv)).join(CHUNK_DELIM) + METADATA_DELIM + chunk(b2b64(enc)).join(CHUNK_DELIM);
    if (rec) o += RECOVERY_DELIM + btoa(JSON.stringify(rec));
    return o;
};

const deobfuscate = (o) => {
    if (!o.startsWith(FILE_SIGNATURE)) throw new Error('Invalid file: Not from Secure Text Vault');
    let d = o.slice(FILE_SIGNATURE.length);
    let prot = false;
    if (d.startsWith(PROTECTED_MARKER)) { prot = true; d = d.slice(PROTECTED_MARKER.length); }
    else if (d.startsWith(UNPROTECTED_MARKER)) { d = d.slice(UNPROTECTED_MARKER.length); }
    else throw new Error('Invalid format');
    let rec = null;
    if (d.includes(RECOVERY_DELIM)) { const p = d.split(RECOVERY_DELIM); d = p[0]; try { rec = JSON.parse(atob(p[1])); } catch { } }
    const p = d.split(METADATA_DELIM);
    if (p.length !== 3) throw new Error('Corrupted data');
    return { prot, salt: b64b(p[0].split(CHUNK_DELIM).join('')), iv: b64b(p[1].split(CHUNK_DELIM).join('')), enc: b64b(p[2].split(CHUNK_DELIM).join('')), rec };
};

/* ─── Component ─────────────────────────────────────────────────────── */
export default function SecureTextVault() {
    const [input, setInput] = useState('');
    const [pw, setPw] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('encrypt');
    const [showPw, setShowPw] = useState(false);
    const [busy, setBusy] = useState(false);
    const [fileName, setFileName] = useState('');
    const toast = useToast();

    // Password prompt modal
    const [pwModal, setPwModal] = useState(false);
    const [decPw, setDecPw] = useState('');

    // Recovery
    const [enableRec, setEnableRec] = useState(false);
    const [secQs, setSecQs] = useState([{ q: '', a: '' }, { q: '', a: '' }, { q: '', a: '' }]);
    const [recModal, setRecModal] = useState(false);
    const [recAnswers, setRecAnswers] = useState(['', '', '']);
    const [extQs, setExtQs] = useState([]);
    const [recMode, setRecMode] = useState(false);

    const switchMode = (m) => { setMode(m); setInput(''); setOutput(''); setPw(''); setFileName(''); setPwModal(false); setRecModal(false); };

    /* Encrypt */
    const encrypt = async () => {
        if (!input.trim()) { toast.show('Enter text to encrypt', 'err'); return; }
        if (enableRec) { const e = secQs.filter(q => !q.q.trim() || !q.a.trim()); if (e.length) { toast.show('Fill all 3 security Q&As', 'err'); return; } }
        setBusy(true);
        try {
            const d = new TextEncoder().encode(input);
            const salt = crypto.getRandomValues(new Uint8Array(16));
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const prot = pw.trim().length > 0;
            const kpw = prot ? pw : 'default-unprotected-key-2025';
            const key = await deriveKey(kpw, salt);
            const enc = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, d);
            let rec = null;
            if (enableRec && prot) {
                const ha = await Promise.all(secQs.map(q => hashAns(q.a)));
                const ep = await encPwAns(kpw, secQs.map(q => q.a));
                rec = { questions: secQs.map(q => q.q), answers: ha, encryptedPassword: ep.ep, answerSalt: ep.as, answerIV: ep.ai };
            }
            setOutput(obfuscate(salt, iv, enc, prot, rec));
            toast.show(prot ? (enableRec ? 'Encrypted with password + recovery' : 'Encrypted with password') : 'Encrypted (no password)');
        } catch (e) { toast.show('Encryption failed: ' + e.message, 'err'); }
        setBusy(false);
    };

    /* Decrypt */
    const decrypt = async (usePw) => {
        if (!input.trim()) { toast.show('Paste encrypted text', 'err'); return; }
        setBusy(true);
        try {
            const { prot, salt, iv, enc } = deobfuscate(input);
            const kpw = prot ? usePw : 'default-unprotected-key-2025';
            if (prot && !usePw) { setPwModal(true); setBusy(false); return; }
            const key = await deriveKey(kpw, salt);
            const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, enc);
            setOutput(new TextDecoder().decode(dec));
            toast.show('Decrypted successfully!');
            setPwModal(false); setDecPw(''); setRecMode(false);
        } catch (e) {
            if (e.message.includes('Invalid')) toast.show(e.message, 'err');
            else toast.show('Wrong password or corrupted data', 'err');
        }
        setBusy(false);
    };

    const handleDecrypt = () => {
        try {
            const { prot, rec } = deobfuscate(input);
            if (prot) { if (rec) setExtQs(rec.questions); setRecMode(false); setPwModal(true); }
            else decrypt('');
        } catch (e) { toast.show(e.message, 'err'); }
    };

    const handleRecovery = async () => {
        if (recAnswers.some(a => !a.trim())) { toast.show('Answer all questions', 'err'); return; }
        setBusy(true);
        try {
            const { rec } = deobfuscate(input);
            const valid = (await Promise.all(recAnswers.map(a => hashAns(a)))).every((h, i) => h === rec.answers[i]);
            if (valid) {
                const rpw = await decPwAns(rec.encryptedPassword, rec.answerSalt, rec.answerIV, recAnswers);
                setRecModal(false); setRecAnswers(['', '', '']);
                await decrypt(rpw);
            } else toast.show('Incorrect answers', 'err');
        } catch (e) { toast.show('Recovery failed: ' + e.message, 'err'); }
        setBusy(false);
    };

    const copyOut = () => { if (!output) { toast.show('Nothing to copy', 'err'); return; } navigator.clipboard.writeText(output); toast.show('Copied!'); };
    const dlFile = () => { if (!output) { toast.show('Nothing to download', 'err'); return; } Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([output], { type: 'text/plain' })), download: mode === 'encrypt' ? 'encrypted.txt' : 'decrypted.txt' }).click(); toast.show('Downloaded!'); };
    const upload = (e) => {
        const f = e.target.files[0]; if (!f) return;
        if (f.size > 10 * 1024 * 1024) { toast.show('Max 10 MB', 'err'); return; }
        if (!f.name.endsWith('.txt')) { toast.show('Only .txt files', 'err'); return; }
        const r = new FileReader();
        r.onload = (ev) => { const c = ev.target.result; if (!c.startsWith(FILE_SIGNATURE)) { toast.show('Not a Vault file', 'err'); return; } setInput(c); setFileName(f.name); toast.show(`Loaded ${f.name}`); };
        r.readAsText(f); e.target.value = '';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {toast.el}
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Secure Text Vault', href: '/tools/secure-text-vault' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">
                        Secure Text <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Vault</span>
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-3">AES-256 encryption that never leaves your browser</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                        {['No Registration', 'No Tracking', 'No Cloud', 'No Backdoors'].map(t => (
                            <span key={t} className="flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" />{t}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Mode toggle */}
                <div className="flex gap-2 mb-5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    {[{ m: 'encrypt', icon: Lock, l: 'Encrypt' }, { m: 'decrypt', icon: Unlock, l: 'Decrypt' }].map(({ m, icon: I, l }) => (
                        <button key={m} onClick={() => switchMode(m)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition ${mode === m ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25' : 'text-slate-500 dark:text-slate-400 hover:text-violet-500'
                                }`}>
                            <I className="w-4 h-4" />{l}
                        </button>
                    ))}
                </div>

                {/* Main card */}
                <div className={`${cardCls} p-5 sm:p-7`}>

                    {/* Input */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelCls}>{mode === 'encrypt' ? 'Your Message' : 'Encrypted Message'}</label>
                            {mode === 'decrypt' && (
                                <label className="cursor-pointer">
                                    <input type="file" accept=".txt" onChange={upload} className="hidden" />
                                    <span className="flex items-center gap-1 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-[10px] font-bold transition">
                                        <Upload className="w-3 h-3" />Upload .txt
                                    </span>
                                </label>
                            )}
                        </div>
                        {fileName && mode === 'decrypt' && <p className="text-[10px] font-bold text-emerald-500 mb-1.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />Loaded: {fileName}</p>}
                        <textarea value={input} onChange={e => setInput(e.target.value)}
                            placeholder={mode === 'encrypt' ? 'Enter your secret message…' : 'Paste encrypted message or upload file…'}
                            className={`${inputCls} h-36 resize-none font-mono`} />
                    </div>

                    {/* Password (encrypt only) */}
                    {mode === 'encrypt' && (
                        <div className="mb-5">
                            <label className={labelCls}>Password (optional)</label>
                            <div className="relative">
                                <input type={showPw ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)}
                                    placeholder="Leave empty for no password" className={`${inputCls} pr-10`} />
                                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <p className="text-[10px] font-bold mt-1 text-slate-400">{pw ? '🔒 Password protection enabled' : '🔓 No password — anyone with the ciphertext can decrypt'}</p>
                        </div>
                    )}

                    {/* Recovery questions (encrypt only) */}
                    {mode === 'encrypt' && pw.trim() && (
                        <div className="mb-5">
                            <label className="flex items-center gap-2 cursor-pointer mb-3">
                                <input type="checkbox" checked={enableRec} onChange={e => setEnableRec(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-violet-600 focus:ring-violet-500" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Enable password recovery via security questions</span>
                            </label>
                            {enableRec && (
                                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    {secQs.map((q, i) => (
                                        <div key={i}>
                                            <label className={labelCls}>Question {i + 1}</label>
                                            <select value={q.q} onChange={e => { const n = [...secQs]; n[i].q = e.target.value; setSecQs(n); }} className={`${inputCls} mb-1.5`}>
                                                <option value="">Select a question…</option>
                                                {QUESTIONS_LIST.map(ql => <option key={ql} value={ql}>{ql}</option>)}
                                            </select>
                                            <input value={q.a} onChange={e => { const n = [...secQs]; n[i].a = e.target.value; setSecQs(n); }} placeholder="Your answer" className={inputCls} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action */}
                    <button onClick={mode === 'encrypt' ? encrypt : handleDecrypt} disabled={busy}
                        className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 text-sm mb-5">
                        {busy ? 'Processing…' : mode === 'encrypt' ? <><Lock className="w-4 h-4" />Encrypt & Obfuscate</> : <><Unlock className="w-4 h-4" />Decrypt & Read</>}
                    </button>

                    {/* Output */}
                    {output && (
                        <div>
                            <label className={labelCls}>{mode === 'encrypt' ? 'Encrypted Output' : 'Decrypted Message'}</label>
                            <textarea value={output} readOnly className={`${inputCls} h-36 resize-none font-mono mb-3`} />
                            <div className="flex gap-2">
                                <button onClick={copyOut} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                    <Copy className="w-3.5 h-3.5" />Copy
                                </button>
                                <button onClick={dlFile} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                    <Download className="w-3.5 h-3.5" />Download
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Security features */}
                <div className={`${cardCls} p-5 mt-5`}>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-violet-500" />Security Features</h3>
                    <div className="grid sm:grid-cols-2 gap-2">
                        {[
                            'AES-GCM 256-bit encryption (Web Crypto API)',
                            'PBKDF2 key derivation — 100,000 iterations',
                            'Security questions for password recovery',
                            'SHA-256 hashed security answers',
                            'Custom obfuscation with random chunking',
                            'File signature validation (STVAULT1.0)',
                            '100% client-side — nothing leaves your browser',
                            'Messages can only be decrypted with this tool',
                        ].map(t => (
                            <div key={t} className="flex items-start gap-2 p-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600 dark:text-slate-400">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── SEO Content ── */}
                <div className="prose-premium mt-10">
                    

                    <h2>About Secure Text Vault</h2>
                    <p>Privacy is rarely guaranteed on the internet. Whether you need to send a private message to a client or just want to password protect text for your own records, you need a way to lock it down. <strong>Secure Text Vault</strong> is an online text encryption tool that runs entirely in your browser. You drop your text in, and it spits out a scrambled string. No accounts. No server uploads. The data stays on your machine.</p>
                    <p>Most encryption tools secretly ping a server or log your keystrokes. We built this utility to fix that. Because it uses the Web Crypto API, your raw text never leaves your device. You can encrypt text with a password, or just scramble it without one to stop casual snooping. It's dead simple, fast, and completely free to use.</p>

                    <h2>How to Use This Encryption Tool</h2>
                    <p>You don't need to be a cryptography expert to secure your messages. Follow these steps to lock down your text.</p>
                    <ol>
                        <li><strong>Pick your mode.</strong> Make sure the toggle at the top is set to "Encrypt".</li>
                        <li><strong>Type your message.</strong> Paste or type whatever you want to keep hidden into the main text box.</li>
                        <li><strong>Add a password (optional).</strong> If you leave this blank, the tool will encrypt the text using a default key. Anyone with the tool can decrypt it. If you add a password, only people with that exact password can unlock it.</li>
                        <li><strong>Set up recovery (optional).</strong> If you used a password, you can enable security questions. Answer three questions so you can recover the text if you forget the password.</li>
                        <li><strong>Encrypt and copy.</strong> Hit the purple button. Your text is now scrambled. Copy the output or download it as a text file to share safely.</li>
                    </ol>
                    <p>To read a secure message later, just switch to "Decrypt", paste the text, and enter the password if required. That's pretty much it.</p>

                    <h2>Privacy & Security Focus</h2>
                    <p>Here's the thing — an encryption tool is useless if you can't trust it. That's why Secure Text Vault is built around client-side execution. The encryption happens right in your browser using the exact same AES-GCM 256-bit standards that banks use.</p>
                    <p>We can't read your text because we never see it. There is no backend database storing your secrets. Once you close the tab, the raw data is gone forever. This makes it impossible for us — or anyone else — to intercept your messages in transit.</p>
                    <p>One catch — if you use a password and don't set up recovery questions, there is no backdoor. If you lose the password, you lose the message. We can't recover it for you.</p>

                    <h2>Core Features</h2>
                    <ul>
                        <li><strong>Military-grade encryption.</strong> Uses AES-GCM with a 256-bit key to lock your data tightly.</li>
                        <li><strong>Password recovery.</strong> Optional security questions hash your answers so you can recover forgotten passwords.</li>
                        <li><strong>Custom obfuscation.</strong> The tool breaks your output into random chunks to hide the encryption signature from outsiders.</li>
                        <li><strong>Offline capable.</strong> Once the page loads, you can turn off your internet and it still works perfectly.</li>
                        <li><strong>File support.</strong> Download your encrypted text as a file, or upload a `.txt` file directly into the decryptor.</li>
                    </ul>

                    <h2>Technical Specifications</h2>
                    <p>If you're curious about what happens under the hood, here are the technical details.</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Component</th>
                                <th>Specification</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Encryption Standard</td>
                                <td>AES-GCM</td>
                            </tr>
                            <tr>
                                <td>Key Size</td>
                                <td>256-bit</td>
                            </tr>
                            <tr>
                                <td>Key Derivation</td>
                                <td>PBKDF2 with 100,000 iterations and SHA-256</td>
                            </tr>
                            <tr>
                                <td>Execution Environment</td>
                                <td>Client-side browser (Web Crypto API)</td>
                            </tr>
                            <tr>
                                <td>Data Storage</td>
                                <td>None (Volatile RAM only)</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <p>If you want a reliable way to secure your messages, drop your text into the vault above and see how fast client-side encryption really is.</p>

                </div>
            </div>

            {/* Password modal */}
            {pwModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className={`${cardCls} p-6 max-w-md w-full`}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-violet-500" />{recMode ? 'Set New Password' : 'Password Required'}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                            {recMode ? 'Enter a new password.' : (<>This message is password-protected.{extQs.length > 0 && !recMode && <button onClick={() => { setPwModal(false); setRecModal(true); setDecPw(''); }} className="text-violet-500 hover:text-violet-600 font-bold ml-1">Forgot password?</button>}</>)}
                        </p>
                        <div className="relative mb-4">
                            <input type={showPw ? 'text' : 'password'} value={decPw} onChange={e => setDecPw(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') decrypt(decPw); }} placeholder="Enter password…" autoFocus
                                className={`${inputCls} pr-10`} />
                            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500"><Eye className="w-4 h-4" /></button>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setPwModal(false); setDecPw(''); setRecMode(false); }}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Cancel</button>
                            <button onClick={() => decrypt(decPw)}
                                className="flex-1 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-xs font-bold shadow transition">Decrypt</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recovery modal */}
            {recModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className={`${cardCls} p-6 max-w-md w-full my-8`}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                            <Key className="w-5 h-5 text-violet-500" />Password Recovery
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Answer the security questions to recover your password.</p>
                        <div className="space-y-3 mb-4">
                            {extQs.map((q, i) => (
                                <div key={i}>
                                    <label className={labelCls}>Question {i + 1}</label>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-1">{q}</p>
                                    <input value={recAnswers[i]} onChange={e => { const n = [...recAnswers]; n[i] = e.target.value; setRecAnswers(n); }}
                                        placeholder="Your answer…" className={inputCls} />
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { setRecModal(false); setPwModal(true); setRecAnswers(['', '', '']); }}
                                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition">Back</button>
                            <button onClick={handleRecovery} disabled={busy}
                                className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl text-xs font-bold shadow transition disabled:opacity-50">{busy ? 'Verifying…' : 'Verify'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
