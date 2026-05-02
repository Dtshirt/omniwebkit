'use client';
import { useState } from 'react';
import { Download, Search, Loader2, AlertCircle, CheckCircle, Info, Copy, Check, Link2 } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

/* Toast */
function useToast() {
  const [msg, setMsg] = useState('');
  const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
  const el = msg ? (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}
    </div>
  ) : null;
  return { show, el };
}

export default function SitemapExtractor() {
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('');
  const toast = useToast();

  const parseSitemap = (xml) => {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('Invalid XML format');
    const out = [], sms = [];
    const ue = doc.getElementsByTagName('url');
    for (let i = 0; i < ue.length; i++) {
      const loc = ue[i].getElementsByTagName('loc')[0];
      const lm = ue[i].getElementsByTagName('lastmod')[0];
      const pr = ue[i].getElementsByTagName('priority')[0];
      if (loc) out.push({ url: loc.textContent, lastmod: lm ? lm.textContent : null, priority: pr ? pr.textContent : null });
    }
    const se = doc.getElementsByTagName('sitemap');
    for (let i = 0; i < se.length; i++) { const loc = se[i].getElementsByTagName('loc')[0]; if (loc) sms.push(loc.textContent); }
    return { urls: out, sitemaps: sms };
  };

  const fetchSm = async (url) => {
    // 1. Try our own server-side proxy first (most reliable)
    try {
      const res = await fetch(`/api/fetch-proxy?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.content && (data.content.includes('<urlset') || data.content.includes('<sitemapindex') || data.content.includes('<?xml'))) {
          return data.content;
        }
      }
    } catch { /* fall through */ }

    // 2. Fallback to third-party CORS proxies
    const proxies = [
      `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
    ];
    let err;
    for (const p of proxies) {
      try {
        const r = await fetch(p, { headers: { 'Accept': 'application/xml, text/xml, */*' } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const t = await r.text();
        if (t.includes('<urlset') || t.includes('<sitemapindex') || t.includes('<?xml')) return t;
        throw new Error('Not valid XML');
      } catch (e) { err = e; }
    }
    throw new Error(`Failed to fetch sitemap. ${err?.message || 'CORS error'}`);
  };

  /* ── Discover sitemap URL if user provides a domain ── */
  const discoverSitemapUrl = async (inputUrl) => {
    // If the URL already looks like a sitemap XML, use it directly
    if (/sitemap.*\.xml/i.test(inputUrl) || inputUrl.endsWith('.xml')) {
      return inputUrl;
    }

    // Normalize to base URL
    let base = inputUrl.replace(/\/+$/, '');
    if (!base.match(/^https?:\/\//i)) base = 'https://' + base;
    const origin = new URL(base).origin;

    // Common sitemap paths to try
    const commonPaths = [
      '/sitemap.xml',
      '/sitemap_index.xml',
      '/wp-sitemap.xml',
      '/sitemap/sitemap-index.xml',
    ];

    // First try to find sitemap in robots.txt
    try {
      const robotsTxt = await fetchSm(origin + '/robots.txt').catch(() => null);
      if (robotsTxt) {
        const sitemapMatches = robotsTxt.match(/^Sitemap:\s*(.+)$/gim);
        if (sitemapMatches && sitemapMatches.length > 0) {
          const sitemapUrl = sitemapMatches[0].replace(/^Sitemap:\s*/i, '').trim();
          if (sitemapUrl) return sitemapUrl;
        }
      }
    } catch { /* ignore */ }

    // Try common paths
    for (const path of commonPaths) {
      try {
        const testUrl = origin + path;
        const xml = await fetchSm(testUrl);
        if (xml && (xml.includes('<urlset') || xml.includes('<sitemapindex'))) {
          return testUrl;
        }
      } catch { /* try next */ }
    }

    // If nothing found, return the original URL as-is (will fail gracefully)
    throw new Error(`Could not find a sitemap for this website. Try entering the direct sitemap URL (e.g. ${origin}/sitemap.xml)`);
  };

  const extract = async () => {
    if (!sitemapUrl.trim()) { toast.show('Enter a sitemap URL', 'err'); return; }
    setLoading(true); setError(''); setUrls([]); setStats(null);
    try {
      let u = sitemapUrl.trim();
      if (!u.match(/^https?:\/\//i)) u = 'https://' + u;

      // Auto-discover sitemap URL if needed
      const resolvedUrl = await discoverSitemapUrl(u);

      const xml = await fetchSm(resolvedUrl);
      const { urls: eu, sitemaps: sms } = parseSitemap(xml);
      if (sms.length) {
        const all = [...eu];
        for (const s of sms) { try { const cx = await fetchSm(s); const { urls: cu } = parseSitemap(cx); all.push(...cu); } catch { } }
        setUrls(all); setStats({ total: all.length, sitemaps: sms.length + 1 });
      } else {
        setUrls(eu); setStats({ total: eu.length, sitemaps: 1 });
      }
      if (!eu.length && !sms.length) setError('No URLs found in sitemap');
      else toast.show(`Extracted ${eu.length + (sms.length ? '+' : '')} URLs`);
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const dlFile = (fmt) => {
    let c, fn, mt;
    if (fmt === 'txt') { c = urls.map(i => i.url).join('\n'); fn = 'sitemap-urls.txt'; mt = 'text/plain'; }
    else if (fmt === 'csv') { c = 'URL,Last Modified,Priority\n' + urls.map(i => `"${i.url}","${i.lastmod || ''}","${i.priority || ''}"`).join('\n'); fn = 'sitemap-urls.csv'; mt = 'text/csv'; }
    else { c = JSON.stringify(urls, null, 2); fn = 'sitemap-urls.json'; mt = 'application/json'; }
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([c], { type: mt })), download: fn }).click();
    toast.show(`Downloaded ${fn}`);
  };

  const copyAll = () => { navigator.clipboard.writeText(urls.map(i => i.url).join('\n')); toast.show('All URLs copied!'); };
  const filtered = filter ? urls.filter(u => u.url.toLowerCase().includes(filter.toLowerCase())) : urls;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Sitemap URL Extractor', href: '/tools/sitemap-url-extractor' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <Link2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Sitemap URL Extractor</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Extract all URLs from any XML sitemap — export as TXT, CSV, or JSON</p>
        </div>

        {/* Input card */}
        <div className={`${cardCls} p-5 sm:p-7 mb-5`}>

          {/* Info note */}
          <div className="flex items-start gap-2.5 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl mb-5">
            <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-indigo-600 dark:text-indigo-400"><strong>Tip:</strong> Just enter a domain (e.g. example.com) — the tool will automatically find the sitemap. You can also paste a direct sitemap URL.</p>
          </div>

          <label className={labelCls}>Sitemap URL</label>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') extract(); }}
              placeholder="example.com or example.com/sitemap.xml" disabled={loading}
              className={`${inputCls} flex-1`} />
            <button onClick={extract} disabled={loading}
              className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Extracting…</> : <><Search className="w-4 h-4" />Extract URLs</>}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl mb-3">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {stats && (
            <div className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Extracted <strong>{stats.total}</strong> URLs from <strong>{stats.sitemaps}</strong> sitemap{stats.sitemaps > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {urls.length > 0 && (
          <div className={`${cardCls} overflow-hidden mb-5`}>
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Extracted URLs ({urls.length})</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={copyAll} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"><Copy className="w-3 h-3" />Copy All</button>
                {[{ f: 'txt', c: 'bg-slate-600 hover:bg-slate-700' }, { f: 'csv', c: 'bg-emerald-600 hover:bg-emerald-700' }, { f: 'json', c: 'bg-blue-600 hover:bg-blue-700' }].map(({ f, c }) => (
                  <button key={f} onClick={() => dlFile(f)} className={`flex items-center gap-1 px-3 py-1.5 ${c} text-white rounded-lg text-[10px] font-bold transition`}><Download className="w-3 h-3" />{f.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {/* Filter */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter URLs…"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40" />
              </div>
            </div>

            {/* Table */}
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/40 sticky top-0">
                  <tr>
                    <th className="px-5 py-2.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wide">#</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wide">URL</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wide hidden sm:table-cell">Last Modified</th>
                    <th className="px-5 py-2.5 text-left text-[10px] font-black text-slate-400 uppercase tracking-wide hidden md:table-cell">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filtered.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-5 py-2.5 text-[10px] text-slate-400 font-mono">{i + 1}</td>
                      <td className="px-5 py-2.5">
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline break-all text-xs font-medium">
                          {item.url}
                        </a>
                      </td>
                      <td className="px-5 py-2.5 text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell">{item.lastmod || '—'}</td>
                      <td className="px-5 py-2.5 text-xs text-slate-500 dark:text-slate-400 hidden md:table-cell">{item.priority || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filter && <div className="px-5 py-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400">Showing {filtered.length} of {urls.length}</div>}
          </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Sitemap URL Extractor — Pull URLs from Any XML Sitemap</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every website that cares about SEO has a sitemap — an XML file that lists all the pages the site wants search engines to crawl. But sometimes you need to see those URLs in a usable format. Maybe you are auditing a competitor's site. Maybe you need to check which pages are indexed. Maybe you are migrating a website and need a complete list of URLs. This tool makes it easy.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Paste any sitemap URL and click Extract. The tool fetches the XML, parses every URL entry, and displays them in a searchable table with last modified dates and priority values. If the sitemap is a sitemap index (a sitemap that points to other sitemaps), the tool automatically follows each child sitemap and extracts all URLs from every one of them.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              When you are done, export the results. Download as a plain text file (one URL per line), a CSV with all columns, or a JSON file for programmatic use. You can also copy all URLs to your clipboard with one click. All processing runs in your browser using CORS proxies. No data is stored on any server.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">What You Can Do With Extracted URLs</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'SEO Audits', c: 'text-indigo-600 dark:text-indigo-400', b: 'Get a complete list of indexed pages. Check for missing pages, duplicate content, or pages that should not be in the sitemap.' },
                {
                  t: 'Competitor Research', c: 'text-violet-600 dark:text-violet-400', b: 'Extract URLs from any public sitemap to understand a competitor\u2019s site structure, content strategy, and page count.'
                },
                { t: 'Website Migration', c: 'text-blue-600 dark:text-blue-400', b: 'Export all URLs before migrating. Use the list to set up 301 redirects and verify that no pages are lost in the move.' },
                { t: 'Content Inventory', c: 'text-emerald-600 dark:text-emerald-400', b: 'Build a complete inventory of all published pages. Use the CSV export to organise, categorise, and plan content updates.' },
                { t: 'Link Building', c: 'text-amber-600 dark:text-amber-400', b: 'Find all pages on a target site to identify linking opportunities. Filter by path to find relevant sections.' },
                { t: 'Monitoring Changes', c: 'text-rose-600 dark:text-rose-400', b: 'Compare sitemap extractions over time to detect new pages, removed pages, or changes in priorities and modification dates.' },
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
                { q: 'Is this sitemap extractor free?', a: 'Yes, completely free with no account, no limits, and no data stored on any server.' },
                { q: 'What sitemap formats are supported?', a: 'Standard XML sitemaps (urlset) and sitemap indexes (sitemapindex). The tool follows child sitemaps automatically.' },
                { q: 'Why does it use CORS proxies?', a: 'Browsers block cross-origin requests by default. CORS proxies relay the request, making it possible to fetch any public sitemap.' },
                { q: 'What export formats are available?', a: 'TXT (one URL per line), CSV (URL, Last Modified, Priority), and JSON (full data array).' },
                { q: 'Can I extract from password-protected sitemaps?', a: 'No. The tool can only access publicly available sitemaps. Authentication is not supported.' },
                { q: 'How many URLs can it handle?', a: 'There is no limit. The tool displays results in a scrollable table and exports all URLs regardless of count.' },
                { q: 'Does it show last modified dates?', a: 'Yes. If the sitemap includes lastmod and priority elements, they are shown in the table and included in exports.' },
                { q: 'Does it send my data to a server?', a: 'No. Parsing and display run in your browser. The only external request is fetching the sitemap via CORS proxy.' },
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