'use client';
import { useState, useCallback } from 'react';
import { Link2, Copy, Check, Trash2, ExternalLink, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

function useToast() {
    const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
    const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
    const el = msg ? (<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}</div>) : null;
    return { show, el };
}

function shortCode() { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < 6; i++)s += c.charAt(Math.floor(Math.random() * c.length)); return s; }

export default function UrlShortener() {
    const [url, setUrl] = useState('');
    const [alias, setAlias] = useState('');
    const [links, setLinks] = useState(() => { if (typeof window !== 'undefined') { try { return JSON.parse(localStorage.getItem('owk_short_links') || '[]'); } catch { return []; } } return []; });
    const [copied, setCopied] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://omniwebkit.com';

    const save = (n) => { setLinks(n); if (typeof window !== 'undefined') localStorage.setItem('owk_short_links', JSON.stringify(n)); };

    const shorten = useCallback(async () => {
        let u = url.trim(); if (!u) { toast.show('Paste a URL first', 'err'); return; }
        if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
        try { new URL(u); } catch { toast.show('Invalid URL', 'err'); return; }
        
        setLoading(true);
        try {
            const res = await fetch('/api/shorten', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: u, customSlug: alias.trim() })
            });
            const data = await res.json();
            
            if (!res.ok) {
                toast.show(data.error || 'Failed to shorten URL', 'err');
                return;
            }

            const nl = { 
                id: Date.now(), 
                originalUrl: data.originalUrl, 
                code: data.slug, 
                shortUrl: `${BASE}${data.shortUrl}`, 
                createdAt: new Date().toISOString(), 
                clicks: 0 
            };
            save([nl, ...links]); 
            setUrl(''); 
            setAlias('');
            
            navigator.clipboard.writeText(nl.shortUrl);
            setCopied(nl.id.toString()); 
            setTimeout(() => setCopied(''), 2000);
            toast.show('Shortened & copied!');
        } catch (err) {
            toast.show('Network error', 'err');
        } finally {
            setLoading(false);
        }
    }, [url, alias, links, BASE]);

    const del = (id) => { save(links.filter(l => l.id !== id)); toast.show('Deleted'); };
    const clear = () => { save([]); toast.show('All cleared'); };
    const cp = (lk) => { navigator.clipboard.writeText(lk.shortUrl); setCopied(lk.id.toString()); setTimeout(() => setCopied(''), 2000); toast.show('Copied!'); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {toast.el}
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
                        <Link2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">URL Shortener</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Create short, shareable links instantly</p>
                </div>

                {/* Form */}
                <div className={`${cardCls} p-5 mb-5`}>
                    <label className={labelCls}>Long URL</label>
                    <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste your long URL here..."
                        className={`${inputCls} mb-3`} onKeyDown={e => e.key === 'Enter' && shorten()} />

                    <label className={labelCls}>Custom Alias (optional)</label>
                    <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-3">
                        <span className="px-3 text-[10px] font-bold text-slate-400 whitespace-nowrap border-r border-slate-200 dark:border-slate-700 py-2.5">{BASE}/s/</span>
                        <input value={alias} onChange={e => setAlias(e.target.value.replace(/[^a-zA-Z0-9\-_]/g, ''))} placeholder="custom-alias"
                            className="flex-1 px-3 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white outline-none font-mono" />
                    </div>

                    <button onClick={shorten} disabled={!url.trim() || loading}
                        className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Shortening...</> : <><Link2 className="w-4 h-4" />Shorten URL</>}
                    </button>

                    <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Note:</strong> Short URLs are saved permanently to database. Your link history is saved locally in this browser.</p>
                    </div>
                </div>

                {/* Links */}
                {links.length > 0 && (
                    <div className={`${cardCls} p-5 mb-5`}>
                        <div className="flex items-center justify-between mb-3">
                            <label className={labelCls}>{links.length} Shortened URLs</label>
                            <button onClick={clear} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition flex items-center gap-1"><RotateCcw className="w-3 h-3" />Clear All</button>
                        </div>
                        <div className="space-y-2">
                            {links.map(lk => (
                                <div key={lk.id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 group">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">{lk.shortUrl}</p>
                                                <button onClick={() => cp(lk)} className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition">
                                                    {copied === lk.id.toString() ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                </button>
                                                <a href={lk.originalUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition">
                                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                                </a>
                                            </div>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{lk.originalUrl}</p>
                                            <p className="text-[9px] text-slate-400 mt-0.5">{new Date(lk.createdAt).toLocaleString()}</p>
                                        </div>
                                        <button onClick={() => del(lk.id)}
                                            className="p-1.5 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0">
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online URL Shortener — Create Short Links Instantly</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Long URLs are messy. They break in emails, look unprofessional in presentations, and take up too many characters in social media posts. A URL shortener solves all three problems. It takes a long web address and turns it into a compact, shareable link that redirects to the original page.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This free URL Shortener lets you paste any URL and generate a short link in one click. You can also set a custom alias so the short link is easy to remember and matches your brand. The tool automatically copies the short URL to your clipboard, so you can paste it right away.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            All shortened links are stored locally in your browser using localStorage. This means no account is needed, no data is sent to a server, and your links persist across sessions until you clear them. The links list shows the original URL, short URL, creation date, and gives you copy, visit, and delete controls.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            URL shorteners are essential for marketers, content creators, developers, and anyone who shares links regularly. Whether you are posting on Twitter, embedding links in emails, or creating QR codes, short URLs are cleaner, more trackable, and more reliable. This tool provides the complete client-side interface for URL shortening with zero friction.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Instant Shortening', c: 'text-indigo-600 dark:text-indigo-400', b: 'Paste a URL and click Shorten. The short link is generated and copied to your clipboard instantly. No waiting, no signups.' },
                                { t: 'Custom Aliases', c: 'text-violet-600 dark:text-violet-400', b: 'Set a memorable custom alias instead of a random code. Great for branding and easy sharing.' },
                                { t: 'Local Storage', c: 'text-blue-600 dark:text-blue-400', b: 'All links are stored in your browser. No server, no data collection. Your links persist across sessions.' },
                                { t: 'Auto URL Validation', c: 'text-emerald-600 dark:text-emerald-400', b: 'The tool validates your URL and prepends https:// if missing. Invalid URLs are rejected with a clear error.' },
                                { t: 'Copy, Visit & Delete', c: 'text-amber-600 dark:text-amber-400', b: 'Each link has copy, visit (opens in new tab), and delete buttons. Clear all links in one click.' },
                                { t: 'Duplicate Alias Check', c: 'text-rose-600 dark:text-rose-400', b: 'If you try to use a custom alias that already exists, the tool warns you and prevents duplicates.' },
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
                                { q: 'Is this URL shortener free?', a: 'Yes, completely free with no account, no limits, and no ads.' },
                                { q: 'Do the short links actually redirect?', a: 'Yes! All generated short links use server-side 302 redirects to send users seamlessly to the original destination.' },
                                { q: 'Where are my links stored?', a: 'The short URLs are saved securely in our database. The list of links you created is stored locally in your browser so only you can manage them.' },
                                { q: 'Can I use a custom alias?', a: 'Yes. Enter any alphanumeric alias (letters, numbers, hyphens) in the custom alias field.' },
                                { q: 'What happens if I use a duplicate alias?', a: 'The tool checks the database for duplicates and shows an error if that alias is already taken. Choose a different alias.' },
                                { q: 'Does it track clicks?', a: 'Yes, the backend tracks total clicks for each short link.' },
                                { q: 'Does it send data to a server?', a: 'Yes, the original URL and alias are sent to the server to create the redirect mapping.' },
                                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive and works on all screen sizes.' },
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
