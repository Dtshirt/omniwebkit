"use client";
import React, { useState, useEffect } from "react";
import cronstrue from "cronstrue";
import { CronExpressionParser } from "cron-parser";
import { Clock, Calendar, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, FastForward, Server, Zap } from "lucide-react";
import { API_V1 } from "@/lib/api-config";


const COMMON_CRONS = [
  { expr: "* * * * *", label: "Every minute" },
  { expr: "0 * * * *", label: "Every hour" },
  { expr: "0 0 * * *", label: "Every midnight" },
  { expr: "0 0 * * 0", label: "Every Sunday at midnight" },
  { expr: "0 9 * * 1-5", label: "9:00 AM on weekdays" },
  { expr: "*/15 * * * *", label: "Every 15 minutes" },
  { expr: "0 0 1 * *", label: "First day of month" },
];

export default function CronTesterClient() {
  const [cron, setCron] = useState("0 9 * * 1-5");
  const [desc, setDesc] = useState("");
  const [dates, setDates] = useState([]);
  const [serverDates, setServerDates] = useState([]);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState("idle"); // idle | loading | ok | error
  const [faqOpen, setFaqOpen] = useState(null);

  // ─── Local parsing (instant) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!cron.trim()) {
      setDesc(""); setDates([]); setError(null); return;
    }
    try {
      // 1. Human readable
      const human = cronstrue.toString(cron, { throwExceptionOnParseError: true });
      setDesc(human);

      // 2. Next dates
      const interval = CronExpressionParser.parse(cron);
      const next10 = [];
      for (let i = 0; i < 10; i++) {
        next10.push(interval.next().toDate());
      }
      setDates(next10);
      setError(null);
    } catch (err) {
      setDesc("");
      setDates([]);
      setError(err.message || "Invalid cron expression");
    }
  }, [cron]);

  // ─── Server verification ────────────────────────────────────────────────────
  const verifyServer = async () => {
    if (!cron.trim() || error) return;
    setServerStatus("loading");
    setServerDates([]);
    try {
      const res = await fetch(`${API_V1}/tools/cron-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: cron, count: 10 }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      if (!data.is_valid) throw new Error(data.error);
      
      setServerDates(data.next_occurrences.map(iso => new Date(iso)));
      setServerStatus("ok");
    } catch {
      setServerStatus("error");
    }
  };

  const faqs = [
    { q: "What is a Cron Expression?", a: "A cron expression is a string comprising five or six fields separated by white space that represents a set of times, normally as a schedule to execute some routine. It's used heavily in Unix-like operating systems and task schedulers." },
    { q: "How are the fields structured?", a: "Standard cron has 5 fields: Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6, where 0 is Sunday)." },
    { q: "What do the special characters mean?", a: "Asterisk (*) means 'every'. Comma (,) separates values (e.g. 1,5). Hyphen (-) defines ranges (1-5). Slash (/) defines increments (*/15 means every 15 units)." },
    { q: "Why is there a server verification option?", a: "While the browser instantly calculates the next dates based on your local timezone, your actual server might be running in UTC or another timezone. The server verification runs the exact Python `croniter` library used in production backends to ensure 100% compatibility and shows exact UTC execution times." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[75%] rounded-full bg-indigo-500 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[50%] rounded-full bg-blue-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Cron Job <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-300">Tester</span>
          </h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto font-light">
            Instantly validate cron expressions, see human-readable descriptions, and generate the next 10 scheduled execution times.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8">
          {/* Input Area */}
          <div className="mb-8">
            <label className="text-sm font-bold text-slate-700 block mb-3">Cron Expression</label>
            <div className="relative">
              <input 
                type="text" 
                value={cron} 
                onChange={e => { setCron(e.target.value); setServerStatus("idle"); setServerDates([]); }}
                className={`w-full text-2xl md:text-4xl font-mono text-center tracking-widest py-6 px-4 rounded-2xl border-2 outline-none transition-colors ${
                  error ? "border-red-300 text-red-600 bg-red-50 focus:border-red-500" : "border-slate-200 text-slate-800 bg-slate-50 focus:border-indigo-400 focus:bg-white"
                }`}
                placeholder="* * * * *"
                autoFocus
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                {error ? <XCircle className="w-8 h-8 text-red-400" /> : <CheckCircle2 className="w-8 h-8 text-emerald-400" />}
              </div>
            </div>

            {/* Labels under input */}
            <div className="flex justify-between max-w-md mx-auto px-4 mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              <span className="w-1/5">Min</span>
              <span className="w-1/5">Hour</span>
              <span className="w-1/5">Day</span>
              <span className="w-1/5">Mon</span>
              <span className="w-1/5">Week</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          {/* Description & Next Dates */}
          {!error && cron && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center mb-8">
              <p className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-2">Schedule Meaning</p>
              <p className="text-xl md:text-2xl font-extrabold text-indigo-900 capitalize">"{desc}"</p>
            </div>
          )}

          {/* Presets */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Common Schedules</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_CRONS.map((c, i) => (
                <button 
                  key={i} 
                  onClick={() => { setCron(c.expr); setServerStatus("idle"); setServerDates([]); }}
                  className="bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {!error && dates.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            
            {/* Local Browser Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-800">Local Browser Time</h3>
                </div>
                <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">Instant</span>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {dates.map((d, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-slate-400 font-mono w-6 text-right">#{i+1}</span>
                      <Calendar className="w-4 h-4 text-slate-300" />
                      <span className="font-bold text-slate-700 w-28">{d.toLocaleDateString()}</span>
                      <Clock className="w-4 h-4 text-slate-300 ml-auto" />
                      <span className="font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded">{d.toLocaleTimeString()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Server Verification Results */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-800">Server Time (UTC)</h3>
                </div>
                {serverStatus === "ok" && <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Verified</span>}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                {serverStatus === "idle" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Server className="w-12 h-12 text-slate-200 mb-3" />
                    <p className="text-sm text-slate-500 mb-4 max-w-[200px]">Verify this expression against the Python backend to ensure exact UTC execution times.</p>
                    <button 
                      onClick={verifyServer}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl text-sm transition-colors shadow-md"
                    >
                      Verify on Server
                    </button>
                  </div>
                )}

                {serverStatus === "loading" && (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <FastForward className="w-8 h-8 text-indigo-400 animate-pulse mb-3" />
                    <p className="text-sm font-bold text-indigo-600">Calculating on server...</p>
                  </div>
                )}

                {serverStatus === "error" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <XCircle className="w-10 h-10 text-red-400 mb-3" />
                    <p className="text-sm font-bold text-red-600 mb-4">Server validation failed.</p>
                    <button onClick={verifyServer} className="text-sm font-bold text-slate-500 hover:text-slate-700 underline">Try again</button>
                  </div>
                )}

                {serverStatus === "ok" && serverDates.length > 0 && (
                  <ul className="space-y-3">
                    {serverDates.map((d, i) => (
                      <li key={i} className="flex items-center gap-4 text-sm border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-slate-400 font-mono w-6 text-right">#{i+1}</span>
                        <Calendar className="w-4 h-4 text-indigo-200" />
                        <span className="font-bold text-slate-700 w-28">{d.toISOString().split("T")[0]}</span>
                        <Clock className="w-4 h-4 text-indigo-200 ml-auto" />
                        <span className="font-mono text-indigo-700 bg-indigo-50 px-2 py-1 rounded">{d.toISOString().split("T")[1].substring(0,8)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

          </div>
        )}

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <button 
                  className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50" 
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  {faq.q}
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
