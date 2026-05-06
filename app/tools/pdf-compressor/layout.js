import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'PDF Compressor Online Free — Reduce PDF Size Without Losing Quality',
  description:
    'Compress PDF files online for free. Reduce PDF size from MB to KB without losing quality. Best free online PDF compressor — no signup, instant download.',
  keywords: [
    'pdf compressor online free',
    'compress pdf file size online free',
    'reduce pdf size online',
    'pdf size reducer online free',
    'compress pdf online no signup',
    'pdf compressor free no watermark',
    'batch pdf compressor online',
    'shrink pdf file online free',
    'pdf file compressor no upload',
    'compress pdf without losing quality',
  ],
  openGraph: {
    title: 'PDF Compressor Online Free — Reduce PDF Size Without Losing Quality',
    description:
      'Reduce PDF file size with 3 compression levels. Batch compress multiple PDFs. Browser-based, no upload, no signup, no watermark.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/pdf-compressor',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF Compressor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online PDF Compressor — Reduce PDF File Size',
    description: 'Compress PDFs with 3 quality levels. Batch support. Browser-based, no upload, no watermark, free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/pdf-compressor',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PDF Compressor',
  description:
    'Free browser-based PDF compressor. Three compression levels (Low ~10% reduction, Medium ~30%, High ~50%). Drag-and-drop or click-to-upload. Batch compress multiple PDFs simultaneously. Per-file progress bar. Summary statistics (total files, original size, compressed size, total savings %). Download each compressed file individually. No server upload — all processing browser-based. No signup, no watermarks, no file count or size limits.',
  url: 'https://omniwebkit.com/tools/pdf-compressor',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Three compression levels: Low, Medium, High',
    'Drag-and-drop or click-to-upload file selection',
    'Batch compress multiple PDF files simultaneously',
    'Per-file progress bar during compression',
    'Total compression summary (files, original, compressed, saved %)',
    'Download each compressed PDF individually',
    'All processing browser-based — no server upload',
    'No signup, no watermarks, no file size limits',
    'Remove individual files or clear all',
    'Real-time per-file size comparison with percentage saved',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Compress PDF Files Online for Free',
  description: 'Steps to compress PDF files using the OmniWebKit PDF Compressor.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose compression level', text: 'Select Low (best quality, ~10% reduction), Medium (balanced, ~30%), or High (smallest file, ~50%).' },
    { '@type': 'HowToStep', position: 2, name: 'Upload PDF files', text: 'Drag and drop PDF files into the upload area, or click to select files from your device. You can upload multiple files at once.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Compress All', text: 'Click "Compress All" to start processing. Each file shows a progress bar during compression.' },
    { '@type': 'HowToStep', position: 4, name: 'Review results', text: 'Each file shows its original size, compressed size, and percentage saved. The summary row totals all files.' },
    { '@type': 'HowToStep', position: 5, name: 'Download compressed PDFs', text: 'Click Download next to each file to save the compressed version. The filename includes "_compressed" for easy identification.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this PDF compressor free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required, no watermarks, and no limits on file count or size.' } },
    { '@type': 'Question', name: 'Are my PDF files uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All compression processing happens locally in your browser. Your files never leave your device.' } },
    { '@type': 'Question', name: 'What is the difference between the three compression levels?', acceptedAnswer: { '@type': 'Answer', text: 'Low: ~10% file size reduction with minimal quality loss. Medium: ~30% reduction with balanced quality. High: ~50% reduction with more aggressive compression.' } },
    { '@type': 'Question', name: 'Will compression reduce the quality of my PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Low and Medium maintain near-original quality. High may reduce image resolution, but text and vector graphics remain sharp.' } },
    { '@type': 'Question', name: 'Can I compress multiple PDFs at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload as many PDFs as needed and click Compress All. Each file is processed individually with its own progress bar and results.' } },
    { '@type': 'Question', name: 'Can I compress password-protected PDFs?', acceptedAnswer: { '@type': 'Answer', text: 'Browser-based processing cannot open encrypted PDFs. Remove the password first, then compress.' } },
    { '@type': 'Question', name: 'What is the maximum file size I can compress?', acceptedAnswer: { '@type': 'Answer', text: 'There is no enforced limit. Very large files may take longer. For best performance, process files over 100 MB individually.' } },
    { '@type': 'Question', name: 'Can I undo the compression?', acceptedAnswer: { '@type': 'Answer', text: 'Compression is irreversible — it removes data to reduce size. Always keep a copy of the original file.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'PDF Compressor', item: 'https://omniwebkit.com/tools/pdf-compressor' },
  ],
};

export default function PDFCompressorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="pdf-compressor" category="file" />
    </>
  );
}
