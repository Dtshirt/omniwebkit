import Breadcrumbs from '@/components/seo/Breadcrumbs';
import SeoAnalyzerClient from './SeoAnalyzerClient';

export const metadata = {
  title: 'Website SEO Analyzer - Audit On-Page SEO & Meta Tags',
  description: 'Instantly audit any webpage for critical SEO metrics, meta tags, and headings, or upload a CSV to scan thousands of URLs automatically.',
};

export default function SEOAnalyzerPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Website SEO Analyzer",
    "description": "Instantly audit any webpage for critical SEO metrics, meta tags, and headings, or upload a CSV to scan thousands of URLs automatically.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "url": "https://omniwebkit.com/tools/seo-analyzer",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Lazydesigners",
      "url": "https://github.com/Dtshirt/omniwebkit"
    }
  };

  return (
    <div className="w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="pt-6 px-6 max-w-5xl mx-auto">
        <Breadcrumbs 
          items={[
            { name: 'SEO Analyzer', href: '/tools/seo-analyzer' },
          ]} 
        />
      </div>
      <SeoAnalyzerClient />
    </div>
  );
}
