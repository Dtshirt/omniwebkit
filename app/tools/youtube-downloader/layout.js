import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free YouTube Video Downloader — Download HD Videos, MP3 Audio & Thumbnails',
  description:
    'Download YouTube videos in HD, 4K, 1080p, 720p, or audio-only MP3. Free online YouTube downloader — no install, no login. Supports all URL formats including Shorts and youtu.be links.',
  keywords: [
    'youtube video downloader free',
    'download youtube videos online',
    'youtube to mp4 free',
    'youtube hd video downloader',
    'youtube downloader no software',
    'online youtube video saver',
    'download youtube shorts',
    'youtube audio downloader',
    'youtube 1080p downloader free',
    'free youtube video download online',
  ],
  openGraph: {
    title: 'Free YouTube Video Downloader — HD, MP3, Thumbnails',
    description:
      'Download YouTube videos in HD, 4K, or audio-only format. Free, no install, no account required.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/youtube-downloader',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'YouTube Video Downloader — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free YouTube Video Downloader',
    description: 'Download YouTube videos in HD, 4K, or audio-only. Free, no install, no login.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/youtube-downloader',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'YouTube Video Downloader',
  description:
    'Free online YouTube video downloader. Paste any YouTube URL to see all available download formats: combined Video + Audio streams, Video-only streams, and Audio-only streams, at every available quality from 4K down to 144p. Also downloads video thumbnails in 4 resolutions via the /api/media-proxy server endpoint. Built on ytdl-core. Supports youtube.com/watch, youtu.be, Shorts, and embed URLs. 100% browser-based interface — no extension, no desktop app, no login.',
  url: 'https://omniwebkit.com/tools/youtube-downloader',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Download YouTube videos in all available qualities (4K, 1080p, 720p, 480p, 360p, 144p)',
    'Video + Audio combined streams (ready-to-play)',
    'Video-only streams for video editors',
    'Audio-only streams (no video)',
    'Video thumbnail download in 4 resolutions (Max HD, SD, HQ, MQ)',
    'Video metadata: title, author, view count, duration',
    'Format information: quality, container type, file size, frame rate',
    'Supports youtube.com/watch, youtu.be, Shorts, and embed URLs',
    'No extension, no software, no account required',
    '100% browser-based interface',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Download a YouTube Video',
  description: 'Steps to download a YouTube video using the OmniWebKit YouTube Downloader.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Copy the YouTube URL',    text: 'Open the YouTube video and copy the URL from the browser address bar or the Share button.' },
    { '@type': 'HowToStep', position: 2, name: 'Paste the URL',           text: 'Paste the URL into the input field on the YouTube Downloader page.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Get Video',         text: 'Click the red button or press Enter to fetch all available download formats.' },
    { '@type': 'HowToStep', position: 4, name: 'Choose a format',         text: 'Browse the Video + Audio, Video Only, and Audio Only tabs. Each format shows quality, file type, and size.' },
    { '@type': 'HowToStep', position: 5, name: 'Click Download',          text: 'Click the Download button on the quality you want. The file saves directly to your device.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this YouTube downloader free?',                    acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required and no download limits.' } },
    { '@type': 'Question', name: 'Is it legal to download YouTube videos?',              acceptedAnswer: { '@type': 'Answer', text: 'Downloading YouTube videos for personal, offline use of freely available public content is generally acceptable. Do not redistribute downloaded content or use it in ways that violate copyright law or YouTube\'s Terms of Service.' } },
    { '@type': 'Question', name: 'Why is 1080p not in the Video + Audio tab?',          acceptedAnswer: { '@type': 'Answer', text: 'YouTube serves 1080p and above as separate video and audio streams. Combined 1080p requires merging streams server-side, which may not always be available. Check the Video Only tab for 1080p.' } },
    { '@type': 'Question', name: 'What format are the downloaded files?',                acceptedAnswer: { '@type': 'Answer', text: 'Video files are typically MP4 or WebM. Audio-only files are usually WebM or MP4. You can convert them with HandBrake or VLC.' } },
    { '@type': 'Question', name: 'Can I download YouTube Shorts?',                      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste the Shorts URL (youtube.com/shorts/...) and the tool fetches all available formats.' } },
    { '@type': 'Question', name: 'Does this work on mobile?',                           acceptedAnswer: { '@type': 'Answer', text: 'Yes. The tool works in any modern mobile browser on iOS or Android. Downloaded files go to your Downloads folder.' } },
    { '@type': 'Question', name: 'Why does some content show "Failed to fetch"?',       acceptedAnswer: { '@type': 'Answer', text: 'Age-restricted, region-locked, or private videos block downloads. Ensure the video is publicly available and the URL is correct.' } },
    { '@type': 'Question', name: 'Can I download thumbnails too?',                      acceptedAnswer: { '@type': 'Answer', text: 'Yes. After fetching a video, the Thumbnails section shows Max HD (1280×720), SD (640×480), HQ (480×360), and MQ (320×180) versions with download buttons.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'YouTube Video Downloader', item: 'https://omniwebkit.com/tools/youtube-downloader' },
  ],
};

export default function YouTubeDownloaderLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="youtube-downloader" category="media" />
    </>
  );
}
