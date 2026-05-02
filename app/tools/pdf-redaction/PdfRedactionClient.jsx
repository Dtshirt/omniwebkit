"use client";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Loader2, CheckCircle2, Download, ShieldCheck, FileText, Trash2, Plus, X, Search, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const POLL_MS = 2500;

export default function PdfRedactionClient() {
  const [pdfFile, setPdfFile] = useState(null);
  const [words, setWords] = useState(["CONFIDENTIAL", "SSN"]);
  const [newWord, setNewWord] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outBlob, setOutBlob] = useState(null);
  const [error, setError] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);

  const handlePdf = (f) => {
    if (!f || !f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please select a PDF file.");
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 500MB.");
      return;
    }
    setPdfFile(f);
    setOutBlob(null);
    setError(null);
  };

  const addWord = (e) => {
    e.preventDefault();
    const w = newWord.trim();
    if (!w) return;
    if (words.includes(w)) {
      toast.error("Word is already in the list");
      return;
    }
    setWords([...words, w]);
    setNewWord("");
  };

  const removeWord = (idx) => {
    setWords(words.filter((_, i) => i !== idx));
  };

  const handleRedact = async () => {
    if (!pdfFile || loading) return;
    if (words.length === 0) {
      toast.error("Please add at least one word or phrase to redact.");
      return;
    }

    setLoading(true);
    setError(null);
    setOutBlob(null);
    setProgress(5);

    try {
      const fd = new FormData();
      fd.append("file", pdfFile);
      fd.append("words", JSON.stringify(words));

      const res = await fetch(`${API_V1}/tools/pdf-redact`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || "Upload failed.");
      }

      const { job_id } = await res.json();
      setProgress(15);

      for (;;) {
        await new Promise(r => setTimeout(r, POLL_MS));
        const sr = await fetch(`${API_V1}/jobs/${job_id}`);
        const job = await sr.json();
        
        if (job.progress) setProgress(parseInt(job.progress));
        if (job.status === "error" || job.status === "failed") {
          throw new Error(job.error || "Processing failed.");
        }
        if (job.status === "done") {
          const dl = await fetch(`${API_V1}/download/${job_id}`);
          setOutBlob(await dl.blob());
          toast.success("Redaction complete!");
          break;
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    { q: "Is this true redaction or just a black box?", a: "This tool performs TRUE redaction. It physically removes the underlying text and image data from the PDF file's content stream and replaces it with a black box. The redacted text cannot be copied, highlighted, or recovered using PDF editors." },
    { q: "Why is this not processed in the browser?", a: "Most browser-based PDF tools only draw a black rectangle over the text. This is dangerous because the sensitive text remains in the file and can be simply copy-pasted out of the box. True, secure redaction requires advanced parsing (done via PyMuPDF on our secure servers) to guarantee the text is permanently destroyed." },
    { q: "Are my files kept secure?", a: "Yes. Files are uploaded securely, processed entirely in system memory (or temporary secure volumes), and are immediately purged from our servers within 1 hour after processing." },
    { q: "Can I redact images?", a: "Currently, this tool searches for specific text phrases and redacts the bounding box area of that text. If an image happens to be underneath that text, that portion of the image will also be destroyed, but you cannot select arbitrary image areas yet." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Hero */}
      <div className="bg-slate-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold text-rose-200 mb-5">
            <ShieldCheck className="w-3.5 h-3.5" /> True Content Destruction
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Secure PDF <span className="text-rose-500">Redaction</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            Permanently black out and destroy sensitive text (like SSNs, names, or passwords) from your PDFs. Not just a black box overlay.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 -mt-8 relative z-20">
        <Breadcrumbs items={[{ name: "PDF Redaction", href: "/tools/pdf-redaction" }]} />
        
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16 mt-4">
          <div className="px-8 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium text-amber-800 leading-relaxed">
              <strong>Secure Server Processing:</strong> True redaction requires permanently removing data from the PDF content stream. Because browser-based tools can only add easily-removable black rectangles, this tool securely processes your file on our backend to guarantee the text is destroyed.
            </p>
          </div>

          <div className="p-8">
            <div className="grid lg:grid-cols-2 gap-10">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">1</span> 
                    Upload PDF
                  </h3>
                  {!pdfFile ? (
                    <div className="border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/30 transition-all rounded-2xl p-8 text-center flex flex-col items-center"
                      onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handlePdf(e.dataTransfer.files[0]); }}>
                      <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-3"><FileText className="w-7 h-7" /></div>
                      <p className="font-bold mb-1">Drag & Drop PDF</p>
                      <label className="text-sm text-rose-600 font-bold hover:underline cursor-pointer">
                        or click to browse
                        <input type="file" className="hidden" accept=".pdf,application/pdf" onChange={e => { if (e.target.files[0]) handlePdf(e.target.files[0]); }} />
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                        <div>
                          <p className="font-bold text-slate-800 truncate max-w-[200px]">{pdfFile.name}</p>
                          <p className="text-xs text-slate-400">{(pdfFile.size/1024/1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button onClick={() => { setPdfFile(null); setOutBlob(null); }} className="text-slate-400 hover:text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">2</span> 
                    Text to Redact
                  </h3>
                  
                  <form onSubmit={addWord} className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={newWord}
                        onChange={(e) => setNewWord(e.target.value)}
                        placeholder="Enter text to black out..." 
                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-400 outline-none"
                      />
                    </div>
                    <button type="submit" disabled={!newWord.trim()} className="bg-slate-900 text-white px-5 rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2 transition-colors">
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[140px]">
                    {words.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-slate-400 font-medium pt-8">
                        No words added yet
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {words.map((w, idx) => (
                          <div key={idx} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
                            {w}
                            <button onClick={() => removeWord(idx)} className="text-slate-400 hover:text-rose-400 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Every instance of these exact phrases will be permanently destroyed and blacked out.</p>
                </div>
              </div>

              {/* Right Column: Execution */}
              <div className="flex flex-col justify-center">
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 h-full flex flex-col justify-center items-center text-center">
                  
                  {!loading && !outBlob ? (
                    <div className="w-full">
                      <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2">Ready to Redact</h4>
                      <p className="text-slate-500 text-sm mb-8 px-4">This action cannot be undone. Make sure you have a backup of the original PDF.</p>
                      <button onClick={handleRedact} disabled={!pdfFile || words.length === 0}
                        className="w-full bg-rose-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 text-lg">
                        Permanently Redact PDF
                      </button>
                    </div>
                  ) : loading ? (
                    <div className="w-full flex flex-col items-center py-4">
                      <Loader2 className="w-10 h-10 text-rose-600 animate-spin mb-4" />
                      <p className="font-bold text-slate-700 mb-2">Redacting document...</p>
                      <p className="text-xs text-slate-500 mb-4">Searching and destroying text across all pages</p>
                      <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  ) : null}

                  {error && (
                    <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mt-4">
                      {error}
                    </div>
                  )}

                  {outBlob && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-bold text-emerald-800 mb-1">Redaction Complete</h4>
                      <p className="text-emerald-600 text-sm font-medium mb-6">{(outBlob.size/1024/1024).toFixed(2)} MB</p>
                      
                      <button onClick={() => saveAs(outBlob, `redacted_${pdfFile?.name || "document.pdf"}`)}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all hover:-translate-y-0.5">
                        <Download className="w-5 h-5" /> Download Secure PDF
                      </button>
                      <button onClick={() => { setOutBlob(null); setPdfFile(null); }} className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 py-3 mt-3 transition-colors">
                        Redact another file
                      </button>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50 transition-colors" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {faq.q}
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-rose-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <div className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ${faqOpen === i ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
