'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Download, RefreshCw, CheckCircle, Server, Clock, Image as ImageIcon, FileText, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_V1 } from "@/lib/api-config";

// ─── Constants ───────────────────────────────────────────────────────────────
const POLL_INTERVAL = 2000;

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ─── Server-side Polling ──────────────────────────────────────────────────
async function pollJob(jobId, onProgress, signal) {
  while (true) {
    if (signal?.aborted) throw new Error('Cancelled');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_V1}/jobs/${jobId}`, { signal }); // standard jobs status endpoint
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0, "Capturing screenshot...");
    if (data.status === 'completed') return data;
    if (data.status === 'error') throw new Error(data.error || 'Capture failed');
  }
}

export default function WebsiteScreenshotClient() {
  const [url, setUrl]                   = useState('');
  const [format, setFormat]             = useState('png'); // 'png' or 'pdf'
  const [converting, setConverting]     = useState(false);
  const [progress, setProgress]         = useState(0);
  const [phase, setPhase]               = useState('');
  const [processTime, setProcessTime]   = useState(0);
  const [downloadUrl, setDownloadUrl]   = useState('');
  const [downloadName, setDownloadName] = useState('');

  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const handleCapture = async () => {
    if (!url || converting) return;
    setConverting(true); setProgress(0); setDownloadUrl(''); setProcessTime(0);

    const abort = new AbortController();
    abortRef.current = abort;
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => setProcessTime(Math.round((Date.now() - startTime) / 1000)), 1000);

    const updatePhase = (prog, text) => {
       setProgress(prog);
       if (text) setPhase(text);
    };

    try {
        updatePhase(5, '📤 Submitting job to server...');
        const form = new FormData();
        form.append('url', url);
        form.append('format', format);

        const uploadRes = await fetch(`${API_V1}/tools/website-screenshot`, { method: 'POST', body: form, signal: abort.signal });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.detail || 'Submission failed');
        }

        const { job_id } = await uploadRes.json();
        updatePhase(10, '⚙️ Server loading website...');

        const result = await pollJob(job_id, updatePhase, abort.signal);

        updatePhase(100, '✅ Capture complete!');
        setDownloadUrl(`${API_V1}/download/${job_id}`); // Using standard download route if it exists, otherwise we'll adjust
        setDownloadName(result.download_name || `screenshot.${format}`);
        toast.success('Screenshot captured successfully!');

    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Cancelled') {
        toast('Cancelled', { icon: '🛑' });
      } else {
        toast.error(err.message || 'Capture failed');
        console.error(err);
      }
    } finally {
      clearInterval(timerRef.current);
      setConverting(false);
      if (progress !== 100) setPhase('');
    }
  };

  const handleCancel = () => { abortRef.current?.abort(); };

  const clearAll = () => {
    abortRef.current?.abort();
    setUrl('');
    setProgress(0); setDownloadUrl(''); setConverting(false);
    clearInterval(timerRef.current); setProcessTime(0);
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-80px)]">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-4 shadow-lg shadow-indigo-500/25">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Website Screenshot
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Capture full-page, high-quality screenshots of any website as a PNG or PDF document. Processed securely on our backend using real browsers.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 sm:p-8">
            <div className="space-y-6">
                
                {/* URL Input */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Website URL</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Globe className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            disabled={converting || downloadUrl !== ''}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-white"
                        />
                    </div>
                </div>

                {/* Format Selection */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Output Format</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => setFormat('png')}
                            disabled={converting || downloadUrl !== ''}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                                format === 'png' 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                            }`}
                        >
                            <ImageIcon className="w-5 h-5" />
                            <span className="font-bold">Full Page PNG</span>
                        </button>
                        <button
                            onClick={() => setFormat('pdf')}
                            disabled={converting || downloadUrl !== ''}
                            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 transition-all ${
                                format === 'pdf' 
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                            }`}
                        >
                            <FileText className="w-5 h-5" />
                            <span className="font-bold">Print to PDF</span>
                        </button>
                    </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Our backend engine uses a real Chromium browser to load the page fully before capturing. Complex pages with heavy animations or many images may take 5-15 seconds to capture.
                  </span>
                </div>

                {/* Action Area */}
                {!converting && !downloadUrl ? (
                  <button
                    onClick={handleCapture}
                    disabled={!url}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Camera className="w-6 h-6" />
                    Capture Screenshot
                  </button>
                ) : converting ? (
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" /> {phase}
                        </span>
                        <span className="text-sm font-semibold text-slate-500">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {processTime}s elapsed
                      </div>
                      <button onClick={handleCancel} className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-md font-bold transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                   <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 p-6 rounded-xl text-center space-y-4">
                       <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                           <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                       </div>
                       <div>
                           <h3 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-1">Screenshot Ready!</h3>
                           <p className="text-emerald-600/80 dark:text-emerald-400/80 text-sm">Successfully captured {url}</p>
                       </div>
                       
                       <div className="flex flex-col sm:flex-row gap-3 pt-2">
                           <a
                               href={downloadUrl}
                               download={downloadName}
                               className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                           >
                               <Download className="w-5 h-5" /> Download {format.toUpperCase()}
                           </a>
                           <button
                               onClick={clearAll}
                               className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 px-6 rounded-xl font-bold transition-all border border-slate-300 dark:border-slate-600 active:scale-[0.98]"
                           >
                               Capture Another
                           </button>
                       </div>
                   </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
