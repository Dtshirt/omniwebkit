import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Website Content Extractor — Extract Text, Meta & Links from Any URL Free',
  description:
    'Extract all content from any website instantly. Get headings, paragraphs, images, links, and full meta data in a structured, downloadable format. Free, no login required.',
  keywords: [
    'website content extractor',
    'extract content from website',
    'web page content scraper',
    'extract text from URL',
    'website meta extractor',
    'scrape webpage content free',
    'html content extractor',
    'extract headings links images from website',
  ],
  openGraph: {
    title: 'Website Content Extractor — Free Online Tool',
    description:
      'Paste any URL and extract all page content — headings, paragraphs, images, links, and meta tags — in seconds. Download as TXT or JSON.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/website-content-extractor',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Website Content Extractor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Content Extractor — Extract Any Page Content Free',
    description:
      'Extract headings, paragraphs, images, links, and meta tags from any URL. Copy or download as TXT/JSON.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/website-content-extractor',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Website Content Extractor',
  description:
    'Free online tool to extract structured content from any webpage by URL. Pulls headings, paragraphs, images, links, and complete meta tag data. Export as TXT or JSON.',
  url: 'https://omniwebkit.com/tools/website-content-extractor',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Extract headings H1–H6 with hierarchy',
    'Extract paragraphs, lists, links, and images',
    'Full meta tag extraction (OG, Twitter Card, canonical)',
    'Content statistics — word count, heading count, image count',
    'Download as TXT or JSON',
    'Three view modes: Structured, Plain Text, Raw JSON',
    'No login required',
    '100% browser-based — no data stored',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Extract Content from a Website',
  description:
    'Step-by-step guide to using the free Website Content Extractor tool to pull structured content from any webpage.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Enter the website URL',
      text: 'Paste the full URL of the page you want to extract content from into the URL input field.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Choose extraction options',
      text: 'Toggle which types of content to include — headings, paragraphs, images, links, lists, and meta tags.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Click Extract Content',
      text: 'Click the Extract Content button. The tool fetches and parses the page in seconds.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Review and switch views',
      text: 'Browse the structured view, switch to plain text preview, or check the raw JSON output.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Export your data',
      text: 'Copy the report to clipboard, download as a TXT file, or download as a JSON file.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I extract content from any website?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most public websites work fine. Some block cross-origin requests even through a proxy. Websites that require login or use heavy JavaScript rendering may return limited content.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool store the content it extracts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All processing happens in your browser. We never store, log, or transmit the URLs you enter or the content that is extracted from them.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why does extraction fail on some websites?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Websites that use CORS protection, require authentication, or are JavaScript-heavy Single Page Applications (SPAs) may not work. Traditional blogs, news sites, and static HTML pages work best.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between TXT and JSON export?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'TXT gives you a readable plain-text report you can open in any editor. JSON gives you fully structured data you can parse and use in code or import into other tools.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does it extract JavaScript-rendered content?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The tool works with the static HTML returned by the server. Content that loads after page render via JavaScript will not be captured.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this website content extractor free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, 100% free. No signup, no subscription, no limits stated. Use it as many times as you need.',
      },
    },
    {
      '@type': 'Question',
      name: 'What meta tags does it extract?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'It extracts the page title, meta description, keywords, author, robots, canonical URL, Open Graph tags (og:title, og:description, og:image, og:url), and Twitter Card tags.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Website Content Extractor', item: 'https://omniwebkit.com/tools/website-content-extractor' },
  ],
};

export default function WebsiteContentExtractorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="website-content-extractor" category="web" />
    </>
  );
}
