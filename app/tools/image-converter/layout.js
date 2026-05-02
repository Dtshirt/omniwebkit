export const metadata = {
  title: 'Free Online Image Converter — Convert JPG, PNG, WebP, AVIF, HEIC, TIFF, GIF, BMP, ICO',
  description:
    'Free online image converter supporting 11 formats: JPG, PNG, WebP, AVIF, HEIC, HEIF, TIFF, GIF, BMP, ICO, SVG. Convert in your browser — no upload to server. Batch convert, quality control, download instantly. 100% free and private.',
  keywords: [
    'image converter online free',
    'convert JPG to PNG online',
    'convert PNG to WebP online',
    'convert HEIC to JPG online',
    'convert HEIC to PNG free',
    'AVIF converter online',
    'TIFF to JPG converter',
    'convert image format online free',
    'JPG to WebP converter',
    'PNG to JPEG converter online',
    'batch image format converter',
    'free image conversion no upload',
    'HEIF to PNG converter',
    'WebP converter online free',
    'ICO favicon generator from image',
    'AVIF to JPG converter',
    'TIFF to PNG converter',
    'HEIC to WebP converter',
  ],
  openGraph: {
    title: 'Free Image Converter — JPG, PNG, WebP, AVIF, HEIC, TIFF, GIF, BMP, ICO',
    description:
      'Convert images between 11 formats including HEIC, AVIF, TIFF. Batch convert, quality control, instant download. No server upload — 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Converter — JPG, PNG, WebP, GIF, BMP Online',
    description: 'Convert images between any format in your browser. Batch support, quality control. Free, no server upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/tools/image-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Image Converter',
  description:
    'Free browser-based image format converter using the HTML5 Canvas API. Supports input formats: JPG, PNG, WebP, GIF, BMP, TIFF, ICO. Output formats: JPEG, PNG, WebP, GIF, BMP. Batch conversion — upload multiple images, convert all in parallel, download individually or all at once. Quality slider (10–100%) for JPEG and WebP output. Per-file before/after size comparison. Hash-based output format routing (e.g. /tools/image-converter#webp). White background fill for transparent PNGs converted to JPEG. No server upload — 100% browser-based Canvas API processing.',
  url: 'https://omniwebkit.com/tools/image-converter',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert JPG, PNG, WebP, GIF, BMP, TIFF, ICO between formats',
    'Output to JPEG, PNG, WebP, GIF, BMP',
    'Batch conversion — multiple files at once, parallel processing',
    'Quality slider for JPEG and WebP output (10–100%)',
    'Per-file before/after size comparison',
    'Download converted files individually or all at once',
    'Automatic white background fill for JPEG from transparent PNG',
    'URL hash-based format routing',
    'Native drag-and-drop and file picker upload',
    'No server upload — 100% browser-based Canvas API',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert an Image Format Online for Free',
  description: 'Steps to convert images between formats using the OmniWebKit Image Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload your images', text: 'Drag and drop one or more image files onto the upload area, or click to browse. Supports JPG, PNG, WebP, GIF, BMP, TIFF, and ICO.' },
    { '@type': 'HowToStep', position: 2, name: 'Select output format', text: 'Click the output format you want: JPEG, PNG, WebP, GIF, or BMP. A description of each format is shown next to its name.' },
    { '@type': 'HowToStep', position: 3, name: 'Adjust quality (optional)', text: 'For JPEG or WebP output, drag the quality slider to set the quality level (10–100%). Higher quality = larger file. Lower quality = smaller file.' },
    { '@type': 'HowToStep', position: 4, name: 'Convert', text: 'Click the Convert button. All files convert in parallel. A before/after size badge appears for each file when complete.' },
    { '@type': 'HowToStep', position: 5, name: 'Download', text: 'Click the Download button on any file to save the converted version. Use "Download All" to save all converted files at once.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is my image uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All conversion runs in your browser using the HTML5 Canvas API. Images never leave your device.' } },
    { '@type': 'Question', name: 'Which formats can I convert between?', acceptedAnswer: { '@type': 'Answer', text: 'Input: JPG, PNG, WebP, GIF, BMP, TIFF, ICO. Output: JPEG, PNG, WebP, GIF, BMP. Convert in any direction.' } },
    { '@type': 'Question', name: 'Will converting to JPEG reduce quality?', acceptedAnswer: { '@type': 'Answer', text: 'JPEG is lossy — compression permanently discards some data. At 85% quality or above, the difference is invisible to most viewers. Converting JPEG → PNG will not add further quality loss.' } },
    { '@type': 'Question', name: 'Can I convert multiple images at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload multiple files and all convert in parallel. Download individually or use Download All.' } },
    { '@type': 'Question', name: 'Why convert to WebP?', acceptedAnswer: { '@type': 'Answer', text: 'WebP produces files 25–35% smaller than JPEG and 20–30% smaller than PNG at equal quality. All modern browsers support it. It improves Core Web Vitals and page load speed.' } },
    { '@type': 'Question', name: 'Does converting PNG to JPEG remove transparency?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. JPEG does not support transparency. Transparent areas are automatically filled with white. Use WebP to preserve transparency.' } },
    { '@type': 'Question', name: 'Is there a file size limit?', acceptedAnswer: { '@type': 'Answer', text: 'No strict limit — processing depends on available browser memory. Most images up to 50 MB convert without issues.' } },
    { '@type': 'Question', name: 'What does the quality slider do?', acceptedAnswer: { '@type': 'Answer', text: 'For JPEG and WebP outputs, it controls the lossy compression level. Lower quality = smaller file with more compression. Higher quality = larger file with less compression. PNG and GIF are always lossless.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
  ],
};

export default function ImageConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
