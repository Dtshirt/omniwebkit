'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Hash, Copy, Check, RotateCcw, FileText, Upload, ShieldCheck, ShieldAlert, Key, RefreshCw, ClipboardList, X } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Algorithm definitions ─────────────────────────────────────────────── */
const ALGORITHMS = [
    { name: 'MD5', id: 'md5', bits: 128, security: 'insecure', note: '128-bit · Not recommended for security — use for checksums only' },
    { name: 'SHA-1', id: 'SHA-1', bits: 160, security: 'weak', note: '160-bit · Legacy algorithm, deprecated for security use' },
    { name: 'SHA-256', id: 'SHA-256', bits: 256, security: 'strong', note: '256-bit · Recommended for most applications' },
    { name: 'SHA-384', id: 'SHA-384', bits: 384, security: 'strong', note: '384-bit · Stronger SHA-2 variant' },
    { name: 'SHA-512', id: 'SHA-512', bits: 512, security: 'strong', note: '512-bit · Maximum-strength SHA-2 variant' },
];

const SECURITY_BADGE = {
    insecure: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    weak: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    strong: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
};

/* ─── MD5 (native implementation — Web Crypto doesn't support MD5) ───────── */
function md5(str) {
    function cmn(q, a, b, x, s, t) { a = add32(add32(a, q), add32(x, t)); return add32((a << s) | (a >>> (32 - s)), b); }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }
    function add32(a, b) { return (a + b) & 0xFFFFFFFF; }
    function md5blk(s) { const m = []; for (let i = 0; i < 64; i += 4)m[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24); return m; }
    function md5cycle(x, k) {
        let a = x[0], b = x[1], c = x[2], d = x[3];
        a = ff(a, b, c, d, k[0], 7, -680876936); d = ff(d, a, b, c, k[1], 12, -389564586); c = ff(c, d, a, b, k[2], 17, 606105819); b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897); d = ff(d, a, b, c, k[5], 12, 1200080426); c = ff(c, d, a, b, k[6], 17, -1473231341); b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416); d = ff(d, a, b, c, k[9], 12, -1958414417); c = ff(c, d, a, b, k[10], 17, -42063); b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682); d = ff(d, a, b, c, k[13], 12, -40341101); c = ff(c, d, a, b, k[14], 17, -1502002290); b = ff(b, c, d, a, k[15], 22, 1236535329);
        a = gg(a, b, c, d, k[1], 5, -165796510); d = gg(d, a, b, c, k[6], 9, -1069501632); c = gg(c, d, a, b, k[11], 14, 643717713); b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691); d = gg(d, a, b, c, k[10], 9, 38016083); c = gg(c, d, a, b, k[15], 14, -660478335); b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438); d = gg(d, a, b, c, k[14], 9, -1019803690); c = gg(c, d, a, b, k[3], 14, -187363961); b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467); d = gg(d, a, b, c, k[2], 9, -51403784); c = gg(c, d, a, b, k[7], 14, 1735328473); b = gg(b, c, d, a, k[12], 20, -1926607734);
        a = hh(a, b, c, d, k[5], 4, -378558); d = hh(d, a, b, c, k[8], 11, -2022574463); c = hh(c, d, a, b, k[11], 16, 1839030562); b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060); d = hh(d, a, b, c, k[4], 11, 1272893353); c = hh(c, d, a, b, k[7], 16, -155497632); b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174); d = hh(d, a, b, c, k[0], 11, -358537222); c = hh(c, d, a, b, k[3], 16, -722521979); b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487); d = hh(d, a, b, c, k[12], 11, -421815835); c = hh(c, d, a, b, k[15], 16, 530742520); b = hh(b, c, d, a, k[2], 23, -995338651);
        a = ii(a, b, c, d, k[0], 6, -198630844); d = ii(d, a, b, c, k[7], 10, 1126891415); c = ii(c, d, a, b, k[14], 15, -1416354905); b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571); d = ii(d, a, b, c, k[3], 10, -1894986606); c = ii(c, d, a, b, k[10], 15, -1051523); b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359); d = ii(d, a, b, c, k[15], 10, -30611744); c = ii(c, d, a, b, k[6], 15, -1560198380); b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070); d = ii(d, a, b, c, k[11], 10, -1120210379); c = ii(c, d, a, b, k[2], 15, 718787259); b = ii(b, c, d, a, k[9], 21, -343485551);
        x[0] = add32(a, x[0]); x[1] = add32(b, x[1]); x[2] = add32(c, x[2]); x[3] = add32(d, x[3]);
    }
    function rhex(n) { let s = ''; for (let j = 0; j < 4; j++)s += '0123456789abcdef'[(n >> (j * 8 + 4)) & 0x0F] + '0123456789abcdef'[(n >> (j * 8)) & 0x0F]; return s; }
    function md51(s) {
        const n = s.length; let st = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i = 64; i <= s.length; i += 64)md5cycle(st, md5blk(s.substring(i - 64, i)));
        s = s.substring(i - 64); const tail = new Array(16).fill(0);
        for (i = 0; i < s.length; i++)tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3); if (i > 55) { md5cycle(st, tail); tail.fill(0); }
        tail[14] = n * 8; md5cycle(st, tail); return st;
    }
    return md51(str).map(rhex).join('');
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
async function shaHash(text, algo) {
    const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hmacHash(text, key, algo) {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: algo }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(text));
    return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBase64(hex) {
    const bytes = hex.match(/.{1,2}/g).map(b => parseInt(b, 16));
    return btoa(String.fromCharCode(...bytes));
}

function formatHash(hex, fmt) {
    if (fmt === 'base64') return hexToBase64(hex);
    if (fmt === 'upper') return hex.toUpperCase();
    return hex;
}

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function HashGenerator() {
    const [input, setInput] = useState('');
    const [hashes, setHashes] = useState({});
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState('');
    const [fileHash, setFileHash] = useState(null);
    const [fileDrag, setFileDrag] = useState(false);
    const [outputFmt, setOutputFmt] = useState('hex');   // hex | upper | base64
    const [hmacMode, setHmacMode] = useState(false);
    const [hmacKey, setHmacKey] = useState('');
    const [verifyHash, setVerifyHash] = useState('');
    const [verifyResult, setVerifyResult] = useState(null); // null | 'match' | 'nomatch'
    const [copyAll, setCopyAll] = useState(false);
    const [liveMode, setLiveMode] = useState(true);
    const fileRef = useRef(null);

    /* ── Compute all hashes ── */
    const computeAll = useCallback(async (text) => {
        if (!text) { setHashes({}); return; }
        setLoading(true);
        const results = {};
        results['MD5'] = md5(text);
        for (const algo of ALGORITHMS.filter(a => a.id !== 'md5')) {
            results[algo.name] = hmacMode && hmacKey
                ? await hmacHash(text, hmacKey, algo.id)
                : await shaHash(text, algo.id);
        }
        setHashes(results);
        setLoading(false);
    }, [hmacMode, hmacKey]);

    /* ── Live mode: re-hash on each keystroke ── */
    useEffect(() => {
        if (!liveMode) return;
        const t = setTimeout(() => computeAll(input), 200);
        return () => clearTimeout(t);
    }, [input, liveMode, computeAll]);

    /* ── Verify hash ── */
    useEffect(() => {
        if (!verifyHash || !hashes['SHA-256']) { setVerifyResult(null); return; }
        const target = verifyHash.trim().toLowerCase();
        const match = Object.values(hashes).some(h => formatHash(h, outputFmt).toLowerCase() === target || h.toLowerCase() === target);
        setVerifyResult(match ? 'match' : 'nomatch');
    }, [verifyHash, hashes, outputFmt]);

    /* ── File checksum ── */
    const handleFileDrop = useCallback(async (file) => {
        if (!file) return;
        const buf = await file.arrayBuffer();
        const results = {};
        for (const algo of ALGORITHMS.filter(a => a.id !== 'md5')) {
            const h = await crypto.subtle.digest(algo.id, buf);
            results[algo.name] = Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        setFileHash({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', hashes: results });
    }, []);

    /* ── Copy helpers ── */
    const copyOne = async (text, key) => {
        await navigator.clipboard.writeText(text);
        setCopied(key); setTimeout(() => setCopied(''), 2000);
    };

    const copyAllHashes = async () => {
        const lines = ALGORITHMS.map(a => hashes[a.name] ? `${a.name}: ${formatHash(hashes[a.name], outputFmt)}` : null).filter(Boolean).join('\n');
        await navigator.clipboard.writeText(lines);
        setCopyAll(true); setTimeout(() => setCopyAll(false), 2000);
    };

    const hasResults = Object.keys(hashes).length > 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Hash Generator', href: '/tools/hash-generator' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-rose-500/20">
                        <Hash className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Hash Generator</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly</p>
                </div>

                <div className="grid lg:grid-cols-5 gap-6">
                    {/* Left panel: input + settings */}
                    <div className="lg:col-span-2 space-y-4">

                        {/* Text input */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-rose-500" />Text Input
                                </h2>
                                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <span>Live</span>
                                    <button onClick={() => setLiveMode(v => !v)}
                                        className={`w-8 h-4 rounded-full transition-colors relative ${liveMode ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <span className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${liveMode ? 'left-4' : 'left-0.5'}`} />
                                    </button>
                                </label>
                            </div>
                            <textarea value={input} onChange={e => setInput(e.target.value)}
                                placeholder="Enter text to hash…"
                                className="w-full h-36 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:outline-none focus:border-rose-500 transition" />
                            <div className="flex items-center justify-between mt-1.5">
                                <span className="text-xs text-slate-400">{input.length} characters</span>
                                <button onClick={() => { setInput(''); setHashes({}); }} disabled={!input}
                                    className="text-xs text-slate-400 hover:text-red-500 disabled:opacity-30 transition flex items-center gap-1">
                                    <RotateCcw className="w-3 h-3" />Clear
                                </button>
                            </div>
                            {!liveMode && (
                                <button onClick={() => computeAll(input)} disabled={!input || loading}
                                    className="w-full mt-3 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed">
                                    <Hash className="w-4 h-4" />{loading ? 'Generating…' : 'Generate Hashes'}
                                </button>
                            )}
                        </div>

                        {/* HMAC */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Key className="w-4 h-4 text-violet-500" />HMAC Mode
                                </h2>
                                <button onClick={() => setHmacMode(v => !v)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${hmacMode ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${hmacMode ? 'left-5' : 'left-0.5'}`} />
                                </button>
                            </div>
                            {hmacMode ? (
                                <input value={hmacKey} onChange={e => setHmacKey(e.target.value)} placeholder="Enter secret key…"
                                    className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition" />
                            ) : (
                                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">Enable HMAC to generate keyed-hash message authentication codes using a secret key (SHA algorithms only).</p>
                            )}
                        </div>

                        {/* Output format */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Output Format</h2>
                            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 gap-0.5">
                                {[{ v: 'hex', label: 'Hex' }, { v: 'upper', label: 'HEX' }, { v: 'base64', label: 'Base64' }].map(({ v, label }) => (
                                    <button key={v} onClick={() => setOutputFmt(v)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${outputFmt === v ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Hash verify */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />Verify Hash
                            </h2>
                            <input value={verifyHash} onChange={e => setVerifyHash(e.target.value)} placeholder="Paste a hash to compare…"
                                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition mb-2" />
                            {verifyResult === 'match' && (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
                                    <ShieldCheck className="w-4 h-4" />✓ Hash matches!
                                </div>
                            )}
                            {verifyResult === 'nomatch' && (
                                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                                    <ShieldAlert className="w-4 h-4" />✗ No match found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right panel: results + file */}
                    <div className="lg:col-span-3 space-y-4">
                        {/* Hash results */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Hash className="w-4 h-4 text-rose-500" />Hash Results
                                    {hmacMode && hmacKey && <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-lg font-bold">HMAC</span>}
                                </h2>
                                {hasResults && (
                                    <button onClick={copyAllHashes}
                                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition">
                                        {copyAll ? <Check className="w-3 h-3 text-emerald-500" /> : <ClipboardList className="w-3 h-3" />}
                                        {copyAll ? 'Copied!' : 'Copy All'}
                                    </button>
                                )}
                            </div>

                            {!hasResults ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-300 dark:text-slate-700">
                                    <Hash size={44} className="mb-3" />
                                    <p className="text-slate-500 dark:text-slate-500 text-sm text-center">
                                        {liveMode ? 'Start typing to generate hashes instantly' : 'Enter text above and click Generate Hashes'}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {ALGORITHMS.map(algo => {
                                        const rawHash = hashes[algo.name];
                                        if (!rawHash) return null;
                                        const display = formatHash(rawHash, outputFmt);
                                        const key = algo.name;
                                        return (
                                            <div key={key} className="p-3.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{algo.name}</span>
                                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${SECURITY_BADGE[algo.security]}`}>
                                                            {algo.security}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">{algo.bits} bits · {rawHash.length} chars</span>
                                                    </div>
                                                    <button onClick={() => copyOne(display, key)}
                                                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0">
                                                        {copied === key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                                                    </button>
                                                </div>
                                                <code className="text-xs text-slate-800 dark:text-slate-200 break-all font-mono leading-relaxed">{display}</code>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">{algo.note}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* File checksum */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-blue-500" />File Checksum
                            </h2>
                            <div
                                onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                                onDragLeave={() => setFileDrag(false)}
                                onDrop={e => { e.preventDefault(); setFileDrag(false); handleFileDrop(e.dataTransfer.files?.[0]); }}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${fileDrag ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'}`}>
                                <input ref={fileRef} type="file" className="hidden" onChange={e => handleFileDrop(e.target.files?.[0])} />
                                <Upload className={`mx-auto mb-2 ${fileDrag ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`} size={28} />
                                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-0.5">Drop file or click to compute checksums</p>
                                <p className="text-slate-400 text-xs">Any file type supported</p>
                            </div>

                            {fileHash && (
                                <div className="mt-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{fileHash.name}</span>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-slate-400">{fileHash.size}</span>
                                            <button onClick={() => setFileHash(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    {Object.entries(fileHash.hashes).map(([name, hash]) => (
                                        <div key={name} className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 w-16 flex-shrink-0">{name}</span>
                                            <code className="text-[10px] text-slate-700 dark:text-slate-300 truncate flex-1 font-mono">{formatHash(hash, outputFmt)}</code>
                                            <button onClick={() => copyOne(formatHash(hash, outputFmt), 'f_' + name)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0">
                                                {copied === 'f_' + name ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-14 space-y-5">
                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Hash Generator — MD5, SHA-1, SHA-256, SHA-384, SHA-512</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            A hash function takes any piece of text and produces a fixed-length string of characters called a hash (also known as a digest or checksum). No matter how long or short the input is, the hash output is always the same length — 32 characters for MD5, 40 for SHA-1, 64 for SHA-256, and so on. More importantly, even a tiny change in the input completely changes the hash output. This property makes hash functions one of the most useful tools in computing and security.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The OmniWebKit Hash Generator lets you calculate hashes for any text string or file directly in your browser. It supports five algorithms: MD5, SHA-1, SHA-256, SHA-384, and SHA-512. All computation happens locally using the Web Crypto API (for SHA algorithms) and a native JavaScript MD5 implementation — no data is sent to any server.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            The tool includes live mode (hashes update as you type), HMAC mode for keyed hashing, output format options (hex lowercase, hex uppercase, Base64), a hash verification panel, and file checksum generation for any file type.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Hash Algorithms Explained</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'MD5 (128-bit)', security: '❌ Insecure for security', body: 'MD5 is one of the oldest and most widely recognised hash functions. It produces a 32-character hex output (128 bits). While it is fast and still used for non-security purposes like file integrity checks and checksums, it is completely broken for cryptographic security. Collision attacks — finding two different inputs with the same hash — are computationally trivial for MD5 today. Never use MD5 to hash passwords or in any security-sensitive context.' },
                                { name: 'SHA-1 (160-bit)', security: '⚠️ Legacy, deprecated', body: 'SHA-1 produces a 40-character hex string (160 bits). It was once the industry standard for digital signatures and SSL certificates, but SHA-1 was formally deprecated by NIST in 2011. Practical collision attacks on SHA-1 have been demonstrated. Modern browsers and certificate authorities no longer accept SHA-1 certificates. SHA-1 hashes are still generated by this tool for legacy verification purposes, but you should not use SHA-1 for new applications.' },
                                { name: 'SHA-256 (256-bit)', security: '✅ Recommended', body: 'SHA-256 is the most widely recommended general-purpose hash algorithm today. It produces a 64-character hex string (256 bits) and is part of the SHA-2 family. It powers Bitcoin mining, TLS certificates, git commit verification, and code signing. SHA-256 has no known practical vulnerabilities — it is considered cryptographically secure and is the right choice for most applications where you need a hash.' },
                                { name: 'SHA-384 (384-bit)', security: '✅ Strong', body: 'SHA-384 is a truncated version of SHA-512 that produces a 96-character hex output (384 bits). It provides a higher security margin than SHA-256 and is commonly used in TLS cipher suites and government cryptography standards. It is slightly slower than SHA-256 but more resistant to future length-extension attacks.' },
                                { name: 'SHA-512 (512-bit)', security: '✅ Maximum strength', body: 'SHA-512 produces a 128-character hex string (512 bits). It is the strongest SHA-2 variant and is often faster than SHA-256 on 64-bit systems despite producing twice as many bits. Use SHA-512 when you need the maximum available hash strength — for example, in high-security applications, key derivation, or long-term archival integrity.' },
                            ].map(({ name, security, body }) => (
                                <div key={name} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{name}</h3>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{security}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What Is HMAC and When Should You Use It?</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            HMAC stands for Hash-based Message Authentication Code. It is a specific way of generating a hash that involves a secret key in addition to the input message. The result proves two things at once: that the data has not been tampered with (integrity), and that the hash was generated by someone who knows the secret key (authenticity).
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            A regular SHA-256 hash only verifies integrity — anyone can recompute the hash from the data. An HMAC-SHA256, on the other hand, can only be verified (or reproduced) by someone who knows the secret key. This makes HMAC the right tool for API request signing, webhook verification, JSON Web Token (JWT) generation, and any situation where you need both integrity and authentication.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Enable HMAC mode in this tool and enter your secret key to generate HMAC equivalents of SHA-1, SHA-256, SHA-384, and SHA-512. (MD5 is excluded from HMAC mode because of its insecurity.)
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is my text or file sent to a server?', a: 'No. All hashing is performed entirely in your browser using the Web Crypto API (for SHA algorithms) and a JavaScript MD5 implementation. Your input never leaves your device.' },
                                { q: 'What is the difference between MD5, SHA-1, and SHA-256?', a: 'They differ in output size, speed, and security level. MD5 (128-bit) and SHA-1 (160-bit) are broken for security purposes — avoid them in new applications. SHA-256 (256-bit) is the current recommended standard. SHA-384 and SHA-512 offer higher security margins at the cost of slightly longer output.' },
                                { q: 'Can I use this to hash passwords?', a: 'No. General hash functions like SHA-256 are not appropriate for hashing passwords because they are too fast — attackers can try billions of guesses per second. Passwords should be hashed using slow, purpose-built algorithms like bcrypt, scrypt, or Argon2 with a salt. This tool is not suitable for password hashing.' },
                                { q: 'What is a hash collision?', a: 'A collision is when two different inputs produce the same hash output. MD5 and SHA-1 are considered broken because practical collision attacks exist. SHA-256, SHA-384, and SHA-512 have no known practical collision attacks.' },
                                { q: 'What is the file checksum feature for?', a: 'File checksums let you verify that a file has not been corrupted or tampered with. Drop a file onto the checksum area and compare the resulting hash against the hash published by the file\'s original source. If they match, the file is identical to the original.' },
                                { q: 'What are the three output formats?', a: 'Hex (lowercase) is the standard format for hash output. HEX (uppercase) is the same value displayed in uppercase letters. Base64 encodes the binary hash in Base64 notation, which is used in some APIs and JWT signatures.' },
                                { q: 'What is live mode?', a: 'When live mode is enabled, hashes are recalculated automatically as you type — no button press required. There is a 200ms debounce to avoid computing on every single keystroke. Disable live mode if you want to control exactly when hashes are computed.' },
                                { q: 'What is HMAC used for?', a: 'HMAC (Hash-based Message Authentication Code) combines the input with a secret key to produce a keyed hash. It is used for API authentication, webhook signature verification, JWT signing, and any situation where you need to prove both data integrity and origin authenticity.' },
                            ].map(({ q, a }) => (
                                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                                        <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
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
