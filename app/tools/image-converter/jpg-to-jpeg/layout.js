export const metadata = {
  title: 'JPG to JPEG Converter — Free Online Extension Changer',
  description:
    'Convert JPG to JPEG format online instantly. No quality loss, 100% free, and completely secure. Change file extensions in seconds without uploading to any server.',
  keywords: [
    'jpg to jpeg',
    'convert jpg to jpeg',
    'jpg to jpeg converter',
    'change jpg to jpeg',
    'free jpg to jpeg',
    'batch jpg to jpeg converter',
    'jpg to jpeg online',
  ],
  openGraph: {
    title: 'JPG to JPEG Converter — Free Online Tool',
    description:
      'Convert JPG images to JPEG format instantly with zero quality loss. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/jpg-to-jpeg',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to JPEG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JPG to JPEG Converter — Free Online Tool',
    description: 'Convert JPG to JPEG directly in your browser. Fast, free, and zero quality loss.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/jpg-to-jpeg',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JPG to JPEG Converter',
  description:
    'Free browser-based JPG to JPEG converter. Drag and drop JPG files and download as JPEG instantly with zero quality loss. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/jpg-to-jpeg',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert JPG to JPEG format',
    'Convert JPEG to JPG format',
    'Batch conversion — multiple files at once',
    'Zero quality loss (lossless conversion)',
    'Instant processing',
    'No server upload — 100% browser-based'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert JPG to JPEG',
  description: 'Steps to convert your JPG files to the JPEG extension using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload JPG files', text: 'Drag and drop one or more JPG files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser without quality loss.' },
    { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download individual JPEG files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'JPG to JPEG', item: 'https://omniwebkit.com/tools/image-converter/jpg-to-jpeg' },
  ],
};

export default function JpgToJpegLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
