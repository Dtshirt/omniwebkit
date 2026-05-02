export const metadata = {
  title: 'Compress MP4 Free Online — Real FFmpeg H.264 Compression',
  description:
    'Compress MP4 files free online. Real H.264 FFmpeg encoding — not a browser hack. Reduce MP4 size by 60–80%. Choose CRF quality and resolution. Download instantly. Free.',
  keywords: ['compress mp4 free','compress mp4 online free','reduce mp4 file size','mp4 compressor online','mp4 size reducer free','compress mp4 no watermark'],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://omniwebkit.com/compress-mp4-free' },
  openGraph: {
    title: 'Compress MP4 Free — Real H.264 FFmpeg Online',
    description: 'MP4 compression with real FFmpeg H.264 encoding. No watermark. Free.',
    url: 'https://omniwebkit.com/compress-mp4-free',
    siteName: 'OmniWebKit',
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Compress MP4 Free Online',
  description: 'Compress MP4 video files online for free using FFmpeg H.264 encoding. Choose quality (CRF 23–34) and resolution. Output as smaller MP4 or WebM. No watermark, no signup.',
  url: 'https://omniwebkit.com/compress-mp4-free',
  isPartOf: { '@type': 'WebSite', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
      { '@type': 'ListItem', position: 2, name: 'Compress MP4 Free', item: 'https://omniwebkit.com/compress-mp4-free' },
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
