"use client";
import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2, ChevronDown, ChevronUp, Shield, Globe, Zap, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const COMMON_ORIGINS = [
  "https://example.com",
  "https://localhost:3000",
  "http://localhost:3000",
  "https://yourdomain.com",
  "null",
];
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];

const STATUS_META = {
  pass:    { icon: CheckCircle2, cls: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200", label: "Passed" },
  fail:    { icon: XCircle,      cls: "text-red-500",     bg: "bg-red-50 border-red-200",         label: "Failed" },
  warning: { icon: AlertTriangle,cls: "text-amber-500",   bg: "bg-amber-50 border-amber-200",     label: "Warning" },
  info:    { icon: Info,          cls: "text-blue-500",    bg: "bg-blue-50 border-blue-200",        label: "Info" },
};

function CheckCard({ check }) {
  const [open, setOpen] = useState(check.status === "fail");
  const meta = STATUS_META[check.status] || STATUS_META.info;
  const Icon = meta.icon;

  return (
    <div className={`border rounded-2xl overflow-hidden ${meta.bg}`}>
      <button className="w-full flex items-center gap-4 px-5 py-4 text-left" onClick={() => setOpen(o => !o)}>
        <Icon className={`w-5 h-5 flex-shrink-0 ${meta.cls}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 text-sm">{check.name}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.cls} bg-white/60 border ${meta.bg.split(" ")[1]}`}>{meta.label}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-slate-500">{check.header}</span>
            {check.value && <span className="text-xs text-slate-600 font-semibold truncate max-w-xs">= {check.value}</span>}
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-white/50">
          <p className="text-sm text-slate-700 mt-3 leading-relaxed">{check.detail}</p>
          {check.fix && (
            <div className="bg-white/70 rounded-xl p-3 border border-white">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">💡 How to Fix</p>
              <p className="text-sm text-slate-700">{check.fix}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HeaderTable({ headers, title }) {
  const entries = Object.entries(headers || {});
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
      {entries.length === 0
        ? <p className="text-sm text-slate-400 italic">No CORS headers returned.</p>
        : (
          <div className="space-y-1.5">
            {entries.map(([k, v]) => (
              <div key={k} className="flex gap-3 text-xs bg-slate-800 rounded-lg px-3 py-2">
                <span className="font-bold text-purple-300 flex-shrink-0 w-64 truncate">{k}</span>
                <span className="font-mono text-emerald-300 break-all">{v}</span>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
}

const OVERALL_META = {
  pass:    { label: "CORS Fully Configured", cls: "from-emerald-500 to-green-500", icon: "✅" },
  fail:    { label: "CORS Errors Detected",   cls: "from-red-500 to-rose-500",     icon: "❌" },
  warning: { label: "CORS Warnings Found",    cls: "from-amber-500 to-orange-500", icon: "⚠️" },
};

export default function CorsTesterClient() {
  const [url, setUrl]             = useState("https://api.github.com");
  const [origin, setOrigin]       = useState("https://example.com");
  const [method, setMethod]       = useState("GET");
  const [reqHeaders, setReqHeaders] = useState("Content-Type, Authorization");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [faqOpen, setFaqOpen]     = useState(null);
  const [showRaw, setShowRaw]     = useState(false);

  const runTest = async () => {
    if (!url.trim()) { toast.error("Enter a URL to test."); return; }
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch(`${API_V1}/cors-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, origin, method, request_headers: reqHeaders }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || "Test failed.");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const overall = result?.analysis?.overall;
  const overallMeta = overall ? OVERALL_META[overall] : null;

  const faqs = [
    { q: "Why can't this be tested in the browser?", a: "CORS is enforced by the browser — it blocks you from reading headers of cross-origin responses that fail. Our server acts as a neutral third party, sending the same preflight request your browser would, and can freely read all response headers to give you a complete diagnosis." },
    { q: "What is a preflight request?", a: "A preflight is an HTTP OPTIONS request automatically sent by browsers before non-simple cross-origin requests (e.g. POST with JSON body). The server must respond with appropriate Access-Control-Allow-* headers, otherwise the browser blocks the actual request." },
    { q: "What does 'Vary: Origin' do?", a: "The Vary: Origin header tells CDNs and proxy caches that the response varies per Origin. Without it, a proxy might cache a response for origin A and serve it to origin B — causing incorrect CORS failures even when your server is correctly configured." },
    { q: "Can I use wildcard (*) with credentials?", a: "No. Browsers require that Access-Control-Allow-Origin be set to a specific origin (not *) when Access-Control-Allow-Credentials is true. Mixing wildcard with credentials will always fail in browsers." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[75%] rounded-full bg-violet-500 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[50%] rounded-full bg-purple-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            CORS <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-300">Tester</span>
          </h1>
          <p className="text-lg text-violet-100 max-w-2xl mx-auto font-light">
            Test cross-origin resource sharing headers for any URL. Inspect the preflight OPTIONS response and see exactly what's blocking your requests.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        {/* Input card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8">
          <div className="space-y-5">
            {/* URL */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Target URL</label>
              <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint"
                onKeyDown={e => e.key === "Enter" && runTest()}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-800 focus:ring-2 focus:ring-violet-400 outline-none" />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Origin */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">Request Origin</label>
                <input type="text" value={origin} onChange={e => setOrigin(e.target.value)} list="origins-list"
                  placeholder="https://yourdomain.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-800 focus:ring-2 focus:ring-violet-400 outline-none" />
                <datalist id="origins-list">{COMMON_ORIGINS.map(o => <option key={o} value={o} />)}</datalist>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {["localhost:3000", "example.com"].map(o => (
                    <button key={o} onClick={() => setOrigin(`https://${o}`)}
                      className="text-xs bg-slate-100 hover:bg-violet-100 text-slate-600 hover:text-violet-700 px-2 py-1 rounded-lg transition-colors">
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">HTTP Method to Test</label>
                <div className="flex flex-wrap gap-2">
                  {METHODS.map(m => (
                    <button key={m} onClick={() => setMethod(m)}
                      className={`px-3 py-2 rounded-xl border-2 font-bold text-xs transition-all ${method === m ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-violet-200"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Request Headers */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">
                Request Headers <span className="text-slate-400 font-normal">(Access-Control-Request-Headers)</span>
              </label>
              <input type="text" value={reqHeaders} onChange={e => setReqHeaders(e.target.value)}
                placeholder="Content-Type, Authorization, X-Custom-Header"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 font-mono text-slate-800 focus:ring-2 focus:ring-violet-400 outline-none" />
              <p className="text-xs text-slate-400 mt-1">Comma-separated list of headers your client sends.</p>
            </div>

            <button onClick={runTest} disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-3 text-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              {loading ? "Testing CORS…" : "Run CORS Test"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-8 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-800">Test Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Overall verdict */}
            {overallMeta && (
              <div className={`bg-gradient-to-r ${overallMeta.cls} rounded-3xl p-6 text-white shadow-lg`}>
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{overallMeta.icon}</span>
                  <div>
                    <p className="text-2xl font-extrabold">{overallMeta.label}</p>
                    <p className="text-white/80 text-sm mt-1">
                      {result.url} — tested from <strong>{result.origin}</strong>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
                  <div className="text-center">
                    <p className="text-white/60 text-xs font-bold uppercase">Preflight Status</p>
                    <p className="text-2xl font-extrabold">{result.preflight.status ?? "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs font-bold uppercase">Actual Status</p>
                    <p className="text-2xl font-extrabold">{result.actual.status ?? "—"}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-white/60 text-xs font-bold uppercase">Preflight Latency</p>
                    <p className="text-2xl font-extrabold">{result.preflight.latency_ms}ms</p>
                  </div>
                </div>
              </div>
            )}

            {/* Checks */}
            <div>
              <h2 className="text-lg font-bold text-slate-800 mb-4">CORS Check Results</h2>
              <div className="space-y-3">
                {result.analysis.checks.map((check, i) => (
                  <CheckCard key={i} check={check} />
                ))}
              </div>
            </div>

            {/* Raw headers toggle */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <button onClick={() => setShowRaw(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 font-bold text-slate-700 hover:bg-slate-50">
                Raw CORS Headers
                {showRaw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showRaw && (
                <div className="px-6 pb-6 space-y-5 bg-slate-900 rounded-b-2xl">
                  <div className="pt-5">
                    <HeaderTable headers={result.preflight.cors_headers} title={`OPTIONS Preflight (${result.preflight.status})`} />
                  </div>
                  {result.actual.cors_headers && Object.keys(result.actual.cors_headers).length > 0 && (
                    <HeaderTable headers={result.actual.cors_headers} title={`${result.method} Response (${result.actual.status})`} />
                  )}
                </div>
              )}
            </div>

            <button onClick={runTest} className="flex items-center gap-2 text-sm text-slate-500 hover:text-violet-600 transition-colors mx-auto">
              <RefreshCw className="w-4 h-4" /> Re-run test
            </button>
          </div>
        )}

        {/* How it works */}
        {!result && !loading && (
          <div className="grid md:grid-cols-3 gap-6 mt-4 mb-12">
            {[
              { icon: <Globe className="w-6 h-6" />, title: "Preflight Analysis", desc: "Sends a real OPTIONS request with your Origin and inspects all Access-Control-* response headers to determine what's allowed.", bg: "bg-violet-100 text-violet-600" },
              { icon: <Shield className="w-6 h-6" />, title: "6 CORS Checks", desc: "Validates Origin allowance, method permissions, header allowlist, credentials support, Max-Age caching, and Vary header correctness.", bg: "bg-purple-100 text-purple-600" },
              { icon: <Zap className="w-6 h-6" />, title: "Fix Guidance", desc: "Every failed or warning check includes a plain-English explanation of exactly what to add to your server's CORS configuration.", bg: "bg-indigo-100 text-indigo-600" },
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4`}>{f.icon}</div>
                <h3 className="text-base font-bold mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* FAQs */}
        <section className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {faq.q}
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-violet-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <div className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ${faqOpen === i ? "pb-6 max-h-48 opacity-100" : "max-h-0 opacity-0 py-0"}`}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
