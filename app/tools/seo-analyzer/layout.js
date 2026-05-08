import RelatedTools from '@/components/seo/RelatedTools';
import SeoContentSection from '@/components/seo/SeoContentSection';
import { seoData } from '@/lib/seoData';

const toolSeo = seoData['seo-analyzer'];

export const metadata = toolSeo ? {
  title: toolSeo.title,
  description: toolSeo.description,
  keywords: toolSeo.keywords?.join(', '),
  alternates: {
    canonical: toolSeo.canonical,
  },
  openGraph: {
    title: toolSeo.title,
    description: toolSeo.description,
    url: toolSeo.canonical,
    type: 'website',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: toolSeo.name + ' - OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: toolSeo.title,
    description: toolSeo.description,
    images: ['https://omniwebkit.com/og-image.jpg'],
  },
} : {};

export default function SEOAnalyzerLayout({ children }) {
  const jsonLd = toolSeo ? {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: toolSeo.name,
    url: toolSeo.canonical,
    description: toolSeo.description,
    applicationCategory: 'SeoApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    ...(toolSeo.faq && toolSeo.faq.length > 0 ? [{
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: toolSeo.faq.map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer
        }
      }))
    }] : [])
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        
        {toolSeo && <SeoContentSection toolSeo={toolSeo} />}
        <RelatedTools currentTool="seo-analyzer" category="seo" />
      </div>
    </>
  );
}
