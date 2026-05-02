export const metadata = {
  title: 'JPG to WebP Converter — Free Online Tool',
  description:
    'Convert JPG images to WebP format online for free. Reduce file size by up to 30%, speed up your website, and maintain image quality. No server upload required.',
  keywords: [
    'jpg to webp',
    'convert jpg to webp',
    'jpg to webp converter',
    'change jpg to webp',
    'free jpg to webp',
    'batch jpg to webp converter',
    'jpg to webp online',
    'reduce jpg size'
  ],
  openGraph: {
    title: 'JPG to WebP Converter — Free Online Tool',
    description:
      'Convert JPG images to WebP format online for free. Reduce file size and improve speed. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/jpg-to-webp',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to WebP Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JPG to WebP Converter — Free Online Tool',
    description: 'Convert JPG to WebP directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/jpg-to-webp',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JPG to WebP Converter',
  description:
    'Free browser-based JPG to WebP converter. Drag and drop JPG files, adjust quality, and download WebP instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/jpg-to-webp',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert JPG to WebP format',
    'Batch conversion — multiple files at once',
    'Quality slider for WebP output (10–100%)',
    'High compression rates',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert JPG to WebP',
  description: 'Steps to convert your JPG files to the modern WebP format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload JPG files', text: 'Drag and drop one or more JPG files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust quality', text: 'Use the quality slider to set your desired compression level. Lower quality gives a smaller file size.' },
    { '@type': 'HowToStep', position: 3, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download individual WebP files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'JPG to WebP', item: 'https://omniwebkit.com/tools/image-converter/jpg-to-webp' },
  ],
};

export default function JpgToWebpLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
