export const metadata = {
  title: 'JPG to PNG Converter — Free Online Tool',
  description:
    'Convert JPG images to PNG format online for free. Keep maximum quality, prepare images for transparency, and avoid compression artifacts. No server upload required.',
  keywords: [
    'jpg to png',
    'convert jpg to png',
    'jpg to png converter',
    'change jpg to png',
    'free jpg to png',
    'batch jpg to png converter',
    'jpg to png online',
    'high quality jpg to png'
  ],
  openGraph: {
    title: 'JPG to PNG Converter — Free Online Tool',
    description:
      'Convert JPG images to PNG format online for free. Maintain maximum quality. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/jpg-to-png',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to PNG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JPG to PNG Converter — Free Online Tool',
    description: 'Convert JPG to PNG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/jpg-to-png',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JPG to PNG Converter',
  description:
    'Free browser-based JPG to PNG converter. Drag and drop JPG files and download lossless PNG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/jpg-to-png',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert JPG to PNG format',
    'Batch conversion — multiple files at once',
    'Lossless PNG output',
    'Prepares images to accept transparency',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert JPG to PNG',
  description: 'Steps to convert your JPG files to the lossless PNG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload JPG files', text: 'Drag and drop one or more JPG files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser to PNG format.' },
    { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download individual PNG files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'JPG to PNG', item: 'https://omniwebkit.com/tools/image-converter/jpg-to-png' },
  ],
};

export default function JpgToPngLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
