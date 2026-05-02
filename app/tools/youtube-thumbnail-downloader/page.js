'use client';
import { useState, useCallback, useEffect } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Download, Link2, Image as ImageIcon, AlertCircle, Check, Copy,
  ExternalLink, Loader2, Youtube, Maximize2, X
} from 'lucide-react';

/* ─── Design tokens ─── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Toast ─── */
function useToast() {
  const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 3000); };
  const el = msg ? (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}
    </div>
  ) : null;
  return { show, el };
}

/* ─── Extract video ID from any YouTube URL format ─── */
function extractVideoId(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?m\.youtube\.com\/watch\?(?:.*&)?v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube-nocookie\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = raw.match(p);
    if (m?.[1]) return m[1];
  }
  return null;
}

/* ─── Thumbnail definitions ─── */
function buildThumbs(id) {
  const b = `https://img.youtube.com/vi/${id}`;
  return [
    { key: 'maxres',    label: 'Maximum Resolution', desc: '1280 × 720',  url: `${b}/maxresdefault.jpg`, file: `${id}_maxresdefault.jpg`, badge: 'Best',      priority: 1 },
    { key: 'hq720',     label: 'HD 720p',             desc: '1280 × 720',  url: `${b}/hq720.jpg`,         file: `${id}_hq720.jpg`,         badge: null,        priority: 2 },
    { key: 'sddefault', label: 'Standard (480p)',     desc: '640 × 480',   url: `${b}/sddefault.jpg`,     file: `${id}_sddefault.jpg`,     badge: null,        priority: 3 },
    { key: 'hqdefault', label: 'High Quality',        desc: '480 × 360',   url: `${b}/hqdefault.jpg`,     file: `${id}_hqdefault.jpg`,     badge: null,        priority: 4 },
    { key: 'mqdefault', label: 'Medium Quality',      desc: '320 × 180',   url: `${b}/mqdefault.jpg`,     file: `${id}_mqdefault.jpg`,     badge: null,        priority: 5 },
    { key: 'default',   label: 'Default Quality',     desc: '120 × 90',    url: `${b}/default.jpg`,       file: `${id}_default.jpg`,       badge: null,        priority: 6 },
    { key: 'f1',        label: 'Frame 1',             desc: '120 × 90',    url: `${b}/1.jpg`,             file: `${id}_frame1.jpg`,        badge: null,        priority: 7 },
    { key: 'f2',        label: 'Frame 2',             desc: '120 × 90',    url: `${b}/2.jpg`,             file: `${id}_frame2.jpg`,        badge: null,        priority: 8 },
    { key: 'f3',        label: 'Frame 3',             desc: '120 × 90',    url: `${b}/3.jpg`,             file: `${id}_frame3.jpg`,        badge: null,        priority: 9 },
  ];
}

/* ─── Validate whether a thumbnail URL actually exists (not 404/placeholder) ─── */
function checkImage(url, timeout = 6000) {
  return new Promise((resolve) => {
    const img = new window.Image();
    const t = setTimeout(() => { img.src = ''; resolve({ ok: false, w: 0, h: 0 }); }, timeout);
    img.onload = () => { clearTimeout(t); resolve({ ok: img.naturalWidth > 1, w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { clearTimeout(t); resolve({ ok: false, w: 0, h: 0 }); };
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

/* ─── Download via server-side media-proxy to bypass YouTube CDN CORS ─── */
async function downloadBlob(url, filename) {
  try {
    const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename.replace(/\.jpg$/, ''))}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('Proxy error');
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
  } catch {
    // Fallback: direct link (may open in tab on some browsers)
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/* ─── Example URLs ─── */
const EXAMPLES = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/9bZkp7q19f0',
  'https://www.youtube.com/shorts/H-DN3Guxabk',
];

/* ─── Main ─── */
export default function YouTubeThumbnailDownloader() {
  const [url, setUrl]           = useState('');
  const [thumbs, setThumbs]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [videoId, setVideoId]   = useState('');
  const [copied, setCopied]     = useState('');
  const [lightbox, setLightbox] = useState(null);
  const toast = useToast();

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    const raw = url.trim();
    if (!raw) { setError('Please enter a YouTube URL or video ID'); return; }
    const id = extractVideoId(raw);
    if (!id) { setError('Could not find a valid YouTube video ID in that URL'); return; }

    setError('');
    setThumbs([]);
    setVideoId(id);
    setLoading(true);

    try {
      const candidates = buildThumbs(id);
      const checked = await Promise.all(
        candidates.map(async (t) => {
          const { ok, w, h } = await checkImage(t.url);
          return { ...t, ok, w, h };
        })
      );
      const sorted = checked.sort((a, b) => {
        if (a.ok !== b.ok) return a.ok ? -1 : 1;
        return a.priority - b.priority;
      });
      setThumbs(sorted);
      if (!sorted.some(t => t.ok)) {
        setError('No thumbnails could be loaded. The video may be private or unavailable.');
      } else {
        toast.show(`Found ${sorted.filter(t => t.ok).length} thumbnails!`);
      }
    } catch (e) {
      setError('Something went wrong while loading thumbnails.');
    } finally {
      setLoading(false);
    }
  }, [url, loading]);

  /* Enter key handler */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') handleSubmit(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleSubmit]);

  const copyUrl = async (u) => {
    try { await navigator.clipboard.writeText(u); }
    catch { /* fallback - already handled */ }
    setCopied(u);
    setTimeout(() => setCopied(''), 2000);
    toast.show('URL copied!');
  };

  const available = thumbs.filter(t => t.ok);
  const unavailable = thumbs.filter(t => !t.ok);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>
            <img src={lightbox.url} alt={lightbox.label} className="w-full rounded-xl shadow-2xl" />
            <p className="text-center text-white/60 text-xs mt-2">{lightbox.label} — {lightbox.w} × {lightbox.h}px</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'YouTube Thumbnail Downloader', href: '/tools/youtube-thumbnail-downloader' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mb-4 shadow-lg shadow-red-500/30">
            <Youtube className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">YouTube Thumbnail Downloader</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Download any YouTube video thumbnail in all available resolutions — Max HD, 720p, 480p, and more. Free, instant, no login.
          </p>
        </div>

        {/* URL Input */}
        <div className={`${cardCls} p-6 mb-5`}>
          <label className="block text-xs font-black uppercase tracking-wide text-slate-400 mb-2">YouTube URL or Video ID</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={url}
                onChange={e => { setUrl(e.target.value); setError(''); }}
                placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                disabled={loading}
                className="w-full pl-9 pr-4 py-3 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500/40 transition disabled:opacity-60 font-mono"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/25 transition disabled:opacity-50 whitespace-nowrap">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Extracting...</>
                       : <><ImageIcon className="w-4 h-4" />Get Thumbnails</>}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
            </div>
          )}

          {/* Example URLs */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wide text-slate-400">Try:</span>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => setUrl(ex)}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[180px]">
                {ex.replace('https://', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className={`${cardCls} p-6 mb-5`}>
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-5 h-5 animate-spin text-red-500" />
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Checking available thumbnail resolutions…</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse aspect-video" />
              ))}
            </div>
          </div>
        )}

        {/* Video Info Bar */}
        {videoId && available.length > 0 && (
          <div className={`${cardCls} p-4 mb-5 flex flex-wrap items-center justify-between gap-3`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-0.5">Video ID</p>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{videoId}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-0.5">Thumbnails Found</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{available.length} available</p>
            </div>
            <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition">
              <ExternalLink className="w-3.5 h-3.5" />Watch on YouTube
            </a>
          </div>
        )}

        {/* Available Thumbnails Grid */}
        {available.length > 0 && (
          <div className={`${cardCls} p-6 mb-5`}>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red-500" />Available Thumbnails
              <span className="ml-auto text-[10px] font-bold text-slate-400">{available.length} sizes</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {available.map(t => (
                <div key={t.key} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden group hover:border-red-400 dark:hover:border-red-500 transition-colors">
                  {/* Thumbnail Image */}
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-900/40 overflow-hidden">
                    <img src={t.url} alt={`${t.label} YouTube thumbnail`}
                      className="w-full h-full object-cover" loading="lazy" />
                    {t.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full uppercase tracking-wide">
                        {t.badge}
                      </span>
                    )}
                    {/* Fullscreen button on hover */}
                    <button onClick={() => setLightbox(t)}
                      className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Card body */}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{t.label}</p>
                        <p className="text-[10px] text-slate-400">{t.w && t.h ? `${t.w} × ${t.h}px` : t.desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => downloadBlob(t.url, t.file)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg text-[10px] font-black transition shadow-sm">
                        <Download className="w-3 h-3" />Download
                      </button>
                      <button onClick={() => copyUrl(t.url)}
                        title="Copy image URL"
                        className={`flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-[10px] font-bold transition ${
                          copied === t.url
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}>
                        {copied === t.url ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unavailable */}
        {unavailable.length > 0 && available.length > 0 && (
          <div className={`${cardCls} p-5 mb-5`}>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
              Not available for this video ({unavailable.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {unavailable.map(t => (
                <span key={t.key} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-400 rounded-lg line-through">
                  {t.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features strip (shown before first search) */}
        {thumbs.length === 0 && !loading && (
          <div className={`${cardCls} p-6 mb-5`}>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4">What you get</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                ['9 Resolutions',          'From 120×90 default to 1280×720 Max HD — get every available size in one click.'],
                ['Instant Preview',        'See every thumbnail before downloading. Click to open in fullscreen lightbox.'],
                ['Copy Image URL',         'Copy the direct image URL for any thumbnail to use in articles, embeds, or tools.'],
                ['All YouTube Formats',    'Supports standard watch URLs, youtu.be short links, Shorts, Embeds, and bare video IDs.'],
                ['No Login Required',      'Paste the URL and download. No account, no OAuth, no sign-in.'],
                ['100% Free & Private',    'Thumbnails are fetched directly from YouTube\'s public CDN. Nothing is stored.'],
              ].map(([t, b]) => (
                <div key={t} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{t}</p>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free YouTube Thumbnail Downloader — Get HD Thumbnails in Seconds</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every YouTube video has a thumbnail — and sometimes you need that image. Maybe you are writing a blog post about a video, building a media kit, creating a course, or making a presentation. Maybe you want to study thumbnail design from successful creators. Whatever the reason, this free YouTube thumbnail downloader gives you every available size in a single click, with no sign-in, no watermarks, and no tricks.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              YouTube stores thumbnails in up to nine different resolutions for each video. The best one is the max resolution thumbnail (1280 × 720 pixels), which creators upload separately. Below that, YouTube automatically generates smaller versions at 480p, 360p, 180p, and 90p. This tool checks all nine quality levels and shows you every one that actually exists for the video you entered.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The thumbnails are fetched directly from YouTube's public image CDN (img.youtube.com). This tool does not store, cache, or process any image on a server. It simply constructs the correct image URLs for the video ID you provide and lets your browser load them directly from YouTube's servers, which is why it works instantly without any delay.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How to Download a YouTube Thumbnail</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">Takes about 10 seconds from start to download.</p>
            <ol className="space-y-4">
              {[
                ['Copy the YouTube video URL', 'Go to any YouTube video. Copy the URL from the browser address bar. You can also copy it from the share button, the embed code, or just copy the video ID directly if you have it.'],
                ['Paste into the input', 'Paste the URL into the input box above. The tool accepts any YouTube URL format: youtube.com/watch?v=..., youtu.be/..., YouTube Shorts, embed URLs, or a bare 11-character video ID.'],
                ['Click "Get Thumbnails"', 'Click the button or press Enter. The tool checks all nine possible thumbnail resolutions and shows every one that is available for that video.'],
                ['Preview and choose a resolution', 'Browse the thumbnail cards. Each card shows the actual image, resolution in pixels, and quality label. Click the fullscreen icon to open any thumbnail in a larger lightbox view.'],
                ['Download or copy URL', 'Click Download on the card you want to save the image directly to your device. Click the copy icon to copy the direct image URL to your clipboard instead.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-red-600 text-white text-xs font-black rounded-full flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Thumbnail Sizes Explained</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 pr-4 font-black text-slate-700 dark:text-slate-300 text-xs">Quality Name</th>
                    <th className="text-left py-2 pr-4 font-black text-slate-700 dark:text-slate-300 text-xs">Resolution</th>
                    <th className="text-left py-2 font-black text-slate-700 dark:text-slate-300 text-xs">Best Use</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    ['Max Resolution (maxresdefault)', '1280 × 720', 'Best choice for articles, presentations, print, and social media posts'],
                    ['HD 720p (hq720)',                '1280 × 720', 'Alternate HD version, sometimes available when maxres is not'],
                    ['Standard (sddefault)',            '640 × 480',  'Good for blog post headers and email newsletters'],
                    ['High Quality (hqdefault)',        '480 × 360',  'Embeds, cards, and medium-sized previews'],
                    ['Medium Quality (mqdefault)',      '320 × 180',  'Sidebar widgets, small cards'],
                    ['Default (default)',               '120 × 90',   'Favicons, tiny thumbnails, icon-sized use'],
                    ['Frames 1, 2, 3 (1.jpg/2.jpg/3.jpg)', '120 × 90', 'Video scrub frames captured at different time points'],
                  ].map(([q, r, u]) => (
                    <tr key={q} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-2 pr-4 font-bold text-slate-700 dark:text-slate-300">{q}</td>
                      <td className="py-2 pr-4 font-mono text-slate-500 dark:text-slate-400">{r}</td>
                      <td className="py-2 text-slate-400">{u}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Real-World Use Cases</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {t:'Bloggers & Content Writers',    c:'text-rose-600 dark:text-rose-400',    b:'Embed YouTube thumbnails in blog posts as featured images or in-line illustrations when referencing a video. The 1280×720 max resolution thumbnail is ideal for hero images.'},
                {t:'Video Creators',                c:'text-blue-600 dark:text-blue-400',    b:'Download your own video thumbnails for media kits, sponsorship proposals, or portfolio websites. Saves you having to look up the original source file.'},
                {t:'Educators & Course Builders',   c:'text-emerald-600 dark:text-emerald-400',b:'Include video thumbnails in course materials, lesson plans, and e-learning platforms when linking to supporting YouTube content.'},
                {t:'Social Media Managers',         c:'text-violet-600 dark:text-violet-400', b:'Download thumbnails to create social media posts that preview or promote a YouTube video through a third-party platform.'},
                {t:'Researchers & Analysts',        c:'text-amber-600 dark:text-amber-400',   b:'Download thumbnails from competitor or reference channels to study design trends, color schemes, text placement, and click-through optimization strategies.'},
                {t:'Designers & Brand Teams',       c:'text-indigo-600 dark:text-indigo-400', b:'Use thumbnail images as reference artwork or as source material for derivative graphic design and social content creation.'},
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                {q:'Is this YouTube thumbnail downloader free?',            a:'Yes, completely free with no account required and no usage limits.'},
                {q:'Is it legal to download YouTube thumbnails?',           a:'YouTube thumbnails are publicly accessible images served from YouTube\'s CDN. Downloading them for personal reference, research, or fair-use commentary is generally acceptable. Do not use downloaded thumbnails in ways that infringe copyright or violate YouTube\'s Terms of Service.'},
                {q:'Why is the max resolution thumbnail not available?',    a:'Not all videos have a maxresdefault thumbnail. This resolution is only present if the video creator uploaded a custom HD thumbnail. Older videos, auto-processed videos, and some mobile uploads may only have lower-resolution versions.'},
                {q:'Does this tool work with YouTube Shorts?',              a:'Yes. Paste the Shorts URL (youtube.com/shorts/...) and the tool extracts the video ID and fetches all available thumbnail resolutions.'},
                {q:'Can I download thumbnails from private videos?',        a:'No. Private and unlisted videos do not serve thumbnails from the public YouTube CDN, so the tool will not find any available images.'},
                {q:'Does it store or upload any data?',                     a:'No. The tool works entirely in your browser. It constructs YouTube image URLs locally and your browser fetches them directly from img.youtube.com. Nothing passes through our servers.'},
                {q:'What URL formats are supported?',                       a:'The tool accepts standard youtube.com/watch?v= URLs, youtu.be/ short links, YouTube Shorts URLs, embed URLs, youtube-nocookie.com links, and plain 11-character video IDs.'},
                {q:'Why does "Download" open the image in a new tab instead of saving?', a:'YouTube\'s CDN does not include CORS headers that allow forced download, so some browsers open the image instead of downloading it. Right-click the image and choose "Save image as" to save it manually.'},
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
