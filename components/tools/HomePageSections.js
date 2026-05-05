import Link from 'next/link';
import { ArrowRight, TrendingUp, Star } from 'lucide-react';
import { categories, getPopularTools } from '@/lib/tools-data';
import ToolCard from '@/components/tools/ToolCard';

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {categories.filter(cat => cat.id !== 'all').map((category) => {
        const IconComponent = category.icon;
        return (
          <Link key={category.id} href={`/tools/${category.id}`}>
            <div className="group card-hover p-6 text-center h-full">
              <div className={`inline-flex items-center justify-center w-14 h-14 ${category.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                <IconComponent className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {category.name}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">
                {category.description}
              </p>
              <div className="text-sm text-primary-600 dark:text-primary-400 font-semibold">
                {category.count}+ tools
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function PopularToolsGrid() {
  const popularTools = getPopularTools().slice(0, 8);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
        {popularTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} showPopularBadge />
        ))}
      </div>
      <div className="text-center">
        <Link href="/tools/popular" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-lg">
          View All Popular Tools
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </>
  );
}
