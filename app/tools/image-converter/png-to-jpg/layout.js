import Script from 'next/script';
export const metadata = {
  title: 'PNG to JPG Converter — Free Online Tool',
  description:
    'Convert PNG images to JPG format online for free. Compress image sizes significantly while automatically filling transparent backgrounds with white. No server upload required.',
  keywords: [
    'png to jpg',
    'convert png to jpg',
    'png to jpg converter',
    'png to jpeg',
    'free png to jpg',
    'batch png to jpg converter',
    'png to jpg online',
    'remove png transparency'
  ],
  openGraph: {
    title: 'PNG to JPG Converter — Free Online Tool',
    description:
      'Convert PNG images to JPG format online for free. Automatically replaces transparent backgrounds with white. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/png-to-jpg',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PNG to JPG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PNG to JPG Converter — Free Online Tool',
    description: 'Convert PNG to JPG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/png-to-jpg',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PNG to JPG Converter',
  description:
    'Free browser-based PNG to JPG converter. Drag and drop PNG files, adjust quality, and download JPG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/png-to-jpg',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert PNG to JPG format',
    'Batch conversion — multiple files at once',
    'Quality slider for JPG output (10–100%)',
    'Automatically fills transparent backgrounds with white',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert PNG to JPG',
  description: 'Steps to convert your PNG files to the universally supported JPG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload PNG files', text: 'Drag and drop one or more PNG files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust quality', text: 'Use the quality slider to set your desired compression level.' },
    { '@type': 'HowToStep', position: 3, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download individual JPG files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'PNG to JPG', item: 'https://omniwebkit.com/tools/image-converter/png-to-jpg' },
  ],
};

export default function PngToJpgLayout({ children }) {
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
                "name": "Is PNG to JPG conversion free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, completely free. There's no hidden cost, no premium tier you need to unlock, and no limit on the number of conversions. You can convert as many PNG files as you need at no charge."
                }
              },
              {
                "@type": "Question",
                "name": "Does converting PNG to JPG reduce the file size?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Almost always, yes — and often dramatically. A PNG that's 4MB can easily drop to 300–600KB as a JPG, depending on the image content and quality setting you choose. Photos compress the most. Graphics with flat colors or text compress less."
                }
              },
              {
                "@type": "Question",
                "name": "Will I lose image quality when converting PNG to JPG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "At higher quality settings (80–90%), the difference is nearly invisible to the naked eye. At lower settings, you'll start to notice soft edges and slight color banding, especially on text or sharp lines. For most web photos, the quality loss at 80% is acceptable — and the file size savings are worth it."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert multiple PNG files at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our tool currently processes one file at a time. If you need to batch convert a large number of files, tools like IrfanView or Squoosh support bulk processing."
                }
              },
              {
                "@type": "Question",
                "name": "Does PNG to JPG conversion affect the image dimensions?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. The image dimensions stay exactly the same unless you explicitly resize the image. A 1920x1080 PNG comes out as a 1920x1080 JPG. Only the file format and compression change."
                }
              },
              {
                "@type": "Question",
                "name": "Why does my converted JPG have a white background when the PNG was transparent?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "JPG doesn't support transparency — it's a format limitation, not a tool bug. Transparent areas in your PNG get replaced with a solid color, usually white, during conversion. If you need to keep transparency, save the file as PNG or WebP instead."
                }
              },
              {
                "@type": "Question",
                "name": "Is my image uploaded to a server when I use this tool?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. The entire conversion happens locally in your browser. Your image is never sent to any server, stored anywhere, or seen by anyone. This tool is fully private by design."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert JPG back to PNG after converting?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, you can — but the original data removed during JPG compression won't come back. Converting JPG to PNG only wraps the compressed data in a lossless format. The file becomes larger, but the quality does not improve."
                }
              },
              {
                "@type": "Question",
                "name": "What's the maximum file size the tool can handle?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The tool handles most standard image sizes without issue — files up to around 20–30MB work well. Very large RAW or high-resolution files may slow down older devices because processing happens locally in the browser."
                }
              },
              {
                "@type": "Question",
                "name": "Is JPG or PNG better for SEO?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "JPG is generally better for SEO when it comes to photographs because smaller file sizes improve page speed, which is a ranking factor. However, image optimization also depends on filenames, alt text, dimensions, and overall page performance."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use the converted JPG for commercial purposes?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Converting a file to another format does not change your rights to the image. If you own the original PNG, you also own the converted JPG."
                }
              },
              {
                "@type": "Question",
                "name": "Why do some PNG files not compress much when converted to JPG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on the image content. Photos with complex color variation compress very well in JPG, while screenshots, diagrams, and graphics with flat colors or sharp edges do not compress as aggressively."
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
