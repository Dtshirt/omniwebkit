'use client';

import Link from 'next/link';
import { Star, ArrowRight, Zap } from 'lucide-react';

const ToolCard = ({ tool, showPopularBadge = false, compact = false }) => {
  const IconComponent = tool.icon;

  return (
    <Link href={tool.path} className="group block">
      <div className={`card-hover ${compact ? 'p-4' : 'p-6'} relative h-full overflow-hidden`}>
        {/* Popular Badge */}
        {(tool.popular && showPopularBadge) && (
          <div className="absolute top-3 right-3 flex items-center space-x-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
            <Star className="h-3 w-3 fill-current" />
            <span>Popular</span>
          </div>
        )}

        {/* Tool Icon */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
              <IconComponent className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {tool.name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className={`text-slate-600 dark:text-slate-400 leading-relaxed ${compact ? 'text-sm mb-3' : 'mb-4'}`}>
          {tool.description}
        </p>

        {/* Features (only show if not compact) */}
        {!compact && tool.features && tool.features.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {tool.features.slice(0, 3).map((feature, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg font-medium"
                >
                  {feature}
                </span>
              ))}
              {tool.features.length > 3 && (
                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center">
                  +{tool.features.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags (only show if compact) */}
        {compact && tool.tags && tool.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {tool.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-lg"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
              Free Tool
            </span>
          </div>

          <div className="flex items-center space-x-1 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
            <span className="text-sm font-semibold">Use Tool</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.03] to-primary-600/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      </div>
    </Link>
  );
};

export default ToolCard;