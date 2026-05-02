export const metadata = {
  title: 'PNG to WebP Converter — Free Online Tool',
  description:
    'Convert PNG images to WebP format online for free. Keep transparency, reduce file size by up to 30%, and improve website loading speed. No server upload required.',
  keywords: [
    'png to webp',
    'convert png to webp',
    'png to webp converter',
    'png to webp transparent',
    'free png to webp',
    'batch png to webp converter',
    'png to webp online',
    'reduce png size'
  ],
  openGraph: {
    title: 'PNG to WebP Converter — Free Online Tool',
    description:
      'Convert PNG images to WebP format online for free. Keep transparency, reduce file size, and improve speed. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/png-to-webp',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to WebP Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNG to WebP Converter — Free Online Tool',
    description: 'Convert PNG to WebP directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/png-to-webp',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PNG to WebP Converter',
  description:
    'Free browser-based PNG to WebP converter. Drag and drop PNG files, adjust quality, and download WebP instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/png-to-webp',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert PNG to WebP format',
    'Batch conversion — multiple files at once',
    'Quality slider for WebP output (10–100%)',
    'Preserves transparency',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert PNG to WebP',
  description: 'Steps to convert your PNG files to the modern WebP format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload PNG files', text: 'Drag and drop one or more PNG files onto the upload area.' },
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
    { '@type': 'ListItem', position: 4, name: 'PNG to WebP', item: 'https://omniwebkit.com/tools/image-converter/png-to-webp' },
  ],
};

export default function PngToWebpLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
