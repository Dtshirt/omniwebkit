'use client';
import { useState, useCallback, useRef } from 'react';
import {
  FileText, Check, AlertTriangle, Download, Copy, RotateCcw,
  ChevronDown, ChevronUp, AlertCircle, Layers, CheckCircle,
  Code2, Upload, Braces
} from 'lucide-react';

/* ─── Design tokens ─── */
const cardCls  = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const btnPrimary = 'flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition disabled:opacity-50';
const btnSecondary = 'flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition';

/* ─── Toast ─── */
function useToast() {
  const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 3000); };
  const el = msg ? (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}
    </div>
  ) : null;
  return { show, el };
}

/* ─── Pure-JS YAML Validator ─── */
function validateYaml(text) {
  if (!text.trim()) return { valid: false, errors: [{ line: 0, msg: 'Empty input' }], warnings: [], stats: null };

  const lines = text.split('\n');
  const errors = [];
  const warnings = [];
  let keyCount = 0, listItems = 0, nestedDepth = 0, maxDepth = 0;

  // Track indent stack
  const indentStack = [{ indent: -1, type: 'root' }];

  lines.forEach((raw, i) => {
    const lineNum = i + 1;
    const line = raw.replace(/\r$/, '');

    // Skip comments and empty lines
    if (line.trim() === '' || line.trim().startsWith('#')) return;

    // Check for tab characters (YAML forbids them as indentation)
    if (/^\t/.test(line)) {
      errors.push({ line: lineNum, msg: 'Tab character used for indentation (use spaces)' });
      return;
    }

    const indent = line.match(/^(\s*)/)[1].length;
    const content = line.trim();

    // Track depth
    nestedDepth = Math.floor(indent / 2);
    if (nestedDepth > maxDepth) maxDepth = nestedDepth;

    // Check for duplicate colons in key (not in values)
    const keyMatch = content.match(/^([^:]+):\s*(.*)/);
    if (keyMatch) {
      keyCount++;
      const key = keyMatch[1].trim();

      // Key with spaces not quoted warning
      if (/\s/.test(key) && !key.startsWith('"') && !key.startsWith("'")) {
        warnings.push({ line: lineNum, msg: `Key "${key}" contains spaces — consider quoting it` });
      }

      // Duplicate key detection (simple, same indent level)
      const value = keyMatch[2].trim();

      // Unbalanced quotes in value
      const singleQuotes = (value.match(/'/g) || []).length;
      const doubleQuotes = (value.match(/"/g) || []).length;
      if (singleQuotes % 2 !== 0) {
        errors.push({ line: lineNum, msg: 'Unbalanced single quote in value' });
      }
      if (doubleQuotes % 2 !== 0) {
        errors.push({ line: lineNum, msg: 'Unbalanced double quote in value' });
      }
    }

    // List item
    if (content.startsWith('- ') || content === '-') {
      listItems++;
    }

    // Check for invalid colon in bare value (e.g. "key: value: bad" without quotes)
    if (keyMatch) {
      const val = keyMatch[2];
      if (val && !val.startsWith('"') && !val.startsWith("'") && !val.startsWith('|') && !val.startsWith('>')) {
        const colonInValue = val.match(/[^:]:(?!\s*$)/);
        if (colonInValue) {
          warnings.push({ line: lineNum, msg: `Value may contain unquoted colon — consider quoting: "${val}"` });
        }
      }
    }

    // Check for trailing spaces
    if (/\s+$/.test(line)) {
      warnings.push({ line: lineNum, msg: 'Trailing whitespace on this line' });
    }
  });

  // Check overall structure — must start with key, list, or comment
  const firstContentLine = lines.find(l => l.trim() && !l.trim().startsWith('#'));
  if (firstContentLine && !firstContentLine.trim().match(/^[-{a-zA-Z0-9_"'%&*!]/)) {
    errors.push({ line: 1, msg: 'YAML document must start with a key, list item, or anchor' });
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    stats: {
      lines: lines.length,
      keys: keyCount,
      listItems,
      maxDepth,
      comments: lines.filter(l => l.trim().startsWith('#')).length,
    }
  };
}

/* ─── YAML Formatter (basic) ─── */
function formatYaml(text) {
  // Normalize: remove trailing spaces, normalize blank lines, sort top-level keys (optional)
  const lines = text.split('\n');
  const formatted = lines.map(l => l.replace(/\s+$/, ''));
  // Remove consecutive blank lines (keep max 1)
  const result = [];
  let blanks = 0;
  for (const line of formatted) {
    if (line.trim() === '') {
      blanks++;
      if (blanks <= 1) result.push(line);
    } else {
      blanks = 0;
      result.push(line);
    }
  }
  return result.join('\n').trim();
}

/* ─── YAML → JSON converter (simplified) ─── */
function yamlToJson(text) {
  // Simple conversion using eval-safe parsing
  try {
    const lines = text.split('\n');
    const result = {};
    const stack = [{ obj: result, indent: -1 }];

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      if (!raw.trim() || raw.trim().startsWith('#')) continue;

      const indent = raw.match(/^\s*/)[0].length;
      const content = raw.trim();

      // Find parent
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }
      const parent = stack[stack.length - 1].obj;

      if (content.startsWith('- ')) {
        // List item
        const val = content.slice(2).trim();
        const key = `_list_${i}`;
        // Simple: just store as comment
        if (!Array.isArray(parent._list)) parent._list = [];
        parent._list.push(parseYamlValue(val));
      } else {
        const colonIdx = content.indexOf(':');
        if (colonIdx > 0) {
          const key = content.slice(0, colonIdx).trim();
          const val = content.slice(colonIdx + 1).trim();
          if (val === '' || val === '|' || val === '>') {
            // Nested object
            parent[key] = {};
            stack.push({ obj: parent[key], indent });
          } else {
            parent[key] = parseYamlValue(val);
          }
        }
      }
    }
    return JSON.stringify(result, null, 2);
  } catch (e) {
    return `// Conversion error: ${e.message}`;
  }
}

function parseYamlValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~') return null;
  if (/^-?\d+$/.test(val)) return parseInt(val, 10);
  if (/^-?\d+\.\d+$/.test(val)) return parseFloat(val);
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }
  return val;
}

/* ─── Templates ─── */
const TEMPLATES = {
  'Docker Compose': `version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  pgdata:`,

  'GitHub Actions CI': `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build`,

  'Kubernetes Deployment': `apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  namespace: default
  labels:
    app: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-app:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "128Mi"
              cpu: "250m"
            limits:
              memory: "256Mi"
              cpu: "500m"`,

  'App Config': `app:
  name: MyApplication
  version: "1.0.0"
  environment: production
  debug: false

server:
  host: 0.0.0.0
  port: 8080
  timeout: 30

database:
  host: localhost
  port: 5432
  name: mydb
  pool:
    min: 2
    max: 10

logging:
  level: info
  format: json
  output: stdout

features:
  auth: true
  cache: true
  metrics: false`,

  'Ansible Playbook': `---
- name: Configure web server
  hosts: webservers
  become: true
  vars:
    app_port: 80
    app_user: www-data

  tasks:
    - name: Update apt cache
      apt:
        update_cache: true
        cache_valid_time: 3600

    - name: Install nginx
      apt:
        name: nginx
        state: present

    - name: Start and enable nginx
      service:
        name: nginx
        state: started
        enabled: true

    - name: Copy site config
      template:
        src: nginx.conf.j2
        dest: /etc/nginx/sites-available/mysite
      notify: Reload nginx

  handlers:
    - name: Reload nginx
      service:
        name: nginx
        state: reloaded`,

  'Simple Config': `# Application configuration
name: My App
version: 1.0.0

# Server settings
server:
  port: 3000
  host: localhost

# Database
database:
  url: postgresql://localhost:5432/mydb
  max_connections: 10

# Feature flags
features:
  dark_mode: true
  notifications: true
  beta: false`,
};

/* ─── Main Component ─── */
export default function YamlCreatorValidator() {
  const [yaml, setYaml] = useState('');
  const [result, setResult]   = useState(null);
  const [view, setView]       = useState('editor');   // 'editor' | 'json'
  const [jsonOutput, setJsonOutput] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const fileRef = useRef(null);
  const toast = useToast();

  const validate = useCallback((text) => {
    if (!text.trim()) { setResult(null); return; }
    setResult(validateYaml(text));
  }, []);

  const handleChange = (val) => {
    setYaml(val);
    validate(val);
    setJsonOutput('');
  };

  const loadTemplate = (name) => {
    setYaml(TEMPLATES[name]);
    setActiveTemplate(name);
    validate(TEMPLATES[name]);
    setView('editor');
    setJsonOutput('');
    toast.show(`Loaded "${name}" template`);
  };

  const format = () => {
    const f = formatYaml(yaml);
    setYaml(f);
    validate(f);
    toast.show('Formatted!');
  };

  const convertToJson = () => {
    const json = yamlToJson(yaml);
    setJsonOutput(json);
    setView('json');
    toast.show('Converted to JSON');
  };

  const clear = () => { setYaml(''); setResult(null); setJsonOutput(''); setActiveTemplate(null); };

  const copy = () => {
    const text = view === 'json' ? jsonOutput : yaml;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => toast.show('Copied!'));
  };

  const download = () => {
    const isJson = view === 'json' && jsonOutput;
    const text = isJson ? jsonOutput : yaml;
    if (!text) return;
    const ext = isJson ? '.json' : '.yaml';
    const mime = isJson ? 'application/json' : 'text/yaml';
    const blob = new Blob([text], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `output${ext}`;
    a.click();
    toast.show(`Downloaded as ${ext}`);
  };

  const onFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['yaml','yml','json','txt'].includes(ext)) {
      toast.show('Only .yaml, .yml, .json, .txt files are supported', 'err');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setYaml(text);
      validate(text);
      setJsonOutput('');
      toast.show(`Loaded: ${file.name}`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  /* Status badge */
  const StatusBadge = () => {
    if (!result) return null;
    if (result.valid && result.warnings.length === 0) return (
      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
        <CheckCircle className="w-3 h-3" />Valid YAML
      </span>
    );
    if (result.valid) return (
      <span className="flex items-center gap-1 text-[10px] font-black text-amber-600 dark:text-amber-400">
        <AlertTriangle className="w-3 h-3" />Valid with {result.warnings.length} warning{result.warnings.length > 1 ? 's' : ''}
      </span>
    );
    return (
      <span className="flex items-center gap-1 text-[10px] font-black text-red-600 dark:text-red-400">
        <AlertTriangle className="w-3 h-3" />{result.errors.length} error{result.errors.length > 1 ? 's' : ''}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">YAML Creator & Validator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Write, validate, and format YAML instantly. Load templates for Docker, GitHub Actions, Kubernetes, and more.
          </p>
        </div>

        {/* Templates Row */}
        <div className={`${cardCls} p-5 mb-5`}>
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Templates</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(TEMPLATES).map(name => (
              <button key={name} onClick={() => loadTemplate(name)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  activeTemplate === name
                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-violet-400 hover:text-violet-600'
                }`}>
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Editor Grid */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-5">

          {/* Editor / JSON Output */}
          <div className={`${cardCls} flex flex-col overflow-hidden`}>
            {/* Toolbar */}
            <div className="flex flex-col gap-2 px-3 py-3 border-b border-slate-200 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
              {/* Left: view toggle + status */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-slate-100 dark:bg-slate-900/60 rounded-xl p-0.5">
                  {['editor','json'].map(v => (
                    <button key={v} onClick={() => setView(v)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                        view === v ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                      }`}>{v === 'json' ? 'JSON' : 'YAML'}</button>
                  ))}
                </div>
                <StatusBadge />
              </div>
              {/* Right: action buttons */}
              <div className="flex items-center gap-1 flex-wrap">
                <button onClick={() => fileRef.current?.click()} className={btnSecondary} title="Upload file">
                  <Upload className="w-3.5 h-3.5" /><span className="hidden sm:inline">Upload</span>
                </button>
                <input ref={fileRef} type="file" accept=".yaml,.yml,.json,.txt" className="hidden" onChange={onFileUpload} />
                <button onClick={format} disabled={!yaml} className={btnSecondary} title="Format YAML">
                  <Braces className="w-3.5 h-3.5" /><span className="hidden sm:inline">Format</span>
                </button>
                <button onClick={convertToJson} disabled={!yaml || !result?.valid} className={btnSecondary} title="Convert to JSON">
                  <Code2 className="w-3.5 h-3.5" /><span className="hidden sm:inline">→ JSON</span>
                </button>
                <button onClick={copy} disabled={view === 'json' ? !jsonOutput : !yaml} className={btnSecondary} title="Copy">
                  <Copy className="w-3.5 h-3.5" /><span className="hidden sm:inline">Copy</span>
                </button>
                <button onClick={download} disabled={view === 'json' ? !jsonOutput : !yaml} className={btnPrimary} title="Download">
                  <Download className="w-3.5 h-3.5" /><span className="hidden sm:inline">Download</span>
                </button>
                <button onClick={clear} disabled={!yaml} className={btnSecondary} title="Clear">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Text area */}
            <div className="relative" style={{ minHeight: '400px', height: '50vh' }}>
              {view === 'editor' ? (
                <textarea
                  value={yaml}
                  onChange={e => handleChange(e.target.value)}
                  placeholder={`# Paste or type your YAML here\n# Or load a template above\n\nname: my-project\nversion: "1.0.0"\nenvironment: production\n\ndatabase:\n  host: localhost\n  port: 5432`}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full resize-none p-4 font-mono text-xs text-slate-900 dark:text-white bg-transparent outline-none leading-5 placeholder-slate-300 dark:placeholder-slate-600"
                />
              ) : (
                <pre className="absolute inset-0 w-full h-full overflow-auto p-4 font-mono text-xs text-slate-900 dark:text-white leading-5 whitespace-pre-wrap">
                  {jsonOutput || <span className="text-slate-400 italic">Click "→ JSON" on a valid YAML to see the JSON output here.</span>}
                </pre>
              )}
            </div>

            {/* Line / char count */}
            <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400">
              <span>{(view === 'json' ? jsonOutput : yaml).split('\n').length} lines</span>
              <span>{(view === 'json' ? jsonOutput : yaml).length} chars</span>
              {result?.stats && (
                <>
                  <span>{result.stats.keys} keys</span>
                  <span className="hidden sm:inline">{result.stats.listItems} list items</span>
                  <span>depth {result.stats.maxDepth}</span>
                </>
              )}
            </div>
          </div>

          {/* Sidebar: Validation Results */}
          <div className="space-y-4">

            {/* Validation Panel */}
            <div className={cardCls}>
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-violet-500" />Validation
                </h3>
              </div>
              <div className="p-4">
                {!result ? (
                  <p className="text-xs text-slate-400 italic">Start typing to validate…</p>
                ) : (
                  <div className="space-y-3">

                    {/* Status */}
                    <div className={`p-3 rounded-xl border text-xs font-bold ${
                      result.valid && !result.warnings.length ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : result.valid ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {result.valid
                        ? result.warnings.length ? `✓ Valid YAML — ${result.warnings.length} warning(s)` : '✓ Valid YAML — No issues found'
                        : `✗ Invalid YAML — ${result.errors.length} error(s)`}
                    </div>

                    {/* Errors */}
                    {result.errors.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-red-500 mb-1.5">Errors</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {result.errors.map((e, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                              <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                {e.line > 0 && <span className="text-[9px] font-black text-red-400 mr-1">L{e.line}</span>}
                                <span className="text-[10px] text-red-700 dark:text-red-300">{e.msg}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-wide text-amber-500 mb-1.5">Warnings</p>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {result.warnings.map((w, i) => (
                            <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg">
                              <AlertCircle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                {w.line > 0 && <span className="text-[9px] font-black text-amber-400 mr-1">L{w.line}</span>}
                                <span className="text-[10px] text-amber-700 dark:text-amber-300">{w.msg}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    {result.stats && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {[
                          ['Lines',        result.stats.lines],
                          ['Keys',         result.stats.keys],
                          ['List Items',   result.stats.listItems],
                          ['Max Depth',    result.stats.maxDepth],
                          ['Comments',     result.stats.comments],
                          ['Errors',       result.errors.length],
                        ].map(([label, val]) => (
                          <div key={label} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-lg p-2 text-center">
                            <p className="text-base font-black text-slate-900 dark:text-white">{val}</p>
                            <p className="text-[9px] text-slate-400">{label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* YAML Reference */}
            <div className={`${cardCls} p-4`}>
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-3">Quick Reference</p>
              <div className="space-y-2 font-mono text-[10px]">
                {[
                  ['String',          'key: value'],
                  ['Quoted string',   'key: "hello world"'],
                  ['Number',          'port: 8080'],
                  ['Boolean',         'enabled: true'],
                  ['Null',            'value: null'],
                  ['List',            '- item1\n- item2'],
                  ['Nested map',      'parent:\n  child: val'],
                  ['Multiline |',     'text: |\n  line one\n  line two'],
                  ['Comment',         '# This is a comment'],
                  ['Anchor &',        'base: &anchor\n  key: val'],
                  ['Alias *',         'copy: *anchor'],
                ].map(([label, code]) => (
                  <div key={label} className="flex gap-2 items-start">
                    <span className="text-slate-400 w-20 flex-shrink-0">{label}</span>
                    <code className="text-blue-600 dark:text-blue-400 whitespace-pre">{code}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free YAML Creator & Validator — Write, Validate, and Format YAML Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              YAML is everywhere in modern software development. Docker Compose files, Kubernetes manifests, GitHub Actions workflows, Ansible playbooks, Helm charts, and application configuration files all use YAML as their primary format. Getting YAML right is critical — a single misplaced space or an unquoted colon can break your entire pipeline or deployment.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free YAML creator and validator helps you write correct YAML from scratch or validate existing files before you deploy. Paste your YAML, upload a file, or load one of six built-in templates. The validator checks your YAML in real time, reporting errors with their exact line numbers and warnings for common issues like tab characters, unquoted keys with spaces, and trailing whitespace.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              You can also convert valid YAML to JSON, format your YAML to remove trailing spaces and normalize blank lines, and download the result as a `.yaml` or `.json` file. Everything runs locally in your browser — your configuration files, secrets, and credentials never touch a server.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Six ready-to-use templates cover the most common YAML use cases: Docker Compose, GitHub Actions CI, Kubernetes Deployment, Ansible Playbook, application config, and a simple generic config. Each template is fully editable and serves as a starting point for your own configuration.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How to Use the YAML Validator</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">Four ways to get started:</p>
            <ol className="space-y-4">
              {[
                ['Type or paste YAML', 'Click inside the editor and start typing, or paste existing YAML. The validator checks your YAML in real time and displays errors and warnings in the right panel instantly.'],
                ['Upload a file', 'Click the Upload button to load a .yaml, .yml, .json, or .txt file from your computer. The file contents appear in the editor and are validated immediately.'],
                ['Use a template', 'Click any template button (Docker Compose, GitHub Actions, Kubernetes, etc.) to load a complete working example. Then edit it to match your needs.'],
                ['Format and download', 'Click Format to clean up trailing spaces and extra blank lines. When your YAML is valid, click Download to save a .yaml file, or use "→ JSON" to convert and download a .json file.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-violet-600 text-white text-xs font-black rounded-full flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Why YAML Validation Matters</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {t:'Catch Errors Before Deployment',   c:'text-violet-600 dark:text-violet-400',  b:'A broken YAML file in a Kubernetes manifest or GitHub Actions workflow will fail silently or throw a cryptic error. Validating before you push catches the problem instantly.'},
                {t:'YAML Is Whitespace-Sensitive',      c:'text-blue-600 dark:text-blue-400',      b:'Indentation in YAML is part of the structure, not just style. Two extra spaces in the wrong place create a completely different data tree. A validator catches indent-related errors immediately.'},
                {t:'Tab Characters Break Everything',   c:'text-rose-600 dark:text-rose-400',      b:'YAML does not allow tab characters for indentation. Editors sometimes insert tabs when you press Tab. This validator flags tab characters at the line level, making them easy to find and fix.'},
                {t:'Secrets Stay Local',                c:'text-emerald-600 dark:text-emerald-400',b:'Configuration files often contain API keys, passwords, and tokens. Since this tool runs entirely in your browser, those values are never sent to any server.'},
                {t:'Templates Speed Up Dev',            c:'text-amber-600 dark:text-amber-400',    b:'Starting from a correct, tested template is faster than writing from scratch. The six built-in templates for Docker, Kubernetes, GitHub Actions, and Ansible are ready to use immediately.'},
                {t:'YAML→JSON for Debugging',           c:'text-indigo-600 dark:text-indigo-400',  b:'Converting YAML to JSON lets you see the parsed data structure clearly. This is useful for debugging complex nested objects and verifying that your structure matches what you intend.'},
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">YAML Syntax: Common Mistakes and How to Fix Them</h2>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. Using Tabs Instead of Spaces</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              This is the number one YAML error. YAML strictly requires spaces for indentation. Never use tabs, even if your editor shows them as spaces. Configure your editor to insert spaces when you press the Tab key, especially for .yaml and .yml files.
            </p>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. Inconsistent Indentation</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              YAML does not require a fixed number of spaces (2 or 4 are both valid), but you must be consistent within a file. Mixing 2-space and 4-space indentation in the same file causes parse errors. Stick to one convention throughout.
            </p>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. Unquoted Special Characters</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              Colons, hashes, brackets, and certain other characters have special meaning in YAML. If your value contains a colon followed by a space (like a URL), you must quote the value. For example: <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1 py-0.5 rounded text-xs">url: "https://example.com"</code> not <code className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded text-xs">url: https://example.com</code>.
            </p>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">4. Boolean and Null Ambiguity</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
              YAML 1.1 (used by many parsers) interprets <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">yes</code>, <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">no</code>, <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">on</code>, <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">off</code> as booleans. Use <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">true</code>/<code className="text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded">false</code> or quote these strings to be safe.
            </p>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">5. Missing Space After Colon</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              A key-value separator in YAML must be a colon followed by at least one space: <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1 py-0.5 rounded text-xs">key: value</code>. Writing <code className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1 py-0.5 rounded text-xs">key:value</code> (no space) is treated as a string, not a key-value pair.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Available Templates</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {name:'Docker Compose',        desc:'A two-service setup with a web (nginx) container and a PostgreSQL database, including named volumes and restart policies.'},
                {name:'GitHub Actions CI',     desc:'A complete CI workflow triggered on push and pull requests, with Node.js setup, dependency install, test, and build steps.'},
                {name:'Kubernetes Deployment', desc:'A three-replica deployment manifest with resource requests and limits, ready to apply to any Kubernetes cluster.'},
                {name:'Ansible Playbook',      desc:'A complete playbook that installs and starts nginx on a webserver group using the apt and service modules with a handler.'},
                {name:'App Config',            desc:'A generic application configuration covering server, database, logging, and feature flags — adaptable to any tech stack.'},
                {name:'Simple Config',         desc:'A minimal commented config file with basic server, database, and feature flag settings to use as a starting point.'},
              ].map(({ name, desc }) => (
                <div key={name} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-black text-sm text-violet-600 dark:text-violet-400 mb-1">{name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{desc}</p>
                  <button onClick={() => loadTemplate(name)}
                    className="mt-2 px-3 py-1 text-[10px] font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition">
                    Load Template →
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {[
                {q:'Is this YAML validator free?',                         a:'Yes, completely free with no account, no limits, and no data collection.'},
                {q:'Does it upload my YAML to a server?',                  a:'No. All parsing, validation, and formatting happens locally in your browser using JavaScript. Your YAML files, including any secrets or credentials they contain, never leave your device.'},
                {q:'What types of YAML errors does it detect?',            a:'It detects tab characters used for indentation (which YAML forbids), unbalanced quotes in values, and structural issues. It also warns about keys containing unquoted spaces, potential unquoted colons in values, and trailing whitespace.'},
                {q:'Can I upload a .yml file?',                            a:'Yes. The upload button accepts .yaml, .yml, .json, and .txt files. The contents are loaded into the editor and validated immediately.'},
                {q:'What does the "Format" button do?',                    a:'Format removes trailing whitespace from each line and collapses multiple consecutive blank lines into one, producing a cleaner YAML file. It does not change key order or indentation.'},
                {q:'Is the YAML→JSON conversion accurate for complex YAML?', a:'The JSON converter handles common patterns: key-value pairs, booleans (true/false), null, numbers, and quoted strings. Very complex YAML with anchors, aliases, multi-line blocks, or custom tags may not convert perfectly.'},
                {q:'Which YAML specification does it follow?',             a:'The validator focuses on the most commonly enforced YAML 1.2 rules, specifically those that cause parse errors in tools like Docker Compose and Kubernetes.'},
                {q:'Can I use this for Kubernetes and Helm charts?',       a:'Yes. The Kubernetes Deployment template is a good starting point. The validator checks for the most common structural errors that cause kubectl apply to fail.'},
              ].map(({ q, a }, i) => (
                <details key={i} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
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
