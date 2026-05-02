'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Code2, Copy, Check, Share2, Clock, FileCode, Hash, Type,
  AlignLeft, Loader2, AlertCircle, Server, Link as LinkIcon,
  ExternalLink, Search, Trash2, Eye
} from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Constants ─────────────────────────────────────────────────────── */
const LANGUAGES = ['plaintext', 'javascript', 'python', 'html', 'css', 'json', 'typescript', 'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'sql', 'bash', 'yaml', 'xml', 'markdown', 'swift', 'kotlin', 'dart', 'lua', 'perl', 'r', 'scala', 'shell', 'toml'];
const EXPIRY = [
  { label: 'Never (30 days)', seconds: 0 },
  { label: '10 Min', seconds: 600 },
  { label: '1 Hour', seconds: 3600 },
  { label: '1 Day', seconds: 86400 },
  { label: '1 Week', seconds: 604800 },
];
const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition';

function genId() { return Math.random().toString(36).slice(2, 10); }
function lineCount(t) { return t.split('\n').length; }
function wordCount(t) { return t.trim() ? t.trim().split(/\s+/).length : 0; }
function fmtTime(ts) { return new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

/* ─── Main ──────────────────────────────────────────────────────────── */
export default function Pastebin() {
  const router = useRouter();
  
  // Tabs & History
  const [tab, setTab] = useState('create');
  const [pastes, setPastes] = useState([]);
  const [search, setSearch] = useState('');

  // Create state
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('plaintext');
  const [expiry, setExpiry] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { id, remote: boolean }
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const cp = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const codeLines = code.split('\n').length;
  const codeWords = wordCount(code);
  const codeChars = code.length;

  /* Load history */
  useEffect(() => {
    try {
        const saved = JSON.parse(localStorage.getItem('owk_pastes') || '[]');
        const now = Date.now();
        const valid = saved.filter(p => !p.expiresAt || p.expiresAt > now);
        setPastes(valid);
        if (saved.length !== valid.length) {
            localStorage.setItem('owk_pastes', JSON.stringify(valid));
        }
    } catch { }
  }, []);

  const save = (np) => { 
      setPastes(np); 
      localStorage.setItem('owk_pastes', JSON.stringify(np)); 
  };
  
  const del = (id) => { 
      save(pastes.filter(p => p.id !== id)); 
  };

  const filtered = useMemo(() => {
      if (!search.trim()) return pastes;
      const q = search.toLowerCase();
      return pastes.filter(p => p.title.toLowerCase().includes(q) || p.language.includes(q));
  }, [pastes, search]);

  const createPaste = useCallback(async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    const pasteData = {
        title: title.trim() || 'Untitled',
        language,
        expiry,
    };

    try {
      const res = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ...pasteData }),
      });

      const data = await res.json();
      
      let p;
      if (res.ok) {
          // Remote paste
          p = { 
              id: data.id, 
              ...pasteData, 
              createdAt: Date.now(), 
              expiresAt: data.expiresAt, 
              views: 0, 
              remote: true 
          };
          showToast('Paste created on server! 🎉');
      } else if (data.fallback || !res.ok) {
          // Fallback to local
          const localId = genId();
          p = {
              id: localId,
              ...pasteData,
              code, // Save code locally
              createdAt: Date.now(),
              expiresAt: expiry > 0 ? Date.now() + (expiry * 1000) : null,
              views: 0,
              remote: false
          };
          if (data.fallback) {
              showToast('Server storage not configured. Paste saved locally. 💾', 'warn');
          } else {
              showToast(data.error || 'Server error. Paste saved locally. 💾', 'warn');
          }
      }

      if (p) {
          save([p, ...pastes]);
          setResult(p);
      }
    } catch (err) {
      // Fallback to local if network error
      const localId = genId();
      const p = {
          id: localId,
          ...pasteData,
          code, // Save code locally
          createdAt: Date.now(),
          expiresAt: expiry > 0 ? Date.now() + (expiry * 1000) : null,
          views: 0,
          remote: false
      };
      save([p, ...pastes]);
      setResult(p);
      showToast('Network error. Paste saved locally. 💾', 'warn');
    } finally {
      setLoading(false);
    }
  }, [code, title, language, expiry, pastes]);

  const reset = () => {
    setCode(''); setTitle(''); setResult(null); setError(''); setTab('create');
  };

  const fullUrl = result ? `${typeof window !== 'undefined' ? window.location.origin : ''}/tools/pastebin/${result.id}` : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${toast.type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
          {toast.type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Pastebin', href: '/tools/pastebin' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mb-4 shadow-lg shadow-amber-500/25">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Pastebin</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Create shareable code snippets with permanent links</p>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full">
            <Server className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Hybrid Storage</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6 w-fit">
            {[
                { id: 'create', label: 'New Paste', Icon: FileCode },
                { id: 'history', label: `My Pastes (${pastes.length})`, Icon: Clock },
            ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${tab === t.id
                            ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}>
                    <t.Icon className="w-3.5 h-3.5" />{t.label}
                </button>
            ))}
        </div>

        {/* ── CREATE ── */}
        {tab === 'create' && !result && (
          <div className={`${card} p-5`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)"
                className={`col-span-2 ${inputCls}`} />
              <select value={language} onChange={e => setLanguage(e.target.value)} className={inputCls}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={expiry} onChange={e => setExpiry(+e.target.value)} className={inputCls}>
                {EXPIRY.map(o => <option key={o.seconds} value={o.seconds}>{o.label}</option>)}
              </select>
            </div>

            <textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Paste your code here…" rows={14}
              className={`w-full ${inputCls} font-mono leading-relaxed resize-y mb-3 rounded-xl`} />

            {/* Stats bar */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {[
                { icon: <AlignLeft className="w-3.5 h-3.5" />, label: 'Lines', val: codeLines },
                { icon: <Type className="w-3.5 h-3.5" />, label: 'Words', val: codeWords },
                { icon: <Hash className="w-3.5 h-3.5" />, label: 'Chars', val: codeChars },
              ].map(({ icon, label, val }) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  {icon}<span className="font-bold text-slate-700 dark:text-slate-300">{val.toLocaleString()}</span> {label}
                </span>
              ))}
            </div>

            {/* Info */}
            <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 flex items-start gap-2">
              <Server className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                <strong>Hybrid storage:</strong> Pastes are saved to a secure database for sharing. If the database is not configured, it will fall back to local browser storage seamlessly.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-600 dark:text-red-400 font-bold">{error}</p>
              </div>
            )}

            <button onClick={createPaste} disabled={!code.trim() || loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" />Creating…</>
                : <><Share2 className="w-5 h-5" />Create Paste</>
              }
            </button>
          </div>
        )}

        {/* ── RESULT ── */}
        {tab === 'create' && result && (
          <div className="space-y-4">
            <div className={`${card} p-6`}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-lg font-bold text-slate-900 dark:text-white">Paste Created!</span>
              </div>

              {!result.remote && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-700 dark:text-amber-400">
                          <strong>Stored Locally:</strong> Server storage is currently unavailable. This paste is saved to your browser's local storage. The link below will only work on this device.
                      </p>
                  </div>
              )}

              {/* Shareable URL */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mb-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
                    {result.remote ? 'Shareable Link' : 'Local Link'}
                </p>
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <code className="flex-1 text-sm font-mono text-amber-700 dark:text-amber-400 break-all">{fullUrl}</code>
                  <button onClick={() => cp(fullUrl, 'url')}
                    className="flex-shrink-0 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition flex items-center gap-1">
                    {copied === 'url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied === 'url' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5">ID</p>
                  <p className="text-sm font-mono font-black text-slate-900 dark:text-white">{result.id}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5">LANGUAGE</p>
                  <p className="text-sm font-black text-amber-600 dark:text-amber-400">{language}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5">EXPIRES</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {result.expiresAt ? new Date(result.expiresAt).toLocaleDateString() : (result.remote ? '30 days' : 'Never')}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={reset}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">
                  <FileCode className="w-4 h-4" />New Paste
                </button>
                <button onClick={() => router.push(`/tools/pastebin/${result.id}`)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />View Paste
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY ── */}
        {tab === 'history' && (
            <div className="space-y-3">
                {/* Search */}
                {pastes.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your pastes…"
                            className={`w-full pl-10 ${inputCls}`} />
                    </div>
                )}

                {(filtered.length === 0 && pastes.length === 0) ? (
                    <div className={`${card} p-10 text-center`}>
                        <FileCode className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No pastes yet — create one to get started</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className={`${card} p-10 text-center`}>
                        <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No pastes match "{search}"</p>
                    </div>
                ) : (
                    filtered.map(p => (
                        <div key={p.id} onClick={() => router.push(`/tools/pastebin/${p.id}`)}
                            className={`${card} p-4 flex items-center justify-between cursor-pointer group hover:border-amber-300 dark:hover:border-amber-700 transition`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.title}</p>
                                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 flex-shrink-0">{p.language}</span>
                                    {p.remote ? (
                                        <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded text-[9px] font-bold uppercase">Cloud</span>
                                    ) : (
                                        <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded text-[9px] font-bold uppercase">Local</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    {p.views} views • {fmtTime(p.createdAt)}
                                    {p.expiresAt && <span className="ml-2 text-amber-600 dark:text-amber-400">expires {fmtTime(p.expiresAt)}</span>}
                                </p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); del(p.id); }}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0">
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${card} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Pastebin — Share Code with Permanent Links</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This Pastebin creates server-stored, shareable code snippets. Unlike browser-only pastebins that lose data when you clear your cache, every paste here gets a unique permanent URL that anyone can access. Your code is stored in a database on the server — not localStorage.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Pick a language from 30 options, set an optional expiry (10 minutes to 30 days), and paste your code. One click creates a shareable link like <code className="text-amber-600 dark:text-amber-400 text-xs">omniwebkit.com/tools/pastebin/xK7mP2qn</code> that you can send to colleagues, students, or friends. They see your code with line numbers, syntax labels, view count, and one-click copy/download.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              No signup, no account, no watermarks. Pastes auto-expire after the selected duration (default 30 days). Perfect for sharing code during code reviews, debugging sessions, interviews, or teaching.
            </p>
          </div>

          <div className={`${card} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Why Server-Side Storage Matters</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Shareable permanent URLs', c: 'text-amber-600 dark:text-amber-400', b: 'Every paste gets a unique URL. Share it with anyone — they don\'t need an account to view your code.' },
                { t: 'Survives browser clears', c: 'text-blue-600 dark:text-blue-400', b: 'localStorage pastebins lose everything when you clear your cache. Server storage persists across devices and browsers.' },
                { t: 'View count tracking', c: 'text-teal-600 dark:text-teal-400', b: 'See how many people viewed your paste. Useful for tracking engagement on shared snippets.' },
                { t: 'Auto-expiry with TTL', c: 'text-purple-600 dark:text-purple-400', b: 'Set pastes to expire automatically. The server deletes them — no manual cleanup needed.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${card} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this pastebin free?', a: 'Yes, completely free. No account, no signup, no limits on number of pastes.' },
                { q: 'Where are pastes stored?', a: 'On a database server. Each paste gets a unique ID and is retrievable via its URL from any device or browser.' },
                { q: 'Can anyone see my paste?', a: 'Only people who have the link. Paste IDs are random 8-character strings — they are not guessable or indexed by search engines.' },
                { q: 'What happens when a paste expires?', a: 'The Database server automatically deletes it when the TTL (time-to-live) expires. The URL returns a "Paste not found" message.' },
                { q: 'How many languages are supported?', a: '30 — JavaScript, Python, TypeScript, Java, C, C++, Go, Rust, PHP, Ruby, SQL, Bash, YAML, XML, Markdown, Swift, Kotlin, Dart, and more.' },
                { q: 'What is the maximum paste size?', a: '512 KB per paste. This covers the vast majority of code snippets, config files, and log outputs.' },
                { q: 'Can I download my paste?', a: 'Yes. On the paste view page, click Download to save it as a file with the correct extension (.js, .py, .html, etc.).' },
                { q: 'How long do pastes last by default?', a: '30 days. You can set shorter expiry times: 10 minutes, 1 hour, 1 day, or 1 week.' },
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
