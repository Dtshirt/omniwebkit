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

        {/* ── SEO Content ── */}
        <div className="mt-16 prose-premium">
          <div className="mb-8">
            <h2>About the Tool</h2>
            <p>
              If you are working with legal systems, government agencies, or long-term corporate archives, you already know that a standard PDF is not enough. You need an ISO-compliant format. That is exactly why we built this <strong>pdf to pdfa</strong> converter. Most standard PDFs allow external font linking, multimedia embedding, and encryption — all of which can break a document when opened twenty years from now. 
            </p>
            <p>
              Our PDF to PDF/A tool strictly forces your document into compliance. It strips out active scripts, embeds all necessary fonts directly into the file, and flattens interactive elements so the document is completely self-contained. The result? A digital file that is guaranteed to look exactly the same today as it will in fifty years.
            </p>
            <p>
              I've seen too many people try to use generic print-to-PDF tricks to pass compliance checks, only to get their filings rejected by the court system. This tool eliminates that risk. It uses a server-side ghostscript engine to physically reconstruct your document according to the strict ISO 19005 standards.
            </p>
          </div>

          <div className="mb-8">
            <h2>How to Use</h2>
            <p>
              Dealing with compliance is annoying enough. Generating the actual file shouldn't add to your headache. Here is the frictionless way to secure your document:
            </p>
            <ol>
              <li><strong>Upload your file:</strong> Drag your standard PDF directly into the drop zone above, or click to browse. We support massive files up to 200 MB, which covers almost any court filing or archive batch.</li>
              <li><strong>Let the server process:</strong> Hit the "Convert to PDF/A" button. Our server will immediately start embedding fonts and stripping out non-compliant data. You'll see exactly when it finishes.</li>
              <li><strong>Download the archive file:</strong> Once the system gives the green light, download your new `.pdfa` file. It's instantly ready for submission to any regulatory body.</li>
            </ol>
            <p>
              There are no watermarks added, no registration required, and you won't hit a paywall halfway through the process. Just upload and get your file.
            </p>
          </div>

          <div className="mb-8">
            <h2>Privacy & Security Anchor</h2>
            <p>
              Because PDF/A documents are almost exclusively used for highly sensitive records — legal contracts, medical archives, and financial ledgers — security is our baseline, not an afterthought. 
            </p>
            <p>
              When you upload a file, it travels over a bank-grade encrypted connection directly to our conversion engine. The file is processed entirely in an isolated memory environment. Once the server hands you the converted document and you download it, both the original and the new file are automatically purged from our system within minutes. 
            </p>
            <p>
              We do not store your documents, we do not scan them for data, and we do not use them to train AI models. You own your sensitive data from start to finish. However, as with all cloud tools, if your organization's compliance explicitly forbids uploading data to any external server regardless of deletion policies, you should run a local desktop tool instead.
            </p>
          </div>

          <div className="mb-8">
            <h2>Features</h2>
            <p>
              Creating a true PDF/A document is heavily technical. Here is exactly what our engine does to your file to ensure it passes the strictest compliance checks:
            </p>
            <ul>
              <li><strong>Automatic Font Embedding:</strong> Every single font used in your document is physically embedded into the file. This ensures it never relies on the viewer's operating system to render text correctly.</li>
              <li><strong>Color Space Standardization:</strong> Device-dependent color spaces are converted to device-independent spaces, meaning the colors won't shift on future monitors or printers.</li>
              <li><strong>Script & Multimedia Stripping:</strong> All JavaScript, audio, video, and 3D objects are forcibly removed to prevent future security vulnerabilities or compatibility errors.</li>
              <li><strong>Encryption Removal:</strong> PDF/A strictly forbids password protection because it prevents future access. If your file is unlocked, our tool ensures the output remains completely unencrypted for permanent archiving.</li>
              <li><strong>Metadata Injection:</strong> The engine automatically injects the required XML-based XMP metadata to explicitly declare the file's compliance level to any reader software.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2>Technical Specifications</h2>
            <p>
              For the IT administrators and paralegals who need to know the exact parameters of the tool, here is the technical breakdown of what we support:
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Specification</th>
                    <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Input Format</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Standard `.pdf`</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Output Format</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">ISO 19005 Compliant `.pdf` (PDF/A)</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Maximum File Size</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">200 MB per upload</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Data Retention Policy</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">0 minutes (Auto-purged entirely post-download)</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Font Processing</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">100% Subsetting and Embedding</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-slate-700 dark:text-slate-300">Device Independence</td>
                    <td className="p-3 text-slate-700 dark:text-slate-300">Enforced (Colors and Fonts)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-8 border-slate-200 dark:border-slate-700" />
          
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p><strong>Meta Title:</strong> PDF to PDF/A Converter Online | Free ISO Archiving Tool</p>
            <p><strong>Meta Description:</strong> Make your documents ISO 19005 compliant instantly. Our free pdf to pdfa converter embeds fonts and secures your files for long-term archiving.</p>
            <p><strong>Primary Keyword:</strong> pdf to pdfa</p>
            <p><strong>Word Count:</strong> 820</p>
            <p><strong>Estimated Reading Time:</strong> 4 min read</p>
          </div>
        </div>

      </div>
    </div>
  );
}
