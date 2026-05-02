"use client";

import React, { useState, useRef } from "react";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import {
  Globe, Search, Loader2, AlertCircle, CheckCircle2,
  Server, Zap, Shield, BarChart2, Monitor, Layers,
  ChevronDown, ChevronUp, Copy, Check, ExternalLink,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Category metadata ───────────────────────────────────────────────────────
const CAT_META = {
  server:       { label: "Server",          color: "from-emerald-500 to-teal-600",   bg: "bg-emerald-50 dark:bg-emerald-900/20",   border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", icon: Server },
  cdn:          { label: "CDN / Edge",      color: "from-orange-500 to-amber-600",   bg: "bg-orange-50 dark:bg-orange-900/20",     border: "border-orange-200 dark:border-orange-800",   text: "text-orange-700 dark:text-orange-300",   icon: Zap },
  cms:          { label: "CMS",             color: "from-violet-500 to-purple-600",  bg: "bg-violet-50 dark:bg-violet-900/20",     border: "border-violet-200 dark:border-violet-800",   text: "text-violet-700 dark:text-violet-300",   icon: Layers },
  framework:    { label: "Framework",       color: "from-blue-500 to-indigo-600",    bg: "bg-blue-50 dark:bg-blue-900/20",         border: "border-blue-200 dark:border-blue-800",       text: "text-blue-700 dark:text-blue-300",       icon: Monitor },
  "ui-framework":{ label: "UI Framework",  color: "from-cyan-500 to-sky-600",       bg: "bg-cyan-50 dark:bg-cyan-900/20",         border: "border-cyan-200 dark:border-cyan-800",       text: "text-cyan-700 dark:text-cyan-300",       icon: Monitor },
  language:     { label: "Language",        color: "from-lime-500 to-green-600",     bg: "bg-lime-50 dark:bg-lime-900/20",         border: "border-lime-200 dark:border-lime-800",       text: "text-lime-700 dark:text-lime-300",       icon: Monitor },
  analytics:    { label: "Analytics",       color: "from-pink-500 to-rose-600",      bg: "bg-pink-50 dark:bg-pink-900/20",         border: "border-pink-200 dark:border-pink-800",       text: "text-pink-700 dark:text-pink-300",       icon: BarChart2 },
  marketing:    { label: "Marketing",       color: "from-fuchsia-500 to-pink-600",   bg: "bg-fuchsia-50 dark:bg-fuchsia-900/20",   border: "border-fuchsia-200 dark:border-fuchsia-800", text: "text-fuchsia-700 dark:text-fuchsia-300", icon: BarChart2 },
  security:     { label: "Security",        color: "from-slate-600 to-slate-800",    bg: "bg-slate-50 dark:bg-slate-900/40",       border: "border-slate-200 dark:border-slate-700",     text: "text-slate-700 dark:text-slate-300",     icon: Shield },
  fonts:        { label: "Fonts",           color: "from-yellow-500 to-amber-600",   bg: "bg-yellow-50 dark:bg-yellow-900/20",     border: "border-yellow-200 dark:border-yellow-800",   text: "text-yellow-700 dark:text-yellow-300",   icon: Layers },
  library:      { label: "JS Library",      color: "from-teal-500 to-cyan-600",      bg: "bg-teal-50 dark:bg-teal-900/20",         border: "border-teal-200 dark:border-teal-800",       text: "text-teal-700 dark:text-teal-300",       icon: Layers },
  support:      { label: "Support",         color: "from-sky-500 to-blue-600",       bg: "bg-sky-50 dark:bg-sky-900/20",           border: "border-sky-200 dark:border-sky-800",         text: "text-sky-700 dark:text-sky-300",         icon: Layers },
  payments:     { label: "Payments",        color: "from-green-500 to-emerald-600",  bg: "bg-green-50 dark:bg-green-900/20",       border: "border-green-200 dark:border-green-800",     text: "text-green-700 dark:text-green-300",     icon: Layers },
  media:        { label: "Media",           color: "from-blue-400 to-cyan-500",      bg: "bg-blue-50 dark:bg-blue-900/20",         border: "border-blue-200 dark:border-blue-800",       text: "text-blue-700 dark:text-blue-300",       icon: Layers },
  hosting:      { label: "Hosting",         color: "from-indigo-500 to-violet-600",  bg: "bg-indigo-50 dark:bg-indigo-900/20",     border: "border-indigo-200 dark:border-indigo-800",   text: "text-indigo-700 dark:text-indigo-300",   icon: Server },
};

const DEMO_URLS = ["github.com", "shopify.com", "wordpress.com", "vercel.com", "stripe.com"];

const FAQS = [
  {
    q: "How does this tool detect website technologies?",
    a: "The tool fetches the target website's HTTP response headers and HTML source, then runs dozens of regex-based pattern matchers against them. Each technology has known fingerprints — a unique script URL, a header name, an HTML attribute, or a meta tag — that our engine identifies in milliseconds.",
  },
  {
    q: "Why can't my browser detect this directly?",
    a: "Direct HTTP requests from a browser to third-party sites are blocked by CORS security policies. Our server acts as an intermediary — it fetches the target site, inspects all headers and HTML, and returns clean structured results. The target site only ever sees our server's IP, not yours.",
  },
  {
    q: "Can it crash if thousands of users run it simultaneously?",
    a: "No. The server uses an async semaphore that caps the number of concurrent outbound fetches. Requests beyond the cap queue in memory and are served as soon as a slot frees up, within the connection timeout. The FastAPI event loop itself is never blocked.",
  },
  {
    q: "How accurate are the detections?",
    a: "Accuracy is high (90%+) for popular platforms. Technologies that obfuscate or lazy-load their scripts may occasionally go undetected. Confidence levels (high / medium) are displayed alongside each result so you can judge accordingly.",
  },
  {
    q: "Does this tool store the URLs I enter?",
    a: "No. URLs are processed in-memory and never written to a database or log file. Each request is stateless and ephemeral.",
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function TechDetectorClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [faqOpen, setFaqOpen] = useState(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  const detect = async (targetUrl) => {
    const raw = (targetUrl || url).trim();
    if (!raw) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/tools/tech-detector?url=${encodeURIComponent(raw)}`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || `Server error ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "Detection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyResults = async () => {
    if (!result) return;
    const text = result.technologies
      .map((t) => `${t.name} (${t.category})`)
      .join("\n");
    await navigator.clipboard.writeText(`${result.url}\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const orderedCats = [
    "server", "cdn", "cms", "framework", "ui-framework", "language",
    "analytics", "marketing", "security", "fonts", "library",
    "support", "payments", "media", "hosting",
  ];

  const presentCats = orderedCats.filter(
    (c) => result?.grouped?.[c]?.length > 0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[40%] h-[70%] rounded-full bg-indigo-600 opacity-10 blur-[120px]" />
          <div className="absolute bottom-[5%] left-[10%] w-[30%] h-[50%] rounded-full bg-violet-600 opacity-10 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-semibold text-indigo-200 mb-6 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" /> Developer Tool · Trending 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Website{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-300">
              Technology Detector
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto font-light">
            Enter any URL — instantly reveal its CMS, framework, analytics tools,
            CDN, server type, and security headers.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 -mt-8 relative z-20">
        <Breadcrumbs items={[{ name: "Website Technology Detector", href: "/tools/tech-detector" }]} />

        {/* ── Search Card ── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && detect()}
                  placeholder="https://example.com"
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl pl-12 pr-4 py-4 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-base shadow-sm dark:text-white placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => detect()}
                disabled={loading || !url.trim()}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? "Detecting…" : "Detect Tech"}
              </button>
            </div>

            {/* Quick demos */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-slate-400 font-semibold pt-1">Try:</span>
              {DEMO_URLS.map((d) => (
                <button
                  key={d}
                  onClick={() => { setUrl(`https://${d}`); detect(`https://${d}`); }}
                  className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-700 dark:text-red-300">Detection Failed</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow border border-slate-100 dark:border-slate-700 p-8 mb-8 animate-pulse">
            <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-6" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {result && !loading && (
          <>
            {/* Summary bar */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 p-5 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-800 dark:text-white text-sm">
                    {result.domain}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    HTTP {result.status_code} · {result.total} technologies detected
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Site
                </a>
                <button
                  onClick={copyResults}
                  className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Results"}
                </button>
              </div>
            </div>

            {/* Category sections */}
            {result.total === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 p-10 text-center text-slate-500 dark:text-slate-400">
                <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">No known technologies detected</p>
                <p className="text-sm mt-1">The site may use custom or obfuscated technologies.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {presentCats.map((cat) => {
                  const meta = CAT_META[cat] || CAT_META.server;
                  const IconComp = meta.icon;
                  const items = result.grouped[cat];
                  return (
                    <div
                      key={cat}
                      className="bg-white dark:bg-slate-800 rounded-2xl shadow border border-slate-100 dark:border-slate-700 overflow-hidden"
                    >
                      {/* Category header */}
                      <div className={`px-5 py-3 flex items-center gap-2.5 bg-gradient-to-r ${meta.color}`}>
                        <IconComp className="w-4 h-4 text-white" />
                        <span className="text-xs font-black uppercase tracking-widest text-white">
                          {meta.label}
                        </span>
                        <span className="ml-auto text-xs bg-white/20 text-white font-bold px-2 py-0.5 rounded-full">
                          {items.length}
                        </span>
                      </div>

                      {/* Tech chips */}
                      <div className="p-5 flex flex-wrap gap-3">
                        {items.map((tech, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${meta.bg} ${meta.border} shadow-sm`}
                          >
                            <span className="text-xl leading-none">{tech.icon}</span>
                            <div>
                              <p className={`text-sm font-bold ${meta.text}`}>{tech.name}</p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wide">
                                {tech.confidence} confidence
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── How it works ── */}
        <div className="mt-14 grid sm:grid-cols-3 gap-5 mb-14">
          {[
            { icon: Globe, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400", title: "Enter any URL", body: "Paste the homepage or any page of the site. HTTPS and HTTP both work. The tool normalises your input automatically." },
            { icon: Zap, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400", title: "Instant server fetch", body: "Our async backend fetches the page, inspects HTTP headers and HTML source, and runs 60+ technology fingerprints in under 3 seconds." },
            { icon: Layers, color: "text-violet-600 bg-violet-50 dark:bg-violet-900/30 dark:text-violet-400", title: "Grouped results", body: "Detected technologies are grouped by category — CMS, framework, analytics, CDN, security headers, and more — for easy scanning." },
          ].map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* ── SEO Content ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
            What is a Website Technology Detector?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            A website technology detector (also called a tech stack analyzer or web stack checker) identifies the software and services that power any website. It works by examining the HTTP response headers, HTML source code, script URLs, meta tags, and cookie names that sites expose to browsers — each of which serves as a fingerprint for a specific technology.
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
            Common use cases include competitive research (what platform is my competitor using?), security audits (is this site using outdated software?), sales prospecting (find all WordPress sites in a niche), and developer curiosity (how is that fast website built?).
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Our tool detects over <strong>60 technologies</strong> across categories including content management systems (WordPress, Shopify, Wix, Webflow, Drupal), front-end frameworks (React, Next.js, Vue, Angular, Nuxt), CDN providers (Cloudflare, AWS CloudFront, Fastly, Akamai), analytics platforms (Google Analytics, Hotjar, Mixpanel, Plausible), and security policies (HSTS, Content Security Policy).
          </p>
        </div>

        {/* ── FAQs ── */}
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-white mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden"
            >
              <button
                className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-sm"
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                {faq.q}
                {faqOpen === i ? (
                  <ChevronUp className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              <div
                className={`px-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-all duration-300 ${
                  faqOpen === i ? "pb-5 pt-1 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0 overflow-hidden"
                }`}
              >
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
