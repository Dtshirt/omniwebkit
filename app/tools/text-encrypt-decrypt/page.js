'use client';
import { useState, useCallback } from 'react';
import { Lock, Unlock, Copy, RotateCcw, ArrowRightLeft, Eye, EyeOff, Shield, Key, Check, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

function useToast() {
    const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
    const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
    const el = msg ? (<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}</div>) : null;
    return { show, el };
}

/* ─── Ciphers ───────────────────────────────────────────────────────── */
const METHODS = {
    'AES (Base64)': {
        info: 'XOR encryption with Base64 encoding. Requires a secret key.',
        encrypt: (t, k) => { let r = ''; for (let i = 0; i < t.length; i++) r += String.fromCharCode(t.charCodeAt(i) ^ k.charCodeAt(i % k.length)); return btoa(r); },
        decrypt: (t, k) => { try { const d = atob(t); let r = ''; for (let i = 0; i < d.length; i++) r += String.fromCharCode(d.charCodeAt(i) ^ k.charCodeAt(i % k.length)); return r; } catch { return 'Error: Invalid encrypted text'; } },
    },
    'Caesar Cipher': {
        info: 'Shifts each letter by a fixed number. Key = shift amount (default 3).',
        encrypt: (t, k) => { const s = parseInt(k) || 3; return t.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + s) % 26 + b); }); },
        decrypt: (t, k) => { const s = parseInt(k) || 3; return t.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b - s + 26) % 26 + b); }); },
    },
    'ROT13': {
        info: 'Rotates each letter by 13 positions. No key needed. Symmetric.',
        encrypt: (t) => t.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + 13) % 26 + b); }),
        decrypt: (t) => t.replace(/[a-zA-Z]/g, c => { const b = c <= 'Z' ? 65 : 97; return String.fromCharCode((c.charCodeAt(0) - b + 13) % 26 + b); }),
    },
    'Base64': {
        info: 'Base64 encoding/decoding. Not encryption — just encoding.',
        encrypt: (t) => { try { return btoa(unescape(encodeURIComponent(t))); } catch { return 'Error'; } },
        decrypt: (t) => { try { return decodeURIComponent(escape(atob(t))); } catch { return 'Error: Invalid Base64'; } },
    },
    'Reverse': {
        info: 'Reverses the text. Symmetric operation.',
        encrypt: (t) => t.split('').reverse().join(''),
        decrypt: (t) => t.split('').reverse().join(''),
    },
    'Hex Encode': {
        info: 'Converts each character to its hexadecimal value.',
        encrypt: (t) => Array.from(t).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' '),
        decrypt: (t) => { try { return t.trim().split(/\s+/).map(h => String.fromCharCode(parseInt(h, 16))).join(''); } catch { return 'Error: Invalid hex'; } },
    },
    'Morse Code': {
        info: 'Converts text to dots and dashes. Space = /.',
        encrypt: (t) => { const M = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ': '/' }; return t.toUpperCase().split('').map(c => M[c] || c).join(' '); },
        decrypt: (t) => { const R = { '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9', '/': ' ' }; return t.split(' ').map(c => R[c] || c).join(''); },
    },
};

export default function TextEncryptDecrypt() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [method, setMethod] = useState('AES (Base64)');
    const [key, setKey] = useState('secretkey');
    const [mode, setMode] = useState('encrypt');
    const [showKey, setShowKey] = useState(false);
    const toast = useToast();

    const needsKey = ['AES (Base64)', 'Caesar Cipher'].includes(method);

    const process = useCallback(() => {
        if (!input) { toast.show('Enter text first', 'err'); return; }
        const fn = mode === 'encrypt' ? METHODS[method].encrypt : METHODS[method].decrypt;
        setOutput(fn(input, key));
        toast.show(mode === 'encrypt' ? 'Encrypted!' : 'Decrypted!');
    }, [input, method, key, mode]);

    const swap = () => { setInput(output); setOutput(''); setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt'); toast.show('Swapped'); };
    const copyOut = () => { if (!output) return; navigator.clipboard.writeText(output); toast.show('Copied!'); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {toast.el}
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Text Encrypt & Decrypt', href: '/tools/text-encrypt-decrypt' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/25">
                        <Shield className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Text Encrypt & Decrypt</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Encrypt and decrypt text with multiple ciphers and encodings</p>
                </div>

                {/* Main card */}
                <div className={`${cardCls} p-5 sm:p-7`}>

                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {/* Mode */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5">
                            {[{ m: 'encrypt', i: Lock, l: 'Encrypt', c: 'text-emerald-600 dark:text-emerald-400' }, { m: 'decrypt', i: Unlock, l: 'Decrypt', c: 'text-blue-600 dark:text-blue-400' }].map(({ m, i: I, l, c }) => (
                                <button key={m} onClick={() => setMode(m)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${mode === m ? `bg-white dark:bg-slate-700 ${c} shadow-sm` : 'text-slate-500 dark:text-slate-400'}`}>
                                    <I className="w-3.5 h-3.5" />{l}
                                </button>
                            ))}
                        </div>

                        {/* Method */}
                        <select value={method} onChange={e => { setMethod(e.target.value); setOutput(''); }}
                            className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/40 transition">
                            {Object.keys(METHODS).map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        {/* Key */}
                        {needsKey && (
                            <div className="relative flex-1 min-w-[180px]">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input type={showKey ? 'text' : 'password'} value={key} onChange={e => setKey(e.target.value)} placeholder="Encryption key"
                                    className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/40 transition" />
                                <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition">
                                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Input / Output */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className={labelCls}>Input</label>
                            <textarea value={input} onChange={e => setInput(e.target.value)}
                                placeholder={mode === 'encrypt' ? 'Enter text to encrypt...' : 'Enter text to decrypt...'}
                                className="w-full h-48 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-amber-500/40 transition" spellCheck={false} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className={labelCls}>Output</label>
                                <div className="flex gap-1">
                                    <button onClick={swap} title="Swap" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                                        <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                    <button onClick={copyOut} title="Copy" className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition">
                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                    </button>
                                </div>
                            </div>
                            <textarea value={output} readOnly placeholder="Result appears here..."
                                className="w-full h-48 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white resize-none outline-none" />
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex gap-2">
                        <button onClick={process}
                            className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2">
                            {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            {mode === 'encrypt' ? 'Encrypt' : 'Decrypt'}
                        </button>
                        <button onClick={() => { setInput(''); setOutput(''); }}
                            className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-xl transition">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Method info */}
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            <strong className="text-slate-700 dark:text-slate-300">{method}:</strong> {METHODS[method].info}
                        </p>
                    </div>
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Text Encryption & Decryption Tool</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Encryption is the process of converting readable text into an unreadable format so that only someone with the right key or method can read it. It has been used for thousands of years — from Caesar\u2019s military messages to modern-day HTTPS connections. Whether you need to protect a message, learn how ciphers work, or encode data for storage, this tool has you covered.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This free Text Encrypt & Decrypt tool supports seven different methods. Choose a cipher, type or paste your text, and click Encrypt or Decrypt. Methods that require a key — like AES (XOR with Base64) and Caesar Cipher — let you set the key directly in the toolbar. Methods like ROT13, Base64, Reverse, Hex Encode, and Morse Code work without a key.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            The Swap button moves your output back to the input field and switches the mode, so you can encrypt and then decrypt in seconds. Copy the result to your clipboard or clear everything and start over. All processing runs in your browser. No data is sent to any server. No account required.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Supported Encryption Methods</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'AES (XOR + Base64)', c: 'text-amber-600 dark:text-amber-400', b: 'XOR-based symmetric encryption encoded in Base64. Requires a secret key. Both parties must know the key to decrypt the message.' },
                                { t: 'Caesar Cipher', c: 'text-orange-600 dark:text-orange-400', b: 'One of the oldest ciphers. Each letter is shifted by a fixed number of positions. The key is the shift amount (default 3). Easy to break but great for learning.' },
                                { t: 'ROT13', c: 'text-emerald-600 dark:text-emerald-400', b: 'A special case of the Caesar cipher that shifts letters by 13. Since the alphabet has 26 letters, applying ROT13 twice returns the original text.' },
                                { t: 'Base64 Encoding', c: 'text-blue-600 dark:text-blue-400', b: 'Converts binary data to a text format using 64 printable characters. Not encryption — it is encoding. Commonly used in emails, data URIs, and APIs.' },
                                { t: 'Hex Encoding', c: 'text-violet-600 dark:text-violet-400', b: 'Converts each character to its hexadecimal (base-16) representation. Often used in programming, colour codes, and debugging network data.' },
                                { t: 'Morse Code', c: 'text-rose-600 dark:text-rose-400', b: 'Converts letters and numbers to dots and dashes. Originally developed for telegraph communication. Space between words is represented by a slash (/).' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this encryption tool free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
                                { q: 'Is the AES method secure?', a: 'This tool uses XOR with Base64 encoding, which is a simplified version. For sensitive data, use a full AES-256 implementation with a proper library.' },
                                { q: 'What is the difference between encryption and encoding?', a: 'Encryption requires a key to reverse. Encoding (like Base64 or Hex) can be reversed by anyone without a key. Encoding is for data format, not security.' },
                                { q: 'What key should I use for Caesar Cipher?', a: 'The key is the shift amount. Enter a number (e.g., 3, 5, 13). The default is 3, which is the historical shift used by Julius Caesar.' },
                                { q: 'Does ROT13 need a key?', a: 'No. ROT13 always shifts by 13. It is symmetric: encrypting and decrypting use the same operation.' },
                                { q: 'Can I decrypt without the original key?', a: 'For AES and Caesar Cipher, you need the correct key. For ROT13, Base64, Hex, Reverse, and Morse, no key is required.' },
                                { q: 'Does this tool send data to a server?', a: 'No. All encryption and decryption run entirely in your browser. Your text never leaves your device.' },
                                { q: 'Does the Swap button preserve the key?', a: 'Yes. Swap moves the output to input, switches mode, and keeps your key and method unchanged.' },
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
