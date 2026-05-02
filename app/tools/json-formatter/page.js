'use client';

import { useState, useCallback, useMemo } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Code2, Copy, Download, Check, AlertTriangle, CheckCircle,
  Zap, Minimize2, Maximize2, RotateCcw, FileJson, Settings2,
  ArrowUpDown
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

function sortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(Object.keys(obj).sort().map(k => [k, sortKeys(obj[k])]));
  }
  return obj;
}

function stripComments(s) {
  return s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
}

/* Simple syntax colour — turns a JSON string into spans */
function syntaxHighlight(json) {
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-amber-600 dark:text-amber-400'; // number
      if (/^"/.test(match)) {
        cls = /:$/.test(match)
          ? 'text-blue-600 dark:text-blue-400'         // key
          : 'text-emerald-600 dark:text-emerald-400';  // string
      } else if (/true|false/.test(match)) {
        cls = 'text-violet-600 dark:text-violet-400';  // boolean
      } else if (/null/.test(match)) {
        cls = 'text-red-500 dark:text-red-400';        // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function getStats(parsed) {
  if (parsed === null || parsed === undefined) return null;
  let keys = 0, arr = 0, str = 0, num = 0, bool = 0, nil = 0;
  const walk = (v) => {
    if (Array.isArray(v)) { arr++; v.forEach(walk); }
    else if (v !== null && typeof v === 'object') { const ks = Object.keys(v); keys += ks.length; ks.forEach(k => walk(v[k])); }
    else if (typeof v === 'string') str++;
    else if (typeof v === 'number') num++;
    else if (typeof v === 'boolean') bool++;
    else if (v === null) nil++;
  };
  walk(parsed);
  return { keys, arr, str, num, bool, nil };
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function JSONFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState(null);   // true | false | null
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [mode, setMode] = useState('format'); // 'format' | 'minify'
  const [indent, setIndent] = useState(2);
  const [doSort, setDoSort] = useState(false);
  const [stripC, setStripC] = useState(false);
  const [showHL, setShowHL] = useState(true);

  /* ── Validate on the fly ── */
  const validateOnly = useCallback((raw) => {
    if (!raw.trim()) { setIsValid(null); setParsed(null); return; }
    try {
      const p = JSON.parse(stripC ? stripComments(raw) : raw);
      setIsValid(true); setParsed(p);
    } catch { setIsValid(false); setParsed(null); }
  }, [stripC]);

  const handleInput = (val) => { setInput(val); validateOnly(val); };

  /* ── Format ── */
  const process = useCallback((m = mode) => {
    if (!input.trim()) { setError('Paste your JSON into the input area first.'); return; }
    try {
      let str = stripC ? stripComments(input) : input;
      let p = JSON.parse(str);
      if (doSort) p = sortKeys(p);
      const out = m === 'minify' ? JSON.stringify(p) : JSON.stringify(p, null, indent);
      setOutput(out); setIsValid(true); setError(''); setParsed(p);
    } catch (e) {
      setIsValid(false); setError(e.message); setOutput('');
    }
  }, [input, mode, indent, doSort, stripC]);

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: 'formatted.json'
    }).click();
  };

  const clear = () => { setInput(''); setOutput(''); setIsValid(null); setError(''); setParsed(null); };

  const stats = useMemo(() => getStats(parsed), [parsed]);

  const highlighted = useMemo(() => output ? syntaxHighlight(
    output.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  ) : '', [output]);

  const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-400 transition';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'JSON Formatter', href: '/tools/json-formatter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <FileJson className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">JSON Formatter & Validator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Format, validate, minify, and beautify JSON with syntax highlighting</p>
        </div>

        {/* Settings bar */}
        <div className={`${cardCls} p-4 mb-5 flex flex-wrap gap-4 items-center`}>
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Settings</span>
          </div>

          {/* Indent */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase whitespace-nowrap">Indent:</label>
            <input type="range" min={1} max={8} value={indent} onChange={e => setIndent(+e.target.value)}
              className="w-24 h-1.5 accent-violet-500 cursor-pointer" />
            <span className="text-xs font-bold text-slate-900 dark:text-white w-4">{indent}</span>
          </div>

          {/* Sort keys */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={doSort} onChange={e => setDoSort(e.target.checked)}
              className="w-4 h-4 rounded accent-violet-500 cursor-pointer" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />Sort Keys
            </span>
          </label>

          {/* Strip comments */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={stripC} onChange={e => setStripC(e.target.checked)}
              className="w-4 h-4 rounded accent-violet-500 cursor-pointer" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Strip Comments</span>
          </label>

          {/* Syntax highlighting toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showHL} onChange={e => setShowHL(e.target.checked)}
              className="w-4 h-4 rounded accent-violet-500 cursor-pointer" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Syntax Highlighting</span>
          </label>

          {/* Clear */}
          <button onClick={clear}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition">
            <RotateCcw className="w-3.5 h-3.5" />Clear
          </button>
        </div>

        {/* Error box */}
        {error && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div><span className="font-bold">JSON Error: </span>{error}</div>
          </div>
        )}

        {/* Editors row */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">

          {/* Input */}
          <div className={cardCls}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Input JSON</h2>
                {isValid === true && <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full text-[10px] font-bold"><CheckCircle className="w-3 h-3" />Valid</span>}
                {isValid === false && <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-[10px] font-bold"><AlertTriangle className="w-3 h-3" />Invalid</span>}
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                <span>{input.length} chars</span>
                <span>{input.split('\n').length} lines</span>
              </div>
            </div>
            <div className="p-4">
              <textarea
                value={input} onChange={e => handleInput(e.target.value)}
                placeholder={'{\n  "name": "John Doe",\n  "age": 30,\n  "city": "New York"\n}'}
                spellCheck={false}
                className="w-full h-80 p-3 font-mono text-xs text-slate-900 dark:text-white bg-slate-950/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-violet-400 placeholder-slate-400 leading-relaxed"
              />
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <button onClick={() => { setMode('format'); process('format'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-md shadow-violet-500/20 transition">
                <Maximize2 className="w-4 h-4" />Format / Beautify
              </button>
              <button onClick={() => { setMode('minify'); process('minify'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-xl font-bold text-sm transition">
                <Minimize2 className="w-4 h-4" />Minify
              </button>
            </div>
          </div>

          {/* Output */}
          <div className={cardCls}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {mode === 'minify' ? 'Minified Output' : 'Formatted Output'}
              </h2>
              {output && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{output.length} chars</span>
                  <button onClick={copyOutput}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition">
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                  </button>
                  <button onClick={download}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 rounded-lg text-xs font-bold transition">
                    <Download className="w-3.5 h-3.5" />Save .json
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              {output && showHL ? (
                <pre
                  className="w-full h-80 p-3 font-mono text-xs bg-slate-950/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700 rounded-xl overflow-auto leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              ) : (
                <pre className="w-full h-80 p-3 font-mono text-xs text-slate-900 dark:text-white bg-slate-950/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700 rounded-xl overflow-auto leading-relaxed whitespace-pre-wrap">
                  {output || <span className="text-slate-400">Click Format or Minify to see output here…</span>}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        {stats && (
          <div className={`${cardCls} px-5 py-4 mb-5`}>
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-violet-500" />JSON Structure Stats
            </h3>
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Object Keys', val: stats.keys, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
                { label: 'Arrays', val: stats.arr, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
                { label: 'Strings', val: stats.str, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
                { label: 'Numbers', val: stats.num, color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
                { label: 'Booleans', val: stats.bool, color: 'bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800' },
                { label: 'Null values', val: stats.nil, color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
              ].map(({ label, val, color }) => (
                <div key={label} className={`flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-bold ${color}`}>
                  <span className="text-base font-black">{val}</span>
                  <span className="font-semibold opacity-75">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free JSON Formatter & Validator — Beautify, Minify and Validate JSON Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              JSON (JavaScript Object Notation) is the most widely used data format for APIs, configuration files, and web applications. When you receive raw JSON from an API response or log file, it usually arrives as a single compressed line — unreadable without formatting. A JSON formatter takes that minified data and converts it into a structured, indented, human-readable format in seconds.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit JSON Formatter does more than just add whitespace. It validates your JSON as you type — showing a green "Valid" badge when the syntax is correct and a red "Invalid" badge with the exact error message when something is wrong. This makes it a JSON validator as well as a formatter. You can adjust the indentation (1–8 spaces), sort object keys alphabetically, strip non-standard JavaScript-style comments, and toggle syntax highlighting that colours keys, strings, numbers, booleans, and null values in distinct colours.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              After formatting or minifying, you can copy the output to the clipboard with one click, or download it as a <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded text-violet-600 dark:text-violet-400">formatted.json</code> file. The Structure Stats panel shows a breakdown of object keys, arrays, strings, numbers, booleans, and null values in the parsed JSON — useful for understanding the shape of your data at a glance.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">JSON Formatting Options Explained</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Format / Beautify', b: 'Parses your JSON and outputs it with indentation, newlines, and spacing. Makes compact API responses and minified config files easy to read and debug.' },
                { t: 'Minify', b: 'Removes all whitespace, newlines, and comments from your JSON, producing the smallest possible valid JSON string. Used to reduce payload size for API responses, localStorage, or config files.' },
                { t: 'Indentation (1–8)', b: 'Controls how many spaces are used per level of nesting. 2 spaces is the most common standard used by JavaScript, Python, and most JSON style guides. 4 spaces is common in languages like C# and Java. Tabs can be simulated at 4 or 8 spaces.' },
                { t: 'Sort Keys (A–Z)', b: 'Sorts all object keys alphabetically at every level of nesting. Useful for comparing two JSON objects (since key order won\'t differ), creating deterministic output, and making large objects easier to navigate.' },
                { t: 'Strip Comments', b: 'Standard JSON does not support comments. However, some tools (VS Code settings.json, JSON5 files) allow JavaScript-style // line comments and /* block comments */. Enabling this option strips them before parsing so the JSON validates correctly.' },
                { t: 'Syntax Highlighting', b: 'Colours different JSON value types in distinct colours: keys in blue, strings in green, numbers in amber, booleans in violet, and null values in red. Makes structured data much faster to read and understand visually.' },
              ].map(({ t, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Common JSON Errors and How to Fix Them</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The validator shows the exact error message from the JSON parser when your input is invalid. Here are the most common JSON errors and what causes them:
            </p>
            <div className="space-y-3">
              {[
                { err: 'Unexpected token', fix: 'Usually caused by a trailing comma after the last item in an array or object. Example: {"a":1,} — the comma after 1 is not allowed in standard JSON.' },
                { err: 'Unexpected end of input', fix: 'The JSON is incomplete. A bracket, brace, or quote is opened but never closed. Check for missing } or ] at the end of the document.' },
                { err: 'Unexpected token in JSON', fix: 'Often caused by single quotes instead of double quotes. JSON requires double quotes for all strings and keys. Example: {\'name\': \'John\'} is invalid — must be {"name": "John"}.' },
                { err: 'Property name must be a string', fix: 'All JSON object keys must be quoted strings. Unquoted keys (like {name: "John"}) are valid JavaScript but not valid JSON.' },
                { err: 'Circular reference or too much recursion', fix: 'Not a JSON parsing error but a serialisation error. Objects that reference themselves (circular references) cannot be serialised to JSON. This would appear in stringify operations, not parse operations.' },
              ].map(({ err, fix }) => (
                <div key={err} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5 font-mono">{err}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this JSON formatter free?', a: 'Yes, completely free with no usage limits, no account required, and no data sent to any server. All processing runs in your browser.' },
                { q: 'Is my JSON data private?', a: 'Yes. Your JSON is processed entirely in your browser using JavaScript. Nothing you paste is uploaded, stored, or transmitted anywhere.' },
                { q: 'Why does standard JSON not allow comments?', a: 'JSON was designed as a pure data interchange format. Comments are a documentation feature that adds complexity to parsers. Douglas Crockford (JSON\'s creator) intentionally excluded them. Use the Strip Comments option if you have JSON5 or JSONC files with comments.' },
                { q: 'What is the difference between JSON and JSONC?', a: 'JSONC (JSON with Comments) is an extension used by VS Code for configuration files. It supports // and /* */ comments. Standard JSON parsers reject these — use the "Strip Comments" option before formatting JSONC files.' },
                { q: 'What does "Sort Keys" do exactly?', a: 'It recursively sorts all object keys alphabetically at every nesting level. This makes JSON objects deterministic and easier to compare or diff, since the key order won\'t vary between two otherwise identical objects.' },
                { q: 'Can I use this to format large JSON files?', a: 'Yes, but very large files (several megabytes) may be slow to format in the browser. For very large files, command-line tools like `jq` are more efficient. For typical API responses and config files, this tool handles them without issue.' },
                { q: 'What do the colour codes in syntax highlighting mean?', a: 'Blue = object keys, Green = string values, Amber = numbers, Violet = booleans (true/false), Red = null values. Punctuation (braces, brackets, colons) remains in the default text colour.' },
                { q: 'Can I download the formatted JSON?', a: 'Yes. After formatting or minifying, click the "Save .json" button to download the result as a file named "formatted.json".' },
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