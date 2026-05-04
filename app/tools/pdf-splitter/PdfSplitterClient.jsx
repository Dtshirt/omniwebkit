"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { saveAs } from "file-saver";
import { UploadCloud, Loader2, CheckCircle2, Download, Zap, Server, FileText, Trash2, ChevronDown, ChevronUp, Check, Layers, Scissors, CheckSquare } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const CLIENT_MAX = 10 * 1024 * 1024; // 10MB
const POLL_MS = 2500;

// ─── Parse page range "1-3,5,7-9" → 0-indexed array ──────────────────────────
function parseRange(str, total) {
  const pages = [];
  for (const part of (str || "").split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-").map(Number);
      if (!isNaN(a) && !isNaN(b)) {
        for (let i = Math.max(1, a); i <= Math.min(total, b); i++) pages.push(i - 1);
      }
    } else {
      const n = Number(p) - 1;
      if (!isNaN(n) && n >= 0 && n < total) pages.push(n);
    }
  }
  return [...new Set(pages)].sort((a,b) => a - b);
}

function buildRangeString(indices) {
  if (!indices || !indices.length) return "";
  const sorted = [...new Set(indices)].sort((a,b) => a - b);
  const ranges = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i <= sorted.length; i++) {
    if (sorted[i] === prev + 1) {
      prev = sorted[i];
    } else {
      if (start === prev) ranges.push(`${start + 1}`);
      else ranges.push(`${start + 1}-${prev + 1}`);
      if (i < sorted.length) {
        start = sorted[i];
        prev = sorted[i];
      }
    }
  }
  if (start === prev) ranges.push(`${start + 1}`);
  else ranges.push(`${start + 1}-${prev + 1}`);
  
  return ranges.join(", ");
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

// ─── PdfPageThumbnail Component ─────────────────────────────────────────────
function PdfPageThumbnail({ pdfDoc, pageIndex, isSelected, isHighlighted, mode, chunkInfo, onClick }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '300px' });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || rendered || !pdfDoc || !canvasRef.current) return;
    
    let renderTask;
    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 0.5 }); // Low res for thumbnail
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTask = page.render({ canvasContext: ctx, viewport });
        await renderTask.promise;
        setRendered(true);
      } catch (err) {
        if (err.name !== "RenderingCancelledException") {
          console.error("Page render error:", err);
        }
      }
    };
    renderPage();
    return () => {
      if (renderTask) renderTask.cancel();
    };
  }, [isVisible, rendered, pdfDoc, pageIndex]);

  let ringClass = "ring-1 ring-slate-200 shadow-sm";
  let opacityClass = "opacity-100";

  if (mode === "pages") {
    if (isSelected) {
      ringClass = "ring-2 ring-sky-500 shadow-md";
      opacityClass = "opacity-100";
    } else {
      opacityClass = "opacity-50 hover:opacity-100 grayscale-[0.3]";
    }
  } else if (mode === "range") {
    if (isHighlighted) {
      ringClass = "ring-2 ring-sky-500 shadow-md";
      opacityClass = "opacity-100";
    } else {
      opacityClass = "opacity-30 grayscale-[0.5]";
    }
  } else if (mode === "chunks") {
    opacityClass = "opacity-100";
    // Alternate ring colors based on chunk to make chunks obvious
    if (chunkInfo && chunkInfo.chunkNum % 2 === 0) {
      ringClass = "ring-2 ring-indigo-400/50 shadow-sm";
    } else {
      ringClass = "ring-2 ring-sky-400/50 shadow-sm";
    }
  }

  const handleInteract = () => {
    if (mode === "pages" && onClick) onClick(pageIndex);
  };

  return (
    <div 
      ref={containerRef} 
      onClick={handleInteract}
      className={`relative flex flex-col items-center transition-all duration-200 ${mode === 'pages' ? 'cursor-pointer transform hover:-translate-y-1' : ''}`}
    >
      <div className={`relative bg-white w-full rounded overflow-hidden transition-all duration-300 ${ringClass} ${opacityClass}`}>
        {!rendered && (
          <div className="w-full aspect-[1/1.414] bg-slate-100 flex items-center justify-center animate-pulse">
            <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} className={`w-full h-auto ${!rendered ? 'hidden' : ''}`} />
        
        {/* Selection overlay for Extract Pages */}
        {mode === "pages" && isSelected && (
          <div className="absolute top-1 right-1 w-6 h-6 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-md z-10">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}
        
        {/* Hover overlay for Extract Pages */}
        {mode === "pages" && !isSelected && (
          <div className="absolute inset-0 bg-sky-500/0 hover:bg-sky-500/10 transition-colors z-10" />
        )}
      </div>
      
      <p className={`mt-2 text-xs font-bold transition-colors ${isSelected || isHighlighted ? 'text-sky-600' : 'text-slate-400'}`}>
        {pageIndex + 1}
      </p>

      {/* Chunk Divider Badge */}
      {mode === "chunks" && chunkInfo && chunkInfo.isFirstInChunk && pageIndex !== 0 && (
        <div className="absolute top-[50%] -left-3 -translate-y-1/2 w-1.5 h-10 bg-indigo-400 rounded-full shadow-sm" />
      )}
    </div>
  );
}

// ─── Main Client Component ──────────────────────────────────────────────────
export default function PdfSplitterClient() {
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [arrayBuf, setArrayBuf] = useState(null);
  const [mode, setMode] = useState("range");         // range | chunks | pages
  const [rangeStr, setRangeStr] = useState("1-1");
  const [chunkSize, setChunkSize] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);

  // PDFJS rendering state
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  // Load PDFJS dynamically
  useEffect(() => {
    import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      setPdfjsLib(pdfjs);
    });
  }, []);

  const isClientCapable = file && file.size <= CLIENT_MAX;
  const processingMode = file ? (isClientCapable ? "client" : "server") : null;

  // Render Document Proxy when arrayBuf changes
  useEffect(() => {
    if (pdfjsLib && arrayBuf) {
      let isSubscribed = true;
      const loadDoc = async () => {
        try {
          const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuf.slice(0)) });
          const doc = await loadingTask.promise;
          if (isSubscribed) setPdfDoc(doc);
        } catch (e) {
          console.error("PDF.js load error:", e);
        }
      };
      loadDoc();
      return () => { isSubscribed = false; };
    } else {
      setPdfDoc(null);
    }
  }, [pdfjsLib, arrayBuf]);

  // ─── File selection ─────────────────────────────────────────────────────────
  const handleFile = async (f) => {
    if (!f || !f.name.toLowerCase().endsWith(".pdf")) { toast.error("Please select a PDF file."); return; }
    setFile(f); setResults([]); setError(null); setProgress(0); setPageCount(0); setArrayBuf(null); setPdfDoc(null);
    try {
      const buf = await f.arrayBuffer();
      setArrayBuf(buf);
      const count = await getPdfPageCount(buf.slice(0));
      setPageCount(count);
      setRangeStr(`1-${count}`);
      setChunkSize(Math.max(1, Math.ceil(count / 4))); // Default to 4 chunks roughly
    } catch { setPageCount(0); }
  };

  const parsedIndices = useMemo(() => {
    if (mode === "chunks") return [];
    return parseRange(rangeStr, pageCount);
  }, [rangeStr, pageCount, mode]);

  const handleThumbnailClick = (pageIndex) => {
    const current = new Set(parsedIndices);
    if (current.has(pageIndex)) {
      current.delete(pageIndex);
    } else {
      current.add(pageIndex);
    }
    setRangeStr(buildRangeString(Array.from(current)));
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
          if (!indices.length) throw new Error("No valid pages selected.");
          const blob = await browserSplitRange(arrayBuf.slice(0), indices);
          setResults([{ blob, label: `Selected Pages (${indices.length} pages)`, filename: "extracted_pages.pdf" }]);
        }
        toast.success("PDF split instantly in browser!");
      } else {
        // Server path
        setProgress(5);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("mode", mode);
        fd.append("param", mode === "chunks" ? String(chunkSize) : rangeStr);
        const res = await fetch(`${API_V1}/tools/pdf-split`, { method: "POST", body: fd });
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }
        const { job_id } = await res.json();
        setProgress(15);
        for (;;) {
          await new Promise(r => setTimeout(r, POLL_MS));
          const sr = await fetch(`${API_V1}/jobs/${job_id}`);
          const job = await sr.json();
          if (job.progress) setProgress(parseInt(job.progress));
          if (job.status === "failed") throw new Error(job.error || "Processing failed.");
          if (job.status === "done") {
            const dl = await fetch(`${API_V1}/download/${job_id}`);
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
    { id: "pages", label: "Extract Pages", icon: CheckSquare, desc: "Click to select pages to extract" },
    { id: "range", label: "Page Range", icon: Scissors, desc: "Type range (e.g. 1-3, 5)" },
    { id: "chunks", label: "Split Chunks", icon: Layers, desc: "Divide into equal parts" },
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
            Visually extract pages, split by ranges, or divide PDFs into chunks. Instant visual preview and ultra-fast processing.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 -mt-8 relative z-20">
        {!file ? (
          /* Initial Upload View */
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16 p-12 text-center flex flex-col items-center">
            <div className="border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/40 transition-all rounded-3xl p-16 w-full max-w-3xl flex flex-col items-center"
              onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
              <div className="w-20 h-20 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-6 shadow-inner"><UploadCloud className="w-10 h-10" /></div>
              <h3 className="text-2xl font-extrabold mb-2 text-slate-800">Drag & Drop your PDF</h3>
              <p className="text-slate-500 text-base mb-8 max-w-sm">Securely split your PDF visually. Small files process instantly in your browser.</p>
              <label className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold py-4 px-10 rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Select PDF File
                <input type="file" className="hidden" accept=".pdf,application/pdf" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
              </label>
            </div>
          </div>
        ) : (
          /* Workspace View */
          <div className="grid md:grid-cols-12 gap-8 mb-16 items-start">
            
            {/* Left Column: Settings */}
            <div className="md:col-span-4 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden sticky top-8">
              {processingMode && (
                <div className={`px-6 py-3 flex items-center gap-2 text-xs font-bold border-b ${processingMode === "client" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
                  {processingMode === "client" ? <Zap className="w-3.5 h-3.5" /> : <Server className="w-3.5 h-3.5" />}
                  {processingMode === "client" ? "Instant Browser Processing" : "Server Processing Enabled"}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="overflow-hidden">
                    <p className="font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(file.size/1024/1024).toFixed(2)} MB · {pageCount} pages</p>
                  </div>
                  <button onClick={() => { setFile(null); setPageCount(0); setArrayBuf(null); setResults([]); setPdfDoc(null); }} className="text-slate-400 hover:text-red-500 transition-colors ml-4 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                </div>

                <div className="space-y-6">
                  {/* Mode Selector */}
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-3">Select Mode</label>
                    <div className="space-y-2">
                      {MODES.map(m => {
                        const Icon = m.icon;
                        const active = mode === m.id;
                        return (
                          <button key={m.id} onClick={() => { setMode(m.id); if (m.id === "pages" || m.id === "range") setRangeStr("1"); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${active ? "border-sky-500 bg-sky-50 shadow-sm" : "border-slate-100 hover:border-slate-300 bg-white"}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-500"}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className={`font-bold text-sm ${active ? "text-sky-900" : "text-slate-700"}`}>{m.label}</p>
                              <p className={`text-xs ${active ? "text-sky-600" : "text-slate-400"}`}>{m.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mode Specific Inputs */}
                  <div className="pt-4 border-t border-slate-100">
                    {mode === "pages" && (
                      <div className="bg-sky-50 text-sky-800 p-4 rounded-xl text-sm border border-sky-100">
                        <p className="font-bold mb-1 flex items-center gap-2"><CheckSquare className="w-4 h-4"/> Selection Mode</p>
                        <p className="opacity-80 leading-relaxed">Click on the page thumbnails on the right to select the exact pages you wish to extract into a new PDF.</p>
                      </div>
                    )}

                    {mode === "range" && (
                      <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">Page Range</label>
                        <input type="text" value={rangeStr} onChange={e => setRangeStr(e.target.value)} placeholder="e.g. 1-3, 5"
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-800 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition-all" />
                      </div>
                    )}

                    {mode === "chunks" && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-bold text-slate-700">Pages Per Chunk</label>
                          <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-bold">{chunkSize}</span>
                        </div>
                        <input type="range" min={1} max={Math.max(1, pageCount)} value={chunkSize} onChange={e => setChunkSize(Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-sky-600 mb-4" />
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-500 font-medium">
                          Will generate <strong className="text-sky-600">{Math.ceil(pageCount / chunkSize)}</strong> separate PDF files.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    {!loading && !results.length && (
                      <button onClick={handleSplit}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
                        <Scissors className="w-5 h-5" /> Split PDF Now
                      </button>
                    )}

                    {loading && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                        <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-3" />
                        <p className="font-bold text-slate-700 text-sm">Processing...</p>
                        {processingMode === "server" && (
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-4">
                            <div className="h-full bg-sky-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </div>
                    )}

                    {error && <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 font-medium">{error}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Preview */}
            <div className="md:col-span-8">
              {results.length > 0 ? (
                /* Results View */
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-8">
                  <div className="flex items-center gap-3 text-emerald-600 mb-6 pb-6 border-b border-slate-100">
                    <CheckCircle2 className="w-8 h-8" />
                    <h2 className="text-2xl font-bold text-slate-800">Split Complete!</h2>
                  </div>
                  
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                    {results.map((r, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-2xl px-5 py-4 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-sky-500 border border-slate-100">
                            {mode === "chunks" ? <Layers className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{r.label}</p>
                            <p className="text-sm text-slate-500 mt-0.5">{(r.blob.size/1024).toFixed(1)} KB · {r.filename}</p>
                          </div>
                        </div>
                        <button onClick={() => downloadResult(r)}
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm flex items-center gap-2 transition-colors">
                          <Download className="w-4 h-4" /> Save
                        </button>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => { setResults([]); }} className="mt-8 w-full border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:bg-slate-50 py-3 rounded-xl transition-all">
                    Modify Split Settings
                  </button>
                </div>
              ) : (
                /* Grid View */
                <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Live Preview</h2>
                    <p className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
                      {mode === "pages" ? `${parsedIndices.length} Selected` : `${pageCount} Total Pages`}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {pageCount > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 gap-y-8">
                        {Array.from({ length: pageCount }).map((_, i) => {
                          const isSelected = mode === "pages" && parsedIndices.includes(i);
                          const isHighlighted = mode === "range" && parsedIndices.includes(i);
                          
                          let chunkInfo = null;
                          if (mode === "chunks") {
                            chunkInfo = {
                              chunkNum: Math.floor(i / chunkSize) + 1,
                              isFirstInChunk: i % chunkSize === 0
                            };
                          }

                          return (
                            <PdfPageThumbnail 
                              key={i}
                              pdfDoc={pdfDoc}
                              pageIndex={i}
                              isSelected={isSelected}
                              isHighlighted={isHighlighted}
                              mode={mode}
                              chunkInfo={chunkInfo}
                              onClick={handleThumbnailClick}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-sky-400" />
                        <p className="font-medium">Loading document pages...</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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
                 <button className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50 transition-colors" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                   {faq.q}
                   {faqOpen === i ? <ChevronUp className="w-5 h-5 text-sky-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                 </button>
                 <div className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ${faqOpen === i ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"}`}>{faq.a}</div>
               </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
