'use client';
import { useState, useCallback } from 'react';
import { Code, Copy, Check, RotateCcw, AlignLeft, Minimize2, Download, AlertCircle } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

/* Toast */
function useToast() {
    const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
    const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 2500); };
    const el = msg ? (<div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}</div>) : null;
    return { show, el };
}

/* ─── SQL engine ────────────────────────────────────────────────────── */
const KW = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'ON', 'AS', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'FULL', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IS', 'NULL', 'BETWEEN', 'LIKE', 'EXISTS', 'DISTINCT', 'ASC', 'DESC', 'WITH', 'RECURSIVE', 'IF', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'CASCADE', 'CONSTRAINT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'DEFAULT', 'CHECK', 'UNIQUE', 'AUTO_INCREMENT', 'SERIAL', 'VARCHAR', 'INT', 'INTEGER', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'FLOAT', 'DOUBLE', 'DECIMAL', 'CHAR', 'BLOB', 'BIGINT', 'SMALLINT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'CAST', 'CONVERT', 'CONCAT', 'SUBSTRING', 'TRIM', 'UPPER', 'LOWER', 'LENGTH', 'REPLACE', 'ROUND', 'FLOOR', 'CEIL', 'ABS', 'NOW', 'CURDATE', 'DATEDIFF', 'DATE_FORMAT', 'EXTRACT', 'YEAR', 'MONTH', 'DAY', 'HOUR', 'MINUTE', 'SECOND'];

function formatSQL(sql, indent = '  ') {
    if (!sql.trim()) return '';
    let f = sql.replace(/\s+/g, ' ').trim();
    KW.forEach(k => { f = f.replace(new RegExp(`\\b${k}\\b`, 'gi'), k); });
    ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'CROSS JOIN', 'FULL JOIN', 'JOIN', 'ON', 'WITH'].forEach(k => {
        f = f.replace(new RegExp(`(?<!^)\\b(${k})\\b`, 'g'), `\n${k}`);
    });
    const lines = f.split('\n'), out = [];
    let inSel = false;
    for (let l of lines) {
        l = l.trim();
        if (l.startsWith('SELECT')) inSel = true;
        if (['FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'FULL', 'SET', 'VALUES'].some(k => l.startsWith(k))) inSel = false;
        if (inSel && l.includes(',') && !l.startsWith('SELECT')) {
            l.split(',').forEach((p, i) => out.push((i > 0 ? indent + indent : indent) + p.trim() + (i < l.split(',').length - 1 ? ',' : '')));
        } else {
            const sub = ['AND', 'OR', 'ON', 'WHEN', 'THEN', 'ELSE'].some(k => l.startsWith(k));
            const cls = ['FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'SET', 'VALUES'].some(k => l.startsWith(k));
            const jn = l.includes('JOIN');
            const top = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'WITH'].some(k => l.startsWith(k));
            if (sub) out.push(indent + l);
            else if (jn || top || cls) out.push(l);
            else out.push(indent + l);
        }
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n');
}

function minifySQL(sql) {
    return sql.replace(/\s+/g, ' ').replace(/\s*([,()])\s*/g, '$1').trim();
}

function highlightSQL(sql) {
    if (!sql) return '';
    let h = sql.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    h = h.replace(/'([^']*)'/g, '<span style="color:#a5d6a7">\'$1\'</span>');
    h = h.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span style="color:#f48fb1">$1</span>');
    KW.forEach(k => { h = h.replace(new RegExp(`\\b(${k})\\b`, 'g'), `<span style="color:#64b5f6;font-weight:700">$1</span>`); });
    h = h.replace(/(--.*$)/gm, '<span style="color:#757575;font-style:italic">$1</span>');
    return h;
}

const SAMPLES = [
    { l: 'Simple SELECT', s: "SELECT u.id, u.name, u.email, o.total FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = 1 AND o.total > 100 ORDER BY o.total DESC LIMIT 10;" },
    { l: 'Subquery', s: "SELECT name, department, salary FROM employees WHERE salary > (SELECT AVG(salary) FROM employees) ORDER BY salary DESC;" },
    { l: 'CREATE TABLE', s: "CREATE TABLE products (id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(255) NOT NULL, price DECIMAL(10,2) DEFAULT 0.00, category_id INT, created_at TIMESTAMP DEFAULT NOW(), FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE);" },
    { l: 'INSERT', s: "INSERT INTO users (name, email, role) VALUES ('John Doe', 'john@example.com', 'admin'), ('Jane Smith', 'jane@example.com', 'user');" },
];

/* ─── Component ─────────────────────────────────────────────────────── */
export default function SqlFormatter() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState('format');
    const toast = useToast();

    const process = useCallback(() => {
        if (!input.trim()) { toast.show('Enter SQL first', 'err'); return; }
        const r = mode === 'format' ? formatSQL(input) : minifySQL(input);
        setOutput(r); toast.show(mode === 'format' ? 'Formatted!' : 'Minified!');
    }, [input, mode]);

    const copyOut = () => { if (!output) return; navigator.clipboard.writeText(output); toast.show('Copied!'); };
    const dlFile = () => { if (!output) return; Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([output], { type: 'text/sql' })), download: 'query.sql' }).click(); toast.show('Downloaded query.sql'); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            {toast.el}
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'SQL Formatter', href: '/tools/sql-formatter' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
                        <Code className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">SQL Formatter</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Format, beautify, and minify SQL with syntax highlighting</p>
                </div>

                {/* Main card */}
                <div className={`${cardCls} p-5 sm:p-7`}>

                    {/* Toolbar */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5">
                            {[{ m: 'format', i: AlignLeft, l: 'Format' }, { m: 'minify', i: Minimize2, l: 'Minify' }].map(({ m, i: I, l }) => (
                                <button key={m} onClick={() => setMode(m)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition ${mode === m ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'
                                        }`}>
                                    <I className="w-3.5 h-3.5" />{l}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1 flex-wrap">
                            {SAMPLES.map(s => (
                                <button key={s.l} onClick={() => setInput(s.s)}
                                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                                    {s.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Editor panels */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {/* Input */}
                        <div>
                            <label className={labelCls}>Input SQL</label>
                            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste your SQL query here..."
                                className="w-full h-64 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white resize-none outline-none focus:ring-2 focus:ring-blue-500/40 transition" spellCheck={false} />
                        </div>

                        {/* Output */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className={labelCls}>Output</label>
                                <div className="flex gap-1">
                                    <button onClick={copyOut} disabled={!output} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50">
                                        <Copy className="w-3 h-3" />Copy
                                    </button>
                                    <button onClick={dlFile} disabled={!output} className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition disabled:opacity-50">
                                        <Download className="w-3 h-3" />.sql
                                    </button>
                                </div>
                            </div>
                            <div className="w-full h-64 px-4 py-3 bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl overflow-auto">
                                {output
                                    ? <pre className="text-sm font-mono" dangerouslySetInnerHTML={{ __html: highlightSQL(output) }} />
                                    : <span className="text-sm text-slate-500">Formatted SQL appears here...</span>
                                }
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="flex gap-2">
                        <button onClick={process} disabled={!input}
                            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2">
                            {mode === 'format' ? <AlignLeft className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                            {mode === 'format' ? 'Format SQL' : 'Minify SQL'}
                        </button>
                        <button onClick={() => { setInput(''); setOutput(''); }}
                            className="px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-xl transition">
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online SQL Formatter — Beautify and Minify SQL Queries</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            SQL queries can become hard to read quickly. A single line with multiple joins, subqueries, and conditions is difficult to debug and even harder to review in a team. Formatting your SQL is not just a style preference — it is a productivity tool. Clean, indented SQL is easier to understand, faster to debug, and less likely to contain hidden errors.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This free SQL Formatter takes any SQL query and reformats it with proper indentation, uppercase keywords, and logical line breaks. Major clauses like SELECT, FROM, WHERE, JOIN, GROUP BY, and ORDER BY each get their own line. Sub-clauses like AND, OR, and ON are indented one level. Column lists in SELECT statements are split across lines for readability. The output panel uses syntax highlighting with colour-coded keywords, strings, numbers, and comments.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Need the opposite? Switch to Minify mode to compress your SQL into a single line — perfect for embedding in code or reducing payload size. Copy the result, download it as a .sql file, or use the built-in sample queries to test. Everything runs in your browser. No data is sent to any server.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">How the SQL Formatter Works</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Keyword Uppercasing', c: 'text-blue-600 dark:text-blue-400', b: 'All SQL keywords are automatically converted to uppercase. SELECT, FROM, WHERE, JOIN, and over 100 other keywords are recognised and capitalised.' },
                                { t: 'Clause Line Breaks', c: 'text-indigo-600 dark:text-indigo-400', b: 'Major clauses get their own line: SELECT, FROM, WHERE, GROUP BY, ORDER BY, HAVING, LIMIT, JOIN, ON, UNION, and more. This creates a clear visual structure.' },
                                { t: 'Smart Indentation', c: 'text-emerald-600 dark:text-emerald-400', b: 'Sub-clauses like AND, OR, WHEN, THEN, and ELSE are indented one level. Column lists in SELECT are expanded with consistent indentation.' },
                                { t: 'Syntax Highlighting', c: 'text-violet-600 dark:text-violet-400', b: 'The output panel shows keywords in blue, strings in green, numbers in pink, and comments in grey. This makes it easy to scan the query at a glance.' },
                                { t: 'Minify Mode', c: 'text-amber-600 dark:text-amber-400', b: 'Compress any SQL query into a single line. Whitespace is removed, and parentheses/commas are tightened. Perfect for embedding in application code.' },
                                { t: 'Sample Queries', c: 'text-rose-600 dark:text-rose-400', b: 'Four built-in sample queries cover common patterns: SELECT with JOIN, subquery, CREATE TABLE, and INSERT. Click any sample to load it instantly.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this SQL formatter free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
                                { q: 'What SQL dialects are supported?', a: 'The formatter works with standard SQL syntax compatible with MySQL, PostgreSQL, SQLite, SQL Server, and Oracle.' },
                                { q: 'Does it change my query logic?', a: 'No. It only changes formatting — whitespace, indentation, and letter case. The query logic remains identical.' },
                                { q: 'Can I download the formatted SQL?', a: 'Yes. Click the .sql download button to save the output as a query.sql file.' },
                                { q: 'What is minify mode?', a: 'Minify compresses your SQL into a single line by removing whitespace and tightening punctuation.' },
                                { q: 'Does it handle comments?', a: 'Yes. Single-line comments (--) are preserved and highlighted in grey in the output.' },
                                { q: 'Does it send data to a server?', a: 'No. Everything runs in your browser. Your SQL queries are never uploaded anywhere.' },
                                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive. Input and output panels stack vertically on smaller screens.' },
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
