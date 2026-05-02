import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free UTM Link Builder Online — Campaign URL Generator with Parameters',
    description:
        'Free online UTM link builder. Add utm_source, utm_medium, utm_campaign, utm_term, utm_content to any URL. Quick presets. Copy to clipboard. No signup.',
    keywords: [
        'utm link builder free',
        'utm url generator online',
        'campaign url builder free',
        'utm parameter generator',
        'google analytics utm builder',
        'utm tag creator free',
        'utm campaign link builder',
        'free utm url builder tool',
        'utm tracking link generator',
        'utm builder tool online',
    ],
    openGraph: {
        title: 'Free UTM Link Builder — Campaign URL Generator',
        description:
            'Build UTM-tagged campaign URLs with presets. Free, no signup.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/utm-link-builder',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'UTM Link Builder — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free UTM Link Builder Online',
        description: 'Build campaign URLs with UTM parameters. Presets for Google, Facebook, Email. Free.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/utm-link-builder',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'UTM Link Builder',
    description:
        'Free browser-based UTM link builder. 5 UTM parameters: source, medium, campaign, term, content. Quick presets for Google Ads, Facebook, Email, Twitter/X, LinkedIn, Instagram. Live URL preview, copy to clipboard, URL validation with auto https, session history (last 10 URLs), toast notifications, responsive layout. No server, no signup.',
    url: 'https://omniwebkit.com/tools/utm-link-builder',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        '5 UTM parameters: source, medium, campaign, term, content',
        'Quick presets for Google Ads, Facebook, Email, Twitter/X, LinkedIn, Instagram',
        'Live URL preview updates as you type',
        'Copy to clipboard with toast notification',
        'Auto https:// prepend and URL validation',
        'URL-encodes all parameters correctly',
        'Session history tracks last 10 URLs',
        'Reset button clears all fields',
        'Open generated URL in new tab',
        'Fully responsive layout',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Build a UTM-Tagged URL',
    description: 'Steps to create a campaign URL with UTM parameters using OmniWebKit.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Enter your URL', text: 'Paste your landing page URL into the Website URL field.' },
        { '@type': 'HowToStep', position: 2, name: 'Choose a preset or fill manually', text: 'Click a quick preset (Google Ads, Facebook, etc.) or fill in the UTM fields manually.' },
        { '@type': 'HowToStep', position: 3, name: 'Fill campaign name', text: 'Enter a campaign name like spring_sale or product_launch.' },
        { '@type': 'HowToStep', position: 4, name: 'Copy the URL', text: 'Click Copy URL. The tagged link is copied to your clipboard.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this UTM builder free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
        { '@type': 'Question', name: 'What are UTM parameters?', acceptedAnswer: { '@type': 'Answer', text: 'Tags added to URLs that tell analytics tools where traffic came from.' } },
        { '@type': 'Question', name: 'Which parameters are required?', acceptedAnswer: { '@type': 'Answer', text: 'utm_source, utm_medium, and utm_campaign. Term and content are optional.' } },
        { '@type': 'Question', name: 'Does it work with Google Analytics?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. UTM parameters are the standard for GA, GA4, and most platforms.' } },
        { '@type': 'Question', name: 'Are links stored on a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Links are in session memory only. Nothing is sent to any server.' } },
        { '@type': 'Question', name: 'Does it URL-encode parameters?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Uses the native URL API for correct encoding.' } },
        { '@type': 'Question', name: 'Can I use it with a URL shortener?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Build the UTM URL here, then shorten it with any shortener.' } },
        { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive layout.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'UTM Link Builder', item: 'https://omniwebkit.com/tools/utm-link-builder' },
    ],
};

export default function UtmLinkBuilderLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="utm-link-builder" category="seo" />
        </>
    );
}
