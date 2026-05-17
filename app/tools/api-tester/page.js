'use client';
import { useState, useCallback, useRef } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
    Send, Plus, X, Copy, Check, Loader2, Clock, Globe,
    Trash2, Code2, Shield, Zap, BookOpen, ChevronRight,
    AlertTriangle, CheckCircle2, Info,
} from 'lucide-react';
import { API_V1 } from '@/lib/api-config';

// ─── Constants ───────────────────────────────────────
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
const METHOD_COLORS = {
    GET: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50  dark:bg-emerald-900/30',
    POST: 'text-blue-600    dark:text-blue-400    bg-blue-50     dark:bg-blue-900/30',
    PUT: 'text-amber-600   dark:text-amber-400   bg-amber-50    dark:bg-amber-900/30',
    PATCH: 'text-violet-600  dark:text-violet-400  bg-violet-50   dark:bg-violet-900/30',
    DELETE: 'text-red-600     dark:text-red-400     bg-red-50      dark:bg-red-900/30',
    HEAD: 'text-slate-600   dark:text-slate-400   bg-slate-100   dark:bg-slate-700',
    OPTIONS: 'text-cyan-600    dark:text-cyan-400    bg-cyan-50     dark:bg-cyan-900/30',
};
const METHOD_SELECT_COLORS = {
    GET: 'text-emerald-600 dark:text-emerald-400',
    POST: 'text-blue-600 dark:text-blue-400',
    PUT: 'text-amber-600 dark:text-amber-400',
    PATCH: 'text-violet-600 dark:text-violet-400',
    DELETE: 'text-red-600 dark:text-red-400',
    HEAD: 'text-slate-600 dark:text-slate-400',
    OPTIONS: 'text-cyan-600 dark:text-cyan-400',
};

const PRESETS = [
    { label: 'JSONPlaceholder GET', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1', body: '', headers: [{ key: 'Accept', value: 'application/json', enabled: true }] },
    { label: 'JSONPlaceholder POST', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', body: '{\n  "title": "Hello",\n  "body": "World",\n  "userId": 1\n}', headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }] },
    { label: 'GitHub User', method: 'GET', url: 'https://api.github.com/users/octocat', body: '', headers: [{ key: 'Accept', value: 'application/vnd.github.v3+json', enabled: true }] },
    { label: 'IP Geolocation', method: 'GET', url: 'https://ip-api.com/json', body: '', headers: [] },
    { label: 'Random Dog Image', method: 'GET', url: 'https://dog.ceo/api/breeds/image/random', body: '', headers: [] },
    { label: 'UUID Generate', method: 'GET', url: 'https://www.uuidtools.com/api/generate/v4', body: '', headers: [] },
];

const fmtSize = (b) => b > 1048576 ? (b / 1048576).toFixed(2) + ' MB' : b > 1024 ? (b / 1024).toFixed(1) + ' KB' : b + ' B';
const statusColor = (s) => {
    if (s >= 200 && s < 300) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800';
    if (s >= 300 && s < 400) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (s >= 400 && s < 500) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition';
const tabCls = (active) => `px-4 py-2 rounded-lg text-xs font-semibold transition-all ${active ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`;

// ─── Syntax-highlight JSON (simple) ─────────────────
function highlightJson(text) {
    try {
        const escaped = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return escaped
            .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) return `<span class="text-sky-400">${match}</span>`;
                    return `<span class="text-amber-300">${match}</span>`;
                }
                if (/true|false/.test(match)) return `<span class="text-violet-400">${match}</span>`;
                if (/null/.test(match)) return `<span class="text-slate-500">${match}</span>`;
                return `<span class="text-emerald-400">${match}</span>`;
            });
    } catch {
        return text;
    }
}

export default function ApiTester() {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json', enabled: true }]);
    const [params, setParams] = useState([{ key: '', value: '', enabled: true }]);
    const [body, setBody] = useState('');
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState('');
    const [activeTab, setActiveTab] = useState('headers');
    const [responseTab, setResponseTab] = useState('body');
    const [history, setHistory] = useState([]);
    const [showPresets, setShowPresets] = useState(false);
    const controllerRef = useRef(null);

    // ── Header helpers ──
    const addHeader = () => setHeaders(h => [...h, { key: '', value: '', enabled: true }]);
    const removeHeader = (i) => setHeaders(h => h.filter((_, j) => j !== i));
    const updateHeader = (i, f, v) => setHeaders(h => h.map((r, j) => j === i ? { ...r, [f]: v } : r));

    // ── Param helpers ──
    const addParam = () => setParams(p => [...p, { key: '', value: '', enabled: true }]);
    const removeParam = (i) => setParams(p => p.filter((_, j) => j !== i));
    const updateParam = (i, f, v) => setParams(p => p.map((r, j) => j === i ? { ...r, [f]: v } : r));

    // ── Build full URL with query params ──
    const buildUrl = () => {
        try {
            const base = new URL(url);
            params.filter(p => p.enabled && p.key).forEach(p => base.searchParams.set(p.key, p.value));
            return base.toString();
        } catch { return url; }
    };

    // ── Beautify JSON body ──
    const beautifyBody = () => {
        try { setBody(JSON.stringify(JSON.parse(body), null, 2)); } catch { /* not valid JSON */ }
    };

    // ── Apply preset ──
    const applyPreset = (preset) => {
        setMethod(preset.method);
        setUrl(preset.url);
        setBody(preset.body);
        setHeaders(preset.headers.length ? preset.headers : [{ key: 'Content-Type', value: 'application/json', enabled: true }]);
        setParams([{ key: '', value: '', enabled: true }]);
        setResponse(null);
        setShowPresets(false);
    };

    // ── Send request (via server-side proxy to bypass CORS) ──

    const sendRequest = useCallback(async () => {
        if (!url) return;
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();
        setLoading(true);
        setResponse(null);
        const t0 = performance.now();

        const hdrs = {};
        headers.filter(h => h.enabled && h.key).forEach(h => { hdrs[h.key] = h.value; });

        try {
            const proxyRes = await fetch(`${API_V1}/tools/proxy-request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: buildUrl(),
                    method,
                    headers: hdrs,
                    body: ['POST', 'PUT', 'PATCH'].includes(method) ? body : null,
                    timeout: 30,
                }),
                signal: controllerRef.current.signal,
            });

            const data = await proxyRes.json();
            const duration = data.duration || Math.round(performance.now() - t0);

            const result = {
                status: data.status,
                statusText: data.statusText || '',
                duration,
                body: data.body || '',
                isJson: data.isJson || false,
                headers: data.headers || {},
                size: data.size || 0,
                error: data.error || false,
            };
            setResponse(result);
            setHistory(prev => [{ method, url: buildUrl(), status: data.status, duration, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 20));
        } catch (err) {
            if (err.name !== 'AbortError') {
                const duration = Math.round(performance.now() - t0);
                setResponse({ status: 0, statusText: 'Proxy Error', duration, body: `Error: ${err.message}\n\nMake sure the Python backend is running on port 8000.\nThe API proxy routes requests server-side to bypass CORS.`, isJson: false, headers: {}, size: 0, error: true });
            }
        } finally { setLoading(false); }
    }, [url, method, headers, params, body]);


    const copyText = async (text, key) => {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    const clearHistory = () => setHistory([]);

    const enabledParamsCount = params.filter(p => p.enabled && p.key).length;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'API Tester', href: '/tools/api-tester' }]} />

                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
                        <Globe className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">API Tester</h1>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                        Test REST APIs directly from your browser. Send HTTP requests, inspect responses, and debug endpoints — no installation needed.
                    </p>
                </div>

                {/* ── Presets bar ── */}
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Quick Presets:</span>
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            onClick={() => applyPreset(p)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* ── Request bar ── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 mb-4">
                    <div className="flex gap-2 flex-col sm:flex-row">
                        <select
                            value={method}
                            onChange={e => setMethod(e.target.value)}
                            className={`sm:w-32 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${METHOD_SELECT_COLORS[method]}`}
                        >
                            {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendRequest()}
                            placeholder="https://api.example.com/endpoint"
                            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 font-mono placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                        />
                        <button
                            onClick={sendRequest}
                            disabled={loading || !url}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {loading ? 'Sending…' : 'Send'}
                        </button>
                    </div>
                </div>

                {/* ── Main grid ── */}
                <div className="grid lg:grid-cols-2 gap-4">

                    {/* ── Request panel ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="flex gap-1 p-3 border-b border-slate-100 dark:border-slate-700">
                            {[
                                { id: 'headers', label: 'Headers' },
                                { id: 'params', label: `Params${enabledParamsCount ? ` (${enabledParamsCount})` : ''}` },
                                { id: 'body', label: 'Body' },
                                { id: 'history', label: 'History' },
                            ].map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={tabCls(activeTab === tab.id)}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-4">
                            {/* Headers tab */}
                            {activeTab === 'headers' && (
                                <div className="space-y-2">
                                    {headers.map((h, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input
                                                type="checkbox" checked={h.enabled}
                                                onChange={e => updateHeader(i, 'enabled', e.target.checked)}
                                                className="w-3.5 h-3.5 accent-emerald-500 flex-shrink-0"
                                            />
                                            <input value={h.key} onChange={e => updateHeader(i, 'key', e.target.value)} placeholder="Header name" className={`${inputCls} flex-1`} />
                                            <input value={h.value} onChange={e => updateHeader(i, 'value', e.target.value)} placeholder="Value" className={`${inputCls} flex-1`} />
                                            <button onClick={() => removeHeader(i)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition flex-shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addHeader} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center justify-center gap-1">
                                        <Plus className="w-3 h-3" /> Add Header
                                    </button>
                                </div>
                            )}

                            {/* Params tab */}
                            {activeTab === 'params' && (
                                <div className="space-y-2">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Query parameters are appended to the URL automatically.</p>
                                    {params.map((p, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input
                                                type="checkbox" checked={p.enabled}
                                                onChange={e => updateParam(i, 'enabled', e.target.checked)}
                                                className="w-3.5 h-3.5 accent-emerald-500 flex-shrink-0"
                                            />
                                            <input value={p.key} onChange={e => updateParam(i, 'key', e.target.value)} placeholder="Key" className={`${inputCls} flex-1`} />
                                            <input value={p.value} onChange={e => updateParam(i, 'value', e.target.value)} placeholder="Value" className={`${inputCls} flex-1`} />
                                            <button onClick={() => removeParam(i)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition flex-shrink-0">
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    <button onClick={addParam} className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition flex items-center justify-center gap-1">
                                        <Plus className="w-3 h-3" /> Add Parameter
                                    </button>
                                    {enabledParamsCount > 0 && (
                                        <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono break-all">{buildUrl()}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Body tab */}
                            {activeTab === 'body' && (
                                <div>
                                    {!['POST', 'PUT', 'PATCH'].includes(method) && (
                                        <div className="flex items-center gap-2 mb-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Request body is typically not used with {method} requests.</p>
                                        </div>
                                    )}
                                    <div className="flex justify-end mb-2">
                                        <button onClick={beautifyBody} className="text-xs px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition flex items-center gap-1">
                                            <Code2 className="w-3 h-3" /> Beautify JSON
                                        </button>
                                    </div>
                                    <textarea
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        placeholder={'{\n  "key": "value"\n}'}
                                        rows={10}
                                        className="w-full px-4 py-3 bg-slate-900 dark:bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 resize-y outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            )}

                            {/* History tab */}
                            {activeTab === 'history' && (
                                <div>
                                    {history.length > 0 && (
                                        <div className="flex justify-end mb-2">
                                            <button onClick={clearHistory} className="text-xs flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-red-500 transition">
                                                <Trash2 className="w-3 h-3" /> Clear
                                            </button>
                                        </div>
                                    )}
                                    <div className="space-y-1 max-h-72 overflow-y-auto">
                                        {history.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                                <Clock className="w-8 h-8 mb-2 opacity-30" />
                                                <p className="text-sm">No requests yet</p>
                                            </div>
                                        ) : history.map((h, i) => (
                                            <button
                                                key={i}
                                                onClick={() => { setUrl(h.url); setMethod(h.method); }}
                                                className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl text-left transition group"
                                            >
                                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${METHOD_COLORS[h.method]}`}>{h.method}</span>
                                                <span className="text-xs text-slate-600 dark:text-slate-400 truncate flex-1 font-mono">{h.url}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${statusColor(h.status)}`}>{h.status}</span>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{h.duration}ms</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Response panel ── */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        {!response && !loading ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 p-8">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                                    <Send className="w-7 h-7 opacity-40" />
                                </div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Send a request to see the response</p>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Supports GET, POST, PUT, PATCH, DELETE and more</p>
                            </div>
                        ) : loading ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[300px] p-8">
                                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-3" />
                                <p className="text-sm text-slate-600 dark:text-slate-400">Sending request…</p>
                            </div>
                        ) : (
                            <>
                                {/* Status bar */}
                                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3 flex-wrap">
                                    <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${statusColor(response.status)}`}>
                                        {response.status || 'ERR'} {response.statusText}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                        <Clock className="w-3 h-3" />{response.duration}ms
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{fmtSize(response.size)}</span>
                                    {response.status >= 200 && response.status < 300 && (
                                        <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Success
                                        </span>
                                    )}
                                    {response.error && (
                                        <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                                        </span>
                                    )}
                                </div>

                                {/* Response tabs */}
                                <div className="flex gap-1 px-4 pt-3">
                                    {['body', 'headers'].map(t => (
                                        <button key={t} onClick={() => setResponseTab(t)} className={tabCls(responseTab === t)}>
                                            {t === 'body' ? 'Body' : `Headers (${Object.keys(response.headers).length})`}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-4">
                                    {responseTab === 'body' && (
                                        <div className="relative">
                                            <button
                                                onClick={() => copyText(response.body, 'resp')}
                                                className="absolute top-2 right-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition z-10 flex items-center gap-1"
                                            >
                                                {copied === 'resp' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                                                <span className="text-xs text-slate-300">{copied === 'resp' ? 'Copied' : 'Copy'}</span>
                                            </button>
                                            <div className="bg-slate-950 rounded-xl p-4 overflow-auto max-h-96">
                                                {response.isJson ? (
                                                    <pre className="text-xs font-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightJson(response.body) }} />
                                                ) : (
                                                    <pre className="text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">{response.body}</pre>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {responseTab === 'headers' && (
                                        <div className="space-y-1 max-h-80 overflow-y-auto">
                                            {Object.entries(response.headers).map(([k, v]) => (
                                                <div key={k} className="flex items-start gap-3 p-2.5 bg-slate-50 dark:bg-slate-700/40 rounded-lg">
                                                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-[140px] flex-shrink-0">{k}</span>
                                                    <span className="text-xs text-slate-700 dark:text-slate-300 font-mono break-all">{v}</span>
                                                    <button onClick={() => copyText(v, `h-${k}`)} className="flex-shrink-0 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition ml-auto">
                                                        {copied === `h-${k}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* ── SEO Content Section ── */}
        {/* ── SEO Content & Schema ── */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "API Tester",
          "operatingSystem": "All",
          "applicationCategory": "DeveloperApplication",
          "offers": {
            "@type": "Offer",
            "price": "0.00",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "Lazydesigners",
            "url": "https://github.com/Dtshirt/omniwebkit"
          }
        }) }} />
        <div className="prose-premium mt-10">
          <h2>About the Tool</h2>
          <p>Debugging endpoints shouldn't require a 300MB download and a forced account login. This online <strong>api tester</strong> is a lightweight, browser-based HTTP client that lets you test REST APIs instantly. Whether you are building a new backend, integrating a third-party service, or just verifying payload structures, this tool gives you raw access to send requests and inspect responses without the friction of desktop software.</p>
          <p>I built this because half the time, developers just need to fire off a quick GET or POST request to see what comes back. You get the power of a dedicated HTTP client—custom headers, query builders, and JSON highlighting—packaged into a single, lightning-fast web interface.</p>

          <h2>How to Use</h2>
          <p>Testing your endpoints takes less than ten seconds. Here is how you send your first request.</p>
          <ol>
            <li><strong>Drop in your endpoint:</strong> Paste your API URL into the main address bar. You can also click one of the "Quick Presets" to load a working example immediately.</li>
            <li><strong>Select the method:</strong> Choose your HTTP method (GET, POST, PUT, PATCH, DELETE) from the dropdown next to the URL.</li>
            <li><strong>Configure headers & params:</strong> If you need an auth token or custom query strings, jump into the Headers or Params tabs. The tool automatically encodes your query strings.</li>
            <li><strong>Add your payload (if needed):</strong> For POST or PUT requests, switch to the Body tab. Drop your JSON in and hit the "Beautify JSON" button to format it properly.</li>
            <li><strong>Fire the request:</strong> Click Send. The tool routes your call and instantly displays the status code, response time, and the highlighted JSON response body.</li>
          </ol>

          <h2>Privacy & Security</h2>
          <p>Here's the thing — API keys and bearer tokens are sensitive. When you use this api tester, your session data stays private.</p>
          <p>We do not log your request payloads, endpoints, or API keys in a database. Your history is stored strictly in your browser's local session and vanishes the moment you close the tab. To bypass strict CORS errors that block normal browser requests, your calls route through a secure, ephemeral server-side proxy. The proxy acts as a pass-through and immediately discards your data once the response hits your screen. You get the freedom to test secure endpoints safely.</p>

          <h2>Features</h2>
          <p>I cut out the enterprise bloat and kept exactly what you actually use to debug APIs.</p>
          <ul>
            <li><strong>Complete HTTP Support:</strong> Send GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests effortlessly.</li>
            <li><strong>Intelligent Query Builder:</strong> Stop manually encoding URLs. Add key-value pairs in the Params tab, and the tool builds the query string dynamically.</li>
            <li><strong>Header Management:</strong> Inject custom headers, Bearer tokens, and Content-Type declarations with simple toggle switches.</li>
            <li><strong>Response Insights:</strong> Instantly see the HTTP status code (color-coded for success or failure), the response time in milliseconds, and the exact payload size.</li>
            <li><strong>JSON Auto-Formatting:</strong> The body editor comes with a one-click beautifier, and the response window automatically color-highlights valid JSON for easy reading.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <p>For those who want to know how the request engine operates under the hood.</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Specification</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Request Engine</strong></td>
                  <td>Server-side proxy bypass (CORS-immune)</td>
                </tr>
                <tr>
                  <td><strong>Supported Methods</strong></td>
                  <td>GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS</td>
                </tr>
                <tr>
                  <td><strong>History Storage</strong></td>
                  <td>Session-only (Max 20 requests)</td>
                </tr>
                <tr>
                  <td><strong>Payload Handling</strong></td>
                  <td>Raw JSON, text, form-data support via proxy</td>
                </tr>
                <tr>
                  <td><strong>Timeout Limit</strong></td>
                  <td>30 seconds per request</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Postman vs Our Tool: Why Choose Ours?</h2>
          <p>Postman is a fantastic enterprise tool, but it has grown heavy. If you manage massive team workspaces, complex CI/CD pipelines, or automated test suites, stick with Postman. But if you just want to test an endpoint right now without signing in, syncing workspaces, or waiting for a bloated electron app to load, this online api tester is your answer.</p>
          <p>Our tool requires zero installation and loads in milliseconds. It handles CORS issues automatically via a background proxy, meaning you get desktop-level request power straight from your browser tab. Use it when you need speed, simplicity, and immediate results.</p>

          <h2>Frequently Asked Questions</h2>
          
          <h3>Is this API tester actually free?</h3>
          <p>Yes. There are no premium tiers, no hidden paywalls, and no forced account creations. It is a completely free developer utility.</p>

          <h3>Why isn't my request hitting a CORS block?</h3>
          <p>Normally, browsers block cross-origin requests. To fix this, our tool routes your request through a temporary server-side proxy. The proxy fetches the data and hands it back to your browser, bypassing CORS entirely.</p>

          <h3>Can I send a POST request with a JSON body?</h3>
          <p>Absolutely. Just select POST, make sure you add a <code>Content-Type: application/json</code> header, and drop your data into the Body tab. Hit Send and watch it work.</p>

          <h3>How do I test an endpoint with a Bearer token?</h3>
          <p>Jump into the Headers tab. Type <code>Authorization</code> in the key field and <code>Bearer YOUR_TOKEN</code> in the value field. The tool will inject it into your HTTP request.</p>

          <h3>Does this tool save my API keys?</h3>
          <p>No. Your request history is temporarily saved in your active browser session so you don't lose your work if you misclick. Once you close the tab, everything is wiped clean. We do not store your tokens on our servers.</p>
 
        </div>
            </div>
        </div>
    );
}
