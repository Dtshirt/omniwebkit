"use client";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import { UploadCloud, Loader2, CheckCircle2, Download, Zap, Server, FileText, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";

const CLIENT_MAX = 10 * 1024 * 1024; // 10MB
const POLL_MS = 2500;

// ─── Parse page range "1-3,5,7-9" → 0-indexed array ──────────────────────────
function parseRange(str, total) {
  const pages = [];
  for (const part of str.split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-").map(Number);
      for (let i = Math.max(1, a); i <= Math.min(total, b); i++) pages.push(i - 1);
    } else {
      const n = Number(p) - 1;
      if (n >= 0 && n < total) pages.push(n);
    }
  }
  return [...new Set(pages)];
}

// ─── Browser-side PDF splitting using pdf-lib ─────────────────────────────────
async function browserSplitRange(arrayBuffer, pageIndices) {
  const { PDFDocument } = await import("pdf-lib");
  const src = await PDFDocument.load(arrayBuffer);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pageIndices);
  copied.forEach(p => out.addPage(p));
  const bytes = await out.save();
  return new Blob([bytes], { type: "application/pdf" });
}

async function browserSplitChunks(arrayBuffer, chunkSize, totalPages) {
  const { PDFDocument } = await import("pdf-lib");
  const src = await PDFDocument.load(arrayBuffer);
  const blobs = [];
  for (let start = 0; start < totalPages; start += chunkSize) {
    const indices = [];
    for (let i = start; i < Math.min(start + chunkSize, totalPages); i++) indices.push(i);
    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, indices);
    copied.forEach(p => out.addPage(p));
    const bytes = await out.save();
    blobs.push({ blob: new Blob([bytes], { type: "application/pdf" }), indices });
  }
  return blobs;
}

async function getPdfPageCount(arrayBuffer) {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(arrayBuffer);
  return doc.getPageCount();
}

export default function PdfSplitterClient() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [arrayBuf, setArrayBuf] = useState(null);
  const [mode, setMode] = useState("range");         // range | chunks | pages
  const [rangeStr, setRangeStr] = useState("1-1");
  const [chunkSize, setChunkSize] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]); // { blob, label }
  const [error, setError] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);

  const isClientCapable = file && file.size <= CLIENT_MAX;
  const processingMode = file ? (isClientCapable ? "client" : "server") : null;

  // ─── File selection ─────────────────────────────────────────────────────────
  const handleFile = async (f) => {
    if (!f || !f.name.toLowerCase().endsWith(".pdf")) { toast.error("Please select a PDF file."); return; }
    setFile(f); setResults([]); setError(null); setProgress(0); setPageCount(0); setArrayBuf(null);
    try {
      const buf = await f.arrayBuffer();
      setArrayBuf(buf);
      const count = await getPdfPageCount(buf.slice(0));
      setPageCount(count);
      setRangeStr(`1-${count}`);
      setChunkSize(Math.max(1, Math.ceil(count / 2)));
    } catch { setPageCount(0); }
  };

  // ─── Execute ────────────────────────────────────────────────────────────────
  const handleSplit = async () => {
    if (!file || loading) return;
    setLoading(true); setError(null); setResults([]); setProgress(0);

    try {
      if (processingMode === "client") {
        if (mode === "chunks") {
          const n = Math.max(1, parseInt(chunkSize));
          const blobs = await browserSplitChunks(arrayBuf.slice(0), n, pageCount);
          setResults(blobs.map((b, i) => ({
            blob: b.blob,
            label: `Part ${i + 1} (pp. ${b.indices[0]+1}–${b.indices[b.indices.length-1]+1})`,
            filename: `part_${String(i+1).padStart(3,"0")}.pdf`,
          })));
        } else {
          const indices = parseRange(rangeStr, pageCount);
          if (!indices.length) throw new Error("No valid pages in range.");
          const blob = await browserSplitRange(arrayBuf.slice(0), indices);
          setResults([{ blob, label: `Pages ${rangeStr} (${indices.length} pages)`, filename: "extracted_pages.pdf" }]);
        }
        toast.success("PDF split instantly in browser!");
      } else {
        // Server path
        setProgress(5);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("mode", mode);
        fd.append("param", mode === "chunks" ? String(chunkSize) : rangeStr);
        const res = await fetch("http://localhost:8000/api/v1/tools/pdf-split", { method: "POST", body: fd });
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }
        const { job_id } = await res.json();
        setProgress(15);
        for (;;) {
          await new Promise(r => setTimeout(r, POLL_MS));
          const sr = await fetch(`http://localhost:8000/api/v1/jobs/${job_id}`);
          const job = await sr.json();
          if (job.progress) setProgress(parseInt(job.progress));
          if (job.status === "failed") throw new Error(job.error || "Processing failed.");
          if (job.status === "done") {
            const dl = await fetch(`http://localhost:8000/api/v1/download/${job_id}`);
            const blob = await dl.blob();
            const isZip = mode === "chunks";
            setResults([{
              blob,
              label: isZip ? `${job.chunk_count || "?"} PDF chunks (ZIP)` : `${job.page_count || "?"} pages extracted`,
              filename: isZip ? "pdf_chunks.zip" : "extracted_pages.pdf",
            }]);
            toast.success("PDF split complete!"); break;
          }
        }
      }
    } catch (err) { setError(err.message); toast.error(err.message); }
    finally { setLoading(false); }
  };

  const downloadResult = (r) => saveAs(r.blob, r.filename);

  const faqs = [
    { q: "How does browser-based splitting work?", a: "For PDFs under 10MB, a pure JavaScript PDF library runs entirely in your browser — no upload needed. It reads the PDF's cross-reference table, extracts the requested page objects, and writes a new minimal PDF file locally." },
    { q: "What triggers server processing?", a: "PDFs over 10MB are processed server-side. The server worker opens the PDF, builds the requested page selection, and writes the output. Chunk mode always produces a ZIP archive containing numbered PDF parts." },
    { q: "What page range format should I use?", a: 'Use commas to separate selections and hyphens for ranges. Examples: "1-3" extracts pages 1, 2, 3. "1,3,5" extracts those three specific pages. "1-3,7,10-12" combines both.' },
    { q: "Does it preserve PDF quality?", a: "Yes — pages are copied at the structural level without any re-encoding or rasterization. Text remains selectable, images stay at full resolution, and fonts are preserved exactly as in the original." },
  ];

  const MODES = [
    { id: "range", label: "Page Range", desc: "e.g. 1-3, 5, 8-10 → single PDF" },
    { id: "chunks", label: "Every N Pages", desc: "Split into equal chunks → ZIP" },
    { id: "pages", label: "Extract Pages", desc: "Specific pages → single PDF" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-sky-900 via-blue-900 to-indigo-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[75%] rounded-full bg-sky-400 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[50%] rounded-full bg-blue-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-300">Splitter</span>
          </h1>
          <p className="text-lg text-sky-100 max-w-2xl mx-auto font-light">
            Split any PDF by page range, every N pages, or extract specific pages. Small PDFs processed instantly in your browser.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">

          {/* Mode banner */}
          {processingMode && (
            <div className={`px-8 py-3 flex items-center gap-3 text-sm font-bold border-b ${processingMode === "client" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              {processingMode === "client"
                ? <><Zap className="w-4 h-4" />PDF split locally in your browser — no upload required</>
                : <><Server className="w-4 h-4" />Large PDF detected — server-side processing will be used</>
              }
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* Drop zone */}
            {!file ? (
              <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/40 transition-all rounded-2xl p-14 text-center flex flex-col items-center"
                onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-4"><FileText className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold mb-1">Drop your PDF here</h3>
                <p className="text-slate-500 text-sm mb-6">Any PDF file — up to 500MB</p>
                <div className="flex gap-3 text-xs mb-6">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold">≤ 10MB → Instant browser</span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold">&gt; 10MB → Server</span>
                </div>
                <label className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer transition-colors shadow-md">
                  Choose PDF File
                  <input type="file" className="hidden" accept=".pdf,application/pdf" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
                </label>
              </div>
            ) : (
              <>
                {/* File card */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size/1024/1024).toFixed(2)} MB{pageCount > 0 && ` · ${pageCount} pages`}</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setPageCount(0); setArrayBuf(null); setResults([]); }} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>

                {/* Mode tabs */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">Split Mode</p>
                  <div className="grid grid-cols-3 gap-3">
                    {MODES.map(m => (
                      <button key={m.id} onClick={() => setMode(m.id)}
                        className={`rounded-xl border-2 p-4 text-left transition-all ${mode === m.id ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-sky-200"}`}>
                        <p className="font-bold text-slate-800 text-sm">{m.label}</p>
                        <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mode-specific input */}
                {(mode === "range" || mode === "pages") && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">
                      Page Range {pageCount > 0 && <span className="text-slate-400 font-normal">(1–{pageCount})</span>}
                    </label>
                    <input type="text" value={rangeStr} onChange={e => setRangeStr(e.target.value)}
                      placeholder="e.g. 1-3, 5, 7-9"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-800 focus:ring-2 focus:ring-sky-400 outline-none" />
                    <p className="text-xs text-slate-400 mt-2">Use commas to separate; hyphens for ranges. Example: <code className="bg-slate-100 px-1 rounded">1-3, 5, 8-10</code></p>
                  </div>
                )}

                {mode === "chunks" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-slate-700">Pages Per Chunk</label>
                      <span className="text-sky-600 font-extrabold">{chunkSize} pages</span>
                    </div>
                    <input type="range" min={1} max={Math.max(1, pageCount)} value={chunkSize} onChange={e => setChunkSize(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-sky-600" />
                    {pageCount > 0 && (
                      <p className="text-xs text-slate-400 mt-2">
                        Will create <strong>{Math.ceil(pageCount / chunkSize)}</strong> PDF files
                        {processingMode === "server" && " — downloaded as a ZIP archive"}.
                      </p>
                    )}
                  </div>
                )}

                {/* Split button */}
                {!loading && !results.length && (
                  <button onClick={handleSplit}
                    className="w-full bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg">
                    <FileText className="w-6 h-6" />
                    Split PDF
                    <span className="text-sm opacity-70">({processingMode === "client" ? "browser" : "server"})</span>
                  </button>
                )}

                {loading && (
                  <div className="flex flex-col items-center py-6">
                    <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-4" />
                    <p className="font-bold text-slate-700 mb-4">{processingMode === "client" ? "Splitting in browser…" : "Server processing…"}</p>
                    {processingMode === "server" && (
                      <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                )}

                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

                {/* Results */}
                {results.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                      <p className="font-bold">Split complete — {results.length === 1 ? results[0].label : `${results.length} files`}</p>
                    </div>
                    {results.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-sky-500" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{r.label}</p>
                            <p className="text-xs text-slate-400">{(r.blob.size/1024).toFixed(0)} KB</p>
                          </div>
                        </div>
                        <button onClick={() => downloadResult(r)}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-colors">
                          <Download className="w-4 h-4" /> Download
                        </button>
                      </div>
                    ))}
                    <button onClick={() => { setResults([]); }} className="w-full text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors text-center">Split again with different settings</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4 text-sky-600"><Zap className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Instant Browser Splitting</h3>
            <p className="text-slate-600 text-sm leading-relaxed">For PDFs under 10MB, pages are extracted entirely in your browser by reading the PDF's page tree structure and writing a new minimal document — no server, no upload, no wait.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600"><Server className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Scalable Server Processing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Large PDFs are queued to a background worker that processes them with a high-performance PDF engine supporting encrypted, linearized, and complex multi-layer documents.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600"><FileText className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Zero Quality Loss</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Pages are copied at the structural level — text stays selectable, images keep full resolution, fonts are preserved, and interactive elements like links and form fields remain intact.</p>
          </div>
        </div>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {faq.q}
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-sky-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <div className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ${faqOpen === i ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"}`}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
