import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: '2048 Game Online — Play Classic Addictive Puzzle Game',
  description:
    'Play the classic 2048 game online. Slide tiles to merge matching numbers and reach the 2048 tile. Free, addictive puzzle game with high score tracking.',
  keywords: [
    '2048 game online',
    'play 2048 free',
    'classic 2048 puzzle',
    'merge tiles game',
    '2048 high score',
    'addictive puzzle game',
    'online 2048 unblocked',
    '2048 browser game',
    'reach 2048 tile',
    'sliding tile puzzle',
  ],
  openGraph: {
    title: 'Play 2048 Game Online — Classic Puzzle',
    description:
      'Slide tiles and reach the 2048 tile in this addictive puzzle game. Free to play on OmniWebKit.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/game-2048',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: '2048 Game — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '2048 Game Online — Play for Free',
    description: 'Slide tiles and reach the 2048 tile. Addictive, free, and fun!',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/game-2048',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '2048 Game',
  description:
    'Classic 2048 sliding tile puzzle game. Features: 4x4 grid, smooth animations, score and best score tracking, game state persistence using localStorage, mobile responsive design, and share high score functionality.',
  url: 'https://omniwebkit.com/tools/game-2048',
  applicationCategory: 'GameApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Addictive 4x4 sliding tile puzzle',
    'Smooth CSS transitions and animations',
    'Real-time score and high score tracking',
    'Auto-save game state to localStorage',
    'Undo functionality (optional)',
    'Mobile-friendly responsive layout',
    'Share high score with friends',
    'Keyboard and touch support',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Play 2048 Game',
  description: 'Learn the basic rules and strategies for the 2048 puzzle game.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Slide tiles', text: 'Use arrow keys or swipe to move all tiles on the grid in a direction.' },
    { '@type': 'HowToStep', position: 2, name: 'Merge numbers', text: 'When two tiles with the same number touch, they merge into one!' },
    { '@type': 'HowToStep', position: 3, name: 'Earn points', text: 'Merging tiles adds their value to your total score.' },
    { '@type': 'HowToStep', position: 4, name: 'Reach 2048', text: 'Keep merging tiles until you create a tile with the number 2048.' },
    { '@type': 'HowToStep', position: 5, name: 'Don\'t get stuck', text: 'The game ends if the grid is full and no more merges are possible.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is the goal of 2048?', acceptedAnswer: { '@type': 'Answer', text: 'The goal is to slide numbered tiles on a grid to combine them and create a tile with the number 2048.' } },
    { '@type': 'Question', name: 'How do you move tiles in 2048?', acceptedAnswer: { '@type': 'Answer', text: 'On a computer, use the arrow keys (Up, Down, Left, Right). On mobile, swipe in the desired direction.' } },
    { '@type': 'Question', name: 'Can you keep playing after 2048?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, most versions allow you to continue playing to reach even higher numbers like 4096 or 8192.' } },
    { '@type': 'Question', name: 'What happens when the board is full?', acceptedAnswer: { '@type': 'Answer', text: 'If the board is full and there are no adjacent tiles with the same value, the game is over.' } },
    { '@type': 'Question', name: 'Is 2048 a game of skill or luck?', acceptedAnswer: { '@type': 'Answer', text: 'While the appearance of new tiles (2 or 4) involves luck, the movement and merging require strategy and skill.' } },
    { '@type': 'Question', name: 'Does the game save my progress?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, our version saves your high score and current board to your browser\'s local storage.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: '2048 Game', item: 'https://omniwebkit.com/tools/game-2048' },
  ],
};

export default function Game2048Layout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="game-2048" category="games" />
    </>
  );
}
