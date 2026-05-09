'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Download, Monitor, Smartphone, Check, AlertCircle } from 'lucide-react';

export default function MetaTagGeneratorClient() {
    const [siteName, setSiteName] = useState('MyAwesomeSite');
    const [websiteUrl, setWebsiteUrl] = useState('https://example.com/page');
    const [pageTitle, setPageTitle] = useState('Ultimate Guide to Meta Tags');
    const [description, setDescription] = useState('Learn how to craft the perfect meta title and description to boost your organic click-through rate. Generate your tags instantly.');
    const [keywords, setKeywords] = useState('seo, meta tags, generator, title tag');
    const [author, setAuthor] = useState('');
    const [imageUrl, setImageUrl] = useState('https://example.com/image.jpg');
    
    const [previewMode, setPreviewMode] = useState('desktop'); // 'desktop' or 'mobile'
    const [copied, setCopied] = useState(false);

    // Derived values for full title
    const fullTitle = `${pageTitle}${siteName ? ` - ${siteName}` : ''}`;
    
    // Character limits
    const TITLE_LIMIT = 60;
    const DESC_LIMIT = 160;
    
    const titleLength = fullTitle.length;
    const descLength = description.length;
    
    const titleProgress = Math.min((titleLength / TITLE_LIMIT) * 100, 100);
    const descProgress = Math.min((descLength / DESC_LIMIT) * 100, 100);
    
    const isTitleOver = titleLength > TITLE_LIMIT;
    const isDescOver = descLength > DESC_LIMIT;

    const generateHtmlCode = () => {
        let html = `<!-- Primary Meta Tags -->\n`;
        html += `<title>${fullTitle}</title>\n`;
        html += `<meta name="title" content="${fullTitle}">\n`;
        if (description) html += `<meta name="description" content="${description}">\n`;
        if (keywords) html += `<meta name="keywords" content="${keywords}">\n`;
        if (author) html += `<meta name="author" content="${author}">\n`;
        if (websiteUrl) html += `<link rel="canonical" href="${websiteUrl}">\n`;
        
        html += `\n<!-- Open Graph / Facebook -->\n`;
        html += `<meta property="og:type" content="website">\n`;
        if (websiteUrl) html += `<meta property="og:url" content="${websiteUrl}">\n`;
        html += `<meta property="og:title" content="${fullTitle}">\n`;
        if (description) html += `<meta property="og:description" content="${description}">\n`;
        if (imageUrl) html += `<meta property="og:image" content="${imageUrl}">\n`;
        
        html += `\n<!-- Twitter -->\n`;
        html += `<meta property="twitter:card" content="summary_large_image">\n`;
        if (websiteUrl) html += `<meta property="twitter:url" content="${websiteUrl}">\n`;
        html += `<meta property="twitter:title" content="${fullTitle}">\n`;
        if (description) html += `<meta property="twitter:description" content="${description}">\n`;
        if (imageUrl) html += `<meta property="twitter:image" content="${imageUrl}">\n`;
        
        return html;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateHtmlCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([generateHtmlCode()], {type: 'text/html'});
        element.href = URL.createObjectURL(file);
        element.download = "meta-tags.html";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column: Inputs */}
                <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-xl font-bold text-white mb-4">Meta Tag Information</h2>
                    
                    {/* Website URL */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Website URL</label>
                        <input 
                            type="url" 
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="https://example.com/page"
                        />
                    </div>

                    {/* Site Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Site Name / Brand</label>
                        <input 
                            type="text" 
                            value={siteName}
                            onChange={(e) => setSiteName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="e.g. OmniWebKit"
                        />
                    </div>

                    {/* Page Title */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-slate-300">Page Title</label>
                            <span className={`text-xs ${isTitleOver ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                {titleLength} / {TITLE_LIMIT} chars
                            </span>
                        </div>
                        <input 
                            type="text" 
                            value={pageTitle}
                            onChange={(e) => setPageTitle(e.target.value)}
                            className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all ${isTitleOver ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-800 focus:ring-indigo-500'}`}
                            placeholder="e.g. Free Meta Tag Generator"
                        />
                        <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ${isTitleOver ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${titleProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <div className="flex justify-between items-end mb-1">
                            <label className="block text-sm font-medium text-slate-300">Meta Description</label>
                            <span className={`text-xs ${isDescOver ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                                {descLength} / {DESC_LIMIT} chars
                            </span>
                        </div>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className={`w-full bg-slate-950 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 transition-all resize-none ${isDescOver ? 'border-red-500/50 focus:ring-red-500' : 'border-slate-800 focus:ring-indigo-500'}`}
                            placeholder="Briefly summarize your page..."
                        />
                        <div className="w-full bg-slate-800 h-1.5 mt-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-300 ${isDescOver ? 'bg-red-500' : 'bg-indigo-500'}`}
                                style={{ width: `${descProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Keywords & Author */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Keywords (Comma separated)</label>
                            <input 
                                type="text" 
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="seo, tools, generator"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Author (Optional)</label>
                            <input 
                                type="text" 
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    </div>

                    {/* Open Graph Image */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">OpenGraph Image URL (Optional)</label>
                        <input 
                            type="url" 
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-slate-500 mt-1">Used for previews on Twitter, Facebook, LinkedIn, etc.</p>
                    </div>
                </div>

                {/* Right Column: Previews & Code */}
                <div className="space-y-6">
                    
                    {/* Live SERP Preview */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Live SERP Preview
                            </h2>
                            <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                                <button
                                    onClick={() => setPreviewMode('desktop')}
                                    className={`p-1.5 rounded-md transition-colors ${previewMode === 'desktop' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    title="Desktop View"
                                >
                                    <Monitor size={18} />
                                </button>
                                <button
                                    onClick={() => setPreviewMode('mobile')}
                                    className={`p-1.5 rounded-md transition-colors ${previewMode === 'mobile' ? 'bg-slate-800 text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                                    title="Mobile View"
                                >
                                    <Smartphone size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 font-sans">
                            {(() => {
                                let displayUrlHost = 'https://example.com';
                                let displayUrlPath = ' › page';
                                let displayUrlPathMobileArray = ['page'];
                                try {
                                    const urlObj = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
                                    displayUrlHost = urlObj.protocol + '//' + urlObj.hostname;
                                    const paths = urlObj.pathname.split('/').filter(Boolean);
                                    if (paths.length > 0) {
                                        displayUrlPath = ' › ' + paths.join(' › ');
                                        displayUrlPathMobileArray = paths;
                                    } else {
                                        displayUrlPath = '';
                                        displayUrlPathMobileArray = [];
                                    }
                                } catch (e) {
                                    displayUrlHost = websiteUrl || 'https://example.com';
                                    displayUrlPath = '';
                                    displayUrlPathMobileArray = [];
                                }

                                return previewMode === 'desktop' ? (
                                    /* Desktop Preview */
                                    <div className="max-w-[600px]">
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500">Logo</div>
                                            <div>
                                                <div className="text-[14px] text-[#202124] leading-tight flex items-center gap-2">
                                                    {siteName || 'Example.com'}
                                                    <span className="text-[#5f6368] text-xs">⋮</span>
                                                </div>
                                                <div className="text-[12px] text-[#4d5156] leading-tight truncate max-w-[500px]">
                                                    {displayUrlHost}{displayUrlPath}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer mb-1 leading-tight truncate">
                                            {fullTitle || 'Page Title'}
                                        </div>
                                        <div className="text-[14px] text-[#4d5156] leading-[1.58] line-clamp-2">
                                            {description || 'Your meta description will appear here. Make sure it is engaging and accurately reflects the content of your page to improve click-through rates.'}
                                        </div>
                                    </div>
                                ) : (
                                    /* Mobile Preview */
                                    <div className="max-w-[375px]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">Logo</div>
                                            <div className="text-[12px] text-[#202124] leading-tight flex items-center gap-1 flex-wrap">
                                                <span>{siteName || 'Example.com'}</span>
                                                {displayUrlPathMobileArray.map((pathItem, idx) => (
                                                    <React.Fragment key={idx}>
                                                        <span className="text-[#5f6368] mx-1">›</span>
                                                        <span className="text-[#5f6368] truncate max-w-[100px]">{pathItem}</span>
                                                    </React.Fragment>
                                                ))}
                                                <span className="text-[#5f6368] ml-1">⋮</span>
                                            </div>
                                        </div>
                                        <div className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer mb-1 leading-snug">
                                            {fullTitle || 'Page Title'}
                                        </div>
                                        <div className="text-[14px] text-[#4d5156] leading-[1.58] line-clamp-3">
                                            {description || 'Your meta description will appear here. Make sure it is engaging and accurately reflects the content of your page to improve click-through rates.'}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Generated Code */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative group">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                Generated Code
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors border border-slate-700"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                                >
                                    <Download size={14} />
                                    Download
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-[#0d1117] rounded-lg p-4 overflow-x-auto border border-slate-800">
                            <pre className="text-sm font-mono leading-relaxed text-slate-300">
                                <code>
                                    {generateHtmlCode().split('\n').map((line, i) => {
                                        // Basic syntax highlighting for HTML tags and attributes
                                        let highlightedLine = line
                                            .replace(/&/g, '&amp;')
                                            .replace(/</g, '&lt;')
                                            .replace(/>/g, '&gt;');
                                            
                                        highlightedLine = highlightedLine.replace(/(&lt;\/?)([a-zA-Z0-9]+)/g, '$1<span class="text-pink-400">$2</span>');
                                        highlightedLine = highlightedLine.replace(/([a-zA-Z-]+)=/g, '<span class="text-indigo-300">$1</span>=');
                                        highlightedLine = highlightedLine.replace(/"([^"]*)"/g, '<span class="text-emerald-300">"$1"</span>');
                                        highlightedLine = highlightedLine.replace(/&lt;!--(.*?)--&gt;/g, '<span class="text-slate-500">&lt;!--$1--&gt;</span>');
                                        
                                        return (
                                            <div key={i} dangerouslySetInnerHTML={{ __html: highlightedLine || ' ' }} />
                                        );
                                    })}
                                </code>
                            </pre>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
}
