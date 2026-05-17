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
          { label: 'PDF-to-Excel', href: '/tools/pdf-to-excel'} ]} />

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

        {/* SEO Content */}
        <div className="prose-premium max-w-4xl mx-auto mt-16 px-6">
          <h2>PDF to Excel Converter: Extract Tables Instantly</h2>
          
          <p>Typing out data from a PDF document into a spreadsheet by hand is a massive waste of your time. We have all been there — staring at a dense financial report or an invoice, trying to copy and paste rows of numbers, only to watch the formatting completely fall apart in Excel. That is exactly why you need a reliable PDF to Excel converter.</p>
          
          <p>This tool is built to solve that exact headache. It looks inside your PDF document, finds the actual table structures, and pulls that data out cleanly. It then transforms those messy PDF tables into a neatly organized, fully editable Excel file. Whether you are an accountant balancing books, a researcher collecting data, or a business owner managing inventory lists, this tool handles the heavy lifting for you.</p>
          
          <p>I put this converter together because I was tired of tools that simply scrambled the rows and columns. When you need to analyze data, you need it in a real spreadsheet format immediately. You don't want to spend another hour fixing broken cells.</p>
          
          <h2>Why Copying and Pasting PDF Data Fails</h2>
          
          <p>If you have ever tried to highlight a table in a PDF, hit copy, and paste it into Excel, you already know the disaster that follows. Sometimes all the numbers drop into a single, massive column. Other times, the headers get separated from the actual data, making the whole sheet completely useless.</p>
          
          <p>This happens because PDFs are fundamentally designed for printing and visual display, not for storing structured data. A PDF doesn't actually know it contains a "table." It just knows there is some text placed at specific coordinates on the page. Our extraction engine does the hard work of looking at those coordinates, recognizing the visual patterns of rows and columns, and rebuilding the logical structure so Excel can actually understand it.</p>
          
          <h2>How to Convert PDF to Excel (The Frictionless Guide)</h2>
          
          <p>You do not need to install complicated software or sign up for an expensive subscription just to get your data out of a PDF. Here is how you can extract tables from your PDF and turn them into an editable Excel file in just a few clicks.</p>
          
          <ol>
            <li><strong>Upload your document:</strong> Drag your PDF file and drop it right into the upload box at the top of this page. You can also click the box to select a file from your computer. The tool easily handles files up to 200MB.</li>
            <li><strong>Wait for the extraction:</strong> Once you hit the convert button, our secure server takes over. It scans your pages, identifies the rows and columns, and carefully reconstructs the grid layout.</li>
            <li><strong>Download your spreadsheet:</strong> In just a few moments, your new `.xlsx` file will be ready. Click the download button, open it in Excel or Google Sheets, and start crunching your numbers.</li>
          </ol>
          
          <p>And yes, the tool processes multi-page documents seamlessly. If your PDF has tables spread across ten different pages, the engine will extract them all so you have everything in one place.</p>
          
          <h2>Your Privacy & Security Anchor</h2>
          
          <p>When you are dealing with financial statements, employee records, or business invoices, security is not just a nice bonus — it is an absolute requirement. Browser-based extraction often fails on complex tables, which is why your file needs true server-side processing to get the layout right.</p>
          
          <p>But sending files to a server means you need serious privacy guarantees. Here is our strict security policy. Your files are processed in a highly secure, isolated memory environment. As soon as the conversion is finished and you have downloaded your Excel file, the system immediately queues both the original PDF and the new spreadsheet for permanent deletion. Within one hour, every single trace of your data is completely wiped from our servers.</p>
          
          <p>We do not look at your files. We never store your extracted data. We do not use your private financial information to train artificial intelligence models. Your data belongs to you, period.</p>
          
          <h2>Key Features of the PDF to Excel Converter</h2>
          
          <p>We focused on making the data extraction process as accurate and painless as possible. Here is what you can expect when you use this tool.</p>
          
          <ul>
            <li><strong>Smart Table Recognition:</strong> The engine does not just guess where the text goes; it actively looks for table borders and structural alignment to keep your rows and columns intact.</li>
            <li><strong>Fully Editable Files:</strong> You do not get a static image packed into a spreadsheet. You get real, clickable, editable cells formatted as a standard `.xlsx` document.</li>
            <li><strong>Fast Processing Speed:</strong> Even with large, data-heavy documents, the server handles the conversion rapidly so you can get back to your actual work.</li>
            <li><strong>Clean Data Output:</strong> The system works hard to prevent merged cells and broken rows that usually plague cheap converters.</li>
          </ul>
          
          <h2>Technical Specifications</h2>
          
          <p>If you like to know the technical details behind the tools you use, here is the exact breakdown of how this application runs.</p>
          
          <table>
            <thead>
              <tr>
                <th>Specification</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Max File Size</strong></td>
                <td>200 MB per document</td>
              </tr>
              <tr>
                <td><strong>Input Format</strong></td>
                <td>Standard `.pdf` files</td>
              </tr>
              <tr>
                <td><strong>Output Format</strong></td>
                <td>Microsoft Excel (`.xlsx`)</td>
              </tr>
              <tr>
                <td><strong>Data Retention Policy</strong></td>
                <td>Strict 1-hour automatic purge</td>
              </tr>
              <tr>
                <td><strong>Entity Connection</strong></td>
                <td>Powered by <a href="https://github.com/Dtshirt/omniwebkit">Lazydesigners</a></td>
              </tr>
            </tbody>
          </table>
          
          <p>Do not waste another afternoon manually typing out data from a frozen document. Drop your file into the tool above, let the engine extract the tables, and get a clean, ready-to-use Excel spreadsheet immediately.</p>
          
          <hr />
          <p><strong>Meta Title:</strong> PDF to Excel Converter | Extract Tables to Editable Spreadsheets</p>
          <p><strong>Meta Description:</strong> Convert PDF to Excel instantly. Extract tables and data from your PDF documents and turn them into fully editable Excel spreadsheets. Fast, free, and secure.</p>
          <p><strong>Primary Keyword:</strong> pdf to excel converter</p>
          <p><strong>Word Count:</strong> 840</p>
          <p><strong>Estimated Reading Time:</strong> 4 min read</p>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "PDF to Excel Converter",
                "operatingSystem": "Web",
                "applicationCategory": "UtilitiesApplication",
                "description": "Convert PDF documents to editable Excel spreadsheets. Accurately extract tables and data with secure server-side processing.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "creator": {
                  "@type": "Organization",
                  "name": "Lazydesigners",
                  "url": "https://github.com/Dtshirt/omniwebkit"
                }
              })
            }}
          />
        </div>

      </div>
    </div>
  );
}
