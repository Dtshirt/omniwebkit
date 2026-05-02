"use client";

import React, { useState, useRef, useCallback } from "react";
import { saveAs } from "file-saver";
import {
  UploadCloud, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Download, Zap, Server, Film,
  Music2, Trash2, Volume2
} from "lucide-react";
import { toast } from "react-hot-toast";

const CLIENT_THRESHOLD = 50 * 1024 * 1024;  // 50MB
const MAX_SIZE = 2 * 1024 * 1024 * 1024;    // 2GB
const POLLING_INTERVAL = 2500;

const FORMATS = [
  { id: "mp3",  label: "MP3",  desc: "Best compatibility",   ext: "mp3",  serverOnly: false },
  { id: "wav",  label: "WAV",  desc: "Lossless, large file", ext: "wav",  serverOnly: false },
  { id: "aac",  label: "AAC",  desc: "High quality, small",  ext: "m4a",  serverOnly: true },
  { id: "flac", label: "FLAC", desc: "Lossless compressed",  ext: "flac", serverOnly: true },
];

const BITRATES = ["64k", "96k", "128k", "192k", "256k", "320k"];

// ─── Browser WAV encoder utilities ──────────────────────────────────────────

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}
function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}
function interleave(L, R) {
  const result = new Float32Array(L.length + R.length);
  for (let i = 0, idx = 0; i < L.length; i++) { result[idx++] = L[i]; result[idx++] = R[i]; }
  return result;
}
function encodeWAV(samples, sampleRate, channels) {
  const buf = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buf);
  writeString(view, 0, "RIFF"); view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE"); writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, channels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true);
  writeString(view, 36, "data"); view.setUint32(40, samples.length * 2, true);
  floatTo16BitPCM(view, 44, samples);
  return buf;
}
async function browserExtractWAV(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
        onProgress(25);
        const audioBuf = await ctx.decodeAudioData(e.target.result);
        onProgress(60);
        let samples;
        if (audioBuf.numberOfChannels >= 2) {
          samples = interleave(audioBuf.getChannelData(0), audioBuf.getChannelData(1));
        } else {
          const ch = audioBuf.getChannelData(0);
          samples = interleave(ch, ch);
        }
        onProgress(85);
        const wavBuf = encodeWAV(samples, audioBuf.sampleRate, 2);
        const blob = new Blob([wavBuf], { type: "audio/wav" });
        onProgress(100);
        resolve({ blob, duration: audioBuf.duration });
      } catch (err) { reject(err); }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export default function VideoToAudioClient() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("192k");
  const [mode, setMode] = useState(null); // 'client' | 'server'
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [outputBlob, setOutputBlob] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);
  const [duration, setDuration] = useState(null);
  const [error, setError] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);

  const videoRef = useRef(null);

  // ─── File Selection ────────────────────────────────────────────────────────

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("video/")) { toast.error("Please select a video file."); return; }
    if (f.size > MAX_SIZE) { toast.error("File exceeds 2GB limit."); return; }

    setFile(f);
    setOutputBlob(null); setOutputUrl(null); setError(null); setProgress(0);

    const isSmall = f.size <= CLIENT_THRESHOLD;
    setMode(isSmall ? "client" : "server");

    // Auto-detect duration
    const url = URL.createObjectURL(f);
    const vid = document.createElement("video");
    vid.src = url;
    vid.onloadedmetadata = () => { setDuration(vid.duration); URL.revokeObjectURL(url); };
  };

  // ─── Effective format mode ─────────────────────────────────────────────────

  const selectedFmt = FORMATS.find(f => f.id === format) || FORMATS[0];
  // AAC and FLAC can't be encoded in-browser → force server
  const effectiveMode = (mode === "client" && selectedFmt.serverOnly) ? "server" : mode;

  // ─── Convert ──────────────────────────────────────────────────────────────

  const handleConvert = async () => {
    if (!file || loading) return;
    setLoading(true); setError(null); setProgress(0); setOutputBlob(null); setOutputUrl(null);

    try {
      if (effectiveMode === "client") {
        setStatusMsg("Decoding audio in browser…");
        const { blob, duration: d } = await browserExtractWAV(file, setProgress);
        if (d && !duration) setDuration(d);
        setOutputBlob(blob);
        setOutputUrl(URL.createObjectURL(blob));
        toast.success("Audio extracted instantly!");
      } else {
        setStatusMsg("Uploading video to server…");
        setProgress(5);

        const fd = new FormData();
        fd.append("file", file);
        fd.append("output_format", format);
        fd.append("bitrate", bitrate);

        const res = await fetch("http://localhost:8000/api/v1/tools/video-to-audio", {
          method: "POST", body: fd,
        });
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }

        const { job_id } = await res.json();
        setProgress(15);
        setStatusMsg("Server extracting audio…");
        await pollJob(job_id);
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Conversion failed.");
    } finally {
      setLoading(false); setStatusMsg("");
    }
  };

  const pollJob = async (jobId) => {
    for (;;) {
      await new Promise(r => setTimeout(r, POLLING_INTERVAL));
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}`);
      if (!res.ok) throw new Error("Status check failed.");
      const job = await res.json();
      if (job.progress) setProgress(parseInt(job.progress, 10));
      if (job.status === "failed") throw new Error(job.error || "Server processing failed.");
      if (job.status === "done") {
        setStatusMsg("Downloading audio…");
        const dl = await fetch(`http://localhost:8000/api/v1/download/${jobId}`);
        if (!dl.ok) throw new Error("Download failed.");
        const blob = await dl.blob();
        setOutputBlob(blob);
        setOutputUrl(URL.createObjectURL(blob));
        toast.success("Audio extracted successfully!");
        return;
      }
    }
  };

  const handleDownload = () => {
    if (!outputBlob) return;
    const stem = file?.name?.replace(/\.[^.]+$/, "") || "audio";
    const ext = effectiveMode === "client" ? "wav" : selectedFmt.ext;
    saveAs(outputBlob, `${stem}.${ext}`);
  };

  const handleReset = () => {
    setFile(null); setMode(null); setOutputBlob(null); setOutputUrl(null);
    setError(null); setProgress(0); setDuration(null);
  };

  const fmtDuration = (s) => {
    if (!s) return "";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const faqs = [
    { q: "When does my browser handle conversion?", a: "For video files under 50MB, your browser decodes the audio track using the native Web Audio API and re-encodes it as a WAV file. Everything happens locally — no upload, no server, instant result." },
    { q: "Why is WAV the only browser-side format?", a: "Browser APIs can natively decode audio PCM data and encode it as WAV. Encoding to MP3, AAC, or FLAC requires complex codec implementations that must run server-side via FFmpeg for accuracy and speed." },
    { q: "How does the server process large files?", a: "Uploads are streamed in 2MB chunks to prevent memory spikes. FFmpeg uses the -vn flag to skip video frame decoding entirely, extracting only the audio stream at maximum speed. Jobs are queued to prevent server overload." },
    { q: "Which format should I choose?", a: "MP3 is best for podcasts, music, and sharing. WAV is ideal if you need lossless audio for further editing. AAC offers better quality than MP3 at the same file size. FLAC is perfect for archival — lossless but compressed." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-rose-900 via-pink-900 to-fuchsia-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[5%] right-[5%] w-[55%] h-[80%] rounded-full bg-pink-500 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[50%] rounded-full bg-rose-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Video to <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-300">Audio</span> Converter
          </h1>
          <p className="text-lg text-pink-100 max-w-2xl mx-auto font-light">
            Extract high-quality MP3, WAV, AAC, or FLAC audio from any video file. Small videos converted instantly in your browser.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">

          {/* Mode badge */}
          {effectiveMode && (
            <div className={`px-8 py-3 flex items-center gap-3 text-sm font-bold border-b ${effectiveMode === "client" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              {effectiveMode === "client"
                ? <><Zap className="w-4 h-4" /> Decoded locally in your browser — instant, zero upload</>
                : <><Server className="w-4 h-4" /> {selectedFmt.serverOnly ? `${selectedFmt.label} encoding requires server processing` : "Large file detected — server FFmpeg processing"}</>
              }
            </div>
          )}

          <div className="p-8 space-y-8">

            {/* Drop Zone */}
            {!file ? (
              <div
                className="border-2 border-dashed border-slate-300 hover:border-pink-400 bg-slate-50 hover:bg-pink-50/40 transition-all rounded-2xl p-16 text-center flex flex-col items-center"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
              >
                <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-6">
                  <Film className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Drop your video here</h3>
                <p className="text-slate-500 text-sm mb-2">MP4, MOV, AVI, MKV, WebM — up to 2GB</p>
                <div className="flex gap-3 text-xs mt-2 mb-8">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold">≤ 50MB → Instant browser</span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold">&gt; 50MB → Server FFmpeg</span>
                </div>
                <label className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-10 rounded-xl cursor-pointer transition-colors shadow-md">
                  Choose Video File
                  <input type="file" className="hidden" accept="video/*" onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
                </label>
              </div>
            ) : (
              <>
                {/* File Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Film className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                      <p className="text-sm text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                        {duration && ` · ${fmtDuration(duration)}`}
                      </p>
                    </div>
                  </div>
                  <button onClick={handleReset} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Format Selector */}
                <div>
                  <p className="text-sm font-bold text-slate-700 mb-3">Output Format</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FORMATS.map((f) => {
                      const willUseServer = f.serverOnly || mode === "server";
                      return (
                        <button
                          key={f.id}
                          onClick={() => setFormat(f.id)}
                          className={`rounded-xl border-2 p-4 text-left transition-all ${format === f.id ? "border-pink-500 bg-pink-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-extrabold text-slate-800">{f.label}</span>
                            {willUseServer
                              ? <Server className="w-3.5 h-3.5 text-amber-500" title="Server required" />
                              : <Zap className="w-3.5 h-3.5 text-emerald-500" title="Browser capable" />
                            }
                          </div>
                          <p className="text-xs text-slate-500">{f.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bitrate (server formats only) */}
                {(effectiveMode === "server" && format !== "wav" && format !== "flac") && (
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-3">Bitrate</p>
                    <div className="flex flex-wrap gap-2">
                      {BITRATES.map(b => (
                        <button
                          key={b}
                          onClick={() => setBitrate(b)}
                          className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${bitrate === b ? "bg-pink-600 text-white border-pink-600" : "bg-white border-slate-200 text-slate-600 hover:border-pink-300"}`}
                        >
                          {b.replace("k", " kbps")}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Convert Button / Progress */}
                {!loading && !outputBlob && (
                  <button
                    onClick={handleConvert}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg"
                  >
                    <Music2 className="w-6 h-6" />
                    Convert to {format.toUpperCase()}
                    <span className="text-sm opacity-70">({effectiveMode === "client" ? "browser" : "server"})</span>
                  </button>
                )}

                {loading && (
                  <div className="flex flex-col items-center py-6">
                    <Loader2 className="w-10 h-10 text-pink-600 animate-spin mb-4" />
                    <p className="font-bold text-slate-700 mb-4">{statusMsg || "Processing…"}</p>
                    <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-pink-600 mt-2">{progress}%</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Output Card */}
                {outputBlob && outputUrl && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-emerald-800">Conversion Complete!</p>
                          <p className="text-xs text-emerald-600">
                            {effectiveMode === "client" ? "WAV" : format.toUpperCase()} ·{" "}
                            {(outputBlob.size / 1024 / 1024).toFixed(2)} MB
                            {duration && ` · ${fmtDuration(duration)}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownload}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors shadow-md"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>

                    {/* Audio Player */}
                    <div className="bg-white rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-3 mb-3">
                        <Volume2 className="w-4 h-4 text-emerald-500" />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview</p>
                      </div>
                      <audio controls className="w-full" src={outputUrl}>
                        Your browser does not support audio preview.
                      </audio>
                    </div>

                    <button onClick={handleReset} className="mt-4 w-full text-sm text-slate-500 hover:text-slate-700 py-2 transition-colors">Convert another video</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 text-pink-600"><Zap className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Instant Browser Decoding</h3>
            <p className="text-slate-600 text-sm leading-relaxed">For videos under 50MB, your browser's native audio engine decodes the video and re-encodes the audio as WAV in milliseconds — no upload whatsoever.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 text-rose-600"><Server className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Fast Server Extraction</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Our backend uses the -vn (no video) optimization to skip frame decoding entirely. Only the audio stream is processed, making it dramatically faster than full transcoding.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4 text-fuchsia-600"><Music2 className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">4 Output Formats</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Choose MP3 for universal compatibility, WAV for lossless editing, AAC for high quality at small size, or FLAC for lossless archival with compression.</p>
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
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-pink-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
