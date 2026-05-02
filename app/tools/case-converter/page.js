'use client';
import { useState, useMemo } from 'react';
import { Type, Copy, Check, Download, RefreshCw, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// ─── Shared styles ─────────────────────────────────────
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

// ─── Case conversion functions ─────────────────────────
const conversions = [
  {
    key: 'uppercase', name: 'UPPERCASE', emoji: '🔠',
    description: 'All letters in capitals — great for emphasis, headings, and constants.',
    convert: t => t.toUpperCase(),
  },
  {
    key: 'lowercase', name: 'lowercase', emoji: '🔡',
    description: 'All letters in lower case — useful for URLs, emails, and data storage.',
    convert: t => t.toLowerCase(),
  },
  {
    key: 'titlecase', name: 'Title Case', emoji: '📖',
    description: 'First letter of every word capitalised — perfect for headings and names.',
    convert: t => t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
  },
  {
    key: 'sentencecase', name: 'Sentence case', emoji: '✍️',
    description: 'First letter of each sentence capitalised — ideal for normal readable text.',
    convert: t => t.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
  },
  {
    key: 'camelcase', name: 'camelCase', emoji: '🐪',
    description: 'First word lowercase, subsequent words capitalised with no spaces — used in JavaScript variables.',
    convert: t => {
      const words = t.toLowerCase().split(/[\s_\-]+/).filter(Boolean);
      return words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    },
  },
  {
    key: 'pascalcase', name: 'PascalCase', emoji: '🏛️',
    description: 'Every word capitalised with no spaces — used for class and component names.',
    convert: t => t.toLowerCase().split(/[\s_\-]+/).filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
  },
  {
    key: 'snakecase', name: 'snake_case', emoji: '🐍',
    description: 'Lowercase words joined by underscores — common in Python, databases, and file names.',
    convert: t => t.toLowerCase().replace(/[\s\-]+/g, '_').replace(/[^\w_]/g, ''),
  },
  {
    key: 'kebabcase', name: 'kebab-case', emoji: '🍢',
    description: 'Lowercase words joined by hyphens — the standard format for CSS classes and URLs.',
    convert: t => t.toLowerCase().replace(/[\s_]+/g, '-').replace(/[^\w\-]/g, ''),
  },
  {
    key: 'constantcase', name: 'CONSTANT_CASE', emoji: '⚡',
    description: 'Uppercase letters joined by underscores — used for constants and environment variables.',
    convert: t => t.toUpperCase().replace(/[\s\-]+/g, '_').replace(/[^\w_]/g, ''),
  },
  {
    key: 'dotcase', name: 'dot.case', emoji: '•',
    description: 'Lowercase words joined by dots — used in configuration keys and object paths.',
    convert: t => t.toLowerCase().replace(/[\s_\-]+/g, '.').replace(/[^\w.]/g, ''),
  },
  {
    key: 'alternating', name: 'aLtErNaTiNg', emoji: '🔀',
    description: 'Alternates between lowercase and uppercase letters — a quirky mocking style.',
    convert: t => t.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
  },
  {
    key: 'inverse', name: 'iNVERSE cASE', emoji: '🔄',
    description: 'Flips the case of every letter — uppercase becomes lowercase and vice versa.',
    convert: t => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
  },
];

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); toast.success('Copied!'); setTimeout(() => setCopied(false), 2000); }).catch(() => toast.error('Failed to copy'));
  };
  return (
    <button onClick={handleCopy} title="Copy" className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition flex-shrink-0">
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function CaseConverter() {
  const [inputText, setInputText] = useState('');

  // Live conversion — no button needed
  const results = useMemo(() => {
    if (!inputText.trim()) return {};
    return Object.fromEntries(conversions.map(c => [c.key, c.convert(inputText)]));
  }, [inputText]);

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0;
  const lineCount = inputText ? inputText.split('\n').length : 0;
  const hasResults = Object.keys(results).length > 0;

  const copyAllResults = () => {
    const text = conversions.map(c => `${c.name}:\n${results[c.key] || ''}`).join('\n\n');
    navigator.clipboard.writeText(text).then(() => toast.success('All results copied!')).catch(() => toast.error('Failed to copy'));
  };

  const downloadResults = () => {
    const content = conversions.map(c => `${c.name}:\n${results[c.key] || ''}`).join('\n\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([content], { type: 'text/plain' })), download: 'case_conversions.txt' });
    a.click(); URL.revokeObjectURL(a.href);
    toast.success('Downloaded!');
  };

  const clearAll = () => { setInputText(''); toast.success('Cleared'); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Case Converter', href: '/tools/case-converter' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
            <Type className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">Case Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Convert text to any case format instantly — UPPERCASE, lowercase, camelCase, snake_case, kebab-case, and 8 more. Results update live as you type.
          </p>
        </div>

        {/* Input card */}
        <div className={`${cardCls} p-6 mb-6`}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Input Text</h2>
            <div className="flex gap-2">
              {hasResults && (
                <>
                  <button onClick={copyAllResults} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition">
                    <Copy className="w-3.5 h-3.5" /> Copy All
                  </button>
                  <button onClick={downloadResults} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </>
              )}
              <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg font-medium transition">
                <RefreshCw className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder="Type or paste your text here — results update instantly…"
            rows={5}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 resize-none outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />

          <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-400">
            <span><strong className="text-slate-700 dark:text-slate-300">{inputText.length}</strong> characters</span>
            <span><strong className="text-slate-700 dark:text-slate-300">{wordCount}</strong> words</span>
            <span><strong className="text-slate-700 dark:text-slate-300">{lineCount}</strong> lines</span>
            {hasResults && (
              <span className="ml-auto flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium">
                <ChevronRight className="w-3 h-3" /> Live results below
              </span>
            )}
          </div>
        </div>

        {/* Results grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Converted Results <span className="text-slate-400 dark:text-slate-500 font-normal text-sm">({conversions.length} formats)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {conversions.map(conv => (
              <div key={conv.key} className={`${cardCls} p-4`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg flex-shrink-0">{conv.emoji}</span>
                    <div>
                      <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 font-mono leading-tight">{conv.name}</h3>
                    </div>
                  </div>
                  {results[conv.key] && <CopyButton text={results[conv.key]} />}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5 leading-relaxed">{conv.description}</p>
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 min-h-[44px] flex items-center">
                  {results[conv.key] ? (
                    <span className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all leading-relaxed">{results[conv.key]}</span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-600 italic">Enter text above to see the result…</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-16 space-y-6">

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Case Converter — Convert Text to Any Format Online</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Text case matters more than most people realise. In writing, the wrong case format makes content look unprofessional or hard to read. In programming, using the wrong case convention (like writing a variable in Title Case instead of camelCase) will often produce a syntax error or naming violation that breaks your code. In SEO and web development, URL slugs and query parameters need to follow strict lowercase or kebab-case rules to work consistently across different servers and browsers.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit Case Converter gives you 12 different text case formats, all converted simultaneously from a single input. Type or paste your text once, and instantly see the result in UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, aLtErNaTiNg, and iNVERSE — all at the same time, updating live as you type. No button to press, no page refresh.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Each result card has a one-click copy button. You can also copy all 12 results at once, or download them as a plain text file. This tool is used by developers transforming variable names, designers writing headings, content writers reformatting copy, and anyone who regularly works with text that needs to follow a specific capitalisation convention.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">All 12 Case Formats Explained</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Here is a guide to every case format the tool supports, what it looks like, and when to use it.
            </p>
            <div className="space-y-3">
              {[
                { name: 'UPPERCASE', ex: 'HELLO WORLD', use: 'Used for emphasis, acronyms, constants in some languages, and text that needs to stand out visually.' },
                { name: 'lowercase', ex: 'hello world', use: 'Standard for URLs, email addresses, database field names, and anywhere readability matters at small sizes.' },
                { name: 'Title Case', ex: 'Hello World', use: 'Used for page titles, book titles, product names, headings in articles, and formal document titles.' },
                { name: 'Sentence case', ex: 'Hello world', use: 'The standard format for regular readable sentences and paragraphs. First letter of each sentence is capitalised.' },
                { name: 'camelCase', ex: 'helloWorld', use: 'The most common naming convention in JavaScript, TypeScript, Java, Swift, and Kotlin for variables and function names.' },
                { name: 'PascalCase', ex: 'HelloWorld', use: 'Used for class names, component names (React/Angular/Vue), and constructors in most object-oriented languages.' },
                { name: 'snake_case', ex: 'hello_world', use: 'The standard convention in Python, Ruby, SQL column names, and many configuration files and environment variable names.' },
                { name: 'kebab-case', ex: 'hello-world', use: 'Used for CSS class names, HTML attributes, URL slugs, and file names. Hyphens are safe in all URL contexts.' },
                { name: 'CONSTANT_CASE', ex: 'HELLO_WORLD', use: 'Used for constants and environment variables in most languages — e.g., NODE_ENV, API_KEY, MAX_RETRIES.' },
                { name: 'dot.case', ex: 'hello.world', use: 'Used in configuration file keys (e.g., app.name, server.port), log namespaces, and Java package names.' },
                { name: 'aLtErNaTiNg', ex: 'hElLo WoRlD', use: 'A creative or humorous style. Often seen in memes and satirical writing to mock or parody a statement.' },
                { name: 'iNVERSE cASE', ex: 'hELLO wORLD', use: 'Flips every letter\'s case. Useful for creative design, obfuscation effects, and unique text styling.' },
              ].map(({ name, ex, use }) => (
                <div key={name} className="flex flex-col sm:flex-row gap-3 p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <div className="sm:w-40 flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{name}</p>
                    <code className="text-xs text-violet-600 dark:text-violet-400 font-mono">{ex}</code>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{use}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Case Conventions in Programming Languages</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Every programming language has its own community standards and official style guides for naming variables, functions, classes, and files. Getting the case wrong will not always break your code, but it will mark you as someone who does not follow the standard conventions — and in code reviews, that matters. Here is a quick reference for the most common languages.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { lang: 'JavaScript / TypeScript', items: ['Variables & functions → camelCase', 'Classes & components → PascalCase', 'Constants → CONSTANT_CASE', 'CSS classes → kebab-case', 'File names → kebab-case or camelCase'] },
                { lang: 'Python', items: ['Variables & functions → snake_case', 'Classes → PascalCase', 'Constants → CONSTANT_CASE', 'Modules & packages → snake_case', 'Private members → _snake_case'] },
                { lang: 'Java / Kotlin', items: ['Variables & methods → camelCase', 'Classes & interfaces → PascalCase', 'Constants → CONSTANT_CASE', 'Packages → lowercase (dot.separated)', 'Files → PascalCase (matches class name)'] },
                { lang: 'CSS / HTML', items: ['Class names → kebab-case', 'IDs → kebab-case', 'Custom properties → --kebab-case', 'HTML attributes → kebab-case', 'File names → kebab-case'] },
                { lang: 'SQL / Databases', items: ['Column names → snake_case', 'Table names → snake_case', 'Database names → snake_case', 'Stored procedures → snake_case or PascalCase', 'Constants → UPPERCASE'] },
                { lang: 'URLs / Routes', items: ['Path segments → kebab-case', 'Query parameters → camelCase or snake_case', 'Slugs → kebab-case', 'File names → kebab-case', 'API endpoints → kebab-case'] },
              ].map(({ lang, items }) => (
                <div key={lang} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <p className="font-bold text-slate-900 dark:text-white text-sm mb-2">{lang}</p>
                  <ul className="space-y-1">
                    {items.map(item => <li key={item} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2"><span className="text-violet-500 flex-shrink-0 mt-1">•</span>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this case converter free?', a: 'Yes, 100% free with no usage limits, no account required. Type or paste any amount of text and get instant results in all 12 formats simultaneously.' },
                { q: 'Does the tool update results live as I type?', a: 'Yes. Results update instantly as you type — no "Convert" button to press. As soon as you enter text, all 12 case formats are recalculated and displayed in real time.' },
                { q: 'Can I convert multiple paragraphs at once?', a: 'Yes. The tool handles any amount of text — a single word, a sentence, multiple paragraphs, or an entire document. All case conversions work on the full text you enter.' },
                { q: 'What is the difference between camelCase and PascalCase?', a: 'In camelCase, the first word starts with a lowercase letter (e.g., helloWorld). In PascalCase (also called UpperCamelCase), every word including the first starts with an uppercase letter (e.g., HelloWorld). camelCase is standard for variables and functions in most languages, while PascalCase is standard for class and component names.' },
                { q: 'When should I use snake_case vs kebab-case?', a: 'snake_case (underscores) is standard in Python, SQL, database column names, file names in Unix systems, and environment variable names. kebab-case (hyphens) is standard for CSS class names, URL slugs, HTML attributes, and file names in web projects. Both use lowercase letters — the only difference is the separator character.' },
                { q: 'What is CONSTANT_CASE?', a: 'CONSTANT_CASE (also written as SCREAMING_SNAKE_CASE) is UPPERCASE letters separated by underscores. It is the standard for defining constants in most programming languages and for environment variable names — for example, DATABASE_URL, API_SECRET_KEY, or MAX_RETRY_COUNT.' },
                { q: 'Can I download all the conversion results?', a: 'Yes. Click the Download button in the input panel and a plain text file named case_conversions.txt will download to your device, containing all 12 case format results. You can also click "Copy All" to copy all results to your clipboard at once.' },
                { q: 'Does the converter keep my text private?', a: 'Yes. All conversions happen entirely in your browser using JavaScript. Your text is never sent to any server — it stays completely on your device.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                    <span>{q}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
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