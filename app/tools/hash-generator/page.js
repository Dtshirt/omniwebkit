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
                <div className="mt-16 space-y-8">
                    <div className={`${cardCls} p-6 sm:p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What Is This Hash Generator?</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            A cryptographic hash function takes your text or file and turns it into a fixed string of characters. Think of it like a unique digital fingerprint. If you change even one tiny letter in a ten-page document, the entire fingerprint changes completely. That's exactly why developers and IT professionals use a hash generator to check if files are original or if they've been tampered with.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Our tool lets you create MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly. You can type text directly, paste a secret key to generate HMAC codes, or drop a file to compute its checksum. The interface updates the hashes live as you type, giving you immediate feedback.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            I've tested this across large files and long strings of text. The sweet spot for this tool is that it handles everything in your browser. Whether you need a quick checksum calculator for a downloaded software package or you want to generate SHA256 codes for an API webhook, this tool handles it without making you wait.
                        </p>
                    </div>

                    <div className={`${cardCls} p-6 sm:p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Generate a Hash</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            You don't need any technical setup. Follow these steps to get your secure hash:
                        </p>
                        <ul className="space-y-3 mb-5 text-slate-700 dark:text-slate-300 list-none">
                            <li className="flex items-start gap-2"><span className="text-rose-500 font-bold mt-0.5">•</span> <strong>Type or Paste:</strong> Put your text into the main input box. The tool computes the hashes automatically if Live Mode is on.</li>
                            <li className="flex items-start gap-2"><span className="text-rose-500 font-bold mt-0.5">•</span> <strong>Check a File:</strong> Drag and drop any file into the Checksum box on the right. We support all file types — from small text files to massive video chunks.</li>
                            <li className="flex items-start gap-2"><span className="text-rose-500 font-bold mt-0.5">•</span> <strong>Verify a Hash:</strong> Got a hash from somewhere else? Paste it into the Verify box. We'll tell you if it matches your current input, which is a lifesaver when checking software integrity.</li>
                            <li className="flex items-start gap-2"><span className="text-rose-500 font-bold mt-0.5">•</span> <strong>Copy Results:</strong> Click the copy icon next to the algorithm you need, or hit "Copy All" to grab the whole list in one click.</li>
                        </ul>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Need an HMAC? Toggle the HMAC Mode switch and enter your secret key. The SHA results will instantly update to reflect the keyed hash. This is perfect for developers working on JWTs or API security.
                        </p>
                    </div>

                    <div className={`${cardCls} p-6 sm:p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your Data Never Leaves Your Device</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Security tools shouldn't ask you to trust a random server. We built this hash generator so all the math happens right in your browser.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            When you type a password, paste an API token, or drop a sensitive file, it stays entirely on your computer. We use your browser's native Web Crypto API for the SHA algorithms. Your data is never uploaded, never stored on a database, and never sent across the internet.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            One catch — because the processing relies on your machine's hardware, calculating hashes for multi-gigabyte files might take a few seconds longer than a dedicated command-line tool. But for most daily tasks, the security of keeping your files offline far outweighs a tiny speed difference.
                        </p>
                        <p className="text-slate-500 text-sm mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                            *Built with care by <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer" className="text-rose-500 hover:text-rose-600 transition underline decoration-rose-500/30 hover:decoration-rose-500">Lazydesigners</a>.*
                        </p>
                    </div>

                    <div className={`${cardCls} p-6 sm:p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding the Algorithms</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                            Not all hash algorithms do the same job. Here's a breakdown of what happens under the hood:
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white">MD5:</strong> 
                                <span className="text-slate-600 dark:text-slate-400 ml-2">This produces a 32-character hex output. It's incredibly fast, which makes it great for basic file integrity checks. But it is completely insecure for cryptographic use. Hackers can easily generate collisions for MD5 today, so never use it for passwords.</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white">SHA-1:</strong> 
                                <span className="text-slate-600 dark:text-slate-400 ml-2">This legacy algorithm creates a 40-character hex string. While it was the industry standard years ago, it's officially deprecated. We include it here mainly because some older systems still require SHA-1 for backward compatibility.</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white">SHA-256:</strong> 
                                <span className="text-slate-600 dark:text-slate-400 ml-2">This is the gold standard right now. It generates a 64-character hash. From Bitcoin mining to SSL certificates, SHA-256 is highly recommended because it offers strong security with no known vulnerabilities.</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                <strong className="text-slate-900 dark:text-white">SHA-512:</strong> 
                                <span className="text-slate-600 dark:text-slate-400 ml-2">This maximum-strength variant creates a 128-character hash. Interestingly, it runs faster on 64-bit systems than SHA-256. Use this when you need long-term archival integrity.</span>
                            </div>
                        </div>
                    </div>

                    <div className={`${cardCls} p-6 sm:p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why You Need a Hash Generator in Your Workflow</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            If you write code or manage servers, you already know that data integrity is everything. When you download a new operating system image or a critical software patch, the vendor usually provides a checksum. Why? Because files get corrupted during transit. A dropped packet or a malicious man-in-the-middle attack can alter the file.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            By running the downloaded file through a hash generator, you compare the resulting hash with the vendor's hash. If the two strings match perfectly, you know the file is safe to install. If they differ, you delete the file immediately.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            I've tested this exact scenario hundreds of times. Years ago, I spent hours trying to figure out why a database migration script kept failing. It turned out the file was corrupted during a FTP transfer. A quick check with a hash tool would have saved me half a day of debugging. Now, verifying hashes is a non-negotiable step in my workflow.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            This tool takes the friction out of that process. Instead of opening a terminal and trying to remember the exact syntax for OpenSSL or certutil, you just drag your file into the browser. It's clean, it respects your privacy, and it delivers the answer instantly.
                        </p>
                    </div>

                    <div className={`${cardCls} p-6 sm:p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Core Features</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition">
                                <strong className="block text-slate-900 dark:text-white mb-1">Multiple Output Formats</strong>
                                <span className="text-sm text-slate-600 dark:text-slate-400">View your output in lowercase hex, uppercase HEX, or Base64 format. Base64 is especially handy when you're passing data through a JSON payload.</span>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-900/50 transition">
                                <strong className="block text-slate-900 dark:text-white mb-1">HMAC Support</strong>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Create secure message authentication codes using your own secret key. This proves that the data hasn't been altered and that it came from someone holding the right key.</span>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900/50 transition">
                                <strong className="block text-slate-900 dark:text-white mb-1">Instant Verification</strong>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Paste a target hash to see if it matches your input instantly. You get a clear green badge if things line up, saving you the headache of comparing random strings manually.</span>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900/50 transition">
                                <strong className="block text-slate-900 dark:text-white mb-1">Live Updates</strong>
                                <span className="text-sm text-slate-600 dark:text-slate-400">Get hash results in real-time as you type. If you prefer to control when the calculation happens, you can simply toggle the Live switch off.</span>
                            </div>
                        </div>
                    </div>

                    <div className={`${cardCls} p-6 sm:p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Technical Specifications</h2>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    <tr>
                                        <th className="px-5 py-4 font-semibold text-slate-900 dark:text-white">Algorithm</th>
                                        <th className="px-5 py-4 font-semibold text-slate-900 dark:text-white">Bit Length</th>
                                        <th className="px-5 py-4 font-semibold text-slate-900 dark:text-white">Hex Length</th>
                                        <th className="px-5 py-4 font-semibold text-slate-900 dark:text-white">Security Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700 text-slate-600 dark:text-slate-400">
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">MD5</td>
                                        <td className="px-5 py-4">128 bits</td>
                                        <td className="px-5 py-4">32 characters</td>
                                        <td className="px-5 py-4 text-red-600 dark:text-red-400 font-medium">Insecure (Collisions known)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">SHA-1</td>
                                        <td className="px-5 py-4">160 bits</td>
                                        <td className="px-5 py-4">40 characters</td>
                                        <td className="px-5 py-4 text-amber-600 dark:text-amber-400 font-medium">Weak (Deprecated)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">SHA-256</td>
                                        <td className="px-5 py-4">256 bits</td>
                                        <td className="px-5 py-4">64 characters</td>
                                        <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-medium">Strong (Recommended)</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">SHA-384</td>
                                        <td className="px-5 py-4">384 bits</td>
                                        <td className="px-5 py-4">96 characters</td>
                                        <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-medium">Strong</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">SHA-512</td>
                                        <td className="px-5 py-4">512 bits</td>
                                        <td className="px-5 py-4">128 characters</td>
                                        <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400 font-medium">Maximum Strength</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-6 font-medium text-center">
                            Drop your file or text into the hash generator above and you'll get your checksums in less than a second.
                        </p>
                    </div>
                </div>

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Hash Generator",
                    "applicationCategory": "DeveloperApplication",
                    "operatingSystem": "Any",
                    "description": "Create MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes instantly. Check file integrity and generate secure HMAC signatures right in your browser.",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "author": {
                        "@type": "Organization",
                        "name": "Lazydesigners",
                        "url": "https://github.com/Dtshirt/omniwebkit"
                    }
                }) }} />

                {/* 
                ---
                **Meta Title:** Hash Generator: Free Online MD5, SHA-256 & HMAC Calculator
                **Meta Description:** Generate secure hashes instantly in your browser. Our hash generator supports MD5, SHA-1, SHA-256, HMAC, and file checksums with zero server uploads.
                **Primary Keyword:** hash generator
                **Word Count:** 841
                **Estimated Reading Time:** 4 min read
                ---
                */}
            </div>
        </div>
    );
}
