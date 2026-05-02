import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Online robots.txt Generator — Build Your File in Seconds',
    description:
        'Free online robots.txt generator with 5 presets (WordPress, Next.js, E-commerce). Visual editor for User-agent rules, Allow/Disallow paths, sitemaps, crawl-delay. Download or copy. No signup.',
    keywords: [
        'robots txt generator free online',
        'create robots txt file',
        'robots txt generator wordpress',
        'robots txt builder online',
        'robots txt file generator free',
        'robots txt generator nextjs',
        'robots txt maker online',
        'robots txt ecommerce',
        'free robots txt tool',
        'robots txt generator with sitemap',
    ],
    openGraph: {
        title: 'Free robots.txt Generator — 5 Presets, Visual Editor',
        description:
            'Build robots.txt visually. 5 presets, User-agent rules, sitemaps, crawl-delay. Download or copy. Free, browser-based.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/robots-txt-generator',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'robots.txt Generator — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free robots.txt Generator',
        description: 'Build robots.txt with presets and visual editor. Download or copy. Free, no signup.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/robots-txt-generator',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'robots.txt Generator',
    description:
        'Free browser-based robots.txt generator with visual editor. 5 one-click presets: Allow All, Block All, WordPress, Next.js, E-commerce. Features: multiple User-agent rules, Allow and Disallow path editor with colour-coded inputs, sitemap URLs, crawl-delay setting, host directive, live output preview with dark code theme, line and character count, copy to clipboard, download as robots.txt file. All processing browser-based. No server, no signup.',
    url: 'https://omniwebkit.com/tools/robots-txt-generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        '5 one-click presets: Allow All, Block All, WordPress, Next.js, E-commerce',
        'Multiple User-agent rules with add/remove',
        'Colour-coded Allow (green) and Disallow (red) path inputs',
        'Sitemap URL management with add/remove',
        'Crawl-delay and Host directive settings',
        'Live output preview with dark code theme',
        'Line and character count display',
        'Copy output to clipboard',
        'Download as robots.txt file',
        'Responsive 2-column layout with sticky preview',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Create a robots.txt File Online for Free',
    description: 'Steps to create a robots.txt file using the OmniWebKit robots.txt Generator.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Choose a preset', text: 'Click a preset (Allow All, Block All, WordPress, Next.js, or E-commerce) as a starting point.' },
        { '@type': 'HowToStep', position: 2, name: 'Edit rules', text: 'Add or remove User-agent rules. Specify Allow and Disallow paths for each agent.' },
        { '@type': 'HowToStep', position: 3, name: 'Add sitemaps', text: 'Enter your sitemap URLs so crawlers can discover all your pages.' },
        { '@type': 'HowToStep', position: 4, name: 'Set extras', text: 'Optionally set a crawl-delay and host directive.' },
        { '@type': 'HowToStep', position: 5, name: 'Download or copy', text: 'Copy the output or download as robots.txt. Upload to your website root directory.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this robots.txt generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no limits, and no data collection.' } },
        { '@type': 'Question', name: 'Where do I put the robots.txt file?', acceptedAnswer: { '@type': 'Answer', text: 'Upload it to your website root: https://yourdomain.com/robots.txt.' } },
        { '@type': 'Question', name: 'Does robots.txt block pages from Google?', acceptedAnswer: { '@type': 'Answer', text: 'It tells crawlers not to crawl pages, but does not prevent indexing. Use noindex meta tags for that.' } },
        { '@type': 'Question', name: 'What is crawl-delay?', acceptedAnswer: { '@type': 'Answer', text: 'It requests crawlers wait seconds between requests. Google ignores it; Bing and Yandex honour it.' } },
        { '@type': 'Question', name: 'Can I have multiple User-agent blocks?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Create separate rules for Googlebot, Bingbot, etc.' } },
        { '@type': 'Question', name: 'What is the Sitemap directive?', acceptedAnswer: { '@type': 'Answer', text: 'It points crawlers to your XML sitemap using the full URL.' } },
        { '@type': 'Question', name: 'Do I need a robots.txt file?', acceptedAnswer: { '@type': 'Answer', text: 'Strongly recommended. Without one, crawlers access everything.' } },
        { '@type': 'Question', name: 'Does this tool send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Everything runs in your browser.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'robots.txt Generator', item: 'https://omniwebkit.com/tools/robots-txt-generator' },
    ],
};

export default function RobotsTxtGeneratorLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="robots-txt-generator" category="seo" />
        </>
    );
}
