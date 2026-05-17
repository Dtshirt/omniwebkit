import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Word to PDF Converter Online Free — Convert DOCX to PDF',
  description:
    'Convert Word documents (DOC, DOCX) to PDF online free. Preserve formatting perfectly. Fast Word to PDF converter — no email needed, instant download.',
  keywords: [
    'word to pdf converter free online',
    'docx to pdf online free', 
    'convert word to pdf free',
    'free docx to pdf converter',
    'word to pdf with formatting',
    'convert doc to pdf online free',
    'rtf to pdf online free',
    'word to pdf no watermark',
    'libreoffice word to pdf',
    'word to pdf converter no signup',
  ],
  openGraph: {
    title: 'Word to PDF Converter Online Free — Convert DOCX to PDF',
    description:
      'Convert Word documents (DOC, DOCX) to PDF online free. Preserve formatting perfectly. Fast Word to PDF converter — no email needed, instant download.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/word-to-pdf',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Word to PDF Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Word to PDF Converter — LibreOffice',
    description: 'Convert Word to real vector PDF with formatting. Server-side LibreOffice. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/word-to-pdf',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Word to PDF Converter',
  description:
    'Real server-side Word to PDF converter powered by LibreOffice. Upload .docx, .doc, .rtf, .txt, or .odt and get a proper vector PDF with full formatting. Tables, images, headers, footers, fonts — all preserved. Not a browser screenshot. Files auto-deleted after download. Free, no watermark.',
  url: 'https://omniwebkit.com/tools/word-to-pdf',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: {
      '@type': 'Organization',
      name: 'Lazydesigners',
      url: 'https://github.com/Dtshirt/omniwebkit',
      sameAs: 'https://github.com/Dtshirt/omniwebkit'
  },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Real LibreOffice server-side rendering',
    'Vector PDF output (not raster/screenshot)',
    'Full formatting: tables, images, headers, footers',
    'Supports .docx, .doc, .rtf, .txt, .odt',
    'Selectable, searchable text in PDF output',
    'Files auto-deleted after download',
    'Up to 100 MB files',
    'No watermark, no signup',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Word to PDF Online',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload file', text: 'Drag and drop your .docx, .doc, .rtf, .txt, or .odt file.' },
    { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click Convert to PDF. LibreOffice processes your document on the server.' },
    { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Click Download PDF to save your properly formatted PDF file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this server-side or browser-based?', acceptedAnswer: { '@type': 'Answer', text: 'Server-side. Uses LibreOffice headless to produce a real vector PDF with full formatting. Not a browser screenshot.' } },
    { '@type': 'Question', name: 'Does it preserve formatting?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Tables, fonts, images, headers, footers, columns, and page layout are all preserved by LibreOffice.' } },
    { '@type': 'Question', name: 'Is the text selectable in the PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. LibreOffice outputs vector text, not a raster image. Text is crisp, selectable, and searchable.' } },
    { '@type': 'Question', name: 'Are files stored on the server?', acceptedAnswer: { '@type': 'Answer', text: 'Only temporarily during conversion. Files are deleted immediately after download.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Word to PDF Converter', item: 'https://omniwebkit.com/tools/word-to-pdf' },
  ],
};

export default function WordToPDFLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="word-to-pdf" category="file" />
    </>
  );
}
