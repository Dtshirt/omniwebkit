export const metadata = {
  title: 'WebP to JPG Converter — Free Online Tool',
  description:
    'Convert WebP images to JPG format online for free. Automatically fill transparent backgrounds with white to ensure perfect compatibility across all platforms. No server upload required.',
  keywords: [
    'webp to jpg',
    'convert webp to jpg',
    'webp to jpg converter',
    'webp to jpeg',
    'free webp to jpg',
    'batch webp to jpg converter',
    'webp to jpg online',
    'remove webp transparency'
  ],
  openGraph: {
    title: 'WebP to JPG Converter — Free Online Tool',
    description:
      'Convert WebP images to JPG format online for free. Automatically replaces transparent backgrounds with white. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to JPG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP to JPG Converter — Free Online Tool',
    description: 'Convert WebP to JPG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WebP to JPG Converter',
  description:
    'Free browser-based WebP to JPG converter. Drag and drop WebP files, adjust quality, and download JPG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert WebP to JPG format',
    'Batch conversion — multiple files at once',
    'Quality slider for JPG output (10–100%)',
    'Automatically fills transparent backgrounds with white',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert WebP to JPG',
  description: 'Steps to convert your WebP files to the universally supported JPG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload WebP files', text: 'Drag and drop one or more WebP files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust quality', text: 'Use the quality slider to set your desired compression level.' },
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
    { '@type': 'ListItem', position: 4, name: 'WebP to JPG', item: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg' },
  ],
};

export default function WebpToJpgLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
