import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'CSS Animation Generator — Free Online Keyframe Animation Builder',
  description:
    'Create CSS keyframe animations online for free. Choose from 12 presets, edit transform, opacity, and colour with live sliders, and export clean CSS, Tailwind config, or React/Emotion code. No login needed.',
  keywords: [
    'CSS animation generator',
    'CSS keyframe animation online',
    'free CSS animation tool',
    'CSS animation builder',
    'online animation generator',
    'Tailwind CSS animation generator',
    'CSS transform animation',
    'keyframe animation creator',
    'web animation tool',
    'CSS animation code generator',
  ],
  openGraph: {
    title: 'CSS Animation Generator — Free Online Keyframe Builder',
    description:
      'Build and preview CSS keyframe animations in your browser. 12 presets, live sliders, and export to CSS, Tailwind, or React. Free, no account required.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/animation-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'CSS Animation Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free CSS Animation Generator — Keyframe Builder Online',
    description:
      'Create CSS animations with live preview. Adjust transform, opacity, colour, timing, and more. Export to CSS, Tailwind, or React. Free and instant.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/animation-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CSS Animation Generator',
  description:
    'Free online CSS keyframe animation builder. Choose from 12 preset animations (bounce, fade in, slide in, shake, pulse, spin, etc.), customise keyframes with live sliders (translateX, translateY, rotate, scale, opacity, background colour), and export CSS @keyframes code, Tailwind CSS config, or React/Emotion code.',
  url: 'https://omniwebkit.com/tools/animation-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    '12 built-in animation presets (bounce, fade, slide, shake, pulse, spin, wobble, flip, heartbeat, slideUp, zoomOut)',
    'Live real-time animation preview',
    'X and Y position sliders (translateX, translateY)',
    'Rotation slider (0 to 360 degrees)',
    'Scale slider (0x to 3x)',
    'Opacity slider (0 to 1)',
    'Background colour picker with hex input',
    'Add and delete keyframes dynamically',
    'Colour-coded keyframe timeline',
    'animation-direction control (normal, reverse, alternate)',
    'animation-fill-mode control (none, forwards, backwards, both)',
    'Timing function selector including cubic-bezier',
    'Export as standard CSS @keyframes',
    'Export as Tailwind CSS config',
    'Export as React/Emotion CSS-in-JS',
    'One-click copy to clipboard',
    'Download as CSS, JS, or JSX file',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a CSS Keyframe Animation Online for Free',
  description: 'Step-by-step guide to building CSS animations visually using the OmniWebKit CSS Animation Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a preset', text: 'Click any of the 12 animation presets to load a starting point — bounce, fade in, shake, heartbeat, spin, and more.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust animation settings', text: 'Set the duration, timing function, iteration count, direction, and fill mode for your animation.' },
    { '@type': 'HowToStep', position: 3, name: 'Edit keyframes with sliders', text: 'Select any keyframe from the timeline or list, then adjust X position, Y position, rotation, scale, opacity, and background colour using sliders.' },
    { '@type': 'HowToStep', position: 4, name: 'Add or remove keyframes', text: 'Click Add to insert a new keyframe. Click the delete button in the Keyframe Editor to remove one. Minimum two keyframes are required.' },
    { '@type': 'HowToStep', position: 5, name: 'Export your code', text: 'Switch between CSS, Tailwind, and React output tabs. Click Copy or Download to get your animation code.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the CSS animation generator free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% free. No account, no installation, no usage limits. All processing happens in your browser — nothing is sent to any server.' },
    },
    {
      '@type': 'Question',
      name: 'What is a CSS keyframe animation?',
      acceptedAnswer: { '@type': 'Answer', text: 'A CSS keyframe animation uses the @keyframes rule to define how an element looks at different points in time. You specify styles at percentages (0%, 50%, 100%) and the browser smoothly transitions between them. The animation property applies it to any element.' },
    },
    {
      '@type': 'Question',
      name: 'Can I export CSS animations for Tailwind CSS?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to the Tailwind tab in the code output panel. The tool generates a tailwind.config.js snippet with a custom keyframes entry and animation shorthand. Add it to your config and use animate-yourName as a class on any element.' },
    },
    {
      '@type': 'Question',
      name: 'How do I make a smooth CSS animation?',
      acceptedAnswer: { '@type': 'Answer', text: 'Always animate the transform or opacity properties rather than position or size properties like top, left, width, or height. Transform and opacity use GPU hardware acceleration, making animations much smoother. Use ease-in-out timing for natural-feeling motion.' },
    },
    {
      '@type': 'Question',
      name: 'What animation presets are included?',
      acceptedAnswer: { '@type': 'Answer', text: 'There are 12 presets: Bounce, Fade In, Slide In, Popup, Shake, Pulse, Spin, Wobble, Flip, Heartbeat, Slide Up, and Zoom Out. Each is fully editable — adjust every keyframe, timing, direction, and fill mode after loading.' },
    },
    {
      '@type': 'Question',
      name: 'What does animation-fill-mode forwards do?',
      acceptedAnswer: { '@type': 'Answer', text: 'It makes the element hold the styles from the final keyframe after the animation ends. Without it, the element snaps back to its original styles. Use forwards for one-time entrance animations like fade-in or slide-in.' },
    },
    {
      '@type': 'Question',
      name: 'Can I generate React animation code?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to the React tab in the output panel. The tool generates code using the @emotion/react library with keyframes defined as JavaScript template literals. This is compatible with Emotion, Styled Components, and similar CSS-in-JS libraries.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'CSS Animation Generator', item: 'https://omniwebkit.com/tools/animation-generator' },
  ],
};

export default function AnimationGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="animation-generator" category="web" />
    </>
  );
}
