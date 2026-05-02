'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Upload, Copy, Check, FileText, Table, ArrowLeftRight, Download, AlertTriangle, X, RefreshCw, ChevronDown } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Format definitions ─────────────────────────────────────────────────── */
const FORMATS = [
  { value: 'csv', label: 'CSV', icon: '📄', ext: 'csv', mime: 'text/csv', desc: 'Comma-Separated Values' },
  { value: 'tsv', label: 'TSV', icon: '📋', ext: 'tsv', mime: 'text/tab-separated-values', desc: 'Tab-Separated Values' },
  { value: 'json', label: 'JSON', icon: '{}', ext: 'json', mime: 'application/json', desc: 'JavaScript Object Notation' },
  { value: 'markdown', label: 'Markdown', icon: '📝', ext: 'md', mime: 'text/markdown', desc: 'Markdown Table' },
  { value: 'html', label: 'HTML', icon: '🌐', ext: 'html', mime: 'text/html', desc: 'HTML Table' },
  { value: 'sql', label: 'SQL', icon: '🗄️', ext: 'sql', mime: 'text/plain', desc: 'SQL INSERT Statements' },
];

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

/* ─── CSV/TSV parser (handles quoted fields) ─────────────────────────────── */
function detectDelimiter(text, forced) {
  if (forced !== 'auto') return forced;
  const line = text.split('\n')[0];
  const tabs = (line.match(/\t/g) || []).length;
  const semis = (line.match(/;/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  if (tabs > commas && tabs > semis) return '\t';
  if (semis > commas) return ';';
  return ',';
}

function parseDelimited(text, delim) {
  if (!text.trim()) return { headers: [], rows: [] };
  const lines = text.trim().split('\n');
  const parse = (line) => {
    const cells = []; let cell = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (inQ && line[i + 1] === '"') { cell += '"'; i++; } else inQ = !inQ; }
      else if (c === delim && !inQ) { cells.push(cell.trim()); cell = ''; }
      else cell += c;
    }
    cells.push(cell.trim());
    return cells;
  };
  const parsed = lines.map(parse);
  return { headers: parsed[0] || [], rows: parsed.slice(1) };
}

function parseJSON(text) {
  const data = JSON.parse(text);
  if (!Array.isArray(data) || data.length === 0) throw new Error('JSON must be a non-empty array of objects');
  const headers = [...new Set(data.flatMap(o => Object.keys(o)))];
  return { headers, rows: data.map(o => headers.map(h => o[h] ?? '')) };
}

function parseMarkdown(text) {
  const lines = text.trim().split('\n').filter(l => l.trim() && !l.match(/^\|[\s-|]+\|$/));
  if (lines.length < 1) throw new Error('Invalid Markdown table');
  const parse = l => l.split('|').slice(1, -1).map(c => c.trim());
  return { headers: parse(lines[0]), rows: lines.slice(1).map(parse) };
}

function parseHTML(text) {
  const doc = new DOMParser().parseFromString(text, 'text/html');
  const table = doc.querySelector('table');
  if (!table) throw new Error('No <table> element found in HTML');
  const headers = [...table.querySelectorAll('thead th, thead td')].map(c => c.textContent.trim());
  const rows = [...table.querySelectorAll('tbody tr')].map(tr =>
    [...tr.querySelectorAll('td')].map(c => c.textContent.trim())
  );
  return { headers, rows };
}

function parseSQL(text) {
  const m = text.match(/INSERT INTO\s+\w+\s*\((.*?)\)\s*VALUES/is);
  if (!m) throw new Error('Could not find INSERT INTO … VALUES pattern');
  const headers = m[1].split(',').map(h => h.trim().replace(/[`'"]/g, ''));
  const rows = [...text.matchAll(/VALUES\s*\((.*?)\)/gis)].map(v =>
    v[1].split(',').map(c => c.trim().replace(/^['"]|['"]$/g, ''))
  );
  return { headers, rows };
}

/* ─── Output generators ──────────────────────────────────────────────────── */
function toCSV({ headers, rows }, sep = ',') {
  const esc = v => { const s = String(v); return (s.includes(sep) || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [headers.map(esc).join(sep), ...rows.map(r => r.map(esc).join(sep))].join('\n');
}
function toJSON({ headers, rows }) {
  return JSON.stringify(rows.map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? '']))), null, 2);
}
function toMarkdown({ headers, rows }) {
  const cols = headers.map((h, i) => Math.max(h.length, ...rows.map(r => String(r[i] ?? '').length), 3));
  const pad = (s, n) => String(s).padEnd(n);
  const row = arr => '| ' + arr.map((c, i) => pad(c, cols[i])).join(' | ') + ' |';
  return [row(headers), '| ' + cols.map(n => '-'.repeat(n)).join(' | ') + ' |', ...rows.map(r => row(headers.map((_, i) => r[i] ?? '')))].join('\n');
}
function toHTML({ headers, rows }) {
  return `<table class="data-table">\n  <thead>\n    <tr>\n${headers.map(h => `      <th>${h}</th>`).join('\n')}\n    </tr>\n  </thead>\n  <tbody>\n${rows.map(r => `    <tr>\n${r.map(c => `      <td>${c}</td>`).join('\n')}\n    </tr>`).join('\n')}\n  </tbody>\n</table>`;
}
function toSQL({ headers, rows }, tableName) {
  const esc = v => String(v).replace(/'/g, "''");
  return `-- SQL INSERT statements\n-- Table: ${tableName}\n\n${rows.map(r => `INSERT INTO ${tableName} (${headers.join(', ')}) VALUES (${r.map(c => `'${esc(c)}'`).join(', ')});`).join('\n')}`;
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function FormatConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [inputFmt, setInputFmt] = useState('csv');
  const [outputFmt, setOutputFmt] = useState('json');
  const [delimiter, setDelimiter] = useState('auto');
  const [tableName, setTableName] = useState('data_table');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [fileDrag, setFileDrag] = useState(false);
  const fileRef = React.useRef(null);

  /* ── Parse input ── */
  const parseInput = useCallback((text, fmt) => {
    if (!text.trim()) return { headers: [], rows: [] };
    switch (fmt) {
      case 'csv': return parseDelimited(text, detectDelimiter(text, delimiter));
      case 'tsv': return parseDelimited(text, '\t');
      case 'json': return parseJSON(text);
      case 'markdown': return parseMarkdown(text);
      case 'html': return parseHTML(text);
      case 'sql': return parseSQL(text);
      default: return { headers: [], rows: [] };
    }
  }, [delimiter]);

  /* ── Convert ── */
  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); setStats(null); return; }
    try {
      setError('');
      const parsed = parseInput(input, inputFmt);
      if (!parsed.headers.length) { setOutput(''); setStats(null); return; }
      setStats({ rows: parsed.rows.length, cols: parsed.headers.length });
      let result = '';
      switch (outputFmt) {
        case 'csv': result = toCSV(parsed, ','); break;
        case 'tsv': result = toCSV(parsed, '\t'); break;
        case 'json': result = toJSON(parsed); break;
        case 'markdown': result = toMarkdown(parsed); break;
        case 'html': result = toHTML(parsed); break;
        case 'sql': result = toSQL(parsed, tableName); break;
      }
      setOutput(result);
    } catch (e) {
      setError(e.message);
      setOutput('');
      setStats(null);
    }
  }, [input, inputFmt, outputFmt, delimiter, tableName, parseInput]);

  /* ── Swap formats ── */
  const swapFormats = () => {
    setInputFmt(outputFmt);
    setOutputFmt(inputFmt);
    setInput(output);
  };

  /* ── File upload ── */
  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'tsv') setInputFmt('tsv');
    else if (ext === 'json') setInputFmt('json');
    else if (ext === 'md' || ext === 'markdown') setInputFmt('markdown');
    else if (ext === 'html' || ext === 'htm') setInputFmt('html');
    else if (ext === 'sql') setInputFmt('sql');
    else setInputFmt('csv');
    const reader = new FileReader();
    reader.onload = e => setInput(e.target.result);
    reader.readAsText(file);
  };

  /* ── Copy + Download ── */
  const copyOutput = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadOutput = () => {
    const fmt = FORMATS.find(f => f.value === outputFmt);
    const blob = new Blob([output], { type: fmt?.mime || 'text/plain' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `converted.${fmt?.ext || 'txt'}` }).click();
  };

  const inputFmtObj = FORMATS.find(f => f.value === inputFmt);
  const outputFmtObj = FORMATS.find(f => f.value === outputFmt);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'Format Converter', href: '/tools/format-converter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
            <Table className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Data Format Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Convert between CSV, TSV, JSON, Markdown, HTML, and SQL table formats instantly</p>
        </div>

        {/* Format selector */}
        <div className={`${cardCls} p-5 mb-5 shadow-sm`}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Input format */}
            <div className="flex-1 w-full">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Input Format</p>
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map(f => (
                  <button key={f.value} onClick={() => setInputFmt(f.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${inputFmt === f.value ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    <span className="mr-1">{f.icon}</span>{f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap */}
            <button onClick={swapFormats} disabled={!output}
              title="Swap formats and use output as input"
              className="p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-2xl transition disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
              <ArrowLeftRight className="w-5 h-5" />
            </button>

            {/* Output format */}
            <div className="flex-1 w-full">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Output Format</p>
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map(f => (
                  <button key={f.value} onClick={() => setOutputFmt(f.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${outputFmt === f.value ? 'bg-cyan-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    <span className="mr-1">{f.icon}</span>{f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Options row */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            {(inputFmt === 'csv') && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">CSV Delimiter</label>
                <select value={delimiter} onChange={e => setDelimiter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-500 transition">
                  <option value="auto">Auto-detect</option>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value={'\t'}>Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
            )}
            {outputFmt === 'sql' && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Table Name</label>
                <input value={tableName} onChange={e => setTableName(e.target.value)} placeholder="data_table"
                  className="px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:outline-none focus:border-blue-500 transition font-mono w-36" />
              </div>
            )}
            {stats && (
              <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl">{stats.rows} rows</span>
                <span className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-xl">{stats.cols} columns</span>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span><strong>Parse error:</strong> {error}</span>
          </div>
        )}

        {/* Editor panels */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Input */}
          <div className={`${cardCls} overflow-hidden shadow-sm`}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Input <span className="text-blue-600 dark:text-blue-400">({inputFmtObj?.label})</span>
              </h2>
              <div className="flex items-center gap-2">
                <div
                  onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                  onDragLeave={() => setFileDrag(false)}
                  onDrop={e => { e.preventDefault(); setFileDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
                  onClick={() => fileRef.current?.click()}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer transition ${fileDrag ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                  <Upload className="w-3.5 h-3.5" />Upload
                </div>
                <input ref={fileRef} type="file" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                {input && (
                  <button onClick={() => { setInput(''); setOutput(''); setError(''); setStats(null); }}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition text-slate-400 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder={`Paste your ${inputFmtObj?.label} (${inputFmtObj?.desc}) data here, or upload a file…`}
              className="w-full h-[480px] p-5 bg-slate-900 font-mono text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none" />
          </div>

          {/* Output */}
          <div className={`${cardCls} overflow-hidden shadow-sm`}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Table className="w-4 h-4 text-cyan-500" />
                Output <span className="text-cyan-600 dark:text-cyan-400">({outputFmtObj?.label})</span>
              </h2>
              {output && (
                <div className="flex gap-2">
                  <button onClick={downloadOutput}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl transition">
                    <Download className="w-3.5 h-3.5" />Download
                  </button>
                  <button onClick={copyOutput}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl transition">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
            <textarea value={output} readOnly
              placeholder="Converted output will appear here automatically as you type or paste input…"
              className="w-full h-[480px] p-5 bg-slate-900 font-mono text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none cursor-default" />
          </div>
        </div>

        {/* Conversion matrix */}
        <div className={`${cardCls} p-6 mt-6 shadow-sm`}>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Supported Conversions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[420px]">
              <thead>
                <tr>
                  <th className="text-left px-3 py-2 text-slate-500 dark:text-slate-400 font-bold">From ↓ / To →</th>
                  {FORMATS.map(f => <th key={f.value} className="px-3 py-2 text-slate-700 dark:text-slate-300 font-bold">{f.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {FORMATS.map(from => (
                  <tr key={from.value} className="border-t border-slate-100 dark:border-slate-700/50">
                    <td className="px-3 py-2 font-bold text-slate-700 dark:text-slate-300">{from.label}</td>
                    {FORMATS.map(to => (
                      <td key={to.value} className="px-3 py-2 text-center">
                        {from.value === to.value ? <span className="text-slate-300 dark:text-slate-600">—</span> : <span className="text-emerald-500 font-bold">✓</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-10 space-y-5">
          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Data Format Converter — CSV, JSON, Markdown, HTML, SQL & TSV</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Working with data across different systems almost always involves switching between formats. A spreadsheet exported from Excel is a CSV file. A REST API returns JSON. A database tool expects SQL INSERT statements. A documentation site wants a Markdown table. Manually re-formatting data between these structures is tedious and error-prone — that's exactly the problem this tool solves.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit Data Format Converter handles six widely used tabular data formats: CSV (comma-separated), TSV (tab-separated), JSON (array of objects), Markdown tables, HTML tables, and SQL INSERT statements. Conversion is bidirectional — you can convert any format to any other format, in all 30 possible direction combinations. The output updates live as you type or paste input.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Everything runs in your browser. No file is uploaded to any server. Paste your data, choose the input and output formats, and copy or download the result. For CSV files, the tool auto-detects whether the delimiter is a comma, tab, semicolon, or pipe — or you can set it manually.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">All Six Formats Explained</h2>
            <div className="space-y-4">
              {[
                { fmt: 'CSV (Comma-Separated Values)', body: 'CSV is the most universally supported data interchange format. It is what spreadsheet applications (Excel, Google Sheets, LibreOffice Calc) export by default. CSV files contain rows of data where each value is separated by a comma. This tool supports proper RFC 4180 CSV parsing — quoted fields, embedded commas, embedded newlines, and escaped double-quotes all parse correctly. The delimiter auto-detection feature handles files that use semicolons (common in European locales) or tabs instead of commas.' },
                { fmt: 'TSV (Tab-Separated Values)', body: 'TSV is a simpler alternative to CSV that uses a tab character as the delimiter instead of a comma. Because tab characters almost never appear in actual data, TSV files rarely need quoted fields, making them slightly easier to process programmatically. Databases and spreadsheet tools often support TSV paste and export. This tool handles TSV as a separate format with automatic tab detection.' },
                { fmt: 'JSON (JavaScript Object Notation)', body: 'JSON is the standard data format for web APIs. The input must be a JSON array of objects, where each object represents a row and the object keys become the column headers. The output JSON uses 2-space indentation for readability. JSON conversion is particularly useful when you want to take a CSV export from a database or spreadsheet and prepare it for use in a JavaScript application or REST API.' },
                { fmt: 'Markdown Tables', body: 'Markdown table syntax is used in GitHub READMEs, documentation sites (like MkDocs and Docusaurus), note-taking apps (Notion, Obsidian), and static site generators. The converter produces properly aligned Markdown tables where column widths are padded for readability. It also parses existing Markdown tables back to other formats — useful when you want to pull data from a README file into a spreadsheet or database.' },
                { fmt: 'HTML Tables', body: 'HTML tables are the format used for embedding tabular data in web pages. The converter produces clean, semantic HTML with a <table>, <thead>, <tbody>, <th>, and <td> structure, making it easy to drop into any webpage or CMS. The HTML parser can also read existing HTML table markup and convert it to any other format — helpful when scraping table data from a webpage.' },
                { fmt: 'SQL INSERT Statements', body: 'The SQL output generates a ready-to-run series of INSERT INTO statements using a table name you specify. Each row in the data becomes one INSERT statement. String values are automatically single-quoted, and single quotes within values are escaped using the SQL standard double-single-quote method, preventing SQL injection in the generated script. This format is useful for migrating data from a spreadsheet into a database.' },
              ].map(({ fmt, body }) => (
                <div key={fmt} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{fmt}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Convert Data Formats</h2>
            <ol className="space-y-3">
              {[
                { s: 'Choose your input format', d: 'Click the input format button that matches your source data — CSV, TSV, JSON, Markdown, HTML, or SQL. The textarea label updates to show which format is expected.' },
                { s: 'Paste your data or upload a file', d: 'Paste your data directly into the input textarea, or click the Upload button and select a file. The tool automatically detects the file format based on the file extension (.csv, .tsv, .json, .md, .html, .sql).' },
                { s: 'Select the output format', d: 'Click the output format button for the format you want to convert to. The conversion happens automatically — no Convert button to press.' },
                { s: 'Configure options if needed', d: 'For CSV input, choose the delimiter (comma, semicolon, tab, or pipe) if auto-detection doesn\'t work correctly. For SQL output, enter your target table name.' },
                { s: 'Copy or download the result', d: 'Click Copy to copy the output to your clipboard, or Download to save the converted file with the correct extension (.csv, .json, .md, .html, .sql, .tsv).' },
                { s: 'Swap formats to reverse the conversion', d: 'Click the ⇆ swap button between the format selectors to flip the input and output formats and use the converted output as new input. This is useful for a multi-step conversion workflow.' },
              ].map(({ s, d }, i) => (
                <li key={s} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{s}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is my data sent to any server?', a: 'No. All parsing and conversion runs entirely in your browser using JavaScript. Your data never leaves your device.' },
                { q: 'How does the CSV delimiter auto-detection work?', a: 'The tool looks at the first line of your CSV and counts occurrences of comma, semicolon, and tab characters. Whichever appears most often is selected as the delimiter. You can override this manually if needed.' },
                { q: 'What JSON format does the tool expect?', a: 'The input must be a JSON array of objects, where each object represents one row and the keys become column headers. For example: [{"name":"Alice","age":"30"},{"name":"Bob","age":"25"}]. A single object or an array of arrays will not parse correctly.' },
                { q: 'Can I convert from HTML to CSV?', a: 'Yes. Paste the HTML containing a <table> element into the input, set input format to HTML and output to CSV. The tool extracts the table headers and data rows and produces a clean CSV.' },
                { q: 'Can I convert Markdown tables back to CSV or JSON?', a: 'Yes. This tool supports bidirectional Markdown table parsing. Paste a Markdown table (with header row and separator row) as input, set input format to Markdown, and select your desired output format.' },
                { q: 'What does the swap button do?', a: 'The ⇆ swap button flips the input and output formats and loads the current converted output as the new input. This lets you chain conversions — for example, CSV → JSON → Markdown — in a step-by-step workflow.' },
                { q: 'Does the SQL output prevent SQL injection?', a: 'The generated SQL escapes single quotes in values using the standard SQL double-single-quote escape method. This is safe for use in scripts run by a trusted administrator, but you should not dynamically insert user-provided data into SQL queries in a production application without using parameterised queries.' },
                { q: 'Can I convert TSV files from Excel?', a: 'Yes. When you copy cells from Excel and paste them, Excel uses tab characters as the delimiter. Set the input format to TSV (or CSV with Tab delimiter) and the tool will parse the pasted cells correctly.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
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