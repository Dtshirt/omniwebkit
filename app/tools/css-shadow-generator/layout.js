import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free CSS Shadow Generator — Box Shadow & Text Shadow Online Tool',
  description:
    'Free CSS box-shadow and text-shadow generator with live preview. Layer multiple shadows, pick colours, copy production-ready CSS or download a .css file. No login required. Works in all browsers.',
  keywords: [
    'CSS shadow generator online free',
    'box-shadow generator',
    'CSS box shadow tool',
    'text-shadow generator CSS',
    'CSS glow effect generator',
    'neumorphism shadow generator',
    'inset shadow CSS generator',
    'multiple CSS shadows tool',
    'online CSS shadow maker',
    'box shadow CSS code generator',
  ],
  openGraph: {
    title: 'Free CSS Shadow Generator — Box Shadow & Text Shadow Online Tool',
    description:
      'Generate CSS box-shadow and text-shadow code visually. Layer shadows, adjust blur, opacity, spread, and colour with live preview. Copy ready-to-use CSS instantly. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/css-shadow-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'CSS Shadow Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free CSS Box Shadow & Text Shadow Generator — Live Preview Tool',
    description: 'Create layered CSS shadows visually. Box shadow, text shadow, glow effects, neumorphism. Live preview, copy CSS, download file. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/css-shadow-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CSS Shadow Generator',
  description:
    'Free online CSS shadow generator for both box-shadow and text-shadow properties. Features include multi-layer shadow stacking, per-layer colour picker and opacity control, inset toggle, preview shapes (square, circle, pill, card, button), 13 box-shadow presets and 6 text-shadow presets, copy CSS to clipboard, and download as .css file. Live preview updates in real time as you adjust sliders.',
  url: 'https://omniwebkit.com/tools/css-shadow-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'CSS box-shadow generator with live preview',
    'CSS text-shadow generator with live preview',
    'Multi-layer shadow stacking with comma-separated CSS output',
    'Per-layer enable/disable toggle',
    'Per-layer colour picker with hex input',
    'Per-layer opacity slider',
    'Offset X, Offset Y, Blur, and Spread sliders',
    'Inset shadow toggle for each layer',
    '13 box-shadow presets: Soft, Medium, Large, XL Float, Inset, Neon Blue, Neon Purple, 3D, Neumorphic, Crisp, Layered, Card',
    '6 text-shadow presets: Soft, Hard, Neon, Retro, Emboss, Outline',
    'Preview shapes: Square, Circle, Pill, Card, Button',
    'Adjustable preview background and element colours',
    'Font size control for text shadow preview',
    'Copy CSS to clipboard',
    'Download generated CSS as .css file',
    '100% browser-based, no login required',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate CSS Box Shadow Code Online for Free',
  description: 'Steps to create a CSS box-shadow or text-shadow using the OmniWebKit CSS Shadow Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose shadow type', text: 'Click Box Shadow or Text Shadow in the tab bar at the top of the tool to select which CSS shadow property to generate.' },
    { '@type': 'HowToStep', position: 2, name: 'Apply a preset or build from scratch', text: 'Select one of the presets (Soft, Neon, Neumorphic, etc.) to start with a polished foundation, or adjust the sliders manually for a custom shadow.' },
    { '@type': 'HowToStep', position: 3, name: 'Adjust shadow parameters', text: 'Use the Offset X, Offset Y, Blur, Spread (box only), Opacity, and Colour controls per layer. Toggle Inset for inner shadows (box only). Watch the live preview update instantly.' },
    { '@type': 'HowToStep', position: 4, name: 'Add more layers', text: 'Click Add Layer to stack additional shadows. Use the eye icon to toggle individual layers on or off without deleting them. Professional shadows typically use 2–3 layers.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or download the CSS', text: 'Click Copy to copy the box-shadow or text-shadow CSS declaration to your clipboard. Or click Download to save a ready-to-use .css file. Paste into your stylesheet and apply the class to your HTML element.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this CSS shadow generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, login, or usage limits. The generated CSS is yours to use in any project, commercial or personal.' } },
    { '@type': 'Question', name: 'Does the generated CSS work in all browsers?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The box-shadow and text-shadow properties are fully supported in all modern browsers — Chrome, Firefox, Safari, Edge, and Opera. No vendor prefixes are needed for modern targets.' } },
    { '@type': 'Question', name: 'Can I layer multiple shadows?', acceptedAnswer: { '@type': 'Answer', text: 'Yes — click Add Layer to add as many shadow layers as you need. Each layer is configurable independently. The generated CSS combines them all into a comma-separated list which the browser renders simultaneously.' } },
    { '@type': 'Question', name: 'What is the inset keyword in box-shadow?', acceptedAnswer: { '@type': 'Answer', text: 'Inset creates an inner shadow that appears inside the element rather than outside. It is great for pressed button states, sunken input fields, and neumorphism designs.' } },
    { '@type': 'Question', name: 'What is the spread radius in box-shadow?', acceptedAnswer: { '@type': 'Answer', text: 'Spread radius (the 4th value in box-shadow) expands or contracts the shadow before blur is applied. A negative spread with large blur creates a very natural depth effect. Positive spread can create a solid border-like glow.' } },
    { '@type': 'Question', name: 'What is neumorphism?', acceptedAnswer: { '@type': 'Answer', text: 'Neumorphism is a design trend using two box shadows — one lighter, one darker — on elements matching the background colour. This creates an extruded, soft 3D look. Try the Neumorphic preset in this tool to see it in action.' } },
    { '@type': 'Question', name: 'Can I download the generated CSS?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the Download button to save a .css file named shadow.css containing your generated shadow code wrapped in an .element selector.' } },
    { '@type': 'Question', name: 'Does this tool support text-shadow?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the Text Shadow tab at the top of the tool. You can add multiple text shadow layers, pick colours, adjust offsets, blur, and opacity, and choose from 6 presets: Soft, Hard, Neon, Retro, Emboss, and Outline.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'CSS Shadow Generator', item: 'https://omniwebkit.com/tools/css-shadow-generator' },
  ],
};

export default function CSSShadowGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="css-shadow-generator" category="web" />
    </>
  );
}
