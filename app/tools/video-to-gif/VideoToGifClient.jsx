'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Video, UploadCloud, Settings, Download, RefreshCw, Film, Image as ImageIcon, CheckCircle, AlertCircle, Server, Monitor, Clock, Layers, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_V1 } from "@/lib/api-config";

// ─── Constants ───────────────────────────────────────────────────────────────
const SERVER_THRESHOLD_MB = 50;   // Files > 50 MB go to server
const POLL_INTERVAL = 2000;

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmtMB(bytes) { return (bytes / (1024 * 1024)).toFixed(2) + ' MB'; }
function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ─── Browser-side GIF via gifshot (small files) ───────────────────────────
async function convertBrowser({ videoUrl, width, fps, duration, quality, aspect, onProgress }) {
  const gifshot = (await import('gifshot')).default;
  return new Promise((resolve, reject) => {
    const height = Math.round(width / (aspect || 1));
    const numFrames = Math.min(Math.floor(duration * fps), 250);
    gifshot.createGIF({
      video: [videoUrl],
      gifWidth: width,
      gifHeight: height,
      numFrames,
      frameDuration: Math.round(100 / fps),
      sampleInterval: Math.max(1, Math.round((100 - quality) / 10)),
      progressCallback: (p) => onProgress(Math.round(p * 100)),
    }, (obj) => {
      if (obj.error) reject(new Error(obj.error));
      else resolve(obj.image);
    });
  });
}

// ─── Server-side GIF polling ──────────────────────────────────────────────
async function pollJob(jobId, onProgress, signal) {
  while (true) {
    if (signal?.aborted) throw new Error('Cancelled');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_V1}/gif/status/${jobId}`, { signal });
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0);
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Server processing failed');
  }
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function VideoToGifClient() {
  const [file, setFile]                 = useState(null);
  const [videoUrl, setVideoUrl]         = useState('');
  const [gifUrl, setGifUrl]             = useState('');
  const [gifBlob, setGifBlob]           = useState(null);
  const [videoMeta, setVideoMeta]       = useState({ width: 0, height: 0, duration: 0, aspect: 1 });
  const [mode, setMode]                 = useState('auto'); // 'auto' | 'browser' | 'server'

  // GIF settings
  const [cfgWidth, setCfgWidth]         = useState(480);
  const [cfgFps, setCfgFps]             = useState(10);
  const [cfgDuration, setCfgDuration]   = useState(5);
  const [cfgStart, setCfgStart]         = useState(0);
  const [cfgQuality, setCfgQuality]     = useState(80);
  const [cfgOptimize, setCfgOptimize]   = useState(true);

  // State
  const [converting, setConverting]     = useState(false);
  const [progress, setProgress]         = useState(0);
  const [phase, setPhase]               = useState('');
  const [serverJobId, setServerJobId]   = useState(null);
  const [outputSize, setOutputSize]     = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const abortRef                        = useRef(null);

  // ── Dropzone ────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) { toast.error('Max file size is 500 MB'); return; }
    setFile(f);
    setVideoUrl(URL.createObjectURL(f));
    setGifUrl(''); setGifBlob(null); setProgress(0); setOutputSize(null); setServerJobId(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/mp4': ['.mp4'], 'video/webm': ['.webm'], 'video/quicktime': ['.mov'] },
    maxFiles: 1,
  });

  const onVideoMeta = (e) => {
    const { videoWidth: w, videoHeight: h, duration: d } = e.target;
    setVideoMeta({ width: w, height: h, duration: d, aspect: w / h });
    setCfgWidth(Math.min(w || 480, 640));
    setCfgDuration(Math.min(Math.floor(d) || 5, 15));
  };

  // ── Compute effective mode ──────────────────────────────────────────────
  const fileMB = file ? file.size / (1024 * 1024) : 0;
  const effectiveMode = mode === 'auto'
    ? (fileMB > SERVER_THRESHOLD_MB ? 'server' : 'browser')
    : mode;

  // ── Convert ─────────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!file || converting) return;
    setConverting(true); setProgress(0); setGifUrl(''); setGifBlob(null); setOutputSize(null);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      if (effectiveMode === 'browser') {
        setPhase('🖥️ Encoding in browser...');
        const dataUrl = await convertBrowser({
          videoUrl,
          width: cfgWidth,
          fps: cfgFps,
          duration: cfgDuration,
          quality: cfgQuality,
          aspect: videoMeta.aspect,
          onProgress: setProgress,
        });
        setGifUrl(dataUrl);
        // Estimate size
        const base64 = dataUrl.split(',')[1] || '';
        setOutputSize(Math.round(base64.length * 0.75));
        toast.success('GIF created in browser!');
      } else {
        // ── Server path ──────────────────────────────────────────────────
        setPhase('📤 Uploading to server...');
        setProgress(5);
        setPhase('📤 Uploading to server...');
        const form = new FormData();
        form.append('file', file);
        form.append('fps', cfgFps);
        form.append('width', cfgWidth);
        form.append('start_time', cfgStart);
        form.append('duration', cfgDuration);
        form.append('quality', cfgQuality);
        form.append('optimize', cfgOptimize);

        const uploadRes = await fetch(`${API_V1}/gif/convert`, { method: 'POST', body: form, signal: abort.signal });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.detail || 'Upload failed');
        }

        // ── Dual-mode: server returns GIF directly (inline) OR a job_id (queued) ──
        const contentType = uploadRes.headers.get('content-type') || '';
        if (contentType.includes('image/gif')) {
          // Inline mode (Redis unavailable) — GIF streamed directly
          setProgress(100);
          setPhase('✅ Done!');
          const blob = await uploadRes.blob();
          setOutputSize(blob.size);
          setGifBlob(blob);
          setGifUrl(URL.createObjectURL(blob));
          toast.success('GIF ready (server inline)!');
        } else {
          // Queued mode (Redis available) — poll until done
          const { job_id } = await uploadRes.json();
          setServerJobId(job_id);
          setProgress(10);
          setPhase('⚙️ Server converting (FFmpeg + Pillow)...');

          const result = await pollJob(job_id, setProgress, abort.signal);
          setOutputSize(result.output_size ? Number(result.output_size) : null);

          setPhase('📥 Downloading GIF...');
          const dlRes = await fetch(`${API_V1}/gif/download/${job_id}`, { signal: abort.signal });
          if (!dlRes.ok) throw new Error('Download failed');
          const blob = await dlRes.blob();
          setGifBlob(blob);
          setGifUrl(URL.createObjectURL(blob));
          toast.success('Server GIF ready!');

          // cleanup after 30s
          setTimeout(() => fetch(`${API_V1}/gif/cleanup/${job_id}`, { method: 'DELETE' }).catch(() => {}), 30000);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Cancelled') {
        toast('Cancelled', { icon: '🛑' });
      } else {
        toast.error(err.message || 'Conversion failed');
        console.error(err);
      }
    } finally {
      setConverting(false); setPhase('');
    }
  };

  const handleCancel = () => { abortRef.current?.abort(); };

  const handleDownload = () => {
    if (!gifUrl) return;
    const a = document.createElement('a');
    a.href = gifUrl;
    a.download = `omniwebkit-${Date.now()}.gif`;
    a.click();
  };

  const clearAll = () => {
    abortRef.current?.abort();
    setFile(null); setVideoUrl(''); setGifUrl(''); setGifBlob(null);
    setProgress(0); setOutputSize(null); setServerJobId(null); setConverting(false);
  };

  // ── Badge helper ────────────────────────────────────────────────────────
  const ModeBadge = ({ m }) => {
    const isServer = m === 'server';
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
        isServer ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                 : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
      }`}>
        {isServer ? <Server className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
        {isServer ? 'Server' : 'Browser'}
      </span>
    );
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-rose-500 rounded-3xl mb-4 shadow-lg shadow-rose-500/25">
            <Film className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Video to GIF Converter
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Convert MP4, MOV, WebM to high-quality animated GIFs. Small files run instantly in your browser; large files use our powerful server with FFmpeg + Pillow.
          </p>

          {/* Hybrid mode chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {['auto', 'browser', 'server'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  mode === m
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'
                }`}
              >
                {m === 'auto' && <Zap className="w-3.5 h-3.5" />}
                {m === 'browser' && <Monitor className="w-3.5 h-3.5" />}
                {m === 'server' && <Server className="w-3.5 h-3.5" />}
                {m === 'auto' ? 'Auto (Hybrid)' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
            {file && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                → Will use <ModeBadge m={effectiveMode} />
                {mode === 'auto' && ` (${fileMB.toFixed(1)} MB ${fileMB > SERVER_THRESHOLD_MB ? '>' : '≤'} ${SERVER_THRESHOLD_MB} MB)`}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Upload + Settings ─────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Dropzone / File card */}
            {!file ? (
              <div
                {...getRootProps()}
                id="gif-dropzone"
                className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
                }`}
              >
                <input {...getInputProps()} />
                <div className="p-4 bg-violet-100 dark:bg-violet-900/40 rounded-full mb-4">
                  <UploadCloud className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isDragActive ? 'Drop it here...' : 'Click or drag video here'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">MP4 · MOV · WebM · up to 500 MB</p>
                <div className="flex gap-3 mt-4">
                  <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full font-medium">≤ 50 MB → Browser</span>
                  <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full font-medium">&gt; 50 MB → Server</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Film className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{fmtMB(file.size)} · <ModeBadge m={effectiveMode} /></p>
                  </div>
                </div>
                <button onClick={clearAll} disabled={converting} className="p-2 bg-slate-100 hover:bg-red-100 dark:bg-slate-700 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 rounded-lg transition-colors flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Settings panel */}
            <div className={`transition-opacity duration-300 ${!file ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-5">

                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-4 h-4 text-violet-500" /> GIF Settings
                </h3>

                {/* Width */}
                <Slider label="Output Width" value={cfgWidth} min={100} max={1280} step={10}
                  display={`${cfgWidth}px`} onChange={setCfgWidth} />

                {/* FPS */}
                <Slider label="Frame Rate" value={cfgFps} min={1} max={30} step={1}
                  display={`${cfgFps} FPS`} onChange={setCfgFps} />

                {/* Start time */}
                <Slider label="Start Time" value={cfgStart} min={0}
                  max={Math.max(0, Math.floor(videoMeta.duration - 0.5) || 60)} step={0.5}
                  display={`${cfgStart}s`} onChange={setCfgStart} />

                {/* Duration */}
                <Slider label="Duration" value={cfgDuration} min={1}
                  max={Math.min(videoMeta.duration || 60, 60)} step={1}
                  display={`${cfgDuration}s`} onChange={setCfgDuration} />

                {/* Advanced toggle */}
                <button
                  onClick={() => setShowAdvanced(v => !v)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium"
                >
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showAdvanced ? 'Hide' : 'Show'} advanced options
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <Slider label="Quality" value={cfgQuality} min={10} max={100} step={5}
                      display={`${cfgQuality}%`} onChange={setCfgQuality} />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Optimize palette</span>
                      <button
                        onClick={() => setCfgOptimize(v => !v)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${cfgOptimize ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${cfgOptimize ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Info box */}
                <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60">
                  <Layers className="w-4 h-4 flex-shrink-0 mt-0.5 text-violet-400" />
                  <span>
                    Estimated frames: <strong>{Math.min(Math.floor(cfgDuration * cfgFps), 500)}</strong>.
                    {effectiveMode === 'server' ? ' Server uses FFmpeg + Pillow — no browser memory limits.' : ' Browser cap: 250 frames.'}
                  </span>
                </div>

                {/* Convert button */}
                {!converting ? (
                  <button
                    id="gif-convert-btn"
                    onClick={handleConvert}
                    disabled={!file}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-rose-600 hover:from-violet-700 hover:to-rose-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="w-5 h-5" />
                    Convert to GIF
                    {file && <span className="text-xs opacity-70 ml-1">({effectiveMode === 'server' ? 'server' : 'browser'})</span>}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-violet-500 to-rose-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{phase || 'Processing...'} {progress}%</span>
                      <button onClick={handleCancel} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Previews ──────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Video preview */}
            <div className="bg-black/5 dark:bg-black/30 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[260px] flex items-center justify-center">
              {!videoUrl ? (
                <div className="text-slate-400 flex flex-col items-center opacity-50">
                  <Video className="w-12 h-12 mb-2" />
                  <p className="text-sm font-medium">Input Preview</p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="bg-slate-900 text-xs text-white px-4 py-2 font-mono flex justify-between">
                    <span className="flex items-center gap-2"><Film className="w-3.5 h-3.5 text-violet-400" /> Source Video</span>
                    <span className="text-slate-400">{Math.round(videoMeta.duration)}s · {videoMeta.width}×{videoMeta.height}</span>
                  </div>
                  <video src={videoUrl} controls className="w-full max-h-[380px] object-contain bg-black" onLoadedMetadata={onVideoMeta} />
                </div>
              )}
            </div>

            {/* GIF output */}
            {gifUrl && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-400/40 overflow-hidden shadow-xl shadow-emerald-500/10 animate-in fade-in zoom-in duration-500">
                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-4 py-3 font-bold uppercase tracking-wider flex items-center justify-between border-b border-emerald-500/20">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> GIF Ready</span>
                  <span className="flex items-center gap-2 text-slate-400 font-normal normal-case">
                    <Clock className="w-3.5 h-3.5" /> {cfgDuration}s · {cfgFps} FPS
                    {outputSize && <> · {fmtSize(outputSize)}</>}
                  </span>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900/60 flex items-center justify-center min-h-[240px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={gifUrl} alt="Generated GIF" className="max-w-full max-h-[380px] object-contain rounded-lg shadow-md" />
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                  <button
                    id="gif-download-btn"
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" /> Download GIF
                  </button>
                </div>
              </div>
            )}

            {/* Hint when video loaded but no GIF yet */}
            {videoUrl && !gifUrl && !converting && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-2xl border border-amber-200 dark:border-amber-800/50 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Tip:</strong> Keep width ≤ 600px and duration ≤ 10s for browser mode.
                  Files over {SERVER_THRESHOLD_MB} MB automatically use the server (FFmpeg + Pillow) — no limits.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable slider ─────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
      />
    </div>
  );
}
