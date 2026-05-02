import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Neumorphism CSS Generator Online — Create Soft UI Box Shadow Effects',
  description:
    'Free online neumorphism CSS generator with live preview. Customize background color, border radius, shadow distance, blur, intensity, and shape type. Copy CSS instantly. No signup required.',
  keywords: [
    'neumorphism generator online free',
    'neumorphism CSS generator',
    'soft UI CSS generator online',
    'neumorphic box shadow generator',
    'neumorphism design tool online free',
    'soft UI neumorphism CSS code generator',
    'neumorphism button CSS generator',
    'CSS box shadow neumorphism generator',
    'neu-morphism generator online',
    'soft neumorphism UI design generator',
  ],
  openGraph: {
    title: 'Free Neumorphism CSS Generator — Create Soft UI Effects Online',
    description:
      'Design neumorphic CSS effects with live preview. Adjust size, radius, distance, blur, intensity, and shape. Copy CSS in one click. Free, no signup.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/neumorphism-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Neumorphism Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Neumorphism CSS Generator — Create Soft UI Effects Online',
    description: 'Live neumorphic CSS box-shadow generator. Customise size, radius, blur, intensity, shape, and light direction. Free, instant copy.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/neumorphism-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Neumorphism CSS Generator',
  description:
    'Free browser-based neumorphism CSS generator. Controls: size (100–350px), border-radius (0–175px), shadow distance (5–50px), blur (10–100px), intensity (0.05–0.30), shape type (flat/concave/convex), light source (4 corners), background color (color picker + 8 presets). Live preview updates in real-time. Copy generated CSS as plain properties or as a complete .neumorphic {} class block. Shadow colors are auto-calculated as lighter and darker variants of the background color. No server upload — all processing browser-based.',
  url: 'https://omniwebkit.com/tools/neumorphism-generator',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Live neumorphic preview updates in real time',
    'Three shape modes: flat (raised), concave (inset/pressed), convex',
    'Four virtual light source directions (corner dots)',
    'Size, radius, distance, blur, and intensity sliders',
    'Custom background color picker',
    'Eight color presets: Classic, Slate, Warm, Rose, Sage, Lavender, Dark, Midnight',
    'Copy CSS as plain properties',
    'Copy CSS as complete .neumorphic class block',
    'Auto-calculated readable label colors for any background',
    'Fully responsive layout — works on mobile and desktop',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate Neumorphism CSS Online',
  description: 'Steps to create and export neumorphic CSS using the OmniWebKit Neumorphism Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a background color', text: 'Select one of the 8 color presets or use the color picker to choose any background color. The preview and controls update instantly.' },
    { '@type': 'HowToStep', position: 2, name: 'Select a shape type', text: 'Click Flat for a raised element, Concave for an inset/pressed element, or Convex for a reversed raised look.' },
    { '@type': 'HowToStep', position: 3, name: 'Adjust the sliders', text: 'Use the Size, Radius, Distance, Blur, and Intensity sliders to fine-tune the depth and appearance of the effect.' },
    { '@type': 'HowToStep', position: 4, name: 'Set the light source', text: 'Click one of the four corner dots in the preview area to change the direction the virtual light comes from.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy the CSS', text: 'Click "Copy CSS" to copy the raw CSS properties, or "With Class" to copy a complete .neumorphic {} class block ready to paste into your stylesheet.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is neumorphism in CSS?', acceptedAnswer: { '@type': 'Answer', text: 'Neumorphism is a UI design style that uses dual box shadows — one lighter than the background and one darker — to create soft, extruded or pressed elements. The element\'s background color matches the page background, making it look molded from the same surface.' } },
    { '@type': 'Question', name: 'Do I need to install anything to use this generator?', acceptedAnswer: { '@type': 'Answer', text: 'No. The neumorphism generator runs entirely in your browser with no software installation, no signup, and no account required.' } },
    { '@type': 'Question', name: 'How do I use the generated CSS in my project?', acceptedAnswer: { '@type': 'Answer', text: 'Click "Copy CSS" and paste the three CSS properties (border-radius, background, box-shadow) into an existing CSS rule for your element. Or click "With Class" to copy a complete .neumorphic {} class block.' } },
    { '@type': 'Question', name: 'What is the difference between flat, concave, and convex?', acceptedAnswer: { '@type': 'Answer', text: 'Flat = external shadows, element appears raised. Concave = inset shadows, element appears pressed into the surface (use for active/selected states). Convex = reversed shadow positions, a different raised appearance.' } },
    { '@type': 'Question', name: 'Can I use neumorphism with dark backgrounds?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Select Dark or Midnight from the presets, or choose any dark hex color. The shadow colors are auto-calculated as lighter and darker variants of your chosen background.' } },
    { '@type': 'Question', name: 'Are there accessibility concerns with neumorphism?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The low contrast between element and background can make interactive elements hard to perceive for users with visual impairments. For production apps, add clear focus indicators and sufficient text contrast, and do not rely on neumorphic style alone to indicate interactivity.' } },
    { '@type': 'Question', name: 'What does the Intensity slider control?', acceptedAnswer: { '@type': 'Answer', text: 'Intensity controls how much lighter and darker the two shadow colors are compared to the base background color. Higher intensity = more visible, contrasted shadows. Lower intensity = subtler depth effect.' } },
    { '@type': 'Question', name: 'What does the light source do?', acceptedAnswer: { '@type': 'Answer', text: 'The light source determines which corner the virtual light "comes from". The shadow on the light side is lighter than the background; the shadow on the opposite side is darker. Changing the light source direction rotates the shadow positions.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Neumorphism Generator', item: 'https://omniwebkit.com/tools/neumorphism-generator' },
  ],
};

export default function NeumorphismGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="neumorphism-generator" category="web" />
    </>
  );
}
