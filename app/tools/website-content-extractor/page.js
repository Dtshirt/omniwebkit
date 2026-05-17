'use client';

import React, { useState } from 'react';
import {
  Globe,
  Download,
  Copy,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Code,
  FileText,
  Search,
  Info,
  Tag,
  Link2,
  ImageIcon,
  List,
  AlignLeft,
  Layers,
  BarChart2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// ─── Label helper ───────────────────────────────────
const OPTION_LABELS = {
  includeMeta: 'Meta Tags',
  includeHeadings: 'Headings',
  includeParagraphs: 'Paragraphs',
  includeImages: 'Images',
  includeLinks: 'Links',
  includeLists: 'Lists',
  removeEmptyElements: 'Skip Empty Elements',
  preserveFormatting: 'Preserve Formatting',
};

const OPTION_ICONS = {
  includeMeta: Tag,
  includeHeadings: AlignLeft,
  includeParagraphs: FileText,
  includeImages: ImageIcon,
  includeLinks: Link2,
  includeLists: List,
  removeEmptyElements: Layers,
  preserveFormatting: Code,
};

export default function WebsiteContentExtractor() {
  const [url, setUrl] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('structured');
  const [extractOptions, setExtractOptions] = useState({
    includeMeta: true,
    includeHeadings: true,
    includeParagraphs: true,
    includeImages: true,
    includeLinks: true,
    includeLists: true,
    removeEmptyElements: true,
    preserveFormatting: true,
  });

  // ─── Fetch website HTML ─────────────────────────────
  const fetchWebsiteContent = async (targetUrl) => {
    // Normalize URL
    let finalUrl = targetUrl.trim();
    if (!finalUrl.match(/^https?:\/\//i)) {
      finalUrl = 'https://' + finalUrl;
    }

    let proxyError = null;
    // 1. Try our own server-side proxy first (most reliable)
    try {
      const res = await fetch(`/api/fetch-proxy?url=${encodeURIComponent(finalUrl)}`, {
        signal: AbortSignal.timeout(25000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.content) return data.content;
      } else {
        const data = await res.json().catch(() => ({}));
        proxyError = data.error || res.statusText;
      }
    } catch (err) {
      proxyError = err.message;
    }

    console.warn('Local API Proxy failed, falling back to public CORS proxies. Error:', proxyError);

    // 2. Fallback to third-party CORS proxies
    const proxies = [
      `https://corsproxy.io/?${encodeURIComponent(finalUrl)}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(finalUrl)}`,
      `https://api.allorigins.win/get?url=${encodeURIComponent(finalUrl)}`,
    ];

    for (const proxyUrl of proxies) {
      try {
        const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(25000) });
        if (!res.ok) continue;
        const text = await res.text();
        try {
          // If allorigins
          if (proxyUrl.includes('allorigins')) {
            const json = JSON.parse(text);
            if (json.contents) return json.contents;
          }
        } catch { } // ignore JSON parse error
        
        return text;
      } catch {
        continue;
      }
    }
    
    throw new Error(`Unable to fetch this website. Ensure the URL is accessible. (Proxy error: ${proxyError || 'Timeout'})`);
  };

  // ─── Meta extraction ────────────────────────────────
  const extractMetaInfo = (doc) => {
    const g = (sel, attr = 'content') => doc.querySelector(sel)?.getAttribute(attr) || '';
    return {
      title: doc.querySelector('title')?.textContent?.trim() || '',
      description: g('meta[name="description"]') || g('meta[property="og:description"]'),
      keywords: g('meta[name="keywords"]'),
      author: g('meta[name="author"]'),
      robots: g('meta[name="robots"]'),
      canonical: g('link[rel="canonical"]', 'href'),
      ogTitle: g('meta[property="og:title"]'),
      ogDescription: g('meta[property="og:description"]'),
      ogImage: g('meta[property="og:image"]'),
      ogUrl: g('meta[property="og:url"]'),
      twitterCard: g('meta[name="twitter:card"]'),
      twitterTitle: g('meta[name="twitter:title"]'),
      twitterDescription: g('meta[name="twitter:description"]'),
      twitterImage: g('meta[name="twitter:image"]'),
      viewport: g('meta[name="viewport"]'),
    };
  };

  // ─── Structured content extraction ─────────────────
  const extractStructuredContent = (doc, baseUrl) => {
    const content = [];
    const body = doc.body || doc;
    const els = body.querySelectorAll('h1,h2,h3,h4,h5,h6,p,ul,ol,img,a,div,article,section');
    let currentSection = null;

    const addItem = (item) => {
      if (currentSection) currentSection.children.push(item);
      else content.push(item);
    };

    const resolveUrl = (href) => {
      if (!href) return href;
      try { return href.startsWith('http') ? href : new URL(href, baseUrl).href; } catch { return href; }
    };

    els.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent?.trim() || '';

      if (extractOptions.removeEmptyElements && !text && !['img'].includes(tag)) return;

      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)) {
        if (extractOptions.includeHeadings && text) {
          currentSection = { type: 'heading', level: parseInt(tag[1]), tag, content: text, children: [] };
          content.push(currentSection);
        }
      } else if (tag === 'p') {
        if (extractOptions.includeParagraphs && text) addItem({ type: 'paragraph', tag, content: text });
      } else if (['ul', 'ol'].includes(tag)) {
        if (extractOptions.includeLists) {
          const items = Array.from(el.querySelectorAll('li')).map(li => li.textContent?.trim()).filter(Boolean);
          if (items.length) addItem({ type: 'list', tag, ordered: tag === 'ol', items });
        }
      } else if (tag === 'img') {
        if (extractOptions.includeImages) {
          const src = resolveUrl(el.getAttribute('src'));
          if (src) addItem({ type: 'image', src, alt: el.getAttribute('alt') || '', title: el.getAttribute('title') || '' });
        }
      } else if (tag === 'a') {
        if (extractOptions.includeLinks && text) {
          const href = resolveUrl(el.getAttribute('href'));
          if (href) addItem({ type: 'link', content: text, href });
        }
      } else if (['div', 'article', 'section'].includes(tag)) {
        const directText = Array.from(el.childNodes)
          .filter(n => n.nodeType === 3)
          .map(n => n.textContent?.trim())
          .filter(Boolean).join(' ');
        if (directText) addItem({ type: 'content', tag, content: directText });
      }
    });

    return content;
  };

  // ─── Main extraction handler ────────────────────────
  const processContent = async () => {
    if (!url.trim()) { toast.error('Please enter a URL'); return; }
    let checkUrl = url.trim();
    if (!checkUrl.match(/^https?:\/\//i)) checkUrl = 'https://' + checkUrl;
    try { new URL(checkUrl); } catch { toast.error('Please enter a valid URL (e.g. example.com)'); return; }

    setLoading(true);
    setExtractedData(null);
    try {
      const html = await fetchWebsiteContent(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      const meta = extractOptions.includeMeta ? extractMetaInfo(doc) : {};
      const content = extractStructuredContent(doc, url);

      const allText = content.flatMap(i => [i.content, ...(i.children?.map(c => c.content) || [])]).filter(Boolean).join(' ');
      const wordCount = allText.split(/\s+/).filter(Boolean).length;

      const countType = (type) => content.reduce((n, i) =>
        n + (i.type === type ? 1 : 0) + (i.children?.filter(c => c.type === type).length || 0), 0);

      setExtractedData({
        url,
        extractedAt: new Date().toISOString(),
        meta,
        content,
        statistics: {
          wordCount,
          headings: countType('heading'),
          paragraphs: countType('paragraph'),
          images: countType('image'),
          links: countType('link'),
          totalElements: content.length,
        },
        rawHtml: html,
      });
      toast.success('Content extracted successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to extract content');
    } finally {
      setLoading(false);
    }
  };

  // ─── Format for plain text export ──────────────────
  const formatForExport = (items, indent = 0) => {
    const pad = '  '.repeat(indent);
    return items.map(item => {
      switch (item.type) {
        case 'heading': return `${pad}${item.tag.toUpperCase()}: ${item.content}\n${item.children?.length ? formatForExport(item.children, indent + 1) : ''}`;
        case 'paragraph': return `${pad}${item.content}\n`;
        case 'list': return `${pad}${item.ordered ? 'Ordered List' : 'List'}:\n${item.items.map((li, i) => `${pad}  ${item.ordered ? `${i + 1}.` : '•'} ${li}`).join('\n')}\n`;
        case 'image': return `${pad}[IMAGE] ${item.alt || 'no alt'} — ${item.src}\n`;
        case 'link': return `${pad}[LINK] ${item.content} → ${item.href}\n`;
        default: return `${pad}${item.content || ''}\n`;
      }
    }).join('\n');
  };

  const generateReport = () => {
    if (!extractedData) return '';
    let out = `Website Content Extraction Report\n${'='.repeat(40)}\n\nURL: ${extractedData.url}\nExtracted: ${new Date(extractedData.extractedAt).toLocaleString()}\n\n`;
    if (Object.values(extractedData.meta).some(Boolean)) {
      out += `META INFORMATION\n${'─'.repeat(20)}\n`;
      Object.entries(extractedData.meta).forEach(([k, v]) => { if (v) out += `${k}: ${v}\n`; });
      out += '\n';
    }
    out += `STATISTICS\n${'─'.repeat(20)}\n`;
    Object.entries(extractedData.statistics).forEach(([k, v]) => { out += `${k}: ${v}\n`; });
    out += `\nSTRUCTURED CONTENT\n${'─'.repeat(20)}\n`;
    out += formatForExport(extractedData.content);
    return out;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReport())
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Copy failed'));
  };

  const downloadTXT = () => {
    const blob = new Blob([generateReport()], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `content_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const downloadJSON = () => {
    if (!extractedData) return;
    const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `content_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ─── Stat cards data ────────────────────────────────
  const statCards = extractedData ? [
    { label: 'Words', value: extractedData.statistics.wordCount, color: 'text-primary-600 dark:text-primary-400' },
    { label: 'Headings', value: extractedData.statistics.headings, color: 'text-violet-600 dark:text-violet-400' },
    { label: 'Paragraphs', value: extractedData.statistics.paragraphs, color: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Images', value: extractedData.statistics.images, color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Links', value: extractedData.statistics.links, color: 'text-rose-600 dark:text-rose-400' },
    { label: 'Elements', value: extractedData.statistics.totalElements, color: 'text-sky-600 dark:text-sky-400' },
  ] : [];

  // ─── Render single content item ─────────────────────
  const RenderItem = ({ item, depth = 0 }) => {
    const borderColors = ['border-primary-400', 'border-violet-400', 'border-emerald-400', 'border-amber-400'];
    const bc = borderColors[depth % borderColors.length];

    switch (item.type) {
      case 'heading':
        return (
          <div className={`border-l-4 ${bc} pl-4 py-1`}>
            <div className={`font-bold text-slate-900 dark:text-white ${item.level === 1 ? 'text-xl' : item.level === 2 ? 'text-lg' : item.level === 3 ? 'text-base' : 'text-sm'
              }`}>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 mr-2 uppercase">{item.tag}</span>
              {item.content}
            </div>
            {item.children?.length > 0 && (
              <div className="mt-2 space-y-2 ml-3">
                {item.children.map((child, i) => <RenderItem key={i} item={child} depth={depth + 1} />)}
              </div>
            )}
          </div>
        );
      case 'paragraph':
        return <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">{item.content}</p>;
      case 'list':
        return (
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {item.ordered ? 'Ordered List' : 'Unordered List'}
            </span>
            <ul className={`mt-1 ml-5 space-y-1 ${item.ordered ? 'list-decimal' : 'list-disc'}`}>
              {item.items.map((li, i) => <li key={i} className="text-slate-700 dark:text-slate-300 text-sm">{li}</li>)}
            </ul>
          </div>
        );
      case 'image':
        return (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <ImageIcon className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-300">{item.alt || 'No alt text'}</p>
              <a href={item.src} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 dark:text-amber-400 hover:underline break-all">{item.src}</a>
            </div>
          </div>
        );
      case 'link':
        return (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <Link2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-700 dark:text-emerald-300 hover:underline truncate">
              {item.content}
            </a>
          </div>
        );
      default:
        return <p className="text-sm text-slate-600 dark:text-slate-400">{item.content}</p>;
    }
  };

  // ─── Meta key label ─────────────────────────────────
  const metaLabel = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
  const isUrl = (key) => key.toLowerCase().includes('image') || key.toLowerCase().includes('url') || key === 'canonical';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <Breadcrumbs items={[{ name: 'Website Content Extractor', href: '/tools/website-content-extractor' }]} />

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-2xl mb-5">
            <Globe className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Website Content Extractor
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Paste any URL and pull out every piece of content — headings, paragraphs, images, links,
            and full meta data — in a clean, structured format you can copy or download.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-4">

            {/* URL + Options card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-5 lg:sticky lg:top-24">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
                Extraction Settings
              </h2>

              {/* URL input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Website URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && processContent()}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Options */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  What to include
                </p>
                <div className="space-y-2">
                  {Object.entries(extractOptions).map(([key, value]) => {
                    const Icon = OPTION_ICONS[key];
                    return (
                      <label
                        key={key}
                        className="flex items-center justify-between cursor-pointer group"
                      >
                        <span className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">
                          {Icon && <Icon className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />}
                          {OPTION_LABELS[key]}
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setExtractOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 rounded-full bg-slate-200 dark:bg-slate-700 peer-checked:bg-primary-600 transition-colors peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-1" />
                          <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Extract button */}
              <button
                onClick={processContent}
                disabled={loading || !url.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Extracting…</>
                ) : (
                  <><Search className="h-4 w-4" /> Extract Content</>
                )}
              </button>

              {/* Export buttons */}
              {extractedData && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Export
                  </p>
                  <button onClick={copyToClipboard} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <Copy className="h-4 w-4" /> Copy Report
                  </button>
                  <button onClick={downloadTXT} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <FileText className="h-4 w-4" /> Download TXT
                  </button>
                  <button onClick={downloadJSON} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <Code className="h-4 w-4" /> Download JSON
                  </button>
                </div>
              )}
            </div>

            {/* Tips card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                Tips
              </h3>
              <ul className="space-y-2.5">
                {[
                  { icon: CheckCircle, color: 'text-emerald-500', text: 'Works best on blogs, news sites, and static pages.' },
                  { icon: AlertCircle, color: 'text-amber-500', text: 'Some sites block CORS — try a different URL if extraction fails.' },
                  { icon: AlertCircle, color: 'text-sky-500', text: 'JavaScript-heavy SPAs may return limited content.' },
                ].map(({ icon: Icon, color, text }) => (
                  <li key={text} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <Icon className={`h-3.5 w-3.5 ${color} flex-shrink-0 mt-0.5`} />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Main panel ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Empty state */}
            {!extractedData && !loading && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Ready to extract</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Enter a URL in the panel on the left and click <strong className="text-slate-700 dark:text-slate-300">Extract Content</strong> to get started.
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <RefreshCw className="h-5 w-5 text-primary-600 dark:text-primary-400 animate-spin" />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Fetching page content…</span>
                </div>
                <div className="space-y-3">
                  {[80, 60, 90, 50, 70].map((w, i) => (
                    <div key={i} className="h-4 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" style={{ width: `${w}%` }} />
                  ))}
                </div>
              </div>
            )}

            {extractedData && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {statCards.map(({ label, value, color }) => (
                    <div key={label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-center">
                      <div className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Meta information */}
                {Object.values(extractedData.meta).some(Boolean) && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      Meta Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(extractedData.meta).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <div key={key} className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                              {metaLabel(key)}
                            </label>
                            <div className="text-sm bg-slate-50 dark:bg-slate-700/60 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                              {isUrl(key) ? (
                                <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline break-all">{value}</a>
                              ) : (
                                <span className="text-slate-800 dark:text-slate-200 break-words">{value}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* View mode toggle + content */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  {/* Tab bar */}
                  <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700">
                    {[
                      { key: 'structured', label: 'Structured', icon: Layers },
                      { key: 'preview', label: 'Plain Text', icon: Eye },
                      { key: 'raw', label: 'Raw JSON', icon: Code },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setViewMode(key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${viewMode === key
                            ? 'bg-primary-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <BarChart2 className="h-3.5 w-3.5" />
                      {extractedData.content.length} top-level items
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    {viewMode === 'structured' && (
                      <div className="space-y-4">
                        {extractedData.content.length === 0 ? (
                          <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">No content found with the current extraction settings.</p>
                        ) : (
                          extractedData.content.map((item, i) => <RenderItem key={i} item={item} />)
                        )}
                      </div>
                    )}

                    {viewMode === 'preview' && (
                      <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        {formatForExport(extractedData.content)}
                      </pre>
                    )}

                    {viewMode === 'raw' && (
                      <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        {JSON.stringify(extractedData, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-16 prose-premium">
          <h2>About the Website Content Extractor</h2>
          <p>
            When you need to pull data from a webpage, viewing the raw source code is a headache. I built this <strong>website content extractor</strong> to solve that exact problem. It reads the HTML of any URL and pulls out the text, headings, images, links, and metadata into a clean, structured format. You do not need to install anything. Just paste a link, and the tool does the heavy lifting so you can copy or download the results immediately.
          </p>

          <h2>How to Use This Tool</h2>
          <p>
            Getting your data takes only a few seconds. Follow these three simple steps:
          </p>
          <ol>
            <li><strong>Drop your link:</strong> Paste the full URL into the input box above.</li>
            <li><strong>Pick your options:</strong> Check the boxes for what you need—like headings, paragraphs, or meta tags.</li>
            <li><strong>Click extract:</strong> Hit the button and review your data. You can download the final report as a TXT or JSON file.</li>
          </ol>

          <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl border border-primary-100 dark:border-primary-800 my-8">
            <h3>100% Browser-Based Processing</h3>
            <p className="m-0">
              Your privacy matters. This tool fetches the webpage and processes the HTML directly in your browser. We never store, log, or track the URLs you enter or the data you extract. You get total privacy and fast results.
            </p>
          </div>

          <h2>Core Features</h2>
          <ul>
            <li><strong>Heading Hierarchy:</strong> Keeps your H1 to H6 tags in perfect order so you see the exact page structure.</li>
            <li><strong>Full Meta Extraction:</strong> Grabs titles, descriptions, canonical links, and Open Graph data for quick SEO checks.</li>
            <li><strong>Smart Link Parsing:</strong> Pulls every link and converts relative paths into absolute URLs so they actually work.</li>
            <li><strong>Image Data:</strong> Collects every image source and alt text directly from the page.</li>
            <li><strong>Three View Modes:</strong> Read the data in a clean structured view, plain text, or raw JSON.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <p>
            If you are a developer or SEO pro, here is what is going on under the hood:
          </p>
          <ul>
            <li><strong>Supported Inputs:</strong> Accepts any public HTTP or HTTPS URL.</li>
            <li><strong>Output Formats:</strong> Exports directly to standard TXT or structured JSON formats.</li>
            <li><strong>Handling Method:</strong> Uses DOMParser to navigate and pull nodes safely without executing scripts.</li>
            <li><strong>Limitations:</strong> Because it reads raw HTML, it will not extract content that loads later via JavaScript (like React or Vue apps).</li>
          </ul>

          <h2>Frequently Asked Questions</h2>
          <h3>Can I extract content from any website?</h3>
          <p>
            You can extract data from most public sites, like blogs and news articles. However, some sites block automated requests or require a login. If a site uses strict CORS rules, the extraction might fail.
          </p>

          <h3>Why didn't it grab all the text?</h3>
          <p>
            This tool reads the static HTML sent by the server. If a website uses JavaScript to load its text after the page opens, this tool will miss it. It works best on standard, static webpages.
          </p>

          <h3>Is there a limit to how much I can use it?</h3>
          <p>
            No limits. You can run as many URLs as you need. Since the processing happens on your device, there are no strict server caps holding you back.
          </p>

          <hr />
          
          <p><em>Engineered by Christopher – Focused on secure, client-side web utilities. <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer">Lazydesigners</a></em></p>
        </div>
      </div>
    </div>
  );
}