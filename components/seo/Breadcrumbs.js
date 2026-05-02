import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 text-sm">
        <li className="inline-flex items-center">
          <Link href="/" className="inline-flex items-center text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors font-medium">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
            <Link href="/tools" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors font-medium">
              Tools
            </Link>
          </div>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} aria-current={isLast ? 'page' : undefined}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-slate-400 mx-1" />
                {isLast ? (
                  <span className="text-slate-800 dark:text-slate-200 font-semibold cursor-default">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors font-medium">
                    {item.name}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
