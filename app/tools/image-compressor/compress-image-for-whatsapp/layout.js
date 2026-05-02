import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'WhatsApp Image Optimizer | Send HD Photos Without Blur',
  description:
    'Stop WhatsApp from blurring your photos. Compress and optimize images to bypass WhatsApp native compression for statuses and chats. 100% free and private.',
  keywords: [
    'whatsapp image optimizer',
    'send hd photos whatsapp',
    'whatsapp blur fix',
    'compress image for whatsapp status',
    'whatsapp dp compress',
    'high quality whatsapp images',
  ],
  openGraph: {
    title: 'WhatsApp Image Optimizer | Send HD Photos',
    description:
      'Bypass WhatsApp aggressive compression. Optimize your photos so they look crisp and clear in chats and statuses.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-whatsapp',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'WhatsApp Optimizer — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WhatsApp Image Optimizer',
    description: 'Stop the WhatsApp blur. Pre-optimize your images for perfect clarity.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-whatsapp',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WhatsApp Image Optimizer',
  description:
    'A specialized tool that resizes and strips EXIF data from images to bypass WhatsApp\'s heavy native compression algorithm, preserving clarity.',
  url: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-whatsapp',
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
    { '@type': 'Question', name: 'Why do my photos look blurry on WhatsApp status?', acceptedAnswer: { '@type': 'Answer', text: 'WhatsApp Status compresses images even more aggressively than regular chats. It requires a specific aspect ratio and file size. Our "HD Ready" setting perfectly prepares your image so that it retains its clarity when uploaded to your Status.' } },
    { '@type': 'Question', name: 'How do I send an image as a document on WhatsApp?', acceptedAnswer: { '@type': 'Answer', text: 'Sending an image as a document prevents WhatsApp from compressing it, but it strips away the preview thumbnail in the chat. Using our tool allows you to send the photo normally (with a preview) while retaining high quality.' } },
    { '@type': 'Question', name: 'Will this make my image file size bigger?', acceptedAnswer: { '@type': 'Answer', text: 'No, in fact, it usually makes the file size smaller. We strip out unnecessary metadata and apply a smart compression that retains visual fidelity while dramatically reducing megabytes.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Compressor', item: 'https://omniwebkit.com/tools/image-compressor' },
    { '@type': 'ListItem', position: 4, name: 'WhatsApp Compressor', item: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-whatsapp' },
  ],
};

export default function LayoutWhatsApp({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="compress-image-for-whatsapp" category="image" />
    </>
  );
}
