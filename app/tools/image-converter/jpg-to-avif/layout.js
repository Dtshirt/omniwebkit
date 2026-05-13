import Script from 'next/script';
export const metadata = {
  title: 'JPG to AVIF Converter — Free Online Tool',
  description:
    'Convert JPG images to AVIF format online for free. Reduce file size significantly while maintaining image quality. No server upload required.',
  keywords: [
    'jpg to avif',
    'convert jpg to avif',
    'jpg to avif converter',
    'free jpg to avif',
    'batch jpg to avif converter',
    'jpg to avif online',
    'reduce jpg size'
  ],
  openGraph: {
    title: 'JPG to AVIF Converter — Free Online Tool',
    description:
      'Convert JPG images to AVIF format online for free. Reduce file size and improve speed. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/jpg-to-avif',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to AVIF Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JPG to AVIF Converter — Free Online Tool',
    description: 'Convert JPG to AVIF directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/jpg-to-avif',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JPG to AVIF Converter',
  description:
    'Free browser-based JPG to AVIF converter. Drag and drop JPG files, adjust quality, and download AVIF instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/jpg-to-avif',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert JPG to AVIF format',
    'Batch conversion — multiple files at once',
    'Quality slider for AVIF output (10–100%)',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert JPG to AVIF',
  description: 'Steps to convert your JPG files to the modern AVIF format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload JPG files', text: 'Drag and drop one or more JPG files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust quality', text: 'Use the quality slider to set your desired compression level. Lower quality gives a smaller file size.' },
    { '@type': 'HowToStep', position: 3, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download individual AVIF files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'JPG to AVIF', item: 'https://omniwebkit.com/tools/image-converter/jpg-to-avif' },
  ],
};

export default function JpgToAvifLayout({ children }) {
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
          "name": "Is AVIF actually better than JPG — or is it just hype?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AVIF consistently delivers 40–55% smaller file sizes compared to JPEG at the same visual quality. It uses AV1-based compression which handles color gradients, skin tones, and fine detail more cleanly than JPEG's older DCT algorithm."
          }
        },
        {
          "@type": "Question",
          "name": "Does converting JPG to AVIF lose quality?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "At quality settings of 65–80, most people cannot spot the difference between an AVIF and the original JPG. AVIF compression artifacts tend to be smoother than JPEG's. Lossless AVIF is also available for zero quality loss."
          }
        },
        {
          "@type": "Question",
          "name": "Which browsers support AVIF in 2025?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "All major browsers support AVIF natively — Chrome (v85+), Firefox (v93+), Safari (v16+), Edge, and Opera. This covers roughly 96%+ of global web traffic."
          }
        },
        {
          "@type": "Question",
          "name": "What's the best quality setting when converting to AVIF?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For most web images, a quality setting of 70–75 is the sweet spot — sharp, small, with no visible degradation. Product shots work best at 75–82; hero images at 80–85; thumbnails at 55–65."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert AVIF back to JPG if I need to?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Use an AVIF to JPG converter to reverse the process. Keep in mind that each re-encoding with lossy compression introduces a small amount of quality loss, so always save your original JPG files as a backup."
          }
        },
        {
          "@type": "Question",
          "name": "Does AVIF help with SEO and page speed?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Smaller AVIF files improve page load times, which directly impacts Core Web Vitals scores — especially LCP. Google's Lighthouse explicitly recommends next-gen formats like AVIF, and better Core Web Vitals contribute to improved search rankings."
          }
        },
        {
          "@type": "Question",
          "name": "Is AVIF good for all image types?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AVIF is best for photographs with continuous color. For flat graphics and logos, SVG is better. For screenshots with sharp text, use PNG or lossless AVIF. AVIF also supports transparency (alpha channel) as a PNG replacement."
          }
        },
        {
          "@type": "Question",
          "name": "Is the image converter tool free to use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The image converter is completely free — no account required, no watermarks, no hidden limits. Files are processed in the browser and never stored on a server."
          }
        },
        {
          "@type": "Question",
          "name": "How does AVIF compare to WebP?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "AVIF files are typically 20–30% smaller than WebP at the same visual quality. AVIF also supports HDR and a wider color gamut. WebP has more mature tooling support, making it a good fallback format."
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

