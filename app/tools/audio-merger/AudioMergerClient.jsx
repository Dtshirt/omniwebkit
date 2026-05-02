"use client";
import React, { useState, useRef } from "react";
import { saveAs } from "file-saver";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Download, Zap, Server, Music2, Trash2, GripVertical, Plus, Volume2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { API_V1 } from "@/lib/api-config";

const CLIENT_THRESHOLD = 50 * 1024 * 1024;
const POLLING_INTERVAL = 2500;
const MAX_FILES = 20;

// ─── Browser-side WAV encoder helpers ────────────────────────────────────────
function writeString(v, o, s) { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
function floatTo16(out, off, inp) {
  for (let i = 0; i < inp.length; i++, off += 2) { const s = Math.max(-1, Math.min(1, inp[i])); out.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); }
}
function interleave(L, R) {
  const r = new Float32Array(L.length + R.length);
  for (let i = 0, idx = 0; i < L.length; i++) { r[idx++] = L[i]; r[idx++] = R[i]; }
  return r;
}
function encodeWAV(samples, sr, ch) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buf);
  writeString(v, 0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true);
  writeString(v, 8, "WAVE"); writeString(v, 12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * ch * 2, true);
  v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true);
  writeString(v, 36, "data"); v.setUint32(40, samples.length * 2, true);
  floatTo16(v, 44, samples);
  return buf;
}

async function decodeAudio(file) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
  const ab = await file.arrayBuffer();
  return ctx.decodeAudioData(ab);
}

function applyFade(buf, fadeFrames, fadeIn) {
  const ch = buf.numberOfChannels;
  for (let c = 0; c < ch; c++) {
    const data = buf.getChannelData(c);
    for (let i = 0; i < Math.min(fadeFrames, data.length); i++) {
      const t = i / fadeFrames;
      const gain = fadeIn ? t : 1 - t;
      const idx = fadeIn ? i : data.length - fadeFrames + i;
      if (idx >= 0 && idx < data.length) data[idx] *= gain;
    }
  }
}

async function browserMerge(files, crossfadeSec) {
  const SR = 44100;
  const CH = 2;
  const crossFrames = Math.floor(crossfadeSec * SR);

  const buffers = [];
  for (const file of files) {
    const decoded = await decodeAudio(file);
    buffers.push(decoded);
  }

  // Apply fades
  if (crossFrames > 0) {
    for (let i = 0; i < buffers.length; i++) {
      if (i > 0) applyFade(buffers[i], crossFrames, true);
      if (i < buffers.length - 1) applyFade(buffers[i], crossFrames, false);
    }
  }

  // Calculate total frames with overlap
  let totalFrames = 0;
  for (let i = 0; i < buffers.length; i++) {
    totalFrames += buffers[i].length;
    if (i < buffers.length - 1 && crossFrames > 0) totalFrames -= crossFrames;
  }
  totalFrames = Math.max(totalFrames, 0);

  const ctx = new OfflineAudioContext(CH, totalFrames, SR);
  let offset = 0;
  for (let i = 0; i < buffers.length; i++) {
    const src = ctx.createBufferSource();
    const outBuf = ctx.createBuffer(CH, buffers[i].length, SR);
    for (let c = 0; c < Math.min(buffers[i].numberOfChannels, CH); c++) {
      outBuf.copyToChannel(buffers[i].getChannelData(c), c);
    }
    if (buffers[i].numberOfChannels === 1) outBuf.copyToChannel(buffers[i].getChannelData(0), 1);
    src.buffer = outBuf;
    src.connect(ctx.destination);
    src.start(offset / SR);
    if (i < buffers.length - 1) offset += buffers[i].length - crossFrames;
    else offset += buffers[i].length;
  }

  const rendered = await ctx.startRendering();
  let samples;
  if (rendered.numberOfChannels >= 2) {
    samples = interleave(rendered.getChannelData(0), rendered.getChannelData(1));
  } else {
    const ch0 = rendered.getChannelData(0);
    samples = interleave(ch0, ch0);
  }
  const wavBuf = encodeWAV(samples, SR, CH);
  return new Blob([wavBuf], { type: "audio/wav" });
}

// ─── Drag-reorder helpers ─────────────────────────────────────────────────────
function reorder(list, from, to) {
  const arr = [...list];
  const [item] = arr.splice(from, 1);
  arr.splice(to, 0, item);
  return arr;
}

export default function AudioMergerClient() {
  const [files, setFiles] = useState([]); // { id, file, name, size }
  const [format, setFormat] = useState("mp3");
  const [crossfade, setCrossfade] = useState(0);
  const [bitrate, setBitrate] = useState("192k");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [outputBlob, setOutputBlob] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [error, setError] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);
  const dragIdx = useRef(null);

  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const useServer = totalSize > CLIENT_THRESHOLD || format !== "wav";
  const mode = files.length > 0 ? (useServer ? "server" : "client") : null;

  const addFiles = (incoming) => {
    const valid = incoming.filter(f => f.type.startsWith("audio/"));
    if (!valid.length) { toast.error("Please select audio files only."); return; }
    setFiles(prev => {
      const next = [...prev, ...valid.map(f => ({ id: Date.now() + Math.random(), file: f, name: f.name, size: f.size }))];
      return next.slice(0, MAX_FILES);
    });
    setOutputBlob(null); setOutputUrl(null); setError(null);
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));
  const moveUp = (i) => { if (i > 0) setFiles(prev => reorder(prev, i, i - 1)); };
  const moveDown = (i) => { if (i < files.length - 1) setFiles(prev => reorder(prev, i, i + 1)); };

  const handleMerge = async () => {
    if (files.length < 2) { toast.error("Add at least 2 audio files."); return; }
    setLoading(true); setError(null); setProgress(0); setOutputBlob(null); setOutputUrl(null);

    try {
      if (mode === "client") {
        setStatusMsg("Merging audio in browser…");
        const rawFiles = files.map(f => f.file);
        const blob = await browserMerge(rawFiles, crossfade);
        setOutputBlob(blob); setOutputUrl(URL.createObjectURL(blob));
        toast.success("Audio merged instantly!");
      } else {
        setStatusMsg("Uploading files to server…"); setProgress(5);
        const fd = new FormData();
        files.forEach(f => fd.append("files", f.file));
        fd.append("output_format", format);
        fd.append("crossfade_ms", String(Math.round(crossfade * 1000)));
        fd.append("bitrate", bitrate);

        const res = await fetch(`${API_V1}/tools/audio-merge`, { method: "POST", body: fd });
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }
        const { job_id } = await res.json();
        setProgress(15); setStatusMsg("Server merging with crossfade…");

        for (;;) {
          await new Promise(r => setTimeout(r, POLLING_INTERVAL));
          const sr = await fetch(`${API_V1}/jobs/${job_id}`);
          if (!sr.ok) throw new Error("Status check failed.");
          const job = await sr.json();
          if (job.progress) setProgress(parseInt(job.progress, 10));
          if (job.status === "failed") throw new Error(job.error || "Server failed.");
          if (job.status === "done") {
            setStatusMsg("Downloading merged audio…");
            const dl = await fetch(`${API_V1}/download/${job_id}`);
            if (!dl.ok) throw new Error("Download failed.");
            const blob = await dl.blob();
            setOutputBlob(blob); setOutputUrl(URL.createObjectURL(blob));
            toast.success("Audio merged!"); break;
          }
        }
      }
    } catch (err) {
      setError(err.message); toast.error(err.message || "Merge failed.");
    } finally {
      setLoading(false); setStatusMsg("");
    }
  };

  const handleDownload = () => {
    if (!outputBlob) return;
    const ext = mode === "client" ? "wav" : format;
    saveAs(outputBlob, `merged-audio.${ext}`);
  };

  const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`;

  const faqs = [
    { q: "How does browser-side merging work?", a: "When all your files are under 50MB total and you choose WAV output, your browser decodes each audio file using the native Web Audio API, concatenates the decoded PCM buffers with optional gain-based crossfades, and re-encodes the result as a WAV file — entirely locally." },
    { q: "What triggers server processing?", a: "Two conditions force server mode: (1) total file size exceeds 50MB, or (2) you choose MP3 or AAC output, since browsers can't encode those formats natively. The server worker processes these with advanced audio tooling supporting full crossfade and compression." },
    { q: "What does crossfade do?", a: "Crossfade overlaps the end of one audio file with the start of the next, applying a fade-out to the first and a fade-in to the second simultaneously. This creates a smooth transition instead of a sudden cut, ideal for music playlists or presentations." },
    { q: "Can I control the order of the files?", a: "Yes — use the ↑ and ↓ arrow buttons next to each file to reorder them before merging. Files are merged in the order shown from top to bottom." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[75%] rounded-full bg-violet-500 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[50%] rounded-full bg-indigo-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Audio <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300">Merger</span>
          </h1>
          <p className="text-lg text-violet-100 max-w-2xl mx-auto font-light">
            Combine multiple audio files into one seamless track. Add smooth crossfade transitions. Output as MP3, WAV, or AAC.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">

          {/* Mode banner */}
          {mode && (
            <div className={`px-8 py-3 flex items-center gap-3 text-sm font-bold border-b ${mode === "client" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              {mode === "client"
                ? <><Zap className="w-4 h-4" /> Merging locally in your browser — no upload required</>
                : <><Server className="w-4 h-4" /> {totalSize > CLIENT_THRESHOLD ? "Large files" : `${format.toUpperCase()} encoding`} requires server processing</>
              }
            </div>
          )}

          <div className="p-8 space-y-8">

            {/* Drop Zone */}
            <div
              className="border-2 border-dashed border-slate-300 hover:border-violet-400 bg-slate-50 hover:bg-violet-50/40 transition-all rounded-2xl p-10 text-center flex flex-col items-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); addFiles(Array.from(e.dataTransfer.files)); }}
            >
              <div className="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4">
                <UploadCloud className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold mb-1">Drop audio files here</h3>
              <p className="text-slate-500 text-sm mb-6">MP3, WAV, AAC, FLAC, OGG — up to {MAX_FILES} files, 500MB total</p>
              <label className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer transition-colors shadow-md flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Audio Files
                <input type="file" className="hidden" accept="audio/*" multiple onChange={(e) => addFiles(Array.from(e.target.files))} />
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-700">{files.length} file{files.length !== 1 ? "s" : ""} · {fmtSize(totalSize)} total</p>
                  <button onClick={() => { setFiles([]); setOutputBlob(null); setOutputUrl(null); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors">Clear all</button>
                </div>
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={f.id} className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 group">
                      <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
                      <div className="w-8 h-8 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-extrabold">{i + 1}</div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate">{f.name}</p>
                        <p className="text-xs text-slate-400">{fmtSize(f.size)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveUp(i)} disabled={i === 0} className="w-7 h-7 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-violet-600 disabled:opacity-30 text-xs font-bold">↑</button>
                        <button onClick={() => moveDown(i)} disabled={i === files.length - 1} className="w-7 h-7 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-violet-600 disabled:opacity-30 text-xs font-bold">↓</button>
                        <button onClick={() => removeFile(f.id)} className="w-7 h-7 bg-white border border-slate-200 rounded-lg text-red-400 hover:text-red-600 flex items-center justify-center">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            {files.length >= 2 && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Format */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">Output Format</p>
                  <div className="flex gap-2">
                    {["mp3", "wav", "aac"].map(f => (
                      <button key={f} onClick={() => setFormat(f)}
                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all ${format === f ? "border-violet-500 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-600 hover:border-violet-300"}`}>
                        {f.toUpperCase()}
                        {f === "wav" && <span className="block text-xs font-normal opacity-60">Browser ⚡</span>}
                        {f !== "wav" && <span className="block text-xs font-normal opacity-60">Server 🖥️</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crossfade */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-700">Crossfade</p>
                    <span className="text-sm font-extrabold text-violet-600">{crossfade === 0 ? "None" : `${crossfade}s`}</span>
                  </div>
                  <input type="range" min={0} max={5} step={0.5} value={crossfade}
                    onChange={(e) => setCrossfade(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-violet-600" />
                  <div className="flex justify-between text-xs text-slate-400 mt-1"><span>No fade</span><span>5s fade</span></div>
                </div>

                {/* Bitrate (MP3 only) */}
                {format === "mp3" && (
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-3">Bitrate</p>
                    <div className="flex flex-wrap gap-2">
                      {["64k","128k","192k","256k","320k"].map(b => (
                        <button key={b} onClick={() => setBitrate(b)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${bitrate === b ? "bg-violet-600 text-white border-violet-600" : "bg-white border-slate-200 text-slate-600 hover:border-violet-300"}`}>
                          {b.replace("k"," kbps")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Merge Button */}
            {files.length >= 2 && !loading && !outputBlob && (
              <button onClick={handleMerge}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg">
                <Music2 className="w-6 h-6" />
                Merge {files.length} Files
                <span className="text-sm opacity-70">({mode === "client" ? "browser" : "server"})</span>
              </button>
            )}

            {/* Progress */}
            {loading && (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-10 h-10 text-violet-600 animate-spin mb-4" />
                <p className="font-bold text-slate-700 mb-4">{statusMsg}</p>
                <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm font-bold text-violet-600 mt-2">{progress}%</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Output */}
            {outputBlob && outputUrl && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-emerald-800">Merge Complete!</p>
                      <p className="text-xs text-emerald-600">{(mode === "client" ? "WAV" : format.toUpperCase())} · {fmtSize(outputBlob.size)}</p>
                    </div>
                  </div>
                  <button onClick={handleDownload}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-md">
                    <Download className="w-4 h-4" /> Download
                  </button>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview</p>
                  </div>
                  <audio controls className="w-full" src={outputUrl} />
                </div>
                <button onClick={() => { setOutputBlob(null); setOutputUrl(null); }} className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors">Merge more files</button>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4 text-violet-600"><Zap className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Browser PCM Merging</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Small WAV batches are decoded into raw PCM audio buffers, concatenated with gain-curve crossfades, and re-encoded as WAV entirely in your browser — zero server load.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600"><Music2 className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Smooth Crossfades</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Set a crossfade duration from 0.5 to 5 seconds. The end of each track fades out while the beginning of the next fades in simultaneously, producing professional DJ-style transitions.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600"><Server className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Queued Server Processing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Large or MP3/AAC jobs are queued to a dedicated background worker. Concurrency is controlled to prevent overloading the server, ensuring reliable processing even under heavy demand.</p>
          </div>
        </div>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {faq.q}
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-violet-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
