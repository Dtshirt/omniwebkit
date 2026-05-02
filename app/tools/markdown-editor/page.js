'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    FileText, Copy, Download, Check, Bold, Italic, List, Link2, Image,
    Code, Eye, AlignLeft, Hash, Minus, Quote, ListOrdered, Table,
    Undo2, Redo2, Maximize2, Minimize2, Strikethrough, Trash2
} from 'lucide-react';

/* ─── Markdown → HTML ──────────────────────────────────────────────── */
function mdToHtml(md) {
    let h = md;
    // Fenced code blocks
    h = h.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
        `<pre class="md-pre"><code class="md-code">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    );
    // Inline code
    h = h.replace(/`([^`]+)`/g, '<code class="md-ic">$1</code>');
    // Images before links
    h = h.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="md-img"/>');
    // Links
    h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="md-a" target="_blank" rel="noopener">$1</a>');
    // Headings
    for (let n = 6; n >= 1; n--) {
        h = h.replace(new RegExp(`^${'#'.repeat(n)}\\s(.+)$`, 'gm'), `<h${n} class="md-h${n}">$1</h${n}>`);
    }
    // Bold, italic, strikethrough
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    h = h.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    h = h.replace(/_([^_]+)_/g, '<em>$1</em>');
    h = h.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    // HR
    h = h.replace(/^---$/gm, '<hr class="md-hr"/>');
    // Blockquote
    h = h.replace(/^>\s(.+)$/gm, '<blockquote class="md-bq">$1</blockquote>');
    // Lists
    h = h.replace(/^[-*]\s(.+)$/gm, '<li class="md-li">$1</li>');
    h = h.replace(/(<li class="md-li">.*<\/li>\n?)+/g, m => `<ul class="md-ul">${m}</ul>`);
    h = h.replace(/^\d+\.\s(.+)$/gm, '<li class="md-oli">$1</li>');
    h = h.replace(/(<li class="md-oli">.*<\/li>\n?)+/g, m => `<ol class="md-ol">${m}</ol>`);
    // Table
    h = h.replace(/^\|(.+)\|\s*\n\|[-|\s]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, hdr, body) => {
        const hs = hdr.split('|').map(x => x.trim()).filter(Boolean);
        const rs = body.trim().split('\n').map(r => r.split('|').map(x => x.trim()).filter(Boolean));
        return `<table class="md-table"><thead><tr>${hs.map(x => `<th>${x}</th>`).join('')}</tr></thead><tbody>${rs.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    });
    // Paragraphs
    h = h.split('\n\n').map(b => {
        if (b.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr|table)/)) return b;
        if (b.trim()) return `<p>${b.replace(/\n/g, '<br/>')}</p>`;
        return '';
    }).join('\n');
    return h;
}

/* ─── Styles injected as a plain style tag ─────────────────────────── */
const PREVIEW_CSS = `
.mdpv{font-family:system-ui,-apple-system,sans-serif;line-height:1.8;color:#1e293b}
.dark .mdpv{color:#e2e8f0}
.mdpv .md-h1{font-size:2em;font-weight:800;margin:24px 0 10px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;color:#0f172a}
.dark .mdpv .md-h1{border-bottom-color:#334155;color:#f8fafc}
.mdpv .md-h2{font-size:1.5em;font-weight:700;margin:20px 0 8px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;color:#0f172a}
.dark .mdpv .md-h2{border-bottom-color:#334155;color:#f8fafc}
.mdpv .md-h3{font-size:1.25em;font-weight:700;margin:16px 0 6px;color:#0f172a}
.dark .mdpv .md-h3{color:#f8fafc}
.mdpv .md-h4{font-size:1.1em;font-weight:600;margin:14px 0 4px}
.mdpv .md-h5{font-size:1em;font-weight:600;margin:12px 0 4px}
.mdpv .md-h6{font-size:.9em;font-weight:600;margin:10px 0 4px;color:#64748b}
.mdpv .md-pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:12px;overflow-x:auto;font-size:.85em;margin:16px 0}
.mdpv .md-code{background:none;padding:0;color:inherit}
.mdpv .md-ic{background:#f1f5f9;color:#e11d48;padding:2px 6px;border-radius:4px;font-size:.85em;font-family:monospace}
.dark .mdpv .md-ic{background:#1e293b;color:#f472b6}
.mdpv .md-bq{border-left:4px solid #6366f1;margin:16px 0;padding:10px 16px;background:#f5f3ff;border-radius:0 8px 8px 0;color:#4b5563;font-style:italic}
.dark .mdpv .md-bq{background:#312e81;color:#c7d2fe;border-left-color:#818cf8}
.mdpv .md-ul,.mdpv .md-ol{padding-left:24px;margin:10px 0}
.mdpv .md-li,.mdpv .md-oli{margin:3px 0}
.mdpv .md-hr{border:none;border-top:2px solid #e2e8f0;margin:24px 0}
.dark .mdpv .md-hr{border-top-color:#334155}
.mdpv .md-a{color:#6366f1;text-decoration:underline;text-underline-offset:3px}
.mdpv .md-img{max-width:100%;border-radius:8px;margin:12px 0}
.mdpv .md-table{border-collapse:collapse;width:100%;margin:16px 0}
.mdpv .md-table th{background:#f8fafc;font-weight:600;text-align:left;padding:8px 12px;border:1px solid #e2e8f0}
.dark .mdpv .md-table th{background:#1e293b;border-color:#334155;color:#f8fafc}
.mdpv .md-table td{padding:8px 12px;border:1px solid #e2e8f0;color:#374151}
.dark .mdpv .md-table td{border-color:#334155;color:#e2e8f0}
.mdpv p{margin:10px 0}
`;

/* ─── Sample content ────────────────────────────────────────────────── */
const SAMPLE = `# Welcome to Markdown Editor

Write **bold**, *italic*, ~~strikethrough~~, and \`inline code\` text easily.

## Features

- Live split preview as you type
- Full formatting toolbar with keyboard shortcuts
- Export to \`.md\` or \`.html\` with styling baked in
- Word count, character count, and line count
- Undo / Redo support

### Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> "The best way to predict the future is to create it." — Abraham Lincoln

### Table

| Feature | Status |
| --- | --- |
| Bold & Italic | ✅ Done |
| Code Blocks | ✅ Done |
| Tables | ✅ Done |
| Images | ✅ Done |

---

[Visit OmniWebKit](https://omniwebkit.com) for more free tools!
`;

/* ─── Component ─────────────────────────────────────────────────────── */
export default function MarkdownEditor() {
    const [md, setMd] = useState(SAMPLE);
    const [view, setView] = useState('split');
    const [copied, setCopied] = useState('');
    const [fullscreen, setFullscreen] = useState(false);
    const [history, setHistory] = useState([SAMPLE]);
    const [histIdx, setHistIdx] = useState(0);
    const editorRef = useRef(null);

    /* ── Cursor-aware insertion ── */
    const insert = useCallback((before, after = '', placeholder = '') => {
        const ta = editorRef.current; if (!ta) return;
        const s = ta.selectionStart, e = ta.selectionEnd;
        const sel = md.slice(s, e) || placeholder;
        const next = md.slice(0, s) + before + sel + after + md.slice(e);
        setMd(next);
        setHistory(h => [...h.slice(0, histIdx + 1), next]);
        setHistIdx(i => i + 1);
        setTimeout(() => { ta.focus(); ta.selectionStart = s + before.length; ta.selectionEnd = s + before.length + sel.length; }, 10);
    }, [md, histIdx]);

    const undo = () => { if (histIdx > 0) { setHistIdx(i => i - 1); setMd(history[histIdx - 1]); } };
    const redo = () => { if (histIdx < history.length - 1) { setHistIdx(i => i + 1); setMd(history[histIdx + 1]); } };

    const pushHistory = (val) => {
        setHistory(h => [...h.slice(0, histIdx + 1), val]);
        setHistIdx(i => i + 1);
    };

    const copyMd = () => { navigator.clipboard.writeText(md); setCopied('md'); setTimeout(() => setCopied(''), 2000); };
    const copyHtml = () => { navigator.clipboard.writeText(mdToHtml(md)); setCopied('html'); setTimeout(() => setCopied(''), 2000); };

    const saveMd = () => {
        const blob = new Blob([md], { type: 'text/markdown' });
        Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'document.md' }).click();
    };

    const saveHtml = () => {
        const css = `<style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1e293b;line-height:1.8}code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:.9em}pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto}pre code{background:none;padding:0}blockquote{border-left:4px solid #6366f1;margin:0;padding:10px 16px;background:#f5f3ff;border-radius:0 8px 8px 0;font-style:italic}table{border-collapse:collapse;width:100%}th,td{border:1px solid #e2e8f0;padding:8px 12px}th{background:#f8fafc}a{color:#6366f1}img{max-width:100%;border-radius:8px}hr{border:none;border-top:2px solid #e2e8f0;margin:24px 0}h1{font-size:2em;font-weight:800;border-bottom:2px solid #e2e8f0;padding-bottom:8px}h2{font-size:1.5em;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:6px}</style>`;
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title>${css}</head><body>${mdToHtml(md)}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'document.html' }).click();
    };

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
        const kd = (e) => {
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
            if (e.ctrlKey && e.key === 'b') { e.preventDefault(); insert('**', '**', 'bold'); }
            if (e.ctrlKey && e.key === 'i') { e.preventDefault(); insert('*', '*', 'italic'); }
        };
        window.addEventListener('keydown', kd);
        return () => window.removeEventListener('keydown', kd);
    }, [insert]);

    /* ── Stats ── */
    const words = md.trim() ? md.trim().split(/\s+/).length : 0;
    const chars = md.length;
    const lines = md.split('\n').length;

    /* ── Toolbar definition ── */
    const toolbar = [
        { icon: Bold, label: 'Bold (Ctrl+B)', action: () => insert('**', '**', 'bold') },
        { icon: Italic, label: 'Italic (Ctrl+I)', action: () => insert('*', '*', 'italic') },
        { icon: Strikethrough, label: 'Strikethrough', action: () => insert('~~', '~~', 'strikethrough') },
        { type: 'sep' },
        { icon: Hash, label: 'Heading 2', action: () => insert('## ', '', 'Heading') },
        { icon: Quote, label: 'Blockquote', action: () => insert('> ', '', 'Quote') },
        { icon: Code, label: 'Code Block', action: () => insert('```js\n', '  \n```', 'code here') },
        { type: 'sep' },
        { icon: List, label: 'Bullet List', action: () => insert('- ', '', 'List item') },
        { icon: ListOrdered, label: 'Numbered List', action: () => insert('1. ', '', 'List item') },
        { icon: Minus, label: 'Horizontal Rule', action: () => insert('\n---\n') },
        { type: 'sep' },
        { icon: Link2, label: 'Link', action: () => insert('[', '](https://)', 'link text') },
        { icon: Image, label: 'Image', action: () => insert('![', '](https://)', 'alt text') },
        { icon: Table, label: 'Table', action: () => insert('\n| Col 1 | Col 2 |\n| --- | --- |\n| Cell | Cell |\n') },
    ];

    /* ── Shared button cls ── */
    const tbBtn = 'p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors';
    const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700';

    const previewHtml = mdToHtml(md);

    return (
        <div className={`${fullscreen ? 'fixed inset-0 z-50' : 'min-h-screen py-8 px-4'} bg-slate-50 dark:bg-slate-900`}>
            {/* Inject preview styles */}
            <style dangerouslySetInnerHTML={{ __html: PREVIEW_CSS }} />

            <div className={fullscreen ? 'h-full flex flex-col' : 'max-w-7xl mx-auto'}>

                {/* Header */}
                {!fullscreen && (
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
                            <FileText className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Markdown Editor</h1>
                        <p className="text-slate-600 dark:text-slate-400 text-lg">Write Markdown with live preview, toolbar shortcuts, and one-click export</p>
                    </div>
                )}

                {/* ── Toolbar ── */}
                <div className={`${cardCls} rounded-t-2xl border-b-0 px-3 py-2 flex items-center gap-0.5 flex-wrap shadow-sm`}>
                    {toolbar.map((t, i) => t.type === 'sep' ? (
                        <div key={i} className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                    ) : (
                        <button key={i} onClick={t.action} title={t.label} className={tbBtn}>
                            <t.icon className="w-4 h-4" />
                        </button>
                    ))}

                    {/* Undo / Redo */}
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                    <button onClick={undo} disabled={histIdx <= 0} title="Undo (Ctrl+Z)" className={`${tbBtn} disabled:opacity-30`}><Undo2 className="w-4 h-4" /></button>
                    <button onClick={redo} disabled={histIdx >= history.length - 1} title="Redo (Ctrl+Y)" className={`${tbBtn} disabled:opacity-30`}><Redo2 className="w-4 h-4" /></button>

                    {/* Clear */}
                    <button onClick={() => { setMd(''); pushHistory(''); }} title="Clear editor" className={tbBtn}><Trash2 className="w-4 h-4 text-rose-500" /></button>

                    {/* View mode + fullscreen (right-aligned) */}
                    <div className="ml-auto flex items-center gap-1">
                        {[
                            { key: 'edit', label: 'Editor' },
                            { key: 'split', label: 'Split' },
                            { key: 'preview', label: 'Preview' },
                        ].map(v => (
                            <button key={v.key} onClick={() => setView(v.key)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v.key
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}>
                                {v.label}
                            </button>
                        ))}
                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                        <button onClick={() => setFullscreen(f => !f)} title="Toggle fullscreen" className={tbBtn}>
                            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* ── Editor / Preview panes ── */}
                <div className={`flex ${cardCls} overflow-hidden ${fullscreen ? 'flex-1' : 'rounded-b-2xl'}`}
                    style={{ minHeight: fullscreen ? 0 : '520px' }}>

                    {/* Editor pane */}
                    {view !== 'preview' && (
                        <div className={`${view === 'split' ? 'w-1/2 border-r border-slate-200 dark:border-slate-700' : 'w-full'} flex flex-col`}>
                            <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                    <AlignLeft className="w-3 h-3" />Markdown
                                </span>
                            </div>
                            <textarea
                                ref={editorRef}
                                value={md}
                                onChange={e => { setMd(e.target.value); pushHistory(e.target.value); }}
                                className="flex-1 w-full p-5 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm leading-relaxed resize-none outline-none placeholder-slate-400"
                                spellCheck={false}
                                placeholder="Start typing Markdown here..."
                            />
                        </div>
                    )}

                    {/* Preview pane */}
                    {view !== 'edit' && (
                        <div className={`${view === 'split' ? 'w-1/2' : 'w-full'} flex flex-col overflow-auto bg-white dark:bg-slate-800`}>
                            <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                                    <Eye className="w-3 h-3" />Preview
                                </span>
                            </div>
                            <div className="mdpv p-6 flex-1" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className={`${cardCls} border-t-0 rounded-b-2xl px-4 py-2 flex items-center justify-between flex-wrap gap-2`}>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                        <span>{words} words</span>
                        <span>{chars} chars</span>
                        <span>{lines} lines</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button onClick={copyMd}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5">
                            {copied === 'md' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}Copy MD
                        </button>
                        <button onClick={copyHtml}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5">
                            {copied === 'html' ? <Check className="w-3 h-3 text-emerald-500" /> : <Code className="w-3 h-3" />}Copy HTML
                        </button>
                        <button onClick={saveMd}
                            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition flex items-center gap-1.5">
                            <Download className="w-3 h-3" />Save .md
                        </button>
                        <button onClick={saveHtml}
                            className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition flex items-center gap-1.5">
                            <Download className="w-3 h-3" />Save .html
                        </button>
                    </div>
                </div>

                {/* ── SEO Content ── */}
                {!fullscreen && (
                    <div className="mt-10 space-y-5">

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Markdown Editor with Live Preview — Write, Format & Export</h2>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                Markdown is the most popular lightweight markup language in the world. Developers use it to write README files on GitHub. Technical writers use it for documentation sites. Bloggers use it for posts on platforms like Ghost, Hashnode, and Dev.to. Content teams use it in headless CMS tools like Contentful and Sanity. If you write on the web, you will eventually write Markdown.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                                The OmniWebKit Markdown Editor gives you everything you need to write great Markdown in your browser — with zero setup. The live split-pane view shows your formatted output in real time as you type on the left. A full formatting toolbar lets you insert bold, italic, strikethrough, headings, blockquotes, code blocks, bullet lists, numbered lists, horizontal rules, links, images, and tables with a single click. Keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic, Ctrl+Z for undo) let you move fast. All three view modes are available: Editor only, Preview only, or Split (side-by-side). A fullscreen mode removes all distractions when you need to focus.
                            </p>
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                When you are done writing, you have four export options: copy the raw Markdown to your clipboard, copy the rendered HTML to your clipboard (ready to paste into any CMS or HTML editor), download the file as a <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded text-indigo-600 dark:text-indigo-400">.md</code> file, or download as a <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded text-indigo-600 dark:text-indigo-400">.html</code> file (with embedded CSS styling ready to open in any browser). The word count, character count, and line count are always visible in the footer.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Markdown Syntax Quick Reference</h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {[
                                    { md: '**bold text**', desc: 'Bold (Ctrl+B)' },
                                    { md: '*italic text*', desc: 'Italic (Ctrl+I)' },
                                    { md: '~~strikethrough~~', desc: 'Strikethrough' },
                                    { md: '`inline code`', desc: 'Inline code' },
                                    { md: '# Heading 1 — ## Heading 2', desc: 'Headings (H1–H6 using 1–6 # symbols)' },
                                    { md: '> blockquote text', desc: 'Blockquote' },
                                    { md: '- item or * item', desc: 'Unordered bullet list' },
                                    { md: '1. item', desc: 'Ordered numbered list' },
                                    { md: '[link text](https://url.com)', desc: 'Hyperlink' },
                                    { md: '![alt](https://image.url)', desc: 'Image' },
                                    { md: '---', desc: 'Horizontal rule' },
                                    { md: '```lang\\ncode here\\n```', desc: 'Fenced code block with language' },
                                ].map(({ md: syntax, desc }) => (
                                    <div key={desc} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <code className="font-mono text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded flex-shrink-0">{syntax}</code>
                                        <span className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{desc}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Who Uses Markdown?</h2>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {[
                                    { t: 'Software developers', b: 'GitHub README files, code documentation, wikis, and issue comments are all written in Markdown. Most code editors (VS Code, JetBrains, Neovim) have excellent Markdown support.' },
                                    { t: 'Technical writers', b: 'Documentation platforms like Docusaurus, MkDocs, GitBook, and Read the Docs use Markdown as their primary authoring format.' },
                                    { t: 'Bloggers and writers', b: 'Platforms including Ghost, Hashnode, Dev.to, Substack, and Medium all support Markdown for writing blog posts, articles, and newsletters.' },
                                    { t: 'Note-takers', b: 'Tools like Obsidian, Notion, Logseq, and Bear use Markdown as their core note format. Notes written in Markdown are portable across tools.' },
                                    { t: 'Project managers', b: 'Many project management tools (Linear, Jira, Basecamp, Asana) support Markdown in issue descriptions, comments, and documentation sections.' },
                                    { t: 'Educators and students', b: 'Academic platforms and course management systems increasingly accept Markdown for assignments, notes, and study materials that need formula or code formatting.' },
                                ].map(({ t, b }) => (
                                    <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{t}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-4">
                                {[
                                    { q: 'What is Markdown?', a: 'Markdown is a lightweight markup language created by John Gruber in 2004. You use simple text symbols (like ** for bold and # for headings) to format text, which is then converted to HTML. It is designed to be readable as plain text even before conversion.' },
                                    { q: 'Does the Markdown editor save my work?', a: 'This editor runs entirely in your browser. Your content is stored in browser memory for the current session. To save your work, use the "Save .md" button to download a Markdown file, or "Copy MD" to copy it to your clipboard and paste into a file editor.' },
                                    { q: 'Can I use Markdown for tables?', a: 'Yes. Use the Table button in the toolbar to insert a Markdown table template. Markdown tables use pipe (|) characters to separate columns and hyphens (---) to define the header row.' },
                                    { q: 'What is the difference between .md and .html export?', a: '.md export saves the raw Markdown text — useful for version control (Git), Markdown-based platforms, and editing in other tools. .html export converts the Markdown to formatted HTML with embedded CSS styles, ready to open in any browser or paste into a webpage.' },
                                    { q: 'What Markdown flavour does this editor support?', a: 'This editor supports CommonMark-compatible standard Markdown including headings, bold, italic, strikethrough, inline code, fenced code blocks, blockquotes, ordered and unordered lists, links, images, horizontal rules, and tables (GitHub Flavored Markdown extension).' },
                                    { q: 'Does the editor work offline?', a: 'Once the page has loaded, all conversion and editing happens in your browser in JavaScript. You do not need an active internet connection to write or preview Markdown, but you need a connection to initially load the page.' },
                                    { q: 'Can I insert images?', a: 'Yes. Use the Image button in the toolbar to insert an image tag with a URL. Images hosted online (with a public URL) will appear in the preview. Locally stored images need to be hosted or converted to a data URL first.' },
                                    { q: 'Is there a word limit?', a: 'There is no word or character limit. The editor can handle very long documents. Performance may vary on very large documents (10,000+ words) in the live split view, since the preview re-renders on every keystroke.' },
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
                )}
            </div>
        </div>
    );
}
