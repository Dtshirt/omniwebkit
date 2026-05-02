'use client';
import { useState, useEffect, useCallback } from 'react';
import { Mail, CheckCircle, XCircle, Loader2, Copy, Check, Trash2, Upload, Download, Filter, AlertTriangle, Info } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const KNOWN_PROVIDERS = new Set([
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'protonmail.com', 'icloud.com',
    'aol.com', 'mail.com', 'zoho.com', 'yandex.com', 'msn.com', 'live.com', 'me.com',
    'pm.me', 'fastmail.com', 'gmx.com', 'gmx.net', 'tutanota.com', 'hey.com',
    'proton.me', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.fr', 'googlemail.com',
]);

const DISPOSABLE = new Set([
    'guerrillamail.com', 'mailinator.com', 'tempmail.com', 'throwaway.email', 'yopmail.com',
    'sharklasers.com', 'guerrillamailblock.com', 'grr.la', 'dispostable.com', 'trashmail.com',
    '10minutemail.com', 'temp-mail.org', 'getnada.com', 'spamgourmet.com', 'maildrop.cc',
    'fakeinbox.com', 'mailnull.com', 'spamgox.com', 'trashmail.at', 'getairmail.com',
    'discard.email', 'throwam.com', 'spamherе.com', 'filzmail.com', 'spam4.me',
    'tempr.email', 'crap.email', 'mailexpire.com', 'sogetthis.com', 'meltmail.com',
    'incognitomail.org', 'spam.la', 'spambox.us', 'spaml.com', 'mailnew.com',
    'sharedmailbox.org', 'tempemail.net', 'throwam.com', 'wegwerfemail.de', 'fakemailgenerator.com',
    'emailondeck.com', 'tempinbox.com', 'mohmal.com', 'bouncr.com', 'instantemailaddress.com',
]);

const ROLE_ADDRS = new Set([
    'admin', 'info', 'support', 'contact', 'sales', 'help', 'webmaster', 'postmaster',
    'noreply', 'no-reply', 'abuse', 'hostmaster', 'usenet', 'news', 'root', 'www', 'uucp',
]);

const FORMAT_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/* ─── Validation engine ─────────────────────────────────────────────────── */
function validateEmail(addr) {
    const e = addr.trim().toLowerCase();
    if (!e) return null;
    const checks = [];

    const validFormat = FORMAT_REGEX.test(e);
    checks.push({ label: 'Valid format', pass: validFormat, warn: false, detail: validFormat ? 'RFC 5322 compliant format' : 'Does not match the email address pattern' });
    if (!validFormat) return { email: e, valid: false, checks, score: 0, status: 'invalid' };

    const [local, domain] = e.split('@');

    const localOk = local.length >= 1 && local.length <= 64;
    checks.push({ label: 'Local part length', pass: localOk, warn: false, detail: `${local.length} char${local.length !== 1 ? 's' : ''} (1–64 allowed)` });

    const noConsecDots = !local.includes('..');
    checks.push({ label: 'No consecutive dots', pass: noConsecDots, warn: false, detail: noConsecDots ? 'No consecutive dots found' : 'Contains consecutive dots (..) which are not allowed' });

    const noDotEdge = !local.startsWith('.') && !local.endsWith('.');
    checks.push({ label: 'No leading/trailing dot', pass: noDotEdge, warn: false, detail: noDotEdge ? 'Local part has no edge dots' : 'Local part starts or ends with a dot' });

    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1];
    const hasTld = domainParts.length >= 2 && tld.length >= 2;
    checks.push({ label: 'Valid TLD', pass: hasTld, warn: false, detail: hasTld ? `.${tld} (${tld.length} chars)` : 'Missing or invalid top-level domain' });

    const domainLenOk = domain.length <= 253;
    checks.push({ label: 'Domain length', pass: domainLenOk, warn: false, detail: `${domain.length} chars (max 253)` });

    const noDomainHyphen = !domain.startsWith('-') && !domain.endsWith('-');
    checks.push({ label: 'Domain hyphen rule', pass: noDomainHyphen, warn: false, detail: noDomainHyphen ? 'Domain does not start or end with a hyphen' : 'Domain starts or ends with a hyphen (invalid)' });

    const isDisposable = DISPOSABLE.has(domain);
    checks.push({ label: 'Not disposable', pass: !isDisposable, warn: false, detail: isDisposable ? 'Disposable / temporary email provider detected' : 'Not a known disposable email provider' });

    const isRole = ROLE_ADDRS.has(local);
    checks.push({ label: 'Not role-based', pass: !isRole, warn: isRole, detail: isRole ? `"${local}" is a role-based address (admin, info, etc.)` : 'Appears to be a personal address' });

    const isKnown = KNOWN_PROVIDERS.has(domain);
    checks.push({ label: 'Recognized provider', pass: isKnown, warn: !isKnown, detail: isKnown ? 'Recognized consumer email provider' : 'Custom or business domain — may still be valid' });

    const passCount = checks.filter(c => c.pass).length;
    const score = Math.round((passCount / checks.length) * 100);
    const valid = validFormat && hasTld && !isDisposable && localOk && noConsecDots && noDotEdge && domainLenOk;
    const status = !valid ? 'invalid' : score >= 80 ? 'valid' : 'warning';

    return { email: e, valid, checks, score, status, domain, local };
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const scoreColor = s => s >= 80 ? 'text-emerald-500' : s >= 50 ? 'text-amber-500' : 'text-red-500';
const scoreBg = s => s >= 80 ? 'bg-emerald-500' : s >= 50 ? 'bg-amber-500' : 'bg-red-500';
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

export default function EmailValidator() {
    const [email, setEmail] = useState('');
    const [bulk, setBulk] = useState('');
    const [mode, setMode] = useState('single');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [liveResult, setLive] = useState(null);
    const [bulkFilter, setBulkFilter] = useState('all'); // all | valid | invalid

    /* ── Live single validation as you type ── */
    useEffect(() => {
        if (mode !== 'single') return;
        if (!email.trim()) { setLive(null); return; }
        const t = setTimeout(() => setLive(validateEmail(email)), 250);
        return () => clearTimeout(t);
    }, [email, mode]);

    /* ── Run bulk validation ── */
    const runBulk = () => {
        setLoading(true);
        setTimeout(() => {
            const emails = bulk.split('\n').map(l => l.trim()).filter(Boolean);
            setResults(emails.map(e => validateEmail(e)));
            setLoading(false);
        }, 200);
    };

    /* ── Paste from clipboard ── */
    const pasteClipboard = async () => {
        try { const t = await navigator.clipboard.readText(); setBulk(p => (p ? p + '\n' : '') + t.trim()); } catch { }
    };

    /* ── Export CSV ── */
    const exportCSV = () => {
        const csv = 'Email,Status,Score,Domain\n' + results.map(r => `${r.email},${r.status},${r.score}%,${r.domain || ''}`).join('\n');
        const a = Object.assign(document.createElement('a'), { href: 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv), download: 'email-validation-results.csv' });
        a.click();
    };

    /* ── Copy CSV to clipboard ── */
    const copyCSV = () => {
        const csv = results.map(r => `${r.email},${r.status},${r.score}%`).join('\n');
        navigator.clipboard.writeText(csv);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    /* ── Filtered bulk results ── */
    const filtered = results.filter(r => bulkFilter === 'all' || r.status === bulkFilter || (bulkFilter === 'invalid' && r.status === 'invalid') || (bulkFilter === 'valid' && (r.status === 'valid' || r.status === 'warning')));

    /* ── Status badge ── */
    const StatusBadge = ({ status }) => {
        const map = {
            valid: { cls: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', label: 'Valid' },
            warning: { cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', label: 'Valid (warning)' },
            invalid: { cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', label: 'Invalid' },
        };
        const { cls, label } = map[status] || map.invalid;
        return <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${cls}`}>{label}</span>;
    };

    /* ── Single result card ── */
    const ResultCard = ({ r }) => (
        <div className={`${cardCls} p-5 shadow-sm`}>
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3 min-w-0">
                    {r.status === 'valid'
                        ? <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                        : r.status === 'warning'
                            ? <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                            : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm break-all">{r.email}</p>
                        <StatusBadge status={r.status} />
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <span className={`text-2xl font-bold ${scoreColor(r.score)}`}>{r.score}%</span>
                    <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mt-1">
                        <div className={`h-full rounded-full ${scoreBg(r.score)} transition-all`} style={{ width: `${r.score}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">quality score</p>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-1.5">
                {r.checks.map((c, i) => (
                    <div key={i} className={`flex items-start gap-2.5 px-3 py-2 rounded-xl text-xs ${c.pass ? (c.warn ? 'bg-amber-50 dark:bg-amber-900/10' : 'bg-emerald-50 dark:bg-emerald-900/10') : 'bg-red-50 dark:bg-red-900/10'}`}>
                        {c.pass
                            ? <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${c.warn ? 'text-amber-500' : 'text-emerald-500'}`} />
                            : <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-500" />}
                        <div>
                            <span className={`font-semibold ${c.pass ? (c.warn ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400') : 'text-red-700 dark:text-red-400'}`}>{c.label}</span>
                            <span className="text-slate-500 dark:text-slate-400 ml-1">— {c.detail}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Email Validator', href: '/tools/email-validator' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-teal-500/25">
                        <Mail className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Email Validator</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Check email addresses for format, domain, deliverability, and quality score</p>
                </div>

                {/* Input card */}
                <div className={`${cardCls} p-6 mb-6 shadow-sm`}>
                    {/* Mode toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 mb-5 w-fit gap-1">
                        {[{ v: 'single', label: 'Single Email' }, { v: 'bulk', label: 'Bulk Check' }].map(({ v, label }) => (
                            <button key={v} onClick={() => { setMode(v); setResults([]); setLive(null); }}
                                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${mode === v ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {mode === 'single' ? (
                        <div className="relative mb-4">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && email && setResults([validateEmail(email)])}
                                placeholder="Enter email address to validate…"
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-teal-500 focus:outline-none transition" />
                            {/* Inline live indicator */}
                            {liveResult && (
                                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                                    {liveResult.status === 'valid' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : liveResult.status === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Email addresses (one per line)</span>
                                <button onClick={pasteClipboard} className="flex items-center gap-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
                                    <Upload className="w-3 h-3" />Paste from clipboard
                                </button>
                            </div>
                            <textarea value={bulk} onChange={e => setBulk(e.target.value)} placeholder="user@example.com&#10;another@domain.org&#10;test@gmail.com" rows={6}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-teal-500 focus:outline-none font-mono resize-none transition" />
                            <p className="text-xs text-slate-400 mt-1">{bulk.split('\n').filter(l => l.trim()).length} address{bulk.split('\n').filter(l => l.trim()).length !== 1 ? 'es' : ''} entered</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {mode === 'single' ? (
                            <>
                                <button onClick={() => email && setResults([validateEmail(email)])} disabled={!email}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed">
                                    <Mail className="w-4 h-4" />Validate Email
                                </button>
                                {email && <button onClick={() => { setEmail(''); setLive(null); setResults([]); }}
                                    className="p-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition">
                                    <Trash2 className="w-5 h-5" />
                                </button>}
                            </>
                        ) : (
                            <>
                                <button onClick={runBulk} disabled={loading || !bulk.trim()}
                                    className="flex-1 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed">
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                    {loading ? 'Validating…' : 'Validate All'}
                                </button>
                                <button onClick={() => { setBulk(''); setResults([]); }}
                                    className="p-3.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl transition">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Live single result */}
                {mode === 'single' && liveResult && results.length === 0 && (
                    <div className="mb-4 opacity-60 pointer-events-none">
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 px-1">Live preview</p>
                        <ResultCard r={liveResult} />
                    </div>
                )}

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-4">
                        {/* Bulk summary bar */}
                        {results.length > 1 && (
                            <div className={`${cardCls} p-4 flex flex-wrap items-center justify-between gap-3`}>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{results.length} checked</span>
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{results.filter(r => r.valid).length} valid</span>
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">{results.filter(r => !r.valid).length} invalid</span>
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Avg: {Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)}%</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 gap-0.5">
                                        {[{ v: 'all', label: 'All' }, { v: 'valid', label: '✓ Valid' }, { v: 'invalid', label: '✗ Invalid' }].map(({ v, label }) => (
                                            <button key={v} onClick={() => setBulkFilter(v)}
                                                className={`px-3 py-1 rounded-md text-xs font-bold transition ${bulkFilter === v ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition">
                                        <Download className="w-3 h-3" />CSV
                                    </button>
                                    <button onClick={copyCSV} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition">
                                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}{copied ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {filtered.map((r, i) => <ResultCard key={i} r={r} />)}

                        {filtered.length === 0 && (
                            <div className={`${cardCls} p-8 text-center`}>
                                <Filter className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">No results match the current filter.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* What's checked info box */}
                {results.length === 0 && !(mode === 'single' && liveResult) && (
                    <div className={`${cardCls} p-5`}>
                        <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-teal-500" />What we check</h2>
                        <div className="grid sm:grid-cols-2 gap-2">
                            {[
                                'RFC 5322 format compliance', 'Valid top-level domain (TLD)', 'Local part length (1–64 chars)', 'No consecutive or edge dots',
                                'Domain length (max 253 chars)', 'Hyphen placement rules', 'Disposable email detection (40+ providers)', 'Role-based address detection',
                                'Recognized consumer provider', 'Quality score (0–100%)',
                            ].map(item => (
                                <div key={item} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <CheckCircle className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />{item}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ─── SEO Content ─────────────────────────────────────────────────── */}
                <div className="mt-16 space-y-5">
                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Email Validator — Check Email Addresses for Format, Deliverability & Quality</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Sending an email to an invalid address isn't just wasted effort — it can hurt your sender reputation, inflate your bounce rate, and even get your domain flagged by email service providers. The OmniWebKit Email Validator helps you catch bad addresses before they cause problems. It works entirely in your browser, requires no sign-up, and gives you a detailed quality report for every email address you check.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Whether you're cleaning up a marketing list, verifying user sign-ups, or just confirming a single address, this tool covers all the important checks: format compliance, domain structure, disposable email detection, role-based address flagging, and a 0–100% quality score that tells you at a glance how trustworthy each address is.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            The Bulk Check mode lets you validate up to hundreds of addresses at once, filter results by valid/invalid, and export everything as a CSV file with one click. Real-time validation in Single mode shows you the result as you type — no button press needed.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Every Check Explained</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                            The validator runs ten distinct checks on each address and combines the results into a quality score. Here's exactly what each check looks for:
                        </p>
                        <div className="space-y-3">
                            {[
                                { title: 'RFC 5322 Format Compliance', desc: 'The most important check. RFC 5322 is the internet standard that defines what a valid email address looks like. An address must have exactly one @ symbol, with a local part before it and a domain after it. The local part can contain letters, numbers, and certain special characters. The domain must follow specific hostname rules. Many validators stop here — ours goes much further.' },
                                { title: 'Valid Top-Level Domain (TLD)', desc: 'The TLD is the last part of the domain — .com, .org, .io, .uk, and so on. We verify that a TLD exists and is at least two characters long. An address like user@domain will fail this check because there is no TLD.' },
                                { title: 'Local Part Length', desc: 'The local part (everything before the @) must be between 1 and 64 characters according to internet standards. Addresses shorter or longer than this range will not work reliably across all email systems.' },
                                { title: 'No Consecutive or Edge Dots', desc: 'A double dot (..) in the local part makes an address invalid under RFC 5321 and RFC 5322. Similarly, the local part cannot start or end with a dot. These rules exist because mail servers use dots as separators and treat these patterns as formatting errors.' },
                                { title: 'Disposable Email Detection', desc: 'We check the domain against a database of 40+ known disposable and temporary email providers, including Mailinator, Guerrilla Mail, YOPmail, 10 Minute Mail, Temp-Mail, and many others. Disposable addresses are often used to bypass registration requirements and are unlikely to belong to genuine users.' },
                                { title: 'Role-Based Address Detection', desc: 'Addresses like admin@, info@, support@, noreply@, and contact@ are role-based — they go to a team or mailbox rather than an individual. These addresses are flagged with a warning because they often have lower engagement rates and may not work for transactional emails.' },
                                { title: 'Recognized Provider Check', desc: 'We check whether the domain belongs to a well-known consumer email provider like Gmail, Outlook, Yahoo, iCloud, ProtonMail, and others. If the domain is not recognized, it may be a business or custom domain — which is still valid, just noted as unverified.' },
                                { title: 'Quality Score (0–100%)', desc: 'All check results are combined into a percentage score. 80% or above indicates a high-quality, deliverable address. 50–79% suggests potential issues worth reviewing. Below 50% means the address failed critical checks and is unlikely to be valid.' },
                            ].map(({ title, desc }) => (
                                <div key={title} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Email Validation Matters for Marketing and Deliverability</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Your email list is only as good as the addresses in it. A dirty list with invalid addresses hurts you in several ways that compound over time.
                        </p>
                        <div className="space-y-3 mb-4">
                            {[
                                { title: 'Bounce rate', body: 'When emails bounce — because the address doesn\'t exist or the mailbox is full — email service providers like Mailchimp, Klaviyo, and SendGrid track those bounces. Too many hard bounces (permanent failures) and your sending account can be suspended.' },
                                { title: 'Sender reputation', body: 'Internet Service Providers (ISPs) and spam filters score every sender based on bounce rates, spam complaints, and engagement. A poor sender score means your emails start going to the spam folder — not just for the bad addresses, but for everyone on your list.' },
                                { title: 'Cost inefficiency', body: 'Most email platforms charge by subscriber count or email volume. Paying to send emails to addresses that will never deliver is pure waste. Cleaning your list before importing it saves money.' },
                                { title: 'Analytics accuracy', body: 'Invalid addresses skew your open rate, click rate, and conversion metrics. A clean list gives you accurate data to make better decisions.' },
                            ].map(({ title, body }) => (
                                <div key={title} className="flex gap-4">
                                    <span className="text-teal-500 font-bold text-xl flex-shrink-0 mt-0.5">•</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Regular email validation — before sending, before importing, and at the point of sign-up — is one of the most effective things you can do to protect your sender reputation and keep your list healthy.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this email validator free?', a: 'Yes, completely free. No account, no subscription, no usage limits. Both single and bulk validation modes are fully available at no cost.' },
                                { q: 'How many emails can I validate at once?', a: 'The bulk checker can handle hundreds of email addresses in a single pass. Paste one address per line into the Bulk Check tab. For very large lists (10,000+), consider splitting them into batches for best performance.' },
                                { q: 'Does the validator check if an inbox actually exists?', a: 'No — that would require sending a real SMTP probe to the mail server, which is not possible in a browser-based tool and can be blocked by many providers. We validate format, domain structure, and known-bad addresses. For real-time SMTP verification, you would need a server-side API service.' },
                                { q: 'What is a disposable email?', a: 'A disposable email is a temporary address created to receive one message and then discarded. Services like Mailinator and Guerrilla Mail provide these. They are commonly used to bypass registration requirements. Our tool checks against 40+ known disposable providers.' },
                                { q: 'What is a role-based email address?', a: 'A role-based address is tied to a function rather than a person — admin@, info@, support@, noreply@, sales@, and similar. These often have lower engagement and may not reach a real individual. They are flagged with a warning rather than marked invalid.' },
                                { q: 'Can I export the bulk validation results?', a: 'Yes. After running a bulk check, click Download CSV to save the results as a spreadsheet-compatible CSV file containing the email address, status, quality score, and domain for each entry.' },
                                { q: 'Is my data sent to any server?', a: 'No. All validation happens entirely in your browser using JavaScript. Your email addresses are never uploaded to or processed by any external server.' },
                                { q: 'What does the quality score mean?', a: 'The quality score is a percentage from 0–100 based on how many of the ten validation checks each address passes. 80%+ is high quality, 50–79% has minor issues, and below 50% indicates critical failures like an invalid format or disposable provider.' },
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
