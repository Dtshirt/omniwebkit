"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { 
  Globe, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Search, FileText, Zap, Server, AlignLeft, Type
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const POLLING_INTERVAL = 2000;

// Basic English Stopwords
const STOP_WORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","aren't","as","at","be","because","been","before","being","below","between","both","but","by","can't","cannot","could","couldn't","did","didn't","do","does","doesn't","doing","don't","down","during","each","few","for","from","further","had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll","he's","her","here","here's","hers","herself","him","himself","his","how","how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's","its","itself","let's","me","more","most","mustn't","my","myself","no","nor","not","of","off","on","once","only","or","other","ought","our","ours","ourselves","out","over","own","same","shan't","she","she'd","she'll","she's","should","shouldn't","so","some","such","than","that","that's","the","their","theirs","them","themselves","then","there","there's","these","they","they'd","they'll","they're","they've","this","those","through","to","too","under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've","were","weren't","what","what's","when","when's","where","where's","which","while","who","who's","whom","why","why's","with","won't","would","wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself","yourselves"
]);

export default function KeywordDensityClient() {
  const [activeTab, setActiveTab] = useState("single"); // 'single' or 'bulk'
  
  // Single Mode State
  const [inputType, setInputType] = useState("url"); // 'url' or 'text'
  const [inputValue, setInputValue] = useState("");
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

  // ─── SINGLE MODE LOGIC (Browser JS NLP) ──────────────────────────────────
  
  const extractTextFromHtml = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove scripts and styles
    doc.querySelectorAll('script, style, noscript, header, footer, nav').forEach(el => el.remove());
    
    return doc.body.textContent || "";
  };

  const getNGrams = (words, n) => {
    const ngrams = [];
    for (let i = 0; i <= words.length - n; i++) {
      ngrams.push(words.slice(i, i + n).join(" "));
    }
    return ngrams;
  };

  const calculateFrequencies = (tokens, totalWordsCount) => {
    const counts = {};
    for (const t of tokens) {
      counts[t] = (counts[t] || 0) + 1;
    }
    
    return Object.keys(counts).map(word => {
      const count = counts[word];
      // Note: for n-grams, 'totalWordsCount' represents total possible n-grams.
      // We will just use total single words as the denominator for density conventionally
      const density = ((count / totalWordsCount) * 100).toFixed(2);
      return { word, count, density: parseFloat(density) };
    }).sort((a, b) => b.count - a.count).slice(0, 10);
  };

  const analyzeText = (text) => {
    // Basic cleanup
    const cleanText = text.toLowerCase().replace(/[^a-z\s]/g, ' ');
    const rawWords = cleanText.split(/\s+/).filter(w => w.length > 0);
    
    const filteredWords = rawWords.filter(w => !STOP_WORDS.has(w) && w.length > 2);
    
    const totalWords = filteredWords.length;
    if (totalWords === 0) return null;

    const oneWord = calculateFrequencies(filteredWords, totalWords);
    const twoWord = calculateFrequencies(getNGrams(filteredWords, 2), totalWords);
    const threeWord = calculateFrequencies(getNGrams(filteredWords, 3), totalWords);

    return { totalWords, oneWord, twoWord, threeWord };
  };

  const handleSingleLookup = async () => {
    const val = inputValue.trim();
    if (!val) {
      toast.error(`Please enter some ${inputType}.`);
      return;
    }
    
    setSingleLoading(true);
    setSingleResults(null);
    
    try {
      let textToAnalyze = val;
      
      if (inputType === "url") {
        let targetUrl = val;
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl;
          setInputValue(targetUrl);
        }
        
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`;
        const res = await fetch(proxyUrl);
        
        if (!res.ok) throw new Error("Failed to reach the website. Ensure it is accessible.");
        
        const htmlText = await res.text();
        textToAnalyze = extractTextFromHtml(htmlText);
      }
      
      const results = analyzeText(textToAnalyze);
      if (!results) {
         throw new Error("No valid words found to analyze.");
      }
      
      setSingleResults(results);
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Analysis failed.");
    } finally {
      setSingleLoading(false);
    }
  };

  // ─── BULK MODE LOGIC (FastAPI + NLTK) ────────────────────────────────────
  
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

      const res = await fetch(`${API_V1}/tools/keyword-density`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
      setBulkStatus("Servers extracting text & running NLTK algorithms...");
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
            saveAs(blob, `keyword_density_results.csv`);
            setBulkSuccess(true);
            toast.success("Bulk NLP Analysis completed!");
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

  const faqs = [
    { q: "What is Keyword Density?", a: "Keyword density is the percentage of times a keyword or phrase appears on a webpage compared to the total number of words. It was traditionally used by search engines to determine relevance, and while TF-IDF is more modern, density remains a vital foundational metric." },
    { q: "How does the client-side analyzer work?", a: "When you analyze pasted text or a single URL, the processing happens entirely within your web browser using highly optimized JavaScript arrays to filter out English stop-words and calculate exact N-gram frequencies instantly." },
    { q: "How does the Bulk CSV feature work?", a: "To prevent your browser from crashing when analyzing thousands of URLs, uploading a CSV transfers the workload to our backend servers. Our Python workers utilize the industry-standard NLTK (Natural Language Toolkit) library to extract text, filter stop-words, and return a comprehensive CSV." },
    { q: "Is this free?", a: "Yes, both single text analysis and massive bulk NLP tracking are 100% free." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-fuchsia-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[60%] rounded-full bg-violet-500 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Keyword <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">Density Checker</span>
          </h1>
          <p className="text-lg text-violet-100 max-w-2xl mx-auto font-light">
            Analyze exact word frequencies, density percentages, and N-gram phrases from any text or URL instantly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-violet-50 text-violet-700 border-b-2 border-violet-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <AlignLeft className="w-5 h-5" />
              Single Analysis
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-violet-50 text-violet-700 border-b-2 border-violet-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" />
              Bulk CSV NLP
            </button>
          </div>

          <div className="p-8">

            {/* SINGLE TAB */}
            {activeTab === "single" && (
              <div>
                
                <div className="flex justify-center gap-4 mb-6">
                  <button 
                    onClick={() => {setInputType("url"); setInputValue(""); setSingleResults(null);}}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${inputType === "url" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    Analyze URL
                  </button>
                  <button 
                    onClick={() => {setInputType("text"); setInputValue(""); setSingleResults(null);}}
                    className={`px-6 py-2 rounded-full font-bold text-sm transition-colors ${inputType === "text" ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    Paste Text
                  </button>
                </div>

                <div className="flex flex-col mb-10 max-w-3xl mx-auto">
                  {inputType === "url" ? (
                    <div className="relative mb-4">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-violet-500 outline-none text-lg shadow-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleSingleLookup()}
                      />
                    </div>
                  ) : (
                    <div className="relative mb-4">
                      <Type className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                      <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Paste your article or text here..."
                        rows={6}
                        className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-violet-500 outline-none text-lg shadow-sm resize-y"
                      />
                    </div>
                  )}
                  
                  <button
                    onClick={handleSingleLookup}
                    disabled={singleLoading}
                    className="w-full sm:w-auto self-center bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 px-12 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {singleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Calculate Density
                  </button>
                </div>
                
                {/* Results Area */}
                {singleResults !== null && (
                  <div className="animate-fade-in">
                    
                    {/* Header */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-6 flex items-center justify-between shadow-sm">
                      <div>
                         <h2 className="text-xl font-bold text-slate-800 mb-1">Density Report</h2>
                         <p className="text-sm text-slate-500">Excludes standard English stop-words</p>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Valid Words</p>
                         <div className="text-3xl font-extrabold text-violet-600">
                            {singleResults.totalWords}
                         </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      
                      {/* 1 Word */}
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                         <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                           <span className="w-6 h-6 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs">1</span>
                           Word Phrases
                         </div>
                         <table className="w-full text-left text-sm">
                           <thead className="text-slate-400 border-b border-slate-100">
                             <tr>
                               <th className="px-4 py-2 font-normal">Keyword</th>
                               <th className="px-4 py-2 font-normal text-right">Count</th>
                               <th className="px-4 py-2 font-normal text-right">%</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                             {singleResults.oneWord.map((item, idx) => (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-4 py-3 font-medium text-slate-800 capitalize">{item.word}</td>
                                 <td className="px-4 py-3 text-right">{item.count}</td>
                                 <td className="px-4 py-3 text-right font-bold text-violet-600">{item.density}%</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                      </div>

                      {/* 2 Word */}
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                         <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                           <span className="w-6 h-6 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center text-xs">2</span>
                           Word Phrases
                         </div>
                         <table className="w-full text-left text-sm">
                           <thead className="text-slate-400 border-b border-slate-100">
                             <tr>
                               <th className="px-4 py-2 font-normal">Keyword</th>
                               <th className="px-4 py-2 font-normal text-right">Count</th>
                               <th className="px-4 py-2 font-normal text-right">%</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                             {singleResults.twoWord.map((item, idx) => (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-4 py-3 font-medium text-slate-800 capitalize truncate max-w-[120px]">{item.word}</td>
                                 <td className="px-4 py-3 text-right">{item.count}</td>
                                 <td className="px-4 py-3 text-right font-bold text-fuchsia-600">{item.density}%</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                      </div>

                      {/* 3 Word */}
                      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                         <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                           <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">3</span>
                           Word Phrases
                         </div>
                         <table className="w-full text-left text-sm">
                           <thead className="text-slate-400 border-b border-slate-100">
                             <tr>
                               <th className="px-4 py-2 font-normal">Keyword</th>
                               <th className="px-4 py-2 font-normal text-right">Count</th>
                               <th className="px-4 py-2 font-normal text-right">%</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                             {singleResults.threeWord.map((item, idx) => (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-4 py-3 font-medium text-slate-800 capitalize truncate max-w-[120px]">{item.word}</td>
                                 <td className="px-4 py-3 text-right">{item.count}</td>
                                 <td className="px-4 py-3 text-right font-bold text-indigo-600">{item.density}%</td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
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
                    className="w-full border-2 border-dashed border-slate-300 hover:border-violet-400 bg-slate-50 hover:bg-violet-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload URL List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Upload a CSV file containing your list of URLs to run bulk NLTK keyword density analysis.</p>
                    
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                    
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-violet-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                   <button
                    onClick={startBulkGeneration}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Server className="w-5 h-5" />
                    Run Bulk Analysis
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus || "Processing..."}</p>
                    
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 ease-out absolute left-0 top-0" 
                        style={{ width: `${bulkProgress}%` }} 
                      />
                    </div>
                    <p className="text-sm font-bold text-violet-600 mt-2">{bulkProgress}%</p>
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
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Analysis Complete!</h3>
                    <p className="text-green-700 mb-6">Your bulk NLTK Keyword Density report has been downloaded.</p>
                    <button 
                      onClick={() => { setBulkSuccess(false); setSelectedFile(null); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
                    >
                      Analyze Another List
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
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4 text-violet-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Client-Side Heuristics</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              For single analyses, your browser natively executes high-performance Regex loops. It filters out English stop-words instantly, creating unigrams, bigrams, and trigrams without transferring your private text to our servers.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4 text-fuchsia-600">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Python NLTK Backend</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When processing massive CSV files containing thousands of URLs, we offload the work to our dedicated Python cloud. We utilize the Natural Language Toolkit (NLTK) to efficiently parse HTML content and extract keyword metrics globally.
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
                    <ChevronUp className="w-5 h-5 text-violet-500" />
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
