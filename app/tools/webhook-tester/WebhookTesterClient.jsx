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

        {/* SEO Content */}
        <div className="mt-16 prose-premium text-slate-300">
          <h2>About the Tool: Your Real-Time Webhook Tester</h2>
          <p>Testing webhooks shouldn't feel like a chore. You shouldn't have to spin up a local server, configure an exposing tunnel like ngrok, or write boilerplate code just to see what a third-party API is sending. We built this <strong>Webhook Tester</strong> to give you an instant, zero-setup sandbox to inspect HTTP requests in real time. Whether you're integrating a complex Stripe checkout, setting up automated GitHub Actions, or just trying to figure out why a third-party API keeps throwing errors, this tool acts as your transparent webhook receiver.</p>
          <p>A webhook tester simply captures incoming data—like custom headers, tricky query parameters, and raw JSON bodies—and displays it right inside your browser window. Think of it as a caller ID system for your web APIs. You generate a unique URL, point your external service to it, and instantly see exactly what payload was delivered. It's the absolute fastest way to test webhooks online and debug external callbacks without ever opening your terminal or writing a single line of backend logic.</p>

          <h2>How to Use This Webhook Inspector</h2>
          <p>We designed this interface to be as frictionless as possible. Getting started takes about three seconds. Here's exactly how you can use this webhook debugger to troubleshoot your next integration project.</p>
          <ol>
            <li><strong>Generate Your Unique Endpoint:</strong> Click the big "Generate URL" button at the top of the page. The tool instantly spins up a secure, temporary endpoint just for your current session.</li>
            <li><strong>Send a Test Request:</strong> Copy that new URL to your clipboard. Paste it into the service you're trying to test—like a Shopify order alert, a custom Slack bot, or even a simple cURL command from your command line.</li>
            <li><strong>Inspect the Live Payload:</strong> The moment the HTTP request hits our server, it pops up on your screen. You don't even need to refresh the page. You can expand the request card to view the exact HTTP method used, the status codes, headers, and the raw or parsed body data.</li>
            <li><strong>Analyze, Fix, and Repeat:</strong> Check if your JSON is formatted correctly. Verify if the required authentication headers are actually present. Once you're done, you can clear the logs to keep your workspace tidy, or just close the browser tab.</li>
          </ol>
          <p>That's pretty much it. There are no accounts to create, no paywalls, and absolutely no friction slowing you down.</p>

          <h2>Privacy & Security Anchor: How We Protect Your Data</h2>
          <p>We know developers are often passing highly sensitive data through these tests. You might be working with private API keys, temporary user tokens, or real customer email addresses. So, here's the honest deal on how we handle your information when you use our http request inspector.</p>
          <p>Every single session gets assigned a cryptographically random, completely unguessable ID. This means nobody else on the internet can see your webhook endpoint or the data it receives unless you specifically share the link with them. Furthermore, we absolutely do not hold onto your data. All captured requests are strictly temporary by design. The moment your session expires, or the second you hit the clear button, everything is permanently wiped from our server memory.</p>
          <p>We built this webhook receiver with developer privacy as the core priority. It's a temporary testing sandbox, not a long-term storage unit. But as a best practice for any web development, you should never send real production secrets or live customer data to any public testing tool.</p>

          <h2>Features: The Technical Spec Sheet</h2>
          <p>This isn't just a basic request bin. We packed this tool with the exact features developers actually need when they are deep in the trenches troubleshooting broken integrations.</p>
          <ul>
            <li><strong>Real-Time Polling:</strong> Incoming requests appear on your screen within milliseconds of hitting our server. No manual page refreshing is ever needed.</li>
            <li><strong>Smart Payload Parsing:</strong> The tool automatically formats and color-codes JSON, XML, and form-data payloads so they are actually readable at a glance.</li>
            <li><strong>Deep Header Inspection:</strong> See every single HTTP header sent by the client, including hidden meta-headers and user-agent strings that most tools strip out.</li>
            <li><strong>Universal Method Support:</strong> Our endpoint catches GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests without breaking a sweat or returning a 405 error.</li>
            <li><strong>One-Click Copying:</strong> Grab specific parsed payloads, query strings, or individual headers with one click to paste directly into Postman or your code editor.</li>
          </ul>

          <h2>Technical Details Under the Hood</h2>
          <p>For the curious developers out there, here is exactly how this tool processes your incoming data. When an external service pings your unique URL, our edge server instantly intercepts the request. It strips out our own internal connection details and packages the raw incoming data into a clean, structured JSON format.</p>
          <p>We handle CORS (Cross-Origin Resource Sharing) completely automatically. This means you can fire test requests directly from browser-based frontend applications without getting blocked by frustrating preflight errors. The tool easily supports chunked transfer encoding and gracefully handles request payloads up to 1MB in size. If an incoming request includes complex query strings, they get automatically parsed and listed individually for easy reading.</p>
          <p>It's a highly lightweight, efficient setup designed purely for speed, accuracy, and developer convenience. You send the data; we show it to you instantly. No extra steps or confusing configurations.</p>

          <h2>Frequently Asked Questions</h2>
          <h3>What exactly is a webhook?</h3>
          <p>A webhook is simply a way for one application to send automated messages or information to another application in real time. It's almost like an instant SMS notification for software. When a specific event happens in App A, it instantly sends an HTTP request (usually a POST method) to a specific URL in App B with data about that event.</p>

          <h3>Why do I need a tool to test webhooks online?</h3>
          <p>Because setting up a public-facing server just to see what an API is sending you is a huge, unnecessary pain. A webhook tester gives you an instant, ready-to-go public URL to catch those requests. This lets you see the exact formatting and data structure of the payload before you spend hours writing the backend code to process it.</p>

          <h3>How long do my generated URLs stay active?</h3>
          <p>Your unique endpoint remains active for a full 24 hours. After that time window, the session automatically expires and all associated request data is permanently deleted to keep our servers clean and your data secure.</p>

          <h3>Can I use this as a RequestBin alternative?</h3>
          <p>Yes, absolutely. If you're looking for a fast, free, and completely private way to inspect HTTP requests without logging in or creating an account, this tool serves as a perfect, modern RequestBin alternative.</p>

          <h3>What happens if I send a massive data payload?</h3>
          <p>To keep the service blazing fast and responsive for everyone using it, we cap individual request sizes at around 1MB. If you attempt to send something larger, the server will simply reject the request. For 99% of normal webhook testing and API debugging, you won't even come close to hitting this limit.</p>
        </div>
      </div>
    </div>
  );
}
