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
  '@type': 'SoftwareApplication',
  name: 'Website Image Downloader',
  description:
    'Free online tool to extract and download all images from any website by URL. Supports bulk download and individual image download.',
  url: 'https://omniwebkit.com/tools/website-image-downloader',
  applicationCategory: 'WebApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'Lazydesigners',
    url: 'https://github.com/Dtshirt/omniwebkit'
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

      {/* ── SEO Content ── */}
      <div className="mt-16 prose-premium max-w-4xl mx-auto px-4 pb-16">
        <h2>About the Website Image Downloader</h2>
        <p>
          When you need to extract multiple pictures from a webpage, right-clicking each one is a massive waste of time. This <strong>website image downloader</strong> automates the entire process. It scans the provided URL, extracts every image hidden in the HTML or CSS, and presents them in a clean grid. From there, you can download a single file or grab the entire batch instantly. 
        </p>

        <h2>How to Use This Tool</h2>
        <p>
          Getting your images takes only a few clicks. Here is the exact process:
        </p>
        <ol>
          <li><strong>Grab your link:</strong> Copy the full URL of the webpage you want to extract images from.</li>
          <li><strong>Start the scanner:</strong> Paste the link into the box above and hit the extract button.</li>
          <li><strong>Download your files:</strong> Browse the resulting grid. You can download individual images or select multiple for a bulk download.</li>
        </ol>

        <div className="bg-primary-50 dark:bg-primary-900/20 p-6 rounded-xl border border-primary-100 dark:border-primary-800 my-8">
          <h3>100% Client-Side Processing</h3>
          <p className="m-0">
            Total privacy is built into this tool. The image extraction happens directly through your browser connection. We do not store your target URLs, we do not intercept the images, and we do not keep logs. You get fast, private bulk downloads.
          </p>
        </div>

        <h2>Core Features</h2>
        <ul>
          <li><strong>Bulk Downloading:</strong> Select all detected files and download them in one click.</li>
          <li><strong>Comprehensive Detection:</strong> Pulls standard image tags as well as background images embedded in CSS.</li>
          <li><strong>Format Support:</strong> Automatically handles JPG, PNG, WebP, SVG, AVIF, and GIF files.</li>
          <li><strong>Manual HTML Fallback:</strong> If a site blocks external requests, you can paste the raw page source directly to bypass the block.</li>
        </ul>

        <h2>Technical Specifications</h2>
        <p>
          For those interested in the technical workflow, here is how the image grabber operates:
        </p>
        <ul>
          <li><strong>Processing Method:</strong> Uses DOM parsing and regex to isolate <code>src</code> attributes and background-image URLs.</li>
          <li><strong>CORS Handling:</strong> Routes through a secure proxy to bypass standard Cross-Origin Resource Sharing restrictions.</li>
          <li><strong>Lazy-Load Limitation:</strong> Images that require scrolling (JavaScript lazy-loading) will not appear unless you use the raw HTML fallback method.</li>
          <li><strong>Max Batch Size:</strong> Tested successfully with batches of 200+ high-resolution images.</li>
        </ul>

        <h2>Frequently Asked Questions</h2>
        <h3>Can I download images from any website?</h3>
        <p>
          Most public websites work perfectly. However, if a server has strict anti-scraping blocks or requires a login, the URL method will fail. In those cases, use the manual HTML paste option instead.
        </p>

        <h3>Why didn't it find all the pictures on the page?</h3>
        <p>
          This usually happens because of lazy-loading. If images only load as you scroll down a page, the static HTML scanner will not see them. To fix this, scroll through the entire page first, copy the raw source code, and use the manual paste feature.
        </p>

        <h3>Does this tool cost money or have limits?</h3>
        <p>
          It is completely free with no usage limits. You do not need an account, and we do not add watermarks or restrict your download speeds.
        </p>

        <hr />

        <p><em>Engineered by Christopher – Focused on secure, client-side web utilities. <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer">Lazydesigners</a></em></p>
      </div>
    </>
  );
}