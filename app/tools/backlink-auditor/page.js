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
        <div className="mt-16 prose-premium">
          <section>
            <h1>SEO Backlink Auditor: Verify Your Link Profile Instantly</h1>
            <p>
              Link building takes serious time and budget, but how do you know those hard-earned links are actually live? The <strong>SEO Backlink Auditor</strong> by Lazydesigners is built to solve exactly that. Instead of manually clicking through hundreds of referring domains, this backlink auditor checks your entire list in seconds. 
            </p>
            <p>
              I've run outreach campaigns where 20% of promised links either disappeared, returned a 404 error, or never went live in the first place. That's why we built this tool. It pings every URL on your list, crawls the page structure, and verifies that your exact target URL is present. It also roots out duplicate domains, so you're not getting fooled by site-wide footer links that artificially inflate your backlink count.
            </p>
          </section>

          <section>
            <h2>How to Use the SEO Backlink Auditor</h2>
            <ol>
              <li><strong>Enter your Target URL:</strong> This is the exact page you want to verify links for (e.g., your homepage or a specific blog post).</li>
              <li><strong>Input Backlink URLs:</strong> Paste your list of referring URLs (one per line) or upload a <code>.txt</code> or <code>.csv</code> file directly into the auditor.</li>
              <li><strong>Configure Settings:</strong> Toggle <strong>URL Normalization</strong> to strip messy tracking tags, and choose your <strong>Duplicate Check Scope</strong> (Full URL or Root Domain).</li>
              <li><strong>Start the Audit:</strong> Click the button. The tool will individually verify each page and show you a real-time progress bar.</li>
              <li><strong>Download the Report:</strong> Once finished, review your Link Health Score and export the results to CSV for your client or your own records.</li>
            </ol>
          </section>

          <section>
            <h2>Privacy & Security: Your Data Stays Yours</h2>
            <p>
              We know link lists are highly confidential. This backlink auditor runs checks server-side to bypass local CORS restrictions, but we absolutely <strong>never store, log, or share</strong> your target URLs or backlink lists. 
            </p>
            <p>
              The moment your audit finishes and you export your CSV, the session data is wiped. You don't need an account, there's no database saving your outreach contacts, and no one else gets to see your link-building strategy. It's completely private and secure.
            </p>
          </section>

          <section>
            <h2>Features That Make This Backlink Auditor Different</h2>
            <ul>
              <li><strong>Intelligent URL Normalization:</strong> A link with <code>?utm_source=twitter</code> and one without it are the same link. The auditor strips these tags automatically to prevent false duplicates.</li>
              <li><strong>Root Domain Deduplication:</strong> Getting 50 links from the same forum thread doesn't help your SEO much. Choose "Root Domain" scope to filter out everything but the first unique domain.</li>
              <li><strong>Live Target Verification:</strong> It doesn't just check if the referring page is up. It verifies that your specific target URL is embedded in the HTML.</li>
              <li><strong>Instant CSV Exports:</strong> Generate a client-ready report in one click, categorizing links by Found, Missing, Error, or Duplicate.</li>
            </ul>
          </section>

          <section>
            <h2>Technical Specifications</h2>
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Input Formats</td>
                  <td>Manual paste, <code>.txt</code>, <code>.csv</code></td>
                </tr>
                <tr>
                  <td>Verification Method</td>
                  <td>Server-side HTML parsing (bypasses CORS)</td>
                </tr>
                <tr>
                  <td>Duplicate Scope</td>
                  <td>Full URL match or Root Domain (Hostname)</td>
                </tr>
                <tr>
                  <td>Export Format</td>
                  <td>Formatted CSV with status flags</td>
                </tr>
                <tr>
                  <td>Data Retention</td>
                  <td>Zero. No logs, no database storage.</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>Frequently Asked Questions</h2>
            
            <h3>Is this backlink auditor free to use?</h3>
            <p>Yes, it's completely free. There are no paywalls, no daily limits, and you don't need to create an account to use the tool or download your reports.</p>

            <h3>What does "Not Found" mean in the results?</h3>
            <p>If a link is marked as "Not Found," it means the auditor crawled the referring page but couldn't find your target URL in the HTML. The page is live, but your link has been removed, altered, or never existed. This is your signal to follow up.</p>

            <h3>Why should I use Root Domain deduplication?</h3>
            <p>Google values link diversity. Multiple links from the same root domain have diminishing returns. By filtering your audit to "Root Domain," you get a much clearer picture of your actual SEO link authority.</p>

            <h3>Can I check backlinks for a client's website?</h3>
            <p>Absolutely. Enter the client's target URL, paste in their backlink list (maybe exported from Ahrefs or Search Console), run the audit, and send them the exported CSV as a deliverable.</p>
          </section>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "SEO Backlink Auditor",
                "url": "https://omniwebkit.com/tools/backlink-auditor",
                "applicationCategory": "SEOApplication",
                "operatingSystem": "All",
                "description": "A free SEO backlink auditor that verifies live links, checks for duplicates, and generates instant CSV reports without storing your data.",
                "author": {
                  "@type": "Organization",
                  "name": "Lazydesigners",
                  "url": "https://lazydesigners.com"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0.00",
                  "priceCurrency": "USD"
                }
              })
            }}
          />
        </div>
      </div>
    </div>
  );
}