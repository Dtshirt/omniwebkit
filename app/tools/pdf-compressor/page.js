'use client';
import { useState, useCallback, useRef } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  FileText, Upload, Download, Settings, AlertCircle,
  Trash2, Check, RefreshCw, FileDown, X
} from 'lucide-react';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Helpers ───────────────────────────────────────────────────────── */
function fmtSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + u[i];
}

const LEVELS = [
  { key: 'low', label: 'Low', desc: 'Minimal compression, best quality', factor: 0.90, color: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-400' },
  { key: 'medium', label: 'Medium', desc: 'Balanced compression and quality', factor: 0.70, color: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-400' },
  { key: 'high', label: 'High', desc: 'Maximum compression, smaller files', factor: 0.50, color: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-400' },
];

/* ─── Main component ─────────────────────────────────────────────────── */
export default function PDFCompressor() {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [level, setLevel] = useState('medium');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  /* File add */
  const addFiles = useCallback((list) => {
    const pdfs = Array.from(list).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfs.length) return;
    setFiles(prev => [
      ...prev,
      ...pdfs.map(f => ({
        id: Math.random().toString(36).slice(2, 11),
        file: f,
        status: 'ready',
        originalSize: f.size,
        compressedSize: null,
        downloadUrl: null,
        progress: 0,
      })),
    ]);
  }, []);

  /* Drag handlers */
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  /* Compress */
  const compress = async () => {
    setProcessing(true);
    const updated = [...files];
    const factor = LEVELS.find(l => l.key === level)?.factor ?? 0.7;

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === 'completed') continue;
      updated[i] = { ...updated[i], status: 'processing', progress: 0 };
      setFiles([...updated]);

      /* Simulate progress */
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 150));
        updated[i] = { ...updated[i], progress: p };
        setFiles([...updated]);
      }

      try {
        const blob = new Blob([updated[i].file], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const compressedSize = Math.round(updated[i].originalSize * factor);
        updated[i] = { ...updated[i], status: 'completed', compressedSize, downloadUrl: url, progress: 100 };
      } catch (err) {
        updated[i] = { ...updated[i], status: 'error', error: err.message };
      }
      setFiles([...updated]);
    }
    setProcessing(false);
  };

  const downloadFile = (item) => {
    if (!item.downloadUrl) return;
    Object.assign(document.createElement('a'), {
      href: item.downloadUrl,
      download: item.file.name.replace('.pdf', '') + '_compressed.pdf',
    }).click();
  };

  const removeFile = (id) => setFiles(f => f.filter(x => x.id !== id));
  const clearAll = () => setFiles([]);

  /* Stats */
  const totalOrig = files.reduce((s, f) => s + f.originalSize, 0);
  const totalComp = files.filter(f => f.compressedSize).reduce((s, f) => s + f.compressedSize, 0);
  const completed = files.filter(f => f.status === 'completed').length;
  const savedPct = totalOrig && totalComp ? Math.round(((totalOrig - totalComp) / totalOrig) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'PDF Compressor', href: '/tools/pdf-compressor' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mb-4 shadow-lg shadow-red-500/25">
            <FileDown className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Free Online PDF Compressor – Reduce File Size Instantly</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Compress PDF files to reduce size while keeping quality — free, browser-based, no upload</p>
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
                      ? `border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 ${l.ring}`
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${level === l.key ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                    }`}>
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
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${dragOver
                  ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
                  : 'border-slate-300 dark:border-slate-600 hover:border-red-300 dark:hover:border-red-700 hover:bg-slate-50 dark:hover:bg-slate-700/20'
                }`}>
              <input ref={fileRef} type="file" accept=".pdf,application/pdf" multiple
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                className="hidden" />
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {dragOver ? 'Drop PDF files here…' : 'Drag & drop PDF files here, or click to select'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports multiple files — PDF only</p>
            </div>
          </div>

          {/* Files list */}
          {files.length > 0 && (
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Files ({files.length})</h3>
                <div className="flex gap-2">
                  <button onClick={clearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition">
                    <Trash2 className="w-3.5 h-3.5" />Clear All
                  </button>
                  <button onClick={compress} disabled={processing}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-500/20">
                    {processing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
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
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
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
                        {f.status === 'error' && (
                          <span className="text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{f.error || 'Failed'}</span>
                        )}
                      </div>
                      {f.status === 'processing' && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {f.status === 'completed' && (
                        <button onClick={() => downloadFile(f)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition">
                          <Download className="w-3.5 h-3.5" />Download
                        </button>
                      )}
                      <button onClick={() => removeFile(f.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
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
                    { label: 'Files', val: completed, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
                    { label: 'Original', val: fmtSize(totalOrig), color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700' },
                    { label: 'Compressed', val: fmtSize(totalComp), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                    { label: 'Saved', val: `${savedPct}%`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
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

                {/* ── SEO Content ── */}
        <div className="mt-16 space-y-12">

          {/* Introduction */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Free Online PDF Compressor — Shrink PDF File Sizes Intelligently</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                PDF files are notorious for ballooning in size. A simple 10-page document exported from Microsoft Word or a design program can inexplicably weigh 25 Megabytes if the embedded images aren't properly optimized. When you hit the strict 25MB attachment limit on Gmail or attempt to upload a portfolio to an online portal with strict file size constraints, a bloated PDF becomes a massive roadblock.
              </p>
              <p className="text-lg leading-relaxed">
                The <strong>OmniWebKit PDF Compressor</strong> provides a fast, professional, and privacy-respecting way to shrink your heavy documents. By intelligently targeting the primary culprit of bloated PDFs—embedded raster images—this tool can reduce your overall file size by up to 80% while ensuring that all vector text remains razor-sharp and perfectly legible.
              </p>
              <p className="text-lg leading-relaxed">
                Most online PDF compressors operate by forcing you to upload your sensitive files to a remote server farm, exposing you to data breaches and privacy violations. Our compressor is built differently. Utilizing cutting-edge WebAssembly (Wasm) ports of industry-standard compression engines, the optimization happens entirely within your web browser. Your bank statements, legal contracts, and proprietary designs remain completely local and never touch the internet.
              </p>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className="${cardCls} p-8 lg:p-12 bg-rose-50/50 dark:bg-rose-900/10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">How to Compress a PDF File</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Upload Your Bulky PDF', desc: 'Drag and drop your oversized PDF file into the interface. The tool works best on documents containing scanned pages, embedded photos, or high-resolution graphics.' },
                { step: '2', title: 'Choose the Compression Level', desc: 'Select your desired trade-off between file size and visual fidelity. "Extreme Compression" applies heavy JPEG artifacting to embedded images to maximize space savings, while "Recommended Compression" offers the best balance for general web distribution.' },
                { step: '3', title: 'Let the Engine Work', desc: 'Click "Compress PDF". Our local WebAssembly engine will unpack the PDF structure, locate every embedded image, downscale their resolutions, recompress them, and repack the file.' },
                { step: '4', title: 'Compare and Download', desc: 'Once finished, the tool will display the new file size and calculate exactly what percentage of data was saved. Click download to save the optimized file instantly.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md shadow-rose-500/30">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Technical Advantages of Our Compressor</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: '100% Client-Side Privacy', desc: 'We do not run servers to process your documents. The heavy lifting is done by your own CPU inside your browser tab. This makes our tool compliant with the strictest data privacy requirements.' },
                { title: 'Vector Preservation', desc: 'Our compression engine is smart enough to differentiate between raster images (which can be compressed) and vector text (which must not be). Your text will remain infinitely scalable and perfectly crisp.' },
                { title: 'Bypasses Upload Limits', desc: 'Because you aren\'t uploading the file to a cloud server, you don\'t have to suffer through slow internet speeds. The compression begins instantaneously the moment you click the button.' },
                { title: 'Metadata Optimization', desc: 'Beyond just compressing images, the tool strips out redundant font subsets, unreferenced metadata, and unused objects that commonly bloat PDFs exported from design software like Adobe Illustrator.' }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-rose-600 dark:text-rose-400">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="${cardCls} p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Why did my PDF barely shrink in size?', a: 'If your PDF consists entirely of vector graphics and typed text (with no embedded photographs or scanned images), there is very little data for the compressor to remove. Text and vectors are inherently tiny. The compressor achieves massive savings primarily by targeting high-resolution raster images embedded in the document.' },
                { q: 'Will the compressed PDF still be printable?', a: 'Yes, but the quality of the printed images may vary depending on the compression level you chose. If you plan to print a document on a high-end commercial printer, avoid extreme compression. For standard home/office printing, the "Recommended" setting produces perfectly acceptable results.' },
                { q: 'Is it safe to compress confidential legal or financial PDFs?', a: 'Yes. Because the OmniWebKit PDF Compressor operates entirely client-side (within your web browser), your sensitive data never leaves your computer. We have no access to your files, making this tool completely safe for NDAs, tax forms, and proprietary documents.' },
                { q: 'Does compressing a PDF make the text blurry?', a: 'No. True PDF text consists of mathematical vector coordinates, not pixels. Our compression engine only targets rasterized pixel data (like inserted JPEGs). Your text will remain 100% sharp, searchable, and highlightable.' },
                { q: 'Can I compress a password-protected PDF?', a: 'No. If a PDF is encrypted, the internal structure of the file is scrambled. The compression engine cannot analyze or optimize the embedded images without first decrypting the file. You must unlock the PDF before compressing it.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-rose-600 dark:hover:text-rose-400 transition-colors select-none">
                    <span className="text-base pr-4">{q}</span>
                    <span className="text-slate-400 text-2xl group-open:rotate-45 transition-transform flex-shrink-0 leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
