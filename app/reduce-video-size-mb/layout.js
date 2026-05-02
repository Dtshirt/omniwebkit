export const metadata = {
  title: 'Reduce Video Size in MB — Free FFmpeg Video Compressor Online',
  description:
    'Reduce video file size in MB online. Real FFmpeg compression. Compress 100 MB to 20 MB. Supports MP4, MOV, AVI, MKV. Choose target resolution. Free, no watermark.',
  keywords: ['reduce video size mb','reduce video file size online','compress video to smaller size','video size reducer online free','reduce mp4 size online'],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://omniwebkit.com/reduce-video-size-mb' },
  openGraph: {
    title: 'Reduce Video Size in MB Online — FFmpeg Compressor',
    description: 'Reduce MP4/MOV/AVI video size by 40–80%. Real FFmpeg. Free.',
    url: 'https://omniwebkit.com/reduce-video-size-mb',
    siteName: 'OmniWebKit',
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Reduce Video Size in MB',
  description: 'Reduce video file size in megabytes using real FFmpeg server-side compression. Supports MP4, MOV, AVI, MKV. Resolution downscaling from 1080p to 360p.',
  url: 'https://omniwebkit.com/reduce-video-size-mb',
  isPartOf: { '@type': 'WebSite', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
      { '@type': 'ListItem', position: 2, name: 'Reduce Video Size MB', item: 'https://omniwebkit.com/reduce-video-size-mb' },
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
