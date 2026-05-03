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
                <div className="mt-16 space-y-6">

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online API Tester — Test REST APIs in Your Browser</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Building and debugging APIs is one of the most common tasks in web development. Whether you are working on a REST API, testing a third-party integration, or verifying that your backend returns the right data, you need a tool that lets you send HTTP requests quickly and see exactly what comes back.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The OmniWebKit API Tester is a free, browser-based HTTP client that lets you do exactly that. You do not need to install Postman, configure an IDE plugin, or write a single line of code. Just enter a URL, choose your HTTP method, add headers or a request body if needed, and hit Send. The response appears instantly — status code, response time, response size, body, and all response headers included.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            This tool is perfect for frontend developers testing backend APIs, QA engineers verifying endpoint behaviour, students learning how HTTP works, and anyone who needs to make a quick API call without pulling up a full desktop application.
                        </p>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Use the API Tester</h2>
                        <div className="space-y-5">
                            {[
                                { n: '1', icon: Globe, title: 'Enter Your API URL', desc: 'Type or paste the full API endpoint URL into the address bar at the top. For example: https://api.example.com/users. You can also click any Quick Preset to load a real-world API URL instantly.' },
                                { n: '2', icon: Zap, title: 'Choose an HTTP Method', desc: 'Select the method from the dropdown: GET to retrieve data, POST to create, PUT to replace, PATCH to partially update, or DELETE to remove a resource. HEAD and OPTIONS are also supported for advanced use cases.' },
                                { n: '3', icon: Code2, title: 'Add Headers and Parameters', desc: 'Use the Headers tab to add authentication tokens (Authorization: Bearer …), content type declarations, or any custom headers. Use the Params tab to add query parameters like ?page=1&limit=10 — they are appended to the URL automatically.' },
                                { n: '4', icon: BookOpen, title: 'Add a Request Body', desc: 'For POST, PUT, and PATCH requests, switch to the Body tab and enter your JSON payload. Use the Beautify JSON button to auto-format messy JSON before sending. The editor uses a dark terminal-style background for comfortable reading.' },
                                { n: '5', icon: Send, title: 'Send and Inspect the Response', desc: 'Click Send (or press Enter) to fire the request. The response panel shows the HTTP status code (200, 404, 500 etc.), response time in milliseconds, body size, and the full response body with JSON syntax highlighting. Switch to the Headers tab in the response panel to see all response headers.' },
                                { n: '6', icon: Clock, title: 'Use Request History', desc: 'Every successful request is saved in your session history. Click any history item to restore that URL and method so you can re-run or modify it. You can clear the history at any time.' },
                            ].map(({ n, icon: Icon, title, desc }) => (
                                <div key={n} className="flex gap-4">
                                    <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-bold flex items-center justify-center">{n}</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Key Features</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: Zap, title: 'All HTTP Methods', desc: 'Supports GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS requests.', c: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                                { icon: Code2, title: 'JSON Syntax Highlighting', desc: 'Response JSON is colour-highlighted for keys, strings, numbers, booleans, and null values.', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                                { icon: ChevronRight, title: 'Query Parameter Builder', desc: 'Add query parameters visually. They are encoded and appended to the URL automatically.', c: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                                { icon: Shield, title: 'Custom Request Headers', desc: 'Add any headers including Authorization, Accept, X-API-Key, and Content-Type with simple key-value pairs.', c: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                                { icon: Clock, title: 'Request History', desc: 'Automatically saves your last 20 requests. Click any history item to reload that request instantly.', c: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                                { icon: BookOpen, title: 'Quick Presets', desc: 'Load real-world API examples in one click — JSONPlaceholder, GitHub, IP geolocation, and more.', c: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20' },
                                { icon: Info, title: 'Response Metadata', desc: 'See the exact HTTP status code, status text, response time (ms), and response body size for every request.', c: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
                                { icon: Copy, title: 'One-click Copy', desc: 'Copy the full response body or individual response header values to clipboard with a single click.', c: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-700' },
                            ].map(({ icon: Icon, title, desc, c, bg }) => (
                                <div key={title} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${c}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">HTTP Methods Explained</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                            REST APIs use different HTTP methods to represent different actions on a resource. Choosing the right method is fundamental to building and testing APIs correctly. Here is what each method means and when to use it.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { method: 'GET', desc: 'Retrieve a resource or list of resources. GET requests should never modify data. They are safe and can be cached.' },
                                { method: 'POST', desc: 'Create a new resource. Send data in the request body. The server returns the created resource, usually with a 201 Created status.' },
                                { method: 'PUT', desc: 'Replace an entire resource with the data in the request body. If the resource does not exist, some APIs will create it.' },
                                { method: 'PATCH', desc: 'Partially update a resource. Only send the fields you want to change. More efficient than PUT when updating one or two fields.' },
                                { method: 'DELETE', desc: 'Remove a resource permanently. A successful delete typically returns 200 OK or 204 No Content with an empty body.' },
                                { method: 'HEAD', desc: 'Like GET, but returns only the response headers — not the body. Useful for checking if a resource exists or checking cache metadata.' },
                                { method: 'OPTIONS', desc: 'Returns the HTTP methods the server supports for a URL. Used by browsers in CORS preflight requests before cross-origin API calls.' },
                            ].map(({ method: m, desc }) => (
                                <div key={m} className="flex gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-100 dark:border-slate-700">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded self-start mt-0.5 flex-shrink-0 ${METHOD_COLORS[m]}`}>{m}</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">HTTP Status Codes You'll See</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                            Every HTTP response includes a three-digit status code. Understanding what these codes mean is essential for debugging APIs. The API Tester colour-codes them for quick identification — green for success, blue for redirects, amber for client errors, and red for server errors.
                        </p>
                        <div className="space-y-3">
                            {[
                                { range: '2xx — Success', color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20', examples: '200 OK, 201 Created, 204 No Content', desc: 'The request was received, understood, and processed successfully. 200 is the standard success code. 201 means a resource was created. 204 means success but no content to return.' },
                                { range: '3xx — Redirection', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', examples: '301 Moved Permanently, 302 Found, 304 Not Modified', desc: 'The client must take additional action to complete the request. 301 means the URL has permanently changed. 304 means the cached version is still valid.' },
                                { range: '4xx — Client Errors', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', examples: '400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found', desc: 'The request contained an error on the client side. 400 means bad syntax. 401 means authentication is required. 403 means you are authenticated but not allowed. 404 means the resource was not found.' },
                                { range: '5xx — Server Errors', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20', examples: '500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable', desc: 'The server failed to fulfil a valid request. 500 is a generic server-side error. 502 means the gateway received an invalid response. 503 means the server is temporarily unavailable.' },
                            ].map(({ range, color, examples, desc }) => (
                                <div key={range} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>{range}</span>
                                    </div>
                                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1">{examples}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this API tester free?', a: 'Yes, 100% free. No account, no installation, no usage limits.' },
                                { q: 'What is the difference between this API tester and Postman?', a: 'Postman is a full desktop application with teams, environments, automated testing, and mock servers. This tool is a lightweight browser-based alternative — faster to access, requires no installation, and is perfect for quick API tests and learning. For large teams or complex workflows, Postman has more features.' },
                                { q: 'Does this tool have CORS issues?', a: 'No. Unlike most browser-based API testers, this tool routes all requests through a server-side proxy. Your API call is made from the server (not the browser), so CORS restrictions do not apply. Every API that works with Postman or curl will work here.' },
                                { q: 'Can I test APIs that require authentication?', a: 'Yes. Go to the Headers tab and add an Authorization header with your token. For example: Key = Authorization, Value = Bearer your-token-here. You can also add API keys as headers or as query parameters using the Params tab.' },
                                { q: 'How do I send a POST request with a JSON body?', a: 'Select POST from the method dropdown. In the Headers tab, make sure Content-Type is set to application/json. Switch to the Body tab and enter your JSON. You can use the Beautify JSON button to auto-format it. Then click Send.' },
                                { q: 'Does the API tester save my requests?', a: 'Your last 20 requests are saved in your browser session as History (not persisted across page loads). You can click any history item to restore that URL and method. No data is sent to any server — everything stays in your browser.' },
                                { q: 'What format does the response body support?', a: 'The API tester handles any text-based response. JSON responses are automatically syntax-highlighted in colour for keys, strings, numbers, booleans, and null values. HTML, XML, plain text, and other text formats display as plain preformatted text.' },
                                { q: 'How do I add query parameters like ?page=2?', a: 'Use the Params tab. Add a row with Key = page and Value = 2. The tool will encode and append the parameters to the URL automatically. You can see the final URL with parameters shown in a preview at the bottom of the Params tab.' },
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
