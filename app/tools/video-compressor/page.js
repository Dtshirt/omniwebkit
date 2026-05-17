'use client';
import { useState, useRef, useCallback } from 'react';
import {
  Video, Upload, Download, RotateCcw, Loader2, Check,
  AlertCircle, Settings, Film, Zap, Server
} from 'lucide-react';
import { API_V1 } from "@/lib/api-config";


const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inp  = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500/40 transition';
const lbl  = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

function fmtSize(b) {
  if (!b) return '0 B';
  const u = ['B','KB','MB','GB']; let i=0, s=b;
  while (s>=1024 && i<u.length-1){s/=1024;i++;}
  return s.toFixed(1)+' '+u[i];
}
function fmtDur(s) {
  const m=Math.floor(s/60),sc=Math.floor(s%60);
  return `${m}:${sc.toString().padStart(2,'0')}`;
}

const QUALITY = [
  { value:'high',      label:'High Quality',    desc:'CRF 23 — near-original, moderate compression' },
  { value:'medium',    label:'Medium (Balanced)',desc:'CRF 28 — best size/quality tradeoff' },
  { value:'low',       label:'Low (Max Compress)',desc:'CRF 34 — smallest file, visible quality loss' },
  { value:'whatsapp',  label:'WhatsApp Ready',  desc:'H.264 720p — optimised for WhatsApp/Telegram' },
];

const RESOLUTION = [
  { value:'original', label:'Original' },
  { value:'1080p',    label:'1080p' },
  { value:'720p',     label:'720p' },
  { value:'480p',     label:'480p' },
  { value:'360p',     label:'360p' },
];

const FORMAT = [
  { value:'mp4',  label:'MP4 (H.264)' },
  { value:'webm', label:'WebM (VP9)'  },
];

export default function VideoCompressor() {
  const [file, setFile]         = useState(null);
  const [meta, setMeta]         = useState(null);
  const [quality, setQuality]   = useState('medium');
  const [resolution, setRes]    = useState('original');
  const [format, setFormat]     = useState('mp4');
  const [status, setStatus]     = useState('idle'); // idle|uploading|processing|done|error
  const [progress, setProgress] = useState(0);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState(null);
  const fileRef  = useRef(null);
  const jobRef   = useRef(null);
  const pollRef  = useRef(null);

  const showToast = (msg, type='ok') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3500);
  };

  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('video/')) { showToast('Please select a video file','err'); return; }
    if (f.size > 500*1024*1024) { showToast('File too large (max 500 MB)','err'); return; }
    setFile(f); setResult(null); setError(''); setProgress(0); setStatus('idle');
    const v = document.createElement('video');
    v.preload='metadata';
    v.onloadedmetadata = () => {
      setMeta({ width:v.videoWidth, height:v.videoHeight, duration:v.duration, size:f.size, name:f.name });
      URL.revokeObjectURL(v.src);
    };
    v.src = URL.createObjectURL(f);
  }, []);

  const startPoll = (jobId) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_V1}/tools/status/${jobId}`);
        const data = await res.json();
        setProgress(data.progress);
        if (data.status === 'done') {
          clearInterval(pollRef.current);
          setStatus('done');
          setResult({
            jobId,
            originalSize: data.original_size,
            compressedSize: data.compressed_size,
            format: data.format,
          });
          showToast('Compression complete! 🎉');
        } else if (data.status === 'error') {
          clearInterval(pollRef.current);
          setStatus('error');
          setError(data.error || 'Compression failed');
          showToast('Compression failed','err');
        }
      } catch { /* network hiccup, keep polling */ }
    }, 600);
  };

  const compress = useCallback(async () => {
    if (!file) return;
    setStatus('uploading'); setProgress(0); setError(''); setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('quality', quality);
      form.append('resolution', resolution);
      form.append('format', format);

      const res = await fetch(`${API_V1}/tools/compress`, { method: 'POST', body: form });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }
      const data = await res.json();

      jobRef.current = data.job_id;
      setStatus('processing');
      startPoll(data.job_id);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Upload failed');
      showToast('Failed: ' + (err.message || 'Upload failed'), 'err');
    }
  }, [file, quality, resolution, format]);

  const download = async () => {
    if (!result) return;
    try {
      const resp = await fetch(`${API_V1}/tools/download/${result.jobId}`);
      if (!resp.ok) throw new Error('Download failed');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `compressed-${meta?.name?.replace(/\.[^.]+$/,'') || 'video'}.${result.format}`;
      a.click();
      URL.revokeObjectURL(url);
      // cleanup after download
      fetch(`${API_V1}/cleanup/${result.jobId}`, { method: 'DELETE' }).catch(()=>{});
    } catch { showToast('Download failed','err'); }
  };

  const reset = () => {
    clearInterval(pollRef.current);
    setFile(null); setMeta(null); setResult(null);
    setProgress(0); setError(''); setStatus('idle');
    if (fileRef.current) fileRef.current.value='';
  };

  const savings = result ? Math.max(0, Math.round((1 - result.compressedSize / result.originalSize) * 100)) : 0;
  const isWorking = status === 'uploading' || status === 'processing';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 transition-all ${toast.type==='ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type==='ok' ? <Check className="w-3.5 h-3.5"/> : <AlertCircle className="w-3.5 h-3.5"/>}
          {toast.msg}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <Video className="w-7 h-7 text-white"/>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Free Online Video Compressor – Reduce MP4 Size Instantly</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Real FFmpeg compression — server-side, any format</p>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-full">
            <Server className="w-3 h-3 text-emerald-600 dark:text-emerald-400"/>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Powered by FFmpeg</span>
          </div>
        </div>

        {/* Main Card */}
        <div className={`${card} p-5 sm:p-7 mb-5`}>

          {/* Upload */}
          {!file && (
            <div onClick={()=>fileRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 text-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all group">
              <Upload className="w-10 h-10 mx-auto text-slate-400 group-hover:text-violet-500 transition mb-3"/>
              <p className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-1">Click to select a video</p>
              <p className="text-[10px] text-slate-400">MP4, WebM, MOV, AVI, MKV — up to 500 MB</p>
              <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile}/>
            </div>
          )}

          {/* File Selected */}
          {file && meta && status !== 'done' && (
            <div className="space-y-4">
              {/* Info bar */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 p-3 rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                  <Film className="w-4 h-4 text-violet-500 flex-shrink-0"/>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{meta.name}</p>
                    <p className="text-[10px] text-slate-400">{fmtSize(meta.size)} · {meta.width}×{meta.height} · {fmtDur(meta.duration)}</p>
                  </div>
                </div>
                <button onClick={reset} disabled={isWorking} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition flex-shrink-0 disabled:opacity-40">
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400"/>
                </button>
              </div>

              {/* Settings */}
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>Quality</label>
                  <select value={quality} onChange={e=>setQuality(e.target.value)} className={inp} disabled={isWorking}>
                    {QUALITY.map(q=><option key={q.value} value={q.value}>{q.label}</option>)}
                  </select>
                  <p className="text-[9px] text-slate-400 mt-0.5">{QUALITY.find(q=>q.value===quality)?.desc}</p>
                </div>
                <div>
                  <label className={lbl}>Resolution</label>
                  <select value={resolution} onChange={e=>setRes(e.target.value)} className={inp} disabled={isWorking}>
                    {RESOLUTION.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <p className="text-[9px] text-slate-400 mt-0.5">Downscale for extra savings</p>
                </div>
                <div>
                  <label className={lbl}>Format</label>
                  <select value={format} onChange={e=>setFormat(e.target.value)} className={inp} disabled={isWorking}>
                    {FORMAT.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <p className="text-[9px] text-slate-400 mt-0.5">MP4 = best compat.</p>
                </div>
              </div>

              {/* Progress */}
              {isWorking && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {status==='uploading' ? 'Uploading...' : 'Compressing with FFmpeg...'}
                    </span>
                    <span className="text-[10px] font-bold text-violet-500">{progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{width:`${progress}%`}}/>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">
                    {status==='uploading' ? 'Uploading to server...' : 'FFmpeg is re-encoding your video...'}
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-[10px] text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 inline"/>{error}
                  </p>
                  <p className="text-[9px] text-red-500 mt-1">Make sure the Python backend is running on port 8000.</p>
                </div>
              )}

              {/* Actions */}
              <button onClick={compress} disabled={isWorking}
                className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {isWorking
                  ? <><Loader2 className="w-4 h-4 animate-spin"/>
                      {status==='uploading' ? 'Uploading...' : 'Compressing...'}
                    </>
                  : <><Zap className="w-4 h-4"/>Compress with FFmpeg</>
                }
              </button>
            </div>
          )}

          {/* Result */}
          {status === 'done' && result && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400"/>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">FFmpeg Compression Complete!</span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5">ORIGINAL</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{fmtSize(result.originalSize)}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-slate-400 mb-0.5">COMPRESSED</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{fmtSize(result.compressedSize)}</p>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                  <p className="text-[9px] font-bold text-emerald-500 mb-0.5">SAVED</p>
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-300">{savings}%</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={reset}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2">
                  <RotateCcw className="w-4 h-4"/>New Video
                </button>
                <button onClick={download}
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2">
                  <Download className="w-4 h-4"/>Download .{result.format}
                </button>
              </div>
            </div>
          )}

          {/* Info banner */}
          {!isWorking && status !== 'done' && (
            <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-xl">
              <p className="text-[10px] text-violet-600 dark:text-violet-400">
                <strong>How it works:</strong> Your video is uploaded to a local FFmpeg server, compressed using
                industry-standard H.264/VP9 codec, then downloaded back to your device.
                Files are deleted from the server immediately after download.
              </p>
            </div>
          )}
        </div>

        {/* SEO Content */}
        <div className="mt-16 prose-premium">
          <div className={`${card} p-5 sm:p-8`}>
            <section>
              <h2>About the Tool</h2>
              <p>
                A massive video file can eat up your storage space and take forever to send. That's why we built this <strong>video compressor</strong>. It uses real FFmpeg technology to reduce file sizes without making your video look like a blurry mess. 
              </p>
              <p>
                Most online tools use quick browser tricks that don't actually shrink your file much. We use server-side encoding instead. This means you can drop a 100MB MP4 file into the tool and get a 20MB file back, and you probably won't even notice the difference in quality.
              </p>
            </section>

            <section className="mt-8">
              <h2>How to Use</h2>
              <p>
                You don't need any technical skills to shrink your video. Follow these steps:
              </p>
              <ol>
                <li><strong>Upload your file:</strong> Click the upload box above and pick any video from your phone or computer.</li>
                <li><strong>Pick your settings:</strong> Choose a quality level. If you just want a smaller file that still looks good, stick with the "Medium" setting.</li>
                <li><strong>Hit compress:</strong> Click the button and let the server do the heavy lifting. You'll see a real progress bar as it works.</li>
                <li><strong>Download:</strong> Once it finishes, check how much space you saved and click download.</li>
              </ol>
            </section>

            <section className="mt-8">
              <h2>Privacy & Security Anchor</h2>
              <p>
                We know you don't want strangers looking at your personal videos. Here's the thing — we don't either. 
              </p>
              <p>
                When you upload a file, it goes to a secure server just long enough to get compressed. The second you click download, the server deletes your original file and the new compressed version. We don't keep backups, and we never look at your content. Your files belong to you.
              </p>
            </section>

            <section className="mt-8">
              <h2>Features</h2>
              <p>
                Here is exactly what you get when you use this tool:
              </p>
              <ul>
                <li><strong>Real FFmpeg Encoding:</strong> We use the exact same compression engine that massive video platforms use.</li>
                <li><strong>WhatsApp Preset:</strong> One click fixes your video so it perfectly fits WhatsApp's strict size and format rules.</li>
                <li><strong>Format Support:</strong> Drop in an MP4, MOV, AVI, or WebM file. The tool handles almost anything.</li>
                <li><strong>Live Progress:</strong> Watch the bar fill up as the actual compression happens. No fake loading screens.</li>
                <li><strong>Zero Limits:</strong> Upload files up to 500MB without paying a dime.</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2>Technical Specs</h2>
              <p>
                For those who care about the details, here is how the compression actually works under the hood. 
              </p>
              <p>
                The tool uses Constant Rate Factor (CRF) to control quality. The "High" setting runs at CRF 23, which keeps almost all the original details. "Medium" uses CRF 28, which is the sweet spot. It drops a lot of data that human eyes can't see, making the file much smaller. We process everything using H.264 or VP9 codecs to make sure your new video plays on any device.
              </p>
            </section>

            <section className="mt-8">
              <h2>Frequently Asked Questions</h2>
              
              <h3>Will this make my video blurry?</h3>
              <p>
                Not if you use the right settings. Lossy compression removes tiny details your eyes can't see anyway. If you pick the "High" or "Medium" preset, your video will still look sharp.
              </p>

              <h3>Why is the file size not shrinking?</h3>
              <p>
                If your original video is already highly compressed, there isn't much extra data to remove. Also, if you choose the "Original" resolution and a "High" quality setting, the file might stay the same size. Try dropping the quality to "Medium".
              </p>

              <h3>Does it work on an iPhone or Android?</h3>
              <p>
                Yes. The tool runs directly in your web browser. You don't need to install any apps. Just select a video from your camera roll, let it process, and save the new file.
              </p>

              <h3>Is there a watermark?</h3>
              <p>
                No. We never add watermarks to your videos. What you upload is what you get back, just smaller.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}