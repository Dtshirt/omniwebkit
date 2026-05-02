"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import { 
  Globe, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Search, FileText, Zap, Server
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024; // 50MB for CSV
const POLLING_INTERVAL = 2000;

export default function DnsLookupClient() {
  const [activeTab, setActiveTab] = useState("single"); // 'single' or 'bulk'
  
  // Single Mode State
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("A"); // A, AAAA, MX, TXT, CNAME, NS
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

  // ─── SINGLE MODE LOGIC (DNS-over-HTTPS) ─────────────────────────────────
  
  const handleSingleLookup = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain name.");
      return;
    }
    
    // basic cleanup
    const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
    setDomain(cleanDomain);
    
    setSingleLoading(true);
    setSingleResults(null);
    
    try {
      // Use Cloudflare's public DNS-over-HTTPS endpoint
      // This eliminates CORS issues and server load completely
      const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${cleanDomain}&type=${recordType}`, {
        headers: {
          'accept': 'application/dns-json'
        }
      });
      
      if (!res.ok) throw new Error("Failed to resolve DNS query.");
      
      const data = await res.json();
      
      if (data.Status !== 0) {
        throw new Error(`DNS Error: ${data.Status}`);
      }
      
      if (!data.Answer || data.Answer.length === 0) {
        setSingleResults([]);
      } else {
        setSingleResults(data.Answer);
      }
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to lookup records.");
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
    setBulkStatus("Uploading domain list to server...");
    setProgress(10);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("record_type", recordType);

      const res = await fetch(`${API_V1}/tools/dns-lookup`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
      setBulkStatus("Server resolving DNS queries in batch...");
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
          // Download the file
          const downloadRes = await fetch(`${API_V1}/download/${jobId}`);
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            saveAs(blob, `dns_results_${recordType}.csv`);
            setBulkSuccess(true);
            toast.success("Bulk lookup completed successfully!");
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
    { q: "What record types can I query?", a: "We support the most common DNS records: A (IPv4), AAAA (IPv6), MX (Mail Exchange), TXT (Text Records), CNAME (Canonical Name), and NS (Name Servers)." },
    { q: "How does the single lookup work?", a: "Our platform leverages secure DNS-over-HTTPS (DoH) public resolvers. When you search for a single domain, your browser fetches the records directly from top-tier DNS providers without passing through our servers, guaranteeing speed and privacy." },
    { q: "How does the Bulk CSV feature work?", a: "If you need to query thousands of domains simultaneously, you can upload a CSV list. We securely offload this massive batch to our robust backend servers, which utilize Python's dedicated DNS libraries to process the queue and return a pristine CSV of the results." },
    { q: "Is it completely free?", a: "Yes, both single queries and massive bulk lookups are completely free." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-800 to-emerald-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[30%] right-[20%] w-[30%] h-[50%] rounded-full bg-emerald-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">DNS Lookup Tool</span>
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto font-light">
            Instantly query A, AAAA, MX, TXT, CNAME, and NS records. Verify single domains instantly or upload a CSV for massive bulk lookups.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Search className="w-5 h-5" />
              Single Lookup
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" />
              Bulk CSV Batch
            </button>
          </div>

          <div className="p-8">
            
            {/* Options Bar (Shared) */}
            <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm mx-auto">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                Select Record Type
              </label>
              <select 
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                disabled={isProcessing}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
              >
                <option value="A">A (IPv4 Address)</option>
                <option value="AAAA">AAAA (IPv6 Address)</option>
                <option value="MX">MX (Mail Exchange)</option>
                <option value="TXT">TXT (Text Record)</option>
                <option value="CNAME">CNAME (Canonical Name)</option>
                <option value="NS">NS (Name Server)</option>
              </select>
            </div>

            {/* SINGLE TAB */}
            {activeTab === "single" && (
              <div>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="Enter domain name (e.g., example.com)"
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-4 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg"
                    onKeyDown={(e) => e.key === 'Enter' && handleSingleLookup()}
                  />
                  <button
                    onClick={handleSingleLookup}
                    disabled={singleLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {singleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Lookup
                  </button>
                </div>
                
                {/* Results Area */}
                {singleResults !== null && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700">
                      Results for {domain} ({recordType})
                    </div>
                    {singleResults.length === 0 ? (
                       <div className="p-8 text-center text-slate-500">
                         No {recordType} records found.
                       </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50 text-slate-500 uppercase">
                            <tr>
                              <th className="px-6 py-3 font-bold">Name</th>
                              <th className="px-6 py-3 font-bold">TTL</th>
                              <th className="px-6 py-3 font-bold">Data</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {singleResults.map((rec, idx) => (
                              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium">{rec.name}</td>
                                <td className="px-6 py-4 text-slate-500">{rec.TTL}</td>
                                <td className="px-6 py-4 font-mono text-emerald-700 break-all">{rec.data}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BULK UPLOAD TAB */}
            {activeTab === "bulk" && (
              <div className="flex flex-col items-center w-full">
                {!isProcessing && !bulkSuccess && (
                  <div 
                    className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload Domain CSV</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Upload a CSV file containing your list of domains in the first column.</p>
                    
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
                    Run Bulk Query
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
                    <p className="font-bold text-lg mb-1">Batch Query Failed</p>
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
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Query Complete!</h3>
                    <p className="text-green-700 mb-6">Your bulk DNS results have been downloaded successfully.</p>
                    <button 
                      onClick={() => { setBulkSuccess(false); setSelectedFile(null); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
                    >
                      Process Another List
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
            <h3 className="text-lg font-bold mb-2">DNS-over-HTTPS (DoH)</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When using the Single Lookup tool, your browser bypasses traditional, insecure networks and queries Cloudflare's massive public DNS resolvers directly via encrypted HTTPS. This means zero latency and maximum privacy.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-teal-600">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Backend Scale Processing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              When processing massive CSV lists, we offload the heavy networking logic to our cloud architecture. Python workers recursively iterate through your list, preventing rate-limits and producing a clean export file.
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
