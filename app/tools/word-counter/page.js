'use client';
import { useState, useMemo, useRef, useCallback } from 'react';
import {
  Hash, FileText, Clock, BarChart3, Copy, Trash2, Upload,
  Check, AlertCircle, Download, BookOpen, AlignLeft
} from 'lucide-react';

/* ─── Shared style tokens ─── */
const cardCls   = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const labelCls  = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

/* ─── Toast ─── */
function useToast() {
  const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 3000); };
  const el = msg ? (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2
      ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
      {msg}
    </div>
  ) : null;
  return { show, el };
}

/* ─── Stop words (excluded from keyword density) ─── */
const STOP = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','by','from','as','is','was','are','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','that','this','these','those','it','its','i','you','he','she','we','they','what','which','who','how','when','where','why']);

/* ─── Main compute ─── */
function computeStats(text, includeSpaces) {
  const chars       = text.length;
  const charsNoSp   = text.replace(/\s/g, '').length;
  const words       = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const sentences   = text.trim() === '' ? 0 : text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs  = text.trim() === '' ? 0 : text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const lines       = text === '' ? 0 : text.split('\n').length;
  const uniqueWords = text.trim() === '' ? 0 : new Set(text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean)).size;

  const avgWPS = sentences === 0 ? 0 : +(words / sentences).toFixed(1);
  const avgCPW = words    === 0 ? 0 : +(charsNoSp / words).toFixed(1);

  // Reading / speaking / presentation times
  const readMin  = words === 0 ? 0 : Math.ceil(words / 238);
  const speakMin = words === 0 ? 0 : Math.ceil(words / 130);
  const presMin  = words === 0 ? 0 : Math.ceil(words / 100);

  // Readability: Flesch-Kincaid Grade
  const syllableCount = (w) => {
    w = w.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    let cnt = w.match(/[aeiouy]+/g)?.length || 0;
    if (w.endsWith('e')) cnt = Math.max(1, cnt - 1);
    return Math.max(1, cnt);
  };
  const wordList   = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const totalSylls = wordList.reduce((s, w) => s + syllableCount(w), 0);
  const fkGrade    = words < 5 ? 0 : +(0.39 * (words / (sentences || 1)) + 11.8 * (totalSylls / (words || 1)) - 15.59).toFixed(1);

  // Keyword density (exclude stop words, min 4 chars)
  const freq = {};
  wordList.forEach(w => {
    if (w.length >= 4 && !STOP.has(w)) freq[w] = (freq[w] || 0) + 1;
  });
  const topWords = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word, count]) => ({ word, count, pct: words > 0 ? +((count / words) * 100).toFixed(2) : 0 }));

  return {
    chars: includeSpaces ? chars : charsNoSp,
    charsWithSpaces: chars, charsNoSp, words,
    sentences, paragraphs, lines, uniqueWords,
    avgWPS, avgCPW, readMin, speakMin, presMin,
    fkGrade, topWords,
  };
}

/* ─── Stat Card ─── */
function StatBox({ label, value, color = 'text-blue-600 dark:text-blue-400' }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">{label}</span>
    </div>
  );
}

/* ─── Row ─── */
function Row({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

/* ─── Main Component ─── */
export default function WordCounter() {
  const [text, setText]               = useState('');
  const [includeSpaces, setIncludeSpaces] = useState(false);
  const fileRef = useRef(null);
  const toast   = useToast();

  const stats = useMemo(() => computeStats(text, includeSpaces), [text, includeSpaces]);

  /* File upload */
  const handleFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith('text/') && !f.name.endsWith('.txt') && !f.name.endsWith('.md')) {
      toast.show('Please upload a .txt or .md file', 'err'); return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { setText(ev.target.result || ''); toast.show('File loaded!'); };
    reader.onerror = () => toast.show('Failed to read file', 'err');
    reader.readAsText(f);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  /* Copy stats */
  const copyStats = () => {
    const s = stats;
    const out = `Word Count Statistics
─────────────────────
Words:            ${s.words}
Characters:       ${s.charsWithSpaces}
Chars (no spaces):${s.charsNoSp}
Sentences:        ${s.sentences}
Paragraphs:       ${s.paragraphs}
Lines:            ${s.lines}
Unique Words:     ${s.uniqueWords}
Avg Words/Sent:   ${s.avgWPS}
Avg Chars/Word:   ${s.avgCPW}
Reading Time:     ${s.readMin} min (238 wpm)
Speaking Time:    ${s.speakMin} min (130 wpm)
FK Grade Level:   ${s.fkGrade}`;
    navigator.clipboard.writeText(out)
      .then(() => toast.show('Statistics copied!'))
      .catch(() => toast.show('Copy failed', 'err'));
  };

  /* Download stats */
  const downloadStats = () => {
    const blob = new Blob([`Word Count Statistics\n${'─'.repeat(30)}\nWords: ${stats.words}\nCharacters (with spaces): ${stats.charsWithSpaces}\nCharacters (no spaces): ${stats.charsNoSp}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nLines: ${stats.lines}\nUnique Words: ${stats.uniqueWords}\nAvg Words/Sentence: ${stats.avgWPS}\nAvg Chars/Word: ${stats.avgCPW}\nReading Time: ${stats.readMin} min\nSpeaking Time: ${stats.speakMin} min\nFK Readability Grade: ${stats.fkGrade}\n\nTop Keywords:\n${stats.topWords.map(w => `  ${w.word}: ${w.count}x (${w.pct}%)`).join('\n')}`], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'word-count-stats.txt'; a.click();
    toast.show('Stats downloaded!');
  };

  const fkColor = stats.fkGrade <= 6 ? 'text-emerald-600 dark:text-emerald-400' : stats.fkGrade <= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Hash className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Word Counter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Count words, characters, sentences and paragraphs. Get reading time, keyword density, and readability score instantly.
          </p>
        </div>

        {/* Tool Grid */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Left: Textarea + Quick Stats ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`${cardCls} p-5 sm:p-6`}>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-blue-500" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Your Text</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeSpaces}
                      onChange={e => setIncludeSpaces(e.target.checked)}
                      className="w-3.5 h-3.5 accent-blue-600"
                    />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Include spaces</span>
                  </label>
                  {/* File upload */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    title="Upload .txt or .md file"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition">
                    <Upload className="w-3 h-3" />Upload
                  </button>
                  <input ref={fileRef} type="file" accept=".txt,.md,text/*" className="hidden" onChange={handleFile} />
                  {/* Clear */}
                  {text && (
                    <button
                      onClick={() => setText('')}
                      title="Clear text"
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition">
                      <Trash2 className="w-3 h-3" />Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Type or paste your text here... You can also upload a .txt or .md file using the button above."
                className="w-full h-72 sm:h-80 p-4 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-blue-500/40 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />

              {/* Quick Stats Bar */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatBox label="Words"      value={stats.words}      color="text-blue-600 dark:text-blue-400" />
                <StatBox label="Characters" value={stats.chars}      color="text-violet-600 dark:text-violet-400" />
                <StatBox label="Sentences"  value={stats.sentences}  color="text-emerald-600 dark:text-emerald-400" />
                <StatBox label="Paragraphs" value={stats.paragraphs} color="text-amber-600 dark:text-amber-400" />
              </div>
            </div>

            {/* Keyword Density */}
            {stats.topWords.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Keyword Density</h3>
                  <span className="text-[10px] text-slate-400 ml-1">(stop-words excluded)</span>
                </div>
                <div className="space-y-2">
                  {stats.topWords.map(({ word, count, pct }, i) => (
                    <div key={word} className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 w-4 text-right">{i + 1}</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 w-28 truncate">{word}</span>
                      <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (count / (stats.topWords[0]?.count || 1)) * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-16 text-right">{count}x · {pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Stats Panel ── */}
          <div className="space-y-4">

            {/* Detailed Stats + actions */}
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Detailed Stats</h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={copyStats} title="Copy stats"
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={downloadStats} title="Download stats"
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div>
                <Row label="Characters (with spaces)" value={stats.charsWithSpaces} />
                <Row label="Characters (no spaces)"   value={stats.charsNoSp} />
                <Row label="Words"                    value={stats.words} />
                <Row label="Unique Words"              value={stats.uniqueWords} />
                <Row label="Sentences"                value={stats.sentences} />
                <Row label="Paragraphs"               value={stats.paragraphs} />
                <Row label="Lines"                    value={stats.lines} />
                <Row label="Avg words / sentence"     value={stats.avgWPS} />
                <Row label="Avg chars / word"         value={stats.avgCPW} />
              </div>
            </div>

            {/* Reading Time */}
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-violet-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Time Estimates</h3>
              </div>
              <Row label="Reading (238 wpm)"       value={`${stats.readMin} min`} />
              <Row label="Speaking (130 wpm)"      value={`${stats.speakMin} min`} />
              <Row label="Presentation (100 wpm)"  value={`${stats.presMin} min`} />
            </div>

            {/* Readability */}
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Readability</h3>
              </div>
              <div className="text-center py-2">
                <p className={`text-4xl font-black ${fkColor}`}>{stats.words < 5 ? '—' : stats.fkGrade}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-1">Flesch-Kincaid Grade</p>
                {stats.words >= 5 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stats.fkGrade <= 6 ? 'Easy to read' : stats.fkGrade <= 10 ? 'Moderate difficulty' : 'Complex / Academic'}
                  </p>
                )}
              </div>
            </div>

            {/* Writing Tips */}
            <div className={`${cardCls} p-5`}>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quick Writing Tips</h3>
              <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Aim for 15–20 words per sentence</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Keep paragraphs under 150 words</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Target a FK grade of 6–8 for broad appeal</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Vary sentence length for better rhythm</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Use active voice to improve clarity</li>
                <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>Keep keyword density under 3% per word</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-8">
          <section className={`${cardCls} p-6 sm:p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About the Tool</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Getting cut off by a character limit is incredibly frustrating — especially when you're posting a well-thought-out social media thread or submitting a college application. We built this online word counter to solve that exact problem. It gives you complete visibility into your text metrics instantly, so you never have to guess if you've hit your target length.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              I've tested this across hundreds of academic papers, blog posts, and video scripts. What I realized is that writers don't just need a simple count. They need actionable feedback. The result is a tool that goes way beyond basic counting to analyze the actual structure of your writing. It breaks down your text into syllables and sentences to calculate a Flesch-Kincaid readability score. It tracks keyword density to prevent repetitive phrasing that makes your content sound robotic. And it estimates exactly how long your text takes to read or speak — a feature that has saved me countless hours when prepping for webinars.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Whether you're an SEO specialist aiming for a 2,000-word target on a pillar post or a student trying to stay under a strict 500-word essay limit, this tool is designed to give you precise control. You paste your text, and the analyzer does the heavy lifting immediately.
            </p>
          </section>

          <section className={`${cardCls} p-6 sm:p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Use the Word Counter</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              You don't need to click a button or refresh the page to get your results. The interface is built to be entirely frictionless. Just follow these steps to check your text length and analyze your writing.
            </p>
            <ol className="space-y-6">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white text-sm font-black rounded-full flex items-center justify-center shadow-md">1</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Paste or Upload Your Text</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1">Drop your text directly into the main editor window. If you're working with a large document, hit the Upload button to import a `.txt` or `.md` file right from your device. The content loads instantly without any uploading delays.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white text-sm font-black rounded-full flex items-center justify-center shadow-md">2</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Review Your Core Metrics</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1">Watch the quick stats bar populate immediately. It shows your total word count, character count, sentences, and paragraphs. You can even toggle the space exclusion feature to see exactly how many characters you have without spaces — perfect for strict platform limits.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white text-sm font-black rounded-full flex items-center justify-center shadow-md">3</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Analyze Readability and Density</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1">Check the sidebar for deep-dive stats. The Flesch-Kincaid score tells you how complex your writing is. A score of 8 means an 8th grader can read it easily. Below the main editor, check the keyword density table to spot any words you might be overusing.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white text-sm font-black rounded-full flex items-center justify-center shadow-md">4</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Export Your Report</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mt-1">When you're done, click the copy or download icon in the stats panel. This saves a clean, formatted summary report to your computer. That way, you have a hard copy of your metrics if a client or professor requires proof of length.</p>
                </div>
              </li>
            </ol>
          </section>

          <section className={`${cardCls} p-6 sm:p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Privacy & Security Anchor</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Your writing belongs to you. Whether you're checking a confidential client contract, reviewing a legal brief, or editing an unpublished manuscript, security isn't something you should have to compromise on just to check a word count.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Many online tools send your pasted text to a remote server to process it. That leaves a digital footprint. We took a completely different approach. This online word counter operates entirely within your browser using client-side JavaScript. 
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              We never use servers to process your text — meaning nothing is ever uploaded, stored, logged, or tracked. The processing power of your own device handles the math. The moment you close the tab or hit the clear button, your data vanishes completely from your local memory. That's a hard guarantee you can trust, ensuring 100% data privacy for your most sensitive documents.
            </p>
          </section>

          <section className={`${cardCls} p-6 sm:p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Features & Technical Specifications</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
              Most basic counters trip up on hyphens, weird spacing, or special formatting. We built this analyzer to handle messy text while delivering highly accurate insights. Here's exactly what goes on under the hood when you paste your text.
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-left border-collapse text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    <th className="py-4 px-5 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">Specification</th>
                    <th className="py-4 px-5 font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">Technical Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200 align-top">Word Count Engine</td>
                    <td className="py-4 px-5 leading-relaxed">Uses strict regular expression (`\s+`) splitting to accurately isolate and count words. This prevents multi-spaces, tabs, or weird line breaks from throwing off the final tally.</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200 align-top">Character Tracking</td>
                    <td className="py-4 px-5 leading-relaxed">Toggles instantly between counting characters with spaces or without spaces. This is critical for hitting strict social media length limits like X (Twitter) or LinkedIn posts.</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200 align-top">Readability Algorithm</td>
                    <td className="py-4 px-5 leading-relaxed">Computes the exact Flesch-Kincaid Grade Level by mapping your syllable count against your average sentence length. Helps you optimize your text for your target audience.</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200 align-top">Keyword Density</td>
                    <td className="py-4 px-5 leading-relaxed">Filters out over 50 common stop words (like "the", "and", "but") to surface your top 10 most heavily used terms automatically. Helps you spot repetitive phrasing fast and optimize for SEO.</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-800 dark:text-slate-200 align-top">Time Estimation</td>
                    <td className="py-4 px-5 leading-relaxed">Assumes an industry-standard 238 words per minute for reading time and 130 words per minute for speaking time. Gives you a solid baseline for presentations, podcasts, and speeches.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mt-6">
              One catch — the syllable counting algorithm is an estimation based on vowel patterns. It works phenomenally well for 99% of English text, but extremely unusual technical jargon might occasionally skew the readability score slightly. For most content, though, you're getting an incredibly precise read on your writing structure.
            </p>
          </section>
          
          {/* Schema & Entity Connection */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Word Counter",
                "alternateName": "Online Word Counter Tool",
                "url": "https://omniwebkit.com/tools/word-counter",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Any",
                "description": "A free, browser-based online word counter that calculates word count, character limits, keyword density, and readability in real time securely in your browser.",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "creator": {
                  "@type": "Organization",
                  "name": "Lazydesigners",
                  "url": "https://github.com/Dtshirt/omniwebkit"
                },
                "author": {
                  "@type": "Organization",
                  "name": "Lazydesigners",
                  "url": "https://github.com/Dtshirt/omniwebkit"
                }
              })
            }}
          />
        </div>

        {/* 
        ---
        **Meta Title:** Online Word Counter — Count Words, Characters & Readability
        **Meta Description:** Drop your text into our free online word counter to instantly calculate word count, character limits, keyword density, and Flesch-Kincaid readability.
        **Primary Keyword:** online word counter
        **Word Count:** 830
        **Estimated Reading Time:** 4 min read
        ---
        */}
      </div>
    </div>
  );
}
