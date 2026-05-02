'use client';
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Mic, MicOff, Volume2, Download, Copy, Check, Languages, Gauge, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

function useToast() {
  const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
  const el = msg ? (<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}</div>) : null;
  return { show, el };
}

const RECOG_LANGS = [
  { c: 'en-US', n: 'English (US)' }, { c: 'en-GB', n: 'English (UK)' }, { c: 'es-ES', n: 'Spanish (Spain)' },
  { c: 'es-MX', n: 'Spanish (Mexico)' }, { c: 'fr-FR', n: 'French' }, { c: 'de-DE', n: 'German' },
  { c: 'it-IT', n: 'Italian' }, { c: 'pt-BR', n: 'Portuguese (Brazil)' }, { c: 'ja-JP', n: 'Japanese' },
  { c: 'zh-CN', n: 'Chinese (Simplified)' }, { c: 'ko-KR', n: 'Korean' }, { c: 'ru-RU', n: 'Russian' },
  { c: 'ar-SA', n: 'Arabic' }, { c: 'hi-IN', n: 'Hindi' },
];

export default function TextSpeechConverter() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selVoice, setSelVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [vol, setVol] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [recog, setRecog] = useState(null);
  const [recogLang, setRecogLang] = useState('en-US');
  const [tab, setTab] = useState('tts');
  const uttRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    const load = () => { const v = window.speechSynthesis.getVoices(); setVoices(v); if (v.length && !selVoice) setSelVoice(v[0]); };
    load(); window.speechSynthesis.onvoiceschanged = load;
    return () => window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = recogLang; r.maxAlternatives = 1;
    r.onresult = (e) => { let it = '', ft = ''; for (let i = e.resultIndex; i < e.results.length; i++) { const t = e.results[i][0].transcript; if (e.results[i].isFinal) ft += t + ' '; else it += t; } if (ft) setTranscript(p => p + ft); setInterim(it); };
    r.onerror = (e) => { if (e.error === 'not-allowed') toast.show('Microphone access denied', 'err'); else if (e.error !== 'aborted') toast.show('Recognition error', 'err'); setListening(false); };
    r.onend = () => setListening(false);
    setRecog(r);
    return () => { try { r.stop(); } catch { } };
  }, [recogLang]);

  const speak = () => {
    if (!text.trim()) { toast.show('Enter text first', 'err'); return; }
    if (paused) { window.speechSynthesis.resume(); setPaused(false); setPlaying(true); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.voice = selVoice; u.rate = rate; u.pitch = pitch; u.volume = vol;
    u.onstart = () => { setPlaying(true); setPaused(false); }; u.onend = () => { setPlaying(false); setPaused(false); }; u.onerror = () => { setPlaying(false); setPaused(false); };
    uttRef.current = u; window.speechSynthesis.speak(u);
  };
  const pause = () => { window.speechSynthesis.pause(); setPaused(true); setPlaying(false); };
  const stop = () => { window.speechSynthesis.cancel(); setPlaying(false); setPaused(false); };

  const startListen = async () => {
    if (!recog) { toast.show('Not supported in this browser', 'err'); return; }
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true }); setTranscript(''); setInterim(''); recog.lang = recogLang;
      try { recog.start(); setListening(true); } catch (e) { if (e.name === 'InvalidStateError') { recog.stop(); setTimeout(() => { recog.start(); setListening(true); }, 100); } else toast.show('Failed to start', 'err'); }
    } catch { toast.show('Microphone access required', 'err'); }
  };
  const stopListen = () => { if (recog) { setListening(false); recog.stop(); } };
  const copyTx = () => { navigator.clipboard.writeText(transcript); toast.show('Copied!'); };
  const dlTx = () => { Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([transcript], { type: 'text/plain' })), download: 'transcript.txt' }).click(); toast.show('Downloaded'); };
  const loadSample = () => setText('Hello! This is a sample text to speech demonstration. You can adjust the voice, speed, pitch, and volume to customise how this text sounds.');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Text to Speech Converter', href: '/tools/text-to-speech-converter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <Volume2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Text \u21C4 Speech Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Convert text to speech and speech to text using browser APIs</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 max-w-md mx-auto">
          {[{ k: 'tts', i: Volume2, l: 'Text to Speech', c: 'bg-indigo-600' }, { k: 'stt', i: Mic, l: 'Speech to Text', c: 'bg-purple-600' }].map(({ k, i: I, l, c }) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 ${tab === k ? `${c} text-white shadow-sm` : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}>
              <I className="w-4 h-4" />{l}
            </button>
          ))}
        </div>

        {/* ═══ TTS ═══ */}
        {tab === 'tts' && (
          <div className="grid lg:grid-cols-3 gap-4">
            <div className={`lg:col-span-2 ${cardCls} p-5`}>
              <div className="flex justify-between items-center mb-3">
                <label className={labelCls}>Text Input</label>
                <button onClick={loadSample} className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition">Load Sample</button>
              </div>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Enter text to convert to speech..."
                className="w-full h-64 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-indigo-500/40 transition mb-4" spellCheck={false} />
              <div className="flex flex-wrap gap-2">
                <button onClick={speak} disabled={!text.trim() || (playing && !paused)}
                  className="flex-1 min-w-[100px] px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4" />{paused ? 'Resume' : 'Speak'}
                </button>
                {playing && (
                  <button onClick={pause} className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm transition flex items-center gap-2">
                    <Pause className="w-4 h-4" />Pause
                  </button>
                )}
                {(playing || paused) && (
                  <button onClick={stop} className="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm transition flex items-center gap-2">
                    <Square className="w-4 h-4" />Stop
                  </button>
                )}
              </div>
            </div>

            {/* Settings */}
            <div className={`${cardCls} p-5`}>
              <label className={labelCls}>Settings</label>
              <div className="space-y-4 mt-2">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 mb-1"><Languages className="w-3 h-3" />Voice</label>
                  <select value={selVoice?.name || ''} onChange={e => setSelVoice(voices.find(v => v.name === e.target.value))} className={inputCls}>
                    {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                  </select>
                </div>
                {[
                  { l: 'Speed', v: rate, s: setRate, min: 0.5, max: 2, step: 0.1, lo: '0.5x', hi: '2x', fmt: `${rate.toFixed(1)}x`, icon: Gauge },
                  { l: 'Pitch', v: pitch, s: setPitch, min: 0, max: 2, step: 0.1, lo: 'Low', hi: 'High', fmt: pitch.toFixed(1) },
                  { l: 'Volume', v: vol, s: setVol, min: 0, max: 1, step: 0.1, lo: '0%', hi: '100%', fmt: `${Math.round(vol * 100)}%`, icon: Volume2 },
                ].map(({ l, v, s, min, max, step, lo, hi, fmt, icon: I }) => (
                  <div key={l}>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">{I && <I className="w-3 h-3" />}{l}: {fmt}</label>
                    <input type="range" min={min} max={max} step={step} value={v} onChange={e => s(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5"><span>{lo}</span><span>{hi}</span></div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-xl">
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Voices:</strong> {voices.length} available</p>
                <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">Using browser\u2019s native speech synthesis</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ STT ═══ */}
        {tab === 'stt' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className={`${cardCls} p-5`}>
              <label className={labelCls}>Voice Recognition</label>

              {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl mb-4">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">Speech recognition is not supported in this browser. Use Chrome, Edge, or Safari.</p>
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 block">Recognition Language</label>
                <select value={recogLang} onChange={e => setRecogLang(e.target.value)} disabled={listening} className={inputCls}>
                  {RECOG_LANGS.map(l => <option key={l.c} value={l.c}>{l.n}</option>)}
                </select>
              </div>

              <div className="flex justify-center mb-4">
                <button onClick={listening ? stopListen : startListen} disabled={!recog}
                  className={`px-6 py-3 rounded-full font-bold text-sm transition flex items-center gap-2 ${listening ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25'
                    } disabled:opacity-50`}>
                  {listening ? <><MicOff className="w-5 h-5" />Stop Listening</> : <><Mic className="w-5 h-5" />Start Listening</>}
                </button>
              </div>

              {listening && (
                <div className="p-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-purple-600 dark:text-purple-400">Listening...</p>
                  </div>
                  {interim && <p className="text-slate-500 dark:text-slate-400 italic text-xs">{interim}</p>}
                </div>
              )}
            </div>

            <div className={`${cardCls} p-5`}>
              <div className="flex justify-between items-center mb-3">
                <label className={labelCls}>Transcript</label>
                {transcript && (
                  <div className="flex gap-1">
                    <button onClick={copyTx} className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition"><Copy className="w-3 h-3" />Copy</button>
                    <button onClick={dlTx} className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition"><Download className="w-3 h-3" />Download</button>
                  </div>
                )}
              </div>
              <div className="min-h-[200px] p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                {transcript
                  ? <p className="text-sm text-slate-900 dark:text-white whitespace-pre-wrap">{transcript}</p>
                  : <p className="text-sm text-slate-400 italic">Your transcribed speech will appear here...</p>
                }
              </div>
            </div>
          </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Text to Speech & Speech to Text Converter</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Text to speech (TTS) and speech to text (STT) are two sides of the same coin. TTS converts written text into spoken audio. STT converts spoken words into written text. Together, they make content more accessible, improve productivity, and unlock hands-free workflows. This tool provides both in a single interface.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The Text to Speech tab lets you type or paste any text and hear it spoken aloud using your browser\u2019s built-in speech synthesis engine. Choose from all available voices on your device, adjust the speed from 0.5x to 2x, change the pitch, and control the volume. Play, pause, and stop at any time. A sample text button lets you test settings quickly.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The Speech to Text tab uses your microphone to transcribe spoken words in real time. Select from 14 languages, click Start Listening, and speak. The tool shows interim results as you talk and builds a final transcript that you can copy to your clipboard or download as a text file. Everything runs through your browser\u2019s native APIs. No data is sent to any external server.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Multiple Voices', c: 'text-indigo-600 dark:text-indigo-400', b: 'Access all voices installed on your device. Chrome typically offers 20+ voices across many languages and accents.' },
                { t: 'Speed, Pitch & Volume', c: 'text-purple-600 dark:text-purple-400', b: 'Fine-tune how text sounds with three sliders. Speed ranges from 0.5x to 2x. Pitch and volume are fully adjustable.' },
                { t: 'Play / Pause / Stop', c: 'text-blue-600 dark:text-blue-400', b: 'Full playback controls. Pause mid-sentence and resume where you left off. Stop cancels playback entirely.' },
                { t: 'Real-Time Transcription', c: 'text-emerald-600 dark:text-emerald-400', b: 'Speech to text shows interim results as you speak and builds a final transcript. Continuous recognition captures long dictation.' },
                { t: '14 Languages', c: 'text-amber-600 dark:text-amber-400', b: 'Speech recognition supports English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Korean, Russian, Arabic, and Hindi.' },
                { t: 'Copy & Download', c: 'text-rose-600 dark:text-rose-400', b: 'Copy your transcript to the clipboard or download it as a plain text file. One click, no formatting needed.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this tool free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
                { q: 'Which browsers are supported?', a: 'Text to speech works in all modern browsers. Speech to text requires Chrome, Edge, or Safari.' },
                { q: 'Can I download the generated audio?', a: 'Browser speech synthesis does not provide a downloadable audio file. You can use screen recording software to capture the audio.' },
                { q: 'How many voices are available?', a: 'It depends on your operating system and browser. Chrome typically has 20+ voices. macOS and Windows may offer more.' },
                { q: 'Does speech to text work offline?', a: 'In Chrome, speech recognition requires an internet connection. Some browsers may support offline recognition.' },
                { q: 'What languages does speech recognition support?', a: '14 languages including English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Korean, Russian, Arabic, and Hindi.' },
                { q: 'Does it send data to a server?', a: 'Text to speech runs entirely locally. Speech recognition in Chrome routes audio through Google\u2019s servers for processing.' },
                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive. Both TTS and STT work on mobile browsers that support the Web Speech API.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span>
                    <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}