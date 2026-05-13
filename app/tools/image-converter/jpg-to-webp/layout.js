import Script from 'next/script';

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
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is it free to convert JPG to WebP on this tool?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, completely free. There's no usage cap, no paid tier, and no sign-up required. You can convert as many images as you need without hitting a limit or being asked for a credit card."
          }
        },
        {
          "@type": "Question",
          "name": "Will I lose image quality when converting JPG to WebP?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "At a quality setting of 80 or above, the visual difference between a JPG and WebP is imperceptible to the naked eye — even on high-resolution screens. You're not trading quality for size. You're getting a smarter compression algorithm that achieves the same result with fewer bytes. That said, if you push quality below 65–70, you'll start to see compression artifacts on gradients and detailed textures. Stick to 75–85 for the best balance."
          }
        },
        {
          "@type": "Question",
          "name": "Does converting to WebP affect my SEO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — positively. WebP images are smaller, which means faster page load times. Google uses page speed as a ranking factor, and specifically measures Largest Contentful Paint (LCP) — one of the Core Web Vitals. Serving smaller images directly improves your LCP score. Faster pages also have lower bounce rates, which further helps SEO performance."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert multiple JPGs to WebP at once?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Our converter supports batch uploads. Select multiple JPG files at once and convert them all in one go. Each file is converted individually so you can download them separately or as a zip."
          }
        },
        {
          "@type": "Question",
          "name": "Is WebP supported by all browsers?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "WebP is supported by all major modern browsers — Chrome, Firefox, Edge, Opera, and Safari (version 14+, released in 2020). The only notable holdout is Internet Explorer, which doesn't support WebP at all. For websites that need broad compatibility, use the HTML <picture> element to serve WebP to supported browsers with a JPG fallback for others. Most modern web frameworks and CDNs handle this automatically."
          }
        },
        {
          "@type": "Question",
          "name": "Are my uploaded images stored or shared?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Your images are processed entirely in your browser using client-side JavaScript. Nothing is uploaded to our servers. Once you close the tab, the images are gone — we don't have access to them at any point."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert WebP back to JPG if needed?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Our image converter tool supports multiple format conversions, including WebP back to JPG or PNG. Just choose the output format you need. Keep in mind that converting a lossy WebP back to JPG will apply a second round of compression — always keep your original JPG as a backup."
          }
        },
        {
          "@type": "Question",
          "name": "What's the maximum file size I can convert?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The tool handles images up to 20MB per file with no issues. For very large RAW files or multi-hundred-megabyte batches, a desktop tool like GIMP, Squoosh, or ImageMagick might be more appropriate — they process locally without any size constraints."
          }
        },
        {
          "@type": "Question",
          "name": "How does WebP compare to AVIF?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AVIF is a newer format that achieves even better compression than WebP — sometimes 20–30% smaller at the same quality. But AVIF has two practical downsides right now: slower encoding time and still-growing browser support. WebP hits a better sweet spot for most real-world use cases: excellent compression, near-universal browser support, and fast conversion. For most websites and tools today, WebP is the smarter choice."
          }
        },
        {
          "@type": "Question",
          "name": "Does WebP support transparency like PNG does?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. WebP supports an alpha channel, which means transparent backgrounds work. If your JPG doesn't have transparency (JPG never does), the converted WebP won't either — but if you're converting PNGs with transparency to WebP, that transparency carries over perfectly."
          }
        },
        {
          "@type": "Question",
          "name": "Can I use WebP images in WordPress?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. WordPress has supported WebP uploads natively since version 5.8. You can upload WebP images directly to your media library just like JPGs or PNGs. Some themes and page builders may need a minor update for full compatibility, but on any modern WordPress installation, WebP just works."
          }
        },
        {
          "@type": "Question",
          "name": "What quality setting should I use for website images?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For most website images, a quality setting of 75–82 is the sweet spot. Hero images and portfolio photos can go up to 85 for extra sharpness. Product thumbnails and background images can comfortably drop to 70 without visible loss. The default setting in our tool is 80, which works well for the vast majority of use cases."
          }
        }
      ]
    })
  }}
/>
      {children}
    </>
  );
}
