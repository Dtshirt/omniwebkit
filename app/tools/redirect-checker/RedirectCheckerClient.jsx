"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { 
  Globe, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Search, FileText, Zap, Server, ArrowRight, CornerDownRight
} from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const POLLING_INTERVAL = 2000;

export default function RedirectCheckerClient() {
  const [activeTab, setActiveTab] = useState("single"); // 'single' or 'bulk'
  
  // Single Mode State
  const [url, setUrl] = useState("");
  const [singleResults, setSingleResults] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  
  // Bulk Mode State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  
  const [faqOpen, setFaqOpen] = useState(null);

  // ─── SINGLE MODE LOGIC (FastAPI Async) ────────────────────────
  
  const handleSingleLookup = async () => {
    let targetUrl = url.trim();
    if (!targetUrl) {
      toast.error("Please enter a URL.");
      return;
    }
    
    setSingleLoading(true);
    setSingleResults(null);
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/tools/redirect-checker/single?url=${encodeURIComponent(targetUrl)}`);
      
      if (!res.ok) throw new Error("Failed to contact the server.");
      
      const data = await res.json();
      
      if (data.error) {
         toast.error(data.error);
      }
      
      setSingleResults(data);
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to trace redirects.");
    } finally {
      setSingleLoading(false);
    }
  };

  // ─── BULK MODE LOGIC (FastAPI Queue) ────────────────────────────
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFileSelection(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFileSelection(file);
  };

  const processFileSelection = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setBulkError("Please upload a valid CSV file.");
      return;
    }
    if (file.size > MAX_CLIENT_SIZE_BYTES) {
      setBulkError("File is too large. Maximum size is 50MB.");
      return;
    }
    
    setSelectedFile(file);
    setBulkError(null);
    setBulkSuccess(false);
    setBulkProgress(0);
    setBulkStatus("");
  };

  const startBulkGeneration = async () => {
    if (!selectedFile) return;
    
    setBulkError(null);
    setBulkSuccess(false);
    setIsProcessing(true);
    setBulkProgress(0);
    
    await processServerSide(selectedFile);
  };

  const processServerSide = async (file) => {
    setBulkStatus("Uploading URL list to server...");
    setProgress(10);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/v1/tools/redirect-checker", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
      setBulkStatus("Servers tracking redirect hops in background...");
      pollJobStatus(job_id);
    } catch (err) {
      setBulkError(err.message);
      setIsProcessing(false);
      setProgress(0);
      setBulkStatus("");
    }
  };

  const setProgress = (val) => setBulkProgress(val);

  const pollJobStatus = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job status.");
      
      const job = await res.json();

      if (job.status === "failed") {
        throw new Error(job.error || "Server failed to process batch.");
      }

      if (job.status === "done") {
        if (job.output_path) {
          const downloadRes = await fetch(`http://localhost:8000/api/v1/download/${jobId}`);
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            saveAs(blob, `redirect_chain_results.csv`);
            setBulkSuccess(true);
            toast.success("Bulk Redirect Audit completed!");
          } else {
             throw new Error("Failed to download result CSV.");
          }
        } else {
          throw new Error("Result path not found.");
        }
        setIsProcessing(false);
        setBulkStatus("");
        return;
      }

      if (job.progress) {
        setProgress(parseInt(job.progress, 10));
      }

      setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
    } catch (err) {
      setBulkError(err.message);
      setIsProcessing(false);
      setProgress(0);
      setBulkStatus("");
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status >= 300 && status < 400) return "bg-amber-100 text-amber-700 border-amber-200";
    if (status >= 400) return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getStatusBadge = (status) => {
    if (status === 301) return "301 Permanent";
    if (status === 302) return "302 Temporary";
    if (status === 200) return "200 OK";
    if (status === 404) return "404 Not Found";
    return `${status} Status`;
  };

  const faqs = [
    { q: "Why can't my browser do this automatically?", a: "Modern web browsers like Chrome and Safari implement strict security sandboxes that intentionally hide intermediate redirect hops (301, 302) from JavaScript. Your browser will instantly land on the final URL, masking the journey." },
    { q: "How does the Single URL mode stay so fast?", a: "To bypass the browser restriction, your request is sent to our ultra-lightweight asynchronous Python API. It rapidly pings the URL and reads the raw HTTP headers in milliseconds without blocking the server, ensuring zero-crash scaling." },
    { q: "How does the Bulk CSV feature work?", a: "For tracking hundreds of URLs simultaneously, the request is offloaded to our background worker queue. It asynchronously maps every single redirect hop and compiles the entire map into an easy-to-read CSV report." },
    { q: "Is this free?", a: "Yes, both single tracing and massive bulk analysis are 100% free." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[60%] rounded-full bg-cyan-500 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Redirect <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300">Chain Checker</span>
          </h1>
          <p className="text-lg text-cyan-100 max-w-2xl mx-auto font-light">
            Trace the exact path of any URL. Uncover hidden 301 and 302 redirects effortlessly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-cyan-50 text-cyan-700 border-b-2 border-cyan-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <ArrowRight className="w-5 h-5" />
              Single Trace
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-cyan-50 text-cyan-700 border-b-2 border-cyan-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" />
              Bulk CSV Tracker
            </button>
          </div>

          <div className="p-8">

            {/* SINGLE TAB */}
            {activeTab === "single" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-10 max-w-3xl mx-auto">
                  <div className="relative flex-1">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="http://example.com"
                      className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-cyan-500 outline-none text-lg shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleSingleLookup()}
                    />
                  </div>
                  <button
                    onClick={handleSingleLookup}
                    disabled={singleLoading}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {singleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Trace Chain
                  </button>
                </div>
                
                {/* Results Area */}
                {singleResults && (
                  <div className="animate-fade-in max-w-3xl mx-auto">
                    
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-slate-800">Redirect Map</h2>
                      <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full border border-slate-200">
                        {singleResults.total_hops} Hops Total
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
                       {/* Vertical Line */}
                       <div className="absolute left-[39px] top-[40px] bottom-[40px] w-0.5 bg-slate-200 z-0"></div>

                       {singleResults.chain && singleResults.chain.map((hop, idx) => (
                         <div key={idx} className="relative z-10 flex gap-4 mb-8 last:mb-0">
                           <div className="mt-1">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${hop.status >= 200 && hop.status < 300 ? 'border-emerald-500 text-emerald-500' : 'border-amber-500 text-amber-500'}`}>
                               {idx === singleResults.chain.length - 1 ? <CheckCircle2 className="w-5 h-5" /> : <CornerDownRight className="w-5 h-5" />}
                             </div>
                           </div>
                           <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow break-all">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-1 rounded-md border ${getStatusColor(hop.status)}`}>
                                  {getStatusBadge(hop.status)}
                                </span>
                                {idx === 0 && <span className="text-xs text-slate-400 font-bold uppercase">Start</span>}
                                {idx === singleResults.chain.length - 1 && <span className="text-xs text-emerald-600 font-bold uppercase bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200">Final Destination</span>}
                              </div>
                              <p className="text-slate-800 font-medium">{hop.url}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* BULK UPLOAD TAB */}
            {activeTab === "bulk" && (
              <div className="flex flex-col items-center w-full">
                {!isProcessing && !bulkSuccess && (
                  <div 
                    className="w-full border-2 border-dashed border-slate-300 hover:border-cyan-400 bg-slate-50 hover:bg-cyan-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-cyan-100 text-cyan-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload URL List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Upload a CSV file containing your list of URLs to run a massive async redirect audit.</p>
                    
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                    
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                   <button
                    onClick={startBulkGeneration}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Server className="w-5 h-5" />
                    Run Bulk Tracing
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus || "Processing..."}</p>
                    
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 ease-out absolute left-0 top-0" 
                        style={{ width: `${bulkProgress}%` }} 
                      />
                    </div>
                    <p className="text-sm font-bold text-cyan-600 mt-2">{bulkProgress}%</p>
                  </div>
                )}

                {bulkError && !isProcessing && (
                  <div className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center mt-4">
                    <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
                    <p className="font-bold text-lg mb-1">Batch Audit Failed</p>
                    <p className="text-sm">{bulkError}</p>
                    <button 
                      onClick={() => {setBulkError(null); setSelectedFile(null);}}
                      className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {bulkSuccess && !isProcessing && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center text-center mt-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Tracing Complete!</h3>
                    <p className="text-green-700 mb-6">Your bulk async redirect chain report has been downloaded.</p>
                    <button 
                      onClick={() => { setBulkSuccess(false); setSelectedFile(null); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
                    >
                      Trace Another List
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4 text-cyan-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Asynchronous I/O Server</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Because modern browsers hide intermediate 301 redirects, we engineered a dedicated Async FastAPI route to trace your URLs. It securely pings the endpoints in milliseconds without utilizing heavy background workers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Async Bulk Queues</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When processing massive CSV files containing hundreds of redirects, we upload the data to a Redis worker queue. The background python script traces the full chains concurrently without crashing the core system.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button 
                  className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 focus:outline-none hover:bg-slate-50"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  {faq.q}
                  {faqOpen === index ? (
                    <ChevronUp className="w-5 h-5 text-cyan-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div 
                  className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ease-in-out ${
                    faqOpen === index ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"
                  }`}
                >
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
