"use client";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import { UploadCloud, Loader2, CheckCircle2, Download, Zap, Server, FileText, Trash2, ChevronDown, ChevronUp, Image, Type } from "lucide-react";
import { toast } from "react-hot-toast";

const CLIENT_MAX = 10 * 1024 * 1024;
const POLL_MS = 2500;

const POSITIONS = ["center","top-left","top-right","bottom-left","bottom-right","top-center","bottom-center"];

// ─── Browser text watermark via pdf-lib ─────────────────────────────────────
async function browserAddTextWatermark(arrayBuffer, { text, fontSize, color, opacity, angle, position }) {
  const { PDFDocument, rgb, degrees } = await import("pdf-lib");
  const doc = await PDFDocument.load(arrayBuffer);
  const pages = doc.getPages();

  const hexToRgb = (h) => {
    const n = parseInt(h.replace("#",""), 16);
    return rgb(((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255);
  };

  const col = hexToRgb(color);

  for (const page of pages) {
    const { width: pw, height: ph } = page.getSize();
    const estimatedW = text.length * fontSize * 0.55;
    const estimatedH = fontSize;

    const posMap = {
      "center":        [(pw - estimatedW) / 2, (ph - estimatedH) / 2],
      "top-left":      [30, ph - estimatedH - 30],
      "top-right":     [pw - estimatedW - 30, ph - estimatedH - 30],
      "bottom-left":   [30, 30],
      "bottom-right":  [pw - estimatedW - 30, 30],
      "top-center":    [(pw - estimatedW) / 2, ph - estimatedH - 30],
      "bottom-center": [(pw - estimatedW) / 2, 30],
    };
    const [x, y] = posMap[position] || posMap["center"];

    page.drawText(text, {
      x, y,
      size: fontSize,
      color: col,
      opacity,
      rotate: degrees(angle),
    });
  }

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

// ─── Browser image watermark via pdf-lib ────────────────────────────────────
async function browserAddImageWatermark(arrayBuffer, imageFile, { opacity, position, scale }) {
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(arrayBuffer);
  const pages = doc.getPages();

  const imgBuf = await imageFile.arrayBuffer();
  const isPng = imageFile.type === "image/png";
  const embeddedImg = isPng
    ? await doc.embedPng(imgBuf)
    : await doc.embedJpg(imgBuf);

  for (const page of pages) {
    const { width: pw, height: ph } = page.getSize();
    const imgW = pw * scale;
    const imgH = (embeddedImg.height / embeddedImg.width) * imgW;

    const posMap = {
      "center":        [(pw - imgW) / 2, (ph - imgH) / 2],
      "top-left":      [20, ph - imgH - 20],
      "top-right":     [pw - imgW - 20, ph - imgH - 20],
      "bottom-left":   [20, 20],
      "bottom-right":  [pw - imgW - 20, 20],
      "top-center":    [(pw - imgW) / 2, ph - imgH - 20],
      "bottom-center": [(pw - imgW) / 2, 20],
    };
    const [x, y] = posMap[position] || posMap["center"];

    page.drawImage(embeddedImg, { x, y, width: imgW, height: imgH, opacity });
  }

  const bytes = await doc.save();
  return new Blob([bytes], { type: "application/pdf" });
}

// ─── Slider helper ────────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-bold text-slate-700">{label}</label>
        <span className="text-sm font-extrabold text-teal-600">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-600" />
    </div>
  );
}

export default function PdfWatermarkClient() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBuf, setPdfBuf]   = useState(null);
  const [wmType, setWmType]   = useState("text");  // text | image
  // Text options
  const [wmText, setWmText]       = useState("CONFIDENTIAL");
  const [fontSize, setFontSize]   = useState(48);
  const [color, setColor]         = useState("#FF0000");
  const [opacity, setOpacity]     = useState(0.3);
  const [angle, setAngle]         = useState(45);
  const [position, setPosition]   = useState("center");
  // Image options
  const [wmImageFile, setWmImageFile] = useState(null);
  const [imgScale, setImgScale]       = useState(0.3);

  const [loading, setLoading]   = useState(false);
  const [progress, setProgress] = useState(0);
  const [outBlob, setOutBlob]   = useState(null);
  const [error, setError]       = useState(null);
  const [faqOpen, setFaqOpen]   = useState(null);

  const processingMode = pdfFile ? (pdfFile.size <= CLIENT_MAX ? "client" : "server") : null;

  const handlePdf = async (f) => {
    if (!f || !f.name.toLowerCase().endsWith(".pdf")) { toast.error("Please select a PDF file."); return; }
    setPdfFile(f); setOutBlob(null); setError(null);
    if (f.size <= CLIENT_MAX) {
      const buf = await f.arrayBuffer();
      setPdfBuf(buf);
    } else {
      setPdfBuf(null);
    }
  };

  const handleApply = async () => {
    if (!pdfFile || loading) return;
    if (wmType === "image" && !wmImageFile) { toast.error("Please select a watermark image."); return; }
    setLoading(true); setError(null); setOutBlob(null); setProgress(0);

    try {
      if (processingMode === "client") {
        let blob;
        if (wmType === "text") {
          blob = await browserAddTextWatermark(pdfBuf.slice(0), { text: wmText, fontSize, color, opacity, angle, position });
        } else {
          blob = await browserAddImageWatermark(pdfBuf.slice(0), wmImageFile, { opacity, position, scale: imgScale });
        }
        setOutBlob(blob);
        toast.success("Watermark applied in browser!");
      } else {
        setProgress(5);
        const fd = new FormData();
        fd.append("file", pdfFile);
        fd.append("wm_type", wmType);
        fd.append("wm_text", wmText);
        fd.append("font_size", String(fontSize));
        fd.append("color", color);
        fd.append("opacity", String(opacity));
        fd.append("angle", String(angle));
        fd.append("position", position);
        fd.append("image_scale", String(imgScale));
        if (wmType === "image" && wmImageFile) fd.append("wm_image", wmImageFile);

        const res = await fetch("http://localhost:8000/api/v1/tools/pdf-watermark", { method: "POST", body: fd });
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
            setOutBlob(await dl.blob());
            toast.success("Watermark applied!"); break;
          }
        }
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const faqs = [
    { q: "How does browser-side watermarking work?", a: "For PDFs under 10MB, a JavaScript PDF library runs entirely in your browser. It parses each page's content stream and injects a new text or image layer at the specified position with your chosen opacity and rotation — no upload required." },
    { q: "Which formats are supported for image watermarks?", a: "PNG and JPG/JPEG images are supported for watermarking. PNG is recommended when you need transparency, as the alpha channel is preserved and blended into the PDF page at your chosen opacity level." },
    { q: "Will the watermark be selectable/removable text?", a: "Text watermarks added by this tool are rendered as actual text objects inside the PDF content stream. Advanced PDF editors can theoretically remove them. For maximum permanence on large files, the server flattens the output to a compressed PDF that is harder to edit." },
    { q: "What does the opacity setting control?", a: "Opacity of 1.0 means fully opaque (solid watermark). 0.3 (30%) is a good default for diagonal text watermarks — visible enough to indicate ownership but not obscuring the underlying content. For subtle image marks, try 0.15–0.25." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-900 via-cyan-900 to-sky-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[75%] rounded-full bg-teal-400 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[50%] rounded-full bg-cyan-500 blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            PDF <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Watermark</span> Tool
          </h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto font-light">Add text or image watermarks to every page of your PDF. Control opacity, position, angle, and size.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">

          {processingMode && (
            <div className={`px-8 py-3 flex items-center gap-3 text-sm font-bold border-b ${processingMode === "client" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              {processingMode === "client"
                ? <><Zap className="w-4 h-4" />Watermarking locally in your browser — no upload</>
                : <><Server className="w-4 h-4" />Large PDF — server processing will be used</>}
            </div>
          )}

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left: Upload + Settings */}
              <div className="space-y-6">
                {/* PDF Drop */}
                {!pdfFile ? (
                  <div className="border-2 border-dashed border-slate-300 hover:border-teal-400 bg-slate-50 hover:bg-teal-50/30 transition-all rounded-2xl p-10 text-center flex flex-col items-center"
                    onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handlePdf(e.dataTransfer.files[0]); }}>
                    <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-3"><FileText className="w-7 h-7" /></div>
                    <h3 className="font-bold mb-1">Drop your PDF here</h3>
                    <p className="text-slate-500 text-xs mb-4">Up to 500MB supported</p>
                    <div className="flex gap-2 text-xs mb-5">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">≤ 10MB → Browser</span>
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">&gt; 10MB → Server</span>
                    </div>
                    <label className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-7 rounded-xl cursor-pointer transition-colors shadow-md text-sm">
                      Choose PDF
                      <input type="file" className="hidden" accept=".pdf,application/pdf" onChange={e => { if (e.target.files[0]) handlePdf(e.target.files[0]); }} />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-slate-800 truncate max-w-[200px]">{pdfFile.name}</p>
                        <p className="text-xs text-slate-400">{(pdfFile.size/1024/1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => { setPdfFile(null); setPdfBuf(null); setOutBlob(null); }} className="text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                )}

                {/* Watermark type */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">Watermark Type</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ id: "text", icon: <Type className="w-5 h-5" />, label: "Text" }, { id: "image", icon: <Image className="w-5 h-5" />, label: "Image" }].map(t => (
                      <button key={t.id} onClick={() => setWmType(t.id)}
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-all ${wmType === t.id ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 text-slate-600 hover:border-teal-200"}`}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text options */}
                {wmType === "text" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Watermark Text</label>
                      <input type="text" value={wmText} onChange={e => setWmText(e.target.value)} maxLength={100}
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-teal-400 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">Color</label>
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
                          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent" />
                          <span className="font-mono text-sm text-slate-600">{color}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">Font Size</label>
                        <input type="number" min={8} max={200} value={fontSize} onChange={e => setFontSize(Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-teal-400 outline-none" />
                      </div>
                    </div>
                    <Slider label="Rotation (°)" value={angle} min={0} max={359} step={1} display={`${angle}°`} onChange={setAngle} />
                  </div>
                )}

                {/* Image options */}
                {wmType === "image" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-bold text-slate-700 block mb-2">Watermark Image (PNG/JPG)</label>
                      {!wmImageFile ? (
                        <label className="flex items-center gap-3 border-2 border-dashed border-slate-300 hover:border-teal-400 rounded-xl p-4 cursor-pointer transition-colors bg-slate-50">
                          <UploadCloud className="w-6 h-6 text-teal-500" />
                          <span className="text-sm text-slate-500">Choose image (max 5MB)</span>
                          <input type="file" className="hidden" accept="image/png,image/jpeg,image/jpg"
                            onChange={e => { if (e.target.files[0]) setWmImageFile(e.target.files[0]); }} />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                          <span className="text-sm font-bold text-slate-700 truncate">{wmImageFile.name}</span>
                          <button onClick={() => setWmImageFile(null)} className="text-slate-400 hover:text-red-500 ml-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      )}
                    </div>
                    <Slider label="Image Size (relative to page)" value={imgScale} min={0.05} max={1} step={0.05} display={`${Math.round(imgScale * 100)}%`} onChange={setImgScale} />
                  </div>
                )}

                {/* Shared controls */}
                <div className="space-y-4">
                  <Slider label="Opacity" value={opacity} min={0.05} max={1} step={0.05} display={`${Math.round(opacity * 100)}%`} onChange={setOpacity} />
                  <div>
                    <label className="text-sm font-bold text-slate-700 block mb-2">Position</label>
                    <select value={position} onChange={e => setPosition(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 focus:ring-2 focus:ring-teal-400 outline-none bg-white capitalize">
                      {POSITIONS.map(p => <option key={p} value={p}>{p.replace("-", " ")}</option>)}
                    </select>
                  </div>
                </div>

                {/* Apply / Progress */}
                {!loading && !outBlob ? (
                  <button onClick={handleApply} disabled={!pdfFile}
                    className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-3 text-lg">
                    <FileText className="w-5 h-5" /> Apply Watermark
                    {processingMode && <span className="text-sm opacity-70">({processingMode})</span>}
                  </button>
                ) : loading ? (
                  <div className="flex flex-col items-center py-4">
                    <Loader2 className="w-9 h-9 text-teal-600 animate-spin mb-3" />
                    <p className="font-bold text-slate-700 mb-3">{processingMode === "client" ? "Applying watermark…" : "Server processing…"}</p>
                    {processingMode === "server" && (
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                ) : null}

                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

                {outBlob && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      <div>
                        <p className="font-bold text-emerald-800">Watermark Applied!</p>
                        <p className="text-xs text-emerald-600">{(outBlob.size/1024/1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => saveAs(outBlob, `watermarked_${pdfFile?.name || "output.pdf"}`)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors">
                      <Download className="w-4 h-4" /> Download Watermarked PDF
                    </button>
                    <button onClick={() => { setOutBlob(null); }} className="w-full text-sm text-slate-400 hover:text-slate-600 py-2 mt-2 transition-colors">Apply different settings</button>
                  </div>
                )}
              </div>

              {/* Right: Live Preview */}
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-700 mb-3">Watermark Preview</p>
                <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center min-h-[420px] relative overflow-hidden">
                  {/* Mock PDF page */}
                  <div className="w-[280px] h-[380px] bg-white shadow-lg rounded-lg relative overflow-hidden border border-slate-200">
                    {/* Fake content lines */}
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="mx-6 mt-4 h-2 bg-slate-100 rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
                    ))}
                    {/* Watermark preview overlay */}
                    {wmType === "text" && wmText && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span style={{
                          color,
                          opacity,
                          fontSize: `${Math.max(10, Math.min(fontSize * 0.45, 36))}px`,
                          fontWeight: 900,
                          transform: `rotate(-${angle}deg)`,
                          whiteSpace: "nowrap",
                          letterSpacing: "2px",
                          userSelect: "none",
                        }}>
                          {wmText}
                        </span>
                      </div>
                    )}
                    {wmType === "image" && wmImageFile && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <img src={URL.createObjectURL(wmImageFile)} alt="watermark preview"
                          style={{ opacity, width: `${imgScale * 100}%`, objectFit: "contain" }} />
                      </div>
                    )}
                    {wmType === "image" && !wmImageFile && (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                        <div className="text-center">
                          <Image className="w-10 h-10 mx-auto mb-2" />
                          <p className="text-xs">Upload an image to preview</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="absolute bottom-3 text-xs text-slate-400 font-medium">Live preview (approximate)</p>
                </div>
              </div>
            </div>
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
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-teal-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
