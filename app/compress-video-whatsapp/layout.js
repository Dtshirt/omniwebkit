export const metadata = {
  title: 'Compress Video for WhatsApp Free — H.264 720p Online Compressor',
  description:
    'Compress video for WhatsApp online free. H.264 720p preset — the exact format WhatsApp, Telegram, and Instagram accept. Reduce file size without re-processing. Free, no watermark.',
  keywords: ['compress video for whatsapp','compress video whatsapp online','whatsapp video compressor free','reduce video size whatsapp','whatsapp video size reducer','compress video telegram'],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://omniwebkit.com/compress-video-whatsapp' },
  openGraph: {
    title: 'Compress Video for WhatsApp Free — H.264 720p Preset',
    description: 'One-click WhatsApp video compression. H.264, 720p, AAC audio. Send without WhatsApp re-processing.',
    url: 'https://omniwebkit.com/compress-video-whatsapp',
    siteName: 'OmniWebKit',
  },
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Compress Video for WhatsApp Free',
  description: 'Compress video for WhatsApp using the correct H.264 codec, 720p resolution, and AAC audio settings. Videos compressed with this preset play natively on WhatsApp without re-encoding.',
  url: 'https://omniwebkit.com/compress-video-whatsapp',
  isPartOf: { '@type': 'WebSite', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
      { '@type': 'ListItem', position: 2, name: 'Compress Video for WhatsApp', item: 'https://omniwebkit.com/compress-video-whatsapp' },
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
