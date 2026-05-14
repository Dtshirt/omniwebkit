import Script from 'next/script';
export const metadata = {
  title: 'PNG to ICO Converter — Free Online Favicon Generator',
  description:
    'Convert PNG to ICO format online for free. Instantly generate favicons and Windows icons with perfect transparency. No server upload required.',
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
          "name": "What is a PNG to ICO converter?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A PNG to ICO converter is a tool that takes a standard PNG image and converts it into the ICO format — the file type used for favicons and Windows desktop icons. Unlike a plain PNG, an ICO file can store multiple image sizes inside one file, so browsers and operating systems can pick the right size automatically depending on where the icon is displayed."
          }
        },
        {
          "@type": "Question",
          "name": "Is it free to convert PNG to ICO online?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, this tool is completely free. There are no hidden charges, no account required, and no limit on how many PNG files you can convert. You can use it as many times as you need without any restrictions."
          }
        },
        {
          "@type": "Question",
          "name": "Will my PNG file be uploaded to a server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. The conversion happens directly in your browser using local processing. Your PNG file never leaves your device, which means your images stay completely private and secure."
          }
        },
        {
          "@type": "Question",
          "name": "What size should my PNG be before converting to ICO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For the best results, start with a PNG that's at least 256x256 pixels — ideally 512x512 or larger. The tool will scale it down cleanly to whatever ICO sizes you select. If you start with a small PNG like 32x32 and try to generate a 256x256 ICO, the output will look blurry because you can't add detail that wasn't in the original image."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert a PNG with a transparent background to ICO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. This tool fully supports transparent PNG files. The transparency is preserved in the ICO output, so your icon will look clean on any background color — in browser tabs, on the Windows taskbar, in bookmarks, and anywhere else it's displayed."
          }
        },
        {
          "@type": "Question",
          "name": "What ICO sizes should I use for a favicon?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "For a basic favicon, 16x16 and 32x32 are the minimum. If you want full browser and OS coverage, include 48x48 as well. For Windows desktop or application icons, also add 64x64, 128x128, and 256x256. When in doubt, select all available sizes — the file size increase is minimal and you get much better compatibility."
          }
        },
        {
          "@type": "Question",
          "name": "Why can't I just use a PNG as a favicon instead of ICO?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Modern browsers do support PNG favicons, but ICO is still more universally compatible — especially in older browsers, Windows file explorer, desktop shortcuts, and bookmark managers. An ICO file also stores multiple sizes in one file, which means the right size is always available without extra effort. For the widest compatibility with the least risk, ICO is still the safest choice for favicons."
          }
        },
        {
          "@type": "Question",
          "name": "Does converting PNG to ICO reduce image quality?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "At larger sizes, quality is generally excellent when your source PNG is high resolution. At 16x16, some detail will naturally be lost because of the extremely small icon size. Simple, bold designs hold up well, while complex artwork becomes harder to recognize."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert multiple PNG files to ICO at once?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "This depends on the tool's batch processing feature. If batch conversion is available, you'll see the option to upload multiple files at once. For single favicon creation, converting one file at a time is usually the cleanest workflow."
          }
        },
        {
          "@type": "Question",
          "name": "What's the difference between ICO and PNG for Windows icons?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Windows uses ICO files natively for application icons, desktop shortcuts, taskbar items, and file associations. PNG files are not recognized as Windows icons unless embedded inside an ICO container."
          }
        },
        {
          "@type": "Question",
          "name": "How do I add a favicon ICO file to my website?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Place your favicon.ico file in the root directory of your website and add a link tag inside the head section of your HTML: <link rel='icon' href='/favicon.ico' type='image/x-icon'>."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert a JPG or JPEG to ICO instead of PNG?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Most ICO converters support JPG and JPEG files as well. However, JPG does not support transparency, so PNG is the better choice when you need transparent icons."
          }
        },
        {
          "@type": "Question",
          "name": "Why does my converted ICO file look blurry?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A blurry ICO usually means the source PNG was too small. If you upload a low-resolution image and generate larger icon sizes, the tool must upscale the image, which introduces blur."
          }
        },
        {
          "@type": "Question",
          "name": "Is ICO format still relevant in 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. ICO remains the default favicon format supported across browsers and operating systems. Even with support for PNG and SVG favicons, ICO is still the most universally compatible option."
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
