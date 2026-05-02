export const metadata = {
  title: 'AVIF to JPG Converter — Free Online Tool',
  description:
    'Convert AVIF images to JPG format online for free. Keep transparency, reduce file size by up to 30%, and improve website loading speed. No server upload required.',
  keywords: [
    'AVIF to JPG',
    'convert AVIF to JPG',
    'AVIF to JPG converter',
    'AVIF to JPG transparent',
    'free AVIF to JPG',
    'batch AVIF to JPG converter',
    'AVIF to JPG online',
    'reduce AVIF size'
  ],
  openGraph: {
    title: 'AVIF to JPG Converter — Free Online Tool',
    description:
      'Convert AVIF images to JPG format online for free. Keep transparency, reduce file size, and improve speed. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/avif-to-jpg',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'AVIF to JPG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AVIF to JPG Converter — Free Online Tool',
    description: 'Convert AVIF to JPG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/avif-to-jpg',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AVIF to JPG Converter',
  description:
    'Free browser-based AVIF to JPG converter. Drag and drop AVIF files, adjust quality, and download JPG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/avif-to-jpg',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert AVIF to JPG format',
    'Batch conversion — multiple files at once',
    'Quality slider for JPG output (10–100%)',
    'Preserves transparency',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert AVIF to JPG',
  description: 'Steps to convert your AVIF files to the modern JPG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload AVIF files', text: 'Drag and drop one or more AVIF files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust quality', text: 'Use the quality slider to set your desired compression level. Lower quality gives a smaller file size.' },
    { '@type': 'HowToStep', position: 3, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download individual JPG files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'AVIF to JPG', item: 'https://omniwebkit.com/tools/image-converter/avif-to-jpg' },
  ],
};

export default function AVIFToJPGLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
