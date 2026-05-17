import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Keyboard Tester Online — Test Every Key on Your Keyboard Instantly',
  description:
    'Free online keyboard tester. Press any key to see it light up on the on-screen keyboard diagram. Tests all keys including F-keys, numpad, modifier keys, and arrow keys. Shows key code, event code, and key character for developers. No download needed.',
  keywords: [
    'keyboard tester online free',
    'keyboard key tester online',
    'test keyboard keys online free',
    'keyboard test all keys',
    'online keyboard tester no download',
    'keyboard ghosting tester online',
    'keyboard key not working tester',
    'mechanical keyboard tester online free',
    'laptop keyboard tester online',
    'keyboard event code tester online',
  ],
  openGraph: {
    title: 'Free Keyboard Tester — Test Every Key Online Instantly',
    description:
      'Test every key on your keyboard online. Keys light up green when pressed and blue when tested. Includes numpad, F-keys, modifiers, and key code display for developers.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/keyboard-tester',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Keyboard Tester — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Keyboard Tester — Test Every Key Online Instantly',
    description: 'Press any key to test it. Full keyboard diagram with numpad, F-keys, and key code display for developers. Free, no install.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/keyboard-tester',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Keyboard Tester',
  description: 'Free browser-based keyboard tester. Press any key on your physical keyboard to see it highlighted in real time. Features live progress tracking, modifier separation, and developer keycode readouts.',
  url: 'https://omniwebkit.com/tools/keyboard-tester',
  applicationCategory: 'WebApplication',
  operatingSystem: 'Any (Browser-based)',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Lazydesigners', url: 'https://github.com/Dtshirt/omniwebkit' },
  author: { '@type': 'Organization', name: 'Lazydesigners', url: 'https://github.com/Dtshirt/omniwebkit' },
  featureList: [
    'Live visual mapping for every keypress',
    'Modifier key separation (Left/Right Shift, Ctrl, Alt)',
    'Real-time exact keycode developer readouts',
    'Full numpad and function row support',
    '100% local client-side processing'
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Keyboard Tester', item: 'https://omniwebkit.com/tools/keyboard-tester' },
  ],
};

export default function KeyboardTesterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="keyboard-tester" category="misc" />
    </>
  );
}
