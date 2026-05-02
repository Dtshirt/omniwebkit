'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Code2, Download, Palette, RefreshCw, Zap, ChevronDown } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'php',
  'ruby', 'go', 'rust', 'html', 'css', 'sql', 'bash', 'json', 'xml', 'yaml', 'markdown',
  'swift', 'kotlin', 'scala', 'r', 'perl', 'lua',
];

const THEMES = [
  { value: 'atom-one-dark', label: 'Atom One Dark', dark: true },
  { value: 'github', label: 'GitHub Light', dark: false },
  { value: 'monokai', label: 'Monokai', dark: true },
  { value: 'vs', label: 'Visual Studio', dark: false },
  { value: 'dracula', label: 'Dracula', dark: true },
  { value: 'nord', label: 'Nord', dark: true },
  { value: 'tokyo-night-dark', label: 'Tokyo Night', dark: true },
  { value: 'github-dark', label: 'GitHub Dark', dark: true },
];

const EXAMPLES = {
  javascript: `function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconst result = fibonacci(10);\nconsole.log(\`Fibonacci(10) = \${result}\`);`,
  typescript: `interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nasync function fetchUser(id: number): Promise<User> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  return res.json();\n}\n\nfetchUser(1).then(user => console.log(user.name));`,
  python: `def quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left   = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right  = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)\n\nprint(quick_sort([3, 6, 8, 10, 1, 2, 1]))`,
  java: `public class BinarySearch {\n    public static int search(int[] arr, int target) {\n        int left = 0, right = arr.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (arr[mid] == target) return mid;\n            if (arr[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n}`,
  html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Example Page</title>\n</head>\n<body>\n  <h1>Hello World!</h1>\n  <p>This is a sample HTML document.</p>\n</body>\n</html>`,
  css: `.card {\n  background: white;\n  border-radius: 12px;\n  padding: 1.5rem;\n  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n  transition: transform 0.2s ease;\n}\n\n.card:hover {\n  transform: translateY(-4px);\n}`,
};

const getThemeCSS = (theme) => ({
  'atom-one-dark': 'pre { background:#282c34; color:#abb2bf; } .hljs-keyword{color:#c678dd} .hljs-string{color:#98c379} .hljs-number{color:#d19a66} .hljs-comment{color:#5c6370;font-style:italic} .hljs-function .hljs-title{color:#61afef} .hljs-variable,.hljs-attr{color:#e06c75}',
  'github': 'pre { background:#f6f8fa; color:#24292e; } .hljs-keyword{color:#d73a49} .hljs-string{color:#032f62} .hljs-number{color:#005cc5} .hljs-comment{color:#6a737d} .hljs-function .hljs-title{color:#6f42c1}',
  'monokai': 'pre { background:#272822; color:#f8f8f2; } .hljs-keyword{color:#f92672} .hljs-string{color:#e6db74} .hljs-number{color:#ae81ff} .hljs-comment{color:#75715e} .hljs-function .hljs-title{color:#a6e22e}',
  'vs': 'pre { background:#ffffff; color:#000000; } .hljs-keyword{color:#0000ff} .hljs-string{color:#a31515} .hljs-number{color:#098658} .hljs-comment{color:#008000} .hljs-function .hljs-title{color:#795e26}',
  'dracula': 'pre { background:#282a36; color:#f8f8f2; } .hljs-keyword{color:#ff79c6} .hljs-string{color:#f1fa8c} .hljs-number{color:#bd93f9} .hljs-comment{color:#6272a4} .hljs-function .hljs-title{color:#50fa7b}',
  'nord': 'pre { background:#2e3440; color:#d8dee9; } .hljs-keyword{color:#81a1c1} .hljs-string{color:#a3be8c} .hljs-number{color:#b48ead} .hljs-comment{color:#616e88} .hljs-function .hljs-title{color:#88c0d0}',
  'tokyo-night-dark': 'pre { background:#1a1b26; color:#a9b1d6; } .hljs-keyword{color:#bb9af7} .hljs-string{color:#9ece6a} .hljs-number{color:#ff9e64} .hljs-comment{color:#565f89} .hljs-function .hljs-title{color:#7aa2f7}',
  'github-dark': 'pre { background:#0d1117; color:#c9d1d9; } .hljs-keyword{color:#ff7b72} .hljs-string{color:#a5d6ff} .hljs-number{color:#79c0ff} .hljs-comment{color:#8b949e} .hljs-function .hljs-title{color:#d2a8ff}',
})[theme] || '';

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

export default function CodeHighlighter() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('atom-one-dark');
  const [highlightedHTML, setHighlightedHTML] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedHTML, setCopiedHTML] = useState(false);
  const [hljsReady, setHljsReady] = useState(false);
  const [lineNumbers, setLineNumbers] = useState(true);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);

  // Load hljs
  useEffect(() => {
    if (window.hljs) { setHljsReady(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.async = true;
    script.onload = () => setHljsReady(true);
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch { } };
  }, []);

  // Update hljs theme stylesheet
  useEffect(() => {
    let link = document.getElementById('hljs-theme');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.id = 'hljs-theme';
      document.head.appendChild(link);
    }
    link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`;
  }, [theme]);

  // Highlight whenever code / language / theme changes
  const doHighlight = useCallback(() => {
    if (!code.trim() || !hljsReady || !window.hljs) { setHighlightedHTML(''); return; }
    try {
      const { value } = window.hljs.highlight(code, { language, ignoreIllegals: true });
      const css = getThemeCSS(theme);
      setHighlightedHTML(`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <style>\n${css}\n  pre { margin:0; padding:20px; border-radius:8px; overflow-x:auto; font-family:'Fira Code','Courier New',monospace; font-size:14px; line-height:1.7; }\n  </style>\n</head>\n<body><pre><code class="language-${language}">${value}</code></pre></body>\n</html>`);
    } catch { setHighlightedHTML(''); }
  }, [code, language, theme, hljsReady]);

  useEffect(() => { doHighlight(); }, [doHighlight]);

  useEffect(() => {
    setCharCount(code.length);
    setLineCount(code ? code.split('\n').length : 0);
  }, [code]);

  const loadExample = () => setCode(EXAMPLES[language] || EXAMPLES.javascript);
  const clearCode = () => { setCode(''); setHighlightedHTML(''); };

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => { setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); });
  };
  const copyHTML = () => {
    navigator.clipboard.writeText(highlightedHTML).then(() => { setCopiedHTML(true); setTimeout(() => setCopiedHTML(false), 2000); });
  };
  const downloadHTML = () => {
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([highlightedHTML], { type: 'text/html' })), download: `highlighted-${language}-${Date.now()}.html` });
    a.click(); URL.revokeObjectURL(a.href);
  };

  const livePreviewLines = (() => {
    if (!code.trim() || !hljsReady || !window.hljs) return null;
    try { return window.hljs.highlight(code, { language, ignoreIllegals: true }).value; } catch { return null; }
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'Code Highlighter', href: '/tools/code-highlighter' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Code Syntax Highlighter</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Paste code and get beautiful syntax-highlighted HTML instantly. Supports 24 languages, 8 themes, and exports a standalone HTML file.
          </p>
        </div>

        {/* Controls bar */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="col-span-2 sm:col-span-1 lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Language</label>
              <div className="relative">
                <select value={language} onChange={e => setLanguage(e.target.value)} className={inputCls}>
                  {LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                <Palette className="w-3.5 h-3.5 inline mr-1" />Theme
              </label>
              <select value={theme} onChange={e => setTheme(e.target.value)} className={inputCls}>
                {THEMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={loadExample} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm shadow-indigo-500/20">
                <Zap className="w-3.5 h-3.5" /> Example
              </button>
            </div>
            <div className="flex items-end">
              <button onClick={clearCode} className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold transition">
                <RefreshCw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 w-full px-3 py-2 cursor-pointer select-none">
                <div
                  onClick={() => setLineNumbers(v => !v)}
                  className={`relative w-9 h-5 rounded-full transition flex-shrink-0 ${lineNumbers ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${lineNumbers ? 'translate-x-4' : ''}`} />
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Lines</span>
              </label>
            </div>
          </div>
          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-xs text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-300">{charCount}</strong> characters</span>
            <span className="text-xs text-slate-500 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-300">{lineCount}</strong> lines</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${hljsReady ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
              {hljsReady ? '● Ready' : '○ Loading hljs…'}
            </span>
          </div>
        </div>

        {/* Editor + Preview */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Input */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Input Code</h2>
              {code && (
                <button onClick={copyCode} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${copiedCode ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                  {copiedCode ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                </button>
              )}
            </div>
            <div className="flex flex-1">
              {lineNumbers && code && (
                <div className="select-none text-right pr-3 pl-3 py-4 bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-400 dark:text-slate-600 leading-6">
                  {code.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                </div>
              )}
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="Paste your code here… results update live as you type."
                className="flex-1 h-80 p-4 bg-white dark:bg-slate-800 font-mono text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 resize-none outline-none leading-6"
                spellCheck="false"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Preview</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">{THEMES.find(t => t.value === theme)?.label}</span>
                <span className={`w-2 h-2 rounded-full ${THEMES.find(t => t.value === theme)?.dark ? 'bg-slate-700' : 'bg-amber-400'}`} />
              </div>
            </div>
            <div className="h-80 overflow-auto">
              {livePreviewLines ? (
                <pre className="hljs m-0 p-4 h-full min-h-full">
                  <code className={`language-${language} font-mono text-sm leading-6`} dangerouslySetInnerHTML={{ __html: livePreviewLines }} />
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 dark:text-slate-600">
                  <Code2 className="w-8 h-8 opacity-30" />
                  <p className="text-sm">Your highlighted code will appear here</p>
                  <button onClick={loadExample} className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Load an example →</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HTML Output */}
        {highlightedHTML && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden mb-6">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Generated HTML/CSS</h2>
              <div className="flex gap-2">
                <button onClick={copyHTML} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${copiedHTML ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                  {copiedHTML ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy HTML</>}
                </button>
                <button onClick={downloadHTML} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-sm">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
            <textarea
              value={highlightedHTML}
              readOnly
              className="w-full h-48 p-4 bg-slate-50 dark:bg-slate-900/40 font-mono text-xs text-slate-800 dark:text-slate-300 resize-none outline-none border-0"
            />
          </div>
        )}

        {/* Footer info bar */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-500 mb-12">
          Powered by Highlight.js · {LANGUAGES.length} languages · {THEMES.length} themes · Standalone HTML export
        </div>

        {/* SEO Content */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Code Syntax Highlighter — Beautiful Code with One Click</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Whether you are writing a technical blog post, building documentation, preparing a code tutorial, or creating a presentation that includes code samples, plain monospace text does not cut it. Code without syntax highlighting is harder to scan, harder to read, and less engaging for your audience. The OmniWebKit Code Syntax Highlighter solves this problem instantly and for free.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Paste any code snippet into the editor, choose your programming language from 24 supported options, and pick one of 8 professionally designed colour themes. The preview panel updates live as you type — no button required. When you are happy with the result, copy the raw highlighted code, copy the full standalone HTML file, or download it as a self-contained HTML document you can embed anywhere.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The tool is powered by Highlight.js, the most widely used open-source syntax highlighting library in the world. It uses the same tokeniser that powers thousands of documentation sites, GitHub Gists, and developer tools. That means the colour you see in the preview is accurate, reliable, and consistent with what developers expect.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All 8 Colour Themes Explained</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Each theme is a carefully crafted colour palette created specifically for code readability. Here is a summary of all 8 themes and when to use each one.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Atom One Dark', bg: '#282c34', desc: 'The most popular dark theme. Based on the Atom editor. Uses a warm blue-grey background with violet keywords and green strings. Excellent for technical blogs and documentation.' },
                { name: 'GitHub Light', bg: '#f6f8fa', desc: 'The exact theme used on GitHub for code display. White background, red keywords, blue strings. Familiar to most developers. Best for light-mode documentation and tutorials.' },
                { name: 'Monokai', bg: '#272822', desc: 'One of the classic dark themes, originally created for Sublime Text. Deep olive-green background with pink keywords and gold strings. Iconic and immediately recognisable.' },
                { name: 'Visual Studio', bg: '#ffffff', desc: 'The default theme from Microsoft Visual Studio IDE. White background, blue keywords, red strings, green comments. Perfect for corporate documentation and technical reports.' },
                { name: 'Dracula', bg: '#282a36', desc: 'A vibrant purple-tinted dark theme. Deep navy background with pink keywords and yellow strings. Popular for streaming, screenshots, and developer-facing content.' },
                { name: 'Nord', bg: '#2e3440', desc: 'A cool, icy Arctic-inspired palette. Dark blue-grey background with muted blue keywords and green strings. Clean and minimalist, great for technical presentations.' },
                { name: 'Tokyo Night', bg: '#1a1b26', desc: 'A sophisticated deep blue-purple theme inspired by the neon cityscape of Tokyo at night. Lavender keywords, green strings. Perfect for creative content and developer blogs.' },
                { name: 'GitHub Dark', bg: '#0d1117', desc: "GitHub's official dark mode theme. Near-black background with warm red keywords and light blue strings. Consistent with GitHub's dark interface for developer-facing documentation." },
              ].map(({ name, bg, desc }) => (
                <div key={name} className="flex gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg mt-0.5" style={{ backgroundColor: bg }} />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How to Add Syntax-Highlighted Code to Your Website</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              The most practical output from this tool is the generated HTML/CSS section. This contains a complete standalone HTML document with all theme styles embedded as inline CSS. You can use it in several ways:
            </p>
            <div className="space-y-4">
              {[
                { t: 'Embed in a webpage or CMS', d: 'Copy the HTML output, extract the relevant <pre><code>...</code></pre> block and the accompanying <style> tag, and paste both into your HTML page or CMS editor. The code will render with full colour highlighting without any external dependencies.' },
                { t: 'Use as an image replacement', d: 'Download the HTML file, open it in any browser, and take a screenshot. Many developers do this to create sharp, high-quality code images for slide decks, social media posts, or course materials where a screenshot looks cleaner than embedded HTML.' },
                { t: 'Use in email newsletters', d: 'Code in emails is tricky because email clients strip external stylesheets. Since this tool generates fully inline CSS, the styles are self-contained and will survive email rendering in most clients.' },
                { t: 'Share standalone previews', d: 'Download the HTML file and share it directly. Anyone who opens the file in a browser sees the highlighted code with your chosen theme — no Highlight.js CDN link required, everything is bundled.' },
                { t: 'Embed in Markdown via HTML blocks', d: 'Platforms like GitHub, Notion, and Confluence support raw HTML blocks. You can paste the generated <pre> block directly and the highlighted code will render natively inside your markdown document.' },
              ].map(({ t, d }, i) => (
                <div key={t} className="flex gap-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold flex items-center justify-center">{i + 1}</div>
                  <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{t}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this code syntax highlighter free?', a: 'Yes, completely free with no account required. There are no usage limits. Paste as many code snippets as you need.' },
                { q: 'What languages does this tool support?', a: 'The tool supports 24 languages: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, HTML, CSS, SQL, Bash, JSON, XML, YAML, Markdown, Swift, Kotlin, Scala, R, Perl, and Lua. Auto-detection is also available via Highlight.js.' },
                { q: 'What does the Download button produce?', a: 'The Download button creates a self-contained HTML file with all theme CSS embedded inline. The file can be opened in any browser, shared via email, or embedded in any web page without external dependencies.' },
                { q: 'Why does the preview sometimes not highlight immediately?', a: "The tool loads Highlight.js from a CDN on first use. There may be a brief delay while the library loads. Once loaded, all subsequent highlights happen instantly. The status badge in the controls bar shows 'Ready' once Highlight.js is available." },
                { q: 'Can I use the generated HTML in an email newsletter?', a: 'Yes. The generated HTML uses only inline CSS styles from the theme data, not external stylesheets. This means the highlighted code will render correctly in most email clients, which typically strip external CSS links.' },
                { q: 'What is the difference between Copy HTML and Copy Code?', a: 'Copy Code copies your original raw source code (what you typed in the left panel). Copy HTML copies the full highlighted HTML document including the theme CSS, ready to embed. Use Copy Code to share the source, and Copy HTML to share the styled output.' },
                { q: 'Is my code sent to any server?', a: 'No. All highlighting happens entirely in your browser using the Highlight.js JavaScript library. Your code is never sent to any server. Everything runs locally in your browser tab.' },
                { q: 'What does the line numbers toggle do?', a: 'It shows or hides line numbers in the input editor panel. This does not affect the generated HTML output — it only changes the display in the editor to help you navigate longer code snippets.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                    <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}