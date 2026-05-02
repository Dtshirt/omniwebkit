export const metadata = {
  title: 'Compress Video Online Free — Real FFmpeg Server-Side Compression',
  description:
    'Compress video online free using real FFmpeg. No browser hacks. Upload MP4, MOV, AVI — get a smaller H.264/VP9 file in seconds. WhatsApp preset included. No watermark.',
  keywords: ['compress video online free','compress video online','video compressor online','online video size reducer','compress video without losing quality'],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://omniwebkit.com/compress-video-online' },
  openGraph: {
    title: 'Compress Video Online Free — FFmpeg Powered',
    description: 'Real server-side FFmpeg video compression. H.264 output, WhatsApp preset, free.',
    url: 'https://omniwebkit.com/compress-video-online',
    siteName: 'OmniWebKit',
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Compress Video Online Free',
  description: 'Free online video compressor powered by FFmpeg. Upload any video, select quality and resolution, download a smaller MP4 or WebM file. No watermark, no account.',
  url: 'https://omniwebkit.com/compress-video-online',
  isPartOf: { '@type': 'WebSite', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
      { '@type': 'ListItem', position: 2, name: 'Compress Video Online', item: 'https://omniwebkit.com/compress-video-online' },
    ],
  },
};

export default function Layout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {children}
    </>
  );
}
