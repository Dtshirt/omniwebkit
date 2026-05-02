'use client';
import { useState, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Video, Download, Search, AlertCircle, Copy, Check,
  ExternalLink, Loader2, Music, Film, Youtube, Eye, Clock, Play
} from 'lucide-react';

/* ─── Design tokens ─── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Utility formatters ─── */
function formatBytes(bytes) {
  if (!bytes) return 'Unknown size';
  const b = parseInt(bytes, 10);
  if (b >= 1e9) return (b / 1e9).toFixed(1) + ' GB';
  if (b >= 1e6) return (b / 1e6).toFixed(1) + ' MB';
  if (b >= 1e3) return (b / 1e3).toFixed(1) + ' KB';
  return b + ' B';
}
function formatDuration(s) {
  if (!s) return '';
  const sec = parseInt(s, 10);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;
  return `${m}:${String(ss).padStart(2,'0')}`;
}
function formatNumber(n) {
  if (!n) return '0';
  const num = parseInt(n, 10);
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
}

/* ─── Quality label colour ─── */
function qColor(label) {
  if (!label) return 'text-slate-500';
  const n = parseInt(label);
  if (n >= 2160) return 'text-rose-500';
  if (n >= 1080) return 'text-emerald-500';
  if (n >= 720)  return 'text-blue-500';
  if (n >= 480)  return 'text-amber-500';
  return 'text-slate-500';
}

/* ─── Thumbnail download via media-proxy (bypass CORS) ─── */
async function downloadThumb(videoId, key, label) {
  const imgUrl = `https://img.youtube.com/vi/${videoId}/${key}.jpg`;
  const filename = `${videoId}_${key}`;
  try {
    const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(imgUrl)}&filename=${encodeURIComponent(filename)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('proxy failed');
    const blob = await res.blob();
    const obj = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = obj; a.download = `${filename}.jpg`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(obj), 5000);
  } catch {
    window.open(imgUrl, '_blank');
    console.log('Thumbnail download failed. Please try another quality.');
  }
}

/* ─── Format row ─── */
function FormatRow({ f, type, onDownload, downloading }) {
  const icons = { combined: Film, video: Video, audio: Music };
  const colors = {
    combined: { icon: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', btn: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20' },
    video:    { icon: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', btn: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-blue-500/20' },
    audio:    { icon: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', btn: 'from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-violet-500/20' },
  };
  const Icon = icons[type];
  const c = colors[type];
  const fid = f.formatId || String(f.itag);
  const isLoading = downloading === fid;

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${c.icon}`} />
        </div>
        <div>
          <p className={`text-sm font-black ${qColor(f.qualityLabel)}`}>{f.qualityLabel || 'Auto'}</p>
          <p className="text-[10px] text-slate-400">
            {f.container?.toUpperCase()}{f.contentLength ? ` · ${formatBytes(f.contentLength)}` : ''}
            {f.fps ? ` · ${f.fps}fps` : ''}{type === 'audio' ? '' : type === 'video' ? ' · No audio' : ''}
          </p>
        </div>
      </div>
      <button onClick={() => onDownload(fid, f.qualityLabel)} disabled={isLoading}
        className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${c.btn} text-white rounded-xl text-[10px] font-black disabled:opacity-50 transition-all shadow-sm`}>
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        {isLoading ? 'Preparing…' : 'Download'}
      </button>
    </div>
  );
}

/* ─── Main ─── */
export default function YouTubeDownloader() {
  const [url, setUrl]             = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [error, setError]         = useState('');
  const [copied, setCopied]       = useState(false);
  const [tab, setTab]             = useState('combined');

  const fetchInfo = useCallback(async () => {
    const raw = url.trim();
    if (!raw) { setError('Please enter a YouTube video URL'); return; }
    setLoading(true); setError(''); setVideoInfo(null);
    try {
      const res  = await fetch('/api/youtube-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch video info');
      setVideoInfo(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const downloadVideo = useCallback(async (formatId, quality) => {
    if (!videoInfo) return;
    setDownloading(formatId);
    try {
      const streamUrl = `/api/youtube-stream?url=${encodeURIComponent(url.trim())}&itag=${formatId}&title=${encodeURIComponent(videoInfo.title)}`;
      const a = document.createElement('a');
      a.href = streamUrl;
      a.download = `${videoInfo.title}.mp4`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch {
      console.log('Download failed. Please try another quality.');  
      setError('Download failed. Please try another quality.');
    }
    setTimeout(() => setDownloading(null), 3000);
  }, [videoInfo, url]);

  const copyUrl = () => {
    if (!videoInfo) return;
    navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoInfo.id}`);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const TABS = [
    { key: 'combined', label: 'Video + Audio', icon: Film,  count: videoInfo?.formats?.length },
    { key: 'video',    label: 'Video Only',    icon: Video, count: videoInfo?.videoOnlyFormats?.length },
    { key: 'audio',    label: 'Audio Only',    icon: Music, count: videoInfo?.audioFormats?.length },
  ];

  const THUMBS = [
    { key: 'maxresdefault', label: 'Max HD',  size: '1280×720' },
    { key: 'sddefault',     label: 'SD',      size: '640×480'  },
    { key: 'hqdefault',     label: 'HQ',      size: '480×360'  },
    { key: 'mqdefault',     label: 'MQ',      size: '320×180'  },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'YouTube Video Downloader', href: '/tools/youtube-downloader' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mb-4 shadow-lg shadow-red-500/30">
            <Youtube className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">YouTube Video Downloader</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Download any YouTube video in HD, 4K, audio-only MP3, or grab thumbnails. Paste the URL and pick your quality.
          </p>
        </div>

        {/* URL Input */}
        <div className={`${cardCls} p-6 mb-5`}>
          <label className="block text-xs font-black uppercase tracking-wide text-slate-400 mb-2">YouTube Video URL</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text" value={url}
                onChange={e => { setUrl(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && fetchInfo()}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={loading}
                className="w-full pl-9 pr-4 py-3 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500/40 transition disabled:opacity-60 font-mono"
              />
            </div>
            <button onClick={fetchInfo} disabled={loading || !url.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/25 transition disabled:opacity-50 whitespace-nowrap">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching…</>
                       : <><Search className="w-4 h-4" />Get Video</>}
            </button>
          </div>
          {error && (
            <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className={`${cardCls} p-8 text-center mb-5`}>
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Fetching video info and available formats…</p>
            <p className="text-xs text-slate-400 mt-1">This may take a few seconds</p>
          </div>
        )}

        {/* Video Info */}
        {videoInfo && !loading && (
          <div className="space-y-5">

            {/* Preview card */}
            <div className={`${cardCls} overflow-hidden`}>
              <div className="md:flex">
                <div className="md:w-2/5 relative">
                  <img src={videoInfo.thumbnail} alt={videoInfo.title}
                    className="w-full h-full object-cover min-h-[200px] max-h-[280px] md:max-h-none"
                    onError={e => e.currentTarget.src = `https://img.youtube.com/vi/${videoInfo.id}/hqdefault.jpg`} />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 rounded-lg text-white text-xs font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />{formatDuration(videoInfo.duration)}
                  </div>
                </div>
                <div className="md:w-3/5 p-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{videoInfo.title}</h2>
                  <a href={videoInfo.authorUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium mb-3 block">{videoInfo.author}</a>
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatNumber(videoInfo.viewCount)} views</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(videoInfo.duration)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a href={`https://www.youtube.com/watch?v=${videoInfo.id}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition">
                      <Play className="w-3 h-3" />Watch
                    </a>
                    <button onClick={copyUrl}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-xl text-xs font-bold transition ${copied ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}{copied ? 'Copied!' : 'Copy URL'}
                    </button>
                    <a href={`/tools/youtube-thumbnail-downloader?v=${videoInfo.id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-bold hover:bg-violet-100 transition">
                      <ExternalLink className="w-3 h-3" />All Thumbnails
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Download formats */}
            <div className={cardCls}>
              <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-red-500" />Download Formats
                </h2>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 p-3 border-b border-slate-200 dark:border-slate-700">
                {TABS.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition flex-1 sm:flex-none justify-center ${
                      tab === t.key
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}>
                    <t.icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.key === 'combined' ? 'V+A' : t.key === 'video' ? 'Vid' : 'Aud'}</span>
                    <span className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] px-1.5 py-0.5 rounded-full font-black">{t.count || 0}</span>
                  </button>
                ))}
              </div>
              {/* Format list */}
              <div className="p-4 space-y-2">
                {tab === 'combined' && (
                  videoInfo?.formats?.length > 0
                    ? videoInfo.formats.map((f, i) => <FormatRow key={f.itag || i} f={f} type="combined" onDownload={downloadVideo} downloading={downloading} />)
                    : <p className="text-xs text-slate-400 text-center py-6">No Video + Audio formats available for this video</p>
                )}
                {tab === 'video' && (
                  videoInfo?.videoOnlyFormats?.length > 0
                    ? videoInfo.videoOnlyFormats.map((f, i) => <FormatRow key={f.itag || i} f={f} type="video" onDownload={downloadVideo} downloading={downloading} />)
                    : <p className="text-xs text-slate-400 text-center py-6">No video-only formats available</p>
                )}
                {tab === 'audio' && (
                  videoInfo?.audioFormats?.length > 0
                    ? videoInfo.audioFormats.map((f, i) => <FormatRow key={f.itag || i} f={f} type="audio" onDownload={downloadVideo} downloading={downloading} />)
                    : <p className="text-xs text-slate-400 text-center py-6">No audio-only formats available</p>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            <div className={cardCls}>
              <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Video Thumbnails</h2>
              </div>
              <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {THUMBS.map(t => (
                  <div key={t.key}>
                    <div className="relative aspect-video mb-2 group rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/40">
                      <img src={`https://img.youtube.com/vi/${videoInfo.id}/${t.key}.jpg`} alt={t.label}
                        className="w-full h-full object-cover" onError={e => e.currentTarget.parentElement.style.display = 'none'} />
                    </div>
                    <button onClick={() => downloadThumb(videoInfo.id, t.key, t.label)}
                      className="w-full flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-bold transition">
                      <Download className="w-3 h-3" />{t.label} · {t.size}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* How it works (empty state) */}
        {!videoInfo && !loading && (
          <div className={`${cardCls} p-8`}>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-6 text-center">How It Works</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                ['1', 'Paste YouTube URL', 'Copy a YouTube video link from your browser or the Share button and paste it into the field above.'],
                ['2', 'Choose Quality',    'Click "Get Video" to see all available formats: combined Video + Audio, Video Only (no audio), or Audio Only.'],
                ['3', 'Download',          'Click the Download button on the format you want. The video or audio file will save directly to your device.'],
              ].map(([step, title, desc]) => (
                <div key={step} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-lg font-black shadow-lg shadow-red-500/20">{step}</div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free YouTube Video Downloader — Download HD Videos, Audio, and Thumbnails</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              YouTube is the biggest video platform in the world, and sometimes you need a copy of a video saved locally. Maybe you are travelling and need offline access. Maybe you want to archive a how-to tutorial for reference without relying on an internet connection. Maybe you are a creator who wants to review your own uploaded video in a video editor — and redownloading your own content from YouTube is the fastest way to get it.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free YouTube downloader works directly in your browser. Paste any YouTube URL, and the tool fetches all available download formats through a server-side connection. It shows you every quality option for that video — from 1080p Full HD and 4K (if available) down to 144p, plus video-only and audio-only streams. You choose the format that fits your needs, and the file downloads straight to your device.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The tool also fetches the video thumbnail in four resolutions (Max HD 1280×720, SD 640×480, HQ 480×360, and MQ 320×180) so you can download the thumbnail image at the same time if you need it for a presentation, blog, or social media post.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              There is no extension to install, no software to download, and no account to create. The YouTube downloader works on Windows, Mac, Linux, iOS, and Android — anywhere you have a modern browser.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How to Download a YouTube Video</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">Five simple steps to save any YouTube video:</p>
            <ol className="space-y-4">
              {[
                ['Copy the YouTube video URL',   'Open the YouTube video you want to download in your browser. Copy the URL from the address bar. You can also use the YouTube Share button and copy the short youtu.be link — both work.'],
                ['Paste the URL above',          'Click inside the input box and paste the URL (Ctrl+V or Cmd+V). The tool accepts standard youtube.com/watch?v=... URLs, youtu.be short links, and YouTube Shorts.'],
                ['Click "Get Video"',             'Click the red button or press Enter. The tool connects to YouTube\'s servers and retrieves all available download formats for that specific video.'],
                ['Browse available formats',      'Three tabs show your options: "Video + Audio" (ready-to-play files), "Video Only" (for editing — no audio track), and "Audio Only" (for music or podcasts). Each format shows the quality, file type, and size.'],
                ['Click Download',                'Click the Download button on the format you want. Your browser will start downloading the file directly. Large HD files may take a moment depending on the video length and your connection speed.'],
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Download Formats Explained</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              {[
                {t:'Video + Audio (Combined)',  c:'text-red-600 dark:text-red-400',    b:'The most common choice. A single file with both the video and audio tracks merged, ready to play in any media player. Available in multiple quality levels from 1080p down to 144p.'},
                {t:'Video Only (No Audio)',     c:'text-blue-600 dark:text-blue-400',   b:'Contains only the video track without any audio. Useful for video editors who want to lay their own soundtrack, or for mixing audio from a different source in post-production.'},
                {t:'Audio Only (MP4/WebM)',     c:'text-violet-600 dark:text-violet-400',b:'Contains only the audio track. Useful for listening to music, lectures, podcasts, or interview content without the video. Produces a much smaller file than the full video.'},
              ].map(({t,c,b}) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 pr-4 font-black text-slate-700 dark:text-slate-300">Quality</th>
                    <th className="text-left py-2 pr-4 font-black text-slate-700 dark:text-slate-300">Resolution</th>
                    <th className="text-left py-2 font-black text-slate-700 dark:text-slate-300">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['4K / 2160p', '3840×2160', 'Archiving, large displays, future-proofing'],
                    ['1080p Full HD', '1920×1080', 'Standard high-quality viewing and editing'],
                    ['720p HD', '1280×720', 'Good quality with smaller file size'],
                    ['480p SD', '854×480', 'Streaming-quality, mobile-friendly'],
                    ['360p', '640×360', 'Small file, slow connections, older devices'],
                    ['144p', '256×144', 'Minimum data usage, slow connections'],
                  ].map(([q,r,b]) => (
                    <tr key={q} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-2 pr-4 font-bold text-slate-700 dark:text-slate-300">{q}</td>
                      <td className="py-2 pr-4 font-mono text-slate-500 dark:text-slate-400">{r}</td>
                      <td className="py-2 text-slate-400">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Common Use Cases</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {t:'Offline Viewing',             c:'text-red-600 dark:text-red-400',    b:'Download videos for watching on flights, commutes, or in areas with no internet. Perfect for long trips or places with unreliable connectivity.'},
                {t:'Content Archiving',           c:'text-blue-600 dark:text-blue-400',   b:'Save important tutorials, lectures, or rare content before it gets deleted or made private. Your local copy stays no matter what happens to the original.'},
                {t:'Video Editing Projects',      c:'text-emerald-600 dark:text-emerald-400',b:'Download the video-only stream to use in editing software. Add your own voiceover, music, or sound effects without re-encoding the original video.'},
                {t:'Music and Podcast Listening', c:'text-violet-600 dark:text-violet-400',b:'Use the audio-only download to save music videos, concerts, interviews, or podcasts as audio files for listening without video playback.'},
                {t:'Research and Education',      c:'text-amber-600 dark:text-amber-400',  b:'Researchers, students, and educators often need offline copies of videos for studying, presentations, or analysis where internet access is not guaranteed.'},
                {t:'Creator Self-Archive',        c:'text-rose-600 dark:text-rose-400',    b:'Download your own uploaded videos for backup, re-editing, or migration to another platform if you need to republish or update your content.'},
              ].map(({t,c,b}) => (
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
                {q:'Is this YouTube downloader free?',                         a:'Yes, completely free with no account required and no download limits.'},
                {q:'Is it legal to download YouTube videos?',                   a:'Downloading YouTube videos for personal, offline use of freely available public content is generally acceptable. Do not redistribute downloaded content or use it in ways that violate copyright law or YouTube\'s Terms of Service.'},
                {q:'Why can\'t I find 1080p in the Video + Audio tab?',         a:'YouTube serves 1080p and above as separate video and audio streams that need to be merged. Audio-free 1080p video appears in the "Video Only" tab. Combined 1080p requires merging streams server-side, which may not be available in all cases.'},
                {q:'What format are the downloaded files?',                     a:'Video files are typically MP4 or WebM depending on the stream. Audio-only files are usually WebM or MP4. You can convert them to other formats using a free tool like HandBrake or VLC after downloading.'},
                {q:'Can I download YouTube Shorts?',                            a:'Yes. Paste the Shorts URL (youtube.com/shorts/...) and the tool fetches all available formats just like a regular video.'},
                {q:'Why does the download take a long time?',                   a:'Large HD files (1080p, 4K) can be several hundred megabytes or more. Download speed depends on your internet connection and the file size. Smaller qualities download much faster.'},
                {q:'Does this work on mobile?',                                 a:'Yes. The tool works in any modern mobile browser on iOS or Android. Mobile browsers handle file downloads differently — the file may go to your Downloads folder or you may be prompted to save it.'},
                {q:'Why does some content show "Failed to fetch"?',             a:'Some YouTube videos block downloads (age-restricted, region-locked, or private content). If you see an error, try a different video or check that the URL is correct and the video is publicly available.'},
              ].map(({q,a}) => (
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
