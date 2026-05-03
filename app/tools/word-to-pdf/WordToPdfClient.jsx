'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, File, UploadCloud, Download, RefreshCw, CheckCircle, AlertCircle, Server, Clock, Layers, FileSignature } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_V1 } from "@/lib/api-config";

// ─── Constants ───────────────────────────────────────────────────────────────
const POLL_INTERVAL = 2000;

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmtMB(bytes) { return (bytes / (1024 * 1024)).toFixed(2) + ' MB'; }
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
    const res = await fetch(`${API_V1}/tools/word-to-pdf/status/${jobId}`, { signal });
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0, "Server is converting document...");
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Server processing failed');
  }
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function WordToPdfClient() {
  const [file, setFile]                 = useState(null);
  const [outUrl, setOutUrl]             = useState('');
  const [outBlob, setOutBlob]           = useState(null);

  // State
  const [converting, setConverting]     = useState(false);
  const [progress, setProgress]         = useState(0);
  const [phase, setPhase]               = useState('');
  const [serverJobId, setServerJobId]   = useState(null);
  const [outputSize, setOutputSize]     = useState(null);
  const [processTime, setProcessTime]   = useState(0);
  
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  // ── Dropzone ────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    if (f.size > 100 * 1024 * 1024) { toast.error('Max file size is 100 MB'); return; }
    
    setFile(f);
    setOutUrl(''); setOutBlob(null); setProgress(0); setOutputSize(null); setServerJobId(null);
    setProcessTime(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] 
    },
    maxFiles: 1,
  });

  // ── Convert ─────────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!file || converting) return;
    setConverting(true); setProgress(0); setOutUrl(''); setOutBlob(null); setOutputSize(null); setProcessTime(0);

    const abort = new AbortController();
    abortRef.current = abort;
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => setProcessTime(Math.round((Date.now() - startTime) / 1000)), 1000);

    const updatePhase = (prog, text) => {
       setProgress(prog);
       if (text) setPhase(text);
    };

    try {
      // ── Pure Server Path ──────────────────────────────────────────────
      updatePhase(5, '📤 Uploading to secure server...');
      const form = new FormData();
      form.append('file', file);

      const uploadRes = await fetch(`${API_V1}/tools/word-to-pdf`, { method: 'POST', body: form, signal: abort.signal });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }

      // ── Dual-mode: server returns PDF directly (inline) OR a job_id (queued) ──
      const contentType = uploadRes.headers.get('content-type') || '';
      if (contentType.includes('application/pdf')) {
        // Inline mode
        updatePhase(100, '✅ Done!');
        const blob = await uploadRes.blob();
        setOutputSize(blob.size);
        setOutBlob(blob);
        setOutUrl(URL.createObjectURL(blob));
        toast.success('Converted to PDF (server inline)!');
      } else {
        // Queued mode
        const { job_id } = await uploadRes.json();
        setServerJobId(job_id);
        updatePhase(10, '⚙️ Engine booting (LibreOffice)...');

        const result = await pollJob(job_id, updatePhase, abort.signal);
        setOutputSize(result.output_size ? Number(result.output_size) : null);

        updatePhase(95, '📥 Downloading PDF...');
        const dlRes = await fetch(`${API_V1}/tools/word-to-pdf/download/${job_id}`, { signal: abort.signal });
        if (!dlRes.ok) throw new Error('Download failed');
        const blob = await dlRes.blob();
        setOutBlob(blob);
        setOutUrl(URL.createObjectURL(blob));
        toast.success('Document faithfully converted!');

        // cleanup after 60s
        setTimeout(() => fetch(`${API_V1}/tools/word-to-pdf/cleanup/${job_id}`, { method: 'DELETE' }).catch(() => {}), 60000);
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Cancelled') {
        toast('Cancelled', { icon: '🛑' });
      } else {
        toast.error(err.message || 'Conversion failed');
        console.error(err);
      }
    } finally {
      clearInterval(timerRef.current);
      setConverting(false); setPhase('');
    }
  };

  const handleCancel = () => { abortRef.current?.abort(); };

  const handleDownload = () => {
    if (!outUrl) return;
    const a = document.createElement('a');
    a.href = outUrl;
    const stem = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';
    a.download = `${stem}-omniwebkit.pdf`;
    a.click();
  };

  const clearAll = () => {
    abortRef.current?.abort();
    setFile(null); setOutUrl(''); setOutBlob(null);
    setProgress(0); setOutputSize(null); setServerJobId(null); setConverting(false);
    clearInterval(timerRef.current); setProcessTime(0);
  };

  // ── Badge helper ────────────────────────────────────────────────────────
  const ModeBadge = () => {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
        <Server className="w-3 h-3" /> Server Only
      </span>
    );
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mb-4 shadow-lg shadow-indigo-500/25">
            <FileSignature className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Convert WORD to PDF
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Convert DOC and DOCX files to PDF with 100% true formatting. Complex layouts, fonts, and tables are perfectly preserved using our secure headless server engine.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
             <ModeBadge />
             <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">LibreOffice Engine</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Upload + Controls ─────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Dropzone / File card */}
            {!file ? (
              <div
                {...getRootProps()}
                id="word-dropzone"
                className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
                }`}
              >
                <input {...getInputProps()} />
                <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-full mb-4">
                  <UploadCloud className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isDragActive ? 'Drop Word file here...' : 'Click or drag Word doc here'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">DOC · DOCX (Max 100 MB)</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{fmtMB(file.size)}</p>
                  </div>
                </div>
                <button onClick={clearAll} disabled={converting} className="p-2 bg-slate-100 hover:bg-red-100 dark:bg-slate-700 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 rounded-lg transition-colors flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Controls panel */}
            <div className={`transition-opacity duration-300 ${!file ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex items-start gap-2 text-xs text-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300 rounded-xl p-3 border border-indigo-200 dark:border-indigo-800/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Why Server Only?</strong> True formatting preservation requires a full headless Office engine. This ensures your final PDF looks exactly like your Word document.
                  </span>
                </div>

                {/* Convert button */}
                {!converting ? (
                  <button
                    id="word-convert-btn"
                    onClick={handleConvert}
                    disabled={!file}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <File className="w-5 h-5" />
                    Convert to PDF
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{phase} {progress}%</span>
                      <button onClick={handleCancel} className="text-xs text-red-500 hover:text-red-700 font-bold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                    <div className="text-xs text-center text-slate-400 italic">Elapsed: {processTime}s</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Preview ──────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden min-h-[400px] flex flex-col relative h-[500px]">
              
              {/* Header */}
              <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
                <span className="flex items-center gap-2"><File className="w-4 h-4 text-blue-500" /> Output PDF Preview</span>
                {outUrl && (
                   <span className="flex items-center gap-2 text-slate-400 font-normal normal-case text-xs">
                     <Clock className="w-3 h-3" /> {processTime}s · {fmtSize(outputSize)}
                   </span>
                )}
              </div>

              {!outUrl && !converting && (
                <div className="text-slate-400 flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
                  <Layers className="w-12 h-12 mb-3 text-blue-300" />
                  <p className="text-sm font-medium">Your converted PDF will appear here</p>
                  <p className="text-xs mt-2 max-w-xs leading-relaxed">We use LibreOffice Headless to ensure the layout matches your original Word document perfectly.</p>
                </div>
              )}
              
              {converting && (
                 <div className="flex flex-col items-center justify-center h-full text-blue-500/70 p-6 animate-pulse text-center">
                    <RefreshCw className="w-10 h-10 mb-4 animate-spin" />
                    <p className="text-sm font-semibold">{phase}</p>
                 </div>
              )}

              {/* PDF Preview Frame */}
              {outUrl && (
                <iframe
                  src={`${outUrl}#toolbar=0`}
                  title="PDF Preview"
                  className="w-full flex-grow bg-white"
                />
              )}
              
              {/* Download Bar */}
              {outUrl && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800 shadow-sm z-10">
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
