'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Code2, Copy, Check, Download, Eye, Clock, Hash, Type,
  AlignLeft, ArrowLeft, Loader2, AlertTriangle, Share2,
} from 'lucide-react';

const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const EXT_MAP = { javascript: 'js', python: 'py', typescript: 'ts', html: 'html', css: 'css', json: 'json', java: 'java', sql: 'sql', bash: 'sh', yaml: 'yml', xml: 'xml', markdown: 'md', swift: 'swift', kotlin: 'kt', dart: 'dart', shell: 'sh', toml: 'toml', ruby: 'rb', go: 'go', rust: 'rs', php: 'php', lua: 'lua', perl: 'pl', r: 'r', scala: 'scala' };

function fmtTime(ts) { return new Date(ts).toLocaleDateString() + ' ' + new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }

export default function PasteViewPage() {
  const params = useParams();
  const id = params.id;

  const [paste, setPaste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [showLines, setShowLines] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/api/paste?id=${id}`);
        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
          // If server storage isn't configured, or paste not found on server, try local storage
          const saved = JSON.parse(localStorage.getItem('owk_pastes') || '[]');
          const localPaste = saved.find(p => p.id === id);
          
          if (localPaste) {
            // Check expiry for local paste
            if (localPaste.expiresAt && localPaste.expiresAt < Date.now()) {
                throw new Error("Paste expired");
            }
            // Update view count locally
            localPaste.views = (localPaste.views || 0) + 1;
            localStorage.setItem('owk_pastes', JSON.stringify(saved));
            
            setPaste(localPaste);
            return; // Success locally
          }
          throw new Error(data.error || `Paste not found (${res.status})`);
        }
        
        setPaste(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const cp = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const dl = () => {
    if (!paste) return;
    const ext = EXT_MAP[paste.language] || 'txt';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([paste.code], { type: 'text/plain' }));
    a.download = `${paste.title}.${ext}`;
    a.click();
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back link */}
        <Link href="/tools/pastebin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />Back to Pastebin
        </Link>

        {/* Loading */}
        {loading && (
          <div className={`${card} p-16 text-center`}>
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading paste…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className={`${card} p-10 text-center`}>
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="font-bold text-slate-900 dark:text-white mb-1">Paste Not Found</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
            <Link href="/tools/pastebin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition">
              <Code2 className="w-4 h-4" />Create New Paste
            </Link>
          </div>
        )}

        {/* Paste View */}
        {paste && (
          <div className={`${card} p-5`}>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white text-lg">{paste.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded text-[10px] font-bold">{paste.language}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <AlignLeft className="w-3 h-3" />{paste.code.split('\n').length} lines
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Eye className="w-3 h-3" />{paste.views} views
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3" />{fmtTime(paste.createdAt)}
                  </span>
                  {paste.expiresAt && (
                    <>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-amber-600 dark:text-amber-400">expires {fmtTime(paste.expiresAt)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 flex-wrap">
                <button onClick={() => setShowLines(s => !s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition">
                  <Hash className="w-3 h-3" />{showLines ? 'Hide #' : 'Show #'}
                </button>
                <button onClick={() => cp(paste.code, 'code')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition">
                  {copied === 'code' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied === 'code' ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => cp(shareUrl, 'url')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/30 rounded-lg transition">
                  {copied === 'url' ? <Check className="w-3 h-3 text-emerald-500" /> : <Share2 className="w-3 h-3" />}
                  {copied === 'url' ? 'Copied!' : 'Share URL'}
                </button>
                <button onClick={dl}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/30 rounded-lg transition">
                  <Download className="w-3 h-3" />Download
                </button>
              </div>
            </div>

            {/* Code block */}
            <div className="bg-slate-950 rounded-xl overflow-x-auto border border-slate-800">
              <pre className="text-xs font-mono leading-relaxed p-4 text-emerald-400">
                {paste.code.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    {showLines && (
                      <span className="w-10 text-right pr-4 text-slate-600 select-none flex-shrink-0">{i + 1}</span>
                    )}
                    <span className="flex-1 whitespace-pre-wrap break-all">{line || ' '}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
