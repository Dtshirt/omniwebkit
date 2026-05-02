import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free HTML Minifier & Beautifier Online — Compress and Format HTML Instantly',
  description:
    'Free online HTML minifier and beautifier. Compress HTML to reduce file size and improve page speed. Minifies inline CSS and JavaScript. Beautify minified HTML with 2-space, 4-space, or tab indentation. No upload required.',
  keywords: [
    'HTML minifier online free',
    'minify HTML code online',
    'HTML compressor tool',
    'HTML beautifier online',
    'compress HTML reduce file size',
    'minify inline CSS and JS',
    'HTML formatter free',
    'HTML whitespace remover',
    'HTML comment remover online',
    'page speed HTML optimization tool',
  ],
  openGraph: {
    title: 'Free HTML Minifier & Beautifier — Compress and Format HTML Online',
    description:
      'Minify HTML to reduce file size and improve page speed. Remove comments, collapse whitespace, minify inline CSS and JS. Beautify minified HTML with indent control. Free, browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/html-minifier',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'HTML Minifier & Beautifier — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free HTML Minifier & Beautifier Online',
    description: 'Compress HTML to reduce file size. Minify inline CSS and JS. Beautify minified HTML. Free, no upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/html-minifier',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'HTML Minifier & Beautifier',
  description:
    'Free browser-based HTML minifier and beautifier. Minification options: remove HTML comments, collapse whitespace (including whitespace between tags), remove empty lines, minify inline CSS within <style> tags (removes CSS comments, collapses whitespace, semicolons), minify inline JS within <script> tags (removes JS comments, collapses whitespace), remove safe attribute quotes. Beautifier mode: re-indents HTML with 2-space, 4-space, or tab indentation; handles void elements correctly. Features: file upload with drag-and-drop, character count display, file size savings bar and percentage, copy output, download as .html file, load sample HTML. No file upload to server.',
  url: 'https://omniwebkit.com/tools/html-minifier',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Remove HTML comments',
    'Collapse whitespace between and within tags',
    'Remove empty lines',
    'Minify inline CSS within <style> tags',
    'Minify inline JavaScript within <script> tags',
    'Remove safe attribute quotes (HTML5)',
    'Beautify / re-indent minified HTML',
    'Indent style: 2 spaces, 4 spaces, or tabs',
    'File upload and drag-and-drop',
    'Character count and savings percentage display',
    'Savings progress bar',
    'Copy output to clipboard',
    'Download as .html file',
    'No file upload to server — 100% browser-based',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Minify HTML Online for Free',
  description: 'Steps to compress and minify HTML using the OmniWebKit HTML Minifier.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Paste or upload your HTML', text: 'Paste your HTML code into the input area, or click Upload and select a .html file. You can also drag and drop a file onto the upload button.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose minification options', text: 'Toggle the options you want: remove comments, collapse whitespace, remove empty lines, minify CSS and JS, or remove safe quotes. All are enabled by default except Remove Quotes.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Minify HTML', text: 'Click the Minify HTML button. The minified output appears in the output panel along with the original size, output size, and savings percentage.' },
    { '@type': 'HowToStep', position: 4, name: 'Copy or download the result', text: 'Click Copy to copy the minified HTML to your clipboard, or Download to save it as a .min.html file.' },
    { '@type': 'HowToStep', position: 5, name: 'Use Beautify mode to reverse minification', text: 'Switch to Beautify mode to re-indent and format minified HTML for readability. Choose your preferred indentation style (2 spaces, 4 spaces, or tabs).' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Does HTML minification change how the page looks?', acceptedAnswer: { '@type': 'Answer', text: 'No. Minification removes characters the browser ignores — whitespace between tags, comments, and extra spaces. The page renders identically.' } },
    { '@type': 'Question', name: 'Is my HTML code sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All processing runs entirely in your browser. Your HTML never leaves your device.' } },
    { '@type': 'Question', name: 'Should I minify HTML if my server uses Gzip?', acceptedAnswer: { '@type': 'Answer', text: 'Both techniques help. Gzip compresses the file at transfer time. Minification reduces the original file size. When combined they produce smaller files than either technique alone.' } },
    { '@type': 'Question', name: 'What does the Beautify mode do?', acceptedAnswer: { '@type': 'Answer', text: 'Beautify mode re-indents and formats a minified or poorly-formatted HTML document with proper nesting structure, making it human-readable again.' } },
    { '@type': 'Question', name: 'Does inline JS minification handle modern JavaScript?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The tool removes JS comments and collapses whitespace, which works correctly with all JS syntax. It does not rename variables or optimise the AST like Terser, but it is safe and compatible with ES6+ syntax.' } },
    { '@type': 'Question', name: 'What is the Remove Safe Quotes option?', acceptedAnswer: { '@type': 'Answer', text: 'HTML5 allows omitting quotes from attribute values that contain only letters, numbers, hyphens, and underscores. This option applies that optimisation. Disable it for XHTML-valid markup.' } },
    { '@type': 'Question', name: 'Can the tool handle large HTML files?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The tool handles files up to the size your browser can hold in memory. For large production files (multiple megabytes), a build-tool integration is more appropriate.' } },
    { '@type': 'Question', name: 'What happens to <pre> whitespace when minifying?', acceptedAnswer: { '@type': 'Answer', text: 'The Collapse Whitespace option applies globally and does not specifically protect <pre> blocks. If your HTML has <pre> elements with meaningful whitespace, disable the Collapse Whitespace option to preserve it.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'HTML Minifier & Beautifier', item: 'https://omniwebkit.com/tools/html-minifier' },
  ],
};

export default function HTMLMinifierLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="html-minifier" category="web" />
    </>
  );
}
