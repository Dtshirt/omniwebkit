'use client';

import { useState, useRef } from 'react';
import { Upload, Download, Loader2, Check, AlertTriangle, FileArchive, RefreshCw, X, Server } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from '@/lib/api-config';

const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const ACCEPTED = '.pdf';

function fmtSize(b) {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

export default function PdfToPdfaClient() {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a valid PDF file.');
      return;
    }
    if (f.size > 200 * 1024 * 1024) {
      setError('File too large. Maximum size is 200 MB.');
      return;
    }
    setFile(f);
    setError('');
  };

  const processFile = async () => {
    if (!file) return;
    setProcessing(true);
    setError('');
    
    try {
      const fd = new FormData();
      fd.append('document', file);

      const res = await fetch(`${API_V1}/tools/pdf-to-pdfa`, {
        method: 'POST',
        body: fd
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const ct = res.headers.get('content-type') || '';
      if (ct.includes('json')) {
        const data = await res.json();
        if (data.job_id) {
          // Polling logic
          while (true) {
            await new Promise(r => setTimeout(r, 2000));
            const sr = await fetch(`${API_V1}/tools/pdf-to-pdfa/status/${data.job_id}`);
            const sd = await sr.json();
            if (sd.status === 'done') break;
            if (sd.status === 'error') throw new Error(sd.error || 'Conversion failed');
          }
          const dlRes = await fetch(`${API_V1}/tools/pdf-to-pdfa/download/${data.job_id}`);
          if (!dlRes.ok) throw new Error('Download failed');
          const blob = await dlRes.blob();
          const stem = file.name.replace(/\.[^/.]+$/, '');
          setResult({
            url: URL.createObjectURL(blob),
            name: `${stem}_pdfa.pdf`,
            size: blob.size
          });
          setProcessing(false);
          return;
        }
      }

      // Sync response fallback
      const blob = await res.blob();
      const stem = file.name.replace(/\.[^/.]+$/, '');
      setResult({
        url: URL.createObjectURL(blob),
        name: `${stem}_pdfa.pdf`,
        size: blob.size
      });
    } catch (err) {
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'PDF to PDF/A' }
        ]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 mb-4">
            <FileArchive className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            Convert PDF to PDF/A
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Ensure long-term archiving and compliance by converting your PDF documents to the ISO-standardized PDF/A format.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={`${card} p-6 sm:p-10 mb-8`}>
          {!file && !result && !processing && (
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200 ${
                dragOver 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input 
                ref={fileRef}
                type="file" 
                accept={ACCEPTED} 
                className="hidden" 
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
                <Upload className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload your PDF</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Drag and drop your document here, or click to browse files.
              </p>
              
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Server className="w-4 h-4" /> Secure Server Processing
                </div>
              </div>
            </div>
          )}

          {file && !result && !processing && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center">
                <FileArchive className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate px-4">
                {file.name}
              </h3>
              <p className="text-slate-500 mb-8">{fmtSize(file.size)}</p>

              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={reset}
                  className="px-6 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={processFile}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                >
                  Convert to PDF/A
                </button>
              </div>
            </div>
          )}

          {processing && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Converting Document...
              </h3>
              <p className="text-slate-500">
                We are processing your PDF. This may take a few moments for large files.
              </p>
            </div>
          )}

          {result && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Conversion Complete!
              </h3>
              <p className="text-slate-500 mb-8">
                {result.name} ({fmtSize(result.size)})
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href={result.url} 
                  download={result.name}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download PDF/A
                </a>
                <button 
                  onClick={reset}
                  className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Convert Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Features / Info */}
        <div className="grid sm:grid-cols-3 gap-6 mt-12">
          {[
            {
              title: "ISO Standardized",
              desc: "Converts your documents to the PDF/A format, the ISO standard for long-term archiving of electronic documents."
            },
            {
              title: "Cloud Processing",
              desc: "Heavy conversion tasks are handled by our secure, high-performance servers so your browser stays fast and responsive."
            },
            {
              title: "Privacy First",
              desc: "Your files are transmitted securely, processed in isolated environments, and automatically deleted after 60 seconds."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
        
        {/* FAQ */}
        <div className={`${card} p-6 sm:p-8 mt-6`}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {[
              { q: 'What is PDF/A?', a: 'PDF/A is an ISO-standardized version of the Portable Document Format (PDF) specialized for use in the archiving and long-term preservation of electronic documents. It prohibits features ill-suited to long-term archiving, such as font linking (as opposed to font embedding) and encryption.' },
              { q: 'Why do I need to convert my PDF to PDF/A?', a: 'Many government agencies, legal systems, and corporate archives require documents to be submitted in PDF/A format to ensure they will look exactly the same when opened years or decades in the future.' },
              { q: 'Is my document safe?', a: 'Yes. Documents are uploaded over a secure connection, processed immediately, and permanently deleted from our servers automatically after you download the result.' },
            ].map((f, i) => (
              <div key={i} className="py-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.q}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
