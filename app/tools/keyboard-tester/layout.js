import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Keyboard Tester Online — Test Every Key on Your Keyboard Instantly',
  description:
    'Free online keyboard tester. Press any key to see it light up on the on-screen keyboard diagram. Tests all keys including F-keys, numpad, modifier keys, and arrow keys. Shows key code, event code, and key character for developers. No download needed.',
  keywords: [
    'keyboard tester online free',
    'keyboard key tester online',
    'test keyboard keys online free',
    'keyboard test all keys',
    'online keyboard tester no download',
    'keyboard ghosting tester online',
    'keyboard key not working tester',
    'mechanical keyboard tester online free',
    'laptop keyboard tester online',
    'keyboard event code tester online',
  ],
  openGraph: {
    title: 'Free Keyboard Tester — Test Every Key Online Instantly',
    description:
      'Test every key on your keyboard online. Keys light up green when pressed and blue when tested. Includes numpad, F-keys, modifiers, and key code display for developers.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/keyboard-tester',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Keyboard Tester — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Keyboard Tester — Test Every Key Online Instantly',
    description: 'Press any key to test it. Full keyboard diagram with numpad, F-keys, and key code display for developers. Free, no install.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/keyboard-tester',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Keyboard Tester',
  description:
    'Free browser-based keyboard tester. Press any key on your physical keyboard to see it highlighted in real time on an on-screen keyboard diagram. Features: three-state key highlighting (not tested = grey, tested = blue, currently pressed = green); live progress bar showing percentage of keys tested; Last Key panel showing key character (e.key), event code (e.code), and legacy keyCode for every keypress; full keyboard layout including F1–F12, all alphanumeric keys, modifier keys (Shift/Ctrl/Alt/Win/Meta), Escape, Tab, Caps Lock, Backspace, Enter, Space, Backslash, and all punctuation; arrow key cluster; full numpad with NumLock, Numpad 0–9, divide, multiply, minus, plus, Enter, decimal; reset button to start a new test. All processing browser-based — no keylog data transmitted.',
  url: 'https://omniwebkit.com/tools/keyboard-tester',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Real-time key highlighting: grey (untested), blue (tested), green (currently pressed)',
    'Full keyboard layout: alphanumeric, F1–F12, modifiers, special keys',
    'Full numpad: 0–9, divide, multiply, minus, plus, enter, decimal, NumLock',
    'Arrow key cluster',
    'Progress bar with percentage of keys tested',
    'Last Key panel: key character, event.code, and keyCode',
    'Reset button to clear all tested keys and start over',
    'No software download or installation required',
    'No keylog data transmitted — all processing browser-based',
    'Works on Windows, Mac, Linux, and Chromebook keyboards',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Test Your Keyboard Online',
  description: 'Steps to test all keys on your keyboard using the OmniWebKit Keyboard Tester.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Open the tool and click on the page', text: 'Open the Keyboard Tester page and click anywhere on the page to make sure the browser has focus for keyboard events.' },
    { '@type': 'HowToStep', position: 2, name: 'Press each key', text: 'Press each key on your physical keyboard. Each key lights up green while pressed and turns blue after it has been tested.' },
    { '@type': 'HowToStep', position: 3, name: 'Check for missing keys', text: 'Any key that does not light up when pressed is either not working or being intercepted by your operating system (common for Print Screen, Win key, etc.).' },
    { '@type': 'HowToStep', position: 4, name: 'Review the Last Key panel', text: 'Check the Last Key panel to see the key character, event code, and keyCode for the last key pressed. Useful for developers debugging keyboard events.' },
    { '@type': 'HowToStep', position: 5, name: 'Track progress and reset', text: 'Watch the progress bar to see how many keys you\'ve tested. Click Reset to clear all tested keys and start a fresh test.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Why isn\'t a key lighting up when I press it?', acceptedAnswer: { '@type': 'Answer', text: 'If a key doesn\'t light up, the browser is not receiving the keydown event. This usually means the key is physically damaged or the switch has failed. Some system keys (Win, Print Screen) may be intercepted by the OS.' } },
    { '@type': 'Question', name: 'Why doesn\'t the Win/Meta key work?', acceptedAnswer: { '@type': 'Answer', text: 'The Windows/Meta key is often intercepted by the OS before it reaches the browser. Pressing Win alone opens the Start Menu. It may work in some browsers on some operating systems.' } },
    { '@type': 'Question', name: 'What is keyboard ghosting?', acceptedAnswer: { '@type': 'Answer', text: 'Ghosting happens when pressing multiple keys simultaneously causes some keypresses not to register, due to hardware limitations in the keyboard\'s key rollover capability.' } },
    { '@type': 'Question', name: 'What is the difference between event.key and event.code?', acceptedAnswer: { '@type': 'Answer', text: 'event.key is the character produced by the key (changes with Shift/language layout). event.code is the physical key location, independent of layout (e.g. "KeyA" is always the A key physical position).' } },
    { '@type': 'Question', name: 'Does this tool work with mechanical keyboards?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. This tool works with any keyboard that connects to your computer — mechanical, membrane, laptop, gaming, and wireless keyboards all work.' } },
    { '@type': 'Question', name: 'Is my typing data collected?', acceptedAnswer: { '@type': 'Answer', text: 'No. Keyboard events are processed entirely in your browser. No keylog data is sent to any server. This tool cannot see what you type in other applications.' } },
    { '@type': 'Question', name: 'Can I test numpad keys?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The full numpad is shown separately on the right side of the keyboard diagram, including NumLock, 0–9, arithmetic operators, decimal, and numpad Enter.' } },
    { '@type': 'Question', name: 'Does this work on laptops?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. This keyboard tester works on laptop keyboards. Note that laptops often don\'t have a dedicated numpad — those keys won\'t be present on the physical keyboard, so they won\'t be testable.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Keyboard Tester', item: 'https://omniwebkit.com/tools/keyboard-tester' },
  ],
};

export default function KeyboardTesterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="keyboard-tester" category="misc" />
    </>
  );
}
