'use client';
import { useState, useCallback, useRef } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  FileText, Plus, Download, Trash2, ArrowUp, ArrowDown, Shuffle,
  Settings, AlertCircle, CheckCircle, Merge, Eye, Upload, RefreshCw, X
} from 'lucide-react';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm w-full';

/* ─── Toggle ─────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} type="button"
      className={`relative w-10 h-5 rounded-full transition flex-shrink-0 ${checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────────── */
function fmtSize(b) {
  if (!b) return '0 B';
  const k = 1024, u = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(1) + ' ' + u[i];
}

/* ─── Main ──────────────────────────────────────────────────────────── */
export default function PDFMerger() {
  const [files, setFiles] = useState([]);
  const [merging, setMerging] = useState(false);
  const [mergedPDF, setMergedPDF] = useState(null);
  const [loadingPages, setLoadingPages] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [notification, setNotification] = useState(null);
  const [settings, setSettings] = useState({ addBookmarks: true, preserveMetadata: true, optimizeSize: false });
  const fileRef = useRef(null);

  const notify = useCallback((msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  /* Actions */
  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setMergedPDF(null);
  };

  const clearAll = () => {
    setFiles([]);
    setMergedPDF(null);
  };

  const moveFile = (id, dir) => {
    setFiles(prev => {
      const idx = prev.findIndex(f => f.id === id);
      if (idx === -1) return prev;
      const newFiles = [...prev];
      const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newFiles.length) return prev;
      [newFiles[idx], newFiles[targetIdx]] = [newFiles[targetIdx], newFiles[idx]];
      return newFiles;
    });
  };

  const shuffleFiles = () => {
    setFiles(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  const previewPDF = (fileObj) => {
    const url = URL.createObjectURL(fileObj.file);
    window.open(url, '_blank');
  };

  /* Read page count */
  const getPageCount = async (file) => {
    try {
      const { PDFDocument } = await import('pdf-lib');
      const doc = await PDFDocument.load(await file.arrayBuffer());
      return doc.getPageCount();
    } catch { return 0; }
  };

  /* Add files */
  const addFiles = useCallback(async (list) => {
    const pdfs = Array.from(list).filter(f => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    if (!pdfs.length) return;
    setLoadingPages(true);
    const newFiles = [];
    for (const f of pdfs) {
      const pages = await getPageCount(f);
      newFiles.push({
        id: Math.random().toString(36).slice(2, 11),
        file: f, name: f.name, size: f.size, pages,
        status: pages > 0 ? 'ready' : 'error',
      });
    }
    setFiles(prev => [...prev, ...newFiles]);
    setLoadingPages(false);
    notify(`Added ${pdfs.length} PDF file(s)`);
  }, [notify]);

  /* Drag handlers */
  const onDrop = (e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); };

  const downloadMerged = () => {
    if (!mergedPDF) return;
    Object.assign(document.createElement('a'), { href: mergedPDF.url, download: 'merged_document.pdf' }).click();
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      notify('Please add at least 2 PDF files to merge', 'error');
      return;
    }
    setMerging(true);
    setMergedPDF(null);

    try {
      const { PDFDocument } = await import('pdf-lib');
      const mergedDoc = await PDFDocument.create();

      if (settings.preserveMetadata) {
        mergedDoc.setTitle('Merged Document');
        mergedDoc.setAuthor('OmniWebKit PDF Merger');
        mergedDoc.setCreator('omniwebkit.com');
      }

      for (const f of files) {
        if (f.status === 'error') continue;
        const arrayBuffer = await f.file.arrayBuffer();
        const doc = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach(p => mergedDoc.addPage(p));
      }

      const pdfBytes = await mergedDoc.save({
        useObjectStreams: settings.optimizeSize
      });

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      setMergedPDF({
        url: URL.createObjectURL(blob),
        size: blob.size,
        pageCount: mergedDoc.getPageCount(),
        fileCount: files.length
      });

      notify('PDFs merged successfully!');
    } catch (err) {
      console.error('Merge error:', err);
      notify('Failed to merge PDFs. The file might be corrupted or protected.', 'error');
    } finally {
      setMerging(false);
    }
  };

  const totalPages = files.reduce((s, f) => s + (f.pages || 0), 0);
  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const isLargePayload = totalSize > 100 * 1024 * 1024; // 100MB

  const statusIcon = (st) => {
    if (st === 'processing') return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    if (st === 'completed') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (st === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <FileText className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'PDF Merger', href: '/tools/pdf-merger' }]} />
        <input ref={fileRef} type="file" accept=".pdf,application/pdf" multiple className="hidden"
          onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />

        {/* Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-bold shadow-lg ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
            {notification.type === 'error' ? <X className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}{notification.msg}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <Merge className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Free Online PDF Merger</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Combine multiple PDF files into a single document using our smart Hybrid Local/Cloud engine</p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-5">

          {/* Sidebar */}
          <div>
            <div className={`${cardCls} p-5 lg:sticky lg:top-24`}>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-violet-500" />Merge Settings
              </p>

              <div className="space-y-3 mb-5">
                {[
                  { key: 'addBookmarks', label: 'Add Metadata', desc: 'Include creator/date info' },
                  { key: 'preserveMetadata', label: 'Preserve Metadata', desc: 'Keep OmniWebKit stamp' },
                  { key: 'optimizeSize', label: 'Optimize Size', desc: 'Use object streams' },
                ].map(s => (
                  <div key={s.key} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{s.label}</p>
                      <p className="text-[10px] text-slate-400">{s.desc}</p>
                    </div>
                    <Toggle checked={settings[s.key]} onChange={v => setSettings(p => ({ ...p, [s.key]: v }))} />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <button onClick={mergePDFs} disabled={merging || files.length < 2 || loadingPages}
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-500/20 transition disabled:opacity-50">
                  {merging ? <RefreshCw className="w-4 h-4 animate-spin" /> : loadingPages ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Merge className="w-4 h-4" />}
                  {merging ? (isLargePayload ? 'Queued & Merging…' : 'Merging…') : loadingPages ? 'Reading…' : `Merge PDFs (${files.length})`}
                </button>
                {files.length > 1 && (
                  <button onClick={shuffleFiles}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition">
                    <Shuffle className="w-3.5 h-3.5" />Shuffle Order
                  </button>
                )}
                {files.length > 0 && (
                  <button onClick={clearAll}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-xs font-bold transition">
                    <Trash2 className="w-3.5 h-3.5" />Clear All
                  </button>
                )}
              </div>

              {/* Stats */}
              {files.length > 0 && (
                <div className="mt-5 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-2">Statistics</p>
                  {[
                    { l: 'Files', v: files.length },
                    { l: 'Total Size', v: fmtSize(totalSize) },
                    { l: 'Total Pages', v: loadingPages ? '…' : totalPages },
                  ].map(s => (
                    <div key={s.l} className="flex justify-between text-xs py-0.5">
                      <span className="text-slate-500 dark:text-slate-400">{s.l}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{s.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main */}
          <div className="space-y-5">

            {/* Upload */}
            <div className={`${cardCls} p-5`}>
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${dragOver
                    ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10'
                    : 'border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-slate-50 dark:hover:bg-slate-700/20'
                  }`}>
                <Plus className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  {dragOver ? 'Drop PDF files here…' : 'Drag & drop PDF files, or click to select'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pages counted automatically • Real PDF processing</p>
              </div>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                    Files to Merge ({files.length})
                  </h3>
                  <p className="text-[10px] text-slate-400">Merged in this order ↓</p>
                </div>
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={f.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                      {/* Order */}
                      <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0">
                        {i + 1}
                      </div>
                      {/* Status + Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {statusIcon(f.status)}
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{f.name}</p>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {fmtSize(f.size)}
                          {f.status === 'error'
                            ? <span className="text-red-500 ml-1">• Error reading file</span>
                            : <span className="ml-1">• <span className="font-bold">{f.pages}</span> pages</span>
                          }
                        </p>
                      </div>
                      {/* Actions */}
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button onClick={() => previewPDF(f)} title="Preview"
                          className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveFile(f.id, 'up')} disabled={i === 0} title="Move up"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-30">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => moveFile(f.id, 'down')} disabled={i === files.length - 1} title="Move down"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-30">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => removeFile(f.id)} title="Remove"
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Merged result */}
            {mergedPDF && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold text-emerald-700 dark:text-emerald-400">PDF Successfully Merged!</h3>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">merged_document.pdf</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{fmtSize(mergedPDF.size)} • {mergedPDF.pageCount} pages • {mergedPDF.fileCount} files merged</p>
                  </div>
                  <button onClick={downloadMerged}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition">
                    <Download className="w-3.5 h-3.5" />Download PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="prose-premium">
          <h2>About the Tool: Free Online PDF Merger</h2>
          <p>
            Managing digital paperwork is often a scattered mess. You get an invoice here, a signed contract there, and a spec sheet in another thread. Sending a disorganized string of five separate PDF attachments looks unprofessional. It invites confusion.
          </p>
          <p>
            The <strong>OmniWebKit PDF Merger</strong> is the easiest way to solve document fragmentation. This free, browser-based tool lets you combine multiple PDF files into a single document. Whether you're assembling a legal dossier, a student portfolio, or compiling tax returns, you can unify your files in seconds. I built this tool to handle the heavy lifting without making you jump through hoops or pay for bloated software.
          </p>

          <h2>Privacy &amp; Security Anchor: 100% Local Processing</h2>
          <p>
            Security is non-negotiable when dealing with PDFs. They frequently contain highly sensitive information.
          </p>
          <p>
            Our PDF Merger runs directly in your browser. <strong>Your files never leave your device.</strong> We use modern JavaScript to process everything right in your local memory. There are zero server uploads. That means total privacy and instant merging. Once you close the tab, your data is gone forever.
          </p>

          <h2>How to Use the PDF Merger</h2>
          <ol>
            <li><strong>Drop your files:</strong> Drag your PDF files into the upload zone, or click to browse your computer.</li>
            <li><strong>Set the order:</strong> Use the arrow buttons to rearrange your files. The file at the top becomes the first part of your new PDF.</li>
            <li><strong>Merge and save:</strong> Click the "Merge PDFs" button. The tool stitches the pages together instantly. Then, click download to save your new file.</li>
          </ol>

          <h2>Features</h2>
          <ul>
            <li><strong>Flawless Formatting:</strong> Merging shouldn't break your documents. This engine preserves your original fonts, vector paths, embedded images, and exact page layouts.</li>
            <li><strong>Interactive Sorting:</strong> Visualizing your document order matters. The clean interface lets you easily sort dozens of files into perfect chronological order.</li>
            <li><strong>Lightning Fast Execution:</strong> Since you aren't waiting for a server upload, the speed is bound only by your computer. You can combine a hundred pages in milliseconds.</li>
            <li><strong>Metadata Controls:</strong> Choose to keep the original metadata or optimize the file size for smaller downloads.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 dark:border-slate-700 py-2 font-bold text-slate-900 dark:text-white">Specification</th>
                  <th className="border-b border-slate-200 dark:border-slate-700 py-2 font-bold text-slate-900 dark:text-white">Capability</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400"><strong>Processing Method</strong></td>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400">100% Client-side (Browser-based)</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400"><strong>Max File Size</strong></td>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400">Bound by local RAM (Typically 100MB+)</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400"><strong>Input Formats</strong></td>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400">Standard PDF (.pdf)</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400"><strong>Performance</strong></td>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400">Supports batch processing of 50+ files</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400"><strong>Output Quality</strong></td>
                  <td className="border-b border-slate-200 dark:border-slate-700 py-2 text-slate-600 dark:text-slate-400">100% Lossless (Exact page copies)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <hr className="my-8 border-slate-200 dark:border-slate-700" />
          
          <p className="text-sm italic">
            Engineered by Christopher at <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer">Lazydesigners</a> – Focused on secure, client-side web utilities.
          </p>
        </div>
      </div>
    </div>
  );
}
