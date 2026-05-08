'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { 
  Search, AlertCircle, CheckCircle2, XCircle, Info, Link as LinkIcon, 
  Image as ImageIcon, Type, FileText, Code, Activity, SearchCheck, Globe
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { API_V1 } from '@/lib/config';

const queryClient = new QueryClient();

// Internal main component
function SEOAnalyzerApp() {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [focusKeyword, setFocusKeyword] = useState('');

  const mutation = useMutation({
    mutationFn: async (targetUrl) => {
      const response = await fetch(`${API_V1}/tools/seo-analyzer/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to analyze URL');
      }
      return response.json();
    }
  });

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert("URL must start with http:// or https://");
      return;
    }
    mutation.mutate(url);
    setActiveTab('overview');
  };

  const data = mutation.data;
  
  const calculateScore = (data) => {
    if (!data) return 0;
    let score = 100;
    
    // Meta tags
    if (data.meta_tags.page_title_issue) score -= 10;
    if (data.meta_tags.meta_description_issue) score -= 10;
    if (!data.meta_tags.canonical_url) score -= 5;
    
    // Headings
    if (data.headings.some(h => h.issue === 'Missing H1 tag')) score -= 15;
    if (data.headings.some(h => h.issue === 'Multiple H1 tags')) score -= 10;
    
    // Links
    if (data.broken_links && data.broken_links.length > 0) score -= Math.min(20, data.broken_links.length * 2);
    
    // Images
    const missingAltCount = data.images.filter(img => !img.has_alt && !img.is_decorative).length;
    if (missingAltCount > 0) score -= Math.min(10, missingAltCount);
    
    // Signals
    if (!data.signals.https) score -= 10;
    if (data.signals.word_count < 300) score -= 10;
    
    return Math.max(0, score);
  };

  const score = calculateScore(data);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <form onSubmit={handleAnalyze} className="flex gap-4 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={mutation.isPending}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors flex items-center gap-2"
          >
            {mutation.isPending ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Search size={20} />
                Analyze
              </span>
            )}
          </button>
        </form>
        {mutation.isError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-3 max-w-3xl mx-auto">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p>{mutation.error.message}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {data && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Tabs Header */}
          <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 hide-scrollbar">
            {[
              { id: 'overview', icon: Activity, label: 'Overview' },
              { id: 'meta', icon: FileText, label: 'Meta Tags' },
              { id: 'headings', icon: Type, label: 'Headings' },
              { id: 'bold', icon: SearchCheck, label: 'Bold Text' },
              { id: 'links', icon: LinkIcon, label: 'Links' },
              { id: 'images', icon: ImageIcon, label: 'Images' },
              { id: 'schema', icon: Code, label: 'Schema' },
              { id: 'signals', icon: Info, label: 'Page Signals' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === t.id 
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <t.icon size={16} />
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Score Card */}
                  <div className="col-span-1 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">SEO Health Score</h3>
                    <div className="h-40 w-40 relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[{ value: score }, { value: 100 - score }]}
                            innerRadius={60}
                            outerRadius={80}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill={score > 80 ? '#22c55e' : score > 50 ? '#eab308' : '#ef4444'} />
                            <Cell fill="#e2e8f0" className="dark:fill-slate-700" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-4xl font-bold text-slate-900 dark:text-white">{score}</span>
                        <span className="text-sm text-slate-500">/ 100</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${data.broken_links.length > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {data.broken_links.length > 0 ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Broken Links</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.broken_links.length}</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        <LinkIcon size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Total Links</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {data.internal_links.length + data.external_links.length + data.broken_links.length + data.other_links.length}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <ImageIcon size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Images Missing Alt</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {data.images.filter(img => !img.has_alt && !img.is_decorative).length}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <Type size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Word Count</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.signals.word_count}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SERP Preview */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Google Search Preview</h3>
                  <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Globe size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900 dark:text-slate-200 truncate">{data.url}</p>
                      </div>
                    </div>
                    <h4 className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 line-clamp-1">
                      {data.meta_tags.page_title || data.url}
                    </h4>
                    <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
                      {data.meta_tags.meta_description || "No meta description provided for this page."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* META TAGS TAB */}
            {activeTab === 'meta' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Meta */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Basic Meta Tags</h3>
                    <MetaCard 
                      label="Title" 
                      value={data.meta_tags.page_title} 
                      count={data.meta_tags.page_title_length}
                      issue={data.meta_tags.page_title_issue}
                    />
                    <MetaCard 
                      label="Description" 
                      value={data.meta_tags.meta_description} 
                      count={data.meta_tags.meta_description_length}
                      issue={data.meta_tags.meta_description_issue}
                    />
                    <MetaCard label="Canonical URL" value={data.meta_tags.canonical_url} />
                    <MetaCard label="Robots" value={data.meta_tags.robots_meta} />
                  </div>
                  {/* Social Tags */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Social Tags (Open Graph / Twitter)</h3>
                    {Object.entries(data.meta_tags.og_tags).map(([key, val]) => (
                      <MetaCard key={key} label={key} value={val} />
                    ))}
                    {Object.entries(data.meta_tags.twitter_tags).map(([key, val]) => (
                      <MetaCard key={key} label={key} value={val} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* HEADINGS TAB */}
            {activeTab === 'headings' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Heading Structure</h3>
                  <div className="flex gap-2">
                    {['h1','h2','h3','h4','h5','h6'].map(h => {
                      const count = data.headings.filter(hx => hx.level === h).length;
                      return count > 0 ? (
                        <span key={h} className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                          {h.toUpperCase()}: {count}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 overflow-x-auto">
                  {data.headings.map((h, i) => (
                    <div 
                      key={i} 
                      className={`flex items-start gap-4 mb-3 py-1 ${h.issue ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-200'}`}
                      style={{ paddingLeft: `${(parseInt(h.level[1]) - 1) * 2}rem` }}
                    >
                      <span className={`shrink-0 font-mono text-xs font-bold px-2 py-1 rounded ${h.issue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        {h.level.toUpperCase()}
                      </span>
                      <span className="font-medium text-sm leading-relaxed">{h.text}</span>
                      {h.issue && (
                        <span className="shrink-0 text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400 font-medium">
                          {h.issue}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOLD TEXT TAB */}
            {activeTab === 'bold' && (
              <div>
                <div className="mb-6">
                  <input 
                    type="text"
                    placeholder="Filter bold text..."
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    className="w-full max-w-sm px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                  />
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm">
                        <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-700">Phrase</th>
                        <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-700">Count</th>
                        <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-700">Tag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.bold_text
                        .filter(b => b.text.toLowerCase().includes(focusKeyword.toLowerCase()))
                        .map((b, i) => (
                        <tr key={i} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 text-sm">
                          <td className="p-4 text-slate-900 dark:text-slate-200 font-medium">{b.text}</td>
                          <td className="p-4 text-slate-500">{b.count}</td>
                          <td className="p-4"><span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">{`<${b.tag}>`}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LINKS TAB */}
            {activeTab === 'links' && (
              <div>
                {data.broken_links.length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl">
                    <h4 className="text-red-800 dark:text-red-400 font-bold flex items-center gap-2 mb-2">
                      <AlertCircle size={18} /> {data.broken_links.length} Broken Links Detected
                    </h4>
                    <div className="space-y-2">
                      {data.broken_links.map((link, i) => (
                        <div key={i} className="text-sm flex flex-col sm:flex-row sm:items-center gap-2 text-red-600 dark:text-red-400">
                          <span className="font-medium bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded text-xs">HTTP {link.http_status}</span>
                          <span className="truncate">{link.href}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-sm">
                        <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-700 w-1/4">Anchor Text</th>
                        <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-700 w-1/2">URL</th>
                        <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-700">Type</th>
                        <th className="p-4 font-medium border-b border-slate-200 dark:border-slate-700">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[...data.internal_links, ...data.external_links, ...data.other_links].map((l, i) => (
                        <tr key={i} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                          <td className="p-4 text-slate-900 dark:text-slate-200 font-medium truncate max-w-[200px]" title={l.anchor_text}>{l.anchor_text}</td>
                          <td className="p-4 text-blue-600 dark:text-blue-400 truncate max-w-[300px]" title={l.href}>
                            <a href={l.href} target="_blank" rel="noopener noreferrer" className="hover:underline">{l.href}</a>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1 flex-wrap">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${l.type === 'internal' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400'}`}>
                                {l.type}
                              </span>
                              {l.nofollow && <span className="px-2 py-1 rounded text-xs font-medium bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300">nofollow</span>}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              l.http_status === 200 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              l.http_status === 'skipped' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                              'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {l.http_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* IMAGES TAB */}
            {activeTab === 'images' && (
              <div>
                <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  Total Images: <strong className="text-slate-900 dark:text-white">{data.images.length}</strong> | 
                  Missing Alt Text: <strong className="text-red-600 dark:text-red-400 ml-1">{data.images.filter(img => !img.has_alt && !img.is_decorative).length}</strong>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.images.map((img, i) => (
                    <div key={i} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                      <div className="w-16 h-16 shrink-0 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden flex items-center justify-center">
                        {/* Use object block to avoid broken images looking ugly */}
                        <object data={img.src} className="w-full h-full object-cover">
                          <ImageIcon className="text-slate-400" />
                        </object>
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-xs text-slate-500 truncate mb-1" title={img.src}>{img.src.split('/').pop() || img.src}</p>
                        {img.has_alt ? (
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-200 line-clamp-2" title={img.alt}>{img.alt}</p>
                        ) : img.is_decorative ? (
                          <span className="inline-block px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded font-medium self-start">Decorative (alt="")</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded font-medium self-start">Missing alt</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SCHEMA TAB */}
            {activeTab === 'schema' && (
              <div className="space-y-6">
                {data.schemas.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    No JSON-LD schema markup found on this page.
                  </div>
                ) : (
                  data.schemas.map((s, i) => (
                    <div key={i} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <Code size={16} /> 
                          {s.type || "Unknown Schema"}
                        </span>
                        {!s.is_valid && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Invalid JSON</span>}
                      </div>
                      <div className="p-4 bg-slate-900 text-slate-300 overflow-x-auto text-sm font-mono">
                        <pre>{s.content}</pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* SIGNALS TAB */}
            {activeTab === 'signals' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SignalCard label="Response Time" value={`${data.signals.response_time_ms} ms`} good={data.signals.response_time_ms < 1000} />
                <SignalCard label="Page Size" value={`${(data.signals.page_size_bytes / 1024).toFixed(2)} KB`} good={data.signals.page_size_bytes < 3000000} />
                <SignalCard label="Word Count" value={data.signals.word_count} good={data.signals.word_count > 300} />
                <SignalCard label="Text/HTML Ratio" value={`${data.signals.text_to_html_ratio}%`} good={data.signals.text_to_html_ratio > 10} />
                
                <SignalCard label="HTTPS Security" value={data.signals.https ? "Secure" : "Insecure"} good={data.signals.https} />
                <SignalCard label="Sitemap Link" value={data.signals.has_sitemap_link ? "Present" : "Missing"} good={data.signals.has_sitemap_link} neutral={!data.signals.has_sitemap_link} />
                <SignalCard label="Viewport Meta" value={data.signals.has_viewport ? "Present" : "Missing"} good={data.signals.has_viewport} />
                <SignalCard label="Favicon" value={data.signals.has_favicon ? "Present" : "Missing"} good={data.signals.has_favicon} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetaCard({ label, value, count, issue }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
        {count !== undefined && (
          <span className={`text-xs px-2 py-0.5 rounded ${issue ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
            {count} chars
          </span>
        )}
      </div>
      <p className={`text-sm break-all font-medium ${!value ? 'text-slate-400 italic' : 'text-slate-900 dark:text-slate-200'}`}>
        {value || 'Not provided'}
      </p>
      {issue && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2 font-medium flex items-center gap-1">
          <AlertCircle size={12} /> {issue}
        </p>
      )}
    </div>
  );
}

function SignalCard({ label, value, good, neutral }) {
  const bgColor = good ? 'bg-green-50 dark:bg-green-900/10' : neutral ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-red-50 dark:bg-red-900/10';
  const textColor = good ? 'text-green-700 dark:text-green-400' : neutral ? 'text-slate-700 dark:text-slate-300' : 'text-red-700 dark:text-red-400';
  const borderColor = good ? 'border-green-200 dark:border-green-900/50' : neutral ? 'border-slate-200 dark:border-slate-800' : 'border-red-200 dark:border-red-900/50';
  const Icon = good ? CheckCircle2 : neutral ? Info : XCircle;

  return (
    <div className={`p-5 rounded-xl border ${bgColor} ${borderColor} flex flex-col gap-2`}>
      <div className="flex justify-between items-start">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</span>
        <Icon size={18} className={textColor} />
      </div>
      <span className={`text-xl font-bold ${textColor}`}>{value}</span>
    </div>
  );
}

// Wrapper to provide QueryClient
export default function SEOAnalyzerWrapper() {
  return (
    <QueryClientProvider client={queryClient}>
      <SEOAnalyzerApp />
    </QueryClientProvider>
  );
}
