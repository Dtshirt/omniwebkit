import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Sitemap Generator — Create XML & HTML Sitemaps',
  description:
    'Free online sitemap generator for XML and HTML. Add URLs manually or bulk import. Set priority, change frequency, last modified. Download or copy. No signup.',
  keywords: [
    'sitemap generator free online',
    'xml sitemap generator',
    'html sitemap generator',
    'create sitemap online free',
    'sitemap builder free',
    'xml sitemap creator',
    'sitemap generator for website',
    'bulk sitemap generator',
    'free sitemap tool online',
    'sitemap generator with priority',
  ],
  openGraph: {
    title: 'Free Sitemap Generator — XML & HTML',
    description:
      'Generate XML and HTML sitemaps. Add URLs, bulk import, set priority and frequency. Copy or download. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/sitemap-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Sitemap Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Sitemap Generator — XML & HTML',
    description: 'Create XML and HTML sitemaps for your website. Bulk import, priority, frequency. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/sitemap-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Sitemap Generator',
  description:
    'Free browser-based sitemap generator for XML and HTML. Features: add URLs manually or bulk import (paste list), set change frequency (always/hourly/daily/weekly/monthly/yearly/never), priority (0.0-1.0), last modified date, settings panel with apply-to-all, sort by URL or priority, search/filter URLs, stats bar (total/valid/invalid), XML stylesheet option, grouped HTML sitemap output, dark code preview panel, copy to clipboard, download as file. All processing browser-based. No server, no signup.',
  url: 'https://omniwebkit.com/tools/sitemap-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'XML and HTML sitemap generation',
    'Add URLs manually or bulk import',
    'Change frequency: always, hourly, daily, weekly, monthly, yearly, never',
    'Priority: 0.0 to 1.0 with labels',
    'Last modified date per URL',
    'Settings panel with apply-to-all',
    'Sort by URL or priority',
    'Search and filter URLs',
    'Stats bar: total, valid, invalid counts',
    'Copy to clipboard or download as file',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Sitemap Online for Free',
  description: 'Steps to generate an XML or HTML sitemap using the OmniWebKit Sitemap Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Add URLs', text: 'Enter URLs one by one or use Bulk Import to paste a list.' },
    { '@type': 'HowToStep', position: 2, name: 'Set properties', text: 'Choose change frequency, priority, and last modified date for each URL.' },
    { '@type': 'HowToStep', position: 3, name: 'Choose format', text: 'Select XML for search engines or HTML for a user-readable page.' },
    { '@type': 'HowToStep', position: 4, name: 'Generate', text: 'Click Generate Sitemap. The output appears in a preview panel.' },
    { '@type': 'HowToStep', position: 5, name: 'Download or copy', text: 'Copy the sitemap or download it. Upload to your website root directory.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this sitemap generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
    { '@type': 'Question', name: 'Where do I put the sitemap?', acceptedAnswer: { '@type': 'Answer', text: 'Upload sitemap.xml to your website root. Submit in Google Search Console.' } },
    { '@type': 'Question', name: 'How many URLs can I add?', acceptedAnswer: { '@type': 'Answer', text: 'No limit in this tool. XML sitemaps have a standard limit of 50,000 URLs per file.' } },
    { '@type': 'Question', name: 'Do I need both XML and HTML sitemaps?', acceptedAnswer: { '@type': 'Answer', text: 'XML is for search engines; HTML is for users. Having both is recommended.' } },
    { '@type': 'Question', name: 'What is the priority element?', acceptedAnswer: { '@type': 'Answer', text: 'A number 0.0-1.0 for relative importance among your own pages.' } },
    { '@type': 'Question', name: 'Does changefreq control crawling?', acceptedAnswer: { '@type': 'Answer', text: 'No. It is a hint. Google ignores it and uses its own crawl patterns.' } },
    { '@type': 'Question', name: 'Can I import URLs in bulk?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Bulk Import and paste one URL per line.' } },
    { '@type': 'Question', name: 'Does this tool send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Everything runs in your browser.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Sitemap Generator', item: 'https://omniwebkit.com/tools/sitemap-generator' },
  ],
};

export default function SitemapGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="sitemap-generator" category="web" />
    </>
  );
}
