import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free CSS Grid Generator Online — Responsive Layouts with Flexbox Support',
  description:
    'Free visual CSS Grid generator and Flexbox generator. Create responsive layouts with live preview, desktop/tablet/mobile breakpoints, grid item positioning, and copy-ready CSS code. No login required.',
  keywords: [
    'CSS grid generator online free',
    'CSS grid layout generator',
    'flexbox generator online',
    'responsive CSS layout generator',
    'grid-template-columns generator',
    'CSS grid visual editor',
    'online layout builder CSS',
    'CSS grid code generator',
    'flexbox code generator',
    'responsive web layout tool',
  ],
  openGraph: {
    title: 'Free CSS Grid Generator & Flexbox Generator — Responsive Layouts',
    description:
      'Visual CSS Grid and Flexbox layout generator with live preview. Configure desktop, tablet, and mobile breakpoints. Generate responsive CSS with @media queries instantly. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/css-grid-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'CSS Grid Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free CSS Grid & Flexbox Generator — Visual Responsive Layout Tool',
    description: 'Generate responsive CSS Grid and Flexbox layouts visually. Live preview, 3 breakpoints, position items, copy CSS. Free online tool.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/css-grid-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CSS Grid Generator & Flexbox Generator',
  description:
    'Free visual CSS layout generator supporting both CSS Grid and Flexbox. Configure columns, rows, gap, alignment, and item-level grid placement for three separate breakpoints (desktop, tablet, mobile). Live preview updates in real time. Generates production-ready responsive CSS with @media queries and a matching HTML example. Includes seven ready-made presets: Blog, Dashboard, Magazine, Gallery (Grid) and Card Layout, Navigation, Feature Grid (Flexbox). Copy CSS to clipboard in one click.',
  url: 'https://omniwebkit.com/tools/css-grid-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'CSS Grid layout generator with live preview',
    'Flexbox layout generator with live preview',
    'Desktop, tablet, and mobile breakpoint configuration',
    'grid-template-columns, grid-template-rows, gap, auto-rows controls',
    'Flexbox direction, wrap, justify-content, align-items controls',
    'Per-item grid-column and grid-row placement (column-start, column-end, row-start, row-end)',
    'Per-breakpoint item positioning',
    '4 CSS Grid layout presets (Blog, Dashboard, Magazine, Gallery)',
    '3 Flexbox layout presets (Card Layout, Navigation, Feature Grid)',
    'Generates responsive CSS with @media queries',
    'Generates matching HTML example with class names',
    'One-click copy CSS to clipboard',
    'Add and remove layout items dynamically',
    'Reset to default layout',
    'Show/hide CSS code panel toggle',
    '100% browser-based, no login required',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate a Responsive CSS Grid Layout Online for Free',
  description: 'Steps to create a responsive CSS Grid or Flexbox layout using the OmniWebKit CSS Grid Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose layout type', text: 'Click CSS Grid or Flexbox in the top toolbar to select which layout model to generate. CSS Grid is best for two-dimensional page layouts. Flexbox is best for one-dimensional component layouts.' },
    { '@type': 'HowToStep', position: 2, name: 'Apply a preset or configure manually', text: 'Select a preset (Blog, Dashboard, Gallery, etc.) for an instant starting point, or configure the layout settings manually in the settings panel on the left — columns, rows, gap, and more.' },
    { '@type': 'HowToStep', position: 3, name: 'Configure each breakpoint', text: 'Switch between Desktop, Tablet, and Mobile in the Breakpoint panel and adjust the layout settings for each screen size separately. The preview updates live.' },
    { '@type': 'HowToStep', position: 4, name: 'Position individual items (Grid only)', text: 'In Grid mode, click an item in the Items panel, then set its column-start, column-end, row-start, and row-end values. You can set different positions for each breakpoint.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy the CSS', text: 'Click the Copy CSS button to copy the full responsive CSS to your clipboard. Paste it into your stylesheet and add the class names shown in the HTML Example panel to your HTML elements.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this CSS grid generator free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or login required. You can generate and copy as many layouts as you need.' },
    },
    {
      '@type': 'Question',
      name: 'Does this generate responsive CSS with media queries?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The generated CSS includes @media query breakpoints for desktop (default, no query), tablet (max-width: 1024px), and mobile (max-width: 768px). You configure each breakpoint separately.' },
    },
    {
      '@type': 'Question',
      name: 'Can I position individual grid items to span multiple columns or rows?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. In CSS Grid mode, click any item in the Items panel, then set grid-column-start, grid-column-end, grid-row-start, and grid-row-end. Values like "span 2" or "1" are supported. Each breakpoint can have different positioning.' },
    },
    {
      '@type': 'Question',
      name: 'What is the fr unit in CSS Grid?',
      acceptedAnswer: { '@type': 'Answer', text: 'The fr unit stands for fraction of available space. repeat(3, 1fr) creates three equal columns. It is like a flexible percentage that automatically accounts for the gap between columns.' },
    },
    {
      '@type': 'Question',
      name: 'What does minmax() do in CSS Grid?',
      acceptedAnswer: { '@type': 'Answer', text: 'minmax(min, max) sets a minimum and maximum size for a grid track. For example, minmax(250px, 1fr) makes a column at least 250px wide but able to grow. Combined with repeat(auto-fit, ...), it creates a fully responsive grid without media queries.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between auto-fit and auto-fill?',
      acceptedAnswer: { '@type': 'Answer', text: 'Both fill the grid with columns automatically. auto-fit collapses empty columns, allowing existing items to stretch. auto-fill keeps empty tracks, maintaining consistent column sizing. auto-fit is usually preferred for responsive card grids.' },
    },
    {
      '@type': 'Question',
      name: 'When should I use CSS Grid vs Flexbox?',
      acceptedAnswer: { '@type': 'Answer', text: 'Use CSS Grid for two-dimensional layouts where you need explicit control over both rows and columns — page layouts, dashboards, card grids. Use Flexbox for one-dimensional layouts where items flow in a row or column — navigation bars, button groups, inline elements.' },
    },
    {
      '@type': 'Question',
      name: 'How do I use the generated CSS in my project?',
      acceptedAnswer: { '@type': 'Answer', text: 'Copy the CSS and paste it into your stylesheet. Add the class name shown in the HTML Example (grid-container or flex-container) to your container element in HTML. If you positioned specific items, add grid-item-1, grid-item-2, etc. classes to those elements.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'CSS Grid Generator', item: 'https://omniwebkit.com/tools/css-grid-generator' },
  ],
};

export default function CSSGridGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="css-grid-generator" category="web" />
    </>
  );
}
