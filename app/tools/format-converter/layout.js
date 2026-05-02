import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Data Format Converter — CSV, JSON, Markdown, HTML, SQL & TSV',
  description:
    'Free online data format converter. Convert between CSV, TSV, JSON, Markdown tables, HTML tables, and SQL INSERT statements instantly. Real-time output, file upload, copy and download. No signup required.',
  keywords: [
    'data format converter online free',
    'CSV to JSON converter online',
    'JSON to CSV converter',
    'CSV to SQL converter',
    'CSV to Markdown table',
    'JSON to Markdown table converter',
    'HTML table to CSV converter',
    'Markdown table to JSON',
    'TSV to JSON converter',
    'online tabular data converter',
  ],
  openGraph: {
    title: 'Free Data Format Converter — CSV, TSV, JSON, Markdown, HTML, SQL Online',
    description:
      'Convert between CSV, TSV, JSON, Markdown, HTML tables, and SQL INSERT statements. Real-time output, file upload, format swap, row/column stats, copy and download. Free, browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/format-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Data Format Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Data Format Converter — CSV, TSV, JSON, Markdown, HTML, SQL',
    description: 'Convert between CSV, TSV, JSON, Markdown, HTML, and SQL table formats instantly. Free, no upload to server.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/format-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Data Format Converter',
  description:
    'Free browser-based data format converter supporting 30 bidirectional conversion pairs across six tabular data formats: CSV (with auto-detect or manual delimiter: comma, semicolon, tab, pipe), TSV, JSON (array of objects), Markdown tables, HTML tables, and SQL INSERT statements. Features: real-time output, file upload with format auto-detection by extension, format swap button, row and column count display, CSV delimiter options, SQL table name input, copy to clipboard, download converted file. No data sent to server.',
  url: 'https://omniwebkit.com/tools/format-converter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Converts between CSV, TSV, JSON, Markdown, HTML, and SQL (30 format pairs)',
    'Real-time conversion output — no Convert button needed',
    'CSV delimiter auto-detection (comma, semicolon, tab, pipe)',
    'RFC 4180-compliant CSV parser (quoted fields, embedded commas)',
    'File upload with extension-based format detection',
    'File drag-and-drop support',
    'Format swap button (flip input/output and use output as new input)',
    'Row and column count stats displayed per conversion',
    'SQL table name input for generated INSERT statements',
    'Copy output to clipboard',
    'Download output with correct file extension',
    'Conversion matrix showing all 30 supported pairs',
    'Fully browser-based — no server upload',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Data Formats Online for Free',
  description: 'Steps to convert CSV, JSON, Markdown, HTML, or SQL data using the OmniWebKit Data Format Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose your input format', text: 'Click the input format button matching your source data: CSV, TSV, JSON, Markdown, HTML, or SQL.' },
    { '@type': 'HowToStep', position: 2, name: 'Paste your data or upload a file', text: 'Paste data into the input area, or click Upload and select a file. The tool detects the format from the file extension.' },
    { '@type': 'HowToStep', position: 3, name: 'Select the output format', text: 'Click the output format button for the format you want. The output updates automatically in real time.' },
    { '@type': 'HowToStep', position: 4, name: 'Configure options if needed', text: 'For CSV: set the delimiter. For SQL output: enter your table name.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or download', text: 'Click Copy to copy the output, or Download to save the file with the correct extension.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is my data uploaded to any server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All parsing and conversion runs entirely in your browser. Your data never leaves your device.' } },
    { '@type': 'Question', name: 'What JSON format does the tool expect?', acceptedAnswer: { '@type': 'Answer', text: 'The input JSON must be an array of objects, where each object represents one row and the keys become column headers. Example: [{"name":"Alice","age":"30"}].' } },
    { '@type': 'Question', name: 'Can I convert HTML tables to CSV?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste HTML containing a <table> element, set input to HTML and output to CSV. The tool extracts headers and rows automatically.' } },
    { '@type': 'Question', name: 'How does CSV delimiter auto-detection work?', acceptedAnswer: { '@type': 'Answer', text: 'The tool scans the first line and counts comma, semicolon, and tab characters. The most frequent character becomes the detected delimiter. You can override it manually.' } },
    { '@type': 'Question', name: 'What does the swap button do?', acceptedAnswer: { '@type': 'Answer', text: 'The ⇆ swap button flips the input and output format selections and loads the current output as the new input, enabling multi-step conversion workflows.' } },
    { '@type': 'Question', name: 'Can I convert Markdown tables back to CSV?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste a Markdown table (with header row and separator row), set input format to Markdown, and select CSV as the output. The tool parses the pipe-delimited table structure correctly.' } },
    { '@type': 'Question', name: 'Is the SQL output safe from injection?', acceptedAnswer: { '@type': 'Answer', text: 'The generated SQL escapes single quotes using the SQL standard double-single-quote method. This is safe for scripts run by a trusted user, but never dynamically construct SQL from user input in production without parameterised queries.' } },
    { '@type': 'Question', name: 'Can I paste copied Excel cells?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Excel copies cells with tab-delimited values. Set input format to TSV, paste the copied cells, and the tool will parse the columns correctly.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Data Format Converter', item: 'https://omniwebkit.com/tools/format-converter' },
  ],
};

export default function FormatConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="format-converter" category="file" />
    </>
  );
}
