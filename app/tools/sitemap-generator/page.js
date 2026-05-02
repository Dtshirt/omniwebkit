'use client';
import { useState, useCallback } from 'react';
import { Plus, Trash2, Download, Copy, Eye, FileText, Globe, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Upload, Code, List, Settings, ArrowUpDown, Search, X, FileCode2, LayoutList, Check } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

const FREQ = [
  { v: 'always', l: 'Always' }, { v: 'hourly', l: 'Hourly' }, { v: 'daily', l: 'Daily' }, { v: 'weekly', l: 'Weekly' },
  { v: 'monthly', l: 'Monthly' }, { v: 'yearly', l: 'Yearly' }, { v: 'never', l: 'Never' },
];
const PRIO = [
  { v: '1.0', l: '1.0 – Highest' }, { v: '0.9', l: '0.9' }, { v: '0.8', l: '0.8 – High' }, { v: '0.7', l: '0.7' },
  { v: '0.6', l: '0.6' }, { v: '0.5', l: '0.5 – Default' }, { v: '0.4', l: '0.4' }, { v: '0.3', l: '0.3 – Low' },
  { v: '0.2', l: '0.2' }, { v: '0.1', l: '0.1 – Lowest' }, { v: '0.0', l: '0.0' },
];

const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
const validUrl = (s) => { try { const u = new URL(s); return u.protocol === 'http:' || u.protocol === 'https:'; } catch { return false; } };
const today = () => new Date().toISOString().split('T')[0];
const escXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export default function SitemapGenerator() {
  const [urls, setUrls] = useState([{ id: uid(), loc: '', lastmod: today(), changefreq: 'weekly', priority: '0.5' }]);
  const [fmt, setFmt] = useState('xml');
  const [sitemap, setSitemap] = useState('');
  const [showPre, setShowPre] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [bulkTxt, setBulkTxt] = useState('');
  const [search, setSearch] = useState('');
  const [notif, setNotif] = useState(null);
  const [defFreq, setDefFreq] = useState('weekly');
  const [defPrio, setDefPrio] = useState('0.5');
  const [showCfg, setShowCfg] = useState(false);
  const [sortF, setSortF] = useState(null);
  const [sortA, setSortA] = useState(true);
  const [incMod, setIncMod] = useState(true);
  const [incFreq, setIncFreq] = useState(true);
  const [incPrio, setIncPrio] = useState(true);
  const [xsl, setXsl] = useState(false);

  const toast = useCallback((m, t = 'ok') => { setNotif({ m, t }); setTimeout(() => setNotif(null), 2500); }, []);

  const addUrl = () => setUrls(p => [...p, { id: uid(), loc: '', lastmod: today(), changefreq: defFreq, priority: defPrio }]);
  const rmUrl = (id) => { if (urls.length === 1) { toast('Need at least 1 URL', 'err'); return; } setUrls(p => p.filter(u => u.id !== id)); };
  const upUrl = (id, f, v) => setUrls(p => p.map(u => u.id === id ? { ...u, [f]: v } : u));

  const bulkImp = () => {
    const lines = bulkTxt.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) { toast('No URLs found', 'err'); return; }
    const nu = lines.map(l => ({ id: uid(), loc: l.startsWith('http') ? l : `https://${l}`, lastmod: today(), changefreq: defFreq, priority: defPrio }));
    setUrls(p => [...p, ...nu]); setBulkTxt(''); setShowBulk(false); toast(`Imported ${nu.length} URLs`);
  };
  const clearAll = () => { setUrls([{ id: uid(), loc: '', lastmod: today(), changefreq: defFreq, priority: defPrio }]); setSitemap(''); setShowPre(false); };
  const applyAll = (f, v) => { setUrls(p => p.map(u => ({ ...u, [f]: v }))); toast(`Applied to all`); };
  const sortUrls = (f) => { const a = sortF === f ? !sortA : true; setSortF(f); setSortA(a); setUrls(p => [...p].sort((x, y) => { const va = x[f] || '', vb = y[f] || ''; return a ? va.localeCompare(vb) : vb.localeCompare(va); })); };

  const genXml = () => {
    const v = urls.filter(u => u.loc && validUrl(u.loc));
    if (!v.length) { toast('Add at least one valid URL', 'err'); return ''; }
    let x = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    if (xsl) x += `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>\n`;
    x += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    v.forEach(u => {
      x += `  <url>\n    <loc>${escXml(u.loc)}</loc>\n`;
      if (incMod && u.lastmod) x += `    <lastmod>${u.lastmod}</lastmod>\n`;
      if (incFreq && u.changefreq) x += `    <changefreq>${u.changefreq}</changefreq>\n`;
      if (incPrio && u.priority) x += `    <priority>${u.priority}</priority>\n`;
      x += `  </url>\n`;
    });
    x += `</urlset>`; return x;
  };

  const genHtml = () => {
    const v = urls.filter(u => u.loc && validUrl(u.loc));
    if (!v.length) { toast('Add at least one valid URL', 'err'); return ''; }
    const g = {};
    v.forEach(u => { try { const p = new URL(u.loc).pathname.split('/').filter(Boolean); const s = p.length ? p[0] : 'Home'; if (!g[s]) g[s] = []; g[s].push(u); } catch { if (!g['Other']) g['Other'] = []; g['Other'].push(u); } });
    let h = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>HTML Sitemap</title>\n  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:960px;margin:0 auto;padding:2rem;color:#1a1a2e;background:#f8fafc}h1{font-size:2rem;margin-bottom:.5rem;color:#0f172a}.subtitle{color:#64748b;margin-bottom:2rem}.stats{display:flex;gap:1rem;margin-bottom:2rem;flex-wrap:wrap}.stat{background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:.75rem 1.25rem;font-size:.85rem;color:#475569}.stat strong{color:#0f172a}.section{margin-bottom:2rem}.section-title{font-size:1.25rem;font-weight:600;color:#1e293b;margin-bottom:.75rem;padding-bottom:.5rem;border-bottom:2px solid #e2e8f0;text-transform:capitalize}.url-list{list-style:none}.url-item{padding:.5rem 0;border-bottom:1px solid #f1f5f9}.url-item:last-child{border-bottom:none}.url-item a{color:#2563eb;text-decoration:none;word-break:break-all}.url-item a:hover{text-decoration:underline;color:#1d4ed8}.url-meta{font-size:.8rem;color:#94a3b8;margin-top:.15rem}footer{margin-top:3rem;padding-top:1rem;border-top:1px solid #e2e8f0;color:#94a3b8;font-size:.8rem}</style>\n</head>\n<body>\n  <h1>HTML Sitemap</h1>\n  <p class="subtitle">Complete directory of all pages</p>\n  <div class="stats"><div class="stat">Pages: <strong>${v.length}</strong></div><div class="stat">Sections: <strong>${Object.keys(g).length}</strong></div><div class="stat">Generated: <strong>${new Date().toLocaleDateString()}</strong></div></div>\n`;
    Object.entries(g).forEach(([s, su]) => {
      h += `  <div class="section">\n    <h2 class="section-title">${escHtml(s)} (${su.length})</h2>\n    <ul class="url-list">\n`;
      su.forEach(u => {
        h += `      <li class="url-item"><a href="${escHtml(u.loc)}">${escHtml(u.loc)}</a>`;
        const m = []; if (incMod && u.lastmod) m.push(`Modified: ${u.lastmod}`); if (incPrio && u.priority) m.push(`Priority: ${u.priority}`);
        if (m.length) h += `\n        <div class="url-meta">${m.join(' · ')}</div>`;
        h += `</li>\n`;
      });
      h += `    </ul>\n  </div>\n`;
    });
    h += `  <footer>Generated by OmniWebKit on ${new Date().toLocaleString()}</footer>\n</body>\n</html>`;
    return h;
  };

  const generate = () => { const r = fmt === 'xml' ? genXml() : genHtml(); if (r) { setSitemap(r); setShowPre(true); const c = urls.filter(u => u.loc && validUrl(u.loc)).length; toast(`Generated ${fmt.toUpperCase()} with ${c} URLs`); } };
  const copyOut = async () => { try { await navigator.clipboard.writeText(sitemap); toast('Copied!'); } catch { toast('Copy failed', 'err'); } };
  const dlFile = () => { const e = fmt === 'xml' ? 'xml' : 'html'; const b = new Blob([sitemap], { type: fmt === 'xml' ? 'application/xml' : 'text/html' }); Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: `sitemap.${e}` }).click(); toast(`Downloaded sitemap.${e}`); };

  const filtered = search ? urls.filter(u => u.loc.toLowerCase().includes(search.toLowerCase())) : urls;
  const vc = urls.filter(u => u.loc && validUrl(u.loc)).length;
  const ic = urls.filter(u => u.loc && !validUrl(u.loc)).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {/* Toast */}
      {notif && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${notif.t === 'err' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {notif.t === 'err' ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}{notif.m}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Sitemap Generator', href: '/tools/sitemap-generator' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-sky-500/25">
            <FileCode2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Sitemap Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Create XML & HTML sitemaps — add URLs, bulk import, customise</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { n: urls.length, l: 'Total URLs', c: 'text-slate-900 dark:text-white' },
            { n: vc, l: 'Valid', c: 'text-emerald-600 dark:text-emerald-400' },
            { n: ic, l: 'Invalid', c: 'text-red-500' },
            { n: fmt.toUpperCase(), l: 'Format', c: 'text-sky-600 dark:text-sky-400' },
          ].map(({ n, l, c }) => (
            <div key={l} className={`${cardCls} p-4 text-center`}>
              <div className={`text-2xl font-bold ${c}`}>{n}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{l}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className={`${cardCls} p-4 mb-5`}>
          <div className="flex flex-wrap items-center gap-2">
            {/* Format toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1">
              {[{ f: 'xml', i: Code, l: 'XML' }, { f: 'html', i: LayoutList, l: 'HTML' }].map(({ f, i: I, l }) => (
                <button key={f} onClick={() => setFmt(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${fmt === f ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                  <I className="w-3.5 h-3.5" />{l}
                </button>
              ))}
            </div>

            <button onClick={addUrl} className="flex items-center gap-1 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition"><Plus className="w-3.5 h-3.5" />Add URL</button>
            <button onClick={() => setShowBulk(!showBulk)} className="flex items-center gap-1 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition"><Upload className="w-3.5 h-3.5" />Bulk Import</button>
            <button onClick={() => setShowCfg(!showCfg)} className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition"><Settings className="w-3.5 h-3.5" />Settings</button>
            <button onClick={clearAll} className="flex items-center gap-1 px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-xs font-bold transition"><Trash2 className="w-3.5 h-3.5" />Clear</button>

            {/* Search */}
            <div className="flex-1 min-w-[180px] ml-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search URLs…"
                className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/40" />
              {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" /></button>}
            </div>
          </div>

          {/* Settings panel */}
          {showCfg && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Default Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Change Frequency</label>
                  <select value={defFreq} onChange={e => setDefFreq(e.target.value)} className={inputCls}>
                    {FREQ.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
                  <select value={defPrio} onChange={e => setDefPrio(e.target.value)} className={inputCls}>
                    {PRIO.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Include in Output</label>
                  <div className="flex flex-wrap gap-3 mt-1">
                    {[{ l: 'Last Modified', v: incMod, s: setIncMod }, { l: 'Change Freq', v: incFreq, s: setIncFreq }, { l: 'Priority', v: incPrio, s: setIncPrio },
                    ...(fmt === 'xml' ? [{ l: 'XSL Stylesheet', v: xsl, s: setXsl }] : [])
                    ].map(({ l, v, s }) => (
                      <label key={l} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input type="checkbox" checked={v} onChange={e => s(e.target.checked)} className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-sky-600 focus:ring-sky-500" />{l}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                {[{ l: 'Apply frequency to all', fn: () => applyAll('changefreq', defFreq) }, { l: 'Apply priority to all', fn: () => applyAll('priority', defPrio) }, { l: "Set today's date for all", fn: () => applyAll('lastmod', today()) }].map(({ l, fn }) => (
                  <button key={l} onClick={fn} className="text-[10px] font-bold px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-900/40 transition">{l}</button>
                ))}
              </div>
            </div>
          )}

          {/* Bulk import */}
          {showBulk && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-2">Bulk Import</h3>
              <p className="text-[10px] text-slate-400 mb-2">One URL per line. Lines without http(s) get https:// prefix.</p>
              <textarea value={bulkTxt} onChange={e => setBulkTxt(e.target.value)}
                placeholder="https://example.com/\nhttps://example.com/about\nhttps://example.com/blog"
                className={`${inputCls} h-32 resize-y font-mono mb-2`} />
              <div className="flex gap-2">
                <button onClick={bulkImp} className="px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition">Import {bulkTxt.split('\n').filter(l => l.trim()).length} URLs</button>
                <button onClick={() => { setShowBulk(false); setBulkTxt(''); }} className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs font-bold">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* URL table */}
        <div className={`${cardCls} overflow-hidden mb-5`}>
          {/* Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-2 px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
            <div className="col-span-5 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" onClick={() => sortUrls('loc')}>URL <ArrowUpDown className="w-2.5 h-2.5" /></div>
            <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-wide">Last Modified</div>
            <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-wide">Change Freq</div>
            <div className="col-span-2 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-wide cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" onClick={() => sortUrls('priority')}>Priority <ArrowUpDown className="w-2.5 h-2.5" /></div>
            <div className="col-span-1" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 max-h-[500px] overflow-y-auto">
            {filtered.map((u, i) => {
              const ok = !u.loc || validUrl(u.loc);
              return (
                <div key={u.id} className={`grid grid-cols-1 md:grid-cols-12 gap-2 px-4 py-3 items-center transition hover:bg-slate-50 dark:hover:bg-slate-700/30 ${!ok ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                  <div className="md:col-span-5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono w-5 text-right flex-shrink-0">{i + 1}</span>
                      <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="url" value={u.loc} onChange={e => upUrl(u.id, 'loc', e.target.value)} placeholder="https://example.com/page"
                          className={`w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-2 ${!ok ? 'border-red-300 dark:border-red-700 focus:ring-red-500/40' : 'border-slate-200 dark:border-slate-700 focus:ring-sky-500/40'}`} />
                      </div>
                    </div>
                    {!ok && <p className="text-[10px] text-red-500 mt-0.5 ml-7">Invalid URL</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-[10px] font-bold text-slate-400 mb-0.5 block">Last Modified</label>
                    <input type="date" value={u.lastmod} onChange={e => upUrl(u.id, 'lastmod', e.target.value)} className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-[10px] font-bold text-slate-400 mb-0.5 block">Change Freq</label>
                    <select value={u.changefreq} onChange={e => upUrl(u.id, 'changefreq', e.target.value)} className={inputCls}>
                      {FREQ.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="md:hidden text-[10px] font-bold text-slate-400 mb-0.5 block">Priority</label>
                    <select value={u.priority} onChange={e => upUrl(u.id, 'priority', e.target.value)} className={inputCls}>
                      {PRIO.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button onClick={() => rmUrl(u.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Remove"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <button onClick={addUrl} className="flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition"><Plus className="w-3.5 h-3.5" />Add another URL</button>
          </div>
        </div>

        {/* Generate */}
        <div className="flex justify-center mb-5">
          <button onClick={generate} disabled={vc === 0}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <FileText className="w-4 h-4" />Generate {fmt.toUpperCase()} Sitemap
          </button>
        </div>

        {/* Output */}
        {showPre && sitemap && (
          <div className={`${cardCls} overflow-hidden mb-5`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Generated ({fmt.toUpperCase()})</h3>
                <span className="text-[10px] text-slate-400">{(new Blob([sitemap]).size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex gap-2">
                <button onClick={copyOut} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"><Copy className="w-3 h-3" />Copy</button>
                <button onClick={dlFile} className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-[10px] font-bold shadow-sm transition"><Download className="w-3 h-3" />Download</button>
              </div>
            </div>
            <div className="bg-slate-950 p-4 overflow-auto max-h-[500px]">
              <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-all">{sitemap}</pre>
            </div>
          </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Sitemap Generator — Create XML & HTML Sitemaps</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A sitemap is a file that lists all the important pages on your website. It tells search engines like Google, Bing, and Yahoo which pages to crawl, how often they change, and how important they are relative to each other. Without a sitemap, search engines may miss pages — especially on large sites with complex navigation or pages that are not linked from the main menu.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free Sitemap Generator creates both XML and HTML sitemaps. XML sitemaps are for search engines. HTML sitemaps are for users — a human-readable page that lists all your URLs grouped by section. You can add URLs one by one, import them in bulk (paste a list), set the change frequency, priority, and last modified date for each URL. The output is standards-compliant and ready to upload.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              All processing runs in your browser. No data is sent to any server. Copy the output to your clipboard or download it as a file. Upload it to the root directory of your website.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Understanding Sitemap Elements</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: '<loc>', c: 'text-sky-600 dark:text-sky-400', b: 'The full URL of the page. This is the only required element. Must start with http:// or https:// and include the domain name.' },
                { t: '<lastmod>', c: 'text-blue-600 dark:text-blue-400', b: 'The date the page was last modified. Helps search engines prioritise recently updated content. Use YYYY-MM-DD format.' },
                { t: '<changefreq>', c: 'text-emerald-600 dark:text-emerald-400', b: 'How often the page changes: always, hourly, daily, weekly, monthly, yearly, or never. This is a hint, not a command.' },
                { t: '<priority>', c: 'text-amber-600 dark:text-amber-400', b: 'Relative importance from 0.0 to 1.0. Default is 0.5. This only affects how your own pages are ranked relative to each other.' },
                { t: 'XML vs HTML', c: 'text-violet-600 dark:text-violet-400', b: 'XML sitemaps are machine-readable for search engines. HTML sitemaps are human-readable for users. Most sites should have both.' },
                { t: 'Bulk Import', c: 'text-rose-600 dark:text-rose-400', b: 'Paste a list of URLs (one per line) to add them all at once. Lines without http/https are automatically prefixed with https://.' },
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
                { q: 'Is this sitemap generator free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
                { q: 'Where do I put the sitemap file?', a: 'Upload sitemap.xml to your website root: https://yourdomain.com/sitemap.xml. Then submit it in Google Search Console.' },
                { q: 'How many URLs can I add?', a: 'There is no limit in this tool. However, XML sitemaps have a standard limit of 50,000 URLs per file.' },
                { q: 'Do I need both XML and HTML sitemaps?', a: 'XML is for search engines; HTML is for users. Having both is recommended for best SEO and user experience.' },
                { q: 'What is the priority element?', a: 'A number from 0.0 to 1.0 indicating relative importance. It only affects how your own pages are ranked against each other.' },
                { q: 'Does changefreq actually control crawling?', a: 'No. It is a hint. Google ignores it in most cases and relies on its own crawl patterns.' },
                { q: 'Can I import URLs in bulk?', a: 'Yes. Click Bulk Import, paste one URL per line, and they will be added with your default settings.' },
                { q: 'Does this tool send data to a server?', a: 'No. Everything runs in your browser. Your URLs are never uploaded anywhere.' },
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