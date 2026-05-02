"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { saveAs } from "file-saver";
import { UploadCloud, Loader2, CheckCircle2, Download, Zap, Server, Music2, Trash2, Volume2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const CLIENT_MAX = 50 * 1024 * 1024;
const POLL_MS = 2500;

// WAV encoder
function writeStr(v, o, s) { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); }
function f32to16(out, off, inp) { for (let i = 0; i < inp.length; i++, off += 2) { const s = Math.max(-1, Math.min(1, inp[i])); out.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true); } }
function encodeWAV(samples, sr, ch) {
  const b = new ArrayBuffer(44 + samples.length * 2); const v = new DataView(b);
  writeStr(v,0,"RIFF"); v.setUint32(4,36+samples.length*2,true); writeStr(v,8,"WAVE"); writeStr(v,12,"fmt ");
  v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,ch,true); v.setUint32(24,sr,true);
  v.setUint32(28,sr*ch*2,true); v.setUint16(32,ch*2,true); v.setUint16(34,16,true);
  writeStr(v,36,"data"); v.setUint32(40,samples.length*2,true); f32to16(v,44,samples); return b;
}
function interleave(L, R) { const r = new Float32Array(L.length+R.length); for (let i=0,x=0;i<L.length;i++){r[x++]=L[i];r[x++]=R[i];} return r; }

async function browserTrim(file, startSec, endSec) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const ab = await file.arrayBuffer();
  const buf = await ctx.decodeAudioData(ab);
  const sr = buf.sampleRate;
  const startFrame = Math.floor(startSec * sr);
  const endFrame = Math.min(Math.floor(endSec * sr), buf.length);
  const len = endFrame - startFrame;
  if (len <= 0) throw new Error("Invalid trim range.");
  const ch = Math.min(buf.numberOfChannels, 2);
  const trimmed = [];
  for (let c = 0; c < ch; c++) {
    trimmed.push(buf.getChannelData(c).slice(startFrame, endFrame));
  }
  const samples = ch === 2 ? interleave(trimmed[0], trimmed[1]) : interleave(trimmed[0], trimmed[0]);
  const wav = encodeWAV(samples, sr, 2);
  return new Blob([wav], { type: "audio/wav" });
}

// Waveform canvas
function Waveform({ audioBuf, startSec, endSec, duration, onRangeChange }) {
  const canvasRef = useRef(null);
  const dragging = useRef(null);

  useEffect(() => {
    if (!audioBuf || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = canvas.width, H = canvas.height;
    const data = audioBuf.getChannelData(0);
    const step = Math.ceil(data.length / W);
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, W, H);
    // selection
    const sx = (startSec / duration) * W, ex = (endSec / duration) * W;
    ctx.fillStyle = "#c7d2fe";
    ctx.fillRect(sx, 0, ex - sx, H);
    // waveform
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < W; i++) {
      let min = 1, max = -1;
      for (let j = 0; j < step; j++) { const s = data[i * step + j] || 0; if (s < min) min = s; if (s > max) max = s; }
      ctx.moveTo(i, (1 - max) * H / 2); ctx.lineTo(i, (1 - min) * H / 2);
    }
    ctx.stroke();
    // handles
    [sx, ex].forEach((x, i) => {
      ctx.fillStyle = i === 0 ? "#4f46e5" : "#7c3aed";
      ctx.fillRect(x - 2, 0, 4, H);
      ctx.beginPath(); ctx.arc(x, H / 2, 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [audioBuf, startSec, endSec, duration]);

  const getTime = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(duration, x * duration));
  };

  const onMouseDown = (e) => {
    const t = getTime(e);
    const ds = Math.abs(t - startSec), de = Math.abs(t - endSec);
    dragging.current = ds < de ? "start" : "end";
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const t = getTime(e);
    if (dragging.current === "start") onRangeChange(Math.min(t, endSec - 0.1), endSec);
    else onRangeChange(startSec, Math.max(t, startSec + 0.1));
  };
  const onMouseUp = () => { dragging.current = null; };

  return (
    <canvas ref={canvasRef} width={800} height={100} className="w-full rounded-xl cursor-col-resize border border-slate-200"
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
  );
}

function fmtTime(s) {
  const m = Math.floor(s / 60), sec = (s % 60).toFixed(1);
  return `${m}:${parseFloat(sec) < 10 ? "0" : ""}${sec}`;
}

export default function AudioTrimmerClient() {
  const [file, setFile] = useState(null);
  const [audioBuf, setAudioBuf] = useState(null);
  const [duration, setDuration] = useState(0);
  const [startSec, setStartSec] = useState(0);
  const [endSec, setEndSec] = useState(30);
  const [format, setFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("192k");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outBlob, setOutBlob] = useState(null);
  const [outUrl, setOutUrl] = useState(null);
  const [error, setError] = useState(null);
  const [faqOpen, setFaqOpen] = useState(null);

  const mode = file ? (file.size <= CLIENT_MAX && format === "wav" ? "client" : "server") : null;

  const handleFile = async (f) => {
    if (!f || !f.type.startsWith("audio/")) { toast.error("Please select an audio file."); return; }
    setFile(f); setOutBlob(null); setOutUrl(null); setError(null); setProgress(0);
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const ab = await f.arrayBuffer();
      const buf = await ctx.decodeAudioData(ab.slice(0));
      setAudioBuf(buf);
      setDuration(buf.duration);
      setStartSec(0);
      setEndSec(Math.min(buf.duration, 30));
    } catch { setAudioBuf(null); setDuration(0); }
  };

  const handleTrim = async () => {
    if (!file) return;
    setLoading(true); setError(null); setOutBlob(null); setOutUrl(null); setProgress(0);
    try {
      if (mode === "client") {
        const blob = await browserTrim(file, startSec, endSec);
        setOutBlob(blob); setOutUrl(URL.createObjectURL(blob));
        toast.success("Trimmed instantly in browser!");
      } else {
        setProgress(5);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("start_sec", startSec.toFixed(3));
        fd.append("end_sec", endSec.toFixed(3));
        fd.append("output_format", format);
        fd.append("bitrate", bitrate);
        const res = await fetch(`${API_V1}/tools/audio-trim`, { method: "POST", body: fd });
        if (!res.ok) { const e = await res.json(); throw new Error(e.detail || "Upload failed."); }
        const { job_id } = await res.json();
        setProgress(15);
        for (;;) {
          await new Promise(r => setTimeout(r, POLL_MS));
          const sr = await fetch(`${API_V1}/jobs/${job_id}`);
          const job = await sr.json();
          if (job.progress) setProgress(parseInt(job.progress));
          if (job.status === "failed") throw new Error(job.error || "Failed.");
          if (job.status === "done") {
            const dl = await fetch(`${API_V1}/download/${job_id}`);
            const blob = await dl.blob();
            setOutBlob(blob); setOutUrl(URL.createObjectURL(blob));
            toast.success("Audio trimmed!"); break;
          }
        }
      }
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const trimDuration = Math.max(0, endSec - startSec);

  const faqs = [
    { q: "How does browser trimming work?", a: "For WAV files under 50MB, your browser decodes the audio into raw PCM samples, slices the array between your start and end frame positions, and re-encodes the slice as a WAV file — entirely locally with no upload." },
    { q: "Which formats need server processing?", a: "MP3, AAC, FLAC, and OGG require server-side FFmpeg encoding since browsers can't natively encode these formats. Large files (> 50MB) are also routed to the server regardless of format." },
    { q: "How precise is the trimming?", a: "Browser trimming is sample-accurate (1/44100th of a second precision). Server trimming uses FFmpeg's -ss and -t flags which are frame-accurate for most codecs." },
    { q: "Can I use the waveform to set trim points?", a: "Yes! Drag the purple handles on the waveform to visually set start and end points. You can also type exact values in the time inputs below the waveform." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-900 via-rose-900 to-pink-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[5%] right-[5%] w-[50%] h-[75%] rounded-full bg-orange-500 blur-[150px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[35%] h-[50%] rounded-full bg-rose-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Audio <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-300">Trimmer</span>
          </h1>
          <p className="text-lg text-orange-100 max-w-2xl mx-auto font-light">Set precise start and end times to cut any audio file. Small WAV files trimmed instantly in your browser.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          {mode && (
            <div className={`px-8 py-3 flex items-center gap-3 text-sm font-bold border-b ${mode === "client" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              {mode === "client" ? <><Zap className="w-4 h-4" />Trimming locally — zero upload</> : <><Server className="w-4 h-4" />{format !== "wav" ? `${format.toUpperCase()} encoding` : "Large file"} requires server processing</>}
            </div>
          )}

          <div className="p-8 space-y-8">
            {/* Drop zone */}
            {!file ? (
              <div className="border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 hover:bg-orange-50/40 transition-all rounded-2xl p-14 text-center flex flex-col items-center"
                onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}>
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4"><UploadCloud className="w-8 h-8" /></div>
                <h3 className="text-lg font-bold mb-1">Drop your audio file here</h3>
                <p className="text-slate-500 text-sm mb-6">MP3, WAV, AAC, FLAC, OGG — up to 500MB</p>
                <div className="flex gap-3 text-xs mb-6">
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-bold">WAV ≤ 50MB → Instant browser</span>
                  <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full font-bold">Other formats → Server</span>
                </div>
                <label className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl cursor-pointer transition-colors shadow-md">
                  Choose Audio File
                  <input type="file" className="hidden" accept="audio/*" onChange={e => { if (e.target.files[0]) handleFile(e.target.files[0]); }} />
                </label>
              </div>
            ) : (
              <>
                {/* File info */}
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0"><Music2 className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size/1024/1024).toFixed(1)} MB · {fmtTime(duration)} total</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setAudioBuf(null); setOutBlob(null); setOutUrl(null); }} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>

                {/* Waveform */}
                {audioBuf && duration > 0 && (
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-2">Drag handles to set trim range</p>
                    <Waveform audioBuf={audioBuf} startSec={startSec} endSec={endSec} duration={duration}
                      onRangeChange={(s, e) => { setStartSec(parseFloat(s.toFixed(2))); setEndSec(parseFloat(e.toFixed(2))); }} />
                  </div>
                )}

                {/* Time inputs */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Start Time (s)</label>
                    <input type="number" min={0} max={endSec - 0.1} step={0.1} value={startSec}
                      onChange={e => setStartSec(Math.max(0, Math.min(parseFloat(e.target.value)||0, endSec-0.1)))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-orange-400 outline-none" />
                    <p className="text-xs text-slate-400 mt-1 text-center">{fmtTime(startSec)}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration</p>
                    <div className="bg-orange-100 text-orange-700 font-extrabold text-xl px-6 py-3 rounded-xl">{fmtTime(trimDuration)}</div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">End Time (s)</label>
                    <input type="number" min={startSec + 0.1} max={duration} step={0.1} value={endSec}
                      onChange={e => setEndSec(Math.min(parseFloat(e.target.value)||duration, duration))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:ring-2 focus:ring-orange-400 outline-none" />
                    <p className="text-xs text-slate-400 mt-1 text-center">{fmtTime(endSec)}</p>
                  </div>
                </div>

                {/* Format & Bitrate */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-3">Output Format</p>
                    <div className="flex flex-wrap gap-2">
                      {["mp3","wav","aac","flac"].map(f => (
                        <button key={f} onClick={() => setFormat(f)}
                          className={`px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${format===f?"border-orange-500 bg-orange-50 text-orange-700":"border-slate-200 text-slate-600 hover:border-orange-300"}`}>
                          {f.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!["wav","flac"].includes(format) && (
                    <div>
                      <p className="text-sm font-bold text-slate-700 mb-3">Bitrate</p>
                      <div className="flex flex-wrap gap-2">
                        {["64k","128k","192k","256k","320k"].map(b => (
                          <button key={b} onClick={() => setBitrate(b)}
                            className={`px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${bitrate===b?"bg-orange-600 text-white border-orange-600":"bg-white border-slate-200 text-slate-600 hover:border-orange-300"}`}>
                            {b.replace("k"," kbps")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Trim button */}
                {!loading && !outBlob && (
                  <button onClick={handleTrim}
                    className="w-full bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg">
                    <Music2 className="w-6 h-6" />
                    Trim to {fmtTime(trimDuration)}
                    <span className="text-sm opacity-70">({mode === "client" ? "browser" : "server"})</span>
                  </button>
                )}

                {loading && (
                  <div className="flex flex-col items-center py-6">
                    <Loader2 className="w-10 h-10 text-orange-600 animate-spin mb-4" />
                    <p className="font-bold text-slate-700 mb-4">{mode === "client" ? "Trimming in browser…" : "Server processing…"}</p>
                    {mode === "server" && (
                      <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                )}

                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>}

                {/* Output */}
                {outBlob && outUrl && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div>
                        <div>
                          <p className="font-bold text-emerald-800">Trim Complete!</p>
                          <p className="text-xs text-emerald-600">{(mode==="client"?"WAV":format).toUpperCase()} · {(outBlob.size/1024/1024).toFixed(2)} MB · {fmtTime(trimDuration)}</p>
                        </div>
                      </div>
                      <button onClick={() => saveAs(outBlob, `trimmed.${mode==="client"?"wav":format}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-md">
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-emerald-100">
                      <div className="flex items-center gap-2 mb-2"><Volume2 className="w-4 h-4 text-emerald-500" /><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Preview</p></div>
                      <audio controls className="w-full" src={outUrl} />
                    </div>
                    <button onClick={() => { setOutBlob(null); setOutUrl(null); }} className="mt-4 w-full text-sm text-slate-400 hover:text-slate-600 py-2 transition-colors">Trim again</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* FAQs */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 hover:bg-slate-50" onClick={() => setFaqOpen(faqOpen===i?null:i)}>
                  {faq.q}
                  {faqOpen===i ? <ChevronUp className="w-5 h-5 text-orange-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </button>
                <div className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ${faqOpen===i?"pb-6 max-h-40 opacity-100":"max-h-0 opacity-0 py-0"}`}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
