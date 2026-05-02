'use client';
import { useState, useCallback } from 'react';
import { Copy, Download, Check, RefreshCw, FileText, Code2, BarChart3 } from 'lucide-react';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const selectCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';

/* ─── Toggle ─────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer gap-2 py-1">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button onClick={() => onChange(!checked)} type="button"
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  );
}

/* ─── Word corpus ───────────────────────────────────────────────────── */
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod',
  'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim',
  'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea',
  'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse',
  'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
  'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'ac', 'tellus',
  'integer', 'feugiat', 'scelerisque', 'varius', 'morbi', 'eros', 'cursus', 'mattis', 'molestie', 'iaculis',
  'at', 'erat', 'pellentesque', 'viverra', 'maecenas', 'accumsan', 'lacus', 'vel', 'facilisis', 'volutpat',
];

const HEADINGS = [
  'Introduction', 'Overview', 'Key Points', 'Analysis', 'Methodology',
  'Results', 'Discussion', 'Conclusion', 'Summary', 'Important Notes',
  'Details', 'Features', 'Benefits', 'Considerations', 'Next Steps',
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const rWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

/* ─── Generation logic ──────────────────────────────────────────────── */
function makeSentence(minW, maxW, wordCount) {
  const n = wordCount ?? rand(minW, maxW);
  return cap(Array.from({ length: n }, rWord).join(' ')) + '.';
}

function makeParagraph(minW, maxW) {
  return Array.from({ length: rand(4, 8) }, () => makeSentence(minW, maxW)).join(' ');
}

function makeList(count, minW, maxW) {
  return Array.from({ length: count }, () => makeSentence(minW, maxW, rand(3, 8)));
}

function wrapTag(content, tag) {
  return tag === 'none' ? content : `<${tag}>${content}</${tag}>`;
}

function generateContent({
  outputType, count, startWithLorem, wrapWithHTML, htmlTag,
  addHeadings, addLists, minW, maxW,
}) {
  const loremStart = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  const result = [];

  if (outputType === 'paragraphs') {
    for (let i = 0; i < count; i++) {
      if (addHeadings && i > 0 && i % 2 === 0) {
        const h = HEADINGS[Math.floor(Math.random() * HEADINGS.length)];
        result.push(wrapWithHTML ? `<h3>${h}</h3>` : `### ${h}`);
      }
      let p = i === 0 && startWithLorem
        ? loremStart + ' ' + makeParagraph(minW, maxW).replace(/^[^.]+\./, '')
        : makeParagraph(minW, maxW);
      result.push(wrapWithHTML ? wrapTag(p, htmlTag) : p);
      if (addLists && i > 0 && i % 3 === 0) {
        const items = makeList(rand(3, 6), minW, maxW);
        result.push(wrapWithHTML
          ? '<ul>\n' + items.map(it => `  <li>${it}</li>`).join('\n') + '\n</ul>'
          : items.map(it => `• ${it}`).join('\n'));
      }
    }
  } else if (outputType === 'sentences') {
    const s = Array.from({ length: count }, (_, i) =>
      i === 0 && startWithLorem ? loremStart : makeSentence(minW, maxW)
    ).join(' ');
    result.push(wrapWithHTML ? wrapTag(s, htmlTag) : s);
  } else if (outputType === 'words') {
    const words = startWithLorem
      ? ['Lorem', 'ipsum', 'dolor', 'sit', 'amet', ...Array.from({ length: Math.max(0, count - 5) }, rWord)]
      : Array.from({ length: count }, rWord);
    const w = cap(words.join(' ')) + '.';
    result.push(wrapWithHTML ? wrapTag(w, htmlTag) : w);
  } else if (outputType === 'list') {
    const items = makeList(count, minW, maxW);
    result.push(wrapWithHTML
      ? '<ul>\n' + items.map(it => `  <li>${it}</li>`).join('\n') + '\n</ul>'
      : items.map(it => `• ${it}`).join('\n'));
  }

  return result.join('\n\n');
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function FakeContentGenerator() {
  const [outputType, setOutputType] = useState('paragraphs');
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [wrapWithHTML, setWrapWithHTML] = useState(false);
  const [htmlTag, setHtmlTag] = useState('p');
  const [addHeadings, setAddHeadings] = useState(false);
  const [addLists, setAddLists] = useState(false);
  const [minW, setMinW] = useState(5);
  const [maxW, setMaxW] = useState(15);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('preview'); // 'preview' | 'code'

  const maxCount = outputType === 'words' ? 200 : outputType === 'sentences' ? 50 : 20;

  const generate = useCallback(() => {
    const text = generateContent({ outputType, count, startWithLorem, wrapWithHTML, htmlTag, addHeadings, addLists, minW, maxW });
    setOutput(text);
  }, [outputType, count, startWithLorem, wrapWithHTML, htmlTag, addHeadings, addLists, minW, maxW]);

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const ext = wrapWithHTML ? 'html' : 'txt';
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([output], { type: 'text/plain' })),
      download: `lorem-ipsum.${ext}`,
    });
    a.click(); URL.revokeObjectURL(a.href);
  };

  /* stats */
  const words = output ? output.split(/\s+/).filter(Boolean).length : 0;
  const sentences = output ? output.split(/[.!?]+/).filter(s => s.trim()).length : 0;
  const chars = output ? output.length : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/25">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Fake Content Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Generate lorem ipsum placeholder text — paragraphs, sentences, words, and lists with HTML wrapping</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Settings ── */}
          <div className={`${cardCls} p-5 lg:sticky lg:top-4 h-fit`}>
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-5">Settings</h2>

            {/* Output type */}
            <div className="mb-4">
              <label className={labelCls}>Generate</label>
              <select value={outputType} onChange={e => { setOutputType(e.target.value); setCount(3); }} className={selectCls}>
                <option value="paragraphs">Paragraphs</option>
                <option value="sentences">Sentences</option>
                <option value="words">Words</option>
                <option value="list">List Items</option>
              </select>
            </div>

            {/* Count slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <label className={labelCls.replace('mb-1.5', '')}>Count</label>
                <span className="text-sm font-black font-mono text-purple-600 dark:text-purple-400">{count}</span>
              </div>
              <input type="range" min={1} max={maxCount} value={count} onChange={e => setCount(+e.target.value)}
                className="w-full h-1.5 accent-purple-600 cursor-pointer" />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1"><span>1</span><span>{maxCount}</span></div>
            </div>

            {/* Sentence length */}
            {(outputType === 'paragraphs' || outputType === 'sentences') && (
              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <p className={labelCls}>Sentence Length (words)</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Min</span>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">{minW}</span>
                    </div>
                    <input type="range" min={3} max={15} value={minW} onChange={e => setMinW(+e.target.value)}
                      className="w-full h-1.5 accent-purple-600 cursor-pointer" />
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Max</span>
                      <span className="text-xs font-black text-purple-600 dark:text-purple-400">{maxW}</span>
                    </div>
                    <input type="range" min={10} max={30} value={maxW} onChange={e => setMaxW(+e.target.value)}
                      className="w-full h-1.5 accent-purple-600 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* Toggles */}
            <div className="mb-4 space-y-1 border-t border-slate-200 dark:border-slate-700 pt-3">
              <Toggle checked={startWithLorem} onChange={setStartWithLorem} label='Start with "Lorem ipsum"' />
              <Toggle checked={wrapWithHTML} onChange={setWrapWithHTML} label="Wrap with HTML tags" />
              {outputType === 'paragraphs' && <>
                <Toggle checked={addHeadings} onChange={setAddHeadings} label="Add headings (h3)" />
                <Toggle checked={addLists} onChange={setAddLists} label="Add bullet lists" />
              </>}
            </div>

            {/* HTML tag selection */}
            {wrapWithHTML && outputType !== 'list' && (
              <div className="mb-4">
                <label className={labelCls}>HTML Tag</label>
                <select value={htmlTag} onChange={e => setHtmlTag(e.target.value)} className={selectCls}>
                  {['p', 'div', 'span', 'article', 'section', 'blockquote'].map(t => (
                    <option key={t} value={t}>{t} &lt;{t}&gt;</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={generate}
              className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-purple-500/20">
              <RefreshCw className="w-4 h-4" />Generate
            </button>
          </div>

          {/* ── Output ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Stats bar — always visible */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Words', val: words, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
                { label: 'Sentences', val: sentences, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
                { label: 'Characters', val: chars, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className={`p-4 rounded-2xl border text-center ${bg}`}>
                  <div className={`text-2xl font-black ${color}`}>{val.toLocaleString()}</div>
                  <div className={`text-xs font-bold uppercase tracking-wide mt-0.5 ${color} opacity-70`}>{label}</div>
                </div>
              ))}
            </div>

            <div className={cardCls}>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                {/* Tabs */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                  {[
                    { key: 'preview', icon: <FileText className="w-3.5 h-3.5" />, label: 'Preview' },
                    { key: 'code', icon: <Code2 className="w-3.5 h-3.5" />, label: 'Code' },
                  ].map(({ key, icon, label }) => (
                    <button key={key} onClick={() => setTab(key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${tab === key ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      {icon}{label}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                {output && (
                  <div className="flex gap-2">
                    <button onClick={copy}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button onClick={download}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition">
                      <Download className="w-3.5 h-3.5" />Download
                    </button>
                  </div>
                )}
              </div>

              {/* Content area */}
              <div className="p-5 min-h-[300px]">
                {!output ? (
                  <div className="flex flex-col items-center justify-center h-60 text-center">
                    <div className="text-5xl mb-4">📝</div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Click <strong className="text-slate-700 dark:text-slate-300">Generate</strong> to create placeholder text</p>
                    <button onClick={generate}
                      className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition">
                      <RefreshCw className="w-4 h-4" />Generate Now
                    </button>
                  </div>
                ) : tab === 'preview' ? (
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300"
                    dangerouslySetInnerHTML={{ __html: wrapWithHTML ? output : output.replace(/\n\n/g, '<br/><br/>').replace(/### (.+)/g, '<h3 class="font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>') }}
                  />
                ) : (
                  <pre className="text-xs font-mono text-emerald-400 bg-slate-950 rounded-xl p-4 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">{output}</pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Lorem Ipsum &amp; Fake Content Generator — Placeholder Text for Any Project</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every designer, developer, and content professional encounters the same problem at some point: you need to show a layout, a template, a design mockup, or a code prototype — but the real content is not ready yet. Inserting dummy text lets you focus on structure and design without worrying about actual words. This free Fake Content Generator (Lorem Ipsum Generator) solves that problem with a powerful, customisable tool that generates placeholder text in seconds.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Choose from four output modes — Paragraphs, Sentences, Words, or List Items — and set the exact count you need. Use the sentence length controls to tune how long or short each sentence is. Toggle HTML wrapping to get your text already wrapped in the exact HTML tag you need: <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">&lt;p&gt;</code>, <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">&lt;div&gt;</code>, <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">&lt;article&gt;</code>, <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">&lt;section&gt;</code>, <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">&lt;blockquote&gt;</code>, or <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-purple-600 dark:text-purple-400">&lt;span&gt;</code>. For paragraph mode, optionally insert h3 headings between sections and bullet lists automatically. The Preview tab shows rendered output and the Code tab shows the raw text or HTML — copy or download either instantly.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Word count, sentence count, and character count are displayed prominently and update every time you generate. All generation happens instantly in your browser — no server, no upload, no account required.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Output Modes Explained</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Paragraphs', c: 'text-purple-600 dark:text-purple-400', b: 'The most common mode. Each paragraph contains 4–8 sentences. The count slider controls how many paragraphs to generate. Use "Add headings" to insert h3 section headers every two paragraphs, and "Add bullet lists" to inject unordered lists every three paragraphs. Great for article, blog, and long-form content mockups.' },
                { t: 'Sentences', c: 'text-blue-600 dark:text-blue-400', b: 'Generates a specified number of individual sentences joined together into a single text block. Useful for shorter content areas like card bodies, captions, or testimonial placeholders.' },
                { t: 'Words', c: 'text-teal-600 dark:text-teal-400', b: 'Generates exactly the specified number of words as a single comma-free sentence. Useful for testing character limits in text inputs, buttons, meta descriptions, or single-line fields.' },
                { t: 'List Items', c: 'text-amber-600 dark:text-amber-400', b: 'Generates a specified number of list items. Without HTML wrapping, items are formatted with bullet points. With HTML wrapping, the output is a proper <ul> block with <li> elements ready to paste into code.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">When and Why to Use Lorem Ipsum</h2>
            <div className="space-y-3">
              {[
                { t: 'Website and app wireframes', c: 'text-indigo-600 dark:text-indigo-400', b: 'When designing a new website or app, placeholder text fills content areas so stakeholders can evaluate layout and visual hierarchy without being distracted by actual copy.' },
                { t: 'Email template design', c: 'text-blue-600 dark:text-blue-400', b: 'Email designers use dummy paragraphs and list content to test how templates render across different email clients before the actual marketing copy is ready.' },
                { t: 'CMS and theme development', c: 'text-teal-600 dark:text-teal-400', b: 'WordPress, Shopify, and other CMS theme developers fill demo content with lorem ipsum to showcase their themes in content marketplaces with realistic-looking text.' },
                { t: 'Typography and font testing', c: 'text-violet-600 dark:text-violet-400', b: 'Font designers and typographers use lorem ipsum because its character distribution is similar to Latin-based languages, making it ideal for testing how a typeface looks in running text.' },
                { t: 'Print design and layouts', c: 'text-rose-600 dark:text-rose-400', b: 'Magazine, brochure, and book designers use placeholder paragraphs to fill column layouts and check text flow, line spacing, and hyphenation before final copy is supplied.' },
                { t: 'Code documentation and testing', c: 'text-amber-600 dark:text-amber-400', b: 'Developers use generated text to test text processing functions, search indexing, character encoding, and UI components that render long or complex text content.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${c.replace('text-', 'bg-').split(' ')[0]}`} />
                  <div>
                    <p className={`font-black text-sm mb-0.5 ${c}`}>{t}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'What is lorem ipsum and where does it come from?', a: 'Lorem ipsum is placeholder text that has been used in typesetting and printing since the 1500s. It is derived from a scrambled, modified passage from "de Finibus Bonorum et Malorum" (On the Ends of Good and Evil) by Cicero (45 BC). The scrambled text became a standard dummy text because its letter distribution is similar to real Latin and English text.' },
                { q: 'Why use lorem ipsum instead of writing placeholder text myself?', a: 'Writing real-sounding placeholder text is time-consuming and distracting. Lorem ipsum is instantly recognisable as a placeholder, so clients and stakeholders know it is dummy content. Its realistic word lengths and character distribution also make it ideal for testing font rendering and layout.' },
                { q: 'What is the difference between paragraphs and sentences mode?', a: 'Paragraphs mode generates multiple complete paragraphs, each with 4–8 sentences. Sentences mode generates a specified number of individual sentences combined into one block. Paragraphs mode is better for long-form layouts; sentences mode is better for shorter text areas.' },
                { q: 'What does "Wrap with HTML tags" do?', a: 'When enabled, the generated text is wrapped with the HTML tag you select. For paragraphs, each paragraph is individually wrapped. For lists, the output is a <ul> block with <li> elements. This makes it quick to paste directly into your HTML or template code.' },
                { q: 'Can I download the generated text?', a: 'Yes. Click Download to save the output as a .txt file (or .html if HTML wrapping is enabled). The file is generated in your browser with no server upload.' },
                { q: 'Does "Start with Lorem ipsum" affect all output types?', a: 'Yes. When enabled in paragraph mode, the first paragraph begins with the classic "Lorem ipsum dolor sit amet, consectetur adipiscing elit." opening. In sentence mode, the first sentence is this classic opening. In word mode, the first five words are "Lorem ipsum dolor sit amet".' },
                { q: 'Is there a word count limit?', a: 'The maximum is 200 words, 50 sentences, or 20 paragraphs/list items per generation. You can click Generate multiple times and copy each result to add them together if you need more.' },
                { q: 'Is this tool free?', a: 'Yes, fully free with no account, no limits on how often you generate, and no data uploaded to any server. All text generation runs entirely in your browser.' },
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