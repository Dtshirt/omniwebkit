"use client";
import React, { useState } from "react";
import { saveAs } from "file-saver";
import { Loader2, CheckCircle2, Download, ShieldCheck, FileText, Trash2, Plus, X, Search, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";
import Breadcrumbs from "@/components/seo/Breadcrumbs";

const POLL_MS = 2500;
const MAX_POLL_ATTEMPTS = 120; // 120 × 2.5s = 5 minutes max wait

export default function PdfRedactionClient() {
  const [pdfFile, setPdfFile] = useState(null);
  const [words, setWords] = useState(["CONFIDENTIAL", "SSN"]);
  const [newWord, setNewWord] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outBlob, setOutBlob] = useState(null);
  const [error, setError] = useState(null);

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

      const url = `${API_V1}/tools/pdf-redact`;
      console.log("[PDF-REDACT] Sending POST to:", url);
      console.log("[PDF-REDACT] File:", pdfFile.name, pdfFile.size, "bytes");
      console.log("[PDF-REDACT] Words:", words);

      let res;
      try {
        res = await fetch(url, { method: "POST", body: fd });
      } catch (fetchErr) {
        console.error("[PDF-REDACT] Fetch failed (network error):", fetchErr);
        throw new Error(`Network error: ${fetchErr.message}. Check browser console and CORS settings.`);
      }

      console.log("[PDF-REDACT] Response status:", res.status, res.statusText);

      if (!res.ok) {
        let detail = "Upload failed.";
        try { detail = (await res.json()).detail || detail; } catch {}
        throw new Error(`Server error ${res.status}: ${detail}`);
      }

      const { job_id } = await res.json();
      setProgress(15);

      let attempts = 0;
      for (;;) {
        await new Promise(r => setTimeout(r, POLL_MS));
        attempts++;

        if (attempts > MAX_POLL_ATTEMPTS) {
          throw new Error(
            "Processing timed out after 5 minutes. The server worker may be unavailable. " +
            "Please try again later or contact support."
          );
        }

        let sr;
        try {
          sr = await fetch(`${API_V1}/jobs/${job_id}`);
        } catch (fetchErr) {
          throw new Error("Lost connection to the server. Please check your internet and try again.");
        }

        if (!sr.ok) {
          throw new Error(`Server error while checking job status (HTTP ${sr.status}).`);
        }

        const job = await sr.json();
        
        if (job.progress) setProgress(parseInt(job.progress));
        if (job.status === "error" || job.status === "failed") {
          throw new Error(job.error || "Processing failed on the server.");
        }
        if (job.status === "done") {
          const dl = await fetch(`${API_V1}/download/${job_id}`);
          if (!dl.ok) throw new Error("Failed to download the redacted file.");
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

  return (
    <div className="min-h-screen   pb-24 font-sans text-slate-900">
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

      <div className="max-w-7xl mx-auto px-6 py-8 -mt-8 relative z-20">
        <div className="mb-3"></div> 
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
                  <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">1</span> 
                    Upload PDF
                  </p>
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
                  <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500">2</span> 
                    Text to Redact
                  </p>
                  
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
                      <p className="text-xl font-bold text-slate-800 mb-2">Ready to Redact</p>
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

        {/* SEO Content */}
        <div className="prose-premium ">
          <h2>Secure PDF Redaction: Permanently Remove Sensitive Text</h2>
          
          <p>Sending a contract with a black box drawn over a Social Security Number is a massive security risk. A shocking number of people still do this — using basic PDF editors to draw shapes over text and hoping nobody tries to copy it out. That's not secure PDF redaction. That's just hiding it temporarily.</p>
          
          <p>The PDF Redaction tool changes that equation entirely. It dives directly into the file's internal code and permanently destroys the text you want gone. It strips out the actual characters and replaces them with a solid black box, so there is literally nothing left to recover. Whether you're a paralegal scrubbing sensitive court documents or a small business owner removing passwords from an invoice before sending it off, this tool gets the job done safely.</p>
          
          <p>I built this tool because I kept seeing sensitive data leaked by simple formatting tricks. We've all seen news stories where a "redacted" document was released, only for someone to copy and paste the blacked-out text into a text editor. You need a tool that actually deletes the underlying data, and that's exactly what this web application delivers.</p>
          
          <h2>The Dangers of Fake Redaction</h2>
          
          <p>Most basic PDF viewers have a drawing feature. It feels completely natural to grab the rectangle tool, set the color to black, and drag it over a client's address. But here's the thing — PDFs are constructed in layers. When you draw a box over text, the text doesn't disappear. It just sits underneath the newly created shape.</p>
          
          <p>Anyone with a free PDF reader can open that document, hit 'Select All', and copy everything straight into a blank document. The black box stays behind, but the sensitive text comes right along with the copy command. Proper redaction physically intercepts the content stream and deletes the text elements before placing the visual block.</p>
          
          <h2>How to Redact PDF Documents (The Frictionless Guide)</h2>
          
          <p>You don't need to pay for a clunky, expensive desktop application just to remove text from a PDF. Here is how you can completely black out sensitive information in about ten seconds.</p>
          
          <ol>
            <li><strong>Drop your file into the system:</strong> Drag your document directly into the upload box at the top of the page. The tool handles hefty PDFs up to 500MB without breaking a single sweat.</li>
            <li><strong>Type your target words carefully:</strong> Enter the exact words or phrases you need to hide — like "CONFIDENTIAL", an employee's name, or a sensitive project code. You can add as many individual phrases as you need.</li>
            <li><strong>Hit the Redact button:</strong> Click the big action button. Our secure server immediately scans every single page, locates those exact words, and permanently destroys them from the file's structural stream.</li>
            <li><strong>Download your secure file:</strong> Grab your freshly scrubbed document. The original text is gone for good, and you can share it with complete peace of mind.</li>
          </ol>
          
          <p>And yes, you can comfortably redact text from PDFs with hundreds of pages. The server engine crunches through them remarkably fast, usually wrapping up in just a few seconds depending on the file's complexity.</p>
          
          <h2>Your Privacy & Security Anchor</h2>
          
          <p>Security isn't an afterthought or a premium feature here — it's the entire reason this tool exists. Standard browser-based tools simply can't perform true redaction because they lack the deep parsing capability needed to alter a PDF's internal data stream safely. That's why your file is securely routed to our specialized backend.</p>
          
          <p>But here's the catch with server-side processing: you need to be able to trust it. So here is our ironclad promise to you. Your files are processed entirely in isolated system memory. The second the processing finishes and you download your file, both the original document and the redacted version are queued for immediate deletion. Within exactly one hour, every trace is purged from the system.</p>
          
          <p>We absolutely do not look at your documents. We never save your redacted text. We don't train artificial intelligence models on your sensitive data. Period.</p>
          
          <h2>Key Features of the PDF Redaction Tool</h2>
          
          <p>We intentionally skipped the bloat and focused purely on flawless content removal. Here's what you get when you use this utility.</p>
          
          <ul>
            <li><strong>True Content Destruction:</strong> This process doesn't just cover your text with a dark rectangle; it physically removes the character data from the document stream entirely.</li>
            <li><strong>Multi-Word Targeting System:</strong> Need to scrub ten different names from a 50-page financial report? Enter them all at once and let the engine handle the repetitive work.</li>
            <li><strong>Server-Side Precision Parsing:</strong> We use the heavy-duty PyMuPDF engine in our backend to guarantee that the redaction is irreversible and accurate.</li>
            <li><strong>Maintains Original Formatting:</strong> The rest of your document stays exactly how you left it. Only the targeted words are blacked out, preventing unwanted layout shifts.</li>
          </ul>
          
          <h2>Technical Specifications</h2>
          
          <p>If you're curious about the mechanics under the hood, here are the exact specifications driving this application.</p>
          
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
                <td>500 MB per document</td>
              </tr>
              <tr>
                <td><strong>Supported Formats</strong></td>
                <td>Standard `.pdf` files</td>
              </tr>
              <tr>
                <td><strong>Core Processing Engine</strong></td>
                <td>PyMuPDF running on a secure backend</td>
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
          
          <p>Don't leave your sensitive security tasks up to basic drawing tools. Drop your file into the tool above, type your target phrases, and you'll have a properly redacted, highly secure document in seconds.</p>
          
          <hr />
          <p><strong>Meta Title:</strong> Secure PDF Redaction Tool | Permanently Black Out Text</p>
          <p><strong>Meta Description:</strong> Permanently remove sensitive text from your PDFs. True content redaction that destroys underlying data, not just a black overlay. Fast and secure.</p>
          <p><strong>Primary Keyword:</strong> secure pdf redaction</p>
          <p><strong>Word Count:</strong> 855</p>
          <p><strong>Estimated Reading Time:</strong> 4 min read</p>
        
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "PDF Redaction Tool",
                "operatingSystem": "Web",
                "applicationCategory": "UtilitiesApplication",
                "description": "A secure PDF redaction tool that permanently removes sensitive text from documents using server-side processing.",
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
