"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import {
  Globe, UploadCloud, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Search, FileText, Server, Zap,
  Activity, Wifi, WifiOff, Timer
} from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024;
const POLLING_INTERVAL = 2500;

function LatencyBar({ value, max = 300 }) {
  if (value === null || value === undefined) return null;
  const pct = Math.min((value / max) * 100, 100);
  const color = value < 50 ? "bg-emerald-500" : value < 150 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({ label, value, unit, icon, colorClass = "text-slate-700" }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-slate-500">
        {icon}
      </div>
      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${colorClass}`}>
        {value !== null && value !== undefined ? value : "—"}
        {value !== null && value !== undefined && unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export default function PingToolClient() {
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

  const handlePing = async () => {
    const h = host.trim();
    if (!h) { toast.error("Please enter a hostname or IP."); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/tools/ping/single?host=${encodeURIComponent(h)}`);
      if (!res.ok) throw new Error("Server error.");
      const data = await res.json();
      if (data.error) toast.error(data.error);
      setResult(data);
    } catch (err) {
      toast.error(err.message || "Ping failed.");
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

  const startBulkPing = async () => {
    if (!selectedFile) return;
    setBulkError(null); setBulkSuccess(false); setIsProcessing(true); setBulkProgress(0);
    setBulkStatus("Uploading host list...");
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch("http://localhost:8000/api/v1/tools/ping", { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }
      const { job_id } = await res.json();
      setBulkStatus("Pinging all hosts in background...");
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
        saveAs(await dl.blob(), "ping_results.csv");
        setBulkSuccess(true); toast.success("Bulk ping complete!");
        setIsProcessing(false); setBulkStatus(""); return;
      }
      if (job.progress) setBulkProgress(parseInt(job.progress, 10));
      setTimeout(() => pollJob(jobId), POLLING_INTERVAL);
    } catch (err) {
      setBulkError(err.message); setIsProcessing(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const latencyColor = (ms) => {
    if (ms === null || ms === undefined) return "text-slate-400";
    if (ms < 50) return "text-emerald-600";
    if (ms < 150) return "text-amber-600";
    return "text-red-600";
  };

  const latencyLabel = (ms) => {
    if (ms === null || ms === undefined) return "";
    if (ms < 50) return "Excellent";
    if (ms < 150) return "Good";
    if (ms < 300) return "Fair";
    return "Poor";
  };

  const faqs = [
    { q: "Why can't browsers ping servers directly?", a: "The ICMP protocol used by Ping operates at the network layer below HTTP. Web browsers have no access to raw network sockets, so every ping must be routed through a server-side process." },
    { q: "How does the single ping work?", a: "Your request triggers our lightweight async API which spawns the system ping command as a non-blocking subprocess. The process runs 4 echo requests, parses the output, and returns the averaged stats — all within seconds." },
    { q: "What do the response time ratings mean?", a: "Under 50ms is Excellent — ideal for real-time applications. 50–150ms is Good — suitable for most web services. 150–300ms is Fair — may introduce noticeable delays. Over 300ms is Poor — the host may be experiencing issues or is geographically distant." },
    { q: "What causes 100% packet loss?", a: "100% packet loss typically means the host is unreachable. This can be caused by a firewall blocking ICMP traffic, the server being offline, or an incorrect hostname/IP." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-green-900 via-emerald-900 to-teal-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[45%] h-[70%] rounded-full bg-emerald-400 blur-[130px]" />
          <div className="absolute bottom-[10%] left-[10%] w-[30%] h-[40%] rounded-full bg-teal-400 blur-[100px]" />
        </div>

        {/* Animated radar rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="absolute rounded-full border border-emerald-400"
              style={{
                width: `${i * 160}px`, height: `${i * 160}px`,
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                animation: `ping ${i * 1.5}s cubic-bezier(0,0,0.2,1) infinite`,
                animationDelay: `${i * 0.4}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Ping <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Tool</span>
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto font-light">
            Test server reachability, response times, packet loss, and TTL for any domain or IP address.
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
              <Activity className="w-5 h-5" /> Single Host
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" /> Bulk CSV Test
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
                      placeholder="example.com or 8.8.8.8"
                      className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-lg shadow-sm"
                      onKeyDown={(e) => e.key === "Enter" && handlePing()}
                    />
                  </div>
                  <button
                    onClick={handlePing}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                    {loading ? "Pinging…" : "Run Ping"}
                  </button>
                </div>

                {/* Results */}
                {result && (
                  <div className="animate-fade-in max-w-3xl mx-auto">

                    {/* Status Banner */}
                    <div className={`rounded-2xl p-6 mb-6 flex items-center justify-between ${result.reachable ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${result.reachable ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>
                          {result.reachable ? <Wifi className="w-6 h-6" /> : <WifiOff className="w-6 h-6" />}
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-800">{result.host}</h2>
                          <p className={`text-sm font-bold ${result.reachable ? "text-emerald-600" : "text-red-500"}`}>
                            {result.reachable ? "● Reachable" : "● Unreachable"}
                          </p>
                        </div>
                      </div>
                      {result.avg_ms !== null && (
                        <div className="text-right">
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Avg Latency</p>
                          <p className={`text-3xl font-extrabold ${latencyColor(result.avg_ms)}`}>{result.avg_ms}<span className="text-sm font-normal ml-1">ms</span></p>
                          <p className={`text-xs font-bold ${latencyColor(result.avg_ms)}`}>{latencyLabel(result.avg_ms)}</p>
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <StatCard label="Avg Latency" value={result.avg_ms} unit="ms" icon={<Timer className="w-5 h-5" />} colorClass={latencyColor(result.avg_ms)} />
                      <StatCard label="Min Latency" value={result.min_ms} unit="ms" icon={<Zap className="w-5 h-5" />} colorClass="text-emerald-600" />
                      <StatCard label="Max Latency" value={result.max_ms} unit="ms" icon={<Activity className="w-5 h-5" />} colorClass="text-slate-700" />
                      <StatCard label="Packet Loss" value={result.loss_pct !== null ? `${result.loss_pct}%` : null} unit="" icon={<Globe className="w-5 h-5" />} colorClass={result.loss_pct > 0 ? "text-red-600" : "text-emerald-600"} />
                    </div>

                    {/* Latency Bar */}
                    {result.avg_ms !== null && (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-4">
                        <div className="flex justify-between mb-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Latency Gauge</p>
                          <p className="text-xs text-slate-400">0ms — 300ms scale</p>
                        </div>
                        <LatencyBar value={result.avg_ms} />
                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                          <span className="text-emerald-500 font-bold">Excellent &lt;50ms</span>
                          <span className="text-amber-500 font-bold">Good &lt;150ms</span>
                          <span className="text-red-500 font-bold">Poor &gt;300ms</span>
                        </div>
                      </div>
                    )}

                    {/* TTL */}
                    {result.ttl && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Time to Live (TTL)</p>
                          <p className="text-slate-800 font-bold">{result.ttl} hops</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* BULK TAB */}
            {activeTab === "bulk" && (
              <div className="flex flex-col items-center w-full">
                {!isProcessing && !bulkSuccess && (
                  <div
                    className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/40 transition-all rounded-2xl p-12 text-center flex flex-col items-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFileSelection(f); }}
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload Host List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">One hostname or IP per row. Our server pings each host with 4 packets and returns a complete CSV report.</p>
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => { if (e.target.files[0]) processFileSelection(e.target.files[0]); }} />
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
                    onClick={startBulkPing}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Activity className="w-5 h-5" /> Run Bulk Ping Test
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus}</p>
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-emerald-600 mt-2">{bulkProgress}%</p>
                  </div>
                )}

                {bulkError && !isProcessing && (
                  <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center mt-4">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <p className="font-bold text-red-700 mb-1">Ping Batch Failed</p>
                    <p className="text-sm text-red-600">{bulkError}</p>
                    <button onClick={() => { setBulkError(null); setSelectedFile(null); }} className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold">Try again</button>
                  </div>
                )}

                {bulkSuccess && !isProcessing && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center mt-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Ping Report Ready!</h3>
                    <p className="text-green-700 mb-6">Your bulk ping test report has been downloaded.</p>
                    <button onClick={() => { setBulkSuccess(false); setSelectedFile(null); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl">Test Another List</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600"><Zap className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Async Non-Blocking</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Each ping spawns as an async subprocess using Python's async I/O engine. The primary API thread never blocks, enabling millions of simultaneous pings across server instances.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-teal-600"><Activity className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Cross-Platform Parsing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Our smart output parser automatically detects whether the server is running Windows or Linux and applies the correct regex patterns to extract accurate latency and packet loss values.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4 text-slate-600"><Server className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Queued Bulk Testing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Bulk CSV uploads are dispatched to background queues. Workers process hosts sequentially to avoid spawning too many concurrent system processes, preventing server resource exhaustion.</p>
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
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
