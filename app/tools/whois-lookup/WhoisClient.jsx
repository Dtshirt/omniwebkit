"use client";

import React, { useState } from "react";
import { saveAs } from "file-saver";
import {
  Globe, UploadCloud, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Search, FileText, Server, Zap,
  Calendar, Building2, MapPin, Mail, Shield, Network, Clock
} from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_CLIENT_SIZE_BYTES = 50 * 1024 * 1024;
const POLLING_INTERVAL = 2500;

export default function WhoisClient() {
  const [activeTab, setActiveTab] = useState("single");

  // Single Mode
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Bulk Mode
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(false);

  const [faqOpen, setFaqOpen] = useState(null);

  // ─── Single Mode ──────────────────────────────────────────────────────────

  const sanitizeDomain = (raw) => {
    let d = raw.trim().toLowerCase();
    ["https://", "http://", "www."].forEach(p => { if (d.startsWith(p)) d = d.slice(p.length); });
    return d.split("/")[0];
  };

  const handleLookup = async () => {
    const d = sanitizeDomain(domain);
    if (!d) { toast.error("Please enter a domain name."); return; }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/tools/whois/single?domain=${encodeURIComponent(d)}`);
      if (!res.ok) throw new Error("Server error. Please try again.");
      const data = await res.json();
      if (data.error) toast.error(`WHOIS Error: ${data.error}`);
      setResult(data);
    } catch (err) {
      toast.error(err.message || "Failed to fetch WHOIS data.");
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

  const startBulkLookup = async () => {
    if (!selectedFile) return;
    setBulkError(null); setBulkSuccess(false); setIsProcessing(true); setBulkProgress(0);
    setBulkStatus("Uploading domain list...");

    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      const res = await fetch("http://localhost:8000/api/v1/tools/whois", { method: "POST", body: fd });
      if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }
      const { job_id } = await res.json();
      setBulkStatus("Querying domain registries in background...");
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
        if (!dl.ok) throw new Error("Failed to download result.");
        saveAs(await dl.blob(), "whois_results.csv");
        setBulkSuccess(true); toast.success("Bulk WHOIS complete!");
        setIsProcessing(false); setBulkStatus(""); return;
      }

      if (job.progress) setBulkProgress(parseInt(job.progress, 10));
      setTimeout(() => pollJob(jobId), POLLING_INTERVAL);
    } catch (err) {
      setBulkError(err.message); setIsProcessing(false);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const daysUntilExpiry = (dateStr) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatNS = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val.map(v => v.toLowerCase());
    return [val.toLowerCase()];
  };

  const faqs = [
    { q: "What is a WHOIS lookup?", a: "WHOIS is a protocol that queries official internet registries to retrieve the public registration records of a domain name. It reveals who registered the domain, when it was registered, when it expires, and which nameservers it uses." },
    { q: "Why can't my browser run WHOIS directly?", a: "WHOIS operates over a raw TCP connection on port 43, which is completely inaccessible to web browsers due to network security sandboxes. Our tool routes the query through our secure Python backend for accurate results." },
    { q: "How fast is the single lookup?", a: "We use Python's AsyncIO to run the WHOIS query in a background thread so it never blocks our API server. This allows millions of simultaneous lookups without any performance degradation." },
    { q: "How does bulk processing work?", a: "Bulk CSV files are uploaded to a Redis-backed worker queue. Jobs are processed sequentially per worker instance, and multiple worker instances run in parallel to maximize throughput without exhausting memory." },
  ];

  const expiryDays = result ? daysUntilExpiry(result.expiration_date) : null;
  const isExpiringSoon = expiryDays !== null && expiryDays < 60;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-900 via-amber-900 to-yellow-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[15%] right-[8%] w-[45%] h-[65%] rounded-full bg-amber-500 blur-[130px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            WHOIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-300">Lookup</span>
          </h1>
          <p className="text-lg text-amber-100 max-w-2xl mx-auto font-light">
            Retrieve full domain registration records — owner, registrar, creation date, expiry, and nameservers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-amber-50 text-amber-700 border-b-2 border-amber-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Globe className="w-5 h-5" /> Single Domain
            </button>
            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-amber-50 text-amber-700 border-b-2 border-amber-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" /> Bulk CSV Lookup
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
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="example.com"
                      className="w-full border border-slate-200 rounded-xl pl-12 pr-4 py-4 bg-white focus:ring-2 focus:ring-amber-500 outline-none text-lg shadow-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                    />
                  </div>
                  <button
                    onClick={handleLookup}
                    disabled={loading}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 px-8 rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    Lookup WHOIS
                  </button>
                </div>

                {/* Result Card */}
                {result && (
                  <div className="animate-fade-in max-w-3xl mx-auto">

                    {/* Domain Header */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Domain</p>
                        <h2 className="text-2xl font-extrabold text-slate-800">{result.domain}</h2>
                        {result.registrar && (
                          <p className="text-sm text-slate-500 mt-1">{Array.isArray(result.registrar) ? result.registrar[0] : result.registrar}</p>
                        )}
                      </div>
                      {expiryDays !== null && (
                        <div className={`text-center px-4 py-2 rounded-xl border ${isExpiringSoon ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                          <p className="text-xs font-bold uppercase tracking-widest mb-1">Expires In</p>
                          <p className="text-2xl font-extrabold">{expiryDays}</p>
                          <p className="text-xs">days</p>
                        </div>
                      )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">

                      {[
                        { icon: <Calendar className="w-4 h-4" />, label: "Created", value: result.creation_date, color: "text-blue-600 bg-blue-50 border-blue-200" },
                        { icon: <Clock className="w-4 h-4" />, label: "Expires", value: result.expiration_date, color: isExpiringSoon ? "text-red-600 bg-red-50 border-red-200" : "text-emerald-600 bg-emerald-50 border-emerald-200" },
                        { icon: <Building2 className="w-4 h-4" />, label: "Organisation", value: Array.isArray(result.org) ? result.org[0] : result.org, color: "text-violet-600 bg-violet-50 border-violet-200" },
                        { icon: <MapPin className="w-4 h-4" />, label: "Country", value: Array.isArray(result.country) ? result.country[0] : result.country, color: "text-orange-600 bg-orange-50 border-orange-200" },
                      ].map(({ icon, label, value, color }, idx) => value && (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${color} flex-shrink-0`}>{icon}</div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{label}</p>
                            <p className="text-slate-800 font-semibold text-sm mt-0.5">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Nameservers */}
                    {formatNS(result.name_servers) && (
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Network className="w-4 h-4 text-slate-500" />
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nameservers</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formatNS(result.name_servers).slice(0, 8).map((ns, i) => (
                            <span key={i} className="bg-slate-100 text-slate-700 font-mono text-xs px-3 py-1.5 rounded-lg border border-slate-200">{ns}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Status */}
                    {result.status && (
                      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-slate-500" />
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Domain Status</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(result.status) ? result.status : [result.status]).slice(0, 4).map((s, i) => (
                            <span key={i} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">{s.split(" ")[0]}</span>
                          ))}
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
                    className="w-full border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/40 transition-all rounded-2xl p-12 text-center flex flex-col items-center"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) processFileSelection(f); }}
                  >
                    <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload Domain List (CSV)</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">One domain per row. Our server will query WHOIS records for every domain in the background.</p>
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={(e) => { if (e.target.files[0]) processFileSelection(e.target.files[0]); }} />
                    </label>
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                  <button
                    onClick={startBulkLookup}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Server className="w-5 h-5" /> Run Bulk WHOIS
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus}</p>
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-amber-600 mt-2">{bulkProgress}%</p>
                  </div>
                )}

                {bulkError && !isProcessing && (
                  <div className="w-full bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center mt-4">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <p className="font-bold text-red-700 mb-1">Lookup Failed</p>
                    <p className="text-sm text-red-600">{bulkError}</p>
                    <button onClick={() => { setBulkError(null); setSelectedFile(null); }} className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold">Try again</button>
                  </div>
                )}

                {bulkSuccess && !isProcessing && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center mt-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">WHOIS Report Ready!</h3>
                    <p className="text-green-700 mb-6">Your bulk domain registry report has been downloaded.</p>
                    <button onClick={() => { setBulkSuccess(false); setSelectedFile(null); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl">Lookup Another List</button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600"><Zap className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Thread Pool Routing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">WHOIS queries run over raw TCP connections that block the network thread. We route each lookup into Python's AsyncIO thread pool, so the API server never stalls — even under millions of simultaneous queries.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-orange-600"><Server className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Queued Bulk Processing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Bulk domain lists are accepted by the API and dispatched to background worker queues. Workers process domains sequentially while multiple worker instances run in parallel, preventing registry rate-limits from crashing jobs.</p>
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
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
