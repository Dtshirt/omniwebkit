'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { File, UploadCloud, Download, RefreshCw, AlertCircle, Server, Clock, Layers, FileSignature } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_V1 } from "@/lib/api-config";

const POLL_INTERVAL = 2000;

function fmtMB(bytes) { return (bytes / (1024 * 1024)).toFixed(2) + ' MB'; }
function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

async function pollJob(jobId, onProgress, signal) {
  while (true) {
    if (signal?.aborted) throw new Error('Cancelled');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_V1}/tools/ppt-to-pdf/status/${jobId}`, { signal });
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0, "Server is converting presentation...");
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Server processing failed');
  }
}

export default function PptToPdfClient() {
  const [file, setFile] = useState(null);
  const [outUrl, setOutUrl] = useState('');
  const [outBlob, setOutBlob] = useState(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('');
  const [serverJobId, setServerJobId] = useState(null);
  const [outputSize, setOutputSize] = useState(null);
  const [processTime, setProcessTime] = useState(0);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

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
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.oasis.opendocument.presentation': ['.odp']
    },
    maxFiles: 1,
  });

  const handleConvert = async () => {
    if (!file || converting) return;
    setConverting(true); setProgress(0); setOutUrl(''); setOutBlob(null); setOutputSize(null); setProcessTime(0);
    const abort = new AbortController();
    abortRef.current = abort;
    const startTime = Date.now();
    timerRef.current = setInterval(() => setProcessTime(Math.round((Date.now() - startTime) / 1000)), 1000);
    const updatePhase = (prog, text) => { setProgress(prog); if (text) setPhase(text); };

    try {
      updatePhase(5, '📤 Uploading to secure server...');
      const form = new FormData();
      form.append('file', file);
      const uploadRes = await fetch(`${API_V1}/tools/ppt-to-pdf`, { method: 'POST', body: form, signal: abort.signal });
      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}));
        throw new Error(err.detail || 'Upload failed');
      }
      const contentType = uploadRes.headers.get('content-type') || '';
      if (contentType.includes('application/pdf')) {
        updatePhase(100, '✅ Done!');
        const blob = await uploadRes.blob();
        setOutputSize(blob.size);
        setOutBlob(blob);
        setOutUrl(URL.createObjectURL(blob));
        toast.success('Presentation converted to PDF!');
      } else {
        const { job_id } = await uploadRes.json();
        setServerJobId(job_id);
        updatePhase(10, '⚙️ Conversion engine processing...');
        const result = await pollJob(job_id, updatePhase, abort.signal);
        setOutputSize(result.output_size ? Number(result.output_size) : null);
        updatePhase(95, '📥 Downloading PDF...');
        const dlRes = await fetch(`${API_V1}/tools/ppt-to-pdf/download/${job_id}`, { signal: abort.signal });
        if (!dlRes.ok) throw new Error('Download failed');
        const blob = await dlRes.blob();
        setOutBlob(blob);
        setOutUrl(URL.createObjectURL(blob));
        toast.success('Presentation faithfully converted!');
        setTimeout(() => fetch(`${API_V1}/tools/ppt-to-pdf/cleanup/${job_id}`, { method: 'DELETE' }).catch(() => {}), 60000);
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
    const stem = file.name.substring(0, file.name.lastIndexOf('.')) || 'presentation';
    a.download = `${stem}-omniwebkit.pdf`;
    a.click();
  };

  const clearAll = () => {
    abortRef.current?.abort();
    setFile(null); setOutUrl(''); setOutBlob(null);
    setProgress(0); setOutputSize(null); setServerJobId(null); setConverting(false);
    clearInterval(timerRef.current); setProcessTime(0);
  };

  const ModeBadge = () => (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
      <Server className="w-3 h-3" /> Server Only
    </span>
  );

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl mb-4 shadow-lg shadow-orange-500/25">
            <FileSignature className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Convert PowerPoint to PDF
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Convert PPT and PPTX presentations to PDF with pixel-perfect slide rendering. Fonts, layouts, and visuals are faithfully preserved using our secure server engine.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <ModeBadge />
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Headless Engine</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-5">
            {!file ? (
              <div {...getRootProps()} id="ppt-dropzone"
                className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${isDragActive ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'}`}>
                <input {...getInputProps()} />
                <div className="p-4 bg-amber-100 dark:bg-amber-900/40 rounded-full mb-4">
                  <UploadCloud className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isDragActive ? 'Drop presentation here...' : 'Click or drag presentation here'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">PPT · PPTX · ODP (Max 100 MB)</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileSignature className="w-5 h-5 text-amber-600 dark:text-amber-400" />
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

            <div className={`transition-opacity duration-300 ${!file ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-5">
                <div className="flex items-start gap-2 text-xs text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-300 rounded-xl p-3 border border-orange-200 dark:border-orange-800/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span><strong>Why Server Only?</strong> Presentations contain complex slide layouts, embedded media, and custom fonts that require a full headless rendering engine to convert accurately.</span>
                </div>
                {!converting ? (
                  <button id="ppt-convert-btn" onClick={handleConvert} disabled={!file}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
                    <File className="w-5 h-5" /> Convert to PDF
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div className="h-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
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

          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner overflow-hidden min-h-[400px] flex flex-col relative h-[500px]">
              <div className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
                <span className="flex items-center gap-2"><File className="w-4 h-4 text-amber-500" /> Output PDF Preview</span>
                {outUrl && (
                  <span className="flex items-center gap-2 text-slate-400 font-normal normal-case text-xs">
                    <Clock className="w-3 h-3" /> {processTime}s · {fmtSize(outputSize)}
                  </span>
                )}
              </div>
              {!outUrl && !converting && (
                <div className="text-slate-400 flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
                  <Layers className="w-12 h-12 mb-3 text-amber-300" />
                  <p className="text-sm font-medium">Your converted PDF will appear here</p>
                  <p className="text-xs mt-2 max-w-xs leading-relaxed">We use a powerful headless rendering engine to ensure every slide is preserved pixel-perfectly.</p>
                </div>
              )}
              {converting && (
                <div className="flex flex-col items-center justify-center h-full text-amber-500/70 p-6 animate-pulse text-center">
                  <RefreshCw className="w-10 h-10 mb-4 animate-spin" />
                  <p className="text-sm font-semibold">{phase}</p>
                </div>
              )}
              {outUrl && <iframe src={`${outUrl}#toolbar=0`} title="PDF Preview" className="w-full flex-grow bg-white" />}
              {outUrl && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-white dark:bg-slate-800 shadow-sm z-10">
                  <button onClick={handleDownload} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <SeoContent />
      </div>
    </div>
  );
}

function SeoContent() {
  return (
    <div className="mt-14 max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free PowerPoint to PDF Converter — Presentation Slides Online</h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
          Sharing a presentation as a PDF is essential for ensuring your slides look consistent across every device and platform. OmniWebKit provides a professional-grade conversion engine that renders every slide with pixel-perfect accuracy — preserving fonts, images, charts, SmartArt, and complex layouts without compromise.
        </p>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          Unlike basic converters that flatten slides into blurry images, our server-side engine produces a true vector PDF. Text remains selectable and searchable, graphics stay crisp at any zoom level, and your document is ready for printing, emailing, or archiving with zero quality loss.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Convert PowerPoint to PDF</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Upload', desc: 'Drag and drop your .pptx, .ppt, or .odp presentation file.' },
            { step: '2', title: 'Convert', desc: 'Click "Convert to PDF." Our server engine processes your slides securely.' },
            { step: '3', title: 'Download', desc: 'Preview your PDF and download instantly. Files are auto-deleted for privacy.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 text-white font-extrabold rounded-xl mb-3 text-sm shadow-md">{step}</div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Why Choose This Converter</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Pixel-Perfect Slides', desc: 'Every chart, graphic, and text box renders exactly as it appears in your original presentation.' },
            { title: 'Vector-Quality Output', desc: 'Text remains selectable and searchable. Graphics stay crisp at any zoom level.' },
            { title: 'Secure Processing', desc: 'Files are processed in an isolated environment and automatically deleted after download.' },
            { title: 'Handles Large Files', desc: 'Presentations up to 100 MB are processed reliably through our queue-based architecture.' },
          ].map(({ title, desc }) => (
            <div key={title} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Does it preserve animations and transitions?', a: 'PDF is a static format, so animations and slide transitions cannot be included. However, every visual element on each slide is rendered exactly as it appears.' },
            { q: 'Is the text selectable in the output PDF?', a: 'Yes. Our engine produces a true vector PDF, not a rasterized image. All text is crisp, selectable, and searchable.' },
            { q: 'What file formats are supported?', a: 'We support .pptx (modern PowerPoint), .ppt (legacy PowerPoint), and .odp (OpenDocument Presentation). Maximum file size is 100 MB.' },
            { q: 'Are my files stored on the server?', a: 'Only temporarily during conversion. Files are automatically deleted within 60 seconds after you download your PDF.' },
          ].map(({ q, a }) => (
            <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
              </summary>
              <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
