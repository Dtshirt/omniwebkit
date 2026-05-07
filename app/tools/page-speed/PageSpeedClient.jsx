"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { 
  Globe, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Search, FileText, Zap, Server, Gauge, Activity
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB for CSV
const POLLING_INTERVAL = 2000;

export default function PageSpeedClient() {
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

  // ─── SINGLE MODE LOGIC (Google PageSpeed API) ────────────────────────
  
  const handleSingleLookup = async () => {
    let targetUrl = url.trim();
    if (!targetUrl) {
      toast.error("Please enter a URL.");
      return;
    }
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = 'https://' + targetUrl;
      setUrl(targetUrl);
    }

    setSingleLoading(true);
    setSingleResults(null);

    try {
      // Use our own Playwright backend — no API key, no quota limits
      const res = await fetch(`${API_V1}/tools/page-speed/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, strategy: "desktop" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error ${res.status}`);
      }

      const data = await res.json();

      setSingleResults({
        url:           data.url,
        title:         data.title || "",
        score:         data.score,
        ttfb:          data.ttfb,
        fcp:           data.fcp,           // already in seconds
        totalMb:       data.total_mb,
        requestCount:  data.request_count,
        loadTimeMs:    data.load_time_ms,
      });

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to analyze website performance.");
    } finally {
      setSingleLoading(false);
    }
  };


  // ─── BULK MODE LOGIC (FastAPI + Playwright) ────────────────────────────
  
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

      const res = await fetch(`${API_V1}/tools/page-speed`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
      setBulkStatus("Servers booting headless Chromium browsers...");
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
      const res = await fetch(`${API_V1}/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job status.");
      
      const job = await res.json();

      if (job.status === "failed") {
        throw new Error(job.error || "Server failed to process batch.");
      }

      if (job.status === "done") {
        if (job.output_path) {
          const downloadRes = await fetch(`${API_V1}/download/${jobId}`);
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            saveAs(blob, `page_speed_results.csv`);
            setBulkSuccess(true);
            toast.success("Bulk Page Speed Audit completed!");
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
        if (parseInt(job.progress, 10) > 20) {
            setBulkStatus("Evaluating network waterfalls in background...");
        }
      }

      setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
    } catch (err) {
      setBulkError(err.message);
      setIsProcessing(false);
      setProgress(0);
      setBulkStatus("");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const faqs = [
    { q: "What is TTFB?", a: "TTFB stands for Time to First Byte. It measures the milliseconds it takes for a user's browser to receive the very first byte of data from your server after requesting the page. A high TTFB usually means a slow server or missing caching layer." },
    { q: "How does the single URL analyzer work?", a: "To guarantee zero impact on your local network, your browser dispatches a secure request directly to Google's public Lighthouse APIs. This simulates a real desktop environment loading your page and returns highly accurate, standardized metrics instantly." },
    { q: "How does the Bulk CSV feature work?", a: "To prevent rate-limits, uploading a massive CSV will transfer the workload to our backend servers. We dynamically spin up headless Chromium browser instances using Playwright to physically load every URL, record the network traffic, and generate your exportable CSV." },
    { q: "Is this free?", a: "Yes, both single page audits and massive bulk tracking are 100% free." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-rose-900 via-red-900 to-rose-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[60%] rounded-full bg-rose-500 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Page Speed <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-300">Analyzer</span>
          </h1>
          <p className="text-lg text-rose-100 max-w-2xl mx-auto font-light">
            Measure TTFB, total payload size, and core web vitals instantly. Identify exactly what's slowing your websites down.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-rose-50 text-rose-700 border-b-2 border-rose-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Gauge className="w-5 h-5" />
              Single URL Analysis
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-rose-50 text-rose-700 border-b-2 border-rose-600" : "text-slate-500 hover:bg-slate-50"}`}
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
                      className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-rose-500 outline-none text-lg shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleSingleLookup()}
                    />
                  </div>
                  <button
                    onClick={handleSingleLookup}
                    disabled={singleLoading}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {singleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gauge className="w-5 h-5" />}
                    Analyze Speed
                  </button>
                </div>
                
                {/* Results Area */}
                {singleResults !== null && (
                  <div className="animate-fade-in">
                    
                    {/* Score Header */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm">
                      <div>
                         <h2 className="text-xl font-bold text-slate-800 mb-1 truncate max-w-md">{singleResults.url}</h2>
                         <p className="text-sm text-slate-500">Live Desktop Performance Metrics</p>
                      </div>
                      <div className="text-center">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                         <div className={`text-4xl font-extrabold ${getScoreColor(singleResults.score)}`}>
                            {singleResults.score}
                         </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      
                      {/* Metric Cards */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                         <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                           <Activity className="w-5 h-5" />
                         </div>
                         <p className="text-slate-500 text-xs font-bold uppercase mb-1">Time to First Byte</p>
                         <p className={`text-2xl font-bold ${singleResults.ttfb < 600 ? 'text-emerald-500' : 'text-red-500'}`}>
                           {singleResults.ttfb} <span className="text-sm">ms</span>
                         </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                         <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                           <Gauge className="w-5 h-5" />
                         </div>
                         <p className="text-slate-500 text-xs font-bold uppercase mb-1">First Contentful</p>
                         <p className={`text-2xl font-bold ${singleResults.fcp < 1.8 ? 'text-emerald-500' : 'text-amber-500'}`}>
                           {singleResults.fcp} <span className="text-sm">s</span>
                         </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                         <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                           <FileText className="w-5 h-5" />
                         </div>
                         <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Payload</p>
                         <p className={`text-2xl font-bold ${singleResults.totalMb < 3 ? 'text-slate-700' : 'text-red-500'}`}>
                           {singleResults.totalMb} <span className="text-sm">MB</span>
                         </p>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center">
                         <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-3">
                           <Zap className="w-5 h-5" />
                         </div>
                         <p className="text-slate-500 text-xs font-bold uppercase mb-1">HTTP Requests</p>
                         <p className={`text-2xl font-bold ${(singleResults.requestCount||0) <= 50 ? 'text-emerald-500' : (singleResults.requestCount||0) <= 100 ? 'text-amber-500' : 'text-red-500'}`}>
                           {singleResults.requestCount ?? 0} <span className="text-sm">reqs</span>
                         </p>
                      </div>

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
                    className="w-full border-2 border-dashed border-slate-300 hover:border-rose-400 bg-slate-50 hover:bg-rose-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload URL List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Upload a CSV file containing your list of URLs to run an automated headless-browser performance audit.</p>
                    
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                    
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                   <button
                    onClick={startBulkGeneration}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Server className="w-5 h-5" />
                    Run Bulk Audit
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-rose-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus || "Processing..."}</p>
                    
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-rose-500 to-red-500 transition-all duration-300 ease-out absolute left-0 top-0" 
                        style={{ width: `${bulkProgress}%` }} 
                      />
                    </div>
                    <p className="text-sm font-bold text-rose-600 mt-2">{bulkProgress}%</p>
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
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Audit Complete!</h3>
                    <p className="text-green-700 mb-6">Your bulk Playwright performance report has been downloaded.</p>
                    <button 
                      onClick={() => { setBulkSuccess(false); setSelectedFile(null); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
                    >
                      Audit Another List
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
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Public Cloud APIs</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When analyzing a single URL, our platform delegates the massive computing power required for rendering to public Cloud APIs. This results in incredibly accurate Core Web Vitals with zero latency added to your experience.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-orange-600">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Headless Chromium Engines</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When analyzing massive CSV files, we utilize dedicated Python workers equipped with Playwright headless browsers. They physically navigate to every URL in the background, intercept network payloads, and calculate exact loading times.
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
                    <ChevronUp className="w-5 h-5 text-rose-500" />
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
