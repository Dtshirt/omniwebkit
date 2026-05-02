import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Web Vitals Image Compressor | Convert JPG/PNG to WebP Fast',
  description:
    'Supercharge your website speed and Core Web Vitals. Convert and compress heavy JPGs and PNGs to Next-Gen WebP formats instantly in your browser.',
  keywords: [
    'web vitals image compressor',
    'optimize images for website',
    'convert jpg to webp',
    'core web vitals image optimization',
    'pagespeed image compressor',
    'next gen image formats online',
  ],
  openGraph: {
    title: 'Web Vitals Image Compressor | Boost PageSpeed',
    description:
      'Ace your Google PageSpeed Insights. Convert and compress images to Next-Gen formats like WebP for faster loading times.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-website-fast',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Web Vitals Compressor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Vitals Image Compressor',
    description: 'Convert and compress your assets to Next-Gen WebP formats instantly.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-website-fast',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Web Vitals Image Compressor',
  description:
    'An advanced image converter that forces Next-Gen WebP format conversion to maximize Google PageSpeed Insights and Core Web Vitals scores.',
  url: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-website-fast',
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
    { '@type': 'Question', name: 'What is WebP and does my website support it?', acceptedAnswer: { '@type': 'Answer', text: 'WebP is an image format developed by Google that provides superior lossless and lossy compression. Today, over 97% of all web browsers globally support WebP natively. WordPress, Shopify, and modern frameworks like Next.js all support WebP images out of the box.' } },
    { '@type': 'Question', name: 'How to Fix "Serve Images in Next-Gen Formats" in PageSpeed Insights?', acceptedAnswer: { '@type': 'Answer', text: 'Google PageSpeed Insights flags sites that still use heavy JPEGs and PNGs. To fix this error, simply drag your flagged images into our tool, ensure the "Next-Gen WebP" toggle is active, and replace your old images with the generated WebP files.' } },
    { '@type': 'Question', name: 'Does compressing images affect my image SEO?', acceptedAnswer: { '@type': 'Answer', text: 'Positively! Search engines prioritize fast-loading pages. As long as you retain your alt text and descriptive file names when you re-upload the compressed images, your Image SEO will actually improve due to faster crawl and render times.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Compressor', item: 'https://omniwebkit.com/tools/image-compressor' },
    { '@type': 'ListItem', position: 4, name: 'Web Vitals Optimizer', item: 'https://omniwebkit.com/tools/image-compressor/compress-image-for-website-fast' },
  ],
};

export default function LayoutWebVitals({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="compress-image-for-website-fast" category="image" />
    </>
  );
}
