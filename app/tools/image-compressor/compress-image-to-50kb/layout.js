import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Compress Image to 50KB Online Free | Reduce Photo Size to 50KB',
  description:
    'Free online tool to compress any image strictly under 50KB. Perfect for passports, signatures, and job applications. Browser-based, 100% private, no server upload required.',
  keywords: [
    'compress image to 50kb',
    'reduce image size to 50kb',
    '50kb photo converter',
    'passport photo 50kb',
    'signature resize 50kb',
    'image under 50kb online',
  ],
  openGraph: {
    title: 'Compress Image to 50KB Online Free',
    description:
      'Perfect for job applications and official forms. Get your image precisely under 50KB without making it blurry.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-compressor/compress-image-to-50kb',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Compress to 50KB — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compress Image to 50KB Online Free',
    description: 'Easily resize and compress your photos to exactly 50KB or less.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-compressor/compress-image-to-50kb',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Compress Image to 50KB Tool',
  description:
    'A specialized tool that automatically reduces quality and downscales dimensions until an image is precisely under 50KB (or any custom target size).',
  url: 'https://omniwebkit.com/tools/image-compressor/compress-image-to-50kb',
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
    { '@type': 'Question', name: 'Will a 50KB image look blurry?', acceptedAnswer: { '@type': 'Answer', text: 'For passport photos, headshots, or scanned signatures, a 50KB image will look perfectly sharp. However, if you attempt to compress a massive, highly detailed landscape photo down to 50KB, you may notice some pixelation. Our tool balances dimensions and quality to give you the clearest possible result.' } },
    { '@type': 'Question', name: 'Can I compress an image to 20KB instead?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely! Simply change the Target Size input from 50KB to 20KB (or any other number). The algorithm will adjust to hit your new target.' } },
    { '@type': 'Question', name: 'Why is my form still rejecting the image?', acceptedAnswer: { '@type': 'Answer', text: 'Some portals check BOTH the file size (e.g., under 50KB) and the dimensions (e.g., exactly 200x200 pixels). Use the Max Dimensions fields in the settings panel to ensure your image meets the required dimensions.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Compressor', item: 'https://omniwebkit.com/tools/image-compressor' },
    { '@type': 'ListItem', position: 4, name: 'Compress to 50KB', item: 'https://omniwebkit.com/tools/image-compressor/compress-image-to-50kb' },
  ],
};

export default function Layout50KB({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="compress-image-to-50kb" category="image" />
    </>
  );
}
