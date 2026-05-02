import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free JSON to CSV Converter Online — Convert CSV to JSON & JSON to CSV Instantly',
  description:
    'Free online JSON to CSV converter and CSV to JSON converter. Paste or upload JSON arrays to get CSV, or paste CSV to get structured JSON. Custom delimiters, header options, smart type detection. Browser-based, no server upload.',
  keywords: [
    'JSON to CSV converter online free',
    'CSV to JSON converter online free',
    'convert JSON to CSV online',
    'convert CSV to JSON online',
    'JSON CSV converter free',
    'JSON array to CSV free online',
    'CSV to JSON array converter',
    'online JSON to CSV download free',
    'JSON to spreadsheet converter online',
    'CSV to JSON with type coercion online',
  ],
  openGraph: {
    title: 'Free JSON to CSV Converter — Convert Between JSON & CSV Online',
    description:
      'Convert JSON arrays to CSV and CSV back to JSON instantly. Custom delimiters, headers, smart type detection. Free, browser-based, no upload needed.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/json-to-csv-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JSON to CSV Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free JSON to CSV Converter — Convert Between JSON & CSV Online',
    description: 'Convert JSON arrays to CSV or CSV to JSON. Custom delimiters, headers, type detection. Free, browser-based.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/json-to-csv-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JSON to CSV Converter',
  description:
    'Free browser-based JSON to CSV and CSV to JSON converter. JSON→CSV features: accepts JSON array of objects; collects all unique keys as CSV columns; handles missing keys (empty cells); serialises nested objects/arrays to JSON strings in cells; RFC 4180 CSV escaping (delimiter, quotes, newlines). CSV→JSON features: smart type coercion (numbers, booleans, null, nested JSON); configurable header detection; custom column names when no header row. Common settings: 4 delimiter options (comma, semicolon, tab, pipe); include/exclude header row toggle; swap direction button; upload .json/.csv/.txt files; copy output to clipboard; download as .csv or .json file; conversion stats (input/output lines and characters). All processing browser-based — no data uploaded.',
  url: 'https://omniwebkit.com/tools/json-to-csv-converter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert JSON array of objects to CSV with configurable delimiter and headers',
    'Convert CSV to JSON array with smart type coercion (numbers, booleans, null, nested JSON)',
    'Four delimiter options: comma, semicolon, tab (TSV), pipe',
    'Include/exclude header row toggle for both directions',
    'Swap direction button — move output to input instantly',
    'Upload .json, .csv, or .txt files instead of pasting',
    'Copy output to clipboard with one click',
    'Download converted output as .csv or .json file',
    'Conversion stats: input/output line count and character count',
    'All processing browser-based — no data uploaded to any server',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert JSON to CSV Online',
  description: 'Steps to convert a JSON array to CSV using the OmniWebKit JSON to CSV Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Paste or upload your JSON', text: 'Paste your JSON array of objects into the Input area, click "Upload" to load a file, or click "Sample JSON" to load example data.' },
    { '@type': 'HowToStep', position: 2, name: 'Configure options', text: 'Select your desired delimiter (comma, semicolon, tab, or pipe) and choose whether to include a header row.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Convert', text: 'Click "Convert to CSV". The converted CSV appears in the Output panel. Conversion stats are shown below the output.' },
    { '@type': 'HowToStep', position: 4, name: 'Copy or download', text: 'Click "Copy" to copy the CSV to your clipboard, or "Save .csv" to download the file.' },
    { '@type': 'HowToStep', position: 5, name: 'Convert back if needed', text: 'Click the Swap button to reverse direction and convert the CSV output back to JSON.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this JSON to CSV converter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account required, no usage limits, and no data uploaded to any server.' } },
    { '@type': 'Question', name: 'What JSON format does the converter accept?', acceptedAnswer: { '@type': 'Answer', text: 'The input must be a JSON array of objects (rows). Example: [{"name":"Alice","age":30},{"name":"Bob","age":25}]. Each object becomes a row and the keys become column headers.' } },
    { '@type': 'Question', name: 'Can I convert CSV with semicolons?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Select "Semicolon (;)" as the delimiter in the options bar before converting. This is common for European locale CSV files.' } },
    { '@type': 'Question', name: 'What happens to nested objects in JSON to CSV?', acceptedAnswer: { '@type': 'Answer', text: 'Nested objects and arrays are serialised to a JSON string and placed in a single CSV cell, wrapped in double quotes.' } },
    { '@type': 'Question', name: 'Does CSV to JSON auto-detect types?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Numeric strings become numbers, "true"/"false" become booleans, "null" becomes null, and strings that look like JSON are parsed into nested structures.' } },
    { '@type': 'Question', name: 'Can I upload a file?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the "Upload" button to select a .json, .csv, or .txt file. The file contents are loaded into the input area.' } },
    { '@type': 'Question', name: 'What is a TSV file?', acceptedAnswer: { '@type': 'Answer', text: 'TSV (Tab-Separated Values) uses tabs instead of commas. Select "Tab" in the delimiter options to work with TSV files.' } },
    { '@type': 'Question', name: 'Is my data private?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All conversion runs in your browser. Nothing is uploaded, stored, or transmitted anywhere.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'JSON to CSV Converter', item: 'https://omniwebkit.com/tools/json-to-csv-converter' },
  ],
};

export default function JsonCsvConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="json-to-csv-converter" category="file" />
    </>
  );
}
