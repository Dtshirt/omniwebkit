import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'JSON Formatter & Validator Online Free — Beautify JSON Code',
  description:
    'Format, validate & beautify JSON code online. Minify JSON for production or prettify for readability. Free JSON formatter with syntax highlighting & error detection.',
  keywords: [
    'JSON formatter online free',
    'JSON validator online free',
    'beautify JSON online',
    'JSON beautifier online',
    'minify JSON online free',
    'format JSON online',
    'JSON pretty print online',
    'validate JSON online free',
    'JSON linter online',
    'JSON syntax highlighter online',
  ],
  openGraph: {
    title: 'Free JSON Formatter & Validator — Beautify, Minify, Validate Online',
    description:
      'Format, validate, and minify JSON online with syntax highlighting. Sort keys alphabetically, strip comments, download the result. Free, no server upload.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/json-formatter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JSON Formatter & Validator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free JSON Formatter & Validator — Beautify, Minify, Validate Online',
    description: 'Beautify, validate, and minify JSON with syntax highlighting. Sort keys, strip comments, download. Free, browser-based.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/json-formatter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON Formatter & Validator',
  description:
    'Free browser-based JSON formatter, validator, and minifier. Features: real-time JSON validation with inline Valid/Invalid badge; syntax highlighting (keys=blue, strings=green, numbers=amber, booleans=violet, null=red); format/beautify with configurable indentation (1–8 spaces); minify to single-line compact JSON; sort all object keys alphabetically (recursive); strip JavaScript-style comments (//, /* */); Structure Stats panel showing count of object keys, arrays, strings, numbers, booleans, and null values; copy output to clipboard; download as .json file. No server upload — all browser-based JavaScript processing.',
  url: 'https://omniwebkit.com/tools/json-formatter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Real-time JSON validation with Valid/Invalid badge as you type',
    'Syntax highlighting: keys (blue), strings (green), numbers (amber), booleans (violet), null (red)',
    'Format/beautify with configurable indentation (1–8 spaces)',
    'Minify JSON to compact single-line format',
    'Sort all object keys alphabetically (recursive)',
    'Strip JavaScript-style // and /* */ comments (JSONC/JSON5 support)',
    'Structure Stats: object keys, arrays, strings, numbers, booleans, null values',
    'Copy formatted output to clipboard',
    'Download output as .json file',
    'No server upload — all browser-based processing',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Format and Validate JSON Online',
  description: 'Steps to format, validate, and minify JSON using the OmniWebKit JSON Formatter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Paste your JSON', text: 'Paste raw, minified, or unformatted JSON into the Input JSON text area. A Valid or Invalid badge appears instantly as you type.' },
    { '@type': 'HowToStep', position: 2, name: 'Configure settings', text: 'Set the indentation level (1–8 spaces), enable Sort Keys to sort keys alphabetically, or enable Strip Comments for JSONC files with JavaScript-style comments.' },
    { '@type': 'HowToStep', position: 3, name: 'Format or Minify', text: 'Click "Format / Beautify" to produce indented, human-readable JSON. Click "Minify" to produce a single-line minimal JSON string.' },
    { '@type': 'HowToStep', position: 4, name: 'Review the result', text: 'The formatted output appears with optional syntax highlighting. The Structure Stats panel shows the count of object keys, arrays, strings, numbers, booleans, and null values.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or download', text: 'Click "Copy" to copy the output to the clipboard, or "Save .json" to download the result as a file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this JSON formatter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account required, no usage limits, no data sent to any server.' } },
    { '@type': 'Question', name: 'Is my JSON data private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All processing runs in your browser. Nothing you paste is uploaded, stored, or transmitted anywhere.' } },
    { '@type': 'Question', name: 'Can I format JSONC files with comments?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enable "Strip Comments" to remove JavaScript-style // and /* */ comments before formatting. JSONC and JSON5 files often have these comments.' } },
    { '@type': 'Question', name: 'What does Sort Keys do?', acceptedAnswer: { '@type': 'Answer', text: 'It recursively sorts all object keys alphabetically at every nesting level, making JSON objects deterministic and easier to compare or diff.' } },
    { '@type': 'Question', name: 'What is the difference between Format and Minify?', acceptedAnswer: { '@type': 'Answer', text: 'Format adds indentation and newlines for human readability. Minify removes all whitespace and newlines for the smallest possible valid JSON string.' } },
    { '@type': 'Question', name: 'Can I download the formatted JSON?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click "Save .json" to download the formatted or minified output as a file named "formatted.json".' } },
    { '@type': 'Question', name: 'What do the Structure Stats show?', acceptedAnswer: { '@type': 'Answer', text: 'Structure Stats count the total number of object keys, arrays, strings, numbers, booleans, and null values across the entire parsed JSON structure.' } },
    { '@type': 'Question', name: 'Why does my JSON show "Unexpected token"?', acceptedAnswer: { '@type': 'Answer', text: 'Usually caused by a trailing comma after the last item in an object or array, or by single quotes instead of double quotes. JSON requires double quotes for all strings and keys.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'JSON Formatter', item: 'https://omniwebkit.com/tools/json-formatter' },
  ],
};

export default function JSONFormatterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="json-formatter" category="web" />
    </>
  );
}
