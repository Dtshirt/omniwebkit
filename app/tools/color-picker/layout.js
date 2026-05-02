import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Color Picker Online — HEX, RGB, HSL, Palette Generator & WCAG Contrast',
  description:
    'Free online color picker tool. Get HEX, RGB, RGBA, HSL, and HSLA values instantly. Generate tints, shades, and color harmonies. Check WCAG accessibility contrast ratios. No login required.',
  keywords: [
    'color picker online free',
    'hex color picker',
    'rgb color picker',
    'hsl color picker',
    'color palette generator',
    'tints and shades generator',
    'color harmony generator',
    'WCAG contrast checker',
    'color code converter',
    'complementary color finder',
  ],
  openGraph: {
    title: 'Free Color Picker & Palette Generator — HEX, RGB, HSL, WCAG',
    description:
      'Pick any colour and instantly get HEX, RGB, RGBA, HSL, and HSLA values. Generate tints, shades, and colour harmonies. Check WCAG accessibility scores. Free, no login.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/color-picker',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Color Picker & Palette Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Color Picker — HEX, RGB, HSL, Palette & WCAG Contrast Checker',
    description: 'Pick any colour, get all CSS formats. Generate tints, shades, harmonies. Check WCAG contrast. Free online tool.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/color-picker',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Color Picker & Palette Generator',
  description:
    'Free online color picker tool. Pick any colour using the native browser picker and instantly see HEX, RGB, RGBA, HSL, and HSLA values with one-click copy. Generate tints, shades, and eight colour harmonies (complementary, analogous, triadic, split-complementary, tetradic). Check WCAG AA and AAA contrast ratios against white and black. Download the full palette as a PNG image. All processing is browser-based with no data sent to a server.',
  url: 'https://omniwebkit.com/tools/color-picker',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Native browser colour picker with live preview',
    'HEX, RGB, RGBA, HSL, HSLA format outputs',
    'One-click copy for each format',
    'Individual R, G, B, H, S, L channel breakdown',
    'WCAG AA and AAA contrast ratio checker against white and black',
    'Tints palette (5 lighter variations)',
    'Shades palette (5 darker variations)',
    '8 colour harmonies: complementary, analogous, triadic, split-complementary, tetradic',
    'Click any palette swatch to select that colour',
    'Download full palette as PNG image',
    'Recent colour history (up to 20 colours)',
    'Popular colour presets grid',
    'Random colour generator',
    '100% browser-based — no server, no login',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Pick a Color and Generate a Palette Online for Free',
  description: 'Steps to pick a colour and generate a palette using the OmniWebKit Color Picker.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Pick your colour', text: 'Click the colour swatch or the colour input to open the native browser colour picker, or click any swatch from the Popular Colours or Recent Colours panel.' },
    { '@type': 'HowToStep', position: 2, name: 'Copy the colour value', text: 'All five CSS formats (HEX, RGB, RGBA, HSL, HSLA) update automatically. Click the copy icon next to any format to copy it to your clipboard.' },
    { '@type': 'HowToStep', position: 3, name: 'Check accessibility', text: 'Review the WCAG Contrast panel to see the contrast ratio of your colour against white and black. The tool shows whether your colour passes WCAG AA, AAA, or Fail ratings.' },
    { '@type': 'HowToStep', position: 4, name: 'Generate a palette', text: 'Switch between the Tints, Shades, and Harmonies tabs in the Generated Palettes card. Click any swatch to select that colour. Click Download PNG to save the palette as an image.' },
    { '@type': 'HowToStep', position: 5, name: 'Use the palette in your project', text: 'Copy the HEX or CSS values for each colour in your palette and use them in your design tool (Figma, CSS, Tailwind, etc.) or download the PNG for your mood board or design document.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this color picker free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required and no usage limits. All colour processing runs in your browser — no data is sent to any server.' },
    },
    {
      '@type': 'Question',
      name: 'What colour formats does this tool support?',
      acceptedAnswer: { '@type': 'Answer', text: 'The tool outputs five CSS colour formats: HEX (#RRGGBB), RGB (rgb(R,G,B)), RGBA (rgba(R,G,B,A)), HSL (hsl(H,S%,L%)), and HSLA (hsla(H,S%,L%,A)). Each format has a one-click copy button.' },
    },
    {
      '@type': 'Question',
      name: 'What are colour harmonies?',
      acceptedAnswer: { '@type': 'Answer', text: 'Colour harmonies are mathematically related hue combinations. This tool generates eight: complementary (180° opposite), two analogous (±30°), two triadic (±120°), two split-complementary (±150°), and one tetradic (90°).' },
    },
    {
      '@type': 'Question',
      name: 'What is a WCAG contrast ratio?',
      acceptedAnswer: { '@type': 'Answer', text: 'WCAG contrast ratio measures the luminosity difference between two colours. WCAG AA requires 4.5:1 for body text. AAA requires 7:1. This tool calculates both against white and black automatically.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between tints and shades?',
      acceptedAnswer: { '@type': 'Answer', text: 'Tints are lighter versions of a colour, created by increasing lightness in the HSL model. Shades are darker versions, created by decreasing lightness. Both expand your palette while keeping the original hue.' },
    },
    {
      '@type': 'Question',
      name: 'Can I download the generated palette?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the Download PNG button to save all palette swatches (tints, shades, harmonies) as a PNG image with HEX codes labelled beneath each swatch.' },
    },
    {
      '@type': 'Question',
      name: 'How do I pick a random colour?',
      acceptedAnswer: { '@type': 'Answer', text: 'Click the Random button in the top-right corner of the Colour Picker card. It generates a random HEX colour and immediately updates all formats, palette, and contrast scores.' },
    },
    {
      '@type': 'Question',
      name: 'Does this tool send my colour data to a server?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. All colour conversions, palette generation, and contrast calculations happen entirely in your browser using JavaScript. No data is ever sent to any server.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Color Picker', item: 'https://omniwebkit.com/tools/color-picker' },
  ],
};

export default function ColorPickerLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="color-picker" category="web" />
    </>
  );
}
