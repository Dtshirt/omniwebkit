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
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Word Counter — Count Words, Characters & More Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Whether you are writing a school essay, crafting a blog post, preparing a resume, or editing a research paper, knowing your word count matters. Publishers, platforms, and professors all set word limits. Staying within them is not just a rule — it is a sign of discipline and clear communication.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free online word counter does far more than count words. It shows you characters with and without spaces, sentences, paragraphs, lines, unique words, average words per sentence, average characters per word, estimated reading and speaking time, a Flesch-Kincaid readability grade, and a keyword density table — all updated live as you type.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You can type directly into the editor, paste copied text, or upload a plain text or Markdown file. The tool processes everything locally in your browser. Nothing is sent to any server. Your text stays private.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              When you are done, you can copy the full statistics report to your clipboard or download it as a text file. This makes it easy to include word count data in submissions, reports, or project documentation.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How to Use the Word Counter</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">It takes seconds. No account, no login, no file size limits beyond browser memory.</p>
            <ol className="space-y-4">
              {[
                ['Type or Paste Text', 'Click inside the text area and type your content, or paste it from any source — a Word document, Google Doc, email draft, or web page.'],
                ['Upload a Text File', 'Click the Upload button to load a .txt or .md file directly. The tool reads the file in your browser and displays statistics immediately.'],
                ['Review Your Statistics', 'Watch the counters update in real time. The quick stats bar shows words, characters, sentences, and paragraphs at a glance. The sidebar shows every metric in detail.'],
                ['Check Keyword Density', 'Scroll down to the Keyword Density table to see which words appear most often. This is useful for SEO content, academic plagiarism checks, and repetitive word detection.'],
                ['Copy or Download', 'Click the copy icon to copy the full statistics report to your clipboard. Click the download icon to save it as a .txt file.'],
                ['Clear and Start Over', 'Click the red Clear button to erase all text and reset all counters.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {t:'Live Real-Time Counting',        c:'text-blue-600 dark:text-blue-400',     b:'Every metric updates instantly as you type. No button to press, no delay. Counts words, characters, sentences, paragraphs, lines, and unique words simultaneously.'},
                {t:'Flesch-Kincaid Readability',     c:'text-violet-600 dark:text-violet-400', b:'Calculates your text\'s grade level using the Flesch-Kincaid formula. Aim for grade 6–8 for general web content. Higher grades indicate more complex, academic writing.'},
                {t:'Reading & Speaking Time',        c:'text-emerald-600 dark:text-emerald-400',b:'Estimates how long it takes to read (238 wpm) or speak (130 wpm) your content. Useful for presentations, podcast scripts, and webinar preparation.'},
                {t:'Keyword Density Table',          c:'text-amber-600 dark:text-amber-400',   b:'Shows the top 10 most-used keywords with count and percentage. Stop words are filtered out. Essential for SEO writers and editors catching overused terms.'},
                {t:'File Upload (.txt / .md)',        c:'text-rose-600 dark:text-rose-400',     b:'Upload plain text or Markdown files. The tool reads them locally — your file never leaves your device. Great for analyzing documents without copy-pasting.'},
                {t:'Copy & Download Report',         c:'text-indigo-600 dark:text-indigo-400', b:'Export your full statistics as a formatted report. Copy to clipboard for quick sharing or download as a .txt file for your records.'},
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Why Word Count Matters</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Word count is not just a number. It shapes how readers perceive your writing, how search engines rank your page, and whether your content meets a requirement. Here is why it matters in different contexts.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mt-2">
              {[
                ['Academic Writing',  'Universities set word limits for essays, dissertations, and reports. Submitting outside those limits can result in penalties or rejection. Tracking word count in real time helps you hit the target precisely.'],
                ['SEO & Blog Posts',  'Search engines tend to favor long-form content between 1,500 and 2,500 words for competitive topics. Knowing your count keeps you on track without overwriting.'],
                ['Social Media',      'Twitter, LinkedIn, and Instagram all have character or word limits. Knowing how close you are before you post saves frustration.'],
                ['Resume & Cover Letters', 'One-page resumes typically allow 400–600 words. Cover letters work best at 200–400 words. Too many words signals poor editing skills to employers.'],
                ['Scripts & Speeches', 'A typical speaker delivers 130 words per minute. A 10-minute speech needs 1,300 words. The speaking time estimate in this tool handles that math for you.'],
                ['Content Marketing', 'Article length affects bounce rate, time on page, and social shares. Monitoring character count per word and paragraph length helps improve readability metrics.'],
              ].map(([title, body]) => (
                <div key={title} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding the Flesch-Kincaid Readability Score</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The Flesch-Kincaid Grade Level is a readability formula developed in the 1970s and still used widely today. It measures how many years of formal education a reader needs to comfortably understand a piece of text. A grade of 8 means an average 8th-grade student can read it. A grade of 12 means the text is at a high school senior level.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The formula considers two things: average sentence length (longer sentences are harder to read) and average syllable count per word (longer words are harder to read). Short sentences with short words produce a low grade level (easy). Long sentences with complex vocabulary produce a high grade level (difficult).
            </p>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                {grade:'1–6', label:'Easy',     desc:'Children\'s books, casual blogs', color:'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'},
                {grade:'7–10',label:'Moderate', desc:'News articles, general web content', color:'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'},
                {grade:'11+', label:'Complex',  desc:'Academic papers, legal documents', color:'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'},
              ].map(({ grade, label, desc, color }) => (
                <div key={grade} className={`p-3 rounded-xl border text-center ${color}`}>
                  <div className="text-xl font-black">{grade}</div>
                  <div className="text-xs font-bold mt-0.5">{label}</div>
                  <div className="text-[10px] mt-1 opacity-80">{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {q:'Is this word counter free?',                     a:'Yes, completely free with no account, no signup, and no usage limits.'},
                {q:'Does it upload my text to a server?',            a:'No. All processing happens locally in your browser. Your text never leaves your device.'},
                {q:'Can I upload a Word document?',                  a:'The tool supports .txt and .md files. For Word documents, copy and paste the text from Word into the editor.'},
                {q:'What is the maximum text length?',               a:'There is no hard limit. The tool can handle long documents, though very large texts (1 million+ characters) may slow down older devices.'},
                {q:'How is reading time calculated?',                a:'Reading time uses 238 words per minute, which is the average adult reading speed for digital content. Speaking time uses 130 words per minute.'},
                {q:'What does Flesch-Kincaid grade mean?',           a:'It indicates the US school grade level needed to understand your text. A grade of 8 equals 8th grade (age 13-14). Lower grades are easier to read.'},
                {q:'Are stop words excluded from keyword density?',   a:'Yes. Common stop words like "the", "a", "and", "in" are filtered out. Only meaningful words with 4+ characters are included.'},
                {q:'Does it count characters with or without spaces?',a:'Both. By default, the main character counter excludes spaces. Toggle "Include spaces" to count spaces. The sidebar always shows both counts.'},
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
