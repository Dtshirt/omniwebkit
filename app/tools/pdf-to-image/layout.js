import RelatedTools from '@/components/seo/RelatedTools';
﻿export const metadata = {
  title: 'PDF to Image Converter Free Online — Convert PDF Pages to JPG/PNG',
  description:
    'Convert PDF pages to high-quality images (JPG, PNG) online for free. Batch convert all PDF pages to images. Fast PDF to image converter — no registration needed.',
  keywords: [
    'pdf to image converter online free',
    'convert pdf to png online free',
    'pdf to jpg converter online',
    'pdf to image free no signup',
    'pdf to webp converter online free',
    'convert pdf pages to images',
    'pdf to png high quality free',
    'pdf to image converter no watermark',
    'free pdf to jpg no upload',
    'browser based pdf to image converter',
  ],
  openGraph: {
    title: 'Free PDF to Image Converter — Convert PDF to PNG, JPG, WebP',
    description:
      'Convert PDF pages to high-quality images. Choose PNG, JPG, or WebP. Adjust resolution and quality. Browser-based, no signup.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/pdf-to-image',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF to Image Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free PDF to Image Converter — PNG, JPG, WebP',
    description: 'Convert PDF pages to high-quality images. 4 resolution levels. Free, no upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/pdf-to-image',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PDF to Image Converter',
  description:
    'Free browser-based PDF to image converter. Renders every page of a PDF as a high-quality image using PDF.js. Output formats: PNG (lossless), JPG (lossy with quality slider 10–100%), WebP (modern efficient format). Resolution multiplier: 1× (72 DPI), 2× (144 DPI), 3× (216 DPI), 4× (288 DPI). Click-to-select page grid with checkboxes. Individual and batch download. Conversion progress bar. Total estimated size display. All processing browser-based — no server upload. No signup, no watermarks, no limits.',
  url: 'https://omniwebkit.com/tools/pdf-to-image',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Three output formats: PNG, JPG, WebP',
    'Four resolution levels: 1× (72 DPI) to 4× (288 DPI)',
    'Quality slider (10–100%) for JPG and WebP',
    'Visual page grid with click-to-select checkboxes',
    'Select All / Deselect All for batch operations',
    'Individual and batch download',
    'Conversion progress bar for multi-page PDFs',
    'Total estimated file size display',
    'Drag-and-drop or click-to-upload file selection',
    'All processing browser-based — no server upload',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert PDF to Image Online for Free',
  description: 'Steps to convert PDF pages to high-quality images using the OmniWebKit PDF to Image Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Set conversion options', text: 'Select the output format (PNG, JPG, or WebP), adjust the quality slider (for JPG/WebP), and choose a resolution multiplier (1×–4×).' },
    { '@type': 'HowToStep', position: 2, name: 'Upload your PDF', text: 'Drag and drop a PDF file into the upload area, or click Select PDF to browse your files.' },
    { '@type': 'HowToStep', position: 3, name: 'Wait for conversion', text: 'A progress bar shows completion percentage. Each page is rendered at the selected resolution and format.' },
    { '@type': 'HowToStep', position: 4, name: 'Select pages', text: 'Click on page thumbnails to toggle selection. Use Select All or Deselect All for convenience.' },
    { '@type': 'HowToStep', position: 5, name: 'Download images', text: 'Click Download next to individual pages, or use the Download All button to save all selected pages as images.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this PDF to image converter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no watermarks, and no limits on pages or file size.' } },
    { '@type': 'Question', name: 'Are my PDF files uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All rendering happens locally in your browser. Your files never leave your device.' } },
    { '@type': 'Question', name: 'What resolution should I choose?', acceptedAnswer: { '@type': 'Answer', text: '2× (144 DPI) is standard for sharp screen images. Use 3× or 4× for print quality or zooming.' } },
    { '@type': 'Question', name: 'What is the difference between PNG, JPG, and WebP?', acceptedAnswer: { '@type': 'Answer', text: 'PNG is lossless with larger files. JPG is lossy with smaller files. WebP gives better compression than both at similar quality.' } },
    { '@type': 'Question', name: 'Can I select specific pages to download?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click page thumbnails to toggle selection. Only selected pages are included in batch download.' } },
    { '@type': 'Question', name: 'Can I convert password-protected PDFs?', acceptedAnswer: { '@type': 'Answer', text: 'Browser-based PDF.js cannot open encrypted PDFs. Remove the password first, then convert.' } },
    { '@type': 'Question', name: 'What is the maximum PDF size I can convert?', acceptedAnswer: { '@type': 'Answer', text: 'There is no enforced limit. Very large PDFs may take longer and use more browser memory.' } },
    { '@type': 'Question', name: 'What does the Quality slider do?', acceptedAnswer: { '@type': 'Answer', text: 'For JPG and WebP, it controls compression intensity (10–100%). Lower = smaller files with artifacts. Higher = better quality. For PNG, quality has no effect.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'PDF to Image Converter', item: 'https://omniwebkit.com/tools/pdf-to-image' },
  ],
};

export default function PdfToImageLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="pdf-to-image" category="file" />
    </>
  );
}
