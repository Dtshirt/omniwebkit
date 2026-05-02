import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Regex Tester — Test Regular Expressions with Live Highlighting',
  description:
    'Free online regex tester with instant visual feedback. Test JavaScript regular expressions with 6 flags, capture groups, find-and-replace, colour-coded matches. Browser-based, no signup.',
  keywords: [
    'regex tester online free',
    'regular expression tester',
    'regex tester with replace',
    'javascript regex tester online',
    'regex pattern tester free',
    'test regex online free',
    'regex validator online',
    'regex match highlighter',
    'regex capture groups tester',
    'free regex tool no signup',
  ],
  openGraph: {
    title: 'Free Regex Tester — Live Highlighting & Replace',
    description:
      'Test regular expressions with instant colour-coded matches. 6 flags, capture groups, find-and-replace. Free, browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/regex-tester',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Regex Tester — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Regex Tester — Live Highlighting',
    description: 'Test regex with instant visual feedback. 6 flags, replace mode, capture groups. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/regex-tester',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Regex Tester',
  description:
    'Free browser-based regex tester with live match highlighting. Supports 6 JavaScript regex flags (g, i, m, s, u, y). Features: colour-coded match highlighting (5 colours), capture group display, find-and-replace mode, 8 built-in common patterns (email, URL, phone, hex, IP, date, HTML tag, numbers), 4 sample texts, copy regex in /pattern/flags format, debounced live testing (200ms), responsive 3-column layout. All processing browser-based. No server, no signup.',
  url: 'https://omniwebkit.com/tools/regex-tester',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Live regex testing with instant match highlighting',
    '6 JavaScript regex flags: g, i, m, s, u, y',
    '5-colour match highlighting for easy distinction',
    'Capture group display for each match',
    'Find-and-replace mode with live result preview',
    '8 built-in common patterns (email, URL, phone, etc.)',
    '4 sample texts for quick testing',
    'Copy regex in /pattern/flags format',
    'Debounced live testing (200ms delay)',
    'Responsive 3-column layout',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Test a Regular Expression Online for Free',
  description: 'Steps to test a regex using the OmniWebKit Regex Tester.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter your pattern', text: 'Type your regex pattern in the pattern input field. The testing starts automatically as you type.' },
    { '@type': 'HowToStep', position: 2, name: 'Set flags', text: 'Toggle the flags you need: global, case-insensitive, multiline, dotAll, unicode, or sticky.' },
    { '@type': 'HowToStep', position: 3, name: 'Enter test text', text: 'Paste or type the text you want to test against. Or click a sample text to load it instantly.' },
    { '@type': 'HowToStep', position: 4, name: 'Review matches', text: 'Matches are highlighted with rotating colours. Match details show index positions and capture groups.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or replace', text: 'Copy the regex or toggle replace mode to test find-and-replace operations.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this regex tester free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account and no limits on usage.' } },
    { '@type': 'Question', name: 'Is my data sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All testing runs locally in your browser. Nothing is uploaded.' } },
    { '@type': 'Question', name: 'What regex engine does it use?', acceptedAnswer: { '@type': 'Answer', text: 'JavaScript\'s built-in RegExp engine, matching Node.js and browser behaviour.' } },
    { '@type': 'Question', name: 'Does it support capture groups?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Groups are shown for each match with their index numbers.' } },
    { '@type': 'Question', name: 'Can I do find and replace?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Toggle Replace mode to enter a replacement string with live results.' } },
    { '@type': 'Question', name: 'What are the highlight colours?', acceptedAnswer: { '@type': 'Answer', text: 'Five rotating colours: amber, violet, pink, teal, and blue.' } },
    { '@type': 'Question', name: 'Can I copy the regex?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Copy Regex to copy in /pattern/flags format.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive with sidebar on desktop and stacked on mobile.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Regex Tester', item: 'https://omniwebkit.com/tools/regex-tester' },
  ],
};

export default function RegexTesterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="regex-tester" category="text" />
    </>
  );
}
