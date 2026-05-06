import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Percentage Calculator Online Free — Calculate % Instantly',
  description:
    'Calculate percentages online — find what percent of a number, percentage increase/decrease, and more. Free percentage calculator with instant results. Multiple calculation types.',
  keywords: [
    'percentage calculator online free',
    'calculate percentage of number',
    'percentage increase calculator',
    'percentage decrease calculator',
    'percentage change calculator',
    'percentage difference calculator',
    'reverse percentage calculator',
    'online percent calculator free',
    'percentage calculator no signup',
    'free percent calculator with history',
  ],
  openGraph: {
    title: 'Free Percentage Calculator — Six Modes in One Tool',
    description:
      'Calculate percentages, increases, decreases, differences, changes, and reverse lookups. Free, instant, with formula display.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/percentage-calculator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Percentage Calculator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Percentage Calculator — 6 Modes',
    description: 'Calculate any percentage problem. Six calculators, formula display, history. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/percentage-calculator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Percentage Calculator',
  description:
    'Free online percentage calculator with six calculation modes: Basic (X% of Y), Percentage Increase, Percentage Decrease, Percentage Difference, Percentage Change, and Reverse Percentage (X is Y% of what?). Each calculator shows its mathematical formula. Results display with one-click copy. Scrollable calculation history (up to 20 entries). Clear All button. Responsive 2-column grid layout. All processing browser-based. No signup, no ads, no data collection.',
  url: 'https://omniwebkit.com/tools/percentage-calculator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Six percentage calculation modes',
    'Basic: What is X% of Y?',
    'Increase and Decrease by X%',
    'Percentage Difference between two values',
    'Percentage Change (positive or negative)',
    'Reverse: X is Y% of what?',
    'Formula display under each calculator',
    'Calculation history (up to 20 entries)',
    'One-click copy for all results',
    'Responsive 2-column grid layout',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Calculate Percentages Online for Free',
  description: 'Steps to calculate any percentage using the OmniWebKit Percentage Calculator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a calculator', text: 'Select the calculation type you need: Basic, Increase, Decrease, Difference, Change, or Reverse.' },
    { '@type': 'HowToStep', position: 2, name: 'Enter your values', text: 'Type the numbers into the input fields. Each calculator requires two values.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Calculate', text: 'Click the Calculate button. The result appears instantly with the formula used.' },
    { '@type': 'HowToStep', position: 4, name: 'Copy or review', text: 'Click the copy icon to copy the result. Review past calculations in the History panel.' },
    { '@type': 'HowToStep', position: 5, name: 'Clear when done', text: 'Click Clear All to reset all calculators, or clear history independently.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this percentage calculator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no ads, and no data collection.' } },
    { '@type': 'Question', name: 'How many calculation types are available?', acceptedAnswer: { '@type': 'Answer', text: 'Six: Basic (X% of Y), Increase, Decrease, Difference, Change, and Reverse.' } },
    { '@type': 'Question', name: 'Does it show formulas?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Each calculator displays its mathematical formula for transparency and verification.' } },
    { '@type': 'Question', name: 'Can I copy results?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the copy icon next to any result to copy it to your clipboard.' } },
    { '@type': 'Question', name: 'Is there a calculation history?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Up to 20 calculations are logged chronologically and can be cleared.' } },
    { '@type': 'Question', name: 'What is the Reverse calculator?', acceptedAnswer: { '@type': 'Answer', text: 'It finds the original value when you know the result and the percentage. If 50 is 25% of X, it returns X = 200.' } },
    { '@type': 'Question', name: 'Can I use negative numbers?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. All six calculators accept negative inputs and handle them correctly.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The layout is fully responsive with 2 columns on desktop and 1 column on mobile.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Percentage Calculator', item: 'https://omniwebkit.com/tools/percentage-calculator' },
  ],
};

export default function PercentageCalculatorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="percentage-calculator" category="math" />
    </>
  );
}
