'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import Link from 'next/link';
import {
    Link2, Search, CheckCircle, XCircle, AlertTriangle,
    Loader2, Copy, Check, RotateCcw, Download, Filter,
    Globe, Shield, Zap, Info,
} from 'lucide-react';

// ─── Shared styles ─────────────────────────────────────
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';
const inputCls = 'flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400 transition';

const statusPill = (ok, status) => {
    if (ok) return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700';
    if (status === '301' || status === '302') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700';
};

export default function BrokenLinkChecker() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState(0);
    const [copied, setCopied] = useState(false);
    const [filter, setFilter] = useState('all');

    const normalizeUrl = (u) => {
        try {
            if (!u.match(/^https?:\/\//)) u = 'https://' + u;
            return new URL(u).href;
        } catch { return null; }
    };

    const checkLink = async (link) => {
        try {
            const res = await fetch(`/api/broken-link-checker?url=${encodeURIComponent(link)}&mode=check`);
            const data = await res.json();
            return { url: link, status: data.status, ok: data.ok, type: data.type };
        } catch (err) {
            return { url: link, status: 'Error', ok: false, error: err.message };
        }
    };

    const extractLinks = (html, baseUrl) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = new Set();
        doc.querySelectorAll('a[href]').forEach(a => {
            try {
                const href = a.getAttribute('href');
                if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
                links.add(new URL(href, baseUrl).href);
            } catch { }
        });
        return [...links];
    };

    const checkUrl = async () => {
        const normalized = normalizeUrl(url.trim());
        if (!normalized) return;
        setLoading(true); setResults(null); setProgress(0); setFilter('all');
        try {
            const res = await fetch(`/api/broken-link-checker?url=${encodeURIComponent(normalized)}&mode=fetch`);
            if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Could not fetch page'); }
            const { html } = await res.json();
            const links = extractLinks(html, normalized);
            setProgress(5);

            if (!links.length) {
                setResults({ pageUrl: normalized, links: [], total: 0, broken: 0, ok: 0, redirects: 0 });
                setLoading(false); return;
            }

            const checked = [];
            for (let i = 0; i < links.length; i += 5) {
                const batch = links.slice(i, i + 5);
                const batchResults = await Promise.all(batch.map(checkLink));
                checked.push(...batchResults);
                setProgress(Math.round(((i + 5) / links.length) * 100));
            }
            checked.sort((a, b) => a.ok === b.ok ? 0 : a.ok ? 1 : -1);

            setResults({
                pageUrl: normalized,
                links: checked,
                total: checked.length,
                broken: checked.filter(l => !l.ok).length,
                ok: checked.filter(l => l.ok).length,
                redirects: checked.filter(l => l.status === '301' || l.status === '302').length,
            });
        } catch (err) {
            setResults({ pageUrl: normalized, links: [], total: 0, broken: 0, ok: 0, redirects: 0, error: err.message });
        } finally { setLoading(false); setProgress(100); }
    };

    const copyReport = () => {
        if (!results) return;
        const txt = `Broken Link Report: ${results.pageUrl}\nTotal: ${results.total} | Working: ${results.ok} | Broken: ${results.broken}\n\n` +
            results.links.map(l => `${l.ok ? '✓' : '✗'} [${l.status}] ${l.url}`).join('\n');
        navigator.clipboard.writeText(txt);
        setCopied(true); setTimeout(() => setCopied(false), 2000);
    };

    const exportCSV = () => {
        if (!results) return;
        const rows = [['URL', 'Status', 'Working']];
        results.links.forEach(l => rows.push([`"${l.url}"`, l.status, l.ok ? 'Yes' : 'No']));
        const csv = rows.map(r => r.join(',')).join('\n');
        const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'broken-link-report.csv' });
        a.click(); URL.revokeObjectURL(a.href);
    };

    const visibleLinks = results?.links.filter(l => {
        if (filter === 'all') return true;
        if (filter === 'broken') return !l.ok;
        if (filter === 'working') return l.ok;
        return true;
    }) || [];

    const healthPct = results && results.total > 0 ? Math.round(results.ok / results.total * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Broken Link Checker', href: '/tools/broken-link-checker' }]} />

                {/* Hero */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/30">
                        <Link2 className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Broken Link Checker</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Scan any webpage for broken links instantly. Find 404s, server errors, and dead links that hurt your SEO and user experience.
                    </p>
                </div>

                {/* Input card */}
                <div className={`${cardCls} p-6 mb-6`}>
                    <div className="flex gap-3">
                        <input
                            type="url" value={url}
                            onChange={e => setUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !loading && url.trim() && checkUrl()}
                            placeholder="Enter URL (e.g., https://example.com)"
                            className={inputCls}
                        />
                        <button
                            onClick={checkUrl}
                            disabled={!url.trim() || loading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold shadow-md shadow-orange-500/20 transition"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                            {loading ? 'Checking…' : 'Check Links'}
                        </button>
                    </div>

                    {loading && (
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                                <span>Scanning & verifying links…</span>
                                <span className="font-mono font-semibold">{progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Checking links in batches of 5. Larger pages may take a moment.</p>
                        </div>
                    )}
                </div>

                {/* Results */}
                {results && (
                    <div className="space-y-5">

                        {/* Summary stats */}
                        {!results.error ? (
                            <div className={`${cardCls} p-6`}>
                                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                                    <div>
                                        <h2 className="text-base font-bold text-slate-900 dark:text-white">Results</h2>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-all">{results.pageUrl}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={copyReport} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg font-medium transition">
                                            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Report</>}
                                        </button>
                                        <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition">
                                            <Download className="w-3.5 h-3.5" /> CSV
                                        </button>
                                    </div>
                                </div>

                                {/* Link health bar */}
                                <div className="mb-5">
                                    <div className="flex justify-between text-xs font-medium mb-1.5">
                                        <span className="text-slate-600 dark:text-slate-400">Link Health Score</span>
                                        <span className={`font-bold ${healthPct >= 90 ? 'text-emerald-600 dark:text-emerald-400' : healthPct >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{healthPct}%</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-2.5 rounded-full transition-all ${healthPct >= 90 ? 'bg-emerald-500' : healthPct >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${healthPct}%` }} />
                                    </div>
                                </div>

                                {/* Stat cards */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                    {[
                                        { lbl: 'Total Links', val: results.total, bg: 'bg-slate-100 dark:bg-slate-700', tx: 'text-slate-800 dark:text-slate-100' },
                                        { lbl: 'Working', val: results.ok, bg: 'bg-emerald-50 dark:bg-emerald-900/20', tx: 'text-emerald-700 dark:text-emerald-300' },
                                        { lbl: 'Broken', val: results.broken, bg: 'bg-red-50 dark:bg-red-900/20', tx: 'text-red-700 dark:text-red-300' },
                                        { lbl: 'Redirects', val: results.redirects, bg: 'bg-amber-50 dark:bg-amber-900/20', tx: 'text-amber-700 dark:text-amber-300' },
                                    ].map(({ lbl, val, bg, tx }) => (
                                        <div key={lbl} className={`${bg} rounded-xl p-3 text-center`}>
                                            <p className={`text-2xl font-bold ${tx}`}>{val}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lbl}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Filter tabs */}
                                <div className="flex items-center gap-2 mb-4 flex-wrap">
                                    <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                                        {[['all', 'All'], ['broken', 'Broken'], ['working', 'Working']].map(([v, lbl]) => (
                                            <button key={v} onClick={() => setFilter(v)}
                                                className={`px-3 py-1 rounded text-xs font-semibold transition ${filter === v ? 'bg-orange-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>
                                                {lbl}
                                            </button>
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-400 dark:text-slate-500">{visibleLinks.length} link{visibleLinks.length !== 1 ? 's' : ''}</span>
                                </div>

                                {/* Link list */}
                                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                                    {visibleLinks.length === 0 && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">No links match this filter.</p>
                                    )}
                                    {visibleLinks.map((link, i) => (
                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-xl text-xs ${link.ok ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-red-50 dark:bg-red-900/10'}`}>
                                            {link.ok
                                                ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                : <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                                            <Link href={link.url} target="_blank" rel="noopener noreferrer"
                                                className="text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 truncate flex-1 font-mono">
                                                {link.url}
                                            </Link>
                                            <span className={`px-2 py-0.5 rounded-md font-mono font-semibold flex-shrink-0 ${statusPill(link.ok, link.status)}`}>
                                                {link.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={`${cardCls} p-6`}>
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white mb-1">Could not scan this page</p>
                                        <p className="text-sm text-red-600 dark:text-red-400">{results.error}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">The page may block automated requests (CORS, Cloudflare, etc.). Try a different URL or check the page manually.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Info tips */}
                {!results && !loading && (
                    <div className={`${cardCls} p-6 mt-2`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-orange-500" />
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white">How it works</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { icon: Globe, c: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', t: 'Fetch page', d: 'The tool fetches the HTML of your URL through a server-side proxy to avoid CORS restrictions.' },
                                { icon: Search, c: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', t: 'Extract links', d: 'All anchor links are extracted from the page HTML, excluding internal anchors, mailto, and tel links.' },
                                { icon: Shield, c: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', t: 'Check status', d: 'Each link is checked for its HTTP status code in parallel batches of 5. Results are sorted — broken first.' },
                            ].map(({ icon: Icon, c, bg, t, d }) => (
                                <div key={t} className="flex gap-3">
                                    <div className={`flex-shrink-0 w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>
                                        <Icon className={`w-4 h-4 ${c}`} />
                                    </div>
                                    <div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t}</p><p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SEO Content */}
                <div className="mt-16 prose-premium">
                    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "Broken Link Checker",
                        "operatingSystem": "Web",
                        "applicationCategory": "UtilitiesApplication",
                        "offers": {
                            "@type": "Offer",
                            "price": "0.00",
                            "priceCurrency": "USD"
                        },
                        "author": {
                            "@type": "Organization",
                            "name": "Lazydesigners",
                            "url": "https://github.com/Dtshirt/omniwebkit"
                        }
                    }) }} />

                    <div>
                        <h1>Broken Link Checker: Audit Your Site for Dead Links Instantly</h1>
                        <p>
                            A single broken link can kill your conversion rate and tell search engines your site is abandoned. When visitors click a link and hit a 404 error, they leave. It is that simple. For SEO, broken links waste crawl budget and destroy internal link equity. 
                        </p>
                        <p>
                            The <strong>Broken Link Checker</strong> is a free, web-based tool that scans any webpage and finds every dead link, server error, and unexpected redirect. You don't need to install software or configure crawlers. Just drop your URL in the box above, and the tool fetches the page, extracts all the links, and tests each one in real-time. You get a clear, filterable report showing exactly which links work and which ones are broken.
                        </p>
                    </div>

                    <div>
                        <h2>How to Use the Free Broken Link Checker</h2>
                        <p>Scanning a page takes seconds. Follow these steps to find your dead links:</p>
                        <ol>
                            <li><strong>Enter your URL:</strong> Paste the full web address (including the https://) of the page you want to scan into the input box above.</li>
                            <li><strong>Start the Scan:</strong> Click the "Check Links" button. The tool will bypass browser limits using a secure server proxy to fetch your page.</li>
                            <li><strong>Watch the Progress:</strong> The checker extracts all anchor links and tests them in batches. You'll see a live progress bar as it verifies HTTP status codes.</li>
                            <li><strong>Review the Report:</strong> Once finished, check your Link Health Score. Use the filter tabs to view only the broken links (red) or redirects (yellow).</li>
                            <li><strong>Export the Data:</strong> Click "CSV" to download the full report, or "Copy Report" to grab a quick text summary for your team.</li>
                        </ol>
                    </div>

                    <div>
                        <h2>Privacy & Security: Your Data Stays Safe</h2>
                        <p>
                            We built this tool with strict privacy standards. Here is exactly what happens when you run a scan:
                        </p>
                        <ul>
                            <li><strong>No Data Retention:</strong> The tool fetches your page to extract links, but it never stores the HTML content or the resulting report on our servers.</li>
                            <li><strong>Client-Side Filtering:</strong> Once the server returns the link status codes, all filtering and sorting happens directly in your browser.</li>
                            <li><strong>No Tracking:</strong> We don't track which URLs you scan or build databases of your site structure. Your audits remain your business.</li>
                        </ul>
                    </div>

                    <div>
                        <h2>Features That Make This Broken Link Checker Different</h2>
                        <p>
                            Most online link checkers are slow or hide results behind a paywall. Here is why this tool stands out:
                        </p>
                        <ul>
                            <li><strong>Live Batch Processing:</strong> It tests links in parallel batches of five, cutting down scan times dramatically compared to one-by-one checkers.</li>
                            <li><strong>Smart Link Extraction:</strong> It intelligently ignores internal page jumps, mailto links, and javascript functions that cause false positives in other tools.</li>
                            <li><strong>Link Health Score:</strong> Get an instant percentage grade indicating the overall reliability of the outbound and internal links on your page.</li>
                            <li><strong>Filterable Views:</strong> Don't scroll through hundreds of working links to find the dead ones. Click the "Broken" tab to isolate the problems immediately.</li>
                            <li><strong>Instant CSV Export:</strong> Download a clean spreadsheet of your scan results in one click, perfect for sending to clients or developers.</li>
                        </ul>
                    </div>

                    <div>
                        <h2>Technical Specifications & Status Codes Explained</h2>
                        <p>
                            The tool identifies links by checking the raw HTTP response headers. It categorizes them based on the exact status code returned by the server:
                        </p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Status Code</th>
                                    <th>Meaning</th>
                                    <th>Action Required</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>200 OK</strong></td>
                                    <td>The link works perfectly.</td>
                                    <td>None.</td>
                                </tr>
                                <tr>
                                    <td><strong>301 / 302</strong></td>
                                    <td>The URL redirects to another page.</td>
                                    <td>Update the link to the final destination to save a redirect hop.</td>
                                </tr>
                                <tr>
                                    <td><strong>403 Forbidden</strong></td>
                                    <td>The server blocked the request.</td>
                                    <td>Often a false positive if a site blocks bots. Check manually.</td>
                                </tr>
                                <tr>
                                    <td><strong>404 Not Found</strong></td>
                                    <td>The page no longer exists.</td>
                                    <td>Remove the link or find an alternative source.</td>
                                </tr>
                                <tr>
                                    <td><strong>500 Server Error</strong></td>
                                    <td>The target server crashed.</td>
                                    <td>Try again later. If it persists, remove the link.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div>
                        <h2>Frequently Asked Questions (FAQ)</h2>
                        
                        <h3>Does this tool check my entire website?</h3>
                        <p>No, this tool scans one specific webpage at a time. It is designed for deep, fast audits of high-value pages like your homepage, a popular blog post, or a specific resource list.</p>
                        
                        <h3>Why do some working links show up as broken?</h3>
                        <p>Some websites employ strict firewalls (like Cloudflare) that block automated requests. If the target server refuses to answer the tool's ping, it logs a timeout or a 403 error. If you suspect a false positive, click the link to verify it manually.</p>
                        
                        <h3>How many links can it scan at once?</h3>
                        <p>There is no strict limit, but scanning pages with over 500 links may take a few minutes. The tool is optimized to process links in parallel batches to maintain speed without overwhelming the target servers.</p>
                        
                        <h3>Can I use this to find broken backlinks?</h3>
                        <p>This specific tool checks the links going out from a page you specify. If you want to see if other websites are linking to broken pages on your site, you will need a dedicated backlink auditor.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
