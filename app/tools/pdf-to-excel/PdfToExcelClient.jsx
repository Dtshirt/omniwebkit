'use client';

import { useState, useRef } from 'react';
import { Upload, Download, Loader2, Check, AlertTriangle, FileSpreadsheet, RefreshCw, X, Server } from 'lucide-react';
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

export default function PdfToExcelClient() {
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
      fd.append('file', file);

      const res = await fetch(`${API_V1}/tools/pdf-to-excel`, {
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
            const sr = await fetch(`${API_V1}/tools/pdf-to-excel/status/${data.job_id}`);
            const sd = await sr.json();
            if (sd.status === 'done') break;
            if (sd.status === 'error') throw new Error(sd.error || 'Conversion failed');
          }
          const dlRes = await fetch(`${API_V1}/tools/pdf-to-excel/download/${data.job_id}`);
          if (!dlRes.ok) throw new Error('Download failed');
          const blob = await dlRes.blob();
          const stem = file.name.replace(/\.[^/.]+$/, '');
          setResult({
            url: URL.createObjectURL(blob),
            name: `${stem}.xlsx`,
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
        name: `${stem}.xlsx`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Tools', href: '/tools' },
          { label: 'PDF to Excel' }
        ]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/25 mb-4">
            <FileSpreadsheet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">
            Convert PDF to Excel
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Extract tables and data from your PDF documents and convert them into fully editable Excel spreadsheets.
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
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                  : 'border-slate-300 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <input 
                ref={fileRef}
                type="file" 
                accept={ACCEPTED} 
                className="hidden" 
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
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
                <FileSpreadsheet className="w-8 h-8" />
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
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 transition-all flex items-center gap-2"
                >
                  Convert to Excel
                </button>
              </div>
            </div>
          )}

          {processing && (
            <div className="text-center py-12">
              <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Extracting Tables...
              </h3>
              <p className="text-slate-500">
                We are processing your PDF and generating your Excel file. This may take a few moments.
              </p>
            </div>
          )}

          {result && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center">
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
                  className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" /> Download Excel File
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
              title: "Smart Table Extraction",
              desc: "Our engine automatically detects and extracts tabular data from your PDF into clean Excel sheets."
            },
            {
              title: "Editable Output",
              desc: "Get fully editable .xlsx files ready for data analysis, charting, and further processing."
            },
            {
              title: "Privacy Focused",
              desc: "Files are processed securely on isolated servers and permanently deleted right after you download them."
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
              { q: 'Will my formatting be preserved?', a: 'The tool focuses on extracting tabular data accurately. While exact visual styling might not carry over completely, row and column structures are strictly maintained.' },
              { q: 'Does it work with scanned PDFs?', a: 'Currently, the extraction engine works best with native PDFs containing selectable text. Scanned PDFs containing only images of tables may yield mixed results.' },
              { q: 'Is my document safe?', a: 'Yes. Documents are processed over an encrypted connection and deleted from our servers automatically after conversion.' },
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
