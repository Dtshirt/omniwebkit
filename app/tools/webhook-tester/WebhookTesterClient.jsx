"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Copy, RefreshCw, Trash2, ChevronDown, ChevronUp, Wifi, WifiOff, Plus, CheckCircle2, Globe, Clock, Hash, Terminal } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const API = API_V1;
const POLL_MS = 2500;

const METHOD_COLORS = {
  GET:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  POST:    "bg-blue-100 text-blue-700 border-blue-200",
  PUT:     "bg-amber-100 text-amber-700 border-amber-200",
  PATCH:   "bg-purple-100 text-purple-700 border-purple-200",
  DELETE:  "bg-red-100 text-red-700 border-red-200",
  HEAD:    "bg-slate-100 text-slate-600 border-slate-200",
  OPTIONS: "bg-pink-100 text-pink-700 border-pink-200",
};

function timeAgo(ms) {
  const diff = Date.now() - ms;
  if (diff < 5000) return "just now";
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

function JsonBlock({ data }) {
  const str = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return (
    <pre className="bg-slate-900 text-emerald-400 text-xs p-4 rounded-xl overflow-x-auto leading-relaxed font-mono max-h-72 overflow-y-auto whitespace-pre-wrap break-all">
      {str || <span className="text-slate-500 italic">empty</span>}
    </pre>
  );
}

function RequestCard({ req, isNew }) {
  const [open, setOpen] = useState(isNew);
  const [tab, setTab] = useState("body");
  const methodClass = METHOD_COLORS[req.method] || "bg-slate-100 text-slate-600 border-slate-200";

  const headerCount = Object.keys(req.headers || {}).length;
  const queryCount  = Object.keys(req.query_params || {}).length;
  const hasBody     = !!(req.body_raw);

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isNew ? "border-blue-300 bg-blue-50/30 shadow-blue-100 shadow-md" : "border-slate-200 bg-white"}`}>
      <button className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/70 transition-colors" onClick={() => setOpen(o => !o)}>
        <span className={`px-3 py-1 rounded-lg border font-extrabold text-xs tracking-wider flex-shrink-0 ${methodClass}`}>
          {req.method}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 truncate">{req.path}</span>
            {queryCount > 0 && <span className="text-xs text-slate-400 flex-shrink-0">+{queryCount} params</span>}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{timeAgo(req.received_at)}</span>
            {req.content_type && <span className="text-xs text-slate-400 truncate">{req.content_type.split(";")[0]}</span>}
            <span className="text-xs font-mono text-slate-300">#{req.id}</span>
          </div>
        </div>
        {isNew && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold flex-shrink-0">NEW</span>}
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-slate-100 px-5 pb-5 pt-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
            {[
              { id: "body",    label: `Body${hasBody ? " ●" : ""}` },
              { id: "headers", label: `Headers (${headerCount})` },
              { id: "query",   label: `Query (${queryCount})` },
              { id: "meta",    label: "Meta" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === t.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "body" && (
            <div>
              {req.body_parsed ? (
                <JsonBlock data={req.body_parsed} />
              ) : req.body_raw ? (
                <JsonBlock data={req.body_raw} />
              ) : (
                <p className="text-slate-400 text-sm italic py-2">No body content.</p>
              )}
            </div>
          )}

          {tab === "headers" && (
            <div className="space-y-2">
              {Object.entries(req.headers || {}).map(([k, v]) => (
                <div key={k} className="flex gap-3 text-xs">
                  <span className="font-bold text-slate-500 w-48 flex-shrink-0 truncate">{k}</span>
                  <span className="text-slate-800 font-mono break-all">{v}</span>
                </div>
              ))}
              {!Object.keys(req.headers || {}).length && <p className="text-slate-400 text-sm italic">No headers captured.</p>}
            </div>
          )}

          {tab === "query" && (
            <div className="space-y-2">
              {Object.entries(req.query_params || {}).map(([k, v]) => (
                <div key={k} className="flex gap-3 text-xs">
                  <span className="font-bold text-slate-500 w-48 flex-shrink-0 truncate">{k}</span>
                  <span className="text-slate-800 font-mono">{v}</span>
                </div>
              ))}
              {!queryCount && <p className="text-slate-400 text-sm italic">No query parameters.</p>}
            </div>
          )}

          {tab === "meta" && (
            <div className="space-y-2 text-xs">
              {[
                ["Method",     req.method],
                ["Path",       req.path],
                ["Client IP",  req.client_ip],
                ["Received",   new Date(req.received_at).toLocaleString()],
                ["Request ID", req.id],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-3">
                  <span className="font-bold text-slate-500 w-28 flex-shrink-0">{label}</span>
                  <span className="text-slate-800 font-mono">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WebhookTesterClient() {
  const [sessionId, setSessionId]   = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [requests, setRequests]     = useState([]);
  const [newIds, setNewIds]         = useState(new Set());
  const [isLive, setIsLive]         = useState(false);
  const [creating, setCreating]     = useState(false);
  const [ttl, setTtl]               = useState(86400);
  const [faqOpen, setFaqOpen]       = useState(null);
  const latestMsRef = useRef(0);
  const pollRef     = useRef(null);

  const copyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("URL copied to clipboard!");
  };

  const createSession = async () => {
    setCreating(true);
    try {
      const res = await fetch(`${API}/tools/webhook/create`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to create session.");
      const data = await res.json();
      setSessionId(data.session_id);
      setWebhookUrl(data.webhook_url);
      setRequests([]);
      setNewIds(new Set());
      setTtl(data.expires_in);
      latestMsRef.current = 0;
      toast.success("Webhook URL generated!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const clearRequests = async () => {
    if (!sessionId) return;
    try {
      await fetch(`${API}/tools/webhook/requests/${sessionId}`, { method: "DELETE" });
      setRequests([]);
      setNewIds(new Set());
      latestMsRef.current = 0;
      toast.success("Requests cleared.");
    } catch { toast.error("Failed to clear."); }
  };

  // ─── Polling ────────────────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`${API}/tools/webhook/requests/${sessionId}?after_ms=${latestMsRef.current}`);
      if (!res.ok) { setIsLive(false); return; }
      const data = await res.json();
      setIsLive(true);

      if (data.requests && data.requests.length > 0) {
        const incoming = data.requests;
        const incomingIds = new Set(incoming.map(r => r.id));
        const newestMs = Math.max(...incoming.map(r => r.received_at));
        latestMsRef.current = Math.max(latestMsRef.current, newestMs);

        setRequests(prev => {
          // Merge: new first, then existing, deduplicate by id
          const existingIds = new Set(prev.map(r => r.id));
          const truly_new = incoming.filter(r => !existingIds.has(r.id));
          return [...truly_new, ...prev].slice(0, 100);
        });

        setNewIds(prev => {
          const next = new Set([...prev, ...incomingIds]);
          // Auto-clear "new" badge after 8s
          setTimeout(() => setNewIds(p => { const n = new Set(p); incomingIds.forEach(id => n.delete(id)); return n; }), 8000);
          return next;
        });
      }
    } catch { setIsLive(false); }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    poll(); // immediate
    pollRef.current = setInterval(poll, POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [sessionId, poll]);

  const faqs = [
    { q: "How does this tool work?", a: "When you click 'Generate URL', the server creates a unique session and gives you a private webhook URL. Any HTTP request (GET, POST, PUT, etc.) sent to that URL within 24 hours is captured and displayed here in real time." },
    { q: "Is my data private?", a: "Each session has a cryptographically random 16-character ID. Sessions expire automatically after 24 hours and all captured data is deleted. Sensitive headers like Authorization and cookies are automatically filtered before storage." },
    { q: "What HTTP methods are supported?", a: "All standard HTTP methods are captured: GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS. This makes it ideal for testing REST APIs, form submissions, CI/CD hooks, payment callbacks, and more." },
    { q: "Can I test from any service?", a: "Yes. Copy the webhook URL and paste it into any service that sends HTTP requests — GitHub Actions, Stripe, Shopify, Slack, Zapier, Postman, or your own application. All requests appear here within ~2 seconds." },
  ];

  return (
    <div className="min-h-screen bg-slate-950 pb-24 font-sans text-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 pt-16 pb-8 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[5%] right-[10%] w-[45%] h-[70%] rounded-full bg-blue-500 blur-[150px]" />
          <div className="absolute bottom-0 left-[5%] w-[30%] h-[40%] rounded-full bg-indigo-500 blur-[100px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold px-4 py-2 rounded-full mb-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            Real-time Request Inspector
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Webhook <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Tester</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            Generate a unique URL, send any HTTP request to it, and inspect headers, body, and parameters in real time.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 relative z-20">

        {/* URL Card */}
        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 mb-6 shadow-2xl">
          {!sessionId ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                <Globe className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Generate Your Webhook URL</h2>
              <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">Get a unique, temporary URL that captures any HTTP request — great for testing webhooks, APIs, and callbacks.</p>
              <button onClick={createSession} disabled={creating}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-12 rounded-2xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 flex items-center gap-3 mx-auto text-lg">
                {creating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Generate URL
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full border ${isLive ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" : "bg-slate-700 border-slate-600 text-slate-400"}`}>
                  {isLive ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {isLive ? "Listening" : "Connecting…"}
                </div>
                <span className="text-slate-500 text-xs">{requests.length} request{requests.length !== 1 ? "s" : ""} received</span>
                <span className="text-slate-600 text-xs ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />Expires in {Math.floor(ttl / 3600)}h</span>
              </div>

              {/* URL display */}
              <div className="bg-slate-800 border border-slate-600 rounded-2xl p-4 flex items-center gap-3 mb-4">
                <Terminal className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <code className="text-blue-300 text-sm font-mono flex-1 break-all">{webhookUrl}</code>
                <button onClick={copyUrl} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-xl transition-colors flex-shrink-0" title="Copy URL">
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* Sample curl */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 mb-4">
                <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">Test with cURL</p>
                <code className="text-xs text-emerald-400 font-mono break-all">
                  {`curl -X POST "${webhookUrl}" -H "Content-Type: application/json" -d '{"hello":"world"}'`}
                </code>
              </div>

              <div className="flex gap-3">
                <button onClick={createSession} disabled={creating}
                  className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
                  <RefreshCw className={`w-4 h-4 ${creating ? "animate-spin" : ""}`} /> New URL
                </button>
                {requests.length > 0 && (
                  <button onClick={clearRequests}
                    className="flex items-center gap-2 bg-red-900/40 hover:bg-red-900/70 text-red-400 border border-red-800 font-bold py-2.5 px-5 rounded-xl text-sm transition-colors">
                    <Trash2 className="w-4 h-4" /> Clear All
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Requests list */}
        {sessionId && (
          <div>
            {requests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-700 rounded-3xl p-16 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                  <Hash className="w-8 h-8 text-slate-600" />
                </div>
                <p className="text-slate-400 font-bold mb-1">Waiting for requests…</p>
                <p className="text-slate-600 text-sm">Copy the URL above and send a request to it. It will appear here within 2–3 seconds.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map(req => (
                  <RequestCard key={req.id} req={req} isNew={newIds.has(req.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* FAQs */}
        {sessionId && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center text-white">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden">
                  <button className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-white hover:bg-slate-800" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    {faq.q}
                    {faqOpen === i ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                  </button>
                  <div className={`px-6 text-slate-400 text-sm leading-relaxed transition-all duration-300 ${faqOpen === i ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"}`}>{faq.a}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
