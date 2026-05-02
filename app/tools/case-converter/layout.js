import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Case Converter — Convert Text Online to Any Case Format',
  description:
    'Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case, PascalCase, and 5 more formats — free, instant, live results as you type. No login required.',
  keywords: [
    'case converter online free',
    'text case converter tool',
    'camelCase converter',
    'snake_case converter',
    'kebab-case converter',
    'title case converter',
    'uppercase lowercase converter',
    'PascalCase converter',
    'CONSTANT_CASE converter',
    'convert text case online',
  ],
  openGraph: {
    title: 'Free Case Converter — Convert Text to Any Case Format Online',
    description:
      'Convert text to 12 case formats simultaneously — UPPERCASE, camelCase, snake_case, kebab-case, PascalCase, and more. Live results, one-click copy, free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/case-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Case Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Case Converter — 12 Text Case Formats Online',
    description: 'Type text once, get 12 case formats instantly: UPPERCASE, camelCase, snake_case, kebab-case, PascalCase, and more. Free, live results.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/case-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Case Converter',
  description:
    'Free online text case converter. Converts any text to 12 case formats simultaneously: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, dot.case, aLtErNaTiNg, and iNVERSE. Results update live as you type. Includes word count, character count, one-click copy per format, Copy All, and Download as text file. All processing is done in the browser — no data is sent to any server.',
  url: 'https://omniwebkit.com/tools/case-converter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Converts text to 12 case formats simultaneously',
    'UPPERCASE conversion',
    'lowercase conversion',
    'Title Case conversion',
    'Sentence case conversion',
    'camelCase conversion',
    'PascalCase conversion',
    'snake_case conversion',
    'kebab-case conversion',
    'CONSTANT_CASE conversion',
    'dot.case conversion',
    'aLtErNaTiNg case conversion',
    'iNVERSE case conversion',
    'Live results — updates as you type',
    'Character, word, and line count stats',
    'One-click copy per format',
    'Copy All results at once',
    'Download all results as text file',
    '100% browser-based — no data uploads',
    'No account or login required',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Text Case Online',
  description: 'Steps to convert text to any case format using the OmniWebKit Case Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter your text', text: 'Type or paste your text into the input area. The tool supports words, sentences, paragraphs, and code identifiers.' },
    { '@type': 'HowToStep', position: 2, name: 'View instant results', text: 'All 12 case formats appear instantly in the results grid below — no button to press.' },
    { '@type': 'HowToStep', position: 3, name: 'Copy the format you need', text: 'Click the copy icon on any result card to copy that specific format to your clipboard, or click Copy All to copy all 12 results at once.' },
    { '@type': 'HowToStep', position: 4, name: 'Download if needed', text: 'Click Download to save all 12 conversion results as a plain text file for your records.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this case converter free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% free with no usage limits. No account required. All conversions happen in your browser — no data is sent to any server.' },
    },
    {
      '@type': 'Question',
      name: 'Does the case converter update live?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Results update instantly as you type — no Convert button to press. All 12 case formats are recalculated and displayed in real time using JavaScript useMemo.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between camelCase and PascalCase?',
      acceptedAnswer: { '@type': 'Answer', text: 'In camelCase, the first word starts lowercase (e.g., helloWorld). In PascalCase, every word including the first starts uppercase (e.g., HelloWorld). camelCase is used for variables and functions; PascalCase is used for class and component names.' },
    },
    {
      '@type': 'Question',
      name: 'What is snake_case used for?',
      acceptedAnswer: { '@type': 'Answer', text: 'snake_case uses lowercase letters separated by underscores. It is the standard naming convention in Python, Ruby, SQL, database column names, configuration files, and environment variable names.' },
    },
    {
      '@type': 'Question',
      name: 'What is kebab-case?',
      acceptedAnswer: { '@type': 'Answer', text: 'kebab-case uses lowercase letters separated by hyphens. It is standard for CSS class names, HTML attributes, URL slugs, and file names in web projects. Hyphens are safe in all URL contexts.' },
    },
    {
      '@type': 'Question',
      name: 'Can I convert multiple paragraphs at once?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The tool handles any amount of text — a single word, a sentence, or multiple paragraphs. All 12 case conversions work on the full text you enter.' },
    },
    {
      '@type': 'Question',
      name: 'Can I download all the conversion results?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the Download button to save all 12 case format results as a plain text file (case_conversions.txt). You can also click Copy All to copy all results to your clipboard at once.' },
    },
    {
      '@type': 'Question',
      name: 'Is my text private when using this tool?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. All conversions happen entirely in your browser using JavaScript. Your text is never sent to any server and stays completely private on your own device.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Case Converter', item: 'https://omniwebkit.com/tools/case-converter' },
  ],
};

export default function CaseConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="case-converter" category="text" />
    </>
  );
}
