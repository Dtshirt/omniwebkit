"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { 
  Globe, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Search, FileText, Zap, Server, BarChart3
} from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB for CSV
const POLLING_INTERVAL = 2000;

export default function SeoAnalyzerClient() {
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

  // ─── SINGLE MODE LOGIC (CORS Proxy + DOMParser) ────────────────────────
  
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
      // Use corsproxy.io to bypass browser CORS restrictions and fetch raw HTML
      const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
      const res = await fetch(proxyUrl);
      
      if (!res.ok) throw new Error("Failed to reach the website. It might be blocking proxies or down.");
      
      const htmlText = await res.text();
      
      // Parse HTML locally using browser's native DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      // Extract SEO Metrics
      const title = doc.title || "Missing Title";
      const metaDescTag = doc.querySelector('meta[name="description"]');
      const metaDesc = metaDescTag ? metaDescTag.getAttribute("content") : "Missing Description";
      
      const h1Count = doc.querySelectorAll('h1').length;
      const h2Count = doc.querySelectorAll('h2').length;
      
      const images = doc.querySelectorAll('img');
      const imgTotal = images.length;
      let imgMissingAlt = 0;
      images.forEach(img => {
        if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === "") {
          imgMissingAlt++;
        }
      });

      // Simple Scoring System
      let score = 100;
      if (title === "Missing Title" || title.length < 10) score -= 20;
      if (metaDesc === "Missing Description" || metaDesc.length < 50) score -= 20;
      if (h1Count === 0) score -= 15;
      if (h1Count > 1) score -= 5;
      if (imgTotal > 0) {
        score -= Math.round((imgMissingAlt / imgTotal) * 20); // Penalty up to 20 for missing alts
      }

      setSingleResults({
        url: targetUrl,
        score,
        title,
        titleLength: title.length,
        metaDesc,
        metaDescLength: metaDesc.length,
        h1Count,
        h2Count,
        imgTotal,
        imgMissingAlt
      });
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to analyze website.");
    } finally {
      setSingleLoading(false);
    }
  };

  // ─── BULK MODE LOGIC (FastAPI Backend) ──────────────────────────────────
  
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

      const res = await fetch("http://localhost:8000/api/v1/tools/seo-analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
      setBulkStatus("Server scraping and analyzing URLs in batch...");
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
            saveAs(blob, `seo_audit_results.csv`);
            setBulkSuccess(true);
            toast.success("Bulk SEO Audit completed successfully!");
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

  const getScoreColor = (score) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 70) return "text-amber-500";
    return "text-red-500";
  };

  const faqs = [
    { q: "What SEO metrics does this tool check?", a: "We perform a comprehensive on-page audit. This includes checking Title tags, Meta Descriptions, Heading hierarchies (H1, H2), and validating Image ALT attributes." },
    { q: "How does the single URL analyzer work?", a: "To provide maximum speed with zero server dependency, your browser fetches the website's HTML through a secure public proxy and uses your own computer's processing power to parse the DOM and calculate the SEO score instantly." },
    { q: "How does the Bulk CSV feature work?", a: "If you need to audit thousands of URLs, you can upload a CSV list. We securely offload this massive batch to our backend servers. Our Python workers utilize advanced scraping libraries to recursively iterate through your list, preventing browser freezes and returning a pristine CSV report." },
    { q: "Is it completely free?", a: "Yes, both single page audits and massive bulk SEO crawls are completely free." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[40%] h-[60%] rounded-full bg-blue-500 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Website <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">SEO Analyzer</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto font-light">
            Instantly audit any webpage for critical SEO metrics, or upload a CSV to scan thousands of URLs automatically.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Search className="w-5 h-5" />
              Single URL Audit
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" />
              Bulk CSV Crawler
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
                      className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-lg shadow-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleSingleLookup()}
                    />
                  </div>
                  <button
                    onClick={handleSingleLookup}
                    disabled={singleLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {singleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                    Analyze
                  </button>
                </div>
                
                {/* Results Area */}
                {singleResults !== null && (
                  <div className="animate-fade-in">
                    
                    {/* Score Header */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm">
                      <div>
                         <h2 className="text-xl font-bold text-slate-800 mb-1 truncate max-w-md">{singleResults.url}</h2>
                         <p className="text-sm text-slate-500">Live On-Page SEO Audit Results</p>
                      </div>
                      <div className="text-center">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Score</p>
                         <div className={`text-4xl font-extrabold ${getScoreColor(singleResults.score)}`}>
                            {singleResults.score}/100
                         </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Meta Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                           <FileText className="w-5 h-5 text-blue-500" />
                           Meta Tags
                         </h3>
                         
                         <div className="mb-4">
                            <div className="flex justify-between items-end mb-1">
                               <span className="font-bold text-slate-700 text-sm">Title Tag</span>
                               <span className={`text-xs font-bold ${singleResults.titleLength >= 10 && singleResults.titleLength <= 60 ? 'text-emerald-500' : 'text-red-500'}`}>{singleResults.titleLength} chars</span>
                            </div>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{singleResults.title}</p>
                         </div>

                         <div>
                            <div className="flex justify-between items-end mb-1">
                               <span className="font-bold text-slate-700 text-sm">Meta Description</span>
                               <span className={`text-xs font-bold ${singleResults.metaDescLength >= 50 && singleResults.metaDescLength <= 160 ? 'text-emerald-500' : 'text-red-500'}`}>{singleResults.metaDescLength} chars</span>
                            </div>
                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{singleResults.metaDesc}</p>
                         </div>
                      </div>

                      {/* Structure Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                         <div>
                           <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                             <Search className="w-5 h-5 text-indigo-500" />
                             Page Structure
                           </h3>
                           
                           <div className="grid grid-cols-2 gap-4 mb-4">
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                               <p className="text-slate-500 text-xs font-bold uppercase mb-1">H1 Tags</p>
                               <p className={`text-2xl font-bold ${singleResults.h1Count === 1 ? 'text-emerald-500' : 'text-red-500'}`}>{singleResults.h1Count}</p>
                               <p className="text-xs text-slate-400 mt-1">Recommended: 1</p>
                             </div>
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                               <p className="text-slate-500 text-xs font-bold uppercase mb-1">H2 Tags</p>
                               <p className="text-2xl font-bold text-slate-700">{singleResults.h2Count}</p>
                               <p className="text-xs text-slate-400 mt-1">Subheadings</p>
                             </div>
                           </div>

                           <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                              <div>
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Images</p>
                                <p className="font-bold text-slate-700">{singleResults.imgTotal} Total</p>
                              </div>
                              <div className="text-right">
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Missing ALT</p>
                                <p className={`font-bold ${singleResults.imgMissingAlt === 0 ? 'text-emerald-500' : 'text-red-500'}`}>{singleResults.imgMissingAlt}</p>
                              </div>
                           </div>
                         </div>
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
                    className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload URL List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Upload a CSV file containing your list of URLs in the first column to run a batch SEO audit.</p>
                    
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                    
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                   <button
                    onClick={startBulkGeneration}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Server className="w-5 h-5" />
                    Run Bulk Audit
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus || "Processing..."}</p>
                    
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out absolute left-0 top-0" 
                        style={{ width: `${bulkProgress}%` }} 
                      />
                    </div>
                    <p className="text-sm font-bold text-blue-600 mt-2">{bulkProgress}%</p>
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
                    <p className="text-green-700 mb-6">Your bulk SEO audit report has been downloaded automatically.</p>
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
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Browser DOM Parsing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When analyzing a single URL, our platform fetches the raw HTML and utilizes your browser's native DOMParser engine to compute the metrics. This creates an ultra-fast, seamless experience with zero lag.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Enterprise Bulk Crawling</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When analyzing massive CSV files, we utilize dedicated Python scraping workers on our backend. These servers securely crawl thousands of pages recursively, bypass rate limits, and bundle the data into an actionable CSV report.
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
                    <ChevronUp className="w-5 h-5 text-blue-500" />
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
