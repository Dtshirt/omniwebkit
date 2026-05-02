'use client';
import { useState, useRef, useCallback } from 'react';
import { Code, Copy, Check, Download, Settings, FileText, Upload, X, RefreshCw, Wand2, ZoomIn } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

/* ─── Toggle component ───────────────────────────────────────────────────── */
function Toggle({ checked, onChange, id }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} id={id}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-5' : 'left-0.5'}`} />
    </button>
  );
}

/* ─── Minifier logic ─────────────────────────────────────────────────────── */
function minifyHTML(html, opts) {
  let out = html;
  if (opts.removeComments) out = out.replace(/<!--[\s\S]*?-->/g, '');
  if (opts.minifyCSS) {
    out = out.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
      const mc = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/;\s*}/g, '}').replace(/{\s*/g, '{')
        .replace(/;\s*/g, ';').replace(/,\s*/g, ',').replace(/:\s*/g, ':').trim();
      return match.replace(css, mc);
    });
  }
  if (opts.minifyJS) {
    out = out.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (match, js) => {
      const mj = js.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
      return match.replace(js, mj);
    });
  }
  if (opts.removeWhitespace) {
    out = out.replace(/\s+/g, ' ');
    out = out.replace(/>\s+</g, '><');
  }
  if (opts.removeEmptyLines) out = out.replace(/^\s*[\r\n]/gm, '');
  if (opts.removeQuotes) out = out.replace(/(\w+)="([a-zA-Z0-9_-]+)"/g, '$1=$2');
  return out.trim();
}

function beautifyHTML(html, indentChar = '  ') {
  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
  let out = '';
  let level = 0;
  const pad = () => indentChar.repeat(level);

  // Split into tokens
  const tokens = html.match(/<[^>]+>|[^<]+/g) || [];
  for (const tok of tokens) {
    const trimmed = tok.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('</')) {
      level = Math.max(0, level - 1);
      out += pad() + trimmed + '\n';
    } else if (trimmed.startsWith('<') && !trimmed.startsWith('<!--')) {
      out += pad() + trimmed + '\n';
      const tag = (trimmed.match(/^<(\w+)/) || [])[1]?.toLowerCase();
      if (tag && !VOID.has(tag) && !trimmed.endsWith('/>')) level++;
    } else {
      const text = trimmed;
      if (text) out += pad() + text + '\n';
    }
  }
  return out.trim();
}

const SAMPLE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Document</title>
    <!-- Page styles -->
    <style>
        /* Reset */
        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <!-- Main content -->
    <div class="container">
        <h1>Welcome to HTML Minifier</h1>
        <p>This is a sample HTML document to test the minifier.</p>
        <ul>
            <li>Removes comments</li>
            <li>Collapses whitespace</li>
            <li>Minifies inline CSS &amp; JS</li>
        </ul>
        <script>
            // JavaScript comment
            function greet(name) {
                return 'Hello, ' + name + '!';
            }
            console.log(greet('World'));
        </script>
    </div>
</body>
</html>`;

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function HTMLMinifier() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('minify'); // 'minify' | 'beautify'
  const [copied, setCopied] = useState(false);
  const [fileDrag, setFileDrag] = useState(false);
  const [indentType, setIndentType] = useState('2spaces'); // '2spaces' | '4spaces' | 'tab'
  const [opts, setOpts] = useState({
    removeComments: true,
    removeWhitespace: true,
    removeEmptyLines: true,
    removeQuotes: false,
    minifyCSS: true,
    minifyJS: true,
  });

  const fileRef = useRef(null);

  const getIndent = () => indentType === 'tab' ? '\t' : indentType === '4spaces' ? '    ' : '  ';

  const run = useCallback((src = input, m = mode) => {
    if (!src.trim()) { setOutput(''); return; }
    if (m === 'minify') setOutput(minifyHTML(src, opts));
    else setOutput(beautifyHTML(src, getIndent()));
  }, [input, mode, opts, indentType]);

  const toggle = (key) => setOpts(p => {
    const next = { ...p, [key]: !p[key] };
    if (input.trim() && mode === 'minify') setOutput(minifyHTML(input, next));
    return next;
  });

  const handleInput = (val) => { setInput(val); run(val, mode); };
  const handleMode = (m) => { setMode(m); run(input, m); };

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => handleInput(e.target.result);
    reader.readAsText(file);
  };

  const copyOut = () => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const download = () => {
    const ext = mode === 'minify' ? 'min.html' : 'pretty.html';
    const blob = new Blob([output], { type: 'text/html' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: ext }).click();
  };

  const origSize = input.length;
  const outSize = output.length;
  const savings = origSize > 0 ? ((origSize - outSize) / origSize * 100) : 0;
  const hasOut = output.length > 0;

  const OPTS_LIST = [
    { key: 'removeComments', label: 'Remove HTML Comments', tip: 'Strips <!-- ... --> comment blocks' },
    { key: 'removeWhitespace', label: 'Collapse Whitespace', tip: 'Reduces multiple spaces/newlines to one' },
    { key: 'removeEmptyLines', label: 'Remove Empty Lines', tip: 'Deletes blank lines from the output' },
    { key: 'minifyCSS', label: 'Minify Inline CSS', tip: 'Compresses <style> block content' },
    { key: 'minifyJS', label: 'Minify Inline JS', tip: 'Compresses <script> block content' },
    { key: 'removeQuotes', label: 'Remove Safe Quotes', tip: 'Removes quotes from simple attribute values' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'HTML Minifier', href: '/tools/html-minifier' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/20">
            <Code className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">HTML Minifier & Beautifier</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Minify HTML to reduce file size, or beautify it for readability — with inline CSS & JS support</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Settings sidebar */}
          <div className="lg:col-span-1 space-y-4">

            {/* Mode */}
            <div className={`${cardCls} p-4 shadow-sm`}>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Mode</h2>
              <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 gap-0.5">
                {[{ v: 'minify', label: 'Minify', icon: ZoomIn }, { v: 'beautify', label: 'Beautify', icon: Wand2 }].map(({ v, label, icon: Icon }) => (
                  <button key={v} onClick={() => handleMode(v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition ${mode === v ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    <Icon className="w-3 h-3" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options (minify mode) */}
            {mode === 'minify' && (
              <div className={`${cardCls} p-4 shadow-sm`}>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-orange-500" />Options
                </h2>
                <div className="space-y-3">
                  {OPTS_LIST.map(({ key, label, tip }) => (
                    <div key={key} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{label}</p>
                        <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{tip}</p>
                      </div>
                      <Toggle checked={opts[key]} onChange={val => toggle(key)} id={key} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Indent options (beautify mode) */}
            {mode === 'beautify' && (
              <div className={`${cardCls} p-4 shadow-sm`}>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-orange-500" />Indent Style
                </h2>
                <div className="space-y-1.5">
                  {[{ v: '2spaces', l: '2 Spaces' }, { v: '4spaces', l: '4 Spaces' }, { v: 'tab', l: 'Tabs' }].map(({ v, l }) => (
                    <button key={v} onClick={() => setIndentType(v)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition border ${indentType === v ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            {hasOut && (
              <div className={`${cardCls} p-4 shadow-sm`}>
                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Statistics</h2>
                <div className="space-y-2">
                  {[
                    { label: 'Original', val: `${origSize.toLocaleString()} chars`, color: 'text-slate-700 dark:text-slate-300' },
                    { label: 'Output', val: `${outSize.toLocaleString()} chars`, color: 'text-slate-700 dark:text-slate-300' },
                    {
                      label: mode === 'minify' ? 'Saved' : 'Change',
                      val: `${mode === 'minify' ? '+' : ''}${savings.toFixed(1)}%`,
                      color: mode === 'minify' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-blue-600 dark:text-blue-400 font-bold'
                    },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className={color}>{val}</span>
                    </div>
                  ))}
                  {mode === 'minify' && savings > 0 && (
                    <div className="mt-2">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(savings, 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <button onClick={() => run()} disabled={!input.trim()}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {mode === 'minify' ? <><ZoomIn className="w-4 h-4" />Minify HTML</> : <><Wand2 className="w-4 h-4" />Beautify HTML</>}
              </button>
              <button onClick={() => handleInput(SAMPLE)}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500 text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />Load Sample
              </button>
              {input && (
                <button onClick={() => { setInput(''); setOutput(''); }}
                  className="w-full py-2 text-xs text-slate-400 hover:text-red-500 transition flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5" />Clear All
                </button>
              )}
            </div>
          </div>

          {/* Editor panels */}
          <div className="lg:col-span-3 space-y-4">
            {/* Input */}
            <div className={`${cardCls} overflow-hidden shadow-sm`}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-500" />HTML Input
                  <span className="text-xs text-slate-400 font-normal">({input.length.toLocaleString()} chars)</span>
                </h2>
                <div className="flex items-center gap-2">
                  <div
                    onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                    onDragLeave={() => setFileDrag(false)}
                    onDrop={e => { e.preventDefault(); setFileDrag(false); handleFile(e.dataTransfer.files?.[0]); }}
                    onClick={() => fileRef.current?.click()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition ${fileDrag ? 'bg-orange-100 dark:bg-orange-900/20 border-orange-400 text-orange-700 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                    <Upload className="w-3.5 h-3.5" />Upload
                  </div>
                  <input ref={fileRef} type="file" accept=".html,.htm,.txt" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                </div>
              </div>
              <textarea value={input} onChange={e => handleInput(e.target.value)}
                placeholder="Paste your HTML code here, or upload a .html file…"
                className="w-full h-[400px] p-5 bg-slate-900 font-mono text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none" />
            </div>

            {/* Output */}
            <div className={`${cardCls} overflow-hidden shadow-sm`}>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-500" />
                  {mode === 'minify' ? 'Minified' : 'Beautified'} Output
                  <span className="text-xs text-slate-400 font-normal">({outSize.toLocaleString()} chars)</span>
                </h2>
                {hasOut && (
                  <div className="flex gap-2">
                    <button onClick={download}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl transition">
                      <Download className="w-3.5 h-3.5" />Download
                    </button>
                    <button onClick={copyOut}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-xl transition">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
              <textarea value={output} readOnly
                placeholder={`${mode === 'minify' ? 'Minified' : 'Beautified'} HTML output will appear here…`}
                className="w-full h-[400px] p-5 bg-slate-900 font-mono text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none cursor-default" />
            </div>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-10 space-y-5">
          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online HTML Minifier & Beautifier — Compress and Format HTML Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Page load speed is one of the most important factors for both user experience and search engine ranking. Every byte that your web server sends to the browser adds to load time. One of the simplest ways to reduce your HTML file size is through minification — removing whitespace, comments, and other characters that browsers don't need but that developers use to keep their code readable.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit HTML Minifier strips unnecessary whitespace, collapses multiple spaces into one, removes HTML comments, and can also minify inline CSS within <code className="text-orange-600 dark:text-orange-400 font-mono text-sm">&lt;style&gt;</code> blocks and inline JavaScript within <code className="text-orange-600 dark:text-orange-400 font-mono text-sm">&lt;script&gt;</code> tags. All six minification options are individually toggleable, so you have full control over what gets stripped.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The tool also includes an HTML Beautifier mode — the opposite of minification. If you receive minified HTML (from a production build, a CMS export, or a web scraper) and need to read or edit it, the beautifier re-indents the markup with proper nested structure, making it human-readable again. Choose between 2-space, 4-space, or tab indentation.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">What Each Minification Option Does</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { opt: 'Remove HTML Comments', body: 'HTML comments (<!-- ... -->) are useful for developers but invisible to users and unnecessary in production. This option strips all comment blocks from the markup. Conditional comments (used for old IE) would also be removed, so only enable this if you are not targeting Internet Explorer.' },
                { opt: 'Collapse Whitespace', body: 'HTML ignores extra whitespace between tags and within text, so the spaces you add between elements for readability serve no functional purpose in the rendered output. This option reduces sequential whitespace characters (spaces, tabs, newlines) to a single space. It also removes whitespace between adjacent tags (>    < becomes ><), which is the single most effective size reduction for most HTML documents.' },
                { opt: 'Remove Empty Lines', body: 'Blank lines used for visual grouping in your source code have no effect on how the page renders. This option removes them from the output. On large HTML files with many blank lines between sections, this can reduce character count noticeably.' },
                { opt: 'Minify Inline CSS', body: 'Any CSS code inside <style> tags is also minified: CSS comments are removed, whitespace is collapsed, and redundant semicolons and spaces around colons and braces are eliminated. This is particularly useful for HTML emails or single-file HTML pages with embedded styles.' },
                { opt: 'Minify Inline JS', body: 'JavaScript inside <script> tags has its single-line comments (//) and multi-line comments (/* */) removed, and its whitespace collapsed. This is a basic minification — it does not rename variables or perform dead-code elimination like a full JS bundler would, but it still reduces character count significantly for simple scripts.' },
                { opt: 'Remove Safe Quotes', body: 'HTML5 allows attribute values to omit quotes if the value contains only letters, numbers, hyphens, and underscores. For example, class="container" can become class=container. This option applies that optimisation where it is safe to do so. Disable it if your HTML needs to be XHTML-valid.' },
              ].map(({ opt, body }) => (
                <div key={opt} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{opt}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How HTML Minification Improves Page Speed</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              When a user visits your webpage, their browser sends an HTTP request to your server. The server responds by sending the HTML document, which the browser then parses to start building the page. Every unnecessary character in that HTML adds to the time it takes to transfer the document over the network — this is the document's "transfer size."
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Google's Core Web Vitals — specifically Largest Contentful Paint (LCP) and First Contentful Paint (FCP) — are directly impacted by how quickly the browser can receive and begin parsing the HTML document. A smaller HTML file starts painting the page sooner. For pages on fast connections, the difference might be measured in milliseconds. But on slower mobile connections or emerging markets, it can meaningfully reduce time-to-interactive.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              HTML minification works alongside Gzip or Brotli compression (applied by your web server). Gzip already compresses repetitive text patterns very efficiently, which means minification provides less additional benefit for files that are already Gzip-compressed — but it still helps. Minification reduces the size before compression, and the resulting compressed file is also smaller.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              For static sites, HTML files should be minified as part of the build process using tools like gulp-htmlmin, html-minifier-terser, or the built-in minification of frameworks like Next.js. This tool is ideal for one-off minification, quick testing, or when you need to minify HTML that isn't part of an automated build pipeline.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Does HTML minification change how the page looks or behaves?', a: 'No, when done correctly. HTML minification removes characters that the browser ignores — whitespace between tags, comments, and redundant spaces. The page renders identically because browsers normalise whitespace when displaying text content. The only option that can potentially affect rendering is Remove Safe Quotes, which should only be enabled for HTML5 documents.' },
                { q: 'What about whitespace in <pre> and <textarea> tags?', a: 'The whitespace-collapsing option in this tool applies a global regex and does not specifically protect <pre> or <textarea> blocks. If your HTML contains these elements with meaningful whitespace content, disable the Collapse Whitespace option to preserve them. Production minifiers like html-minifier-terser handle this case with more sophisticated AST-based parsing.' },
                { q: 'Should I minify HTML if my server already uses Gzip compression?', a: 'Both help, but they work differently. Gzip compresses the file at transfer time. Minification reduces the original file size. When combined, you get smaller file sizes both before and after compression. However, the added benefit of minification over Gzip alone is smaller than minification alone — typically an additional 2–5% savings on top of Gzip.' },
                { q: 'Is my HTML code sent to any server?', a: 'No. All minification and beautification runs entirely in your browser using JavaScript. Your HTML code never leaves your device.' },
                { q: 'What is the Beautify mode for?', a: 'Beautify mode does the opposite of minification — it re-indents and formats a minified or poorly-formatted HTML document to make it readable. This is useful when working with production-built HTML, receiving HTML from a CMS, or reading the source of a website whose HTML is minified.' },
                { q: 'Can this tool minify large HTML files?', a: 'The tool handles files of any size that your browser can hold in memory. For very large files (several megabytes), processing may take a second or two. For production use with large files, a build-tool integration (Node.js, Webpack plugin, Vite plugin) is more appropriate.' },
                { q: 'Does inline JS minification handle ES6+ syntax?', a: 'The inline JS minification in this tool is basic — it removes comments and collapses whitespace. It does not parse the JavaScript AST or rename variables, so it works correctly with all JS syntax including ES6+. The result is not as compactly minified as what Terser or UglifyJS would produce, but it is safe and correct.' },
                { q: 'What is the Remove Safe Quotes option?', a: 'HTML5 allows omitting quotes around attribute values that contain only alphanumeric characters, hyphens, and underscores. So class="container" can be written as class=container. This saves a few characters per attribute. It is safe for HTML5 documents but would make the markup invalid XHTML.' },
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