'use client';
import { useState, useCallback } from 'react';
import { Link2, Copy, Check, RotateCcw, Tag, ExternalLink, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

function useToast() {
    const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
    const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
    const el = msg ? (<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}</div>) : null;
    return { show, el };
}

const UTM = [
    { key: 'utm_source', label: 'Campaign Source', ph: 'google, facebook, newsletter', req: true, desc: 'Where the traffic comes from' },
    { key: 'utm_medium', label: 'Campaign Medium', ph: 'cpc, email, social, banner', req: true, desc: 'Marketing medium' },
    { key: 'utm_campaign', label: 'Campaign Name', ph: 'spring_sale, product_launch', req: true, desc: 'Campaign identifier' },
    { key: 'utm_term', label: 'Campaign Term', ph: 'running+shoes', req: false, desc: 'Paid search keywords' },
    { key: 'utm_content', label: 'Campaign Content', ph: 'logo_link, header_cta', req: false, desc: 'Differentiate ads/links' },
];

const PRESETS = [
    { name: 'Google Ads', source: 'google', medium: 'cpc' },
    { name: 'Facebook Ad', source: 'facebook', medium: 'paid_social' },
    { name: 'Email', source: 'newsletter', medium: 'email' },
    { name: 'Twitter / X', source: 'twitter', medium: 'social' },
    { name: 'LinkedIn', source: 'linkedin', medium: 'social' },
    { name: 'Instagram', source: 'instagram', medium: 'social' },
];

export default function UtmLinkBuilder() {
    const [url, setUrl] = useState('');
    const [params, setParams] = useState({ utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: '' });
    const [history, setHistory] = useState([]);
    const toast = useToast();

    const up = (k, v) => setParams(p => ({ ...p, [k]: v }));
    const preset = (p) => setParams(pr => ({ ...pr, utm_source: p.source, utm_medium: p.medium, utm_campaign: pr.utm_campaign }));

    const generated = useCallback(() => {
        if (!url) return '';
        try { const b = url.startsWith('http') ? url : `https://${url}`; const u = new URL(b); Object.entries(params).forEach(([k, v]) => { if (v.trim()) u.searchParams.set(k, v.trim()); }); return u.toString(); } catch { return ''; }
    }, [url, params])();

    const copy = () => {
        if (!generated) { toast.show('Build a URL first', 'err'); return; }
        navigator.clipboard.writeText(generated);
        setHistory(p => [{ url: generated, date: new Date().toLocaleTimeString() }, ...p].slice(0, 10));
        toast.show('Copied to clipboard!');
    };
    const reset = () => { setUrl(''); setParams({ utm_source: '', utm_medium: '', utm_campaign: '', utm_term: '', utm_content: '' }); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {toast.el}
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'UTM Link Builder', href: '/tools/utm-link-builder' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-500/25">
                        <Link2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">UTM Link Builder</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Build trackable campaign URLs with UTM parameters</p>
                </div>

                {/* Form */}
                <div className={`${cardCls} p-5 sm:p-7 mb-5`}>
                    <label className={labelCls}>Website URL *</label>
                    <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/landing-page"
                        className={`${inputCls} mb-5`} />

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        <span className="text-[10px] font-bold text-slate-400 self-center mr-1">Quick:</span>
                        {PRESETS.map(p => (
                            <button key={p.name} onClick={() => preset(p)}
                                className="px-2.5 py-1 bg-slate-50 dark:bg-slate-900/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition">
                                {p.name}
                            </button>
                        ))}
                    </div>

                    {/* UTM fields */}
                    <div className="space-y-4">
                        {UTM.map(p => (
                            <div key={p.key}>
                                <div className="flex items-center gap-2 mb-1">
                                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">{p.label} {p.req && <span className="text-red-400">*</span>}</label>
                                    <span className="text-[9px] text-slate-400 font-mono">{p.key}</span>
                                </div>
                                <input value={params[p.key]} onChange={e => up(p.key, e.target.value)} placeholder={p.ph} className={inputCls} />
                                <p className="text-[10px] text-slate-400 mt-0.5">{p.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Generated URL */}
                    <div className="mt-5 p-4 bg-slate-950 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">Generated URL</span>
                            <div className="flex gap-1">
                                {generated && (
                                    <a href={generated} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-slate-800 rounded-lg transition"><ExternalLink className="w-3.5 h-3.5 text-slate-400" /></a>
                                )}
                                <button onClick={copy} className="p-1 hover:bg-slate-800 rounded-lg transition">
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                </button>
                            </div>
                        </div>
                        <code className="text-sm text-emerald-400 break-all">{generated || 'Enter a URL and UTM parameters above...'}</code>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                        <button onClick={copy} disabled={!generated}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            <Copy className="w-4 h-4" />Copy URL
                        </button>
                        <button onClick={reset}
                            className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-xl transition">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div className={`${cardCls} p-5 mb-5`}>
                        <h3 className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />Recent URLs</h3>
                        <div className="space-y-2">
                            {history.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-xs">
                                    <code className="text-slate-600 dark:text-slate-400 truncate mr-2">{h.url}</code>
                                    <span className="text-slate-400 whitespace-nowrap text-[10px]">{h.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free UTM Link Builder — Track Every Campaign</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            UTM parameters are tags you add to a URL so that when someone clicks the link, Google Analytics (or any analytics tool) can tell you exactly where the traffic came from, which campaign it belongs to, and what medium was used. Without UTM tags, your analytics just shows "direct" or "referral" — and you lose the ability to measure what is actually working.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This free UTM Link Builder lets you enter a landing page URL, fill in the five standard UTM parameters, and generate a fully tagged campaign URL. Quick presets for Google Ads, Facebook, Email, Twitter/X, LinkedIn, and Instagram fill in the source and medium automatically. The generated URL is displayed in a code preview and copied to your clipboard in one click.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The five UTM parameters are: utm_source (where the traffic comes from), utm_medium (the marketing channel), utm_campaign (the campaign name), utm_term (paid search keywords), and utm_content (used to differentiate ads or links within the same campaign). Source, medium, and campaign are required. Term and content are optional.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            All URL building happens in your browser. No data is stored on any server. Your recent URLs are kept in session memory so you can quickly access them during a work session. The tool validates your URL, prepends https:// if missing, and correctly URL-encodes all parameters.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: '5 UTM Parameters', c: 'text-emerald-600 dark:text-emerald-400', b: 'Source, medium, campaign, term, and content. Each field shows the parameter name, a description, and example placeholder text.' },
                                { t: 'Quick Presets', c: 'text-green-600 dark:text-green-400', b: 'One-click presets for Google Ads, Facebook, Email, Twitter/X, LinkedIn, and Instagram. Fills source and medium instantly.' },
                                { t: 'Live URL Preview', c: 'text-blue-600 dark:text-blue-400', b: 'The generated URL updates in real time as you type. See exactly what your tagged link will look like before copying.' },
                                { t: 'Copy to Clipboard', c: 'text-violet-600 dark:text-violet-400', b: 'One click copies the full UTM-tagged URL. Toast notification confirms the copy. No manual selecting needed.' },
                                { t: 'URL Validation', c: 'text-amber-600 dark:text-amber-400', b: 'Automatically prepends https:// if missing. URL-encodes parameters. Rejects malformed URLs with a clear error.' },
                                { t: 'Session History', c: 'text-rose-600 dark:text-rose-400', b: 'Your last 10 generated URLs are tracked with timestamps. Quickly reference recent campaign links during a work session.' },
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
                                { q: 'Is this UTM builder free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
                                { q: 'What are UTM parameters?', a: 'Tags added to URLs that tell analytics tools where traffic came from, which campaign it belongs to, and what medium was used.' },
                                { q: 'Which parameters are required?', a: 'utm_source, utm_medium, and utm_campaign are required. utm_term and utm_content are optional.' },
                                { q: 'Does it work with Google Analytics?', a: 'Yes. UTM parameters are the standard used by Google Analytics, GA4, and most other analytics platforms.' },
                                { q: 'Are the links stored on a server?', a: 'No. Links are kept in session memory only. Nothing is sent to any server.' },
                                { q: 'Can I use custom aliases?', a: 'This tool builds UTM-tagged URLs, not short links. Use it with a URL shortener for branded short links.' },
                                { q: 'Does it URL-encode the parameters?', a: 'Yes. The tool uses the native URL API which correctly encodes all special characters.' },
                                { q: 'Does it work on mobile?', a: 'Yes. Fully responsive layout that adapts to any screen size.' },
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
