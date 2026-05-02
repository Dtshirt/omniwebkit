import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online PDF Merger — Combine Multiple PDF Files into One',
  description:
    'Free online PDF merger. Combine multiple PDF files into a single document with real page-by-page merging. Reorder, preview, and download. Browser-based, no upload, no signup.',
  keywords: [
    'pdf merger online free',
    'combine pdf files online free',
    'merge pdf online no signup',
    'pdf combiner free no watermark',
    'merge multiple pdfs online',
    'join pdf files free online',
    'pdf merger no upload',
    'combine pdf pages online free',
    'merge pdf documents free',
    'online pdf joiner free',
  ],
  openGraph: {
    title: 'Free Online PDF Merger — Combine PDF Files into One',
    description:
      'Merge multiple PDF files into one document. Reorder files, preview before merge. Real page-by-page processing. Browser-based, no signup.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/pdf-merger',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF Merger — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online PDF Merger — Combine PDFs',
    description: 'Merge multiple PDFs into one. Reorder, preview, download. Free, no upload, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/pdf-merger',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PDF Merger',
  description:
    'Free browser-based PDF merger. Combines multiple PDF files into a single document using real page-by-page merging via pdf-lib. Features: automatic page counting per file, drag-and-drop or click-to-upload, reorder files with arrow buttons or shuffle, preview any PDF before merging, metadata controls (add/preserve metadata, optimize size), merge statistics (total files, size, pages), single-click download. All processing browser-based — no server upload. No signup, no watermarks, no limits.',
  url: 'https://omniwebkit.com/tools/pdf-merger',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Real page-by-page PDF merging via pdf-lib',
    'Automatic page counting for each uploaded file',
    'Drag-and-drop or click-to-upload file selection',
    'Reorder files with arrow buttons or shuffle',
    'Preview individual PDFs before merging',
    'Metadata controls: add/preserve metadata, optimize size',
    'Merge statistics: total files, size, and pages',
    'Single-click download of merged PDF',
    'All processing browser-based — no server upload',
    'No signup, no watermarks, no file count or size limits',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Merge PDF Files Online for Free',
  description: 'Steps to combine multiple PDF files into one using the OmniWebKit PDF Merger.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload PDF files', text: 'Drag and drop PDF files into the upload area, or click to browse. Multiple files can be added at once.' },
    { '@type': 'HowToStep', position: 2, name: 'Arrange the order', text: 'Use the arrow buttons to move files up or down, or click Shuffle Order. The merge follows this exact order.' },
    { '@type': 'HowToStep', position: 3, name: 'Configure settings', text: 'Toggle Add Metadata, Preserve Metadata, and Optimize Size as needed in the sidebar.' },
    { '@type': 'HowToStep', position: 4, name: 'Click Merge PDFs', text: 'Click the Merge PDFs button. Each file is processed page by page and combined into a single document.' },
    { '@type': 'HowToStep', position: 5, name: 'Download the merged PDF', text: 'Click Download PDF to save the merged document. It includes all pages from all source files in the order you specified.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this PDF merger free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no watermarks, and no limits on file count, pages, or size.' } },
    { '@type': 'Question', name: 'Are my PDF files uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All merging happens locally in your browser. Your files never leave your device.' } },
    { '@type': 'Question', name: 'How many PDFs can I merge at once?', acceptedAnswer: { '@type': 'Answer', text: 'There is no enforced limit. Add as many files as needed. Very large batches may use more browser memory.' } },
    { '@type': 'Question', name: 'Does merging reduce PDF quality?', acceptedAnswer: { '@type': 'Answer', text: 'No. Pages are copied bit-for-bit. Text, images, fonts, links, and formatting are preserved exactly.' } },
    { '@type': 'Question', name: 'Can I reorder files before merging?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use arrow buttons or Shuffle Order. The merge follows the displayed order.' } },
    { '@type': 'Question', name: 'What does Optimize Size do?', acceptedAnswer: { '@type': 'Answer', text: 'It uses PDF object streams for more efficient internal structure, reducing file size slightly.' } },
    { '@type': 'Question', name: 'Can I merge password-protected PDFs?', acceptedAnswer: { '@type': 'Answer', text: 'Some encrypted PDFs may work. Fully encrypted files may fail. Remove the password first, then merge.' } },
    { '@type': 'Question', name: 'Can I preview PDFs before merging?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the eye icon to open any PDF in a new browser tab for review.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'PDF Merger', item: 'https://omniwebkit.com/tools/pdf-merger' },
  ],
};

export default function PdfMergerLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="pdf-merger" category="file" />
    </>
  );
}
