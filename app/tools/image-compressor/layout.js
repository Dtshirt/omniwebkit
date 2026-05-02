import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Image Compressor — Reduce Image File Size Without Quality Loss',
  description:
    'Free online image compressor. Reduce JPG, PNG, WebP, GIF, and BMP file sizes by up to 80% without visible quality loss. Batch compress multiple images, set max dimensions, download individually. Browser-based — no upload to server.',
  keywords: [
    'image compressor online free',
    'compress image online without quality loss',
    'reduce image file size online',
    'JPG compressor online free',
    'PNG compressor online',
    'WebP image compression tool',
    'batch image compressor free',
    'compress photos for website',
    'image size reducer online',
    'free image optimize tool no upload',
  ],
  openGraph: {
    title: 'Free Image Compressor — Reduce JPG, PNG, WebP File Size Online',
    description:
      'Compress JPEG, PNG, WebP, GIF, and BMP images by up to 80%. Batch compression, before/after preview, max dimensions resize, quality slider. Free, browser-based, no server upload.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-compressor',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Compressor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Compressor — Reduce File Size Without Quality Loss',
    description: 'Compress JPG, PNG, WebP images by up to 80%. Batch support, quality presets, max dimensions. Free, browser-based.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-compressor',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Image Compressor',
  description:
    'Free browser-based image compressor using the HTML5 Canvas API. Supports JPG, PNG, WebP, GIF, BMP input. Quality presets: Maximum (60%), Balanced (80%), Light (92%). Custom quality slider (10–100%). Max width/height resize inputs with aspect ratio preservation. Batch compression — upload multiple images, compress all at once, download individually. Before/after thumbnail comparison per file. Per-file and total savings percentage with progress bar. No server upload — all processing runs in browser.',
  url: 'https://omniwebkit.com/tools/image-compressor',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'JPEG and PNG compression via HTML5 Canvas API',
    'Quality presets: Maximum, Balanced, Light',
    'Custom quality slider (10–100%)',
    'Batch compression — multiple files at once',
    'Before/after thumbnail comparison per file',
    'Per-file savings percentage and progress bar',
    'Total batch savings summary panel',
    'Max width / height with aspect ratio preservation',
    'Individual file download',
    'No server upload — 100% browser-based',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Compress Images Online for Free',
  description: 'Steps to reduce image file size using the OmniWebKit Image Compressor.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload your images', text: 'Drag and drop one or more image files onto the upload area, or click to browse and select files. JPG, PNG, WebP, GIF, and BMP are supported.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose a quality level', text: 'Select Maximum for the smallest file size, Balanced for the best quality-to-size ratio (recommended), or Light to preserve maximum quality. You can also drag the quality slider to a custom value.' },
    { '@type': 'HowToStep', position: 3, name: 'Set max dimensions (optional)', text: 'Enter a max width or height in pixels to also resize the image as part of the compression. Aspect ratio is automatically preserved.' },
    { '@type': 'HowToStep', position: 4, name: 'Compress', text: 'Click the Compress button. For each file, the compressed version appears next to the original thumbnail with the size reduction percentage.' },
    { '@type': 'HowToStep', position: 5, name: 'Download', text: 'Click the Download button on any file to save the compressed version. The file saves with a _compressed suffix and the correct extension.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is my image uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All compression runs in your browser using the HTML5 Canvas API. Your images never leave your device.' } },
    { '@type': 'Question', name: 'How much can I reduce an image file size?', acceptedAnswer: { '@type': 'Answer', text: 'Typically 50–80% for JPEG photographs at Balanced quality with no visible difference. At Maximum, reductions of 80–90% are possible.' } },
    { '@type': 'Question', name: 'Can I compress multiple images at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload multiple images at once. All are compressed with the same settings. Download each compressed file using the individual Download button.' } },
    { '@type': 'Question', name: 'Does PNG compression reduce quality?', acceptedAnswer: { '@type': 'Answer', text: 'PNG uses lossless compression, so no visual quality is lost. The quality slider for PNGs removes only redundant data. File size reductions are typically smaller than JPEG (10–40%).' } },
    { '@type': 'Question', name: 'What does Max Width / Max Height do?', acceptedAnswer: { '@type': 'Answer', text: 'It resizes the image to fit within the specified pixel dimensions while preserving the aspect ratio. This reduces file size further by reducing the pixel count.' } },
    { '@type': 'Question', name: 'Why do my compressed images look different at Maximum quality?', acceptedAnswer: { '@type': 'Answer', text: 'At Maximum (60% quality), the JPEG encoder discards more data to reduce file size. On images with fine detail or gradients, this can produce visible artefacts. Use Balanced (80%) as a starting point.' } },
    { '@type': 'Question', name: 'Should I compress images before uploading to my website?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Compress before uploading. This reduces server storage, CDN bandwidth costs, and ensures visitors receive the smaller file. Start with the highest-quality original you have.' } },
    { '@type': 'Question', name: 'Can I re-compress an already-compressed JPEG?', acceptedAnswer: { '@type': 'Answer', text: 'You can, but each re-compression cycle permanently removes more data. Start with the original uncompressed or highest-quality version of your image for best results.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Compressor', item: 'https://omniwebkit.com/tools/image-compressor' },
  ],
};

export default function ImageCompressorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="image-compressor" category="image" />
    </>
  );
}
