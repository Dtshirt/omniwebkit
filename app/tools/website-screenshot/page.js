export const metadata = {
  title: 'Website Screenshot Tool | Capture Full Page as PNG or PDF | OmniWebKit',
  description: 'Capture high-quality, full-page website screenshots as PNG images or PDF documents. A fast, secure, server-side tool that handles any URL perfectly.',
  keywords: [
    'website screenshot', 'full page screenshot', 'url to png', 'url to pdf',
    'capture website', 'webpage screenshot', 'screenshot tool'
  ],
  openGraph: {
    title: 'Website Screenshot Tool | Capture Full Page | OmniWebKit',
    description: 'Capture high-quality, full-page website screenshots as PNG images or PDF documents.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/website-screenshot',
  },
};

import WebsiteScreenshotClient from './WebsiteScreenshotClient';

export default function WebsiteScreenshotPage() {
  return <WebsiteScreenshotClient />;
}
