import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Free Video Compressor Online — Real FFmpeg Compression, Any Format',
  description:
    'Compress video files online using real FFmpeg server-side encoding. Reduce MP4, MOV, AVI size by up to 80%. WhatsApp preset, H.264/VP9 output. No watermark, free.',
  keywords: [
    'video compressor free online',
    'compress video ffmpeg online',
    'reduce video file size online',
    'compress mp4 online free',
    'video compressor no watermark',
    'compress video for whatsapp',
    'reduce video size mb',
    'online video compressor h264',
    'video size reducer free',
    'server side video compression',
    'compress video online free download',
    'ffmpeg video compressor online',
  ],
  openGraph: {
    title: 'Free Video Compressor — Real FFmpeg, Not a Browser Hack',
    description:
      'Proper FFmpeg video compression online. H.264/VP9, WhatsApp preset, real progress bar. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/video-compressor',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Video Compressor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free FFmpeg Video Compressor Online',
    description: 'Real server-side FFmpeg compression. MP4, WebM, WhatsApp preset. Free.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://omniwebkit.com/tools/video-compressor' },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Video Compressor',
  description:
    'Real server-side FFmpeg video compression. Upload any video (MP4, MOV, AVI, WebM, MKV), choose quality preset (High/Medium/Low/WhatsApp), resolution (original to 360p), and output format (MP4/WebM). FFmpeg re-encodes with H.264 or VP9. Real-time progress bar. Files deleted after download.',
  url: 'https://omniwebkit.com/tools/video-compressor',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Server-side FFmpeg H.264/VP9 encoding',
    '4 quality presets: High (CRF 23), Medium (CRF 28), Low (CRF 34), WhatsApp',
    '5 resolution options: Original, 1080p, 720p, 480p, 360p',
    'Output formats: MP4 (H.264) and WebM (VP9)',
    'Real-time FFmpeg progress bar',
    'WhatsApp/Telegram optimised preset',
    'Files auto-deleted after download',
    'Accepts MP4, MOV, AVI, MKV, WebM',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Compress a Video Online with FFmpeg',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Select video', text: 'Click the upload area and select any video file up to 500 MB.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose settings', text: 'Select quality preset, resolution, and output format (MP4 or WebM).' },
    { '@type': 'HowToStep', position: 3, name: 'Compress', text: 'Click Compress with FFmpeg. Watch the real progress bar as FFmpeg processes your video.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'See the size comparison and click Download to save your compressed video.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this browser-based or server-side?', acceptedAnswer: { '@type': 'Answer', text: 'Server-side. Uses real FFmpeg, not a browser Canvas hack. Gives proper compression with H.264/VP9.' } },
    { '@type': 'Question', name: 'What is the WhatsApp preset?', acceptedAnswer: { '@type': 'Answer', text: 'H.264 codec, 720p cap, AAC 128kbps audio — the exact spec WhatsApp accepts without re-processing.' } },
    { '@type': 'Question', name: 'How much can it compress?', acceptedAnswer: { '@type': 'Answer', text: 'Typically 40–80% reduction. A 100 MB phone video can reach 20–30 MB at medium quality.' } },
    { '@type': 'Question', name: 'Are files stored on the server?', acceptedAnswer: { '@type': 'Answer', text: 'Only temporarily during compression. Files are deleted immediately after download.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Video Compressor', item: 'https://omniwebkit.com/tools/video-compressor' },
  ],
};

export default function VideoCompressorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="video-compressor" category="file" />
    </>
  );
}
