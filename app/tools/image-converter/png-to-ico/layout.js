export const metadata = {
  title: 'PNG to ICO Converter — Free Online Favicon Generator',
  description:
    'Convert PNG images to ICO format online for free. Instantly generate favicons and Windows icons with perfect transparency. No server upload required.',
  keywords: [
    'png to ico',
    'convert png to ico',
    'png to ico converter',
    'favicon generator',
    'free png to ico',
    'batch png to ico converter',
    'png to ico online',
    'windows icon maker'
  ],
  openGraph: {
    title: 'PNG to ICO Converter — Free Online Tool',
    description:
      'Convert PNG images to ICO format online for free. Generate favicons with perfect transparency. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/png-to-ico',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to ICO Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNG to ICO Converter — Free Online Tool',
    description: 'Convert PNG to ICO directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/png-to-ico',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PNG to ICO Converter',
  description:
    'Free browser-based PNG to ICO converter. Drag and drop PNG files and download ICO instantly without any server uploads. Supports batch conversion for generating multiple favicons.',
  url: 'https://omniwebkit.com/tools/image-converter/png-to-ico',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert PNG to ICO format',
    'Batch conversion — multiple files at once',
    'Perfect for website Favicons',
    'Preserves alpha transparency',
    'Instant local processing',
    'No server upload — 100% browser-based'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert PNG to ICO',
  description: 'Steps to convert your PNG files to the ICO format for website favicons using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload PNG files', text: 'Drag and drop one or more PNG files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click the Convert button. Files are instantly mapped to the ICO header format in your browser.' },
    { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download individual ICO files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'PNG to ICO', item: 'https://omniwebkit.com/tools/image-converter/png-to-ico' },
  ],
};

export default function PngToIcoLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
