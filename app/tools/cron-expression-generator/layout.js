import RelatedTools from '@/components/seo/RelatedTools';
import SeoContentSection from '@/components/seo/SeoContentSection';
import { seoData } from '@/lib/seoData';

const toolSeo = seoData['cron-expression-generator'];

export const metadata = toolSeo ? {
    title: toolSeo.title,
    description: toolSeo.description,
    keywords: toolSeo.keywords?.join(', '),
    robots: { index: true, follow: true },
    alternates: {
        canonical: toolSeo.canonical,
    },
    openGraph: {
        title: toolSeo.title,
        description: toolSeo.description,
        url: toolSeo.canonical,
        siteName: 'OmniWebKit',
        type: 'website',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: toolSeo.name + ' - OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: toolSeo.title,
        description: toolSeo.description,
    },
} : {
    title: 'OmniWebKit - Free Online Tools',
    description: 'Free online tool by OmniWebKit.',
    robots: { index: true, follow: true },
};

export default function ToolLayout({ children }) {
    const jsonLd = toolSeo ? {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebApplication',
                name: toolSeo.name,
                url: toolSeo.canonical,
                description: toolSeo.description,
                applicationCategory: 'UtilitiesApplication',
                operatingSystem: 'Any',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
                    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
                    { '@type': 'ListItem', position: 3, name: toolSeo.name, item: toolSeo.canonical },
                ],
            },
            ...(toolSeo.faq && toolSeo.faq.length > 0 ? [{
                '@type': 'FAQPage',
                mainEntity: toolSeo.faq.map(f => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
            }] : []),
        ],
    } : null;

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            {children}
      <RelatedTools currentToolId="cron-expression-generator" category="dev" />
            {toolSeo && <SeoContentSection toolSeo={toolSeo} />}
        </>
    );
}
