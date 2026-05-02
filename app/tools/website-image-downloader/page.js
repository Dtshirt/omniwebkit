import WebsiteImageDownloaderClient from './WebsiteImageDownloaderClient';

export const metadata = {
  title: 'Website Image Downloader — Extract & Save Images from Any URL Free',
  description:
    'Download all images from any website instantly. Paste a URL, extract every image in seconds, then save them one by one or in bulk. No login, no software — 100% free.',
  keywords: [
    'website image downloader',
    'download images from website',
    'extract images from URL',
    'bulk image downloader',
    'save images from webpage',
    'website image extractor',
    'free image downloader',
    'download all images from url',
  ],
  openGraph: {
    title: 'Website Image Downloader — Extract & Download All Images Free',
    description:
      'Paste any URL and extract every image on the page in seconds. Download images one by one or all at once — no signup required.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/website-image-downloader',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Image Downloader — Free Online Tool',
    description:
      'Extract and download all images from any website URL. Bulk download support. No signup needed.',
  },
  alternates: {
    canonical: '/tools/website-image-downloader',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Website Image Downloader',
  description:
    'Free online tool to extract and download all images from any website by URL. Supports bulk download and individual image download.',
  url: 'https://omniwebkit.com/tools/website-image-downloader',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'Extract images from any URL',
    'Bulk image download',
    'Individual image download',
    'Manual HTML paste fallback',
    'Supports JPG PNG WebP GIF SVG AVIF',
    'No login required',
    '100% browser-based — no data stored',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Download Images from a Website',
  description:
    'Step-by-step guide to extracting and downloading images from any website using a free online tool.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Copy the website URL',
      text: 'Go to the website you want images from and copy the full address from your browser bar.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Paste it and click Extract Images',
      text: 'Paste the URL into the input field and click the "Extract Images" button.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Browse the image grid',
      text: 'The tool displays every image it finds. Hover over any image to see its download button.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Download images',
      text: 'Click the download button on a single image, or select multiple and click "Download Selected" for bulk download.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Use HTML fallback if needed',
      text: 'If the site blocks the URL method, right-click the page, choose "View Page Source", copy all the HTML, and paste it into the manual input area.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I download images from any website?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most public websites work fine. Some block third-party access (CORS restrictions). If the URL method fails, use the manual HTML paste fallback — right-click the page, choose "View Page Source", copy all the code, and paste it here.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this website image downloader free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. No signup, no subscription, no watermarks. Download as many images as you like.',
      },
    },
    {
      '@type': 'Question',
      name: 'What image formats does it support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The tool extracts JPG, JPEG, PNG, GIF, WebP, SVG, and AVIF images. It also detects images in background CSS styles.',
      },
    },
    {
      '@type': 'Question',
      name: "Why can't I download a specific image?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Some images are protected by server-side settings that block external downloads. If a download fails it means the image server blocks external access. There is no way to bypass server-side restrictions.",
      },
    },
    {
      '@type': 'Question',
      name: 'Does this tool store my data?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. All processing happens in your browser. We never store the URLs you enter or the images you download.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I bulk download all images at once?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. After extraction, click "Select All" then "Download Selected" to save every found image automatically in sequence.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why are some images not showing?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Some sites use JavaScript lazy-loading — images only appear as you scroll. In that case, scroll the entire page first, then use the manual HTML paste method.',
      },
    },
  ],
};

export default function WebsiteImageDownloaderPage() {
  return (
    <>
      {/* ── Structured Data ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ── Interactive Tool ── */}
      <WebsiteImageDownloaderClient />
    </>
  );
}