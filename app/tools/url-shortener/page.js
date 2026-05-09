'use client';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Link2, Copy, Check, Trash2, ExternalLink, RotateCcw, AlertCircle, Loader2, Search, LayoutDashboard, Shield, TrendingUp, RefreshCw, Info } from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOrCreateUserId() {
  if (typeof window === 'undefined') return null;
  const KEY = 'owk_user_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = 'usr_' + crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

function loadLinks() {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('owk_short_links') || '[]'); } catch { return []; }
}

function saveLinks(arr) {
  if (typeof window !== 'undefined') localStorage.setItem('owk_short_links', JSON.stringify(arr));
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2800); };
  const el = msg ? (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 transition-all ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}
    </div>
  ) : null;
  return { show, el };
}

// ─── Shared Styles ────────────────────────────────────────────────────────────

const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inp = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition';
const lbl = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';
const btn = 'w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2';

// ─── LinkCard ─────────────────────────────────────────────────────────────────

function LinkCard({ lk, BASE, onDelete, onCopy, copied }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 truncate">{BASE}/s/{lk.slug || lk.code}</p>
            <button onClick={() => onCopy(lk)} className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition">
              {copied === (lk.id || lk.slug) ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>
            <a href={lk.originalUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition">
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
          <p className="text-[10px] text-slate-500 truncate mb-0.5">{lk.originalUrl}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[9px] text-slate-400">{new Date(lk.createdAt).toLocaleDateString()}</span>
            {lk.clicks !== undefined && (
              <span className="text-[9px] font-bold text-indigo-500 flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" />{lk.clicks} click{lk.clicks !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(lk)} className="p-1.5 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0">
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UrlShortener() {
  const [tab, setTab] = useState('shorten');
  const [url, setUrl] = useState('');
  const [alias, setAlias] = useState('');
  const [links, setLinks] = useState([]);
  const [userId, setUserId] = useState('');
  const [copied, setCopied] = useState('');
  const [loading, setLoading] = useState(false);
  const [idCopied, setIdCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  // Recover tab state
  const [recoverInput, setRecoverInput] = useState('');
  const [recovering, setRecovering] = useState(false);
  const toast = useToast();
  const initialized = useRef(false);
  const lastSyncedUserId = useRef('');

  const BASE = typeof window !== 'undefined' ? window.location.origin : 'https://omniwebkit.com';

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    setUserId(getOrCreateUserId() || '');
    setLinks(loadLinks());
  }, []);

  // ── Sync click counts from MongoDB ─────────────────────────────────────────
  const syncClicks = useCallback(async (uid, currentLinks) => {
    if (!uid) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/links?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!data.links || data.links.length === 0) return;
      // Build a slug → clicks map from DB
      const clickMap = {};
      data.links.forEach(l => { clickMap[l.slug] = l.clicks ?? 0; });
      // Merge into current local links
      const updated = currentLinks.map(l => {
        const slug = l.slug || l.code;
        if (slug in clickMap) return { ...l, clicks: clickMap[slug] };
        return l;
      });
      persist(updated);
    } catch { /* silent */ }
    finally { setSyncing(false); }
  }, []);

  // Auto-sync when user opens dashboard tab
  useEffect(() => {
    if (tab === 'dashboard' && userId && userId !== lastSyncedUserId.current) {
      lastSyncedUserId.current = userId;
      syncClicks(userId, loadLinks());
    }
  }, [tab, userId, syncClicks]);

  const persist = (arr) => { setLinks(arr); saveLinks(arr); };

  // ── Shorten ────────────────────────────────────────────────────────────────
  const shorten = useCallback(async () => {
    let u = url.trim();
    if (!u) { toast.show('Paste a URL first', 'err'); return; }
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    try { new URL(u); } catch { toast.show('Invalid URL', 'err'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: u, customSlug: alias.trim(), userId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.show(data.error || 'Failed to shorten URL', 'err'); return; }
      const nl = {
        id: Date.now().toString(),
        slug: data.slug,
        originalUrl: data.originalUrl,
        shortUrl: `${BASE}${data.shortUrl}`,
        createdAt: new Date().toISOString(),
        clicks: 0,
      };
      const updated = [nl, ...links];
      persist(updated);
      setUrl(''); setAlias('');
      navigator.clipboard.writeText(nl.shortUrl);
      setCopied(nl.id); setTimeout(() => setCopied(''), 2000);
      toast.show('Shortened & copied!');
      setTab('dashboard');
    } catch { toast.show('Network error', 'err'); }
    finally { setLoading(false); }
  }, [url, alias, links, BASE, userId]);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const del = useCallback(async (lk) => {
    const slug = lk.slug || lk.code;
    // Optimistic UI update
    persist(links.filter(l => (l.slug || l.code) !== slug));
    try {
      await fetch(`/api/links?userId=${encodeURIComponent(userId)}&slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
    } catch { /* best-effort */ }
    toast.show('Deleted');
  }, [links, userId]);

  // ── Copy ───────────────────────────────────────────────────────────────────
  const cp = (lk) => {
    const url = lk.shortUrl || `${BASE}/s/${lk.slug || lk.code}`;
    navigator.clipboard.writeText(url);
    setCopied(lk.id || lk.slug);
    setTimeout(() => setCopied(''), 2000);
    toast.show('Copied!');
  };

  // ── Recover links from MongoDB by User ID ──────────────────────────────────
  const recover = async () => {
    const id = recoverInput.trim();
    if (!id) { toast.show('Enter a User ID', 'err'); return; }
    setRecovering(true);
    try {
      const res = await fetch(`/api/links?userId=${encodeURIComponent(id)}`);
      const data = await res.json();
      if (!res.ok) { toast.show(data.error || 'Failed to fetch links', 'err'); return; }
      if (!data.links || data.links.length === 0) { toast.show('No links found for that ID', 'err'); return; }
      // Normalise links from server
      const fetched = data.links.map(l => ({
        id: l.id,
        slug: l.slug,
        originalUrl: l.originalUrl,
        shortUrl: `${BASE}/s/${l.slug}`,
        createdAt: l.createdAt,
        clicks: l.clicks,
      }));
      // Merge with existing, deduplicate by slug
      const existingSlugs = new Set(links.map(l => l.slug || l.code));
      const merged = [...links, ...fetched.filter(l => !existingSlugs.has(l.slug))];
      persist(merged);
      // If user is recovering with a different ID, adopt it
      if (id !== userId) {
        localStorage.setItem('owk_user_id', id);
        setUserId(id);
      }
      toast.show(`${data.links.length} link${data.links.length !== 1 ? 's' : ''} recovered!`);
      setRecoverInput('');
      setTab('dashboard');
    } catch { toast.show('Network error', 'err'); }
    finally { setRecovering(false); }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalClicks = links.reduce((s, l) => s + (l.clicks || 0), 0);

  // ─── Tabs ──────────────────────────────────────────────────────────────────
  const TABS = [
    { id: 'shorten', label: 'Shorten', icon: Link2 },
    { id: 'dashboard', label: 'My Links', icon: LayoutDashboard },
    { id: 'recover', label: 'Recover', icon: Search },
  ];

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
          <p className="text-slate-600 dark:text-slate-400 text-lg">Create short, shareable links — recoverable anytime</p>
        </div>

        {/* User ID Banner */}
        {userId && (
          <div className={`${card} p-4 mb-5 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30`}>
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-wide text-indigo-500 mb-1">Your Recovery ID — Save This!</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-all">{userId}</p>
                <p className="text-[9px] text-slate-500 mt-1 flex items-center gap-1"><Info className="w-2.5 h-2.5" />Use this ID on the Recover tab to restore your links if cache is cleared</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(userId); setIdCopied(true); setTimeout(() => setIdCopied(false), 2000); toast.show('ID copied!'); }}
                className="flex-shrink-0 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900 transition flex items-center gap-1"
              >
                {idCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {idCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Tab Bar */}
        <div className={`${card} p-1.5 mb-5 flex gap-1`}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${tab === id ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              <Icon className="w-3.5 h-3.5" />{label}
              {id === 'dashboard' && links.length > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${tab === id ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>{links.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: SHORTEN ───────────────────────────────────────────────── */}
        {tab === 'shorten' && (
          <div className={`${card} p-5`}>
            <label className={lbl}>Long URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Paste your long URL here..."
              className={`${inp} mb-3`} onKeyDown={e => e.key === 'Enter' && shorten()} />

            <label className={lbl}>Custom Alias (optional)</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-4">
              <span className="px-3 text-[10px] font-bold text-slate-400 whitespace-nowrap border-r border-slate-200 dark:border-slate-700 py-2.5">{BASE}/s/</span>
              <input value={alias} onChange={e => setAlias(e.target.value.replace(/[^a-zA-Z0-9\-_]/g, ''))} placeholder="custom-alias"
                className="flex-1 px-3 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white outline-none font-mono" />
            </div>

            <button onClick={shorten} disabled={!url.trim() || loading} className={btn}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Shortening...</> : <><Link2 className="w-4 h-4" />Shorten URL</>}
            </button>
          </div>
        )}

        {/* ── TAB: DASHBOARD ─────────────────────────────────────────────── */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Total Links', value: links.length, color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Total Clicks', value: totalClicks, color: 'text-violet-600 dark:text-violet-400' },
                { label: 'Avg Clicks', value: links.length ? (totalClicks / links.length).toFixed(1) : '0', color: 'text-emerald-600 dark:text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`${card} p-4 text-center`}>
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Links List */}
            {links.length > 0 ? (
              <div className={`${card} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <label className={lbl}>{links.length} Shortened URL{links.length !== 1 ? 's' : ''}</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => syncClicks(userId, links)}
                      disabled={syncing}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-600 transition flex items-center gap-1 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                      {syncing ? 'Syncing...' : 'Refresh'}
                    </button>
                    <button onClick={() => { persist([]); toast.show('All cleared'); }} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />Clear All
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {links.map(lk => (
                    <LinkCard key={lk.id || lk.slug} lk={lk} BASE={BASE} onDelete={del} onCopy={cp} copied={copied} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={`${card} p-10 text-center`}>
                <Link2 className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">No links yet</p>
                <p className="text-slate-400 text-xs mt-1">Go to the Shorten tab to create your first short link</p>
                <button onClick={() => setTab('shorten')} className="mt-4 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition">
                  Shorten a URL
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: RECOVER ───────────────────────────────────────────────── */}
        {tab === 'recover' && (
          <div className="space-y-4">
            <div className={`${card} p-5`}>
              <div className="flex items-start gap-3 mb-5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-0.5">How Recovery Works</p>
                  <p className="text-[10px] text-amber-600 dark:text-amber-500 leading-relaxed">
                    Enter the Recovery ID shown in the banner above (or that you saved previously). Your links will be fetched from our server and cached back to your browser.
                  </p>
                </div>
              </div>

              <label className={lbl}>Your Recovery ID</label>
              <input
                value={recoverInput}
                onChange={e => setRecoverInput(e.target.value)}
                placeholder="usr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className={`${inp} mb-4 font-mono text-xs`}
                onKeyDown={e => e.key === 'Enter' && recover()}
              />
              <button onClick={recover} disabled={recovering || !recoverInput.trim()} className={btn}>
                {recovering ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching...</> : <><RefreshCw className="w-4 h-4" />Recover My Links</>}
              </button>
            </div>

            {/* Quick-fill current ID */}
            {userId && (
              <div className={`${card} p-4`}>
                <p className={lbl}>Your Current ID (quick fill)</p>
                <div className="flex items-center gap-2">
                  <p className="flex-1 text-xs font-mono text-slate-600 dark:text-slate-400 truncate">{userId}</p>
                  <button onClick={() => { setRecoverInput(userId); toast.show('ID filled in'); }} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap">Use This</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-10 space-y-5">
          <div className={`${card} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free URL Shortener with Link Recovery</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Long URLs are messy, break in emails, and look unprofessional. This free URL shortener creates compact, shareable links instantly — no account needed. Your links are backed by our server so you can recover them anytime, even after clearing your browser cache.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every visitor gets a unique anonymous User ID stored in their browser. All shortened URLs are linked to this ID in our database. If you ever clear your cache, just paste your saved Recovery ID on the Recover tab and all your links are restored instantly.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The dashboard shows real-time click counts for every link. You can delete any link from both your browser and our database using the delete button. Custom aliases let you create branded, memorable short URLs.
            </p>
          </div>

          <div className={`${card} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Anonymous User ID', c: 'text-indigo-600 dark:text-indigo-400', b: 'Auto-generated unique ID ties your links to your session. No signup required.' },
                { t: 'Link Recovery', c: 'text-violet-600 dark:text-violet-400', b: 'Paste your Recovery ID anytime to fetch all your links from the server, even after clearing cache.' },
                { t: 'Click Analytics', c: 'text-blue-600 dark:text-blue-400', b: 'Every redirect is tracked. See total clicks per link in your dashboard.' },
                { t: 'Custom Aliases', c: 'text-emerald-600 dark:text-emerald-400', b: 'Set a branded alias instead of a random code. Perfect for sharing professionally.' },
                { t: 'Server-Side Delete', c: 'text-amber-600 dark:text-amber-400', b: 'Deleting a link removes it from both your browser and our database permanently.' },
                { t: 'Dashboard Stats', c: 'text-rose-600 dark:text-rose-400', b: 'Total links, total clicks, and average clicks displayed at a glance.' },
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
            <div className="space-y-3">
              {[
                { q: 'What is the Recovery ID?', a: 'It is a unique anonymous ID generated for your browser. Save it somewhere safe — paste it in the Recover tab to restore all your links after a cache clear or on a new device.' },
                { q: 'Is this URL shortener free?', a: 'Yes, completely free with no account, no limits, and no ads.' },
                { q: 'Do the short links actually redirect?', a: 'Yes! All short links use server-side 302 redirects to send users seamlessly to the original destination.' },
                { q: 'Can I access my links from a different device?', a: 'Yes — just copy your Recovery ID and use the Recover tab on any device to import your links.' },
                { q: 'What happens when I delete a link?', a: 'The link is removed from both your local browser and our database. Anyone who tries to use the short URL will see a not-found page.' },
                { q: 'Does it track clicks?', a: 'Yes, every redirect increments a click counter stored in our database. You can see clicks per link in the dashboard.' },
                { q: 'Can I use a custom alias?', a: 'Yes. Enter 3-20 alphanumeric characters or hyphens in the custom alias field when shortening.' },
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
