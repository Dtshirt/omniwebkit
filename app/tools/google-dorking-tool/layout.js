import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Google Dorking Tool — Free Advanced Search Operator Generator',
  description:
    'Build precise Google dork queries instantly. 40+ templates for SEO, security, and developer research. Generate site:, inurl:, ext:, and intitle: operators without memorizing syntax. Free, no login.',
  keywords: [
    'google dorking tool',
    'google dork generator',
    'advanced google search operators',
    'google hacking tool',
    'google dork query builder',
    'inurl intitle site search operators',
    'osint search tool',
    'google search operator generator free',
    'find exposed files google',
    'seo google dork finder',
    'security dork generator',
    'google advanced search query tool',
  ],
  openGraph: {
    title: 'Google Dorking Tool — Free Advanced Search Operator Generator',
    description:
      'Build precise Google dork queries instantly. 40+ templates for SEO, security, and developer research. Generate site:, inurl:, ext:, and intitle: operators without memorizing syntax. Free, no login.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/google-dorking-tool',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Google Dorking Tool — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google Dorking Tool — Build Advanced Search Queries Instantly',
    description: '40+ pre-built dork templates for SEO, security, developer, WordPress, cloud, and social research. Multi-engine support: Google, Bing, GitHub, Shodan. Free, no upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/google-dorking-tool',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Google Dorking Tool — Advanced Search Operator Generator',
  description:
    'Free browser-based Google dork query generator with 40+ pre-built search operator templates across SEO, Developer, Security, WordPress, Cloud, and Social categories. Supports Google, Bing, GitHub code search, and Shodan. Features real-time syntax highlighting with color-coded operators, values, strings, and exclusions. Includes a Visual Custom Builder for combining operators without knowing syntax. Advanced filter panel for exact match, keyword exclusion, and file type filtering. Favorites system stored in browser localStorage. Smart input sanitization strips https://, www., and trailing slashes automatically. No data transmitted to any server.',
  url: 'https://omniwebkit.com/tools/google-dorking-tool',
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'SecurityApplication',
  operatingSystem: 'Any (Browser-based)',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Lazydesigners', url: 'https://github.com/Dtshirt/omniwebkit' },
  author: { '@type': 'Organization', name: 'Lazydesigners', url: 'https://github.com/Dtshirt/omniwebkit' },
  featureList: [
    '40+ pre-built Google dork templates across 6 categories',
    'Categories: SEO, Developer, Security, WordPress, Cloud, Social',
    'Real-time syntax highlighting (operators, values, strings, exclusions)',
    'Smart input sanitization — strips https://, www., trailing slashes',
    'Advanced filter panel: exact match, keyword exclusion, file type filter',
    'Visual Custom Builder for combining operators without syntax knowledge',
    'Multi-engine support: Google, Bing, GitHub code search, Shodan',
    'Favorites system stored in browser localStorage',
    'Copy to clipboard in one click',
    'No data transmitted to any server — 100% browser-based',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Google Dorking Tool to Build Search Operator Queries',
  description: 'Steps to generate precise Google dork queries using the OmniWebKit Google Dorking Tool.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter your target', text: 'Type a domain (e.g. example.com) or keyword in the target input field. The tool automatically strips https://, www., and trailing slashes so your queries are always correctly formatted.' },
    { '@type': 'HowToStep', position: 2, name: 'Pick a category', text: 'Select from SEO, Developer, Security, WordPress, Cloud, or Social. Each category has 5 to 12 pre-built dork templates covering the most useful operator combinations for that discipline.' },
    { '@type': 'HowToStep', position: 3, name: 'Select a dork template', text: 'Click any card in the template grid. The output preview updates instantly with your target filled in. Syntax is color-coded — operators in blue, values in green, quoted strings in yellow, exclusions in red.' },
    { '@type': 'HowToStep', position: 4, name: 'Apply advanced filters if needed', text: 'Open the Advanced Filter Options panel to add exact match quotes around your target, exclude a specific keyword, or filter results by file type (PDF, SQL, ENV, LOG, PHP).' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or execute the query', text: 'Click Copy to grab the query string, or select a search engine (Google, Bing, GitHub, Shodan) and click Open to run the dork directly in a new tab.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Google Dorking legal?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Using Google search operators is entirely legal — they are a built-in feature of the Google search engine. What is illegal is using data found via dorking (such as exposed credentials) to access systems without authorization. Always use this tool for authorized OSINT, SEO research, and bug bounty work only.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool send my queries or domain to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All query generation runs entirely in your browser. No domain, keyword, or generated dork is transmitted to any server. When you click Open in Google, the query goes directly from your browser to Google — the same as typing it manually.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can Google block me for using dork queries?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'If you run many complex queries in quick succession, Google may serve a CAPTCHA to verify you are human. This is a Google-side rate limit. Pace your searches if you are doing bulk research and avoid using automated scrapers without proxy rotation.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I prevent my own website from being dorked?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Disable directory listing in your web server configuration (Apache or Nginx). Use a properly configured robots.txt to block crawling of sensitive directories. Never store passwords, API keys, database dumps, or .env files in a publicly accessible web server directory.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do Google dork operators work on Bing or GitHub?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Basic operators like site:, exact match quotes, and filetype: work across most major search engines. GitHub code search supports its own operator syntax. Shodan supports hardware-focused queries. This tool lets you switch engines from a dropdown and execute the query directly.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the Custom Builder in this Google Dorking Tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Custom Builder lets you combine search operators visually using a block-based interface. Pick an operator (site:, inurl:, intitle:, intext:, ext:, -, OR) from a dropdown, type a value, and add as many blocks as you need. The tool assembles the final dork query automatically.',
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
    { '@type': 'ListItem', position: 3, name: 'Google Dorking Tool', item: 'https://omniwebkit.com/tools/google-dorking-tool' },
  ],
};

export default function GoogleDorkingToolLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="google-dorking-tool" category="web" />
    </>
  );
}
