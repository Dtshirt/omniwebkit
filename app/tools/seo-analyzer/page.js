import Breadcrumbs from '@/components/seo/Breadcrumbs';
import SEOAnalyzerClient from './SEOAnalyzerClient';

export default function SEOAnalyzerPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <Breadcrumbs 
          items={[
            { label: 'Home', href: '/' },
            { label: 'Tools', href: '/tools' },
            { label: 'SEO Analyzer', href: '/tools/seo-analyzer' },
          ]} 
        />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
          Full-Stack SEO Analyzer
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Analyze any website for technical SEO issues, meta tags, heading structure, links, and more.
        </p>
      </div>

      <SEOAnalyzerClient />
    </div>
  );
}
