import Script from 'next/script';

export const metadata = {
  title: 'HEIC Image Viewer — Free Online Viewer',
  description:
    'View HEIC, AVIF, WebP, and other unsupported image formats directly in your browser. Fast, secure, and private online image viewer. No software download required.',
  keywords: [
    'HEIC viewer',
    'view HEIC online',
    'open HEIC windows',
    'AVIF viewer',
    'WebP viewer',
    'free image viewer',
    'browser image viewer'
  ],
  openGraph: {
    title: 'HEIC Image Viewer — Free Online Viewer',
    description:
      'Instantly view HEIC and other unsupported image formats directly in your web browser. 100% private and secure.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/heic-image-viewer',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC Image Viewer — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HEIC Image Viewer — Free Online Viewer',
    description: 'View HEIC and AVIF files directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/heic-image-viewer',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'HEIC Image Viewer',
  description:
    'Free browser-based image viewer for HEIC, AVIF, and WebP files. Decodes images locally for fast, secure, and private viewing without installing any software.',
  url: 'https://omniwebkit.com/tools/heic-image-viewer',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'View HEIC/HEIF files natively in the browser',
    'View AVIF and WebP files natively',
    'Batch upload multiple images into a gallery',
    'Fullscreen lightbox viewer',
    'No server upload — 100% browser-based decoding'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to View HEIC files on Windows',
  description: 'Steps to instantly view Apple HEIC photos on any device using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload HEIC files', text: 'Drag and drop one or more HEIC, AVIF, or WebP files onto the drop zone.' },
    { '@type': 'HowToStep', position: 2, name: 'View Gallery', text: 'The images will be decoded and rendered in a gallery format instantly.' },
    { '@type': 'HowToStep', position: 3, name: 'Fullscreen Viewing', text: 'Click on any image to open it in a fullscreen lightbox.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'HEIC Image Viewer', item: 'https://omniwebkit.com/tools/heic-image-viewer' },
  ],
};

export default function HEICViewerLayout({ children }) {
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
                "name": "Is this HEIC viewer really free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, 100% free. No hidden costs, no premium plans, and no credit card required. View as many HEIC files as you want without paying anything."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to install anything to view HEIC files?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. Our HEIC viewer works directly in your web browser. Just open this page, drop your HEIC file in, and your photo is ready to view. Nothing to download or install."
                }
              },
              {
                "@type": "Question",
                "name": "Can I view HEIC files on Windows using this tool?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Our viewer works perfectly on Windows. Open it in Chrome, Firefox, or Edge. Your HEIC photos will load and display instantly without any codec or software install."
                }
              },
              {
                "@type": "Question",
                "name": "Can I view HEIC photos on Android?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Open our HEIC viewer in Chrome on your Android phone or tablet. Drop in your HEIC file and view it right away. Works just as well on Android as on desktop."
                }
              },
              {
                "@type": "Question",
                "name": "Is my photo uploaded to your server?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. Your photo is never uploaded to our server. Everything is processed locally in your browser. Your HEIC file never leaves your device. Your privacy is fully protected."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between HEIC and HEIF?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HEIF is the name of the image format standard. HEIC is the file extension that Apple uses for HEIF files on iPhones and iPads. They refer to the same type of file."
                }
              },
              {
                "@type": "Question",
                "name": "Can I view multiple HEIC files at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Right now, our viewer opens one HEIC file at a time. You can view files one by one without any limit on how many you view in a session."
                }
              },
              {
                "@type": "Question",
                "name": "What iPhone models create HEIC files?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "iPhones running iOS 11 or later save photos as HEIC by default. This includes iPhone 8, iPhone X, and all newer models. iPads running iPadOS 11 or later also save photos as HEIC."
                }
              },
              {
                "@type": "Question",
                "name": "Can I save the photo after viewing it?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our viewer is designed for previewing HEIC files. If you want to save the photo in a format that works on your device, use our converter tools to get a JPG or PNG file."
                }
              },
              {
                "@type": "Question",
                "name": "Why does Windows not support HEIC files by default?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Windows was built before HEIC became widely used. Microsoft has released an optional HEIC codec through the Windows Store, but it is not installed by default. Our online viewer skips this problem entirely by working in the browser."
                }
              },
              {
                "@type": "Question",
                "name": "Can I view Live Photos from iPhone?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Live Photos from iPhones contain a HEIC still image and a short video clip. Our viewer can display the still HEIC image. The video portion of a Live Photo may not play in the viewer."
                }
              },
              {
                "@type": "Question",
                "name": "Does the viewer support HDR photos?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Many modern iPhones take HDR photos saved as HEIC files. Our viewer can display HDR HEIC photos. The display quality depends on your monitor and browser settings."
                }
              },
              {
                "@type": "Question",
                "name": "Is there a file size limit?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Our viewer can handle large HEIC files including high-resolution photos from the latest iPhone cameras. Very large files may take a few extra seconds to load, but they will open without any problem."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this on a Chromebook?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Open our HEIC viewer in Chrome on your Chromebook and drop in your HEIC file. It will open and display right in your browser without any issues."
                }
              },
              {
                "@type": "Question",
                "name": "What if my HEIC file will not open in the viewer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Make sure the file has a .heic or .heif extension. If it came from a third-party app, it may be in a different format. Try our HEIC to JPG or HEIC to PNG converter tools if you have any trouble."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need a fast internet connection?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You need a normal connection to load the page. After that, the viewing process happens locally in your browser. A slow connection will not affect how fast your HEIC photo opens."
                }
              },
              {
                "@type": "Question",
                "name": "How is a HEIC viewer different from a HEIC converter?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "A HEIC viewer lets you open and look at the photo without changing it. A HEIC converter changes the file format from HEIC to JPG or PNG. Use the viewer if you just want to see the photo. Use the converter if you need to share, edit, or print it."
                }
              }
            ]
          }),
        }}
      />
      {children}
    </>
  );
}
