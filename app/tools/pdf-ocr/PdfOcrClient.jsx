'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, UploadCloud, Download, RefreshCw, CheckCircle, AlertCircle, Server, Monitor, Clock, Layers, Zap, Type, AlignLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_V1 } from "@/lib/api-config";

// ─── Constants ───────────────────────────────────────────────────────────────
const SERVER_THRESHOLD_MB = 5;   // Files > 5 MB go to server (OCR is very CPU intensive)
const POLL_INTERVAL = 2000;

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmtMB(bytes) { return (bytes / (1024 * 1024)).toFixed(2) + ' MB'; }
function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ─── Browser-side OCR ────────────────────────────────────────────────────
async function processBrowserOcr(file, onProgress) {
  try {
    const pdfjs = await import('pdfjs-dist');
    // Set worker from unpkg to avoid local Next.js build issues with pdf.worker.js
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    const Tesseract = (await import('tesseract.js')).default;
    
    onProgress(5, "Loading PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument(arrayBuffer);
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    
    onProgress(15, `Initializing OCR Engine...`);
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          // Internal tesseract progress is 0 to 1
        }
      }
    });
    
    let fullText = "";
    
    for (let i = 1; i <= numPages; i++) {
      onProgress(15 + Math.round(((i - 1) / numPages) * 80), `Extracting Page ${i} of ${numPages}...`);
      
      // Render PDF page to hidden canvas
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // 1.5 scale is a good balance of quality vs speed
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Get base64 image from canvas
      const imageData = canvas.toDataURL('image/png');
      
      // Run OCR on this page
      const { data: { text } } = await worker.recognize(imageData);
      fullText += `--- Page ${i} ---\n${text}\n\n`;
    }
    
    onProgress(95, "Finalizing text...");
    await worker.terminate();
    onProgress(100, "Done!");
    return fullText;
    
  } catch (err) {
    throw new Error(`Browser OCR failed: ${err.message}`);
  }
}

// ─── Server-side Polling ──────────────────────────────────────────────────
async function pollJob(jobId, onProgress, signal) {
  while (true) {
    if (signal?.aborted) throw new Error('Cancelled');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_V1}/tools/pdf-ocr/status/${jobId}`, { signal });
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0, "Server is processing OCR...");
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Server processing failed');
  }
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function PdfOcrClient() {
  const [file, setFile]                 = useState(null);
  const [extractedText, setExtractedText]= useState('');
  const [mode, setMode]                 = useState('auto'); // 'auto' | 'browser' | 'server'

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
    if (f.size > 50 * 1024 * 1024) { toast.error('Max file size is 50 MB'); return; }
    
    setFile(f);
    setExtractedText(''); setProgress(0); setOutputSize(null); setServerJobId(null);
    setProcessTime(0);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  // ── Compute effective mode ──────────────────────────────────────────────
  const fileMB = file ? file.size / (1024 * 1024) : 0;
  const effectiveMode = mode === 'auto'
    ? (fileMB > SERVER_THRESHOLD_MB ? 'server' : 'browser')
    : mode;

  // ── Convert ─────────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!file || converting) return;
    setConverting(true); setProgress(0); setExtractedText(''); setOutputSize(null); setProcessTime(0);

    const abort = new AbortController();
    abortRef.current = abort;
    
    const startTime = Date.now();
    timerRef.current = setInterval(() => setProcessTime(Math.round((Date.now() - startTime) / 1000)), 1000);

    const updatePhase = (prog, text) => {
       setProgress(prog);
       if (text) setPhase(text);
    };

    try {
      if (effectiveMode === 'browser') {
        const text = await processBrowserOcr(file, updatePhase);
        if (abort.signal.aborted) throw new Error("Cancelled");
        setExtractedText(text);
        const blob = new Blob([text], { type: 'text/plain' });
        setOutputSize(blob.size);
        toast.success('Text extracted locally!');
      } else {
        // ── Server path ──────────────────────────────────────────────────
        updatePhase(5, '📤 Uploading to server...');
        const form = new FormData();
        form.append('file', file);

        const uploadRes = await fetch(`${API_V1}/tools/pdf-ocr/convert`, { method: 'POST', body: form, signal: abort.signal });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.detail || 'Upload failed');
        }

        // ── Dual-mode: server returns text directly (inline) OR a job_id (queued) ──
        const contentType = uploadRes.headers.get('content-type') || '';
        if (contentType.includes('text/')) {
          // Inline mode
          updatePhase(100, '✅ Done!');
          const text = await uploadRes.text();
          const blob = new Blob([text], { type: 'text/plain' });
          setOutputSize(blob.size);
          setExtractedText(text);
          toast.success('Text extracted (server inline)!');
        } else {
          // Queued mode
          const { job_id } = await uploadRes.json();
          setServerJobId(job_id);
          updatePhase(10, '⚙️ Server processing OCR...');

          const result = await pollJob(job_id, updatePhase, abort.signal);
          setOutputSize(result.output_size ? Number(result.output_size) : null);

          updatePhase(95, '📥 Downloading text...');
          const dlRes = await fetch(`${API_V1}/tools/pdf-ocr/download/${job_id}`, { signal: abort.signal });
          if (!dlRes.ok) throw new Error('Download failed');
          const text = await dlRes.text();
          setExtractedText(text);
          toast.success('Server text extracted!');

          // cleanup after 60s
          setTimeout(() => fetch(`${API_V1}/tools/pdf-ocr/cleanup/${job_id}`, { method: 'DELETE' }).catch(() => {}), 60000);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Cancelled') {
        toast('Cancelled', { icon: '🛑' });
      } else {
        toast.error(err.message || 'OCR failed');
        console.error(err);
      }
    } finally {
      clearInterval(timerRef.current);
      setConverting(false); setPhase('');
    }
  };

  const handleCancel = () => { abortRef.current?.abort(); };

  const handleDownload = () => {
    if (!extractedText) return;
    const a = document.createElement('a');
    const blob = new Blob([extractedText], { type: 'text/plain' });
    a.href = URL.createObjectURL(blob);
    const stem = file.name.substring(0, file.name.lastIndexOf('.')) || 'document';
    a.download = `${stem}-ocr-omniwebkit.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  
  const handleCopy = () => {
      if (!extractedText) return;
      navigator.clipboard.writeText(extractedText);
      toast.success("Text copied to clipboard!");
  }

  const clearAll = () => {
    abortRef.current?.abort();
    setFile(null); setExtractedText('');
    setProgress(0); setOutputSize(null); setServerJobId(null); setConverting(false);
    clearInterval(timerRef.current); setProcessTime(0);
  };

  // ── Badge helper ────────────────────────────────────────────────────────
  const ModeBadge = ({ m }) => {
    const isServer = m === 'server';
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
        isServer ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-rose-500 rounded-3xl mb-4 shadow-lg shadow-orange-500/25">
            <Type className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            PDF OCR Tool
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Extract text from scanned PDFs safely. Small files process locally in your browser for absolute privacy; heavy files use our powerful server queue.
          </p>

          {/* Hybrid mode chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {['auto', 'browser', 'server'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  mode === m
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-400'
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

          {/* ── Left: Upload + Controls ─────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Dropzone / File card */}
            {!file ? (
              <div
                {...getRootProps()}
                id="ocr-dropzone"
                className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
                }`}
              >
                <input {...getInputProps()} />
                <div className="p-4 bg-orange-100 dark:bg-orange-900/40 rounded-full mb-4">
                  <UploadCloud className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isDragActive ? 'Drop it here...' : 'Click or drag scanned PDF'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Supported: PDF only</p>
                <div className="flex gap-3 mt-4">
                  <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full font-medium">≤ {SERVER_THRESHOLD_MB} MB → Browser</span>
                  <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full font-medium">&gt; {SERVER_THRESHOLD_MB} MB → Server</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
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
                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl p-3 border border-amber-200 dark:border-amber-800/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Note:</strong> OCR processing uses intensive computer vision AI. Extraction may take up to a minute per page. Please be patient.
                  </span>
                </div>

                {/* Convert button */}
                {!converting ? (
                  <button
                    id="ocr-convert-btn"
                    onClick={handleConvert}
                    disabled={!file}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <AlignLeft className="w-5 h-5" />
                    Extract Text
                    {file && <span className="text-xs opacity-70 ml-1">({effectiveMode === 'server' ? 'server' : 'browser'})</span>}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full transition-all duration-500"
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
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px] flex flex-col relative h-[500px]">
              
              {/* Header */}
              <div className="bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 text-sm font-bold uppercase tracking-wider flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="flex items-center gap-2"><AlignLeft className="w-4 h-4 text-orange-500" /> Extracted Text</span>
                {extractedText && (
                   <span className="flex items-center gap-2 text-slate-400 font-normal normal-case text-xs">
                     <Clock className="w-3 h-3" /> {processTime}s · {fmtSize(outputSize)}
                   </span>
                )}
              </div>

              {!extractedText && !converting && (
                <div className="text-slate-400 flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
                  <Layers className="w-12 h-12 mb-3 text-orange-300" />
                  <p className="text-sm font-medium">Results will appear here</p>
                  <p className="text-xs mt-2 max-w-xs leading-relaxed">Your extracted text will be displayed in this editor. You can copy it or download it as a .txt file.</p>
                </div>
              )}
              
              {converting && (
                 <div className="flex flex-col items-center justify-center h-full text-orange-500/70 p-6 animate-pulse text-center">
                    <RefreshCw className="w-10 h-10 mb-4 animate-spin" />
                    <p className="text-sm font-semibold">{phase}</p>
                 </div>
              )}

              {/* Text Area Output */}
              {extractedText && (
                <textarea
                  readOnly
                  value={extractedText}
                  className="w-full flex-grow p-5 text-sm font-mono leading-relaxed bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 resize-none outline-none focus:ring-0 border-0"
                />
              )}
              
              {/* Download Bar */}
              {extractedText && (
                  <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-between gap-3 bg-slate-50 dark:bg-slate-900/50">
                    <button
                      onClick={handleCopy}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-semibold text-sm px-4 py-2 transition-colors"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                    >
                      <Download className="w-4 h-4" /> Download .txt
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
