import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free URL Shortener Online — Custom Short Links, No Signup',
    description:
        'Free online URL shortener. Create short, shareable links with custom aliases. Stored locally. No account required. Instant copy to clipboard.',
    keywords: [
        'url shortener free online',
        'shorten url free',
        'custom short link generator',
        'link shortener tool free',
        'create short url free',
        'url shortener no signup',
        'free link shortener online',
        'custom alias url shortener',
        'short link creator free',
        'url shortener tool online',
    ],
    openGraph: {
        title: 'Free URL Shortener — Custom Short Links',
        description:
            'Create short, shareable links with custom aliases. No signup. Free.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/url-shortener',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'URL Shortener — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free URL Shortener Online',
        description: 'Shorten URLs with custom aliases. No signup. Free.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/url-shortener',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'URL Shortener',
    description:
        'Free browser-based URL shortener. Features: instant short link generation, custom alias support, auto https prepend, URL validation, auto copy to clipboard, localStorage persistence, link list with copy/visit/delete, clear all, duplicate alias detection, toast notifications, fully responsive. No server, no signup.',
    url: 'https://omniwebkit.com/tools/url-shortener',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Instant short link generation',
        'Custom alias support (alphanumeric, hyphens, underscores)',
        'Auto https:// prepend and URL validation',
        'Auto copy to clipboard on creation',
        'localStorage persistence across sessions',
        'Link list with copy, visit, and delete',
        'Clear all links in one click',
        'Duplicate alias detection',
        'Toast notification system',
        'Fully responsive layout',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Shorten a URL Online',
    description: 'Steps to create a short URL using the OmniWebKit URL Shortener.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Paste URL', text: 'Paste your long URL into the input field.' },
        { '@type': 'HowToStep', position: 2, name: 'Set alias (optional)', text: 'Enter a custom alias or leave blank for a random code.' },
        { '@type': 'HowToStep', position: 3, name: 'Click Shorten', text: 'Click Shorten URL. The short link is generated and copied.' },
        { '@type': 'HowToStep', position: 4, name: 'Share', text: 'Paste the short link anywhere — emails, social media, documents.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this URL shortener free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
        { '@type': 'Question', name: 'Do the short links redirect?', acceptedAnswer: { '@type': 'Answer', text: 'This generates the format. Actual redirection needs a backend server.' } },
        { '@type': 'Question', name: 'Where are links stored?', acceptedAnswer: { '@type': 'Answer', text: 'In your browser localStorage. They persist across sessions.' } },
        { '@type': 'Question', name: 'Can I use a custom alias?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter any alphanumeric alias with hyphens or underscores.' } },
        { '@type': 'Question', name: 'What about duplicate aliases?', acceptedAnswer: { '@type': 'Answer', text: 'The tool checks and rejects duplicates with an error message.' } },
        { '@type': 'Question', name: 'Does it track clicks?', acceptedAnswer: { '@type': 'Answer', text: 'The interface has a counter but actual tracking needs a server.' } },
        { '@type': 'Question', name: 'Does it send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Everything is 100% client-side.' } },
        { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive layout.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'URL Shortener', item: 'https://omniwebkit.com/tools/url-shortener' },
    ],
};

export default function UrlShortenerLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="url-shortener" category="utility" />
        </>
    );
}
