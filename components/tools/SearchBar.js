'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { searchTools } from '@/lib/tools-data';

const SearchBar = ({ onClose, placeholder = "Search tools..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [popularSearches] = useState([
    'image converter',
    'password generator',
    'pdf compressor',
    'qr code generator',
    'color picker'
  ]);

  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when route changes (user navigated to a tool)
  useEffect(() => {
    setShowResults(false);
    setQuery('');
  }, [pathname]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Close dropdown when clicking outside the search container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchTools(query);
      setResults(searchResults.slice(0, 8));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const closeDropdown = useCallback(() => {
    setShowResults(false);
    setQuery('');
    searchInputRef.current?.blur();
    if (onClose) onClose();
  }, [onClose]);

  const handleSearch = (searchQuery) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const updatedRecent = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 5);

    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Navigate to search results
    router.push(`/tools?search=${encodeURIComponent(searchQuery)}`);
    closeDropdown();
  };

  const handleToolSelect = (tool) => {
    setShowResults(false);
    setQuery('');
    searchInputRef.current?.blur();
    router.push(tool.path);
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleToolSelect(results[0]);
      } else {
        handleSearch(query);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Search Input */}
      <div className="relative">
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(query.trim() ? true : false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          autoComplete="off"
        />

        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setShowResults(false);
              searchInputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg border border-slate-200 dark:border-slate-700 z-50 max-h-96 overflow-y-auto">
          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 px-3 py-2">
                Search Results
              </div>
              {results.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolSelect(tool)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left"
                >
                  <tool.icon className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white truncate">
                      {tool.name}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {tool.description}
                    </div>
                  </div>
                </button>
              ))}

              {results.length >= 8 && (
                <button
                  onClick={() => handleSearch(query)}
                  className="w-full p-3 text-center text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors font-medium"
                >
                  See all results for &quot;{query}&quot;
                </button>
              )}
            </div>
          )}

          {/* No Results */}
          {query.trim() && results.length === 0 && (
            <div className="p-6 text-center">
              <div className="text-slate-500 dark:text-slate-400 mb-2">
                No tools found for &quot;{query}&quot;
              </div>
              <button
                onClick={() => handleSearch(query)}
                className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
              >
                Search all tools
              </button>
            </div>
          )}

          {/* Recent & Popular Searches */}
          {!query.trim() && (recentSearches.length > 0 || popularSearches.length > 0) && (
            <div className="p-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Recent Searches
                      </span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(search);
                        handleSearch(search);
                      }}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="text-slate-700 dark:text-slate-300">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <div className="flex items-center space-x-2 px-3 py-2">
                  <TrendingUp className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Popular Searches
                  </span>
                </div>
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(search);
                      handleSearch(search);
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors text-left"
                  >
                    <TrendingUp className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;