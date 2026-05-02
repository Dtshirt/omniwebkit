import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Decision Maker — Spin Wheel, Coin Flip, Dice Roller & Random Picker',
  description:
    'Free decision-making tool with a custom spin wheel, coin flip, dice roller (D4–D100), and random item picker. Fully customizable, no login required. Make any decision in seconds.',
  keywords: [
    'decision maker online free',
    'spin wheel random picker',
    'coin flip online',
    'dice roller online',
    'random decision maker tool',
    'wheel of fortune spinner',
    'virtual coin flip',
    'D&D dice roller online',
    'random name picker',
    'spin wheel with custom options',
  ],
  openGraph: {
    title: 'Free Online Decision Maker — Spin Wheel, Coin Flip, Dice Roller & Random Picker',
    description:
      'Make any decision instantly with a custom spin wheel, coin flip, dice roller (D4–D100), and random item picker. Free, no signup, works on any device.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/decision-maker',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Decision Maker — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Decision Maker — Spin Wheel, Coin Flip, Dice Roller',
    description: 'Custom spin wheel, coin flip, dice roller, and random picker. Make any decision in seconds. Free online tool.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/decision-maker',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Decision Maker',
  description:
    'Free online decision-making tool with four modes: a customizable spin wheel with up to 12 options and inline editing, a coin flip simulator that can flip up to 10 coins at once with individual result sequences, a dice roller supporting D4, D6, D8, D10, D12, D20, and D100 with up to 8 dice, and a random item picker. All modes include results history and run entirely in the browser with no data sent to any server.',
  url: 'https://omniwebkit.com/tools/decision-maker',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Customizable spin wheel with up to 12 options',
    'Inline wheel option editing',
    'Multiple coin flip simulator (1–10 coins)',
    'Individual flip result sequence display',
    'Dice roller with D4, D6, D8, D10, D12, D20, D100',
    'Up to 8 dice per roll',
    'Dice total and individual result display',
    'Random item picker with rapid cycling animation',
    'Session history for coin and dice results',
    'Mobile-responsive design',
    '100% browser-based, no server, no data collection',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Online Decision Maker Tool',
  description: 'Steps to make a random decision using the OmniWebKit Decision Maker.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a decision mode', text: 'Select Spin Wheel, Coin Flip, Dice Roll, or Picker from the tab bar at the top of the tool. Each mode suits different decision types.' },
    { '@type': 'HowToStep', position: 2, name: 'Set up your options', text: 'For the spin wheel, add your custom options in the panel on the right (up to 12). For coin flip, set the number of flips. For dice, choose the number of dice and die type. For the picker, add your items.' },
    { '@type': 'HowToStep', position: 3, name: 'Activate the randomizer', text: 'Click SPIN, FLIP COIN, ROLL DICE, or PICK RANDOM. Watch the animated result play out.' },
    { '@type': 'HowToStep', position: 4, name: 'Read the result', text: 'The chosen option or number is displayed clearly below the action area. For coin flips with multiple coins, each individual flip result is shown as well as the totals.' },
    { '@type': 'HowToStep', position: 5, name: 'View history', text: 'Click the History tab to see your recent coin flip and dice roll results from the current session.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this decision maker tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account, no subscription, no ads. All four modes are available without any restrictions.' } },
    { '@type': 'Question', name: 'Is the randomness truly random?', acceptedAnswer: { '@type': 'Answer', text: "Yes. The tool uses JavaScript's Math.random(), which generates pseudo-random numbers sufficient for fair, unbiased decisions. Each result is fully independent of previous ones." } },
    { '@type': 'Question', name: 'Can I add my own options to the spin wheel?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Add up to 12 custom options using the input field in the Options panel. Click any existing option name to edit it inline. The wheel updates in real time.' } },
    { '@type': 'Question', name: 'What dice types are supported?', acceptedAnswer: { '@type': 'Answer', text: 'The dice roller supports D4, D6, D8, D10, D12, D20, and D100. You can roll up to 8 dice at once. Total and individual results are both displayed.' } },
    { '@type': 'Question', name: 'Can I flip more than one coin?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the slider on the Coin Flip tab to set 1 to 10 flips. After flipping, you see the total heads/tails count and a visual sequence of each individual flip result.' } },
    { '@type': 'Question', name: 'Is my data stored anywhere?', acceptedAnswer: { '@type': 'Answer', text: 'No data is sent to any server. Everything runs locally in your browser. Your options and history exist only in the current browser session.' } },
    { '@type': 'Question', name: 'Does this work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, fully responsive. The spin wheel canvas, controls, and all tabs work correctly on phones and tablets.' } },
    { '@type': 'Question', name: 'Can I use the wheel for classroom giveaways?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Add student names as wheel options and spin. The wheel is fair, visible, and engaging for the whole class. Many educators use spin wheel tools for exactly this purpose.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Decision Maker', item: 'https://omniwebkit.com/tools/decision-maker' },
  ],
};

export default function DecisionMakerLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="decision-maker" category="games" />
    </>
  );
}
