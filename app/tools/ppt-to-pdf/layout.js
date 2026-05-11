import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'PowerPoint to PDF Converter Online Free — Convert PPTX to PDF',
  description:
    'Convert PowerPoint presentations (PPT, PPTX) to PDF online free. Preserve slide formatting perfectly. Fast presentation to PDF converter — no email needed, instant download.',
  keywords: [
    'powerpoint to pdf converter free online',
    'pptx to pdf online free',
    'convert ppt to pdf free',
    'free pptx to pdf converter',
    'powerpoint to pdf with formatting',
    'convert ppt to pdf online free',
    'presentation to pdf online free',
    'pptx to pdf no watermark',
    'powerpoint to pdf converter no signup',
    'ppt slides to pdf',
  ],
  openGraph: {
    title: 'PowerPoint to PDF Converter Online Free — Convert PPTX to PDF',
    description:
      'Convert PowerPoint presentations (PPT, PPTX) to PDF online free. Preserve slide formatting perfectly. Fast converter — no email needed, instant download.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/ppt-to-pdf',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PowerPoint to PDF Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PowerPoint to PDF Converter — Pixel-Perfect Slides',
    description: 'Convert PowerPoint to real vector PDF with slide formatting. Server-side engine. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/ppt-to-pdf',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PowerPoint to PDF Converter',
  description:
    'Server-side PowerPoint to PDF converter. Upload .pptx, .ppt, or .odp and get a proper vector PDF with full formatting. Slides, charts, images, fonts — all preserved. Text is crisp, selectable, and searchable. Files auto-deleted after download. Free, no watermark.',
  url: 'https://omniwebkit.com/tools/ppt-to-pdf',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Server-side rendering engine',
    'Vector PDF output (not raster/screenshot)',
    'Full formatting: slides, charts, images, fonts',
    'Supports .pptx, .ppt, .odp',
    'Selectable, searchable text in PDF output',
    'Files auto-deleted after download',
    'Up to 100 MB files',
    'No watermark, no signup',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert PowerPoint to PDF Online',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload file', text: 'Drag and drop your .pptx, .ppt, or .odp presentation file.' },
    { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click Convert to PDF. The server engine processes your presentation.' },
    { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Preview the output and click Download PDF to save your file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Does it preserve slide formatting?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fonts, images, charts, SmartArt, and complex slide layouts are all preserved by the server-side rendering engine.' } },
    { '@type': 'Question', name: 'Is the text selectable in the PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The engine outputs vector text, not a raster image. Text is crisp, selectable, and searchable.' } },
    { '@type': 'Question', name: 'Are files stored on the server?', acceptedAnswer: { '@type': 'Answer', text: 'Only temporarily during conversion. Files are deleted immediately after download.' } },
    { '@type': 'Question', name: 'What formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'PPTX (modern PowerPoint), PPT (legacy PowerPoint), and ODP (OpenDocument Presentation). Up to 100 MB.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'PowerPoint to PDF Converter', item: 'https://omniwebkit.com/tools/ppt-to-pdf' },
  ],
};

export default function PptToPDFLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="ppt-to-pdf" category="file" />
    </>
  );
}
