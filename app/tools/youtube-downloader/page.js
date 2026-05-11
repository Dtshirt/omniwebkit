'use client';
import { useState, useCallback, useEffect } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Video, Download, Search, AlertCircle, Loader2, Music, Film, Youtube, Eye, Clock, Image as ImageIcon, X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

function formatNumber(n) {
  if (!n) return '0';
  const num = parseInt(n, 10);
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toLocaleString();
}

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);
  
  // Download state
  const [downloadingType, setDownloadingType] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState('');
  
  const [history, setHistory] = useState([]);

  const [downloadProgress, setDownloadProgress] = useState(null);

  useEffect(() => {
    // Force dark mode for this specific tool to match spec if possible,
    // though Next.js uses class 'dark' on html. We'll use specific styling.
    const savedHistory = localStorage.getItem('yt_dl_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) {}
    }
  }, []);

  const saveToHistory = (item) => {
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('yt_dl_history', JSON.stringify(newHistory));
  };

  const validateUrl = (url) => {
    const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;
    return regex.test(url);
  };

  const fetchInfo = async () => {
    const raw = url.trim();
    if (!raw) { setError('Please enter a YouTube video URL'); return; }
    if (!validateUrl(raw)) { setError('Invalid YouTube URL'); return; }
    
    setLoading(true); setError(''); setVideoInfo(null);
    try {
      const res = await fetch('/api/v1/tools/youtube-downloader/video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to fetch video info');
      setVideoInfo(data);
      if (data.formats?.length > 0) {
        setSelectedQuality(data.formats[0].format_id); // default to first format
      }
    } catch (e) {
      setError(e.message);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type) => {
    if (!videoInfo) return;
    setDownloadingType(type);
    
    const taskId = Math.random().toString(36).substring(2, 15);
    setDownloadProgress({ status: 'starting', percent: '0%', eta: '', speed: '' });
    
    const es = new EventSource(`/api/v1/tools/youtube-downloader/progress/${taskId}`);
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setDownloadProgress(data);
        if (data.status === 'done' || data.status === 'error') {
          es.close();
          setTimeout(() => {
             setDownloadingType(null);
             if (data.status === 'done') toast.success('Download started!');
             if (data.status === 'error') toast.error('Download failed.');
          }, 2000);
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };
    es.onerror = () => {
      es.close();
      setDownloadingType(null);
    };

    let formatParam = '';
    if ((type === 'video_audio' || type === 'video_only') && selectedQuality) {
      formatParam = `&format_id=${encodeURIComponent(selectedQuality)}`;
    }

    const downloadUrl = `/api/v1/tools/youtube-downloader/download?url=${encodeURIComponent(url.trim())}&type=${type}${formatParam}&task_id=${taskId}`;
    
    // Create an invisible iframe or anchor to trigger download without leaving page
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = '';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    saveToHistory({
      title: videoInfo.title,
      type: type,
      timestamp: Date.now()
    });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white font-sans">
      <Toaster position="bottom-center" />
      <div className="max-w-4xl mx-auto py-8 px-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <Youtube className="w-10 h-10 text-[#FF0000]" />
            <h1 className="text-2xl font-bold tracking-tight">YT Downloader</h1>
          </div>
        </div>

        {/* URL Input Section */}
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-[12px] shadow-2xl mb-8">
          <div className="relative flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={url}
                onChange={e => { setUrl(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && fetchInfo()}
                placeholder="Paste a YouTube URL here..."
                disabled={loading}
                className={`w-full pl-12 pr-4 py-4 bg-[#0f0f0f] border ${error ? 'border-[#FF0000]' : url && validateUrl(url) ? 'border-green-500' : 'border-[#2a2a2a]'} rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors text-lg`}
              />
            </div>
            <button
              onClick={fetchInfo}
              disabled={loading || !url.trim()}
              className="bg-[#FF0000] hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch Video'}
            </button>
          </div>
          {error && <p className="text-[#FF0000] text-sm mt-3 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</p>}
        </div>

        {/* Video Preview Card */}
        {videoInfo && !loading && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-[12px] shadow-xl overflow-hidden mb-8 transition-all duration-150">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-[40%] relative">
                <img src={`/api/v1/tools/youtube-downloader/download?url=${encodeURIComponent(url)}&type=thumbnail`} alt="Thumbnail" className="w-full h-full object-cover aspect-video bg-zinc-900" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold">
                  {formatDuration(videoInfo.duration_seconds)}
                </div>
              </div>
              <div className="p-6 w-full md:w-[60%]">
                <h2 className="text-xl font-bold line-clamp-2 mb-2">{videoInfo.title}</h2>
                <a href={videoInfo.channel_url} target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-white transition-colors mb-4 block font-medium">
                  {videoInfo.channel}
                </a>
                
                <div className="flex flex-wrap gap-4 text-sm text-zinc-500 mb-4">
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {formatNumber(videoInfo.view_count)} views</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {videoInfo.upload_date ? `${videoInfo.upload_date.substring(0,4)}-${videoInfo.upload_date.substring(4,6)}-${videoInfo.upload_date.substring(6,8)}` : 'Unknown'}</span>
                </div>

                <div className="text-sm text-zinc-400">
                  <p className={descExpanded ? "" : "line-clamp-3"}>{videoInfo.description}</p>
                  {videoInfo.description.length > 150 && (
                    <button onClick={() => setDescExpanded(!descExpanded)} className="text-zinc-300 hover:text-white font-medium mt-1">
                      {descExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Download Options Panel */}
        {videoInfo && !loading && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-[12px] shadow-xl mb-8">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2"><Download className="w-5 h-5 text-[#FF0000]"/> Download Options</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {[
                { type: 'video_audio', label: 'Video + Audio', icon: Film, sub: 'Best Quality MP4' },
                { type: 'video_only', label: 'Video Only', icon: Video, sub: 'No Audio Track' },
                { type: 'audio_only', label: 'Audio Only', icon: Music, sub: 'MP3 · 320kbps' },
                { type: 'thumbnail', label: 'Thumbnail', icon: ImageIcon, sub: 'High Res JPEG' },
              ].map(opt => (
                <button
                  key={opt.type}
                  onClick={() => handleDownload(opt.type)}
                  disabled={downloadingType !== null}
                  className="flex items-center p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-[8px] hover:border-zinc-500 transition-all duration-150 group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <opt.icon className="w-6 h-6 text-zinc-300 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{opt.label}</p>
                    <p className="text-xs text-zinc-500">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-[#2a2a2a] pt-6">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Select Video Quality (For Video downloads)</label>
              <select 
                value={selectedQuality}
                onChange={e => setSelectedQuality(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-3 text-white focus:outline-none focus:border-zinc-500 appearance-none"
              >
                {videoInfo.formats?.filter(f => f.vcodec && f.vcodec !== 'none').map(f => (
                  <option key={f.format_id} value={f.format_id}>
                    {f.quality_label} {f.fps ? `(${f.fps}fps)` : ''} - {formatBytes(f.filesize_approx)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* History List */}
        {history.length > 0 && (
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-[12px] shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-zinc-300">Recent Downloads</h3>
            <div className="space-y-3">
              {history.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
                  <div className="truncate pr-4">
                    <p className="text-sm font-medium text-white truncate">{item.title}</p>
                    <p className="text-xs text-zinc-500">{item.type.replace('_', ' ').toUpperCase()} • {new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download Progress Overlay */}
        {downloadingType && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] p-8 rounded-[12px] shadow-2xl max-w-md w-full mx-4 text-center">
              {downloadProgress?.status === 'done' ? (
                 <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                   <Download className="w-6 h-6" />
                 </div>
              ) : downloadProgress?.status === 'error' ? (
                 <AlertCircle className="w-12 h-12 text-[#FF0000] mx-auto mb-4" />
              ) : (
                 <Loader2 className="w-12 h-12 text-[#FF0000] animate-spin mx-auto mb-4" />
              )}
              
              <h3 className="text-xl font-bold mb-2 text-white">
                {downloadProgress?.status === 'starting' ? 'Starting Download...' : 
                 downloadProgress?.status === 'downloading' ? 'Downloading...' : 
                 downloadProgress?.status === 'processing' ? 'Processing File...' :
                 downloadProgress?.status === 'error' ? 'Download Failed' :
                 'Download Ready!'}
              </h3>
              
              <p className="text-zinc-400 text-sm mb-6 h-5">
                {downloadProgress?.status === 'downloading' && `${downloadProgress.speed} • ETA: ${downloadProgress.eta}`}
                {downloadProgress?.status === 'processing' && 'Merging video and audio streams...'}
                {downloadProgress?.status === 'done' && 'Your file will download automatically.'}
              </p>
              
              <div className="w-full bg-[#0f0f0f] h-2 rounded-full overflow-hidden mb-6 relative">
                {downloadProgress?.status === 'processing' || downloadProgress?.status === 'starting' ? (
                   <div className="bg-[#FF0000] h-full w-[50%] animate-pulse mx-auto"></div>
                ) : downloadProgress?.status === 'error' ? (
                   <div className="bg-[#FF0000] h-full w-full"></div>
                ) : (
                   <div className="bg-[#FF0000] h-full transition-all duration-300 ease-out" style={{ width: downloadProgress?.percent || '0%' }}></div>
                )}
              </div>
              
              <button onClick={() => setDownloadingType(null)} className="text-zinc-500 hover:text-white transition-colors text-sm font-medium">
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
