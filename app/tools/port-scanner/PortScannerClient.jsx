"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import {
  Globe, UploadCloud, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Search, FileText, Server, Zap,
  Wifi, WifiOff, Shield
} from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024;
const POLLING_INTERVAL = 2500;

const PORT_CATEGORIES = {
  "Web": [80, 443, 8080, 8443],
  "Mail": [25, 465, 587, 110, 143, 993, 995],
  "Remote Access": [22, 23, 3389, 5900],
  "Database": [3306, 5432, 1433, 6379, 27017],
  "Other": [21, 53],
};

const SERVICE_COLORS = {
  "Web":          { open: "bg-emerald-100 text-emerald-700 border-emerald-200", closed: "bg-slate-100 text-slate-500 border-slate-200" },
  "Mail":         { open: "bg-blue-100 text-blue-700 border-blue-200",     closed: "bg-slate-100 text-slate-500 border-slate-200" },
  "Remote Access":{ open: "bg-amber-100 text-amber-700 border-amber-200",  closed: "bg-slate-100 text-slate-500 border-slate-200" },
  "Database":     { open: "bg-violet-100 text-violet-700 border-violet-200", closed: "bg-slate-100 text-slate-500 border-slate-200" },
  "Other":        { open: "bg-rose-100 text-rose-700 border-rose-200",     closed: "bg-slate-100 text-slate-500 border-slate-200" },
};

export default function PortScannerClient() {
  const [activeTab, setActiveTab] = useState("single");

  // Single
  const [host, setHost] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Bulk
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(false);

  const [faqOpen, setFaqOpen] = useState(null);

  // ─── Single Mode ──────────────────────────────────────────────────────────

  const handleScan = async () => {
    const h = host.trim();
    if (!h) { toast.error("Please enter a hostname or IP."); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/tools/port-scanner/single?host=${encodeURIComponent(h)}`);
      if (!res.ok) throw new Error("Server error.");
      const data = await res.json();
      if (data.error) toast.error(data.error);
      setResult(data);
    } catch (err) {
      toast.error(err.message || "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Bulk Mode ────────────────────────────────────────────────────────────

  const processFileSelection = (file) => {
    if (!file.name.toLowerCase().endsWith(".csv")) { setBulkError("Please upload a valid CSV file."); return; }
    if (file.size > MAX_CLIENT_SIZE_BYTES) { setBulkError("File too large (max 50MB)."); return; }
    setSelectedFile(file); setBulkError(null); setBulkSuccess(false); setBulkProgress(0);
  };

  const startBulkScan = async () => {
    if (!selectedFile) return;
    setBulkError(null); setBulkSuccess(false); setIsProcessing(true); setBulkProgress(0);
    setBulkStatus("Uploading host list...");
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch("http://localhost:8000/api/v1/tools/port-scanner", { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }
      const { job_id } = await res.json();
      setBulkStatus("Scanning ports across all hosts asynchronously...");
      pollJob(job_id);
    } catch (err) {
      setBulkError(err.message); setIsProcessing(false);
    }
  };

  const pollJob = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to get job status.");
      const job = await res.json();
      if (job.status === "failed") throw new Error(job.error || "Worker failed.");
      if (job.status === "done") {
        const dl = await fetch(`http://localhost:8000/api/v1/download/${jobId}`);
        if (!dl.ok) throw new Error("Download failed.");
        saveAs(await dl.blob(), "port_scan_results.csv");
        setBulkSuccess(true); toast.success("Bulk port scan complete!");
        setIsProcessing(false); setBulkStatus(""); return;
      }
      if (job.progress) setBulkProgress(parseInt(job.progress, 10));
      setTimeout(() => pollJob(jobId), POLLING_INTERVAL);
    } catch (err) {
      setBulkError(err.message); setIsProcessing(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const getPortByNumber = (num) => result?.ports?.find(p => p.port === num);
  const openCount = result?.ports?.filter(p => p.open).length ?? 0;

  const faqs = [
    { q: "Why can't browsers scan ports directly?", a: "Web browsers operate in a strict security sandbox that blocks direct TCP socket connections to arbitrary ports. This is to prevent malicious web pages from scanning your local network or servers without your knowledge." },
    { q: "How is the scan so fast?", a: "All ports are probed simultaneously using Python's asyncio non-blocking concurrency engine. Rather than scanning ports one by one (which would take minutes), every port connection attempt runs in parallel, completing the entire scan in seconds." },
    { q: "Is port scanning legal?", a: "Scanning ports on servers you own or have explicit permission to test is completely legal. Scanning servers without authorization may violate computer crime laws. This tool is intended for legitimate server administration, network diagnostics, and security auditing purposes only." },
    { q: "How does bulk scanning work?", a: "Bulk CSV uploads are dispatched to a dedicated background worker queue. The worker asynchronously scans all ports for each host and compiles the results into a downloadable CSV. Concurrency is carefully controlled to avoid overwhelming the network." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-zinc-900 to-gray-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[50%] h-[70%] rounded-full bg-sky-500 blur-[130px]" />
          <div className="absolute bottom-[10%] left-[5%] w-[30%] h-[50%] rounded-full bg-emerald-500 blur-[130px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Port <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">Scanner</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            Check which ports are open on any server, domain, or IP. Scan HTTP, HTTPS, SSH, MySQL, RDP, and 18 more services instantly.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-sky-50 text-sky-700 border-b-2 border-sky-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Wifi className="w-5 h-5" /> Single Host Scan
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-sky-50 text-sky-700 border-b-2 border-sky-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" /> Bulk CSV Scan
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
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="example.com or 192.168.1.1"
                      className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-sky-500 outline-none text-lg shadow-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleScan()}
                    />
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={loading}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-70 whitespace-nowrap"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    {loading ? "Scanning…" : "Scan Ports"}
                  </button>
                </div>

                {/* Results */}
                {result && (
                  <div className="animate-fade-in">
                    {/* Host Header */}
                    <div className="bg-gradient-to-br from-slate-900 to-zinc-800 text-white rounded-2xl p-6 mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target</p>
                        <h2 className="text-2xl font-extrabold">{result.host}</h2>
                        {result.ip && result.ip !== result.host && (
                          <p className="text-sm text-slate-400 mt-1 font-mono">{result.ip}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Open Ports</p>
                        <p className={`text-4xl font-extrabold ${openCount > 0 ? "text-emerald-400" : "text-slate-400"}`}>{openCount}</p>
                        <p className="text-slate-500 text-xs">/ {result.ports?.length ?? 0}</p>
                      </div>
                    </div>

                    {/* Port Grid by Category */}
                    {Object.entries(PORT_CATEGORIES).map(([category, ports]) => {
                      const colors = SERVICE_COLORS[category];
                      return (
                        <div key={category} className="mb-6">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{category}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {ports.map((portNum) => {
                              const p = getPortByNumber(portNum);
                              if (!p) return null;
                              const style = p.open ? colors.open : colors.closed;
                              return (
                                <div key={portNum} className={`rounded-xl border p-4 flex flex-col gap-1.5 ${style} transition-all`}>
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-xs font-bold">{portNum}</span>
                                    {p.open
                                      ? <Wifi className="w-4 h-4" />
                                      : <WifiOff className="w-4 h-4 opacity-40" />
                                    }
                                  </div>
                                  <p className="text-sm font-semibold">{p.service}</p>
                                  <span className={`text-xs font-bold uppercase tracking-widest ${p.open ? "" : "opacity-50"}`}>
                                    {p.open ? "● OPEN" : "○ CLOSED"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* BULK TAB */}
            {activeTab === "bulk" && (
              <div className="flex flex-col items-center w-full">
                {!isProcessing && !bulkSuccess && (
                  <div
                    className="w-full border-2 border-dashed border-slate-300 hover:border-sky-400 bg-slate-50 hover:bg-sky-50/40 transition-all rounded-2xl p-12 text-center flex flex-col items-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFileSelection(f); }}
                  >
                    <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload Host List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">One hostname or IP per row. The server will async-scan all common ports for each host.</p>
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => { if (e.target.files[0]) processFileSelection(e.target.files[0]); }} />
                    </label>
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                  <button
                    onClick={startBulkScan}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-sky-600 to-cyan-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Server className="w-5 h-5" /> Run Bulk Port Scan
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-sky-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus}</p>
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-sky-600 mt-2">{bulkProgress}%</p>
                  </div>
                )}

                {bulkError && !isProcessing && (
                  <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center mt-4">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <p className="font-bold text-red-700 mb-1">Scan Failed</p>
                    <p className="text-sm text-red-600">{bulkError}</p>
                    <button onClick={() => { setBulkError(null); setSelectedFile(null); }} className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold">Try again</button>
                  </div>
                )}

                {bulkSuccess && !isProcessing && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center mt-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Scan Complete!</h3>
                    <p className="text-green-700 mb-6">Your bulk port scan CSV report has been downloaded.</p>
                    <button onClick={() => { setBulkSuccess(false); setSelectedFile(null); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl">Scan Another List</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center mb-4 text-sky-600"><Zap className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">All Ports, Simultaneously</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Every port is probed in parallel using async non-blocking TCP connections. All 22 ports are scanned concurrently, not sequentially.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600"><Shield className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Responsible Scanning</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Scan timeouts are fixed at 2 seconds per port to respect server resources. Use this tool only on servers you have permission to test.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4 text-violet-600"><Server className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Queued Bulk Scanning</h3>
            <p className="text-slate-600 text-sm leading-relaxed">CSV uploads are processed by background workers with controlled concurrency to avoid network exhaustion while handling large batch jobs.</p>
          </div>
        </div>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  {faq.q}
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-sky-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
