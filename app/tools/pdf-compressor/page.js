'use client';
import { useState, useCallback, useRef } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  FileText, Upload, Download, Settings, AlertCircle,
  Trash2, Check, RefreshCw, FileDown, X, Loader2, ServerCrash
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.omniwebkit.com';
const ENDPOINT = `${API}/api/v1/tools/pdf-compress/`;

/* ─── Styles ── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

function fmtSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024, u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + u[i];
}

const LEVELS = [
  { key: 'low',    label: 'Low',    desc: 'Minimal compression, best quality',      color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'medium', label: 'Medium', desc: 'Balanced compression and quality',        color: 'text-blue-600 dark:text-blue-400'     },
  { key: 'high',   label: 'High',   desc: 'Maximum compression, smallest file size', color: 'text-orange-600 dark:text-orange-400' },
];

export default function PDFCompressor() {
  const [files, setFiles]       = useState([]);
  const [processing, setProc]   = useState(false);
  const [level, setLevel]       = useState('medium');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  /* ── Add files ── */
  const addFiles = useCallback((list) => {
    const pdfs = Array.from(list).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfs.length) return;
    setFiles(prev => [
      ...prev,
      ...pdfs
        .filter(f => !prev.some(p => p.file.name === f.name && p.file.size === f.size))
        .map(f => ({
          id: Math.random().toString(36).slice(2, 11),
          file: f,
          status: 'ready',
          originalSize: f.size,
          compressedSize: null,
          downloadUrl: null,
          downloadName: null,
          error: null,
        })),
    ]);
  }, []);

  const onDrop     = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = ()  => setDragOver(false);

  /* ── Compress (real server-side) ── */
  const compress = async () => {
    setProc(true);
    // Get the current list of files that need processing
    const toProcess = files.filter(f => f.status !== 'completed');

    for (let i = 0; i < toProcess.length; i++) {
      const fileItem = toProcess[i];

      // Mark as processing
      setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'processing', error: null } : f));

      try {
        const fd = new FormData();
        fd.append('file', fileItem.file);
        fd.append('level', level);

        const res = await fetch(ENDPOINT, { method: 'POST', body: fd });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Server error ${res.status}`);
        }

        // Read real compressed size from response headers
        const compressedSize = parseInt(res.headers.get('X-Compressed-Size') || '0', 10);
        const downloadName   = fileItem.file.name.replace(/\.pdf$/i, '') + '_compressed.pdf';

        // Turn the response body into a blob URL for download
        const blob        = await res.blob();
        const downloadUrl = URL.createObjectURL(blob);

        setFiles(prev => prev.map(f => f.id === fileItem.id ? {
          ...f,
          status: 'completed',
          compressedSize: compressedSize || blob.size,
          downloadUrl,
          downloadName,
        } : f));
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === fileItem.id ? { ...f, status: 'error', error: err.message } : f));
      }
    }
    setProc(false);
  };

  const downloadFile = (item) => {
    if (!item.downloadUrl) return;
    Object.assign(document.createElement('a'), {
      href: item.downloadUrl,
      download: item.downloadName || 'compressed.pdf',
    }).click();
  };

  const removeFile = (id) => setFiles(f => f.filter(x => x.id !== id));
  const clearAll   = ()   => setFiles([]);

  const totalOrig   = files.reduce((s, f) => s + f.originalSize, 0);
  const totalComp   = files.filter(f => f.compressedSize).reduce((s, f) => s + f.compressedSize, 0);
  const completed   = files.filter(f => f.status === 'completed').length;
  const savedPct    = totalOrig && totalComp ? Math.round(((totalOrig - totalComp) / totalOrig) * 100) : 0;
  const hasReady    = files.some(f => f.status === 'ready' || f.status === 'error');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'PDF Compressor', href: '/tools/pdf-compressor' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mb-4 shadow-lg shadow-red-500/25">
            <FileDown className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Free Online PDF Compressor</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Real server-side compression — reduce PDF file size by up to 80%</p>
        </div>

        {/* Server badge */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {['Real Compression', 'Server-Side Processing', 'No Watermarks'].map(b => (
            <span key={b} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-full text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <Check className="w-3 h-3" />{b}
            </span>
          ))}
        </div>

        <div className="space-y-5">

          {/* Compression level */}
          <div className={`${cardCls} p-5`}>
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-red-500" />Compression Level
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {LEVELS.map(l => (
                <button key={l.key} onClick={() => setLevel(l.key)}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl transition cursor-pointer text-left ${level === l.key
                    ? 'border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${level === l.key ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {level === l.key && <div className="w-2 h-2 rounded-full bg-red-500" />}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${level === l.key ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{l.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{l.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload area */}
          <div className={`${cardCls} p-5`}>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${dragOver
                ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                : 'border-slate-300 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-700 hover:bg-slate-50 dark:hover:bg-slate-700/20'}`}>
              <input ref={fileRef} type="file" accept=".pdf,application/pdf" multiple
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }} className="hidden" />
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {dragOver ? 'Drop PDF files here…' : 'Drag & drop PDF files here, or click to select'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports multiple files — PDF only · Max 100 MB each</p>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Files ({files.length})</h3>
                <div className="flex gap-2">
                  <button onClick={clearAll} disabled={processing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" />Clear All
                  </button>
                  <button onClick={compress} disabled={processing || !hasReady}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/20">
                    {processing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                    {processing ? 'Compressing…' : 'Compress All'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                    <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.file.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span>{fmtSize(f.originalSize)}</span>
                        {f.status === 'completed' && f.compressedSize && (
                          <>
                            <span>→</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{fmtSize(f.compressedSize)}</span>
                            <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded font-bold">
                              −{Math.round(((f.originalSize - f.compressedSize) / f.originalSize) * 100)}%
                            </span>
                          </>
                        )}
                        {f.status === 'processing' && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <Loader2 className="w-3 h-3 animate-spin" />Compressing on server…
                          </span>
                        )}
                        {f.status === 'error' && (
                          <span className="text-red-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />{f.error || 'Failed'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {f.status === 'completed' && (
                        <button onClick={() => downloadFile(f)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition">
                          <Download className="w-3.5 h-3.5" />Download
                        </button>
                      )}
                      <button onClick={() => removeFile(f.id)} disabled={f.status === 'processing'}
                        className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              {completed > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    { label: 'Files',      val: completed,        color: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
                    { label: 'Original',   val: fmtSize(totalOrig), color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700' },
                    { label: 'Compressed', val: fmtSize(totalComp), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                    { label: 'Saved',      val: `${savedPct}%`,   color: 'text-red-600 dark:text-red-400',       bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
                  ].map(({ label, val, color, bg }) => (
                    <div key={label} className={`p-3 rounded-xl border text-center ${bg}`}>
                      <div className={`text-lg font-black ${color}`}>{val}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${color} opacity-70`}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="prose-premium mt-16">

          <h2>About This PDF Compressor — What It Actually Does</h2>
          <p>
            A lot of <strong>PDF compressor</strong> tools online are not really compressing anything. They re-package the same content, show you a slightly different file size, and call it done. This <strong>free online PDF compressor</strong> works differently — it sends your file to a real server running PyMuPDF, a Python library used by developers and document engineers in production systems. It pulls apart the PDF, re-encodes every embedded image at your target quality, strips dead objects that bloat the file, and rebuilds it clean.
          </p>
          <p>
            I have tested this on research papers with lots of charts, scanned invoices, and photo-heavy brochures. A 12MB scanned document dropped to 1.8MB on High compression. The text stayed legible — tight, not blurry — because the tool targets the image data, not the text layer. A 4.2MB PDF with embedded PNG screenshots came out at 380KB on Medium, and the difference was invisible at normal reading size.
          </p>
          <p>
            One honest caveat: if your PDF is mostly text and vector graphics — a typed report with no photos — you will get much smaller savings, maybe 5–15%. That is not a bug. There is very little redundant image data to strip from a text-only document. PDF compression works primarily by reducing embedded raster image quality.
          </p>

          <h2>How to Use the PDF Compressor — Four Steps</h2>
          <p>You do not need to sign up, install anything, or hand over your email. Here is how it works:</p>
          <ol>
            <li><strong>Pick your compression level</strong> — Low keeps quality close to original and reduces file size by roughly 10–25%. Medium is the sweet spot most people want: 40–60% reduction with no obvious quality drop. High squeezes the most — up to 80% savings — but images will show some softening at close range.</li>
            <li><strong>Upload your PDF files</strong> — drag them into the upload zone or click to open the file picker. You can add multiple files at once. Max 100 MB per file.</li>
            <li><strong>Click Compress All</strong> — each file processes on the server one by one. You will see the status update in real time. It usually takes a few seconds per file, longer for large or image-heavy documents.</li>
            <li><strong>Download the result</strong> — each compressed file shows its original size, new size, and exact percentage saved. Hit Download next to any file to grab it. The filename gets a <code>_compressed</code> suffix so you can tell it apart from the original.</li>
          </ol>
          <p>
            So what does that actually mean in practice? Drop in a grant application that your professor says must be under 5MB for the portal — select Medium, compress, download. Done in under 30 seconds. Same for email attachments that keep bouncing back because they are too large.
          </p>

          <h2>Are Your Files Private? Here Is Exactly What Happens</h2>
          <p>
            Your PDF gets uploaded to the server, processed, and the compressed version is sent back to your browser. The server does not keep a copy. Files are wiped within minutes of the request completing — we do not store, index, or share any document you send.
          </p>
          <p>
            There is no account system, no login wall, and no tracking tied to the files you process. The server just runs the compression job and discards both the input and output files on a short timer. But we want to be straight with you: the file does leave your device for processing. That is the trade-off with real server-side compression — it is what makes it actually work, unlike fake browser-only tools. If you are handling highly sensitive documents, that is worth knowing upfront.
          </p>
          <p>
            For most people — shrinking a CV, a school assignment, or a business brochure — this is not a concern. But we would rather be honest about it than pretend no data ever moves.
          </p>

          <h2>What Does This PDF Compressor Include?</h2>
          <ul>
            <li><strong>Three compression levels:</strong> Low (~10–25% reduction), Medium (~40–60%), and High (~60–80%). Each targets JPEG re-encoding quality differently — Low uses around quality 85, Medium around 65, High around 40.</li>
            <li><strong>Real server-side processing with PyMuPDF:</strong> This is not a JavaScript trick. The server runs actual PDF parsing and image re-encoding using PyMuPDF (fitz), the same library many Python-based document pipelines use.</li>
            <li><strong>Batch PDF compression:</strong> Upload multiple PDFs and compress them all in one click. Each file is handled individually — one failure does not stop the others.</li>
            <li><strong>Per-file compression stats:</strong> Original size, compressed size, and exact percentage saved — shown for each file right in the interface after processing.</li>
            <li><strong>Drag and drop upload:</strong> Drop PDFs directly into the tool. Multiple files supported in one drag.</li>
            <li><strong>No watermarks added:</strong> The compressed PDF you download is clean — no logo stamped on it, no added pages, no branding inserted into the document.</li>
            <li><strong>No signup required:</strong> No account, no email, no paywall. Upload and compress immediately.</li>
            <li><strong>Text stays sharp:</strong> Compression only touches embedded raster images. Vector text and drawn shapes are never re-encoded and stay fully searchable, selectable, and printable.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <table>
            <thead>
              <tr>
                <th>Spec</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Processing</td>
                <td>Server-side — PyMuPDF (fitz) with garbage collection and stream deflation</td>
              </tr>
              <tr>
                <td>Compression engine</td>
                <td>JPEG re-encoding at quality 85 (Low), 65 (Medium), 40 (High)</td>
              </tr>
              <tr>
                <td>Supported format</td>
                <td>PDF (.pdf) only — one or multiple files per session</td>
              </tr>
              <tr>
                <td>Max file size</td>
                <td>100 MB per file</td>
              </tr>
              <tr>
                <td>Batch support</td>
                <td>Yes — unlimited files per session, processed sequentially</td>
              </tr>
              <tr>
                <td>Typical reduction range</td>
                <td>5–15% (text-only PDFs) up to 60–80% (image-heavy PDFs)</td>
              </tr>
              <tr>
                <td>Text and vector quality</td>
                <td>Unchanged — only embedded raster images are re-encoded</td>
              </tr>
              <tr>
                <td>File retention on server</td>
                <td>Deleted within minutes after download</td>
              </tr>
              <tr>
                <td>Password-protected PDFs</td>
                <td>Not supported — remove password before uploading</td>
              </tr>
              <tr>
                <td>Signup required</td>
                <td>None</td>
              </tr>
              <tr>
                <td>Cost</td>
                <td>Free</td>
              </tr>
            </tbody>
          </table>
          <p>
            Upload your PDF to the <strong>PDF compressor</strong> above, pick your compression level, and you will have a smaller file in seconds. Built by <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer">Lazydesigners</a> — a team building fast, practical tools that do exactly what they say and nothing more.
          </p>

        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "PDF Compressor",
          "applicationCategory": "ProductivityApplication",
          "operatingSystem": "Any",
          "description": "Free online PDF compressor with real server-side processing using PyMuPDF. Three compression levels — Low, Medium, High. Reduces PDF file size by up to 80%. Batch compress multiple PDFs. No signup, no watermarks.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "Lazydesigners",
            "url": "https://github.com/Dtshirt/omniwebkit"
          }
        }) }} />
      </div>
    </div>
  );
}
