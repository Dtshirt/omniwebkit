'use client';

import { useState, useMemo } from 'react';
import { notFound } from 'next/navigation';
import {
  Grid,
  List,
  Star,
  Filter,
  Search,
  ArrowRight,
  Zap
} from 'lucide-react';
import { categories, getToolsByCategory } from '@/lib/tools-data';
import ToolCard from '@/components/tools/ToolCard';
import SearchBar from '@/components/tools/SearchBar';

export default function CategoryPage({ params }) {
  const { category } = params;
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('name');
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);

  // Find category info
  const categoryInfo = categories.find(cat => cat.id === category);
  if (!categoryInfo) {
    notFound();
  }

  // Get tools for this category
  const categoryTools = getToolsByCategory(category);

  // Filter and sort tools
  const filteredTools = useMemo(() => {
    let filtered = showOnlyPopular
      ? categoryTools.filter(tool => tool.popular)
      : categoryTools;

    // Sort tools
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popular':
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [categoryTools, showOnlyPopular, sortBy]);

  const popularTools = categoryTools.filter(tool => tool.popular);
  const IconComponent = categoryInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 ${categoryInfo.color} rounded-2xl mb-6`}>
            <IconComponent className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryInfo.name}
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
            {categoryInfo.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
              <Zap className="h-4 w-4 text-green-500" />
              <span>{categoryTools.length} Tools Available</span>
            </div>

            {popularTools.length > 0 && (
              <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-4 py-2 rounded-full">
                <Star className="h-4 w-4 fill-current" />
                <span>{popularTools.length} Popular</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <span>All Free • No Registration</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar placeholder={`Search ${categoryInfo.name.toLowerCase()}...`} />
        </div>

        {/* Popular Tools Section */}
        {popularTools.length > 0 && !showOnlyPopular && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Popular {categoryInfo.name}
                </h2>
              </div>

              <button
                onClick={() => setShowOnlyPopular(true)}
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
              >
                <span>View all popular</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {popularTools.slice(0, 4).map((tool) => (
                <ToolCard key={tool.id} tool={tool} showPopularBadge />
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {showOnlyPopular ? 'Popular Tools' : 'All Tools'}
              <span className="text-gray-500 dark:text-gray-400 ml-2">({filteredTools.length})</span>
            </h2>

            {showOnlyPopular && (
              <button
                onClick={() => setShowOnlyPopular(false)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                ← Show all tools
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowOnlyPopular(!showOnlyPopular)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${showOnlyPopular
                    ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
              >
                <Star className={`h-4 w-4 ${showOnlyPopular ? 'fill-current' : ''}`} />
                <span>Popular Only</span>
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
            >
              <option value="name">Sort by Name</option>
              <option value="popular">Sort by Popularity</option>
            </select>

            {/* View Mode */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                title="Grid View"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                title="List View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tools Grid/List */}
        {filteredTools.length > 0 ? (
          <div className={`${viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }`}>
            {filteredTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                showPopularBadge={!showOnlyPopular}
                compact={viewMode === 'list'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No tools found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {showOnlyPopular
                ? `No popular tools in ${categoryInfo.name.toLowerCase()} category`
                : `No tools found in ${categoryInfo.name.toLowerCase()} category`
              }
            </p>
            {showOnlyPopular && (
              <button
                onClick={() => setShowOnlyPopular(false)}
                className="btn-primary"
              >
                Show All Tools
              </button>
            )}
          </div>
        )}

        {/* Category Features */}
        <div className="mt-16 card p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Use Our {categoryInfo.name}?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All processing happens in your browser for instant results
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Filter className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                No Registration Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Start using tools immediately without signing up
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Always Free
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All tools are completely free with no hidden costs
              </p>
            </div>
          </div>
        </div>

        {/* Related Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Explore Other Categories
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories
              .filter(cat => cat.id !== 'all' && cat.id !== category)
              .slice(0, 4)
              .map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <a
                    key={cat.id}
                    href={`/tools/${cat.id}`}
                    className="group p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all hover:shadow-lg"
                  >
                    <div className={`w-10 h-10 ${cat.color} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <CatIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {cat.count}+ tools
                    </p>
                  </a>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}