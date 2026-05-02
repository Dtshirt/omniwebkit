'use client';

import { useState, useMemo } from 'react';
import { 
  Star, 
  TrendingUp, 
  Grid, 
  List, 
  Filter,
  Crown,
  Users,
  Clock,
  ArrowRight
} from 'lucide-react';
import { getPopularTools, categories } from '@/lib/tools-data';
import ToolCard from '@/components/tools/ToolCard';
import SearchBar from '@/components/tools/SearchBar';

const PopularToolsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('usage');

  const popularTools = getPopularTools();

  // Filter and sort popular tools
  const filteredTools = useMemo(() => {
    let filtered = popularTools;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Sort tools
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'usage':
        default:
          // Simulate usage ranking (in real app, this would come from analytics)
          const usageOrder = [
            'password-generator',
            'image-converter', 
            'qr-generator',
            'json-formatter',
            'basic-calculator',
            'pdf-compressor',
            'background-remover',
            'currency-converter',
            'html-minifier',
            'color-picker'
          ];
          const aIndex = usageOrder.indexOf(a.id);
          const bIndex = usageOrder.indexOf(b.id);
          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      }
    });
  }, [popularTools, selectedCategory, sortBy]);

  // Get category stats
  const categoryStats = categories
    .filter(cat => cat.id !== 'all')
    .map(category => ({
      ...category,
      popularCount: popularTools.filter(tool => tool.category === category.id).length
    }))
    .filter(cat => cat.popularCount > 0);

  const stats = {
    totalPopular: popularTools.length,
    totalCategories: categoryStats.length,
    mostPopularCategory: categoryStats.reduce((max, cat) => 
      cat.popularCount > max.popularCount ? cat : max, categoryStats[0])
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl mb-6">
            <Crown className="h-10 w-10 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Popular Tools
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Discover the most loved and frequently used tools by our community. 
            These are the tools that get the job done, tested by thousands of users.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-lg mx-auto mb-3">
                <Star className="h-6 w-6 fill-current" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalPopular}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Popular Tools
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg mx-auto mb-3">
                <Users className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                50K+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Daily Users
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg mx-auto mb-3">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                1M+
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Tools Used Today
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar placeholder="Search popular tools..." />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            <span>All Categories</span>
            <span className="bg-black/20 dark:bg-white dark:bg-gray-800/20 px-2 py-0.5 rounded-full text-xs">
              {popularTools.length}
            </span>
          </button>

          {categoryStats.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{category.name}</span>
                <span className="bg-black/20 dark:bg-white dark:bg-gray-800/20 px-2 py-0.5 rounded-full text-xs">
                  {category.popularCount}
                </span>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? 'All Popular Tools' : 
                `Popular ${categories.find(c => c.id === selectedCategory)?.name}`}
              <span className="text-gray-500 dark:text-gray-400 ml-2">({filteredTools.length})</span>
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800"
            >
              <option value="usage">Most Used</option>
              <option value="name">Name A-Z</option>
              <option value="category">Category</option>
            </select>

            {/* View Mode */}
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

        {/* Popular Tools Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
        } mb-16`}>
          {filteredTools.map((tool, index) => (
            <div key={tool.id} className="relative">
              {/* Ranking Badge for top 3 in grid view */}
              {viewMode === 'grid' && sortBy === 'usage' && index < 3 && selectedCategory === 'all' && (
                <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  'bg-orange-500'
                }`}>
                  {index + 1}
                </div>
              )}
              
              <ToolCard 
                tool={tool} 
                showPopularBadge={true}
                compact={viewMode === 'list'}
              />
            </div>
          ))}
        </div>

        {/* Most Popular by Category */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Most Popular by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryStats.map((category) => {
              const topTool = popularTools
                .filter(tool => tool.category === category.id)
                .sort((a, b) => {
                  // Simple popularity ranking
                  const usageOrder = [
                    'password-generator', 'image-converter', 'qr-generator',
                    'json-formatter', 'basic-calculator', 'pdf-compressor'
                  ];
                  return usageOrder.indexOf(a.id) - usageOrder.indexOf(b.id);
                })[0];
              
              if (!topTool) return null;

              const IconComponent = category.icon;
              return (
                <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.popularCount} popular tools
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Most Popular
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {topTool.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {topTool.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <a
                      href={topTool.path}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center space-x-1 group-hover:translate-x-1 transition-transform"
                    >
                      <span>Try it now</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href={`/tools/${category.id}`}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300 dark:hover:text-gray-300 text-sm"
                    >
                      View all →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Why These Tools Are Popular */}
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why These Tools Are So Popular?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Save Time
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                These tools solve common problems quickly, saving hours of manual work and research.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Trusted by Thousands
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Proven reliability with thousands of daily users across different industries and use cases.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 fill-current" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Top Quality
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Built with the latest technology and continuously improved based on user feedback.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Explore our complete collection of 100+ free tools across all categories.
          </p>
          <a
            href="/tools"
            className="btn-primary inline-flex items-center space-x-2 px-8 py-3 text-lg"
          >
            <span>Browse All Tools</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default PopularToolsPage;