import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free YouTube Thumbnail Downloader — Download HD Thumbnails in All Resolutions',
  description:
    'Download any YouTube video thumbnail for free in all available resolutions — Max HD (1280×720), 720p, 480p, 360p, and more. Paste the URL, pick your quality, and download instantly. No login.',
  keywords: [
    'youtube thumbnail downloader free',
    'download youtube thumbnail',
    'youtube thumbnail hd download',
    'youtube thumbnail grabber',
    'youtube thumbnail extractor',
    'free youtube thumbnail download online',
    'youtube thumbnail 1080p download',
    'download youtube video thumbnail',
    'youtube thumbnail max resolution',
    'youtube thumbnail downloader no watermark',
  ],
  openGraph: {
    title: 'Free YouTube Thumbnail Downloader — HD Thumbnails in All Resolutions',
    description:
      'Download YouTube video thumbnails in Max HD, 720p, 480p and more. Free, instant, no login.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/youtube-thumbnail-downloader',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'YouTube Thumbnail Downloader — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Thumbnail Downloader',
    description: 'Download HD YouTube thumbnails in all resolutions. Free, instant, no login required.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/youtube-thumbnail-downloader',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'YouTube Thumbnail Downloader',
  description:
    'Free browser-based YouTube thumbnail downloader. Paste any YouTube URL (watch, youtu.be, Shorts, embed, video ID) and download all available thumbnail sizes: maxresdefault (1280×720), hq720 (1280×720), sddefault (640×480), hqdefault (480×360), mqdefault (320×180), default (120×90), and three scrub frames. Features: real resolution detection (only shows thumbnails that actually exist), fullscreen lightbox preview, copy image URL to clipboard, loading skeleton, video info bar. 100% browser-based — images fetched directly from YouTube\'s CDN.',
  url: 'https://omniwebkit.com/tools/youtube-thumbnail-downloader',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Download thumbnails in up to 9 different resolutions',
    'Max Resolution (1280×720) thumbnail download',
    'Real resolution detection — only shows thumbnails that actually exist',
    'Fullscreen lightbox preview',
    'Copy direct image URL to clipboard',
    'Example YouTube URLs for quick testing',
    'Supports youtube.com/watch, youtu.be, Shorts, embed, and bare video ID formats',
    'Loading skeleton while fetching',
    'No login, no watermarks, no file size limits',
    '100% browser-based — no server upload',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Download a YouTube Thumbnail',
  description: 'Steps to download a YouTube video thumbnail using the OmniWebKit YouTube Thumbnail Downloader.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Copy the YouTube video URL', text: 'Go to any YouTube video and copy the URL from the browser address bar or the share button.' },
    { '@type': 'HowToStep', position: 2, name: 'Paste into the input', text: 'Paste the URL into the input box on the YouTube Thumbnail Downloader page.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Get Thumbnails', text: 'Click the button or press Enter. The tool checks all nine resolutions and shows every available thumbnail.' },
    { '@type': 'HowToStep', position: 4, name: 'Preview the thumbnails', text: 'Browse the thumbnail cards. Click the fullscreen icon to preview any thumbnail at full size.' },
    { '@type': 'HowToStep', position: 5, name: 'Download or copy URL', text: 'Click Download to save the image, or click the copy icon to copy the direct image URL.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this YouTube thumbnail downloader free?',             acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required and no usage limits.' } },
    { '@type': 'Question', name: 'Is it legal to download YouTube thumbnails?',            acceptedAnswer: { '@type': 'Answer', text: 'YouTube thumbnails are publicly accessible images served from YouTube\'s CDN. Downloading them for personal reference, research, or fair-use commentary is generally acceptable. Do not use them in ways that infringe copyright or violate YouTube\'s Terms of Service.' } },
    { '@type': 'Question', name: 'Why is the max resolution thumbnail not available?',     acceptedAnswer: { '@type': 'Answer', text: 'Not all videos have a maxresdefault thumbnail. This resolution is only present if the video creator uploaded a custom HD thumbnail. Older videos and some auto-processed videos may only have lower-resolution versions.' } },
    { '@type': 'Question', name: 'Does this tool work with YouTube Shorts?',               acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste the Shorts URL (youtube.com/shorts/...) and the tool extracts the video ID and fetches all available thumbnail resolutions.' } },
    { '@type': 'Question', name: 'Can I download thumbnails from private videos?',         acceptedAnswer: { '@type': 'Answer', text: 'No. Private and unlisted videos do not serve thumbnails from the public YouTube CDN, so no images will be found.' } },
    { '@type': 'Question', name: 'Does it store or upload my data?',                       acceptedAnswer: { '@type': 'Answer', text: 'No. The tool works entirely in your browser. It constructs YouTube image URLs locally and your browser fetches them directly from img.youtube.com. Nothing passes through our servers.' } },
    { '@type': 'Question', name: 'What URL formats are supported?',                        acceptedAnswer: { '@type': 'Answer', text: 'The tool accepts youtube.com/watch?v= URLs, youtu.be/ short links, YouTube Shorts, embed URLs, youtube-nocookie.com links, and plain 11-character video IDs.' } },
    { '@type': 'Question', name: 'Why does Download open the image in a new tab?',         acceptedAnswer: { '@type': 'Answer', text: 'YouTube\'s CDN does not include CORS headers that allow forced download in all browsers. If it opens in a new tab, right-click the image and choose "Save image as" to save it.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'YouTube Thumbnail Downloader', item: 'https://omniwebkit.com/tools/youtube-thumbnail-downloader' },
  ],
};

export default function YouTubeThumbnailDownloaderLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="youtube-thumbnail-downloader" category="image" />
    </>
  );
}
