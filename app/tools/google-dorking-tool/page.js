'use client';

import React, { useState, useEffect } from 'react';
import { Search, Copy, Check, ExternalLink, ShieldAlert, Code, Activity, Info, ChevronDown, Cloud, MonitorSmartphone, Layers, Star, Plus, Trash2, Settings } from 'lucide-react';
import Link from 'next/link';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const dorkCategories = {
  SEO: {
    icon: Activity,
    dorks: [
      { label: 'Find Indexed Pages', template: 'site:{target}' },
      { label: 'Find Subdomains', template: 'site:*.{target} -www' },
      { label: 'Find Excluded Pages', template: 'site:{target} -inurl:https' },
      { label: 'Find Specific Filetypes (PDF/DOC/TXT)', template: 'site:{target} ext:pdf | ext:doc | ext:txt' },
      { label: 'Find Guest Post Opportunities', template: '"{target}" "write for us" OR "guest post"' },
      { label: 'Find Backlink Resources', template: '"{target}" inurl:resources OR inurl:links' },
      { label: 'Find Brand Mentions (No Own Site)', template: '"{target}" -site:{target}' },
      { label: 'Find Competitor Mentions', template: '"{target}" -site:{target}' },
      { label: 'Find Niche Forums', template: '"{target}" inurl:forum | inurl:board' },
      { label: 'Search Keyword in Title', template: 'intitle:"{target}"' },
      { label: 'Search Keyword in URL', template: 'inurl:"{target}"' },
      { label: 'Find Pages Updated Recently', template: 'site:{target} daterange:2459000-2460000' }, 
    ]
  },
  Developer: {
    icon: Code,
    dorks: [
      { label: 'Search StackOverflow specifically', template: 'site:stackoverflow.com "{target}"' },
      { label: 'Find GitHub Repositories', template: 'site:github.com "{target}"' },
      { label: 'Find Open Directories', template: 'intitle:"index of" "{target}"' },
      { label: 'Find Code Snippets (Pastebin)', template: 'site:pastebin.com "{target}"' },
      { label: 'Find Config Files', template: 'ext:env | ext:yml | ext:json "{target}"' },
      { label: 'Find SQL Dumps', template: 'ext:sql "{target}"' },
      { label: 'Find Log Files', template: 'ext:log "{target}"' },
      { label: 'Find API Endpoints', template: 'inurl:api "{target}"' },
      { label: 'Search Error Messages', template: '"{target}"' },
      { label: 'Find Public Trello Boards', template: 'site:trello.com "{target}"' },
    ]
  },
  Security: {
    icon: ShieldAlert,
    dorks: [
      { label: 'Find Exposed Passwords', template: '"{target}" ext:txt | ext:log | ext:env "password"' },
      { label: 'Exposed Database.config', template: 'ext:inc "db_password" | "db_user" "{target}"' },
      { label: 'Open Cameras / Webcams', template: 'inurl:"view/view.shtml" | inurl:"ViewerFrame?Mode="' },
      { label: 'Exposed Admin Panels', template: 'inurl:admin | inurl:login | inurl:cpanel "{target}"' },
      { label: 'Exposed WordPress Content', template: 'inurl:wp-content/uploads/ ext:txt | ext:sql "{target}"' },
      { label: 'Exposed SSH Keys', template: 'intitle:"index of" id_rsa "{target}"' },
      { label: 'Find FTP Servers', template: 'intitle:"index of" "ftp" "{target}"' },
      { label: 'Find .git Folders', template: 'inurl:"/.git" intitle:"index of" "{target}"' },
      { label: 'Exposed Backup Files', template: 'ext:bak | ext:old | ext:backup "{target}"' },
      { label: 'Find PHPInfo pages', template: 'ext:php intitle:phpinfo "published by the PHP Group" "{target}"' },
    ]
  },
  WordPress: {
    icon: Layers,
    dorks: [
      { label: 'Find Exposed wp-config.php', template: 'ext:txt | ext:inc "wp-config" "{target}"' },
      { label: 'Find Plugins Directory', template: 'inurl:wp-content/plugins/ intitle:"index of" "{target}"' },
      { label: 'Find WP-Admin Login', template: 'inurl:wp-admin | inurl:wp-login.php "{target}"' },
      { label: 'Exposed Database Backups', template: 'ext:sql inurl:wp-content/backups/ "{target}"' },
      { label: 'Find Uploads Directory', template: 'inurl:wp-content/uploads/ intitle:"index of" "{target}"' },
    ]
  },
  Cloud: {
    icon: Cloud,
    dorks: [
      { label: 'Find Open S3 Buckets', template: 'site:s3.amazonaws.com "{target}"' },
      { label: 'Find Google Drive Links', template: 'site:drive.google.com/drive/folders/ "{target}"' },
      { label: 'Find Open Firebase DBs', template: 'site:firebaseio.com "{target}"' },
      { label: 'Azure Blob Storage', template: 'site:blob.core.windows.net "{target}"' },
      { label: 'Google Cloud Storage', template: 'site:storage.googleapis.com "{target}"' },
    ]
  },
  Social: {
    icon: MonitorSmartphone,
    dorks: [
      { label: 'Search LinkedIn Profiles', template: 'site:linkedin.com/in/ "{target}"' },
      { label: 'Search Twitter Threads', template: 'site:twitter.com inurl:status "{target}"' },
      { label: 'Search Facebook Public Posts', template: 'site:facebook.com "{target}" public' },
      { label: 'Search Reddit Posts', template: 'site:reddit.com intitle:"{target}"' },
      { label: 'Find Discord Invites', template: 'site:discord.com/invite/ "{target}"' },
    ]
  }
};

const searchEngines = [
  { name: 'Google', url: 'https://www.google.com/search?q=' },
  { name: 'Bing', url: 'https://www.bing.com/search?q=' },
  { name: 'GitHub', url: 'https://github.com/search?type=code&q=' },
  { name: 'Shodan', url: 'https://www.shodan.io/search?query=' }
];

const availableOperators = [
  { value: 'site:', label: 'Site (Domain)' },
  { value: 'inurl:', label: 'In URL' },
  { value: 'intitle:', label: 'In Title' },
  { value: 'intext:', label: 'In Text' },
  { value: 'ext:', label: 'File Extension' },
  { value: '-', label: 'Exclude (-)' },
  { value: 'OR', label: 'OR (|)' }
];

export default function GoogleDorkingTool() {
  const [targetInput, setTargetInput] = useState('example.com');
  const [activeCategory, setActiveCategory] = useState('SEO');
  const [activeDorkIndex, setActiveDorkIndex] = useState(0);
  const [generatedDork, setGeneratedDork] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Advanced toggles
  const [exactMatch, setExactMatch] = useState(false);
  const [excludeKeyword, setExcludeKeyword] = useState('');
  const [fileType, setFileType] = useState('');

  // New Features State
  const [searchEngine, setSearchEngine] = useState(searchEngines[0]);
  const [favorites, setFavorites] = useState([]);
  
  // Custom Builder State
  const [customBlocks, setCustomBlocks] = useState([{ operator: 'site:', value: '' }]);

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem('dorkFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) { console.error('Failed to parse favorites', e); }
    }
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('dorkFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const sanitizeInput = (val) => {
    // Strip http://, https://, www., and trailing slashes
    let sanitized = val.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/i, '');
    if (sanitized.endsWith('/')) sanitized = sanitized.slice(0, -1);
    return sanitized;
  };

  const handleTargetChange = (e) => {
    setTargetInput(sanitizeInput(e.target.value));
  };

  useEffect(() => {
    updateDork();
  }, [targetInput, activeCategory, activeDorkIndex, exactMatch, excludeKeyword, fileType, customBlocks]);

  const updateDork = () => {
    let dork = '';

    if (activeCategory === 'Favorites') {
      if (favorites[activeDorkIndex]) {
        dork = favorites[activeDorkIndex].replace(/\{target\}/g, targetInput.trim() || 'example.com');
      }
    } else if (activeCategory === 'Custom Builder') {
      dork = customBlocks
        .filter(b => b.operator !== 'OR' ? b.value.trim() !== '' : true)
        .map(b => b.operator === 'OR' || b.operator === '-' ? `${b.operator} ${b.value}` : `${b.operator}${b.value}`)
        .join(' ');
      
      // Still apply the target if the user specifically includes "{target}"
      dork = dork.replace(/\{target\}/g, targetInput.trim() || 'example.com');
    } else {
      const categoryDorks = dorkCategories[activeCategory].dorks;
      if (!categoryDorks[activeDorkIndex]) {
        setActiveDorkIndex(0);
        return;
      }
      
      let baseDorkTemplate = categoryDorks[activeDorkIndex].template;
      let finalTarget = targetInput.trim() || 'example.com';
      
      dork = baseDorkTemplate.replace(/\{target\}/g, finalTarget);
      
      if (exactMatch && !dork.includes(`"${finalTarget}"`)) {
        dork = dork.replace(finalTarget, `"${finalTarget}"`);
      }
      if (excludeKeyword) {
        dork += ` -"${excludeKeyword}"`;
      }
      if (fileType) {
        dork += ` ext:${fileType}`;
      }
    }

    setGeneratedDork(dork.trim());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDork);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeSearch = () => {
    if (!generatedDork) return;
    const url = `${searchEngine.url}${encodeURIComponent(generatedDork)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleFavorite = (dorkTemplate) => {
    if (favorites.includes(dorkTemplate)) {
      setFavorites(favorites.filter(f => f !== dorkTemplate));
    } else {
      setFavorites([...favorites, dorkTemplate]);
    }
  };

  // Syntax Highlighting
  const renderHighlightedDork = () => {
    if (!generatedDork) return <span className="text-gray-500">Select or build a dork query above</span>;
    // Highlight operators
    const operatorRegex = /\b(site:|inurl:|intitle:|ext:|filetype:|intext:|daterange:|-site:|-inurl:|-intitle:|-ext:)\b/g;
    const stringRegex = /"([^"\\]*(\\.[^"\\]*)*)"/g;
    const excludeRegex = /\b(-[^" ]+)\b/g;
    
    // Simple rough DOM construction
    const parts = generatedDork.split(/(\s+)/);
    
    return parts.map((part, i) => {
      if (part.match(operatorRegex)) {
        return <span key={i} className="text-blue-400 font-bold">{part}</span>;
      }
      if (part.match(stringRegex)) {
        return <span key={i} className="text-yellow-400">{part}</span>;
      }
      if (part.match(excludeRegex)) {
        return <span key={i} className="text-red-400 font-bold">{part}</span>;
      }
      return <span key={i} className="text-green-400">{part}</span>;
    });
  };

  // Custom Builder Logic
  const addBlock = () => {
    setCustomBlocks([...customBlocks, { operator: 'site:', value: '' }]);
  };
  const updateBlock = (idx, key, value) => {
    const newBlocks = [...customBlocks];
    newBlocks[idx][key] = value;
    setCustomBlocks(newBlocks);
  };
  const removeBlock = (idx) => {
    setCustomBlocks(customBlocks.filter((_, i) => i !== idx));
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        <Breadcrumbs items={[{ name: 'Google Dorking Tool', href: '/tools/google-dorking-tool' }]} />
        {/* Header section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            Advanced Google Dorking Tool
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Generate powerful Google search operators effortlessly. Uncover SEO opportunities, find code snippets, and audit security vulnerabilities.
          </p>
        </div>

        {/* Main Tool UI */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Input Section - Hidden in Custom Builder */}
            {activeCategory !== 'Custom Builder' && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Target Domain or Keyword</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={targetInput}
                    onChange={handleTargetChange}
                    placeholder="e.g. example.com or keyword"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-lg placeholder-gray-400 dark:placeholder-gray-500 font-mono"
                  />
                  {/* Smart Sanitization Badge */}
                  {targetInput && !targetInput.includes('/') && !targetInput.includes('http') && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded border border-green-200 dark:border-green-800">
                      Auto-sanitized
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
              {Object.keys(dorkCategories).map((category) => {
                const Icon = dorkCategories[category].icon;
                return (
                  <button
                    key={category}
                    onClick={() => {
                      setActiveCategory(category);
                      setActiveDorkIndex(0);
                    }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeCategory === category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category}
                  </button>
                )
              })}
              
              {/* Favorites & Custom Builder Tabs */}
              <button
                onClick={() => { setActiveCategory('Favorites'); setActiveDorkIndex(0); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === 'Favorites' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-amber-600 dark:text-amber-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Star className={`w-4 h-4 ${activeCategory === 'Favorites' ? 'fill-white' : ''}`} />
                Favorites ({favorites.length})
              </button>
              
              <button
                onClick={() => { setActiveCategory('Custom Builder'); setActiveDorkIndex(0); }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === 'Custom Builder' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Settings className="w-4 h-4" />
                Custom Builder
              </button>
            </div>

            {/* Content Area Based on Active Category */}
            {activeCategory === 'Favorites' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                    <Star className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p>No favorites saved yet. Click the star icon on any dork to save it here.</p>
                  </div>
                ) : (
                  favorites.map((dorkTemplate, idx) => (
                    <div key={idx} className={`relative flex items-center pr-2 rounded-xl border transition-all ${activeDorkIndex === idx ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-500' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                      <button
                        onClick={() => setActiveDorkIndex(idx)}
                        className="flex-1 text-left px-5 py-4 truncate"
                      >
                        <p className={`font-medium ${activeDorkIndex === idx ? 'text-amber-700 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          Saved Favorite {idx + 1}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate font-mono">
                          {dorkTemplate.replace('{target}', targetInput || '...')}
                        </p>
                      </button>
                      <button onClick={() => toggleFavorite(dorkTemplate)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : activeCategory === 'Custom Builder' ? (
              <div className="space-y-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                    <Settings className="w-5 h-5" /> Visual Dork Builder
                  </h3>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400">Combine multiple search operators to create highly specific queries without worrying about syntax.</p>
                  
                  <div className="space-y-3">
                    {customBlocks.map((block, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <select
                          value={block.operator}
                          onChange={(e) => updateBlock(idx, 'operator', e.target.value)}
                          className="w-full sm:w-48 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {availableOperators.map(op => (
                            <option key={op.value} value={op.value}>{op.label} ({op.value})</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={block.value}
                          onChange={(e) => updateBlock(idx, 'value', e.target.value)}
                          placeholder={block.operator === 'OR' ? 'Second condition' : 'Value'}
                          className="w-full flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                        />
                        <button
                          onClick={() => removeBlock(idx)}
                          disabled={customBlocks.length === 1}
                          className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={addBlock}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 font-medium text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Operator Block
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Dorks Grid for Preset Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dorkCategories[activeCategory].dorks.map((dork, idx) => {
                    const isFavorited = favorites.includes(dork.template);
                    return (
                      <div key={idx} className={`relative flex items-center pr-2 rounded-xl border transition-all ${activeDorkIndex === idx ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                        <button
                          onClick={() => setActiveDorkIndex(idx)}
                          className="flex-1 text-left px-5 py-4 truncate"
                        >
                          <p className={`font-medium ${activeDorkIndex === idx ? 'text-blue-700 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {dork.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate font-mono">
                            {dork.template.replace('{target}', targetInput || '...')}
                          </p>
                        </button>
                        <button 
                          onClick={() => toggleFavorite(dork.template)}
                          className={`p-2 rounded-lg transition-colors ${isFavorited ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                          title={isFavorited ? "Remove from Favorites" : "Save to Favorites"}
                        >
                          <Star className={`w-5 h-5 ${isFavorited ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Advanced Options Toggle */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                  <details className="group cursor-pointer marker:hidden">
                    <summary className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-300 select-none">
                      <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                      Advanced Filter Options
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exact Match ("")</label>
                        <div className="flex items-center mt-2">
                          <input 
                            type="checkbox" 
                            checked={exactMatch} 
                            onChange={(e) => setExactMatch(e.target.checked)} 
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                          />
                          <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">Wrap target in quotes</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exclude Word (-)</label>
                        <input
                          type="text"
                          value={excludeKeyword}
                          onChange={(e) => setExcludeKeyword(e.target.value)}
                          placeholder="e.g. www"
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">File Type (ext:)</label>
                        <select
                          value={fileType}
                          onChange={(e) => setFileType(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        >
                          <option value="">Any</option>
                          <option value="pdf">PDF (.pdf)</option>
                          <option value="txt">Text (.txt)</option>
                          <option value="sql">SQL (.sql)</option>
                          <option value="env">ENV (.env)</option>
                          <option value="log">Log (.log)</option>
                          <option value="php">PHP (.php)</option>
                        </select>
                      </div>
                    </div>
                  </details>
                </div>
              </>
            )}

            {/* Output Section with Syntax Highlighting */}
            <div className="bg-gray-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 relative z-10">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Code className="w-4 h-4" /> Generated Query (Syntax Highlighted)
                </label>
                
                {/* Search Engine Selector */}
                <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
                  <span className="text-xs text-gray-500 pl-2">Engine:</span>
                  <select 
                    value={searchEngine.name}
                    onChange={(e) => setSearchEngine(searchEngines.find(s => s.name === e.target.value))}
                    className="bg-transparent text-sm text-gray-200 font-medium py-1 px-2 outline-none cursor-pointer"
                  >
                    {searchEngines.map(engine => (
                      <option key={engine.name} value={engine.name} className="bg-gray-800">{engine.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <div className="flex-1 bg-gray-950 border border-gray-700 rounded-xl p-5 font-mono text-lg break-all selection:bg-blue-500/30 overflow-x-auto">
                  {renderHighlightedDork()}
                </div>
                
                <div className="flex sm:flex-col gap-3 min-w-[150px]">
                  <button
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-xl transition-colors border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={executeSearch}
                    disabled={!generatedDork}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-lg shadow-blue-900/20"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open in {searchEngine.name}
                  </button>
                </div>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 font-mono flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Operators</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span> Values</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400"></span> Strings</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Exclusions</span>
              </div>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl p-4 flex gap-3 text-yellow-800 dark:text-yellow-300">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-yellow-600 dark:text-yellow-500" />
              <p className="text-sm leading-relaxed">
                <strong>Ethical Disclaimer:</strong> Google Dorking relies entirely on public data indexed by search engines. However, accessing private servers, databases, or closed systems obtained through these searches without explicit organizational permission violates cybersecurity laws (e.g., CFAA). Use for authorized OSINT, SEO, and bug bounties only.
              </p>
            </div>

          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 space-y-5">
          <div className="prose-premium">

            <h2>About the Google Dorking Tool — Advanced Search Operator Generator</h2>
            <p>
              Most people use Google the same way every day — type a phrase, scroll the results, repeat. But Google has a second mode, one most users never see. It's built around <strong>search operators</strong>, and it's what SEO professionals, security researchers, and developers use to get results that a normal search query simply can't reach.
            </p>
            <p>
              This <strong>Google Dorking Tool</strong> — also called a Google dork generator or advanced search query builder — takes the guesswork out of writing those queries. You pick a category (SEO, Developer, Security, WordPress, Cloud, or Social), enter your target domain or keyword, and it builds the correct <strong>Google dork syntax</strong> for you in real time. No need to memorize operator rules. No trial and error.
            </p>
            <p>
              I've run hundreds of these queries manually over the years — checking indexed pages, hunting for exposed config files, finding guest post opportunities. The thing that wastes the most time isn't understanding the operators. It's the syntax. One wrong quote, one missing space, and Google returns nothing useful. That's exactly what this tool fixes.
            </p>
            <p>
              The tool covers 40+ pre-built dork templates across six use categories, plus a Custom Builder for combining operators visually. You can execute the generated query directly in Google, Bing, GitHub, or Shodan — without leaving the page.
            </p>

            <h2>How to Use the Google Dorking Tool — Step by Step</h2>
            <p>Here's how to go from zero to a working dork query in about 30 seconds:</p>
            <ol>
              <li><strong>Enter your target.</strong> Type a domain (like <code>example.com</code>) or a keyword in the input field at the top. The tool automatically strips <code>https://</code>, <code>www.</code>, and trailing slashes — so your queries don't break due to formatting.</li>
              <li><strong>Pick a category.</strong> Choose from SEO, Developer, Security, WordPress, Cloud, or Social depending on what you're trying to find. Each tab has 5–12 pre-built dork templates specific to that use case.</li>
              <li><strong>Select a dork template.</strong> Click any card from the grid. The output preview updates instantly with your target filled in. The syntax is color-coded — operators show in blue, values in green, quoted strings in yellow, exclusions in red.</li>
              <li><strong>Use advanced filters if needed.</strong> Expand the "Advanced Filter Options" panel to wrap your target in quotes (exact match), add an exclusion keyword, or filter by file type (PDF, SQL, ENV, LOG, PHP).</li>
              <li><strong>Copy or execute.</strong> Click Copy to grab the query, or pick a search engine (Google, Bing, GitHub, Shodan) and click "Open in [Engine]" to run it directly.</li>
            </ol>
            <p>
              The Favorites tab lets you star any dork template and save it for later. The Custom Builder lets you combine operators like <code>site:</code>, <code>inurl:</code>, <code>intitle:</code>, and <code>ext:</code> in any order using a visual block interface — no syntax knowledge needed.
            </p>
            <p>
              One thing worth knowing: the <strong>exact match toggle</strong> wraps your target keyword in quotes. This matters more than it seems. <code>site:example.com api</code> returns pages where "api" appears anywhere in Google's index. <code>site:example.com "api"</code> forces an exact match. For security research especially, that difference determines whether you find what you're actually looking for.
            </p>

            <h2>Is This Tool Private? What Data Does It Send?</h2>
            <p>
              The Google Dorking Tool runs entirely in your browser. It doesn't send your domain, keyword, or generated queries to any server. There's no account, no login, no usage tracking tied to the queries you build here.
            </p>
            <p>
              When you click "Open in Google" (or any other engine), the query goes directly from your browser to Google — the same as typing it yourself in the search bar. This tool acts as a query builder only, not a proxy or data collector.
            </p>
            <p>
              Your saved favorites are stored in your browser's <code>localStorage</code> — local to your device only. They're not synced to a cloud service or visible to anyone else. Clear your browser storage and they're gone.
            </p>
            <p>
              One thing to be honest about: the queries you run on Google are subject to Google's own terms of service. If you run dozens of complex queries in quick succession, Google may serve a CAPTCHA. That's a Google-side rate limit — not something this tool causes or can prevent. Pace your searches if you're doing bulk research.
            </p>

            <h2>What Can This Google Dork Generator Do? — Full Feature List</h2>
            <ul>
              <li><strong>40+ pre-built dork templates</strong> across SEO, Developer, Security, WordPress, Cloud, and Social categories — each one tested and written to produce real, useful results.</li>
              <li><strong>Real-time syntax highlighting</strong> in the output panel: operators (blue), values (green), quoted strings (yellow), and exclusions (red) — so you can read the query structure at a glance.</li>
              <li><strong>Smart input sanitization</strong> — strips <code>https://</code>, <code>www.</code>, and trailing slashes automatically so your dork syntax never breaks.</li>
              <li><strong>Advanced filter panel</strong> — add exact match quotes, exclude a keyword, or filter by file extension (PDF, TXT, SQL, ENV, LOG, PHP) without editing the query manually.</li>
              <li><strong>Visual Custom Builder</strong> — combine any supported operator (site:, inurl:, intitle:, intext:, ext:, -, OR) in a drag-and-drop style block interface without touching raw syntax.</li>
              <li><strong>Multi-engine execution</strong> — run the generated query directly in Google, Bing, GitHub code search, or Shodan from a single dropdown.</li>
              <li><strong>Favorites system</strong> — star any dork template and access your saved queries from the Favorites tab. Stored locally in your browser, no account needed.</li>
              <li><strong>Copy to clipboard</strong> — one click copies the full query string, ready to paste anywhere.</li>
            </ul>
            <p>
              One honest limitation worth flagging: Google periodically deprecates or changes operator behavior without announcement. The <code>daterange:</code> operator in the SEO tab, for example, uses Julian date format and Google's support for it is inconsistent. If a dork returns unexpected results, try running it without that modifier first.
            </p>

            <h2>Technical Specifications</h2>
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Processing location</td>
                  <td>100% client-side — all query generation runs in your browser</td>
                </tr>
                <tr>
                  <td>Dork categories</td>
                  <td>SEO, Developer, Security, WordPress, Cloud, Social</td>
                </tr>
                <tr>
                  <td>Pre-built templates</td>
                  <td>40+ operator templates across all categories</td>
                </tr>
                <tr>
                  <td>Supported operators</td>
                  <td>site:, inurl:, intitle:, intext:, ext:, filetype:, -(exclude), OR / |, "exact match"</td>
                </tr>
                <tr>
                  <td>Supported search engines</td>
                  <td>Google, Bing, GitHub code search, Shodan</td>
                </tr>
                <tr>
                  <td>Advanced filters</td>
                  <td>Exact match toggle, exclude keyword, file type selector (PDF, TXT, SQL, ENV, LOG, PHP)</td>
                </tr>
                <tr>
                  <td>Custom Builder</td>
                  <td>Visual block-based operator builder — combine up to unlimited operator blocks</td>
                </tr>
                <tr>
                  <td>Favorites storage</td>
                  <td>Browser localStorage — no server sync, no account required</td>
                </tr>
                <tr>
                  <td>Data sent to server</td>
                  <td>Zero — no queries, domains, or keywords are transmitted</td>
                </tr>
                <tr>
                  <td>Install required</td>
                  <td>None — works in any modern browser with JavaScript enabled</td>
                </tr>
                <tr>
                  <td>Browser support</td>
                  <td>Chrome, Firefox, Safari, Edge — all modern browsers</td>
                </tr>
                <tr>
                  <td>Mobile support</td>
                  <td>Yes — responsive layout, works on iOS and Android</td>
                </tr>
              </tbody>
            </table>
            <p>
              Built by <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer">Lazydesigners</a> — a team focused on fast, private, client-side web tools. Use the <strong>Google Dorking Tool</strong> above, pick your category, and you'll have a precise, ready-to-run search query in under a minute.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}

// AIzaSyCnBVdiS18jFZ6WpR3FUSYDkOh8vaOHQMU
