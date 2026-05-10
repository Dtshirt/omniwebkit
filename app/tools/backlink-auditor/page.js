'use client';
import React, { useState } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import Link from 'next/link';
import {
  FileUp, Link as LinkIcon, Search, AlertCircle, CheckCircle,
  XCircle, Download, RefreshCw, Info, BarChart2, Shield,
  Globe, Zap, Filter,
} from 'lucide-react';

// ─── Shared styles ────────────────────────────────────
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';
const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono';
const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2';

// ─── Helpers ──────────────────────────────────────────
const normalizeUrl = (url) => {
  try {
    let n = url.trim().toLowerCase();
    const obj = new URL(n);
    obj.hash = '';
    const p = new URLSearchParams(obj.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach(k => p.delete(k));
    obj.search = p.toString();
    return obj.toString().replace(/\/$/, '');
  } catch { return url.trim().toLowerCase(); }
};

const getRootDomain = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
};

const isValidUrl = (url) => {
  try { const obj = new URL(url); return obj.protocol === 'http:' || obj.protocol === 'https:'; } catch { return false; }
};

const statusPill = (s) => {
  if (s === 'Found') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700';
  if (s === 'Not Found') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700';
  if (s === 'Error') return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700';
  if (s === 'Unique') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700';
  return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-600';
};

const StatusIcon = ({ s }) => {
  if (s === 'Found') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (s === 'Not Found') return <XCircle className="w-4 h-4 text-amber-500" />;
  if (s === 'Error') return <AlertCircle className="w-4 h-4 text-red-500" />;
  return null;
};

export default function SEOBacklinkAuditor() {
  const [targetLink, setTargetLink] = useState('');
  const [backlinkUrls, setBacklinkUrls] = useState('');
  const [urlNorm, setUrlNorm] = useState(true);
  const [dupScope, setDupScope] = useState('full');
  const [validation, setValidation] = useState(true);
  const [isAuditing, setIsAuditing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [auditResults, setAuditResults] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const handleFileUpload = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.split(/[\n,]/).map(l => l.trim()).filter(Boolean);
      setBacklinkUrls(lines.join('\n'));
    };
    reader.readAsText(file);
  };

  const startAudit = async () => {
    if (!targetLink.trim()) { alert('Please enter a Target Link'); return; }
    const rawUrls = backlinkUrls.split('\n').map(u => u.trim()).filter(Boolean);
    if (!rawUrls.length) { alert('Please enter or upload Backlink URLs'); return; }

    setIsAuditing(true); setProgress(0); setAuditResults(null);

    const processed = [], invalid = [], seenUrls = new Set(), seenDomains = new Set();

    for (const raw of rawUrls) {
      if (validation && !isValidUrl(raw)) { invalid.push(raw); continue; }
      const norm = urlNorm ? normalizeUrl(raw) : raw;
      const domain = getRootDomain(norm);
      let dupStatus = 'Unique';
      if (dupScope === 'full') { if (seenUrls.has(norm)) dupStatus = 'Duplicate URL'; else seenUrls.add(norm); }
      else { if (seenDomains.has(domain)) dupStatus = 'Duplicate Domain'; else seenDomains.add(domain); }
      processed.push({ original: raw, normalized: norm, domain, dupStatus, targetStatus: 'Checking…' });
    }

    for (let i = 0; i < processed.length; i++) {
      if (processed[i].dupStatus === 'Unique') {
        try {
          const res = await fetch('/api/backlink-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              backlink_url: processed[i].normalized,
              target_url: targetLink
            })
          });
          if (res.ok) {
            const data = await res.json();
            processed[i].targetStatus = data.status || 'Error';
          } else {
            processed[i].targetStatus = 'Error';
          }
        } catch (err) {
          processed[i].targetStatus = 'Error';
        }
      } else {
        processed[i].targetStatus = 'Skipped';
      }
      setProgress(Math.round(((i + 1) / processed.length) * 100));
      // Keep UI responsive
      if (i % 3 === 0) await new Promise(r => setTimeout(r, 10));
    }

    const unique = processed.filter(u => u.dupStatus === 'Unique');
    setAuditResults({
      summary: {
        total: rawUrls.length,
        unique: unique.length,
        duplicates: processed.length - unique.length,
        found: processed.filter(u => u.targetStatus === 'Found').length,
        notFound: processed.filter(u => u.targetStatus === 'Not Found').length,
        errors: processed.filter(u => u.targetStatus === 'Error').length,
        invalid: invalid.length,
      },
      results: processed,
      invalidUrls: invalid,
    });
    setIsAuditing(false);
  };

  const exportCSV = () => {
    if (!auditResults) return;
    const rows = [['Backlink URL', 'Domain', 'Target Status', 'Duplicate Status']];
    auditResults.results.forEach(r => rows.push([`"${r.original}"`, r.domain, r.targetStatus, r.dupStatus]));
    auditResults.invalidUrls.forEach(u => rows.push([`"${u}"`, '', 'Invalid', '']));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'backlink-audit.csv' });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const visibleResults = auditResults?.results.filter(r =>
    filterStatus === 'all' ? true : filterStatus === 'found' ? r.targetStatus === 'Found' : filterStatus === 'notfound' ? r.targetStatus === 'Not Found' : filterStatus === 'error' ? r.targetStatus === 'Error' : filterStatus === 'duplicate' ? r.dupStatus !== 'Unique' : true
  ) || [];

  const summary = auditResults?.summary;
  const foundPct = summary && summary.unique > 0 ? Math.round(summary.found / summary.unique * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'Backlink Auditor', href: '/tools/backlink-auditor' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Search className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">SEO Backlink Auditor</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Audit your backlink profile by verifying whether your target URL appears on each linking page. Identify live links, missing links, duplicate domains, and errors — then export a full CSV report.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Input Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Target + Backlinks */}
            <div className={`${cardCls} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <LinkIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Audit Parameters</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url" value={targetLink}
                    onChange={e => setTargetLink(e.target.value)}
                    placeholder="https://yourdomain.com/page-you-want-linked"
                    className={inputCls}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This is the URL you want to verify is being linked to from each backlink page.</p>
                </div>
                <div>
                  <label className={labelCls}>Backlink URLs <span className="text-slate-400 dark:text-slate-500 font-normal">(one per line)</span></label>
                  <textarea
                    value={backlinkUrls}
                    onChange={e => setBacklinkUrls(e.target.value)}
                    placeholder={'https://example.com/blog-post\nhttps://another-site.com/article\nhttps://blog.example.org/post'}
                    rows={8}
                    className={inputCls}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 transition">
                    <FileUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload .txt or .csv</span>
                    <input type="file" accept=".txt,.csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span className="text-xs text-slate-400 dark:text-slate-500">One URL per line, or comma-separated</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            {isAuditing && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                  <p className="font-semibold text-slate-900 dark:text-white">Auditing backlinks… {progress}%</p>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Each backlink is being checked for the target link. This may take a moment for large lists.</p>
              </div>
            )}

            {/* Results Table */}
            {auditResults && (
              <div className={`${cardCls} p-6`}>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Results — {auditResults.results.length} backlinks</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                      {[['all', 'All'], ['found', 'Found'], ['notfound', 'Missing'], ['error', 'Error'], ['duplicate', 'Duplicates']].map(([v, l]) => (
                        <button key={v} onClick={() => setFilterStatus(v)}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition ${filterStatus === v ? 'bg-blue-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                    <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition">
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>
                </div>

                {auditResults.summary.invalid > 0 && (
                  <div className="flex items-start gap-2 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">{auditResults.summary.invalid} invalid URL(s) were filtered out as they are not valid HTTP/HTTPS addresses.</p>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Backlink URL</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Target</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Duplicate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Domain</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {visibleResults.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3 max-w-xs">
                            <Link href={r.original} target="_blank" rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-mono break-all line-clamp-2">
                              {r.original}
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <StatusIcon s={r.targetStatus} />
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${statusPill(r.targetStatus)}`}>{r.targetStatus}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${statusPill(r.dupStatus)}`}>{r.dupStatus}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-mono">{r.domain}</td>
                        </tr>
                      ))}
                      {visibleResults.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400 text-sm">No results match this filter.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right: Settings + Summary */}
          <div className="space-y-5">

            {/* Config */}
            <div className={`${cardCls} p-6`}>
              <div className="flex items-center gap-2 mb-5">
                <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Configuration</h2>
              </div>
              <div className="space-y-4">
                {/* URL Normalization */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">URL Normalization</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Strip tracking params and normalise casing</p>
                    </div>
                    <div onClick={() => setUrlNorm(!urlNorm)}
                      className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${urlNorm ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${urlNorm ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </label>
                </div>

                {/* Validation */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="flex items-start justify-between gap-3 cursor-pointer">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Validation Filter</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Skip non-HTTP URLs and malformed addresses</p>
                    </div>
                    <div onClick={() => setValidation(!validation)}
                      className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${validation ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${validation ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </label>
                </div>

                {/* Duplicate scope */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Duplicate Check Scope</p>
                  <div className="space-y-2">
                    {[['full', 'Full URL', 'Exact match of the entire URL'], ['domain', 'Root Domain', 'One backlink per domain (e.g. example.com)']].map(([v, lbl, desc]) => (
                      <label key={v} className="flex items-start gap-2.5 cursor-pointer">
                        <input type="radio" name="dupScope" value={v} checked={dupScope === v} onChange={() => setDupScope(v)} className="mt-0.5 accent-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{lbl}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={startAudit} disabled={isAuditing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md shadow-blue-500/20 transition">
                  {isAuditing ? <><RefreshCw className="w-4 h-4 animate-spin" /> Auditing… {progress}%</> : <><Search className="w-4 h-4" /> Start Audit</>}
                </button>
              </div>
            </div>

            {/* Summary stats */}
            {summary && (
              <div className={`${cardCls} p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Audit Summary</h2>
                </div>

                {/* Link health bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400">Link Health Score</span>
                    <span className={`font-bold ${foundPct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : foundPct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>{foundPct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all ${foundPct >= 70 ? 'bg-emerald-500' : foundPct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${foundPct}%` }} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{summary.found} of {summary.unique} unique backlinks contain your target URL</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { lbl: 'Total URLs', val: summary.total, bg: 'bg-blue-50 dark:bg-blue-900/20', tx: 'text-blue-700 dark:text-blue-300' },
                    { lbl: 'Unique', val: summary.unique, bg: 'bg-indigo-50 dark:bg-indigo-900/20', tx: 'text-indigo-700 dark:text-indigo-300' },
                    { lbl: 'Duplicates', val: summary.duplicates, bg: 'bg-slate-100 dark:bg-slate-700', tx: 'text-slate-700 dark:text-slate-300' },
                    { lbl: 'Found ✓', val: summary.found, bg: 'bg-emerald-50 dark:bg-emerald-900/20', tx: 'text-emerald-700 dark:text-emerald-300' },
                    { lbl: 'Missing', val: summary.notFound, bg: 'bg-amber-50 dark:bg-amber-900/20', tx: 'text-amber-700 dark:text-amber-300' },
                    { lbl: 'Errors', val: summary.errors, bg: 'bg-red-50 dark:bg-red-900/20', tx: 'text-red-700 dark:text-red-300' },
                  ].map(({ lbl, val, bg, tx }) => (
                    <div key={lbl} className={`${bg} rounded-xl p-3 text-center`}>
                      <div className={`text-2xl font-bold ${tx}`}>{val}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lbl}</div>
                    </div>
                  ))}
                </div>

                {summary.invalid > 0 && (
                  <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">{summary.invalid} invalid URL(s) skipped</div>
                )}

                <button onClick={exportCSV} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition">
                  <Download className="w-4 h-4" /> Download CSV Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-16 space-y-6">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free SEO Backlink Auditor — Verify Your Backlink Profile Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Backlinks are one of the most important ranking factors in Google's algorithm. A high-quality backlink from a relevant, authoritative website tells Google that your content is trustworthy and worth ranking. But not all backlinks are created equal — and many of the backlinks you think you have may no longer be linking to your target page.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit SEO Backlink Auditor helps you verify your backlink profile quickly and efficiently. Enter your target URL — the page you want backlinks pointing to — and paste in a list of referring pages. The tool checks each page to confirm whether your link is present, flags duplicates and invalid URLs, and generates a detailed audit report you can export as a CSV file.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Whether you manage your own website, do SEO for clients, or are running a link-building outreach campaign, this tool gives you the visibility you need to understand which backlinks are actually working and which ones require follow-up.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Use the Backlink Auditor</h2>
            <div className="space-y-4">
              {[
                { n: '1', t: 'Enter your target URL', d: 'This is the specific page you are trying to build links to — for example, your homepage, a service page, or a money page. The tool will check whether each backlink page contains a link to this exact URL.' },
                { n: '2', t: 'Paste or upload your backlink list', d: 'Enter the URLs of pages that are supposed to be linking to you, one per line. You can also upload a .txt or .csv file. These are the referring pages — they could come from link-building outreach, a Ahrefs or SEMrush backlink export, or a Google Search Console report.' },
                { n: '3', t: 'Configure the options', d: 'Choose whether to enable URL Normalization (strips tracking parameters and normalises casing for accurate deduplication), Validation Filter (removes non-HTTP URLs), and Duplicate Scope (check for duplicate full URLs or duplicate root domains — one link per domain is common in SEO link building).' },
                { n: '4', t: 'Click Start Audit', d: 'The tool processes each backlink URL and simulates a content check to determine whether your target link appears on the page. A progress bar tracks completion. For large lists this may take a minute.' },
                { n: '5', t: 'Review the report and export', d: 'When the audit is complete, the summary shows your Link Health Score — the percentage of checked backlinks that contain your target URL. Use the filter buttons to view Found, Missing, Error, or Duplicate links separately. Click Download CSV to export the full report.' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold flex items-center justify-center">{n}</div>
                  <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{t}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Backlink Auditing Matters for SEO</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Link building is expensive — in time, money, or both. Guest posts, digital PR, niche edits, and outreach all take significant effort. It is essential to verify that the links you invest in are actually live and pointing to the right page. Here is why regular backlink auditing should be part of every SEO workflow.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { ic: <Shield className="w-5 h-5" />, title: 'Verify link-building ROI', desc: 'Confirm that backlinks you paid for or earned through outreach are actually live and correctly pointing to your target page — not a 404, redirect, or the wrong URL.', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { ic: <Globe className="w-5 h-5" />, title: 'Identify lost or changed links', desc: 'Websites change their content regularly. A link that was live six months ago may have been removed, changed to nofollow, or redirected to a different page. Auditing catches these changes.', c: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                { ic: <Zap className="w-5 h-5" />, title: 'De-duplicate your link profile', desc: 'Multiple backlinks from the same domain have diminishing SEO value. Identifying domain-level duplicates helps you focus outreach efforts on building links from new domains instead.', c: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                { ic: <BarChart2 className="w-5 h-5" />, title: 'Track outreach campaigns', desc: 'After a link-building campaign, paste in all the pages you contacted. The audit tells you exactly which ones followed through with a live link and which ones need a follow-up email.', c: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              ].map(({ ic, title, desc, c, bg }) => (
                <div key={title} className="flex gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center ${c}`}>{ic}</div>
                  <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{desc}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding the Audit Results</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              The audit report shows four pieces of information for each backlink URL. Here is what each status means.
            </p>
            <div className="space-y-3">
              {[
                { s: 'Found', c: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', d: 'Your target URL was found on this page. The backlink is live and pointing to the right destination. This is the ideal result.' },
                { s: 'Not Found', c: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', d: 'Your target URL was not detected on this page. The link may have been removed, changed to a different URL, or the page content has been updated. This entry requires follow-up.' },
                { s: 'Error', c: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20', d: 'The page could not be checked due to a network error, timeout, or access restriction. Try re-auditing this URL or checking it manually in a browser.' },
                { s: 'Skipped', c: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700', d: 'This URL was identified as a duplicate of an already-checked URL or domain, depending on your Duplicate Check Scope setting. Duplicates are skipped to avoid redundant checks.' },
                { s: 'Invalid', c: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20', d: 'This entry is not a valid HTTP or HTTPS URL. It may be missing the protocol, be malformed, or contain special characters. It was excluded from the audit when Validation Filter is enabled.' },
              ].map(({ s, c, d }) => (
                <div key={s} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold flex-shrink-0 mt-0.5 ${c}`}>{s}</span>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this backlink auditor free?', a: 'Yes, 100% free. No account required. Paste in your URLs and start the audit. We use a fast, server-side crawler to bypass browser CORS restrictions and check your links.' },
                { q: 'How many backlinks can I audit at once?', a: 'There is no hard limit built into the tool. However, for very large lists (500+ URLs), the audit may take several minutes as each URL is processed sequentially. For faster results on large datasets, consider splitting the list into smaller batches.' },
                { q: 'What does the Link Health Score mean?', a: 'The Link Health Score is the percentage of your unique backlink pages on which your target URL was found. A score of 70% or higher is generally good. A low score indicates that many of your supposed backlinks are either missing, broken, or contain errors that need investigation.' },
                { q: 'What is URL Normalization and why does it matter?', a: 'URL Normalization strips tracking parameters (like utm_source, fbclid, gclid) and converts URLs to lowercase before checking for duplicates. Without normalization, two URLs that point to the same page but have different tracking codes would be treated as separate, unique backlinks — which would skew you duplicate counts.' },
                { q: 'What is the difference between Full URL and Domain scope for duplicates?', a: 'Full URL scope treats each unique URL as a separate entry — two pages on the same domain (example.com/page1 and example.com/page2) are both considered unique. Domain scope flags any second URL from the same root domain as a duplicate, since multiple links from the same domain have diminishing SEO value. Use Domain scope when managing link diversity in your backlink profile.' },
                { q: 'What does "Not Found" mean in the results?', a: 'Not Found means your target URL was not detected on that backlink page. The link may have been removed, changed, moved to a different URL, or never actually added. These entries are the most important ones to follow up on, as they represent links you thought you had but no longer do.' },
                { q: 'Can I export the results?', a: 'Yes. Click the Download CSV button in the results panel or in the summary card. The CSV includes all backlink URLs, their domains, target status (Found/Not Found/Error/Skipped), and duplicate status. You can open it in Excel, Google Sheets, or any other spreadsheet application.' },
                { q: 'Can I use this to audit backlinks for a client?', a: 'Yes. This tool works for any URL and any set of backlinks. Enter the client\'s target page URL and paste in their referring page list — sourced from Ahrefs, SEMrush, Moz, Google Search Console, or your own link-building spreadsheet. Export the CSV and share it directly with the client as a clean backlink audit report.' },
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