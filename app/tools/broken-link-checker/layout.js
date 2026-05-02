import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Broken Link Checker — Find Dead Links on Any Webpage Online',
    description:
        'Check any webpage for broken links instantly. Find 404 errors, dead links, and server errors that hurt your SEO. Filter results, see Link Health Score, and export a CSV report. Free, no login.',
    keywords: [
        'broken link checker free online',
        'dead link finder tool',
        'check website for broken links',
        '404 link checker',
        'website link audit tool',
        'find broken links on webpage',
        'SEO broken link scanner',
        'HTTP status code checker',
        'dead link detector online',
        'website health checker tool',
    ],
    openGraph: {
        title: 'Free Broken Link Checker — Find Dead Links & 404 Errors Online',
        description:
            'Scan any webpage for broken links. Find 404 errors, redirects, and dead links in seconds. Filter results, view Link Health Score, and export CSV. Free and instant.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/broken-link-checker',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Broken Link Checker — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Broken Link Checker — Scan Any Page for Dead Links',
        description: 'Enter a URL and instantly find every broken link, 404 error, and redirect on the page. Export CSV. Free with no login.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/broken-link-checker',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Broken Link Checker',
    description:
        'Free online broken link checker. Enter any webpage URL, and the tool fetches the page HTML via a server-side proxy, extracts all anchor links, and verifies each one using its HTTP response code. Results are categorised as Working (200), Redirect (301/302), or Broken (404, 500, Error). Results show a Link Health Score and can be filtered and exported as a CSV file.',
    url: 'https://omniwebkit.com/tools/broken-link-checker',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Scans any public webpage for broken links',
        'Server-side proxy for CORS-free link fetching',
        'Extracts all anchor links from page HTML',
        'Checks HTTP status codes: 200, 301, 302, 403, 404, 500, etc.',
        'Link Health Score percentage indicator',
        'Filter results: All, Broken, Working',
        'Summary stats: Total, Working, Broken, Redirects',
        'One-click CSV export of full results',
        'Copy report to clipboard as plain text',
        'Broken links sorted first in results',
        'Live progress bar during scanning',
        'No account or login required',
        'Free with no usage limits',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Check a Website for Broken Links Online for Free',
    description: 'Steps to find broken links on any webpage using the OmniWebKit Broken Link Checker.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Enter the page URL', text: 'Type or paste the full URL of the webpage you want to scan for broken links. Include the https:// prefix.' },
        { '@type': 'HowToStep', position: 2, name: 'Click Check Links', text: 'Click the Check Links button. The tool fetches the page HTML, extracts all anchor links, and begins checking each for a valid HTTP response.' },
        { '@type': 'HowToStep', position: 3, name: 'Review the results', text: 'When the scan is complete, view the Link Health Score, summary stats, and the full colour-coded link list. Use the filter tabs to view only broken or only working links.' },
        { '@type': 'HowToStep', position: 4, name: 'Export the report', text: 'Click Export CSV to download the results, or Copy Report to copy the summary to your clipboard.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Is this broken link checker free to use?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% free. No account, no subscription. Enter any URL and check as many pages as you need.' },
        },
        {
            '@type': 'Question',
            name: 'What types of links does the checker find?',
            acceptedAnswer: { '@type': 'Answer', text: 'The tool extracts all anchor (<a href="...">) links from the page HTML, excluding internal page anchors (#fragment), mailto:, tel:, and javascript: links, as these cannot be verified with an HTTP status code.' },
        },
        {
            '@type': 'Question',
            name: 'Why does a 404 link still work in my browser?',
            acceptedAnswer: { '@type': 'Answer', text: 'The tool verifies links by checking their HTTP status code via a server-side request. Some websites block automated requests and return a 403 or 404, even though the page loads normally in a browser. Always verify these manually before removing a link.' },
        },
        {
            '@type': 'Question',
            name: 'What is the Link Health Score?',
            acceptedAnswer: { '@type': 'Answer', text: 'The Link Health Score is the percentage of total links on the page that returned a 200 OK status. A score of 90% or higher is excellent. Below 70% indicates significant maintenance work is needed.' },
        },
        {
            '@type': 'Question',
            name: 'Can I export the broken link report?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Export CSV to download a file with all link URLs, HTTP status codes, and working/broken status. You can open this in Excel or Google Sheets.' },
        },
        {
            '@type': 'Question',
            name: 'Why does the tool fail to scan some pages?',
            acceptedAnswer: { '@type': 'Answer', text: 'Some websites block server-side crawlers using Cloudflare, bot detection, or authentication walls. If the tool cannot fetch the page, it will show an error message. In these cases, use a browser extension or dedicated crawling tool.' },
        },
        {
            '@type': 'Question',
            name: 'What does a 301 redirect mean in link checking?',
            acceptedAnswer: { '@type': 'Answer', text: 'A 301 means the linked resource has permanently moved to a new URL. The link technically works but redirects the user. For SEO, updating the link to point directly to the new URL avoids an unnecessary redirect hop and preserves link equity.' },
        },
        {
            '@type': 'Question',
            name: 'How is this different from a backlink checker?',
            acceptedAnswer: { '@type': 'Answer', text: 'This tool checks links on a page (outbound and internal links from the page you enter). A backlink checker verifies links from external sites pointing to your pages. For backlink verification, use the OmniWebKit Backlink Auditor.' },
        },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Broken Link Checker', item: 'https://omniwebkit.com/tools/broken-link-checker' },
    ],
};

export default function BrokenLinkCheckerLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="broken-link-checker" category="seo" />
        </>
    );
}
