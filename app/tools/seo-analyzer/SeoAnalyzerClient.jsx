"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { 
  Globe, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Search, FileText, Zap, Server, BarChart3, Target, Type, Link as LinkIcon, Image as ImageIcon
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";
import Link from "next/link";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB for CSV
const POLLING_INTERVAL = 2000;

export default function SeoAnalyzerClient() {
  const [activeTab, setActiveTab] = useState("single"); // 'single' or 'bulk'
  
  // Single Mode State
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [singleResults, setSingleResults] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  
  // Bulk Mode State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  
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
      const res = await fetch(`${API_V1}/tools/proxy-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, method: "GET" })
      });
      
      if (!res.ok) throw new Error("Failed to communicate with proxy server.");
      
      const proxyData = await res.json();
      if (proxyData.error || !proxyData.body) {
         throw new Error(proxyData.body || "Failed to reach the website. It might be blocking automated requests or down.");
      }
      
      const htmlText = proxyData.body;
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      
      // Extract Basic SEO Metrics
      const title = doc.title || "Missing Title";
      const metaDescTag = doc.querySelector('meta[name="description"]');
      const metaDesc = metaDescTag ? metaDescTag.getAttribute("content") : "Missing Description";
      
      // Heading Structure
      const h1Count = doc.querySelectorAll('h1').length;
      const h2Count = doc.querySelectorAll('h2').length;
      const h3Count = doc.querySelectorAll('h3').length;
      const h4Count = doc.querySelectorAll('h4').length;
      const h5Count = doc.querySelectorAll('h5').length;
      const h6Count = doc.querySelectorAll('h6').length;
      
      // Images
      const images = doc.querySelectorAll('img');
      const imgTotal = images.length;
      let imgMissingAlt = 0;
      images.forEach(img => {
        if (!img.hasAttribute('alt') || img.getAttribute('alt').trim() === "") {
          imgMissingAlt++;
        }
      });

      // Links Analysis
      const linkElements = doc.querySelectorAll('a');
      let internalLinksCount = 0;
      let externalLinksCount = 0;
      let keywordInInternalLinks = 0;
      let keywordInExternalLinks = 0;

      const baseDomain = new URL(targetUrl).hostname;
      const targetKw = keyword.trim().toLowerCase();

      linkElements.forEach(a => {
        const href = a.getAttribute('href');
        if (!href || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
        
        let isInternal = false;
        if (href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) {
          isInternal = true;
        } else {
          try {
            const urlObj = new URL(href, targetUrl);
            if (urlObj.hostname === baseDomain || urlObj.hostname.endsWith('.' + baseDomain)) {
              isInternal = true;
            }
          } catch(e) {}
        }

        if (isInternal) {
          internalLinksCount++;
          if (targetKw && a.innerText.toLowerCase().includes(targetKw)) {
             keywordInInternalLinks++;
          }
        } else {
          externalLinksCount++;
          if (targetKw && a.innerText.toLowerCase().includes(targetKw)) {
             keywordInExternalLinks++;
          }
        }
      });

      // Keyword Analysis
      let keywordInTitle = false;
      let keywordInDesc = false;
      let keywordInH1 = false;
      let keywordTotalOccurrences = 0;
      let keywordInBold = 0;

      if (targetKw) {
         if (title.toLowerCase().includes(targetKw)) keywordInTitle = true;
         if (metaDesc.toLowerCase().includes(targetKw)) keywordInDesc = true;
         
         doc.querySelectorAll('h1').forEach(h1 => {
           if (h1.innerText.toLowerCase().includes(targetKw)) keywordInH1 = true;
         });

         const bodyText = doc.body.innerText.toLowerCase();
         const escapedKw = targetKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
         const matches = bodyText.match(new RegExp(escapedKw, 'g'));
         keywordTotalOccurrences = matches ? matches.length : 0;

         doc.querySelectorAll('b, strong').forEach(el => {
           if (el.innerText.toLowerCase().includes(targetKw)) keywordInBold++;
         });
      }

      // Suggestions
      const suggestions = [];
      if (title === "Missing Title") {
        suggestions.push({ type: 'error', text: 'Add a Title Tag to your webpage.' });
      } else if (title.length < 10 || title.length > 60) {
        suggestions.push({ type: 'warning', text: 'Optimize Title Tag length (aim for 50-60 characters).' });
      }

      if (metaDesc === "Missing Description") {
        suggestions.push({ type: 'error', text: 'Add a Meta Description to your webpage.' });
      } else if (metaDesc.length < 50 || metaDesc.length > 160) {
        suggestions.push({ type: 'warning', text: 'Optimize Meta Description length (aim for 150-160 characters).' });
      }

      if (h1Count === 0) {
        suggestions.push({ type: 'error', text: 'No H1 tag found. Your page must have exactly one H1 tag.' });
      } else if (h1Count > 1) {
        suggestions.push({ type: 'warning', text: `You have ${h1Count} H1 tags. It is best practice to have only one main H1 tag per page.` });
      }

      if (imgMissingAlt > 0) {
        suggestions.push({ type: 'error', text: `You have ${imgMissingAlt} images missing the 'alt' attribute. Add descriptive alt text for accessibility and SEO.` });
      }

      if (internalLinksCount === 0) {
        suggestions.push({ type: 'warning', text: 'No internal links found. Internal linking helps search engines crawl your site.' });
      }

      if (targetKw) {
        if (!keywordInTitle) suggestions.push({ type: 'warning', text: 'Target keyword is not found in the Title Tag. Add it closer to the beginning of the title.' });
        if (!keywordInDesc) suggestions.push({ type: 'warning', text: 'Target keyword is not found in the Meta Description.' });
        if (!keywordInH1 && h1Count > 0) suggestions.push({ type: 'warning', text: 'Target keyword is not found in the H1 Tag.' });
        if (keywordTotalOccurrences === 0) {
          suggestions.push({ type: 'error', text: 'Target keyword is completely missing from the page content.' });
        } else if (keywordTotalOccurrences > 50) {
          suggestions.push({ type: 'warning', text: `Target keyword appears ${keywordTotalOccurrences} times. Be careful not to keyword stuff.` });
        }
        if (keywordInBold === 0 && keywordTotalOccurrences > 0) {
          suggestions.push({ type: 'info', text: 'Consider highlighting your target keyword inside a <strong> or <b> tag.' });
        }
        if (keywordInInternalLinks === 0 && internalLinksCount > 0) {
          suggestions.push({ type: 'info', text: 'Consider using your target keyword in the anchor text of an internal link.' });
        }
      }
      
      if (suggestions.length === 0) {
         suggestions.push({ type: 'success', text: 'Great job! No major on-page SEO issues detected.' });
      }

      // Simple Scoring System
      let score = 100;
      if (title === "Missing Title" || title.length < 10) score -= 15;
      if (metaDesc === "Missing Description" || metaDesc.length < 50) score -= 15;
      if (h1Count === 0) score -= 15;
      if (h1Count > 1) score -= 5;
      if (imgTotal > 0) score -= Math.round((imgMissingAlt / imgTotal) * 15); 
      if (targetKw && !keywordInTitle) score -= 10;
      if (targetKw && !keywordInDesc) score -= 5;
      if (targetKw && !keywordInH1) score -= 5;
      if (targetKw && keywordTotalOccurrences === 0) score -= 10;
      if (suggestions.filter(s => s.type === 'error').length > 3) score -= 10;
      score = Math.max(0, score);

      setSingleResults({
        url: targetUrl,
        score,
        title,
        titleLength: title.length,
        metaDesc,
        metaDescLength: metaDesc.length,
        headings: { h1: h1Count, h2: h2Count, h3: h3Count, h4: h4Count, h5: h5Count, h6: h6Count },
        imgTotal,
        imgMissingAlt,
        links: {
           internal: internalLinksCount,
           external: externalLinksCount,
           internalKeyword: keywordInInternalLinks,
           externalKeyword: keywordInExternalLinks
        },
        keyword: targetKw,
        keywordStats: {
           total: keywordTotalOccurrences,
           bold: keywordInBold,
           inTitle: keywordInTitle,
           inDesc: keywordInDesc,
           inH1: keywordInH1
        },
        suggestions
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

      const res = await fetch(`${API_V1}/tools/seo-analyze`, {
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

  const getSuggestionIcon = (type) => {
    if (type === 'error') return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
    if (type === 'warning') return <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />;
    if (type === 'success') return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
    return <Zap className="w-5 h-5 text-blue-500 shrink-0" />;
  };

  const faqs = [
    { q: "What SEO metrics does this tool check?", a: "We perform a comprehensive on-page audit. This includes checking Title tags, Meta Descriptions, Heading hierarchies (H1 to H6), internal/external links, keyword density, and validating Image ALT attributes." },
    { q: "How does the single URL analyzer work?", a: "To provide maximum speed with zero server dependency, your browser fetches the website's HTML through a secure public proxy and uses your own computer's processing power to parse the DOM and calculate the SEO score instantly." },
    { q: "How does the Keyword Tracking work?", a: "By entering an optional Target Keyword, we trace its exact occurrences in the title, description, headings, visible text, strong/bold tags, and anchor texts of internal/external links to ensure optimal keyword density." },
    { q: "How does the Bulk CSV feature work?", a: "If you need to audit thousands of URLs, you can upload a CSV list. We securely offload this massive batch to our backend servers. Our Python workers utilize advanced scraping libraries to recursively iterate through your list, preventing browser freezes and returning a pristine CSV report." },
    { q: "Is it completely free?", a: "Yes, both single page audits and massive bulk SEO crawls are completely free." }
  ];

  return (
    <div className="min-h-screen  font-sans pb-24">
      
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
                <div className="flex flex-col md:flex-row gap-4 mb-10 max-w-4xl mx-auto">
                  <div className="relative flex-[2]">
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
                  <div className="relative flex-1">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder="Target Keyword (Optional)"
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
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8 flex items-center justify-between shadow-sm">
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

                    {/* Improvement Suggestions */}
                    <div className="mb-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                       <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                         <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                           <Zap className="w-5 h-5 text-blue-500" />
                           Improvement Suggestions
                         </h3>
                       </div>
                       <div className="p-6">
                         <ul className="space-y-4">
                           {singleResults.suggestions.map((s, idx) => (
                             <li key={idx} className="flex items-start gap-3 bg-white">
                               {getSuggestionIcon(s.type)}
                               <span className={`text-sm ${s.type === 'error' ? 'text-slate-800 font-semibold' : 'text-slate-600'}`}>{s.text}</span>
                             </li>
                           ))}
                         </ul>
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      
                      {/* Meta Card */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                         <h3 className="font-bold text-lg flex items-center gap-2 border-b border-slate-100 pb-2">
                           <FileText className="w-5 h-5 text-blue-500" />
                           Meta Tags
                         </h3>
                         
                         <div>
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

                      {/* Headings Structure */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                           <Type className="w-5 h-5 text-indigo-500" />
                           Heading Structure
                         </h3>
                         <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">H1</p>
                              <p className={`text-xl font-bold ${singleResults.headings.h1 === 1 ? 'text-emerald-500' : 'text-red-500'}`}>{singleResults.headings.h1}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">H2</p>
                              <p className="text-xl font-bold text-slate-700">{singleResults.headings.h2}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">H3</p>
                              <p className="text-xl font-bold text-slate-700">{singleResults.headings.h3}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">H4</p>
                              <p className="text-xl font-bold text-slate-700">{singleResults.headings.h4}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">H5</p>
                              <p className="text-xl font-bold text-slate-700">{singleResults.headings.h5}</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">H6</p>
                              <p className="text-xl font-bold text-slate-700">{singleResults.headings.h6}</p>
                            </div>
                         </div>
                      </div>

                      {/* Links & Images */}
                      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                         <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                           <LinkIcon className="w-5 h-5 text-teal-500" />
                           Links & Images
                         </h3>
                         
                         <div className="space-y-4">
                           <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-slate-400" />
                                <span className="font-semibold text-sm text-slate-700">Internal Links</span>
                              </div>
                              <span className="font-bold text-slate-800">{singleResults.links.internal}</span>
                           </div>
                           <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <span className="font-semibold text-sm text-slate-700">External Links</span>
                              </div>
                              <span className="font-bold text-slate-800">{singleResults.links.external}</span>
                           </div>
                           <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                <div>
                                  <span className="font-semibold text-sm text-slate-700 block">Images</span>
                                  <span className="text-xs text-red-500 font-medium">{singleResults.imgMissingAlt} missing alt</span>
                                </div>
                              </div>
                              <span className="font-bold text-slate-800">{singleResults.imgTotal}</span>
                           </div>
                         </div>
                      </div>

                      {/* Keyword Density Panel */}
                      {singleResults.keyword && (
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                           <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                             <Target className="w-5 h-5 text-rose-500" />
                             Keyword Density
                           </h3>
                           <p className="text-sm font-medium text-slate-500 mb-4">
                             Target: <span className="text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded">"{singleResults.keyword}"</span>
                           </p>

                           <div className="space-y-3">
                             <div className="flex justify-between text-sm">
                               <span className="text-slate-600">Total Occurrences (Text)</span>
                               <span className="font-bold text-slate-800">{singleResults.keywordStats.total}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-slate-600">In &lt;strong&gt; / &lt;b&gt; tags</span>
                               <span className="font-bold text-slate-800">{singleResults.keywordStats.bold}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-slate-600">In Internal Link Anchors</span>
                               <span className="font-bold text-slate-800">{singleResults.links.internalKeyword}</span>
                             </div>
                             <div className="flex justify-between text-sm">
                               <span className="text-slate-600">In External Link Anchors</span>
                               <span className="font-bold text-slate-800">{singleResults.links.externalKeyword}</span>
                             </div>
                             
                             <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
                               <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">In Title</p>
                                  {singleResults.keywordStats.inTitle ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />}
                               </div>
                               <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">In Desc</p>
                                  {singleResults.keywordStats.inDesc ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />}
                               </div>
                               <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                  <p className="text-xs text-slate-400 font-bold uppercase mb-1">In H1</p>
                                  {singleResults.keywordStats.inH1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-red-400 mx-auto" />}
                               </div>
                             </div>
                           </div>
                        </div>
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

        <div className="prose-premium max-w-5xl mx-auto px-6 mb-24">
          <h2>About Our Free SEO Analyzer Tool</h2>
          <p>Missing meta tags and broken heading structures can block search engines from understanding your site. That is why we built this <strong>SEO analyzer</strong>. It scans your pages instantly and highlights exactly what you need to fix to climb the rankings.</p>
          <p>If you're publishing new content or auditing a client's site, you need to know if your target keyword actually appears where it matters. Our tool rips through the raw HTML of your URL. I've used this to quickly spot missing H1 tags and empty image alt attributes that were quietly hurting organic traffic. It gives you the full on-page SEO audit in seconds.</p>

          <h2>How to Run an On-Page SEO Audit</h2>
          <p>Testing a single page or scanning a massive list takes just a few clicks. Here's how you do it:</p>
          <ul>
            <li><strong>Enter the URL:</strong> Paste your webpage link into the search box above.</li>
            <li><strong>Target Keyword (Optional):</strong> Drop in your main keyword to check your exact keyword density.</li>
            <li><strong>Click Analyze:</strong> Hit the button.</li>
            <li><strong>Review Your Score:</strong> The tool instantly prints out a 100-point score, grading your title length, meta description, heading structure, and internal links.</li>
          </ul>
          <p>Need to check hundreds of pages? Switch to the <strong>Bulk CSV Crawler</strong>. Drop your spreadsheet into the upload box. Our backend servers process the entire batch and hand you a clean, organized CSV report.</p>

          <h2>Your Website Data Stays Private</h2>
          <p>We respect your privacy. When you run a single URL through our SEO analyzer, we don't save your scan history or store your domain in a public database.</p>
          <p>Your single page checks run locally in your browser using a secure proxy. If you upload a CSV for a bulk SEO scan, our system reads the file, runs the massive audit, and delivers your results. We delete your uploaded lists from our temporary storage right after your background job finishes. You get total security and full data ownership.</p>

          <h2>Core Features of This SEO Tool</h2>
          <p>We designed this scanner to be fast and completely frictionless.</p>
          <ul>
            <li><strong>Keyword Density Check:</strong> See exactly how many times your target phrase appears in headings, bold tags, and link anchors.</li>
            <li><strong>Heading Hierarchy:</strong> Instantly visualize your H1 through H6 structure to ensure logical flow.</li>
            <li><strong>Bulk CSV Support:</strong> Audit thousands of URLs simultaneously without freezing your browser.</li>
            <li><strong>Actionable Suggestions:</strong> Get clear warnings for missing alt text, long meta descriptions, and missing title tags.</li>
          </ul>

          <h2>How the SEO Scanner Works Under the Hood</h2>
          <p>Most lightweight scanners fail because modern websites block automated requests.</p>
          <p>To fix this, our single-page analyzer routes your request through a secure backend proxy. It grabs the raw HTML and uses your browser's native DOMParser engine to compute the metrics locally. This creates a blazing-fast experience. For massive CSV files, we utilize dedicated Python scraping workers on our backend. These servers securely crawl thousands of pages, bypass rate limits, and bundle the exact SEO data into a simple spreadsheet.</p>

          <h2>Frequently Asked Questions</h2>
          <h3>What makes a good on-page SEO score?</h3>
          <p>A score above 90 means your technical foundation is solid. You should have one clear H1 tag, a meta description between 50 and 160 characters, and descriptive alt text on all your images. Our tool flags anything that falls outside these best practices.</p>

          <h3>Why is keyword density important?</h3>
          <p>If you don't use your target keyword enough, search engines might not understand your topic. If you use it too much, you risk a penalty for keyword stuffing. We track your exact keyword count across the page, including inside bold tags and internal links, so you hit the sweet spot.</p>

          <h3>Can I run a bulk SEO audit for free?</h3>
          <p>Yes. You can upload a CSV list of URLs to our bulk crawler. Our backend servers will automatically check the title tags, meta descriptions, and heading counts for every link on your list and give you a downloadable report.</p>

          <h3>Does this tool check external links?</h3>
          <p>Yes. Our scanner counts all internal links pointing to your own domain and external links pointing away. Internal links help search engines crawl your site, while relevant external links show that your content is well-researched.</p>
        </div>

        {/* Related Tools */}
        <div className="max-w-5xl mx-auto px-6 mb-24">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Related SEO Tools</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/tools/redirect-checker" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 group block">
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Redirect Checker</h3>
              <p className="text-slate-600 text-sm">Trace the exact path of any URL and discover hidden 301 and 302 redirect chains.</p>
            </Link>
            <Link href="/tools/website-content-extractor" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 group block">
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Content Extractor</h3>
              <p className="text-slate-600 text-sm">Extract clean text, headings, and images from any URL for fast content analysis.</p>
            </Link>
            <Link href="/tools/webhook-tester" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:border-blue-300 group block">
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Webhook Tester</h3>
              <p className="text-slate-600 text-sm">Generate a unique URL to test and inspect HTTP requests and webhooks in real-time.</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
