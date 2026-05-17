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

        {/* ── SEO Content ── */}
        <div className="mt-16 prose-premium">
          <div className="mb-8">
            <h2>About the Tool</h2>
            <p>
              Long, complex web addresses break formatting in emails, look unprofessional on social media, and are impossible to read aloud. We built this <strong>url shortener free online</strong> tool to solve that exact problem without forcing you through a tedious signup process. 
            </p>
            <p>
              By converting your lengthy links into compact, shareable formats, you instantly improve your click-through rates. Whether you are running a marketing campaign, sharing a document with a client, or simply cleaning up your digital workspace, our utility provides enterprise-grade link management with a frictionless user experience.
            </p>
          </div>

          <div className="mb-8">
            <h2>How to Use</h2>
            <p>
              Generating a custom, branded short link takes seconds. Here is the frictionless guide:
            </p>
            <ol>
              <li><strong>Paste your link:</strong> Navigate to the Shorten tab and paste your long URL into the input field.</li>
              <li><strong>Customize (Optional):</strong> Instead of a random string of characters, type a branded word in the custom alias box (e.g., <code>my-campaign-2026</code>).</li>
              <li><strong>Shorten and Copy:</strong> Click the shorten button. The tool instantly generates the link, copies it to your clipboard, and automatically switches you to your dashboard.</li>
              <li><strong>Recover Anywhere:</strong> At the top of your dashboard is a unique Recovery ID. Save this ID. If you ever switch devices or clear your cache, paste it into the Recover tab to instantly restore your entire link history.</li>
            </ol>
          </div>

          <div className="mb-8">
            <h2>Privacy & Security Anchor</h2>
            <p>
              Unlike traditional link management platforms that aggressively harvest your data, our conversion engine is built on absolute privacy and data ownership. We do not require an email address, password, or credit card.
            </p>
            <p>
              Instead of forcing an account, our system assigns a secure, anonymous cryptographic identifier to your browser session. All of your shortened URLs and their respective analytics are mapped directly to this identifier. We do not inject tracking pixels, we do not intercept the payload of the destination URLs, and we do not sell your click data to third-party advertising networks.
            </p>
            <p>
              If you delete a link from your dashboard, it triggers a hard delete on our server cluster. The alias is released, the routing rule is destroyed, and the analytics are permanently purged.
            </p>
          </div>

          <div className="mb-8">
            <h2>Features</h2>
            <p>
              Professional link routing requires more than just a shorter URL. Here is a look at the technical specifications of our engine:
            </p>
            <ul>
              <li><strong>Instant Recovery System:</strong> Never lose a link. Your unique Recovery ID allows you to sync your dashboard across your phone, tablet, and desktop securely.</li>
              <li><strong>Real-Time Analytics:</strong> Track the performance of your shared links. The dashboard automatically monitors total links generated, aggregate clicks, and the average click rate per URL.</li>
              <li><strong>Custom Branded Aliases:</strong> Improve trust by customizing the tail end of your URL. Clean aliases significantly boost user confidence before clicking.</li>
              <li><strong>Instant 302 Redirection:</strong> Our server utilizes highly optimized 302 temporary redirects to ensure users are routed to their destination with zero noticeable latency.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2>Technical Specifications</h2>
            <p>
              For network administrators and technical teams, here is the routing architecture:
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Specification</th>
                    <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Routing Protocol</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">HTTP 302 (Found)</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Authentication Method</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Cryptographic Session ID (Passwordless)</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Data Persistence</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Local Storage + Server Sync</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Alias Validation</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Alphanumeric, Hyphens, Underscores</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Latency Overhead</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">&lt; 50ms average routing delay</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Tracking Implementation</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Anonymous Aggregate Counters</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-8">
            <h2>FAQ (People Also Ask)</h2>
            <div className="space-y-4 mt-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">What is the Recovery ID?</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  It is a unique anonymous ID generated specifically for your browser. Save it somewhere safe. You can paste it into the Recover tab to restore all your links after a cache clear or when logging in from a new device.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Do the short links actually redirect?</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Yes! All short links use server-side 302 redirects to send users seamlessly and instantly to the original destination URL.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">What happens when I delete a link?</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  The link is removed from both your local browser cache and our database. Anyone who tries to use the deleted short URL will see a standard not-found page.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Can I use a custom alias?</h3>
                <p className="text-slate-700 dark:text-slate-300 text-sm">
                  Yes. You can enter between 3 and 20 alphanumeric characters, hyphens, or underscores in the custom alias field to create a branded, readable link.
                </p>
              </div>
            </div>
          </div> 
        </div>
      </div>
    </div>
  );
}
