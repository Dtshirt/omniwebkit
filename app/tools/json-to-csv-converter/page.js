'use client';
import { useState } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  ArrowLeftRight, Copy, Download, Upload, Check,
  AlertCircle, FileJson, FileSpreadsheet, Settings2,
  RotateCcw, CheckCircle, ArrowRight
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition';
const labelCls = 'text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide';

function escapeCSV(value, delim) {
  const s = String(value);
  if (s.includes(delim) || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function jsonToCSV(jsonStr, delim, headers) {
  const data = JSON.parse(jsonStr);
  if (!Array.isArray(data)) throw new Error('JSON input must be an array of objects. Example: [{"name":"Alice"},{"name":"Bob"}]');
  if (data.length === 0) return '';
  const keys = [...new Set(data.flatMap(o => Object.keys(o)))];
  const rows = [];
  if (headers) rows.push(keys.map(k => escapeCSV(k, delim)).join(delim));
  for (const obj of data) {
    rows.push(keys.map(k => {
      const v = obj[k];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return escapeCSV(JSON.stringify(v), delim);
      return escapeCSV(String(v), delim);
    }).join(delim));
  }
  return rows.join('\n');
}

function csvToJSON(csvStr, delim, hasHeaders) {
  const lines = csvStr.trim().split('\n').filter(l => l.trim());
  if (!lines.length) return '[]';

  const parseLine = (line) => {
    const vals = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i], nx = line[i + 1];
      if (ch === '"') { inQ && nx === '"' ? (cur += '"', i++) : (inQ = !inQ); }
      else if (ch === delim && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    vals.push(cur.trim()); return vals;
  };

  const coerce = (v) => {
    if (v === 'true') return true;
    if (v === 'false') return false;
    if (v === 'null') return null;
    if (v !== '' && !isNaN(v)) return Number(v);
    if (typeof v === 'string' && (v.startsWith('{') || v.startsWith('['))) {
      try { return JSON.parse(v); } catch { }
    }
    return v;
  };

  const hdrs = hasHeaders ? parseLine(lines[0]) : parseLine(lines[0]).map((_, i) => `column_${i + 1}`);
  const dataLines = hasHeaders ? lines.slice(1) : lines;
  return JSON.stringify(
    dataLines.map(l => {
      const vals = parseLine(l);
      return Object.fromEntries(hdrs.map((h, i) => [h, coerce(vals[i] ?? '')]));
    }), null, 2
  );
}

/* ─── Sample data ─────────────────────────────────────────────────── */
const SAMPLE_JSON = JSON.stringify([
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 30, department: 'Engineering', active: true },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', age: 25, department: 'Design', active: false },
  { id: 3, name: 'Carol White', email: 'carol@example.com', age: 35, department: 'Marketing', active: true },
], null, 2);

const SAMPLE_CSV = `id,name,email,age,department,active
1,Alice Johnson,alice@example.com,30,Engineering,true
2,Bob Smith,bob@example.com,25,Design,false
3,Carol White,carol@example.com,35,Marketing,true`;

/* ─── Component ───────────────────────────────────────────────────── */
export default function JsonCsvConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('json'); // 'json' | 'csv'
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [delim, setDelim] = useState(',');
  const [headers, setHeaders] = useState(true);
  const [stats, setStats] = useState(null);

  const outFmt = mode === 'json' ? 'CSV' : 'JSON';

  const convert = () => {
    setError(''); setOutput(''); setStats(null);
    if (!input.trim()) { setError('Please paste or upload data to convert.'); return; }
    try {
      const result = mode === 'json' ? jsonToCSV(input, delim, headers) : csvToJSON(input, delim, headers);
      setOutput(result);
      setStats({
        inLines: input.trim().split('\n').length,
        outLines: result.split('\n').length,
        inChars: input.length,
        outChars: result.length,
      });
    } catch (e) {
      setError(e.message || 'Conversion failed. Check your input format.');
    }
  };

  const swap = () => {
    setMode(m => m === 'json' ? 'csv' : 'json');
    setInput(output); setOutput(''); setError(''); setStats(null);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const ext = outFmt.toLowerCase();
    const blob = new Blob([output], { type: 'text/plain' });
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob), download: `converted.${ext}`
    }).click();
  };

  const uploadFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setInput(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'JSON to CSV Converter', href: '/tools/json-to-csv-converter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
            <ArrowLeftRight className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">JSON ↔ CSV Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Convert between JSON and CSV formats instantly — free, browser-based</p>
        </div>

        {/* Direction indicator + swap */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${mode === 'json'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
            <FileJson className="w-4 h-4" />JSON
          </div>
          <button onClick={swap} title="Swap direction"
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all">
            <ArrowLeftRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${mode === 'csv'
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
            <FileSpreadsheet className="w-4 h-4" />CSV
          </div>
        </div>

        {/* Settings bar */}
        <div className={`${cardCls} p-4 mb-5 flex flex-wrap gap-4 items-center`}>
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-400" />
            <span className={labelCls}>Options</span>
          </div>

          {/* Delimiter */}
          <div className="flex items-center gap-2">
            <label className={labelCls}>Delimiter</label>
            <select value={delim} onChange={e => setDelim(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-400 transition">
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value={'\t'}>Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          {/* Headers */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={headers} onChange={e => setHeaders(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-500 cursor-pointer" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {mode === 'json' ? 'Include header row' : 'First row is header'}
            </span>
          </label>

          {/* Clear */}
          <button onClick={() => { setInput(''); setOutput(''); setError(''); setStats(null); }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition">
            <RotateCcw className="w-3.5 h-3.5" />Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Editor grid */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">

          {/* Input */}
          <div className={cardCls}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {mode === 'json' ? <FileJson className="w-4 h-4 text-blue-500" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                Input ({mode.toUpperCase()})
              </h2>
              <div className="flex items-center gap-2">
                {input && <span className="text-[10px] font-bold text-slate-400">{input.length} chars</span>}
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />Upload
                  <input type="file" accept=".json,.csv,.txt" onChange={uploadFile} className="hidden" />
                </label>
              </div>
            </div>

            {/* Sample buttons */}
            <div className="flex gap-2 px-5 pt-3">
              <button onClick={() => { setInput(SAMPLE_JSON); setMode('json'); setOutput(''); setStats(null); }}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-bold transition">
                Sample JSON
              </button>
              <button onClick={() => { setInput(SAMPLE_CSV); setMode('csv'); setOutput(''); setStats(null); }}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold transition">
                Sample CSV
              </button>
            </div>

            <div className="p-4">
              <textarea
                value={input} onChange={e => setInput(e.target.value)}
                placeholder={mode === 'json'
                  ? '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]'
                  : 'id,name,email\n1,Alice,alice@example.com\n2,Bob,bob@example.com'}
                spellCheck={false}
                className="w-full h-80 p-3 font-mono text-xs text-slate-900 dark:text-white bg-slate-950/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none focus:ring-2 focus:ring-emerald-400 placeholder-slate-400 leading-relaxed"
              />
            </div>

            <div className="px-4 pb-4">
              <button onClick={convert}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition">
                <ArrowRight className="w-4 h-4" />Convert to {outFmt}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className={cardCls}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {mode === 'csv' ? <FileJson className="w-4 h-4 text-blue-500" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-500" />}
                Output ({outFmt})
              </h2>
              {output && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400">{output.length} chars</span>
                  <button onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition">
                    {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                  </button>
                  <button onClick={download}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition">
                    <Download className="w-3.5 h-3.5" />Save .{outFmt.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              <textarea
                value={output} readOnly
                placeholder="Converted output appears here after clicking Convert…"
                spellCheck={false}
                className="w-full h-80 p-3 font-mono text-xs text-slate-900 dark:text-white bg-slate-950/5 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-700 rounded-xl resize-none outline-none leading-relaxed placeholder-slate-400"
              />
            </div>

            {/* Stats */}
            {stats && (
              <div className="mx-4 mb-4 flex flex-wrap gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-4 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Input: {stats.inLines} lines / {stats.inChars} chars</span>
                  <span>→</span>
                  <span>Output: {stats.outLines} lines / {stats.outChars} chars</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free JSON to CSV Converter & CSV to JSON Converter Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              JSON and CSV are the two most common data formats used across software development, data analysis, and business intelligence. JSON (JavaScript Object Notation) is the standard data format for web APIs and modern applications. CSV (Comma-Separated Values) is the universal format for spreadsheets, databases, and data exports. You frequently need to convert between them — and this tool makes that conversion instant, accurate, and free.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit JSON to CSV Converter works in both directions. Paste a JSON array of objects to convert it to a properly formatted CSV file with configurable delimiters and optional header rows. Paste a CSV file to convert it back to a structured JSON array, with automatic type coercion (numbers, booleans, and null values are detected and converted automatically). All processing happens in your browser — your data never leaves your device.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Four delimiter options are supported: comma (the default), semicolon (common in European locales where commas are used as decimal separators), tab (for TSV files), and pipe. The "Swap" button reverses the conversion direction and moves the output to the input area, so you can quickly convert back and forth.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">JSON to CSV Conversion — How It Works</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Converting JSON to CSV requires the input to be a JSON array where each element is an object (row). The converter handles several edge cases automatically:
            </p>
            <div className="space-y-3">
              {[
                { t: 'Missing keys', b: 'If different objects in the array have different keys, the converter collects all unique keys across all objects. Missing values for a given row appear as empty cells in the CSV output.' },
                { t: 'Nested objects and arrays', b: 'If a JSON value is an object or array, it is serialised to a JSON string and placed in a single CSV cell, surrounded by quotes. This preserves the data without losing it.' },
                { t: 'Special characters', b: 'Values that contain the delimiter character, double quotes, or newlines are automatically wrapped in double quotes per the RFC 4180 CSV standard. Double quotes within values are escaped by doubling them.' },
                { t: 'Header row', b: 'The first row of the CSV output uses the JSON object keys as column headers. You can disable this for header-less CSV output.' },
                { t: 'Custom delimiters', b: 'Choose from comma, semicolon, tab, or pipe. Semicolons are common in German, French, and other European locales where commas are decimal separators. Tab-separated values (TSV) are often easier to paste into Excel.' },
              ].map(({ t, b }) => (
                <div key={t} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">{t}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">CSV to JSON Conversion — Smart Type Detection</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              When converting CSV to JSON, the converter doesn't just produce strings for every value — it applies smart type coercion to produce the most useful JSON output:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { t: 'Numbers', b: 'Numeric strings are automatically converted to JavaScript numbers. "42" becomes 42, "3.14" becomes 3.14.' },
                { t: 'Booleans', b: '"true" becomes true (boolean), "false" becomes false. Case-sensitive.' },
                { t: 'Null values', b: '"null" is converted to JSON null instead of the string "null".' },
                { t: 'Nested JSON', b: 'Strings that look like JSON objects or arrays ({...} or [...]) are parsed into nested structures.' },
                { t: 'Empty cells', b: 'Empty CSV cells become empty strings "" in the JSON output.' },
                { t: 'Column names', b: 'If "First row is header" is unchecked, columns are named column_1, column_2, etc.' },
              ].map(({ t, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this JSON to CSV converter free?', a: 'Yes, completely free with no usage limits, no account required, and no data uploaded to any server. All conversion runs in your browser.' },
                { q: 'Is my data private?', a: 'Yes. Your data is processed entirely in your browser using JavaScript. Nothing you paste is uploaded, stored, or transmitted anywhere.' },
                { q: 'What JSON format does the tool accept?', a: 'The JSON input must be an array of objects (rows). Example: [{"name":"Alice","age":30},{"name":"Bob","age":25}]. Nested objects are serialised to JSON strings in the CSV cells.' },
                { q: 'Can I convert a CSV with semicolons?', a: 'Yes. Select "Semicolon (;)" as the delimiter in the options bar before converting. Semicolons are common in European locales.' },
                { q: 'What happens to missing fields in JSON to CSV?', a: 'If objects in the JSON array have different keys, all unique keys are collected and used as columns. Objects missing a key produce an empty cell in that column.' },
                { q: 'Can I upload a file instead of pasting?', a: 'Yes. Click the "Upload" button to select a .json, .csv, or .txt file from your device. The file contents are loaded into the input area.' },
                { q: 'Why are my numbers appearing as strings in the CSV?', a: 'CSV is a plain-text format — all values are strings. When you convert back from CSV to JSON, the tool automatically detects and converts numeric strings back to numbers.' },
                { q: 'What is a TSV file?', a: 'A TSV (Tab-Separated Values) file uses tabs instead of commas as the delimiter. Select "Tab" in the delimiter options to work with TSV files.' },
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