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

        {/* Extensive SEO Content */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700 p-8 sm:p-12 lg:p-16 prose prose-lg dark:prose-invert max-w-none">
          
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-8 pb-4 border-b border-gray-200 dark:border-gray-700">
            The Ultimate Guide to Google Dorking & OSINT Research
          </h2>
          
          <p>
            Whether you are An SEO professional looking for link-building opportunities, a software developer seeking specific code snippets, or a cybersecurity researcher hunting for vulnerabilities, standard Google searches often fall short. They yield millions of results, most of which are irrelevant. Enter <strong>Google Dorking</strong> (also known as <em>Google Hacking</em>)—the art of using advanced search operators to filter, refine, and pinpoint exactly what you are looking for.
          </p>

          <p>
            Our <strong>Free Advanced Google Dorking Tool</strong> automates the creation of complex search queries. Instead of memorizing dozens of search operators and syntax rules, you simply select your objective, input your target domain or keyword, and let the tool generate a copy-paste ready query. Proceeding from basic queries to sophisticated vulnerability discovery, let's explore everything you need to know about Google Dorks.
          </p>

          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">What is Google Dorking?</h3>
          <p>
            Google Dorking involves using advanced search operators—specialized commands embedded directly into Google search queries—to narrow down results. While the average user types a simple phrase like <em>how to fix a leaky faucet</em>, professionals use operators like <code>site:</code>, <code>inurl:</code>, and <code>filetype:</code> to instruct Google's algorithm to search within specific websites, URLs, or file formats.
          </p>
          <p>
            Originally coined in 2002 by security researcher Johnny Long, the term "Google Dork" was used to describe an inept person who exposed sensitive information on the internet. Shortened to "dorking" over time, it has evolved into a highly respected technique used across multiple digital disciplines.
          </p>

          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">How SEO Professionals Use Google Dorks</h3>
          <p>
            Search Engine Optimization (SEO) requires competitive intelligence and finding hidden ranking opportunities. Advanced search operators are an SEO expert's best friend.
          </p>
          <ul>
            <li><strong>Finding Indexation Issues:</strong> By using <code>site:yourdomain.com</code>, an SEO can quickly see approximately how many pages Google has indexed for a given domain. Adding a minus operator (e.g., <code>site:yourdomain.com -inurl:https</code>) can instantly reveal insecure HTTP pages that need to be redirected.</li>
            <li><strong>Discovering Guest Post Opportunities:</strong> Building backlinks through guest posting is highly effective. Instead of manual outreach, SEOs use queries like <code>"your niche" "write for us"</code> or <code>"submit a guest post"</code> to find websites actively accepting contributions.</li>
            <li><strong>Resource Page Link Building:</strong> Finding resource directories is simplified with <code>inurl:resources "your industry"</code>. This targets web pages specifically designed to link out to valuable content.</li>
            <li><strong>Tracking Unlinked Brand Mentions:</strong> To find where your brand is mentioned but not linked, you can use <code>"Your Brand Name" -site:yourdomain.com</code>. This filters out your own website's mentions, showing you external coverage where you can request a backlink.</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">How Software Developers Use Google Dorks</h3>
          <p>
            Developers spend a significant amount of time debugging and researching code. Google Dorks help cut through the noise of consumer tech support forums to find actual developer solutions.
          </p>
          <ul>
            <li><strong>Targeting Specific Forums:</strong> When confronting a bug, a developer might search <code>site:stackoverflow.com "NullReferenceException"</code> to exclusively search StackOverflow, skipping unhelpful blogs.</li>
            <li><strong>Locating Open Source Examples:</strong> Using <code>site:github.com "import tensorflow"</code> allows developers to find open-source repositories using specific libraries to learn from real-world implementations.</li>
            <li><strong>Finding Code Snippets:</strong> Queries like <code>site:pastebin.com "function connectDatabase"</code> can reveal publicly shared code snippets that solve common architectural problems.</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">Cybersecurity, Bug Bounty and OSINT</h3>
          <p>
            The most extensive use of Google Dorking lies in the world of cybersecurity. Security professionals and ethical hackers use these techniques to map out a company's attack surface and identify accidentally exposed sensitive information (Open Source Intelligence or OSINT).
          </p>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl border-l-4 border-indigo-500 my-6">
            <h4 className="font-semibold text-lg mb-2">Common Vulnerability Disclosures found via Dorking:</h4>
            <ol className="mb-0 space-y-2">
              <li><strong>Exposed Environment Files:</strong> Using <code>ext:env "DB_PASSWORD"</code> can reveal configuration files containing database credentials left accessible on public servers.</li>
              <li><strong>Database Dumps:</strong> A careless server migration might leave a SQL backup file publicly accessible, findable with <code>ext:sql intext:"INSERT INTO"</code>.</li>
              <li><strong>Unsecured Cameras:</strong> Default hardware configurations often leave IP cameras publicly visible on the internet, discoverable via specific URL patterns like <code>inurl:"view/view.shtml"</code>.</li>
              <li><strong>Open Directories:</strong> When a web server lacks a default index file and directory listing is enabled, a hacker can browse the entire file system using <code>intitle:"index of"</code>.</li>
            </ol>
          </div>
          
          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">Beyond Google: Shodan, Bing and GitHub</h3>
          <p>
            While Google is the most powerful general-purpose search engine, our tool supports switching your executed query to other platforms:
          </p>
          <ul>
            <li><strong>Shodan:</strong> The "search engine for the Internet of Things". Shodan indexes server headers, open ports, and device banners rather than web content. Executing dorks against Shodan can reveal unsecured webcams, industrial control systems, and raw database servers.</li>
            <li><strong>GitHub:</strong> Many developers accidentally commit API keys, AWS credentials, or passwords into public GitHub repositories. Executing queries via GitHub code search identifies these leaks.</li>
            <li><strong>Bing:</strong> Different search engine crawlers index the web at different speeds and with different methodologies. What Google removed via a DMCA or privacy request might still be cached on Bing.</li>
          </ul>

          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">Essential Search Operators Cheatsheet</h3>
          <p>
            To master Google Dorking, you need to understand the fundamental building blocks. Here are the most critical operators:
          </p>
          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="p-4 border border-gray-200 dark:border-gray-700 font-semibold">Operator</th>
                  <th className="p-4 border border-gray-200 dark:border-gray-700 font-semibold">Description</th>
                  <th className="p-4 border border-gray-200 dark:border-gray-700 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code className="text-blue-600 dark:text-blue-400">site:</code></td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700">Limits results to a specific domain or TLD.</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code>site:gov</code></td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code className="text-blue-600 dark:text-blue-400">inurl:</code></td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700">Restricts results to documents containing that word in the URL.</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code>inurl:login</code></td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code className="text-blue-600 dark:text-blue-400">intitle:</code></td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700">Restricts results to documents containing that word in the title.</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code>intitle:"index of"</code></td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code className="text-blue-600 dark:text-blue-400">filetype:</code> or <code className="text-blue-600 dark:text-blue-400">ext:</code></td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700">Restricts results to a specific file extension.</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code>ext:pdf</code></td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code className="text-blue-600 dark:text-blue-400">" "</code></td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700">Forces an exact match search.</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code>"exact phrase"</code></td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code className="text-blue-600 dark:text-blue-400">-</code> (Minus)</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700">Excludes a specific word or site from the results.</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code>-site:wikipedia.org</code></td>
                </tr>
                <tr>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code className="text-blue-600 dark:text-blue-400">OR</code> or <code className="text-blue-600 dark:text-blue-400">|</code></td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700">Matches either the first or the second term.</td>
                  <td className="p-4 border border-gray-200 dark:border-gray-700"><code>ext:jpg | ext:png</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">Why Using Our Google Dorks Generator is Better</h3>
          <p>
            While any technical expert can memorize the operators described above, stringing them together cleanly—especially when escaping characters and dealing with complex boolean logic—is tedious and prone to human error. A single misplaced quote or missing space can break a Google query, returning zero results or millions of false positives.
          </p>
          <p>
            Our Advanced Google Dork generator provides an organized interface where you can quickly select your exact use case. We automatically sanitize URL inputs (stripping <code>https://</code> and trailing slashes) so your dorks never break. The tool features syntax highlighting so you easily understand how operators combine, a Visual Custom Builder for advanced users, and local Favorites synchronization so your core testing suite is always available.
          </p>

          <h3 className="text-2xl font-semibold mt-10 mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h3>
          
          <div className="space-y-6 mt-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Is Google Dorking illegal?</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-0">No, the act of using Google search operators is entirely legal. They are a built-in feature of the Google search engine. However, finding sensitive data (like a database password) and subsequently using that data to log into a server without permission is a cybercrime. Always maintain ethical boundaries.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Can Google block me for Dorking?</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-0">If you execute too many complex queries in rapid succession, Google's automated systems may flag your IP address for suspicious bot activity. You will likely be prompted to solve a reCAPTCHA to prove you are human. To prevent this, avoid using automated scraping tools without proxy rotation.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">How do I prevent my site from being Dorked?</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-0">To protect your website, ensure that you restrict directory listing in your server configuration (e.g., Apache or Nginx). Use a properly configured <code>robots.txt</code> file to disallow the crawling of sensitive directories, and never store passwords, API keys, or database backups on an internet-facing web server directory.</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">Do these operators work on Bing or DuckDuckGo?</h4>
              <p className="text-gray-600 dark:text-gray-300 mb-0">Many basic operators like <code>site:</code>, <code>" "</code>, and <code>filetype:</code> work across major search engines. However, Google maintains the most comprehensive and complex operator support out of all consumer search engines, which is why "Google Dorking" remains the industry standard term.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// AIzaSyCnBVdiS18jFZ6WpR3FUSYDkOh8vaOHQMU
