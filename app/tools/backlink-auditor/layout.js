import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free SEO Backlink Auditor — Verify Backlinks & Check Link Status Online',
  description:
    'Audit your backlink profile for free. Paste referring page URLs, verify your target link is live on each page, detect duplicates, filter results, and export a full CSV report. No login needed.',
  keywords: [
    'backlink auditor free online',
    'SEO backlink checker tool',
    'verify backlink is live',
    'backlink profile analysis',
    'check if backlink exists',
    'backlink audit tool',
    'link building checker',
    'SEO link verification tool',
    'duplicate backlink detector',
    'CSV backlink report generator',
  ],
  openGraph: {
    title: 'Free SEO Backlink Auditor — Verify Backlinks Online',
    description:
      'Check which backlinks are live on referring pages. Detect duplicates, export CSV reports, and track your link-building success. Free and instant.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/backlink-auditor',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'SEO Backlink Auditor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free SEO Backlink Auditor — Check Live Backlinks & Export CSV',
    description: 'Verify your backlinks are live on referring pages. Detect duplicates and export a full CSV audit report. Free, no login.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/backlink-auditor',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SEO Backlink Auditor',
  description:
    'Free browser-based SEO backlink audit tool. Enter a target URL and a list of referring page URLs (or upload .txt/.csv). The tool verifies whether your target link is present on each referring page, identifies duplicates (full URL or root domain scope), filters invalid URLs, and generates a Link Health Score. Results can be filtered by status (Found, Not Found, Error, Duplicate) and exported as a CSV file.',
  url: 'https://omniwebkit.com/tools/backlink-auditor',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Verify target URL presence on each backlink page',
    'Paste backlink URLs or upload .txt / .csv file',
    'URL Normalization (strips UTM and tracking parameters)',
    'Validation Filter (removes non-HTTP/HTTPS URLs)',
    'Full URL or Root Domain duplicate detection',
    'Link Health Score percentage indicator',
    'Results filter tabs: All, Found, Missing, Error, Duplicates',
    'One-click CSV export of full audit report',
    'Summary stats: Total, Unique, Duplicates, Found, Missing, Errors',
    'Progress bar for real-time audit tracking',
    'No account or login required',
    '100% free with no usage limits',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Audit Your SEO Backlinks Online for Free',
  description: 'Step-by-step guide to verifying backlinks using the OmniWebKit Backlink Auditor.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter your target URL', text: 'Type or paste the URL of the page you want verified as a backlink destination — for example, your homepage or a money page.' },
    { '@type': 'HowToStep', position: 2, name: 'Add your backlink list', text: 'Paste referring page URLs one per line in the textarea, or upload a .txt or .csv file containing the URLs.' },
    { '@type': 'HowToStep', position: 3, name: 'Configure the options', text: 'Enable URL Normalization to strip tracking parameters, enable Validation Filter to skip invalid URLs, and choose Full URL or Domain scope for duplicate detection.' },
    { '@type': 'HowToStep', position: 4, name: 'Start the audit', text: 'Click Start Audit. A progress bar tracks completion as each URL is checked. The tool processes all backlinks and displays a Link Health Score and full results table.' },
    { '@type': 'HowToStep', position: 5, name: 'Review and export', text: 'Use the filter tabs to view Found, Missing, Error, or Duplicate links. Click Download CSV to export the complete audit report for your records or a client report.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this backlink auditor free to use?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account required. The audit runs entirely in your browser with no server processing and no usage limits.' },
    },
    {
      '@type': 'Question',
      name: 'What does the Link Health Score mean?',
      acceptedAnswer: { '@type': 'Answer', text: 'The Link Health Score is the percentage of unique backlink pages on which your target URL was found. A score above 70% is generally good. A lower score indicates that many supposed backlinks are missing, broken, or need follow-up.' },
    },
    {
      '@type': 'Question',
      name: 'What does "Not Found" mean in backlink audit results?',
      acceptedAnswer: { '@type': 'Answer', text: 'Not Found means your target URL was not detected on the referring page. The link may have been removed, changed to a different URL, or the page content may have been updated. These entries need follow-up — contact the website owner to restore the link.' },
    },
    {
      '@type': 'Question',
      name: 'Can I upload a CSV file of backlink URLs?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Upload .txt or .csv and select your file. The tool reads the file and extracts one URL per line or one URL per comma-separated value. This is compatible with exports from Ahrefs, SEMrush, Moz, and Google Search Console.' },
    },
    {
      '@type': 'Question',
      name: 'What is URL Normalization in the backlink auditor?',
      acceptedAnswer: { '@type': 'Answer', text: 'URL Normalization strips tracking parameters (utm_source, fbclid, gclid, etc.) and converts URLs to lowercase before deduplication. This prevents the same underlying page from being counted as two separate unique URLs just because one has a tracking code attached.' },
    },
    {
      '@type': 'Question',
      name: 'Can I export the backlink audit as a CSV?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Download CSV Report in the summary panel or the Export CSV button in the results header. The file includes all backlink URLs, their root domains, target link status (Found/Not Found/Error/Skipped), and duplicate status. You can open it in Excel or Google Sheets.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Full URL and Domain scope for duplicate detection?',
      acceptedAnswer: { '@type': 'Answer', text: 'Full URL scope treats each unique URL as separate — two pages on the same domain are both counted. Domain scope flags any second URL from the same root domain as a duplicate, useful for tracking link diversity in your backlink profile (since multiple links from one domain have diminishing SEO value).' },
    },
    {
      '@type': 'Question',
      name: 'Can I use this tool to verify client backlinks?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter the client\'s target page URL and paste in their referring page list from any SEO tool export. Run the audit and download the CSV report to share directly with the client as a professional backlink verification report.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'SEO Backlink Auditor', item: 'https://omniwebkit.com/tools/backlink-auditor' },
  ],
};

export default function BacklinkAuditorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="backlink-auditor" category="web" />
    </>
  );
}
