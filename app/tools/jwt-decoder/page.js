'use client';
import { useState, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
    Key, Copy, Check, AlertTriangle, Clock, ShieldCheck,
    ShieldX, RotateCcw, Lock, Info, FileJson
} from 'lucide-react';

/* ─── JWT helpers ───────────────────────────────────────────────────────── */
function b64Decode(str) {
    try {
        let b = str.replace(/-/g, '+').replace(/_/g, '/');
        while (b.length % 4) b += '=';
        return JSON.parse(atob(b));
    } catch { return null; }
}

const fmtJson = (o) => JSON.stringify(o, null, 2);

function getExpStatus(payload) {
    if (!payload?.exp) return null;
    const d = new Date(payload.exp * 1000), now = new Date(), diff = d - now;
    if (diff < 0) return { expired: true, text: `Expired ${fmtDiff(Math.abs(diff))} ago`, date: d };
    return { expired: false, text: `Expires in ${fmtDiff(diff)}`, date: d };
}

function fmtDiff(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ${m % 60}m`;
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
}

const CLAIM_LABELS = {
    iss: 'Issuer', sub: 'Subject', aud: 'Audience', exp: 'Expiration Time',
    nbf: 'Not Before', iat: 'Issued At', jti: 'JWT ID', name: 'Name',
    email: 'Email', role: 'Role', scope: 'Scope', given_name: 'Given Name',
    family_name: 'Family Name', picture: 'Picture URL', azp: 'Authorized Party',
    nonce: 'Nonce', at_hash: 'Access Token Hash', typ: 'Type', kid: 'Key ID',
};

const SAMPLES = {
    Basic: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    Expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgU21pdGgiLCJleHAiOjE2MDAwMDAwMDAsImlhdCI6MTUxNjIzOTAyMn0.Adv3peTCwOBUPMqkVMOFHqR4VMz2Xihf1BXFdVpX6fY',
    'Rich Claims': 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InRlc3Qta2V5LWlkIn0.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyLTEyMyIsImF1ZCI6Im15LWFwcCIsImV4cCI6MTk5OTk5OTk5OSwiaWF0IjoxNjk5OTk5OTk5LCJuYW1lIjoiQWxpY2UgSm9obnNvbiIsImVtYWlsIjoiYWxpY2VAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJzY29wZSI6InJlYWQgd3JpdGUgZGVsZXRlIn0.placeholder-signature',
};

/* ─── Card ──────────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden';

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function JwtDecoder() {
    const [token, setToken] = useState('');
    const [copied, setCopied] = useState('');
    const [activeTab, setActiveTab] = useState('claims');

    const parts = token.trim().split('.');
    const isValid = parts.length === 3 && parts.every(p => p.length > 0);
    const header = isValid ? b64Decode(parts[0]) : null;
    const payload = isValid ? b64Decode(parts[1]) : null;
    const sig = isValid ? parts[2] : null;
    const expSt = payload ? getExpStatus(payload) : null;

    const copy = useCallback(async (text, key) => {
        if (!text) return;
        await navigator.clipboard.writeText(text);
        setCopied(key); setTimeout(() => setCopied(''), 2000);
    }, []);

    const CopyBtn = ({ text, label }) => (
        <button onClick={() => copy(text, label)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
            title="Copy">
            {copied === label
                ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                : <Copy className="w-3.5 h-3.5 text-slate-400" />}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'JWT Decoder', href: '/tools/jwt-decoder' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
                        <Key className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">JWT Decoder</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Decode, inspect, and debug JSON Web Tokens instantly</p>
                </div>

                {/* Sample buttons */}
                <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="text-xs font-bold text-slate-400 uppercase self-center mr-1">Try sample:</span>
                    {Object.entries(SAMPLES).map(([label, jwt]) => (
                        <button key={label} onClick={() => { setToken(jwt); setActiveTab('claims'); }}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 transition-all shadow-sm">
                            {label}
                        </button>
                    ))}
                </div>

                {/* Token input */}
                <div className={`${cardCls} p-5 mb-6`}>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <FileJson className="w-4 h-4 text-violet-500" />Encoded Token
                        </label>
                        <div className="flex items-center gap-1.5">
                            {token && <span className="text-[10px] font-bold text-slate-400">{token.trim().length} chars</span>}
                            <CopyBtn text={token} label="token" />
                            <button onClick={() => { setToken(''); }} title="Clear"
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                            </button>
                        </div>
                    </div>

                    <textarea
                        value={token} onChange={e => setToken(e.target.value)}
                        placeholder="Paste your JWT here (eyJhbGciOiJIUz...)"
                        spellCheck={false}
                        className="w-full h-28 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none resize-none transition"
                    />

                    {/* Colour-coded parts preview */}
                    {isValid && (
                        <div className="mt-3 p-4 bg-slate-950 rounded-xl overflow-x-auto">
                            <code className="text-xs break-all">
                                <span className="text-red-400">{parts[0]}</span>
                                <span className="text-slate-500">.</span>
                                <span className="text-purple-400">{parts[1]}</span>
                                <span className="text-slate-500">.</span>
                                <span className="text-cyan-400">{parts[2]}</span>
                            </code>
                        </div>
                    )}

                    {/* Invalid format warning */}
                    {token && !isValid && (
                        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>Invalid JWT format. A JWT must have exactly 3 parts separated by dots (header.payload.signature).</span>
                        </div>
                    )}
                </div>

                {/* Decoded results */}
                {isValid && header && payload && (
                    <>
                        <div className="grid lg:grid-cols-3 gap-5 mb-5">

                            {/* Header panel */}
                            <div className={cardCls}>
                                <div className="px-5 py-3 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
                                    <h2 className="text-sm font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />HEADER
                                    </h2>
                                    <CopyBtn text={fmtJson(header)} label="header" />
                                </div>
                                <div className="p-5">
                                    <pre className="text-xs font-mono text-slate-900 dark:text-white overflow-x-auto whitespace-pre mb-4 leading-relaxed">{fmtJson(header)}</pre>
                                    <div className="space-y-2">
                                        {[
                                            { k: 'alg', label: 'Algorithm', icon: <Lock className="w-3.5 h-3.5 text-slate-400" /> },
                                            { k: 'typ', label: 'Type', icon: null },
                                            { k: 'kid', label: 'Key ID', icon: null },
                                        ].filter(({ k }) => header[k]).map(({ k, label, icon }) => (
                                            <div key={k} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl">
                                                {icon}
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
                                                <span className="ml-auto text-xs font-bold text-slate-900 dark:text-white font-mono truncate">{String(header[k])}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Payload panel */}
                            <div className={`${cardCls} lg:col-span-2`}>
                                <div className="px-5 py-3 bg-gradient-to-r from-violet-50 to-transparent dark:from-violet-900/20 border-b border-violet-100 dark:border-violet-900/30 flex items-center justify-between">
                                    <h2 className="text-sm font-black text-violet-600 dark:text-violet-400 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />PAYLOAD
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        {['claims', 'raw'].map(t => (
                                            <button key={t} onClick={() => setActiveTab(t)}
                                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeTab === t
                                                        ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                    }`}>
                                                {t === 'claims' ? 'Claims' : 'Raw JSON'}
                                            </button>
                                        ))}
                                        <CopyBtn text={fmtJson(payload)} label="payload" />
                                    </div>
                                </div>
                                <div className="p-5">
                                    {/* Expiry banner */}
                                    {expSt && (
                                        <div className={`mb-4 flex items-center gap-3 p-3 rounded-xl border ${expSt.expired
                                                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                                                : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                            }`}>
                                            {expSt.expired
                                                ? <ShieldX className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                : <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />}
                                            <div>
                                                <p className={`text-sm font-bold ${expSt.expired ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {expSt.text}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{expSt.date.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'claims' ? (
                                        <div className="space-y-2">
                                            {Object.entries(payload).map(([key, value]) => {
                                                const isTime = ['exp', 'iat', 'nbf'].includes(key) && typeof value === 'number';
                                                return (
                                                    <div key={key}
                                                        className="flex items-start gap-3 px-3 py-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-mono font-black text-violet-600 dark:text-violet-400">{key}</span>
                                                                {CLAIM_LABELS[key] && (
                                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{CLAIM_LABELS[key]}</span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm font-mono text-slate-900 dark:text-white break-all">
                                                                {isTime ? (
                                                                    <span className="flex items-center gap-2 flex-wrap">
                                                                        <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                                        <span>{new Date(value * 1000).toLocaleString()}</span>
                                                                        <span className="text-xs text-slate-400">({value})</span>
                                                                    </span>
                                                                ) : typeof value === 'object' ? (
                                                                    <pre className="text-xs text-slate-900 dark:text-white whitespace-pre">{JSON.stringify(value, null, 2)}</pre>
                                                                ) : (
                                                                    <span className="text-slate-900 dark:text-white">{String(value)}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <CopyBtn text={typeof value === 'object' ? JSON.stringify(value) : String(value)} label={key} />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <pre className="text-xs font-mono text-slate-900 dark:text-white overflow-x-auto whitespace-pre bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-xl p-4 leading-relaxed">
                                            {fmtJson(payload)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Signature */}
                        <div className={cardCls}>
                            <div className="px-5 py-3 bg-gradient-to-r from-cyan-50 to-transparent dark:from-cyan-900/20 border-b border-cyan-100 dark:border-cyan-900/30 flex items-center justify-between">
                                <h2 className="text-sm font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />SIGNATURE
                                </h2>
                                <CopyBtn text={sig} label="signature" />
                            </div>
                            <div className="p-5">
                                <div className="flex items-start gap-2 mb-3 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 dark:text-amber-400">Signature verification requires the secret key or public key. It is <strong>not performed</strong> client-side — this tool decodes only. Never paste production secrets here.</p>
                                </div>
                                <code className="text-sm font-mono text-cyan-600 dark:text-cyan-400 break-all">{sig}</code>
                            </div>
                        </div>
                    </>
                )}

                {/* ── SEO Content ── */}
                <div className="mt-12 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free JWT Decoder — Decode & Inspect JSON Web Tokens Online</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            A JSON Web Token (JWT) is a compact, digitally signed data format used widely in modern web authentication and authorisation systems. When you log in to a web application, the server often responds with a JWT — a self-contained token that tells the application who you are and what you are allowed to do, without the server needing to query a database on every request.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The OmniWebKit JWT Decoder lets you paste any JWT token and instantly see the decoded contents in a clean, readable format. The tool separates the three parts of the token — Header, Payload, and Signature — and displays them with clear labels, colour coding, and human-readable timestamps for date claims like exp (expiration), iat (issued at), and nbf (not before). If the token has already expired, a red banner tells you how long ago it expired. If it is still valid, a green banner shows how much time is left.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Three sample tokens are included — a basic token, an expired token, and a rich-claims token with multiple standard claims — so you can explore the decoder without needing a real token. All decoding happens entirely in your browser. No token data is sent to any server.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">The Three Parts of a JWT Explained</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Every JWT consists of three Base64URL-encoded parts joined by dots: <code className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-1 rounded text-violet-600 dark:text-violet-400">header.payload.signature</code>. Understanding each part is essential for working with authentication systems.
                        </p>
                        <div className="space-y-4">
                            {[
                                {
                                    color: 'border-red-500 bg-red-50 dark:bg-red-900/10',
                                    badge: 'bg-red-500 text-white',
                                    title: 'Header',
                                    body: 'The header contains metadata about the token itself. It always specifies the type of token (typ: "JWT") and the signing algorithm used to create the signature (alg). Common algorithms include HS256 (HMAC-SHA256, symmetric), RS256 (RSA-SHA256, asymmetric), and ES256 (ECDSA-SHA256). The header may also include a Key ID (kid) to help the server select the correct key for verification. The header is Base64URL encoded — not encrypted. Anyone who has the token can read it.',
                                },
                                {
                                    color: 'border-violet-500 bg-violet-50 dark:bg-violet-900/10',
                                    badge: 'bg-violet-500 text-white',
                                    title: 'Payload (Claims)',
                                    body: 'The payload contains the "claims" — statements about an entity (usually the user) and additional metadata. Standard registered claims include sub (subject/user ID), iss (issuer/auth server URL), aud (audience/intended app), exp (expiration Unix timestamp), iat (issued-at Unix timestamp), nbf (not-before timestamp), and jti (unique token ID). Private claims are custom fields added by your application, such as role, email, name, scope, or any other data the app needs. Like the header, the payload is Base64URL encoded and readable by anyone with the token — never put sensitive secrets in it.',
                                },
                                {
                                    color: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10',
                                    badge: 'bg-cyan-500 text-white',
                                    title: 'Signature',
                                    body: 'The signature is created by the server using the encoded header, the encoded payload, and a secret key. It is what makes the JWT tamper-proof. If anyone modifies the header or payload after the token is issued, the signature becomes invalid and the server will reject the token. For HS256, a shared secret key is used. For RS256, the server signs with a private key and recipients verify with the server\'s public key. This decoder shows the raw signature but does not verify it — signature verification requires the secret or public key and is performed server-side.',
                                },
                            ].map(({ color, badge, title, body }) => (
                                <div key={title} className={`border-l-4 ${color} rounded-xl p-5`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${badge}`}>{title}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Standard JWT Claims Reference</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 dark:bg-slate-900/50">
                                        {['Claim', 'Full Name', 'Type', 'Description'].map(h => (
                                            <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['iss', 'Issuer', 'String', 'The URL of the server that issued the token (e.g. https://auth.example.com)'],
                                        ['sub', 'Subject', 'String', 'The unique identifier of the user or entity the token represents'],
                                        ['aud', 'Audience', 'String/Array', 'The intended recipient(s) of the token — usually your application\'s client ID'],
                                        ['exp', 'Expiration Time', 'Unix timestamp', 'After this time the token is invalid. Validated server-side on every request.'],
                                        ['nbf', 'Not Before', 'Unix timestamp', 'The token is not valid before this time. Useful for delayed activation.'],
                                        ['iat', 'Issued At', 'Unix timestamp', 'When the token was created. Used to determine how old the token is.'],
                                        ['jti', 'JWT ID', 'String', 'A unique identifier for this specific token. Used to prevent token replay attacks.'],
                                    ].map(([claim, name, type, desc], i) => (
                                        <tr key={claim} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800/30' : 'bg-slate-50 dark:bg-slate-900/20'}>
                                            <td className="px-4 py-2.5 font-mono font-black text-violet-600 dark:text-violet-400 text-xs border border-slate-200 dark:border-slate-700">{claim}</td>
                                            <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700">{name}</td>
                                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700 font-mono">{type}</td>
                                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700">{desc}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is it safe to paste my JWT here?', a: 'This tool decodes JWTs entirely in your browser. No data is sent to any server. That said, treat your JWTs like passwords — avoid pasting valid production tokens on any public website. Use sample tokens or expired tokens for testing.' },
                                { q: 'Why can\'t I verify the signature here?', a: 'Signature verification requires either the secret key (for HS256) or the server\'s public key (for RS256/ES256). This decoder is a client-side tool that decodes and displays the token contents — verification must be done server-side with the appropriate key.' },
                                { q: 'What is the difference between HS256 and RS256?', a: 'HS256 (HMAC-SHA256) uses a shared symmetric secret key — the same key is used to sign and verify. RS256 (RSA-SHA256) uses an asymmetric key pair: a private key to sign and a public key to verify. RS256 is preferred in distributed systems where multiple services need to verify tokens without sharing a secret.' },
                                { q: 'Why does the payload say the token is expired?', a: 'The exp claim (expiration time) is a Unix timestamp. If the current time is past that timestamp, the token is expired. Expired tokens are rejected by servers. This decoder shows human-readable expiry information to help you debug token issues.' },
                                { q: 'Can I decode JWT tokens from any provider?', a: 'Yes. JWTs have a standard structure regardless of which library or provider created them (Auth0, Firebase, Cognito, Keycloak, custom servers, etc.). Any valid JWT with 3 dot-separated Base64URL-encoded parts can be decoded here.' },
                                { q: 'Are claims in the payload encrypted?', a: 'No. The payload (and header) are Base64URL encoded, which is just a way of converting binary data to text. It is not encryption. Anyone with access to the token can decode and read the claims. Never put passwords, credit card numbers, or other sensitive data in a JWT payload.' },
                                { q: 'What is the JWT token format?', a: 'A JWT is three Base64URL-encoded strings joined by dots: header.payload.signature. The header and payload are JSON objects. The signature is a cryptographic hash of the header and payload using the algorithm specified in the header.' },
                                { q: 'What does "not before" (nbf) mean?', a: 'The nbf claim specifies a time before which the token must not be accepted. Servers should reject tokens where the current time is before the nbf timestamp. This is useful for issuing tokens in advance that should only become valid at a specific future time.' },
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
