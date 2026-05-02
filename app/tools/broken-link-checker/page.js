'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
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
                                            <a href={link.url} target="_blank" rel="noopener noreferrer"
                                                className="text-slate-700 dark:text-slate-300 hover:text-orange-500 dark:hover:text-orange-400 truncate flex-1 font-mono">
                                                {link.url}
                                            </a>
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
                <div className="mt-16 space-y-6">

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Broken Link Checker — Find Dead Links on Any Webpage</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Broken links are one of the most damaging issues a website can have. When a user clicks a link and lands on a 404 error page, the experience is immediately frustrating. They will likely leave — and they may not come back. For your SEO, broken links are just as damaging. Search engine crawlers follow links to discover and index your content. When they encounter broken outbound or internal links, it signals poor site maintenance and reduces your crawl efficiency.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The OmniWebKit Broken Link Checker makes it easy to find every broken link on a webpage. Enter any URL, click Check Links, and the tool fetches the page, extracts all linked URLs, and checks each one for a valid HTTP response. Results appear in a clear, colour-coded list — broken links in red, working links in green — with filter tabs and a Link Health Score so you can assess the state of your link profile at a glance.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            This tool is used by SEO professionals auditing client websites, web developers checking pages before launch, content managers maintaining long-running blogs and resource pages, and website owners who want to ensure their site delivers a clean, error-free experience on every page.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Check for Broken Links — Step by Step</h2>
                        <div className="space-y-4">
                            {[
                                { n: '1', t: 'Enter the URL of the page you want to check', d: 'Type or paste the full URL of the page you want to scan. Include the https:// prefix. The tool will accept any public webpage URL — your homepage, a blog post, a resource page, or a product listing.' },
                                { n: '2', t: 'Click Check Links', d: 'Hit the Check Links button or press Enter. The tool first fetches the page HTML through a server-side proxy (which avoids browser CORS restrictions), then extracts every anchor link on the page.' },
                                { n: '3', t: 'Wait for the scan to complete', d: 'Each extracted link is verified by checking its HTTP response code. Links are processed in parallel batches of 5. A progress bar tracks the scan. Larger pages with many links may take 20–60 seconds.' },
                                { n: '4', t: 'Review the results', d: 'Results show a Link Health Score, summary stats (Total, Working, Broken, Redirects), and a full colour-coded list. Use the filter tabs to view only Broken or Working links. Click any URL to open it in a new tab.' },
                                { n: '5', t: 'Export the report', d: 'Click Export CSV to download the full results as a CSV file, or Copy Report to copy the summary to your clipboard. Use the CSV to share with developers, clients, or to import into your project management tool.' },
                            ].map(({ n, t, d }) => (
                                <div key={n} className="flex gap-4">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-bold flex items-center justify-center">{n}</div>
                                    <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{t}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding HTTP Status Codes in Link Checking</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                            When the tool checks a link, it receives an HTTP status code in the response. Here is what the most common codes mean and what action you should take.
                        </p>
                        <div className="space-y-3">
                            {[
                                { code: '200 OK', c: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', d: 'The link is working correctly. The server returned a valid response. No action needed.' },
                                { code: '301 Moved Permanently', c: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', d: 'The resource has permanently moved to a new URL. The link technically works but updating it to the new URL avoids an unnecessary redirect hop, which is better for SEO and slightly faster for users.' },
                                { code: '302 Found', c: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300', d: 'Temporary redirect. The resource temporarily moved. If the redirect has been in place for a long time, consider updating the link to the current URL.' },
                                { code: '403 Forbidden', c: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', d: 'The server refused the request. The link URL is valid but access is restricted. This may be a false positive if the site blocks crawlers — check the link manually in a browser.' },
                                { code: '404 Not Found', c: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', d: 'The page does not exist. Either the URL was never valid, the content was deleted, or it was moved without a redirect. This should be fixed — update the link, find an alternative source, or remove the link.' },
                                { code: '500 Server Error', c: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', d: 'The linked server experienced an internal error. This is likely temporary — recheck the link later. If the error persists, the external site may have a serious issue.' },
                                { code: 'Error / Timeout', c: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300', d: 'The request failed or timed out. The server may be down, blocking automated requests, or the URL may be completely unreachable. Check the link manually in a browser.' },
                            ].map(({ code, c, d }) => (
                                <div key={code} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${c}`}>{code}</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{d}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this broken link checker free?', a: 'Yes, 100% free. No account required. Enter any URL and check as many pages as you need. The tool uses a server-side proxy to fetch pages and check links.' },
                                { q: 'What types of links does the checker find?', a: 'The tool extracts all anchor (<a href="...">) links from the page HTML. It excludes internal page anchors (#fragment), mailto: links, tel: links, and javascript: pseudo-links, as these are not HTTP resources that can be verified with a status code.' },
                                { q: 'Why does a link show as broken even though it works in my browser?', a: 'Some websites block automated requests from crawlers, bots, or data centres. The link may return a 403 Forbidden or timeout error when checked programmatically, even though it works fine in a browser. Always manually verify 403 errors before removing or updating the link.' },
                                { q: 'What is the Link Health Score?', a: 'The Link Health Score is the percentage of total links on the page that returned a successful 200 OK response. A score of 90% or higher is excellent. A lower score indicates that a significant portion of your outbound or internal links are broken, redirecting, or unreachable.' },
                                { q: 'Can I export the broken link report?', a: 'Yes. Click Export CSV to download a CSV file containing all link URLs, their HTTP status codes, and whether they are working or broken. You can open this in Excel, Google Sheets, or import it into your project management or bug-tracking tool.' },
                                { q: 'How many links can the tool check per page?', a: 'There is no hard limit. The tool processes links in batches of 5 in parallel. For pages with 50–100 links, a scan typically takes 20–40 seconds. Pages with 200+ links may take 1–2 minutes. Very large pages are checked completely, though the UI may not update live for every single link.' },
                                { q: 'Why does the tool sometimes fail to scan a page?', a: 'Some websites actively block server-side crawlers using Cloudflare, bot detection, authentication walls, or strict CORS policies. If the tool cannot fetch the page HTML, it will show an error message explaining the issue. In these cases, use a browser extension or a dedicated crawling tool.' },
                                { q: 'Can I use this to check broken backlinks?', a: 'This tool checks links on a page, not links pointing to your page. To verify that backlinks from external sites are still live and pointing to your target URL, use the SEO Backlink Auditor tool instead.' },
                            ].map(({ q, a }) => (
                                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                                        <span>{q}</span>
                                        <span className="text-slate-400 dark:text-slate-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                                    </summary>
                                    <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                                </details>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
