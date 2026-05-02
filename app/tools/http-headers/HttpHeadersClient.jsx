"use client";

import React, { useState, useMemo } from "react";
import { saveAs } from "file-saver";
import { 
  Globe, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Search, FileText, Zap, Server, Shield, Database
} from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const POLLING_INTERVAL = 2000;

// Security headers to highlight
const SECURITY_HEADERS = new Set([
  "strict-transport-security",
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "x-xss-protection",
  "referrer-policy",
  "permissions-policy"
]);

export default function HttpHeadersClient() {
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
  const [searchQuery, setSearchQuery] = useState("");

  // ─── SINGLE MODE LOGIC (FastAPI Async) ────────────────────────
  
  const handleSingleLookup = async () => {
    let targetUrl = url.trim();
    if (!targetUrl) {
      toast.error("Please enter a URL.");
      return;
    }
    
    setSingleLoading(true);
    setSingleResults(null);
    setSearchQuery("");
    
    try {
      const res = await fetch(`http://localhost:8000/api/v1/tools/http-headers/single?url=${encodeURIComponent(targetUrl)}`);
      
      if (!res.ok) throw new Error("Failed to contact the server.");
      
      const data = await res.json();
      
      if (data.error) {
         toast.error(data.error);
      }
      
      setSingleResults(data);
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to fetch headers.");
    } finally {
      setSingleLoading(false);
    }
  };

  const filteredHeaders = useMemo(() => {
    if (!singleResults || !singleResults.headers) return [];
    
    return Object.entries(singleResults.headers).filter(([key, value]) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return key.toLowerCase().includes(q) || String(value).toLowerCase().includes(q);
    }).sort((a, b) => {
      // Sort security headers first, then alphabetically
      const aSec = SECURITY_HEADERS.has(a[0].toLowerCase());
      const bSec = SECURITY_HEADERS.has(b[0].toLowerCase());
      if (aSec && !bSec) return -1;
      if (!aSec && bSec) return 1;
      return a[0].localeCompare(b[0]);
    });
  }, [singleResults, searchQuery]);

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
    setBulkProgress(10);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/v1/tools/http-headers", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
      setBulkStatus("Servers pulling HTTP headers in background...");
      pollJobStatus(job_id);
    } catch (err) {
      setBulkError(err.message);
      setIsProcessing(false);
      setBulkProgress(0);
      setBulkStatus("");
    }
  };

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
            saveAs(blob, `http_headers_results.csv`);
            setBulkSuccess(true);
            toast.success("Bulk Header Audit completed!");
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
        setBulkProgress(parseInt(job.progress, 10));
      }

      setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
    } catch (err) {
      setBulkError(err.message);
      setIsProcessing(false);
      setBulkProgress(0);
      setBulkStatus("");
    }
  };

  const faqs = [
    { q: "Why doesn't my browser show all headers?", a: "To protect user privacy and prevent Cross-Site Scripting, browsers intentionally strip or hide critical security headers (like HSTS or CSP) from JavaScript APIs. Using a public proxy injects fake headers. Our tool uses a raw Python connection to pull the exact dictionary." },
    { q: "How does the Single URL mode stay so fast?", a: "We utilize Python's AsyncIO alongside the HTTPX library. This means our server can handle millions of requests without ever blocking the main processing thread, returning untouched raw data in milliseconds." },
    { q: "What headers should I be looking for?", a: "For security, ensure you have Strict-Transport-Security (HSTS) and X-Frame-Options. For performance, look at Cache-Control to ensure your assets are being properly cached by CDNs." },
    { q: "Is this free?", a: "Yes, both single tracing and massive bulk analysis are 100% free." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-500 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            HTTP Header <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Checker</span>
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto font-light">
            Inspect raw server response headers instantly. Audit Cache-Control, CORS, and critical Security headers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Database className="w-5 h-5" />
              Single URL Scan
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:bg-slate-50"}`}
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
                      placeholder="https://example.com"
                      className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleSingleLookup()}
                    />
                  </div>
                  <button
                    onClick={handleSingleLookup}
                    disabled={singleLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {singleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Inspect Headers
                  </button>
                </div>
                
                {/* Results Area */}
                {singleResults && (
                  <div className="animate-fade-in">
                    
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                      <div className="flex items-center gap-3">
                         <h2 className="text-xl font-bold text-slate-800">Response Headers</h2>
                         {singleResults.status_code > 0 && (
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${singleResults.status_code >= 200 && singleResults.status_code < 300 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                             Status {singleResults.status_code}
                           </span>
                         )}
                      </div>
                      
                      <div className="relative w-full md:w-64">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                         <input 
                           type="text" 
                           placeholder="Filter headers..." 
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                         />
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                       {filteredHeaders.length === 0 ? (
                         <div className="p-8 text-center text-slate-500">
                           No headers found matching your search.
                         </div>
                       ) : (
                         <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                             <tr>
                               <th className="px-6 py-4 font-bold">Header Name</th>
                               <th className="px-6 py-4 font-bold">Value</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {filteredHeaders.map(([key, value], idx) => {
                               const isSecurity = SECURITY_HEADERS.has(key.toLowerCase());
                               return (
                                 <tr key={idx} className={`hover:bg-slate-50 transition-colors ${isSecurity ? 'bg-emerald-50/30' : ''}`}>
                                   <td className="px-6 py-4 font-medium text-slate-800 align-top w-1/3 break-words">
                                      <div className="flex items-center gap-2">
                                        {key}
                                        {isSecurity && <Shield className="w-3 h-3 text-emerald-500" title="Security Header" />}
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 text-slate-600 align-top break-all font-mono text-xs">
                                     {value}
                                   </td>
                                 </tr>
                               );
                             })}
                           </tbody>
                         </table>
                       )}
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
                    className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload URL List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Upload a CSV file containing your list of URLs to extract full header dictionaries asynchronously.</p>
                    
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                    
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                   <button
                    onClick={startBulkGeneration}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Server className="w-5 h-5" />
                    Run Bulk Extraction
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus || "Processing..."}</p>
                    
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 ease-out absolute left-0 top-0" 
                        style={{ width: `${bulkProgress}%` }} 
                      />
                    </div>
                    <p className="text-sm font-bold text-emerald-600 mt-2">{bulkProgress}%</p>
                  </div>
                )}

                {bulkError && !isProcessing && (
                  <div className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center mt-4">
                    <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
                    <p className="font-bold text-lg mb-1">Batch Extraction Failed</p>
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
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Extraction Complete!</h3>
                    <p className="text-green-700 mb-6">Your bulk async HTTP header report has been downloaded.</p>
                    <button 
                      onClick={() => { setBulkSuccess(false); setSelectedFile(null); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
                    >
                      Inspect Another List
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
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Bypassing the Browser Sandbox</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Because browsers actively hide critical security headers from Javascript, we route your request through a dedicated Asynchronous Python connection to fetch the exact, unadulterated dictionary of responses in milliseconds.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-teal-600">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Async Bulk Queues</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When processing massive CSV files containing hundreds of domains, we upload the data to a Redis worker queue. The background python script maps the headers concurrently without ever blocking or crashing the primary API.
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
                    <ChevronUp className="w-5 h-5 text-emerald-500" />
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
