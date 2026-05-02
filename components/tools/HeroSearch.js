'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { searchTools } from '@/lib/tools-data';

export default function HeroSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchTools(searchQuery);
      setSearchResults(results.slice(0, 6));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <div className="max-w-2xl mx-auto mb-10 relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
        <input
          type="text"
          placeholder="Search 100+ tools... (e.g., image converter, pdf merger)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all text-lg"
        />
      </div>

      {/* Search Results Dropdown */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 z-[100000] overflow-hidden">
          {searchResults.map((tool) => (
            <Link key={tool.id} href={tool.path}>
              <div className="flex items-center justify-between space-x-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className='flex items-center  space-x-3'>
                  <tool.icon className="h-5 w-5 text-primary-600" />
                <div className="flex-1 text-left">
                  <div className="font-medium text-slate-900 dark:text-white">{tool.name}</div>
                  <div className="text-sm text-slate-500">{tool.description}</div>
                </div>
                </div> 
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
