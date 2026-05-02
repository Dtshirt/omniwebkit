import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Bulk Image Compressor Online | Batch Process 500 Photos Fast',
  description:
    'Batch compress up to 500 images instantly in your browser. Fast, multi-threaded online bulk image optimizer with one-click download. Zero server uploads.',
  keywords: [
    'bulk image compressor',
    'batch compress images online',
    'compress multiple photos',
    'mass image optimizer',
    'multi image size reducer',
    'folder image compressor',
  ],
  openGraph: {
    title: 'Bulk Image Compressor Online | Batch Process Photos',
    description:
      'Save hours of manual work. Drag and drop hundreds of images and let our multi-threaded browser algorithm compress them all instantly.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-compressor/bulk-image-compressor-online',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Bulk Compressor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk Image Compressor Online',
    description: 'Batch process up to 500 images at once in your browser.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-compressor/bulk-image-compressor-online',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Bulk Image Compressor',
  description:
    'A high-performance batch image compressor capable of processing hundreds of photos concurrently in the browser using HTML5 Canvas.',
  url: 'https://omniwebkit.com/tools/image-compressor/bulk-image-compressor-online',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is there a limit to how many images I can batch compress?', acceptedAnswer: { '@type': 'Answer', text: 'You can select up to 500 images at a time. The only practical limit is your computer\'s RAM, as all processing is done locally in your browser.' } },
    { '@type': 'Question', name: 'Will my browser crash if I upload 1000 photos?', acceptedAnswer: { '@type': 'Answer', text: 'If you attempt to process thousands of 20MB RAW files simultaneously, it might freeze the browser tab. We recommend breaking massive jobs into batches of 200-500 images for the smoothest experience.' } },
    { '@type': 'Question', name: 'Do you store my images on your servers?', acceptedAnswer: { '@type': 'Answer', text: 'No! Everything is processed 100% locally on your machine. Your private photos never leave your device, ensuring maximum security and zero upload wait times.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Compressor', item: 'https://omniwebkit.com/tools/image-compressor' },
    { '@type': 'ListItem', position: 4, name: 'Bulk Compressor', item: 'https://omniwebkit.com/tools/image-compressor/bulk-image-compressor-online' },
  ],
};

export default function LayoutBulk({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="bulk-image-compressor-online" category="image" />
    </>
  );
}
