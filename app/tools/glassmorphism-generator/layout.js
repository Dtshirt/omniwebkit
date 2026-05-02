import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Glassmorphism CSS Generator — Frosted Glass Effect Tool Online',
  description:
    'Free online glassmorphism generator. Design frosted glass UI cards with real-time preview and export CSS, SCSS, Tailwind, and React code. Adjust blur, opacity, saturation, border, and shadow — no signup required.',
  keywords: [
    'glassmorphism generator online free',
    'frosted glass CSS effect generator',
    'glass morphism CSS code',
    'backdrop-filter blur generator',
    'glassmorphism CSS tool',
    'frosted glass UI design tool',
    'glassmorphism Tailwind CSS',
    'SCSS glass card generator',
    'React glassmorphism component',
    'CSS glass effect creator',
  ],
  openGraph: {
    title: 'Free Glassmorphism CSS Generator — Frosted Glass UI Effect Online',
    description:
      'Design frosted glass cards in real time. Adjust blur, opacity, saturation, border, and shadow — export CSS, SCSS, Tailwind, or React code. Nine background presets and six style presets. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/glassmorphism-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Glassmorphism Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Glassmorphism CSS Generator — Frosted Glass Effect Tool',
    description: 'Design frosted glass UI cards with real-time preview. Export CSS, SCSS, Tailwind, and React code. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/glassmorphism-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Glassmorphism CSS Generator',
  description:
    'Free browser-based glassmorphism CSS generator. Real-time frosted glass card preview with 11 customisation controls: glass tint colour, blur (0–40px), opacity (0–100%), saturation (100–300%), border opacity, border width, border radius, card padding, shadow X/Y offset, shadow blur, and shadow opacity. Six named style presets (Modern, Minimal, Bold, Subtle, Vivid, Elegant). Nine background presets (Mesh, Aurora, Sunset, Ocean, Midnight, Neon, Forest, Cosmic, Vibrant) plus custom colour input. Preview content colour toggle (light vs dark text). Code export in four formats: plain CSS, SCSS with variables, Tailwind CSS utility classes, React inline style component. Download as .css file.',
  url: 'https://omniwebkit.com/tools/glassmorphism-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Real-time glass card preview',
    'Blur, opacity, saturation, border, radius, padding, shadow controls (11 sliders)',
    'Glass tint colour picker with hex input',
    'Nine background presets: Mesh, Aurora, Sunset, Ocean, Midnight, Neon, Forest, Cosmic, Vibrant',
    'Custom background colour input',
    'Six named style presets: Modern, Minimal, Bold, Subtle, Vivid, Elegant',
    'Preview content colour toggle (light / dark text)',
    'Code export: CSS, SCSS, Tailwind CSS, React',
    'Download CSS as .css file',
    'CSS property quick reference panel',
    'Browser support table for backdrop-filter',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Glassmorphism CSS Effect Online for Free',
  description: 'Steps to design a frosted glass card and export CSS using the OmniWebKit Glassmorphism Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a background', text: 'Pick one of the nine background presets (Mesh, Aurora, Sunset, Ocean, Midnight, Neon, Forest, Cosmic, Vibrant) or enter a custom colour. The background is what shows through the glass, so a vibrant gradient gives the best frosted glass effect.' },
    { '@type': 'HowToStep', position: 2, name: 'Apply a style preset or adjust controls', text: 'Click one of the six presets (Modern, Minimal, Bold, Subtle, Vivid, Elegant) to start from a good-looking configuration, then fine-tune blur, opacity, saturation, border, radius, and shadow using the sliders.' },
    { '@type': 'HowToStep', position: 3, name: 'Preview the result', text: 'The live preview panel updates instantly with every adjustment, showing a realistic glass card over your chosen background. Toggle between light and dark preview text to check readability.' },
    { '@type': 'HowToStep', position: 4, name: 'Choose your output format', text: 'Select CSS, SCSS, Tailwind, or React from the code tabs above the code panel.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or download the code', text: 'Click Copy to copy the code to your clipboard, or Download CSS to save a .css file for use in your project.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Why does the glass card look solid instead of frosted?', acceptedAnswer: { '@type': 'Answer', text: 'The backdrop-filter: blur() property only shows a frosted effect when there is a vibrant background behind the card. Use one of the gradient background presets to see the full glassmorphism effect.' } },
    { '@type': 'Question', name: 'Why does the blur not work in Firefox?', acceptedAnswer: { '@type': 'Answer', text: 'Firefox enabled backdrop-filter by default from version 103. Older versions need a CSS feature query fallback. Chrome, Edge, and Safari all support it.' } },
    { '@type': 'Question', name: 'Does this generator output the -webkit- prefix for Safari?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All code formats include both backdrop-filter and -webkit-backdrop-filter so the effect works in Safari without any manual editing.' } },
    { '@type': 'Question', name: 'What output formats are available?', acceptedAnswer: { '@type': 'Answer', text: 'Four formats: CSS (standard class), SCSS (with variables), Tailwind CSS (utility class HTML), and React (inline style object as a functional component).' } },
    { '@type': 'Question', name: 'What does the saturation control do?', acceptedAnswer: { '@type': 'Answer', text: 'backdrop-filter: saturate() boosts the vibrancy of colours visible through the glass. Values above 150% give the frosted glass a vivid, glowing appearance.' } },
    { '@type': 'Question', name: 'Can I use a custom background for the preview?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the Custom button in the background selector and enter any hex colour or CSS gradient. You can also choose any of the nine built-in gradient presets.' } },
    { '@type': 'Question', name: 'What are the six style presets?', acceptedAnswer: { '@type': 'Answer', text: 'Modern is the standard balanced glass look. Minimal uses low blur and opacity for a subtle effect. Bold uses high blur and opacity for a strong frosted look. Subtle is very transparent and delicate. Vivid maximises saturation for a glowing appearance. Elegant is a refined middle ground with moderate values.' } },
    { '@type': 'Question', name: 'Can I download the generated CSS as a file?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the Download CSS button to save the CSS code as a glassmorphism.css file that you can import directly into your project.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Glassmorphism Generator', item: 'https://omniwebkit.com/tools/glassmorphism-generator' },
  ],
};

export default function GlassmorphismGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="glassmorphism-generator" category="web" />
    </>
  );
}
