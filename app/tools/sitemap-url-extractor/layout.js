import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Sitemap URL Extractor — Extract All URLs from XML Sitemaps',
  description:
    'Free online sitemap URL extractor. Paste any sitemap URL to extract all pages. Follows sitemap indexes. Export as TXT, CSV, or JSON. No signup.',
  keywords: [
    'sitemap url extractor free',
    'extract urls from sitemap',
    'sitemap parser online',
    'sitemap url list extractor',
    'xml sitemap extractor free',
    'extract pages from sitemap',
    'sitemap url export tool',
    'sitemap index extractor',
    'free sitemap parser tool',
    'sitemap to csv converter',
  ],
  openGraph: {
    title: 'Free Sitemap URL Extractor — XML Sitemap Parser',
    description:
      'Extract all URLs from any XML sitemap. Follows sitemap indexes. Export as TXT, CSV, JSON. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/sitemap-url-extractor',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Sitemap URL Extractor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Sitemap URL Extractor',
    description: 'Extract URLs from any XML sitemap. Export TXT, CSV, JSON. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/sitemap-url-extractor',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Sitemap URL Extractor',
  description:
    'Free browser-based sitemap URL extractor and parser. Paste any XML sitemap URL to extract all page URLs, last modified dates, and priorities. Automatically follows sitemap index files and extracts child sitemaps. Features: CORS proxy fallback chain, searchable results table with row numbers, copy all URLs, export as TXT/CSV/JSON, responsive layout, toast notifications. All processing browser-based. No server storage, no signup.',
  url: 'https://omniwebkit.com/tools/sitemap-url-extractor',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Extract URLs from XML sitemaps',
    'Automatically follow sitemap index files',
    'CORS proxy fallback chain (3 proxies)',
    'Searchable results table with row numbers',
    'Display last modified dates and priorities',
    'Copy all URLs to clipboard',
    'Export as TXT, CSV, or JSON',
    'Filter URLs by keyword',
    'Toast notification system',
    '100% browser-based — no server storage',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Extract URLs from a Sitemap',
  description: 'Steps to extract all URLs from an XML sitemap using the OmniWebKit Sitemap URL Extractor.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter the sitemap URL', text: 'Paste the full URL of the XML sitemap (e.g., example.com/sitemap.xml).' },
    { '@type': 'HowToStep', position: 2, name: 'Click Extract', text: 'The tool fetches and parses the XML, following any child sitemaps.' },
    { '@type': 'HowToStep', position: 3, name: 'Review results', text: 'Browse the searchable table showing URLs, dates, and priorities.' },
    { '@type': 'HowToStep', position: 4, name: 'Filter if needed', text: 'Use the search bar to filter URLs by keyword or path.' },
    { '@type': 'HowToStep', position: 5, name: 'Export', text: 'Copy all URLs or download as TXT, CSV, or JSON.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this sitemap extractor free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
    { '@type': 'Question', name: 'What sitemap formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'Standard XML sitemaps (urlset) and sitemap indexes (sitemapindex).' } },
    { '@type': 'Question', name: 'Why does it use CORS proxies?', acceptedAnswer: { '@type': 'Answer', text: 'Browsers block cross-origin requests. CORS proxies make it possible to fetch any public sitemap.' } },
    { '@type': 'Question', name: 'What export formats are available?', acceptedAnswer: { '@type': 'Answer', text: 'TXT (one URL per line), CSV (URL, date, priority), and JSON (full array).' } },
    { '@type': 'Question', name: 'Can it extract from password-protected sitemaps?', acceptedAnswer: { '@type': 'Answer', text: 'No. Only publicly accessible sitemaps are supported.' } },
    { '@type': 'Question', name: 'How many URLs can it handle?', acceptedAnswer: { '@type': 'Answer', text: 'No limit. All URLs are displayed in a scrollable table and included in exports.' } },
    { '@type': 'Question', name: 'Does it show last modified dates?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, if the sitemap includes lastmod elements.' } },
    { '@type': 'Question', name: 'Does it send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Parsing runs in your browser. Only the sitemap fetch goes through a CORS proxy.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Sitemap URL Extractor', item: 'https://omniwebkit.com/tools/sitemap-url-extractor' },
  ],
};

export default function SitemapUrlExtractorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="sitemap-url-extractor" category="web" />
    </>
  );
}
