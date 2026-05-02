'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc, 
  Star,
  Zap,
  Search
} from 'lucide-react';
import { categories, tools, searchTools } from '@/lib/tools-data';
import ToolCard from '@/components/tools/ToolCard';
import SearchBar from '@/components/tools/SearchBar';

const AllToolsContent = () => {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get search query from URL params
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Filter and sort tools
  const filteredAndSortedTools = useMemo(() => {
    let filtered = tools;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = searchTools(searchQuery);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Sort tools
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'popular':
          aValue = a.popular ? 1 : 0;
          bValue = b.popular ? 1 : 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1;
      }
      return aValue > bValue ? 1 : -1;
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when changing category
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Tools ({filteredAndSortedTools.length})
            </h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover our complete collection of {tools.length}+ free online tools. 
              Search, filter, and find exactly what you need.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar 
              placeholder="Search from 100+ tools..." 
            />
          </div>

          {/* Controls */}
          <div className="flex  flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Left Controls */}
            <div className="flex flex-wrap items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center space-x-2 md:hidden"
              >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </button>

              {/* Category Pills (Desktop) */}
              <div className="hidden md:flex flex-wrap items-center space-x-2 overflow-x-auto">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`flex items-center my-2 space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span>{category.name}</span>
                      {category.id !== 'all' && (
                        <span className="text-xs opacity-75">
                          {tools.filter(t => t.category === category.id).length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex flex-wrap items-center space-x-4">
              {/* Sort Options */}
              <div className="flex my-2 items-center space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 bg-white dark:bg-gray-800"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="popular">Popular</option>
                </select>

                <button
                  onClick={toggleSortOrder}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white transition-colors"
                  title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  {sortOrder === 'asc' ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white dark:hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <div className="md:hidden mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategoryChange(category.id);
                      setShowFilters(false);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <category.icon className="h-4 w-4" />
                    <span>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
              
              {searchQuery && (
               <span className="inline-flex items-center space-x-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm">
                  <Search className="h-3 w-3" />
                  <span>"{searchQuery}"</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center space-x-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                  <Filter className="h-3 w-3" />
                  <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 dark:hover:text-gray-300"
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Tools Grid/List */}
        {filteredAndSortedTools.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredAndSortedTools.map((tool) => (
              <ToolCard 
                key={tool.id} 
                tool={tool} 
                showPopularBadge={true}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tools found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery 
                ? `No tools match your search "${searchQuery}"`
                : "No tools found for the selected category"
              }
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="btn-primary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Show All Tools
            </button>
          </div>
        )}

        {/* Load More (if needed for performance) */}
        {filteredAndSortedTools.length >= 50 && (
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Showing {Math.min(50, filteredAndSortedTools.length)} of {filteredAndSortedTools.length} tools
            </p>
            <button className="btn-secondary">
              Load More Tools
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AllToolsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
      </div>
    }>
      <AllToolsContent />
    </Suspense>
  );
};

export default AllToolsPage;