'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Music, UploadCloud, Settings, Download, RefreshCw, AudioLines, Volume2, CheckCircle, AlertCircle, Server, Monitor, Clock, Layers, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import WaveSurfer from 'wavesurfer.js';
import { API_V1 } from "@/lib/api-config";

// ─── Constants ───────────────────────────────────────────────────────────────
const SERVER_THRESHOLD_MB = 20;   // Files > 20 MB go to server
const POLL_INTERVAL = 2000;

// ─── Utilities ───────────────────────────────────────────────────────────────
function fmtMB(bytes) { return (bytes / (1024 * 1024)).toFixed(2) + ' MB'; }
function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function interleave(inputL, inputR) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  let index = 0, inputIndex = 0;
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function encodeWAV(samples, sampleRate, numChannels) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  floatTo16BitPCM(view, 44, samples);
  return buffer;
}

// ─── Browser-side WAV Encoding ───────────────────────────────────────────
async function convertBrowserWav(file, targetSampleRate, numChannels, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: targetSampleRate });
        onProgress(20);
        const audioBuffer = await audioContext.decodeAudioData(e.target.result);
        onProgress(50);
        
        let samples;
        if (numChannels === 2 && audioBuffer.numberOfChannels === 2) {
          const left = audioBuffer.getChannelData(0);
          const right = audioBuffer.getChannelData(1);
          samples = interleave(left, right);
        } else {
          // Monomix or requested mono
          const channel = audioBuffer.getChannelData(0);
          if (numChannels === 2 && audioBuffer.numberOfChannels === 1) {
            samples = interleave(channel, channel); // duplicate for stereo
          } else {
            samples = channel; // mono
          }
        }
        
        onProgress(80);
        const wavBuffer = encodeWAV(samples, targetSampleRate, numChannels);
        const blob = new Blob([new DataView(wavBuffer)], { type: 'audio/wav' });
        onProgress(100);
        resolve(blob);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Server-side Polling ──────────────────────────────────────────────────
async function pollJob(jobId, onProgress, signal) {
  while (true) {
    if (signal?.aborted) throw new Error('Cancelled');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_BASE}/audio/status/${jobId}`, { signal });
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0);
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Server processing failed');
  }
}

// ─── Main Component ───────────────────────────────────────────────────────
export default function AudioConverterClient() {
  const [file, setFile]                 = useState(null);
  const [audioUrl, setAudioUrl]         = useState('');
  const [outUrl, setOutUrl]             = useState('');
  const [outBlob, setOutBlob]           = useState(null);
  const [audioMeta, setAudioMeta]       = useState({ duration: 0 });
  const [mode, setMode]                 = useState('auto'); // 'auto' | 'browser' | 'server'

  // Audio settings
  const [cfgFormat, setCfgFormat]       = useState('mp3');
  const [cfgBitrate, setCfgBitrate]     = useState(192);
  const [cfgChannels, setCfgChannels]   = useState(2);
  const [cfgSampleRate, setCfgSampleRate]= useState(44100);

  // State
  const [converting, setConverting]     = useState(false);
  const [progress, setProgress]         = useState(0);
  const [phase, setPhase]               = useState('');
  const [serverJobId, setServerJobId]   = useState(null);
  const [outputSize, setOutputSize]     = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // WaveSurfer refs
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const abortRef = useRef(null);

  // ── Dropzone ────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    if (f.size > 500 * 1024 * 1024) { toast.error('Max file size is 500 MB'); return; }
    
    const url = URL.createObjectURL(f);
    setFile(f);
    setAudioUrl(url);
    setOutUrl(''); setOutBlob(null); setProgress(0); setOutputSize(null); setServerJobId(null);
    
    // Setup audio duration
    const audioObj = new Audio(url);
    audioObj.onloadedmetadata = () => {
      setAudioMeta({ duration: audioObj.duration });
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma', '.opus'] },
    maxFiles: 1,
  });

  // ── WaveSurfer Lifecycle ────────────────────────────────────────────────
  useEffect(() => {
    if (audioUrl && waveformRef.current) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
      
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#a78bfa',
        progressColor: '#7c3aed',
        cursorColor: '#8b5cf6',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        height: 80,
        normalize: true,
        url: audioUrl
      });
      
      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));
      wavesurfer.current.on('finish', () => setIsPlaying(false));
      
      return () => {
        wavesurfer.current?.destroy();
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  // ── Compute effective mode ──────────────────────────────────────────────
  const fileMB = file ? file.size / (1024 * 1024) : 0;
  
  // If browser mode is forced but target format is not WAV, it will fail unless we force server
  let effectiveMode = mode === 'auto'
    ? (fileMB > SERVER_THRESHOLD_MB ? 'server' : 'browser')
    : mode;
    
  const isBrowserIncapable = effectiveMode === 'browser' && cfgFormat !== 'wav';
  if (isBrowserIncapable) {
      effectiveMode = 'server';
  }

  // ── Convert ─────────────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (!file || converting) return;
    setConverting(true); setProgress(0); setOutUrl(''); setOutBlob(null); setOutputSize(null);

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      if (effectiveMode === 'browser') {
        setPhase('🖥️ Decoding and Encoding in browser (WAV)...');
        const blob = await convertBrowserWav(file, cfgSampleRate, cfgChannels, setProgress);
        setOutBlob(blob);
        setOutUrl(URL.createObjectURL(blob));
        setOutputSize(blob.size);
        toast.success('Audio converted locally!');
      } else {
        // ── Server path ──────────────────────────────────────────────────
        setPhase('📤 Uploading to server...');
        setProgress(5);
        const form = new FormData();
        form.append('file', file);
        form.append('output_format', cfgFormat);
        form.append('bitrate', cfgBitrate);
        form.append('channels', cfgChannels);
        form.append('sample_rate', cfgSampleRate);

        const uploadRes = await fetch(`${API_V1}/tools/audio/convert`, { method: 'POST', body: form, signal: abort.signal });
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.detail || 'Upload failed');
        }

        // ── Dual-mode: server returns audio directly (inline) OR a job_id (queued) ──
        const contentType = uploadRes.headers.get('content-type') || '';
        if (contentType.includes('audio/')) {
          // Inline mode (Redis unavailable)
          setProgress(100);
          setPhase('✅ Done!');
          const blob = await uploadRes.blob();
          setOutputSize(blob.size);
          setOutBlob(blob);
          setOutUrl(URL.createObjectURL(blob));
          toast.success('Audio ready (server inline)!');
        } else {
          // Queued mode (Redis available)
          const { job_id } = await uploadRes.json();
          setServerJobId(job_id);
          setProgress(10);
          setPhase('⚙️ Server converting (FFmpeg)...');

          const result = await pollJob(job_id, setProgress, abort.signal);
          setOutputSize(result.output_size ? Number(result.output_size) : null);

          setPhase('📥 Downloading audio...');
          const dlRes = await fetch(`${API_V1}/tools/audio/download/${job_id}`, { signal: abort.signal });
          if (!dlRes.ok) throw new Error('Download failed');
          const blob = await dlRes.blob();
          setOutBlob(blob);
          setOutUrl(URL.createObjectURL(blob));
          toast.success('Server audio ready!');

          // cleanup after 60s
          setTimeout(() => fetch(`${API_V1}/tools/audio/cleanup/${job_id}`, { method: 'DELETE' }).catch(() => {}), 60000);
        }
      }
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Cancelled') {
        toast('Cancelled', { icon: '🛑' });
      } else {
        toast.error(err.message || 'Conversion failed');
        console.error(err);
      }
    } finally {
      setConverting(false); setPhase('');
    }
  };

  const handleCancel = () => { abortRef.current?.abort(); };

  const handleDownload = () => {
    if (!outUrl) return;
    const a = document.createElement('a');
    a.href = outUrl;
    const stem = file.name.substring(0, file.name.lastIndexOf('.')) || 'audio';
    a.download = `${stem}-omniwebkit.${cfgFormat}`;
    a.click();
  };

  const clearAll = () => {
    abortRef.current?.abort();
    setFile(null); setAudioUrl(''); setOutUrl(''); setOutBlob(null);
    setProgress(0); setOutputSize(null); setServerJobId(null); setConverting(false);
    if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
    }
  };

  // ── Badge helper ────────────────────────────────────────────────────────
  const ModeBadge = ({ m }) => {
    const isServer = m === 'server';
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
        isServer ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                 : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
      }`}>
        {isServer ? <Server className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
        {isServer ? 'Server' : 'Browser'}
      </span>
    );
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-500 rounded-3xl mb-4 shadow-lg shadow-indigo-500/25">
            <AudioLines className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
            Audio Converter
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Convert between MP3, WAV, AAC, FLAC, OGG, and M4A. Small WAV conversions run instantly in your browser; large files use our powerful FFmpeg server.
          </p>

          {/* Hybrid mode chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {['auto', 'browser', 'server'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                  mode === m
                    ? 'bg-violet-600 text-white border-violet-600 shadow-md'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400'
                }`}
              >
                {m === 'auto' && <Zap className="w-3.5 h-3.5" />}
                {m === 'browser' && <Monitor className="w-3.5 h-3.5" />}
                {m === 'server' && <Server className="w-3.5 h-3.5" />}
                {m === 'auto' ? 'Auto (Hybrid)' : m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
            {file && (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                → Will use <ModeBadge m={effectiveMode} />
                {mode === 'auto' && ` (${fileMB.toFixed(1)} MB ${fileMB > SERVER_THRESHOLD_MB ? '>' : '≤'} ${SERVER_THRESHOLD_MB} MB)`}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── Left: Upload + Settings ─────────────────────────────── */}
          <div className="lg:col-span-5 space-y-5">

            {/* Dropzone / File card */}
            {!file ? (
              <div
                {...getRootProps()}
                id="audio-dropzone"
                className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
                }`}
              >
                <input {...getInputProps()} />
                <div className="p-4 bg-violet-100 dark:bg-violet-900/40 rounded-full mb-4">
                  <UploadCloud className="w-10 h-10 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isDragActive ? 'Drop it here...' : 'Click or drag audio here'}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">MP3 · WAV · FLAC · AAC · OGG · M4A</p>
                <div className="flex gap-3 mt-4">
                  <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-3 py-1 rounded-full font-medium">≤ {SERVER_THRESHOLD_MB} MB → Browser</span>
                  <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-3 py-1 rounded-full font-medium">&gt; {SERVER_THRESHOLD_MB} MB → Server</span>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{fmtMB(file.size)} · <ModeBadge m={effectiveMode} /></p>
                  </div>
                </div>
                <button onClick={clearAll} disabled={converting} className="p-2 bg-slate-100 hover:bg-red-100 dark:bg-slate-700 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-600 rounded-lg transition-colors flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Settings panel */}
            <div className={`transition-opacity duration-300 ${!file ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-5">

                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-4 h-4 text-violet-500" /> Output Settings
                </h3>

                {/* Format selection */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Format</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => setCfgFormat(fmt)}
                        className={`py-2 px-3 rounded-lg text-sm font-bold transition-colors ${
                          cfgFormat === fmt 
                            ? 'bg-violet-100 text-violet-700 border-2 border-violet-500 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-400' 
                            : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                        }`}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {isBrowserIncapable && (
                    <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl p-3 border border-amber-200 dark:border-amber-800/50">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>Browser native conversion only supports WAV. Your conversion will automatically be routed to our secure server.</span>
                    </div>
                )}

                {/* Advanced toggle */}
                <button
                  onClick={() => setShowAdvanced(v => !v)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium"
                >
                  {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showAdvanced ? 'Hide' : 'Show'} advanced options
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-1 border-t border-slate-100 dark:border-slate-700/60 animate-in slide-in-from-top-2">
                    {/* Bitrate (N/A for wav/flac) */}
                    <div className={['wav', 'flac'].includes(cfgFormat) ? 'opacity-50 pointer-events-none' : ''}>
                      <Slider label="Bitrate (kbps)" value={cfgBitrate} min={64} max={320} step={32}
                        display={`${cfgBitrate} kbps`} onChange={setCfgBitrate} />
                    </div>
                    
                    {/* Channels */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Channels</label>
                      <div className="flex gap-2">
                        {[1, 2].map(c => (
                          <button
                            key={c}
                            onClick={() => setCfgChannels(c)}
                            className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                              cfgChannels === c
                                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                            }`}
                          >
                            {c === 1 ? 'Mono' : 'Stereo'}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Sample Rate */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-2">Sample Rate (Hz)</label>
                      <select 
                        value={cfgSampleRate} 
                        onChange={(e) => setCfgSampleRate(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block p-2.5 dark:bg-slate-700 dark:border-slate-600 dark:placeholder-slate-400 dark:text-white dark:focus:ring-violet-500 dark:focus:border-violet-500"
                      >
                        <option value={22050}>22050 Hz</option>
                        <option value={44100}>44100 Hz (CD)</option>
                        <option value={48000}>48000 Hz (DVD)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Convert button */}
                {!converting ? (
                  <button
                    id="audio-convert-btn"
                    onClick={handleConvert}
                    disabled={!file}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Music className="w-5 h-5" />
                    Convert to {cfgFormat.toUpperCase()}
                    {file && <span className="text-xs opacity-70 ml-1">({effectiveMode === 'server' ? 'server' : 'browser'})</span>}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{phase || 'Processing...'} {progress}%</span>
                      <button onClick={handleCancel} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Previews ──────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-5">

            {/* Audio waveform preview */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 min-h-[260px] flex flex-col justify-center relative overflow-hidden">
              {!audioUrl ? (
                <div className="text-slate-400 flex flex-col items-center opacity-50 my-auto">
                  <Volume2 className="w-12 h-12 mb-2" />
                  <p className="text-sm font-medium">Waveform Preview</p>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <AudioLines className="w-4 h-4 text-violet-500" /> Source Audio
                    </h3>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      {Math.round(audioMeta.duration)}s
                    </span>
                  </div>
                  
                  {/* WaveSurfer Container */}
                  <div ref={waveformRef} className="w-full bg-slate-50 dark:bg-slate-900 rounded-xl p-2 mb-4 border border-slate-100 dark:border-slate-800"></div>
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={togglePlay}
                      className="bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/50 dark:text-violet-300 dark:hover:bg-violet-800/50 px-6 py-2 rounded-full font-bold text-sm transition-colors"
                    >
                      {isPlaying ? 'Pause' : 'Play'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Audio output */}
            {outUrl && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-400/40 overflow-hidden shadow-xl shadow-emerald-500/10 animate-in fade-in zoom-in duration-500">
                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-4 py-3 font-bold uppercase tracking-wider flex items-center justify-between border-b border-emerald-500/20">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Audio Ready</span>
                  <span className="flex items-center gap-2 text-slate-400 font-normal normal-case">
                    <Clock className="w-3.5 h-3.5" /> {Math.round(audioMeta.duration)}s · {cfgFormat.toUpperCase()}
                    {outputSize && <> · {fmtSize(outputSize)}</>}
                  </span>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/60 flex flex-col items-center justify-center min-h-[140px]">
                  <audio controls src={outUrl} className="w-full max-w-md accent-emerald-500" />
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                  <button
                    id="audio-download-btn"
                    onClick={handleDownload}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" /> Download {cfgFormat.toUpperCase()}
                  </button>
                </div>
              </div>
            )}

            {/* Hint when audio loaded but no output yet */}
            {audioUrl && !outUrl && !converting && (
              <div className="flex items-start gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-2xl border border-indigo-200 dark:border-indigo-800/50 text-sm">
                <Layers className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Tip:</strong> Convert directly to WAV locally in your browser for absolute privacy and speed. Other formats use our FFmpeg-powered secure server pipeline.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable slider ─────────────────────────────────────────────────────────
function Slider({ label, value, min, max, step, display, onChange }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</label>
        <span className="text-sm font-bold text-violet-600 dark:text-violet-400">{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
      />
    </div>
  );
}
