'use client';
import { useState, useEffect, useCallback } from 'react';
import { Search, AlertCircle, CheckCircle, Copy, Check, Replace, RotateCcw } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-rose-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';

/* Match highlight colours (inline styles since dangerouslySetInnerHTML) */
const HL = [
  { bg: '#fef3c7', fg: '#92400e' },
  { bg: '#ddd6fe', fg: '#5b21b6' },
  { bg: '#fbcfe8', fg: '#9f1239' },
  { bg: '#ccfbf1', fg: '#115e59' },
  { bg: '#dbeafe', fg: '#1e40af' },
];

const FLAG_DESC = {
  g: 'Global — find all matches',
  i: 'Case-insensitive',
  m: 'Multiline — ^ and $ match line breaks',
  s: 'DotAll — . matches newlines',
  u: 'Unicode support',
  y: 'Sticky — match from lastIndex only',
};

const PATTERNS = [
  { n: 'Email', p: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', f: { g: true } },
  { n: 'URL', p: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.*', f: { g: true } },
  { n: 'Phone (US)', p: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', f: { g: true } },
  { n: 'Hex Colour', p: '#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}', f: { g: true, i: true } },
  { n: 'IP Address', p: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', f: { g: true } },
  { n: 'Date YYYY-MM-DD', p: '\\d{4}-\\d{2}-\\d{2}', f: { g: true } },
  { n: 'HTML Tag', p: '<[^>]+>', f: { g: true } },
  { n: 'Numbers', p: '\\d+', f: { g: true } },
];

const SAMPLES = [
  { n: 'Emails', t: 'Contact us at support@example.com or sales@company.org for more information.' },
  { n: 'URLs', t: 'Visit https://www.example.com or http://blog.example.org/posts for details.' },
  { n: 'Phones', t: 'Call (123) 456-7890 or 987-654-3210 for assistance.' },
  { n: 'Mixed', t: 'User: john@email.com, Phone: 555-1234, ID: #ABC123, Date: 2024-01-15' },
];

const esc = (s) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export default function RegexTester() {
  const [regex, setRegex] = useState('\\w+');
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false, u: false, y: false });
  const [text, setText] = useState('Hello World! This is a test string with numbers 12345 and special chars @#$.');
  const [replaceStr, setReplaceStr] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [html, setHtml] = useState('');
  const [replaced, setReplaced] = useState('');
  const [copied, setCopied] = useState(false);

  const flagStr = Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');

  const run = useCallback(() => {
    if (!regex) { setMatches([]); setError(''); setHtml(text); setReplaced(''); return; }
    try {
      const re = new RegExp(regex, flagStr);
      const found = [];
      let m;
      if (flags.g) {
        while ((m = re.exec(text)) !== null) {
          found.push({ text: m[0], index: m.index, groups: m.slice(1) });
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        m = re.exec(text);
        if (m) found.push({ text: m[0], index: m.index, groups: m.slice(1) });
      }
      setMatches(found); setError('');

      // Highlight
      if (!found.length) { setHtml(esc(text)); }
      else {
        let r = '', li = 0;
        [...found].sort((a, b) => a.index - b.index).forEach((m, i) => {
          r += esc(text.slice(li, m.index));
          const c = HL[i % 5];
          r += `<span style="background:${c.bg};color:${c.fg};padding:1px 4px;border-radius:3px;font-weight:600">${esc(m.text)}</span>`;
          li = m.index + m.text.length;
        });
        r += esc(text.slice(li));
        setHtml(r);
      }

      // Replace
      if (showReplace) {
        try { setReplaced(text.replace(new RegExp(regex, flagStr), replaceStr)); } catch { setReplaced(''); }
      }
    } catch (e) { setError(e.message); setMatches([]); setHtml(esc(text)); setReplaced(''); }
  }, [regex, flagStr, text, showReplace, replaceStr, flags.g]);

  useEffect(() => { const t = setTimeout(run, 200); return () => clearTimeout(t); }, [run]);

  const copyRegex = () => { navigator.clipboard.writeText(`/${regex}/${flagStr}`); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const loadPattern = (p, f) => { setRegex(p); setFlags({ g: false, i: false, m: false, s: false, u: false, y: false, ...f }); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Regex Tester', href: '/tools/regex-tester' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-rose-500/25">
            <Search className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Regex Tester</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Test regular expressions with instant visual feedback</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Left — Pattern & Presets */}
          <div className="space-y-5">

            {/* Pattern input */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Regular Expression</h2>
              <label className={labelCls}>Pattern</label>
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-lg text-slate-400 font-mono">/</span>
                <input value={regex} onChange={e => setRegex(e.target.value)} placeholder="\\w+" className={`${inputCls} flex-1`} />
                <span className="text-lg text-slate-400 font-mono">/{flagStr}</span>
              </div>

              {/* Flags */}
              <label className={labelCls}>Flags</label>
              <div className="space-y-1.5 mb-4">
                {Object.entries(flags).map(([f, on]) => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={on} onChange={() => setFlags(p => ({ ...p, [f]: !p[f] }))}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-rose-600 focus:ring-rose-500" />
                    <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">{f}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">{FLAG_DESC[f]}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={copyRegex} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 transition">
                  {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Regex</>}
                </button>
                <button onClick={() => setShowReplace(p => !p)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition border ${showReplace ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400'
                      : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                    }`}>
                  <Replace className="w-3.5 h-3.5" />Replace
                </button>
              </div>
            </div>

            {/* Common patterns */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Common Patterns</h2>
              <div className="space-y-1.5">
                {PATTERNS.map(p => (
                  <button key={p.n} onClick={() => loadPattern(p.p, p.f)}
                    className="w-full text-left px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition">
                    {p.n}
                  </button>
                ))}
              </div>
            </div>

            {/* Sample texts */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Sample Texts</h2>
              <div className="space-y-1.5">
                {SAMPLES.map(s => (
                  <button key={s.n} onClick={() => setText(s.t)}
                    className="w-full text-left px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 hover:border-pink-300 dark:hover:border-pink-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-400 transition">
                    {s.n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Test & Results */}
          <div className="lg:col-span-2 space-y-5">

            {/* Status */}
            {error ? (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black text-red-600 dark:text-red-400">Invalid Regular Expression</p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">{error}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                  {matches.length} {matches.length === 1 ? 'Match' : 'Matches'} Found
                  {matches.length > 0 && <span className="font-normal ml-1.5">— positions: {matches.map(m => m.index).join(', ')}</span>}
                </p>
              </div>
            )}

            {/* Test text */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Test Text</h2>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder="Enter text to test…"
                className={`${inputCls} h-36 resize-none`} />
            </div>

            {/* Replace (toggle) */}
            {showReplace && (
              <div className={`${cardCls} p-5`}>
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Replace With</h2>
                <input value={replaceStr} onChange={e => setReplaceStr(e.target.value)} placeholder="Replacement string…" className={inputCls} />
                {replaced && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <p className={labelCls}>Result</p>
                    <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-all">{replaced}</pre>
                  </div>
                )}
              </div>
            )}

            {/* Highlighted output */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Highlighted Matches</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl min-h-[8rem] whitespace-pre-wrap break-words font-mono text-sm text-slate-800 dark:text-slate-200"
                dangerouslySetInnerHTML={{ __html: html || '<span style="color:#94a3b8">No matches to display</span>' }} />
            </div>

            {/* Match details */}
            {matches.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Match Details ({matches.length})</h2>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {matches.map((m, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/40 border-l-4 border-rose-500 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-rose-600 dark:text-rose-400">Match #{i + 1}</span>
                        <span className="text-[10px] text-slate-400">index {m.index}</span>
                      </div>
                      <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-900 dark:text-white">{m.text}</div>
                      {m.groups.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Capture Groups</p>
                          {m.groups.map((g, gi) => (
                            <div key={gi} className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300 mt-1">
                              Group {gi + 1}: {g || '(empty)'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Regex Tester — Test Regular Expressions Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Regular expressions are one of the most powerful tools in a developer's toolkit. They let you search, match, and manipulate text using patterns. But writing the right regex can be tricky — a single misplaced character can change the entire behaviour. That is where a live regex tester becomes essential. Instead of running your code, deploying, and checking logs, you can test your pattern right here and see every match highlighted instantly.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free Regex Tester supports all six JavaScript regex flags: global (g), case-insensitive (i), multiline (m), dotAll (s), unicode (u), and sticky (y). Type your pattern, paste your test string, and watch matches appear in real time. Every match is colour-coded and numbered. Capture groups are shown separately. You can also use the built-in replace mode to test find-and-replace operations.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Eight common patterns are built in — email, URL, phone number, hex colour, IP address, date, HTML tag, and plain numbers. Four sample texts are provided so you can test patterns instantly. All processing runs in your browser. No data is sent to any server.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Understanding Regex Flags</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'g — Global', c: 'text-rose-600 dark:text-rose-400', b: 'Find all matches in the string, not just the first one. Without this flag, the regex stops after the first match.' },
                { t: 'i — Case-insensitive', c: 'text-blue-600 dark:text-blue-400', b: 'Treat uppercase and lowercase letters as the same. "abc" matches "ABC", "Abc", and so on.' },
                { t: 'm — Multiline', c: 'text-emerald-600 dark:text-emerald-400', b: 'Make ^ and $ match the start and end of each line, not just the start and end of the entire string.' },
                { t: 's — DotAll', c: 'text-amber-600 dark:text-amber-400', b: 'Make the dot (.) match newline characters as well. By default, dot matches everything except newlines.' },
                { t: 'u — Unicode', c: 'text-violet-600 dark:text-violet-400', b: 'Enable full Unicode support. Required for matching emoji, CJK characters, and other multi-byte sequences correctly.' },
                { t: 'y — Sticky', c: 'text-teal-600 dark:text-teal-400', b: 'Match only from the position indicated by lastIndex. Useful for tokenisation and lexer implementations.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Common Regex Patterns Explained</h2>
            <div className="space-y-3">
              {[
                { t: 'Email validation', c: 'text-rose-600 dark:text-rose-400', b: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,} — Matches standard email addresses with alphanumeric local parts and domain names.' },
                { t: 'URL matching', c: 'text-blue-600 dark:text-blue-400', b: 'https?://[\\w\\-]+(\\.[\\w\\-]+)+[/#?]?.* — Matches HTTP and HTTPS URLs with domain names, paths, and query strings.' },
                { t: 'Phone numbers', c: 'text-emerald-600 dark:text-emerald-400', b: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4} — Matches US phone numbers in various formats: (123) 456-7890, 123-456-7890, 123.456.7890.' },
                { t: 'IP addresses', c: 'text-amber-600 dark:text-amber-400', b: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b — Matches IPv4 addresses like 192.168.1.1. Does not validate range (0-255).' },
                { t: 'Dates', c: 'text-violet-600 dark:text-violet-400', b: '\\d{4}-\\d{2}-\\d{2} — Matches dates in YYYY-MM-DD format. Does not validate month or day ranges.' },
                { t: 'HTML tags', c: 'text-teal-600 dark:text-teal-400', b: '<[^>]+> — Matches opening and closing HTML tags including self-closing tags. Not suitable for full HTML parsing.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${c.replace('text-', 'bg-').split(' ')[0]}`} />
                  <div>
                    <p className={`font-black text-sm mb-0.5 ${c}`}>{t}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-mono">{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this regex tester free?', a: 'Yes, completely free with no account, no ads, and no limits on usage.' },
                { q: 'Is my data sent to a server?', a: 'No. All regex testing runs locally in your browser. Nothing is uploaded.' },
                { q: 'What regex engine does it use?', a: 'JavaScript\'s built-in RegExp engine. All results match what you would get in Node.js or any browser.' },
                { q: 'Does it support capture groups?', a: 'Yes. Capture groups are shown separately for each match with their index numbers.' },
                { q: 'Can I do find and replace?', a: 'Yes. Toggle the Replace button to enter a replacement string. The result updates in real time.' },
                { q: 'What are the highlight colours?', a: 'Five rotating colours are used to distinguish adjacent matches: amber, violet, pink, teal, and blue.' },
                { q: 'Can I copy the regex?', a: 'Yes. Click "Copy Regex" to copy the pattern with flags in /pattern/flags format.' },
                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive with a sidebar on desktop and stacked on mobile.' },
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