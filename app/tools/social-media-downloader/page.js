'use client';
import { useState, useCallback } from 'react';
import { Download, Search, AlertCircle, Copy, Check, Loader2, Link2, Video } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

function useToast() {
    const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
    const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
    const el = msg ? (<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}</div>) : null;
    return { show, el };
}

const PLATFORMS = {
    instagram: { name: 'Instagram', icon: '\uD83D\uDCF8', color: 'from-pink-500 to-purple-600' },
    twitter: { name: 'Twitter / X', icon: '\uD83D\uDC26', color: 'from-sky-400 to-blue-600' },
    tiktok: { name: 'TikTok', icon: '\uD83C\uDFB5', color: 'from-teal-500 to-cyan-600' },
};

function detectPlatform(u) {
    if (/instagram\.com/i.test(u)) return 'instagram';
    if (/(?:twitter\.com|x\.com)/i.test(u)) return 'twitter';
    if (/tiktok\.com/i.test(u)) return 'tiktok';
    return null;
}

export default function SocialMediaDownloader() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [detected, setDetected] = useState(null);
    const toast = useToast();

    const fetchMedia = useCallback(async () => {
        if (!url.trim()) { toast.show('Enter a URL', 'err'); return; }
        const p = detectPlatform(url.trim());
        if (!p) { toast.show('Unsupported URL. Use Instagram, Twitter/X, or TikTok.', 'err'); return; }
        setLoading(true); setError(''); setResult(null);
        try {
            const res = await fetch('/api/social-info', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to extract media');
            setResult(data); toast.show('Media found!');
        } catch (e) { setError(e.message); toast.show(e.message, 'err'); }
        setLoading(false);
    }, [url]);

    const handleUrl = (e) => { setUrl(e.target.value); setError(''); setDetected(detectPlatform(e.target.value)); };

    const cp = (text) => { navigator.clipboard.writeText(text); toast.show('Copied!'); };

    const handleDownload = async (dlUrl, filename) => {
        try {
            const proxy = `/api/media-proxy?url=${encodeURIComponent(dlUrl)}&filename=${encodeURIComponent(filename || 'download')}`;
            Object.assign(document.createElement('a'), { href: proxy, download: filename || 'download' }).click();
            toast.show('Download started');
        } catch {
            try { const r = await fetch(dlUrl); const b = await r.blob(); Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: filename || 'download' }).click(); }
            catch { window.open(dlUrl, '_blank'); }
        }
    };

    const pi = detected ? PLATFORMS[detected] : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {toast.el}
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Social Media Downloader', href: '/tools/social-media-downloader' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/25">
                        <Download className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Social Media Downloader</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Download videos from Instagram, Twitter/X, and TikTok</p>
                </div>

                {/* Platform badges */}
                <div className="flex justify-center gap-2 flex-wrap mb-6">
                    {Object.entries(PLATFORMS).map(([k, p]) => (
                        <div key={k} className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${p.color} text-white text-xs font-bold shadow-sm flex items-center gap-1.5`}>
                            <span className="text-sm">{p.icon}</span>{p.name}
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className={`${cardCls} p-5 sm:p-7 mb-5`}>
                    <label className="block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-2">Paste Video URL</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 relative">
                            <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" value={url} onChange={handleUrl} onKeyDown={e => { if (e.key === 'Enter') fetchMedia(); }}
                                placeholder="https://www.instagram.com/reel/... or https://x.com/user/status/..."
                                className="w-full pl-10 pr-20 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/40 transition" />
                            {pi && (
                                <span className={`absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md bg-gradient-to-r ${pi.color} text-white text-[10px] font-bold`}>
                                    {pi.icon} {pi.name}
                                </span>
                            )}
                        </div>
                        <button onClick={fetchMedia} disabled={loading || !url.trim()}
                            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            {loading ? 'Extracting...' : 'Get Video'}
                        </button>
                    </div>
                    {error && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>

                {/* Result */}
                {result && (
                    <div className={`${cardCls} overflow-hidden mb-5`}>
                        {(result.thumbnail || result.downloadUrl) && (
                            <div className="md:flex">
                                {result.thumbnail && (
                                    <div className="md:w-2/5 relative">
                                        <img src={result.thumbnail} alt={result.title || 'Video thumbnail'} className="w-full h-full object-cover min-h-[200px]" />
                                        <div className="absolute top-2 left-2">
                                            <span className={`px-2 py-1 rounded-md bg-gradient-to-r ${PLATFORMS[result.platform]?.color || 'from-slate-500 to-slate-600'} text-white text-[10px] font-bold shadow`}>
                                                {PLATFORMS[result.platform]?.icon} {PLATFORMS[result.platform]?.name}
                                            </span>
                                        </div>
                                        <div className="absolute top-2 right-2">
                                            <span className="px-2 py-1 rounded-md bg-black/70 text-white text-[10px] font-bold">
                                                {result.type === 'video' ? '\uD83C\uDFAC Video' : result.type === 'gif' ? '\uD83C\uDF9E GIF' : '\uD83D\uDCF7 Image'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className={`${result.thumbnail ? 'md:w-3/5' : ''} p-5`}>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-3">{result.title || 'Media'}</h3>
                                    {result.author && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                                            <span>By</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{result.author}</span>
                                            {result.authorHandle && <span className="text-blue-500 dark:text-blue-400">@{result.authorHandle}</span>}
                                        </div>
                                    )}
                                    {result.downloadUrl && (
                                        <div className="mb-4">
                                            <button onClick={() => handleDownload(result.downloadUrl, `${result.platform}_${result.type}_${Date.now()}.${result.type === 'image' ? 'jpg' : 'mp4'}`)}
                                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition">
                                                <Download className="w-4 h-4" />Download {result.type === 'image' ? 'Image' : 'Video'}
                                            </button>
                                        </div>
                                    )}
                                    {result.variants && result.variants.length > 1 && (
                                        <div className="space-y-2 mb-4">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">All qualities:</p>
                                            {result.variants.map((v, i) => (
                                                <button key={i} onClick={() => handleDownload(v.url, `twitter_video_${v.label}_${Date.now()}.mp4`)}
                                                    className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition group">
                                                    <div className="flex items-center gap-2">
                                                        <Video className="w-4 h-4 text-blue-500" />
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{v.label}</span>
                                                        <span className="text-[10px] text-slate-400">({v.quality})</span>
                                                    </div>
                                                    <Download className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 transition" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {result.error && (
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl mb-3">
                                            <p className="text-xs text-amber-600 dark:text-amber-400">{result.error}</p>
                                        </div>
                                    )}
                                    <button onClick={() => cp(result.downloadUrl || url)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                        <Copy className="w-3 h-3" />Copy Media URL
                                    </button>
                                </div>
                            </div>
                        )}
                        {!result.downloadUrl && !result.variants && (
                            <div className="p-8 text-center">
                                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Could not extract direct download URL</p>
                                <p className="text-xs text-slate-400">{result.error || 'The platform may have changed their page structure. Please try again later.'}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* How It Works (shown when idle) */}
                {!result && !loading && !error && (
                    <div className={`${cardCls} p-8 mb-5`}>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 text-center">How It Works</h3>
                        <div className="grid sm:grid-cols-3 gap-6 mb-8">
                            {[
                                { n: '1', t: 'Copy URL', d: 'Copy the video URL from Instagram, Twitter/X, or TikTok.' },
                                { n: '2', t: 'Paste & Extract', d: 'Paste it here and our server extracts the video for you.' },
                                { n: '3', t: 'Download', d: 'Click download and the video saves directly to your device.' },
                            ].map(s => (
                                <div key={s.n} className="text-center">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 text-lg font-bold shadow-lg shadow-purple-500/20">{s.n}</div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{s.t}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.d}</p>
                                </div>
                            ))}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 text-center">Supported Platforms</h3>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { p: 'Instagram', icon: '\uD83D\uDCF8', types: ['Reels', 'Posts', 'Stories', 'IGTV'], c: 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/10 dark:to-purple-900/10 border-pink-200 dark:border-pink-800' },
                                { p: 'Twitter / X', icon: '\uD83D\uDC26', types: ['Videos', 'GIFs', 'Multiple qualities'], c: 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/10 dark:to-blue-900/10 border-sky-200 dark:border-sky-800' },
                                { p: 'TikTok', icon: '\uD83C\uDFB5', types: ['Videos', 'Audio', 'Thumbnails'], c: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/10 dark:to-cyan-900/10 border-teal-200 dark:border-teal-800' },
                            ].map(pl => (
                                <div key={pl.p} className={`rounded-xl p-4 border ${pl.c}`}>
                                    <div className="text-2xl mb-2">{pl.icon}</div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{pl.p}</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {pl.types.map(t => (
                                            <span key={t} className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-[10px] font-mono text-slate-600 dark:text-slate-400">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <p className="text-xs text-slate-400 max-w-lg mx-auto">Respect copyright laws and content creators\u2019 rights. Only download content you have permission to use.</p>
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Social Media Video Downloader — Instagram, Twitter/X, TikTok</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Social media platforms are built for streaming, not saving. When you find a video you want to keep — a tutorial, a recipe, a workout, or a clip you need for a presentation — downloading it is not always obvious. Most platforms do not offer a built-in download button. This tool fills that gap.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Paste the URL of any public video from Instagram, Twitter/X, or TikTok. The tool detects the platform automatically, extracts the video source, and gives you a direct download button. For Twitter videos, you get multiple quality options so you can choose the resolution you need. Instagram Reels, posts, and IGTV are all supported. TikTok videos download without the watermark when possible.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            The tool works through a server-side API that fetches the page and extracts the video URL. A media proxy handles CORS restrictions so the file downloads directly to your device. If the proxy fails, the tool falls back to a direct fetch or opens the video in a new tab.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Why Use This Downloader</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'No App Required', c: 'text-purple-600 dark:text-purple-400', b: 'Works entirely in your browser. No extensions, no apps, no installs. Just paste the URL and click download.' },
                                { t: 'Multiple Platforms', c: 'text-pink-600 dark:text-pink-400', b: 'Supports Instagram (Reels, posts, Stories, IGTV), Twitter/X (videos, GIFs), and TikTok (videos, audio, thumbnails).' },
                                { t: 'Quality Options', c: 'text-blue-600 dark:text-blue-400', b: 'Twitter videos are available in multiple resolutions. Pick the quality that fits your needs, from low bandwidth to full HD.' },
                                { t: 'Auto Platform Detection', c: 'text-emerald-600 dark:text-emerald-400', b: 'Paste any URL and the tool detects the platform automatically. No need to select it manually from a dropdown.' },
                                { t: 'CORS Proxy Fallback', c: 'text-amber-600 dark:text-amber-400', b: 'A server-side media proxy handles cross-origin restrictions. If it fails, the tool falls back to a direct download or new tab.' },
                                { t: 'Thumbnail Preview', c: 'text-rose-600 dark:text-rose-400', b: 'See the video thumbnail, title, and author before downloading. Verify that you have the right video before saving it.' },
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
                                { q: 'Is this downloader free?', a: 'Yes, completely free with no account, no limits, and no ads inserted into downloads.' },
                                { q: 'Does it work with private accounts?', a: 'No. Only publicly accessible posts and videos can be downloaded. Private content requires authentication, which is not supported.' },
                                { q: 'What video formats are downloaded?', a: 'Videos download as MP4 files. Images download as JPG. GIFs download as their original format.' },
                                { q: 'Why does it sometimes fail?', a: 'Social media platforms frequently change their page structure. If extraction fails, try again later or check if the URL is correct.' },
                                { q: 'Can I download Instagram Stories?', a: 'Yes, if the Story is publicly accessible. Private or expired Stories cannot be downloaded.' },
                                { q: 'Does TikTok download include watermark?', a: 'The tool attempts to download the version without watermark when available. Some videos may still include it depending on availability.' },
                                { q: 'Is this legal?', a: 'Downloading publicly available content for personal use is generally permitted. Always respect copyright and the content creator\u2019s rights.' },
                                { q: 'Does it store my data?', a: 'No. The tool processes your request through the API and does not store URLs, videos, or any personal data.' },
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
