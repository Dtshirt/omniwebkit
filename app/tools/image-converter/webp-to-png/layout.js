export const metadata = {
  title: 'WebP to PNG Converter — Free Online Tool',
  description:
    'Convert WebP images to PNG format online for free. Keep maximum quality, maintain perfect alpha transparency, and prepare images for editing. No server upload required.',
  keywords: [
    'webp to png',
    'convert webp to png',
    'webp to png converter',
    'change webp to png',
    'free webp to png',
    'batch webp to png converter',
    'webp to png online',
    'transparent webp to png'
  ],
  openGraph: {
    title: 'WebP to PNG Converter — Free Online Tool',
    description:
      'Convert WebP images to PNG format online for free. Maintain maximum quality and transparency. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/webp-to-png',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to PNG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP to PNG Converter — Free Online Tool',
    description: 'Convert WebP to PNG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/webp-to-png',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WebP to PNG Converter',
  description:
    'Free browser-based WebP to PNG converter. Drag and drop WebP files and download lossless PNG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/webp-to-png',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert WebP to PNG format',
    'Batch conversion — multiple files at once',
    'Lossless PNG output',
    'Maintains perfect alpha transparency',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert WebP to PNG',
  description: 'Steps to convert your WebP files to the lossless PNG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload WebP files', text: 'Drag and drop one or more WebP files onto the upload area.' },
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
    { '@type': 'ListItem', position: 4, name: 'WebP to PNG', item: 'https://omniwebkit.com/tools/image-converter/webp-to-png' },
  ],
};

export default function WebpToPngLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
