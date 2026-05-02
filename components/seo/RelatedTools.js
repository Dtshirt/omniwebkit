import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { tools } from '@/lib/tools-data';

/**
 * Related Tools component for internal linking.
 * Displays 4-6 related tools based on category/tags.
 * Server component — renders as crawlable HTML for Google.
 */
export default function RelatedTools({ currentToolId, category, maxItems = 6 }) {
  const relatedTools = tools
    .filter(t => t.id !== currentToolId && t.category === category)
    .slice(0, maxItems);

  if (relatedTools.length === 0) return null;

  return (
    <section className="mt-16 mb-8 max-w-4xl mx-auto px-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Related Tools You Might Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTools.map((tool) => {
          const IconComponent = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.path}
              className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                <IconComponent className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {tool.description}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
