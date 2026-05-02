"use client";

import React, { useState, useRef, useCallback } from "react";
import { saveAs } from "file-saver";
import {
  UploadCloud, Loader2, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Download, Image, Plus, Trash2,
  Play, Zap, Server, Film
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const CLIENT_MAX_BYTES = 50 * 1024 * 1024;        // 50 MB → use browser canvas
const SERVER_MAX_BYTES = 2 * 1024 * 1024 * 1024;  // 2 GB  → hard limit
const POLLING_INTERVAL = 2500;
const MAX_TIMESTAMPS = 20;

export default function VideoThumbnailClient() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [timestamps, setTimestamps] = useState(["0"]);
  const [outputFormat, setOutputFormat] = useState("png");
  const [frames, setFrames] = useState([]); // { ts, dataUrl, blob } for client-side
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null); // 'client' | 'server'

  // Server mode
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [serverDone, setServerDone] = useState(false);
  const [serverError, setServerError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [faqOpen, setFaqOpen] = useState(null);

  // ─── File selection ───────────────────────────────────────────────────────

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }
    if (file.size > SERVER_MAX_BYTES) {
      toast.error("File exceeds the 2GB maximum limit.");
      return;
    }

    setFrames([]);
    setServerDone(false);
    setServerError(null);
    setProgress(0);
    setJobId(null);
    setMode(file.size <= CLIENT_MAX_BYTES ? "client" : "server");

    setVideoFile(file);
    setVideoSrc(URL.createObjectURL(file));
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  // ─── Timestamp management ─────────────────────────────────────────────────

  const addTimestamp = () => {
    if (timestamps.length >= MAX_TIMESTAMPS) {
      toast.error(`Maximum ${MAX_TIMESTAMPS} timestamps allowed.`);
      return;
    }
    setTimestamps(prev => [...prev, ""]);
  };

  const updateTimestamp = (idx, val) => {
    setTimestamps(prev => prev.map((t, i) => i === idx ? val : t));
  };

  const removeTimestamp = (idx) => {
    if (timestamps.length <= 1) return;
    setTimestamps(prev => prev.filter((_, i) => i !== idx));
  };

  const formatTimestamp = (seconds) => {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return h > 0
      ? `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`
      : `${m}:${String(s % 60).padStart(2, "0")}`;
  };

  // ─── CLIENT-SIDE extraction (≤50MB) ──────────────────────────────────────

  const captureFrame = useCallback((timestamp) => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) { resolve(null); return; }

      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const mimeType = outputFormat === "jpg" ? "image/jpeg" : "image/png";
        canvas.toBlob((blob) => {
          if (!blob) { resolve(null); return; }
          const dataUrl = URL.createObjectURL(blob);
          resolve({ ts: timestamp, blob, dataUrl });
        }, mimeType, 0.92);
      };

      video.addEventListener("seeked", onSeeked);
      video.currentTime = timestamp;
    });
  }, [outputFormat]);

  const handleClientExtract = async () => {
    const tsValues = timestamps.map(t => parseFloat(t)).filter(t => !isNaN(t) && t >= 0);
    if (tsValues.length === 0) {
      toast.error("Please enter at least one valid timestamp.");
      return;
    }

    setLoading(true);
    setFrames([]);
    const captured = [];

    for (const ts of tsValues) {
      const frame = await captureFrame(ts);
      if (frame) captured.push(frame);
    }

    setFrames(captured);
    setLoading(false);
    toast.success(`Extracted ${captured.length} frame${captured.length !== 1 ? "s" : ""}!`);
  };

  const downloadFrame = (frame) => {
    saveAs(frame.blob, `frame_${frame.ts.toFixed(2)}s.${outputFormat}`);
  };

  const downloadAll = () => {
    frames.forEach(f => {
      setTimeout(() => saveAs(f.blob, `frame_${f.ts.toFixed(2)}s.${outputFormat}`), 100);
    });
  };

  // ─── SERVER-SIDE extraction (>50MB) ──────────────────────────────────────

  const handleServerExtract = async () => {
    if (!videoFile) return;
    const tsValues = timestamps.map(t => parseFloat(t)).filter(t => !isNaN(t) && t >= 0);
    if (tsValues.length === 0) {
      toast.error("Please enter at least one valid timestamp.");
      return;
    }

    setLoading(true);
    setServerDone(false);
    setServerError(null);
    setProgress(5);

    try {
      const fd = new FormData();
      fd.append("file", videoFile);
      fd.append("timestamps", tsValues.join(","));
      fd.append("output_format", outputFormat);

      const res = await fetch(`${API_V1}/tools/video-thumbnail`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || "Upload failed.");
      }

      const { job_id } = await res.json();
      setJobId(job_id);
      setProgress(15);
      pollJob(job_id);
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  const pollJob = async (jId) => {
    try {
      const res = await fetch(`${API_V1}/jobs/${jId}`);
      if (!res.ok) throw new Error("Failed to poll job.");
      const job = await res.json();

      if (job.status === "failed") throw new Error(job.error || "Processing failed.");

      if (job.status === "done") {
        const dl = await fetch(`${API_V1}/download/${jId}`);
        if (!dl.ok) throw new Error("Download failed.");
        saveAs(await dl.blob(), "thumbnails.zip");
        setServerDone(true);
        setProgress(100);
        setLoading(false);
        toast.success("Frames extracted and downloaded!");
        return;
      }

      if (job.progress) setProgress(parseInt(job.progress, 10));
      setTimeout(() => pollJob(jId), POLLING_INTERVAL);
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  const handleExtract = () => {
    if (mode === "client") handleClientExtract();
    else handleServerExtract();
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoSrc(null);
    setVideoDuration(0);
    setFrames([]);
    setTimestamps(["0"]);
    setMode(null);
    setServerDone(false);
    setServerError(null);
    setProgress(0);
    setJobId(null);
  };

  const faqs = [
    { q: "How does the browser extraction work?", a: "For videos under 50MB, your browser's native video player seeks to each timestamp you specify. A hidden canvas element then captures the exact pixel data at that moment and converts it to a PNG or JPG image — entirely locally with zero server involvement." },
    { q: "Why switch to server-side for large videos?", a: "Seeking through a 500MB+ video file in a browser tab would consume gigabytes of RAM and potentially crash the tab. For large files, we upload to our backend where FFmpeg processes the video efficiently in a background worker." },
    { q: "What timestamp format should I use?", a: "Enter timestamps in seconds. For example, 0 = first frame, 5.5 = 5.5 seconds in, 90 = 1 minute 30 seconds. You can add up to 20 timestamps per extraction." },
    { q: "Does the server need FFmpeg installed?", a: "Yes — the backend uses FFmpeg to process large video files. Ensure FFmpeg is installed on your server and available in the system PATH. Download it from the official FFmpeg website." },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-900 via-fuchsia-900 to-pink-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-[10%] right-[5%] w-[50%] h-[70%] rounded-full bg-fuchsia-500 blur-[140px]" />
          <div className="absolute bottom-[5%] left-[5%] w-[30%] h-[40%] rounded-full bg-purple-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Video Thumbnail <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-300">Extractor</span>
          </h1>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto font-light">
            Extract any frame from a video at precise timestamps. Download as high-quality PNG or JPG.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">

          {/* Mode Badge */}
          {mode && (
            <div className={`px-8 py-3 flex items-center gap-3 text-sm font-bold border-b ${mode === "client" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-amber-50 border-amber-100 text-amber-700"}`}>
              {mode === "client"
                ? <><Zap className="w-4 h-4" /> Processing locally in your browser — zero server load</>
                : <><Server className="w-4 h-4" /> Large file detected — FFmpeg server processing will be used</>
              }
            </div>
          )}

          <div className="p-8">

            {/* Drop Zone */}
            {!videoFile && (
              <div
                className="w-full border-2 border-dashed border-slate-300 hover:border-fuchsia-400 bg-slate-50 hover:bg-fuchsia-50/40 transition-all rounded-2xl p-16 text-center flex flex-col items-center cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f); }}
              >
                <div className="w-20 h-20 bg-fuchsia-100 text-fuchsia-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Film className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Drop your video here</h3>
                <p className="text-slate-500 text-sm mb-2">MP4, WebM, MOV, AVI, MKV — up to 2GB</p>
                <p className="text-xs text-slate-400 mb-8">Under 50MB: instant browser extraction &nbsp;|&nbsp; Over 50MB: server FFmpeg processing</p>
                <label className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-3 px-10 rounded-xl cursor-pointer transition-colors shadow-md">
                  Choose Video File
                  <input type="file" className="hidden" accept="video/*" onChange={(e) => { if (e.target.files[0]) handleFileSelect(e.target.files[0]); }} />
                </label>
              </div>
            )}

            {/* Video + Controls */}
            {videoFile && (
              <div>
                {/* Video Player */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-sm">{videoFile.name}</p>
                      <p className="text-sm text-slate-400">{(videoFile.size / 1024 / 1024).toFixed(1)} MB  {videoDuration > 0 && `· ${formatTimestamp(videoDuration)} duration`}</p>
                    </div>
                    <button onClick={handleReset} className="text-sm text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                  </div>
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    onLoadedMetadata={handleVideoLoaded}
                    controls
                    className="w-full rounded-xl bg-black shadow-md"
                    style={{ maxHeight: "340px" }}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Timestamp Builder */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700">Timestamps to Extract</h3>
                    <div className="flex items-center gap-3">
                      <select
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                      >
                        <option value="png">PNG</option>
                        <option value="jpg">JPG</option>
                      </select>
                      <button
                        onClick={addTimestamp}
                        disabled={timestamps.length >= MAX_TIMESTAMPS}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" /> Add Timestamp
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {timestamps.map((ts, idx) => (
                      <div key={idx} className="relative group">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={ts}
                          onChange={(e) => updateTimestamp(idx, e.target.value)}
                          placeholder="Seconds"
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-fuchsia-500 outline-none pr-9"
                        />
                        <p className="text-xs text-slate-400 text-center mt-1">
                          {!isNaN(parseFloat(ts)) ? formatTimestamp(parseFloat(ts)) : "—"}
                        </p>
                        {timestamps.length > 1 && (
                          <button
                            onClick={() => removeTimestamp(idx)}
                            className="absolute top-2 right-2 w-5 h-5 bg-red-100 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="text-xs font-bold">×</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Extract Button */}
                {!loading && !serverDone && (
                  <button
                    onClick={handleExtract}
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 text-lg"
                  >
                    {mode === "client" ? <Image className="w-6 h-6" /> : <Server className="w-6 h-6" />}
                    Extract {timestamps.length} Frame{timestamps.length !== 1 ? "s" : ""}
                  </button>
                )}

                {/* Server Progress */}
                {loading && mode === "server" && (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="w-10 h-10 text-fuchsia-600 animate-spin mb-4" />
                    <p className="font-bold text-slate-700 mb-4">FFmpeg extracting frames on server…</p>
                    <div className="w-full max-w-md h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-sm font-bold text-fuchsia-600 mt-2">{progress}%</p>
                  </div>
                )}

                {loading && mode === "client" && (
                  <div className="flex items-center justify-center gap-3 py-8 text-fuchsia-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <p className="font-bold">Capturing frames in browser…</p>
                  </div>
                )}

                {serverError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mt-4">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-700">{serverError}</p>
                  </div>
                )}

                {serverDone && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col items-center mt-4">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mb-3" />
                    <p className="font-bold text-green-800 text-lg">ZIP downloaded successfully!</p>
                    <button onClick={handleReset} className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl text-sm">Extract More</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Extracted Frames Grid (client-side) */}
        {frames.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{frames.length} Extracted Frame{frames.length !== 1 ? "s" : ""}</h2>
              {frames.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold py-2 px-6 rounded-xl flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download All
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {frames.map((frame, idx) => (
                <div key={idx} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative bg-slate-900 aspect-video overflow-hidden">
                    <img src={frame.dataUrl} alt={`Frame at ${frame.ts}s`} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => downloadFrame(frame)}
                        className="bg-white text-slate-800 font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transform scale-90 group-hover:scale-100 transition-transform"
                      >
                        <Download className="w-4 h-4" /> Save
                      </button>
                    </div>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Timestamp</p>
                    <p className="font-bold text-slate-800">{formatTimestamp(frame.ts)} <span className="text-slate-400 font-normal text-xs">({frame.ts}s)</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4 text-fuchsia-600"><Zap className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">Browser Canvas Extraction</h3>
            <p className="text-slate-600 text-sm leading-relaxed">For videos under 50MB, the browser's native video player seeks to each timestamp and a hidden canvas captures the exact pixel data — no upload, no server, instant results.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4 text-pink-600"><Server className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">FFmpeg Server Processing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Large files are sent to our backend where a professional frame-extraction engine decodes the video at the exact timestamp with full codec support and high accuracy.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600"><Film className="w-6 h-6" /></div>
            <h3 className="text-lg font-bold mb-2">All Major Formats</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Supports MP4, WebM, MOV, AVI, MKV, MPEG, and more. Output frames as lossless PNG or compressed JPG. Server-side exports bundle all frames into a single ZIP file.</p>
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
                  {faqOpen === i ? <ChevronUp className="w-5 h-5 text-fuchsia-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
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
