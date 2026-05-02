import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Quadratic Equation Solver Online — Roots, Discriminant, Vertex',
  description:
    'Free online quadratic equation solver. Find roots, discriminant, vertex, and step-by-step solution for ax² + bx + c = 0. Handles real and complex roots. Browser-based, no signup.',
  keywords: [
    'quadratic equation solver online free',
    'solve quadratic equation calculator',
    'quadratic formula calculator free',
    'find roots of quadratic equation',
    'discriminant calculator online',
    'quadratic equation step by step',
    'complex roots quadratic calculator',
    'vertex of parabola calculator',
    'ax2 bx c solver free',
    'quadratic equation solver with steps',
  ],
  openGraph: {
    title: 'Free Quadratic Equation Solver — Roots & Step-by-Step',
    description:
      'Solve ax² + bx + c = 0. Find roots, discriminant, vertex with step-by-step breakdown. Free, browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/quadratic-equation-solver',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Quadratic Equation Solver — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Quadratic Equation Solver',
    description: 'Solve quadratic equations with step-by-step solutions. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/quadratic-equation-solver',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Quadratic Equation Solver',
  description:
    'Free browser-based quadratic equation solver for ax² + bx + c = 0. Finds: real roots (two distinct or one repeated), complex conjugate roots, discriminant with formula breakdown, vertex coordinates, parabola direction. Features: step-by-step solution, 4 built-in examples, live equation preview, one-click copy results, discriminant reference cards, responsive 2-column layout. All processing browser-based. No signup, no data collection.',
  url: 'https://omniwebkit.com/tools/quadratic-equation-solver',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Solve any quadratic equation ax² + bx + c = 0',
    'Two distinct real roots, one repeated root, or complex roots',
    'Discriminant calculation with formula breakdown',
    'Vertex coordinates and parabola direction',
    'Full step-by-step solution breakdown',
    '4 built-in example equations',
    'Live equation preview while typing',
    'One-click copy all results',
    'Discriminant quick reference cards',
    'Responsive 2-column layout',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Solve a Quadratic Equation Online for Free',
  description: 'Steps to solve a quadratic equation using the OmniWebKit Quadratic Equation Solver.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter coefficients', text: 'Type the values of a, b, and c from your equation ax² + bx + c = 0.' },
    { '@type': 'HowToStep', position: 2, name: 'Preview the equation', text: 'The equation preview updates in real time as you type your coefficients.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Solve', text: 'Click the Solve button. The solver calculates discriminant, roots, vertex, and direction.' },
    { '@type': 'HowToStep', position: 4, name: 'Read step-by-step', text: 'Review the full step-by-step solution to understand how each value was derived.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy results', text: 'Click Copy to copy all results to your clipboard for pasting into your work.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this quadratic equation solver free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account and no data collection.' } },
    { '@type': 'Question', name: 'What is a quadratic equation?', acceptedAnswer: { '@type': 'Answer', text: 'An equation in the form ax² + bx + c = 0 where a ≠ 0. It always has exactly two roots.' } },
    { '@type': 'Question', name: 'What if a = 0?', acceptedAnswer: { '@type': 'Answer', text: 'If a = 0, the equation is linear, not quadratic. The solver will show an error.' } },
    { '@type': 'Question', name: 'What are complex roots?', acceptedAnswer: { '@type': 'Answer', text: 'When the discriminant is negative, roots contain an imaginary part. Example: 2 + 3i and 2 − 3i.' } },
    { '@type': 'Question', name: 'Does it show step-by-step work?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. A full step-by-step breakdown shows how each value was calculated.' } },
    { '@type': 'Question', name: 'Can I copy the results?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Copy to copy equation, discriminant, roots, vertex, and direction.' } },
    { '@type': 'Question', name: 'What are the built-in examples?', acceptedAnswer: { '@type': 'Answer', text: 'Four equations: x²−5x+6=0, x²+4x+4=0, x²+x+1=0, 2x²−7x+3=0.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The layout is fully responsive with 2 columns on desktop and 1 column on mobile.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Quadratic Equation Solver', item: 'https://omniwebkit.com/tools/quadratic-equation-solver' },
  ],
};

export default function QuadraticSolverLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="quadratic-equation-solver" category="math" />
    </>
  );
}
