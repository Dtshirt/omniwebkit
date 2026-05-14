import Script from 'next/script';
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
                "name": "Can I convert multiple PNG files to WebP at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. This tool supports bulk conversion — just select multiple PNG files at once or drag and drop a whole folder. You'll be able to download all converted WebP files as a single ZIP archive. There's no strict limit, though very large batches with high-resolution files may slow your browser down depending on your device's RAM."
                }
              },
              {
                "@type": "Question",
                "name": "Will converting PNG to WebP reduce image quality?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on the quality setting you choose. At 80–90%, the difference is invisible for photos and most graphics. For screenshots, UI mockups, or text-heavy images, use 90–95% or switch to lossless mode to keep edges sharp. Lossless WebP gives you zero quality loss while still reducing file sizes compared to PNG."
                }
              },
              {
                "@type": "Question",
                "name": "Does WebP support transparent backgrounds like PNG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, WebP fully supports transparency through its alpha channel. If your PNG has a transparent background, the transparency will remain intact after conversion to WebP."
                }
              },
              {
                "@type": "Question",
                "name": "Is my PNG file safe when I convert it here?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Your files never leave your device. The conversion runs entirely in your browser using local processing — no upload happens and no server touches your images. Once you close the tab, nothing is stored."
                }
              },
              {
                "@type": "Question",
                "name": "What quality setting should I use for PNG to WebP conversion?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For most photographs and general web images, 80–85% is the sweet spot with strong file size reduction and no visible quality loss. For product images, use 85–90%. For screenshots, text graphics, or sharp edges, use 90–95% or lossless mode."
                }
              },
              {
                "@type": "Question",
                "name": "Is WebP supported by all browsers in 2026?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Chrome, Firefox, Safari, Edge, Opera, and all major mobile browsers support WebP natively. Browser support is effectively universal, covering more than 98% of global users."
                }
              },
              {
                "@type": "Question",
                "name": "How much smaller will my WebP file be compared to the original PNG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Photographs typically shrink by 60–91%, UI screenshots by 50–75%, and logos or flat graphics by 30–60%. The exact reduction depends on the image content and selected quality setting."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert WebP back to PNG if I need to?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, but keep your original PNG files. If you used lossy WebP compression, converting back to PNG will not restore the original quality — it will only create a lossless copy of the compressed WebP."
                }
              },
              {
                "@type": "Question",
                "name": "Why does Google recommend WebP for SEO?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "WebP files are smaller and load faster, which improves Core Web Vitals metrics like Largest Contentful Paint. Faster loading images improve page speed and can positively impact SEO rankings and user experience."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between lossy and lossless WebP?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Lossless WebP preserves every pixel exactly as the original image, while lossy WebP removes visually imperceptible data to achieve much smaller file sizes. Lossless is best for screenshots and diagrams, while lossy works well for photos and general web graphics."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use WebP images in WordPress?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. WordPress has supported WebP natively since version 5.8. You can upload WebP files directly into the media library just like PNG or JPEG images."
                }
              },
              {
                "@type": "Question",
                "name": "Does this PNG to WebP converter work on mobile?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. The converter works on phones, tablets, and desktops using any modern browser. You can upload images directly from your mobile device and convert them locally inside the browser."
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
