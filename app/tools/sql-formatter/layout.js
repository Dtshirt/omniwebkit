import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'SQL Formatter Online Free — Beautify & Format SQL Queries',
    description:
        'Format and beautify SQL queries online for free. Supports MySQL, PostgreSQL, SQL Server & Oracle. Clean up messy SQL code with proper indentation & capitalization.',
    keywords: [
        'sql formatter online free',
        'sql beautifier online',
        'format sql query online',
        'sql formatter free tool',
        'sql minifier online',
        'beautify sql query free',
        'sql query formatter',
        'sql indent tool online',
        'free sql formatter tool',
        'sql syntax highlighter online',
    ],
    openGraph: {
        title: 'Free SQL Formatter — Beautify & Minify',
        description:
            'Format and beautify SQL queries with syntax highlighting. Minify mode available. Copy or download. Free.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/sql-formatter',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'SQL Formatter — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free SQL Formatter Online',
        description: 'Format, beautify, and minify SQL queries with syntax highlighting. Free, no signup.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/sql-formatter',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SQL Formatter',
    description:
        'Free browser-based SQL formatter and beautifier. Features: keyword uppercasing (100+ keywords), clause-level line breaks (SELECT, FROM, WHERE, JOIN, GROUP BY, ORDER BY, etc.), smart indentation for sub-clauses (AND, OR, ON), column expansion in SELECT, syntax highlighting (keywords blue, strings green, numbers pink, comments grey), minify mode for single-line compression, 4 sample queries, copy to clipboard, download as .sql file, toast notifications. All processing client-side. No server, no signup.',
    url: 'https://omniwebkit.com/tools/sql-formatter',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Format SQL with proper indentation and line breaks',
        'Uppercase 100+ SQL keywords automatically',
        'Syntax highlighting: keywords, strings, numbers, comments',
        'Minify SQL into a single line',
        '4 built-in sample queries',
        'Copy formatted SQL to clipboard',
        'Download as .sql file',
        'Supports MySQL, PostgreSQL, SQLite, SQL Server',
        'Toast notification system',
        'Fully responsive layout',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Format SQL Online for Free',
    description: 'Steps to format and beautify SQL queries using the OmniWebKit SQL Formatter.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Paste your SQL', text: 'Enter or paste your SQL query in the input panel.' },
        { '@type': 'HowToStep', position: 2, name: 'Choose mode', text: 'Select Format for readable output or Minify for single-line compression.' },
        { '@type': 'HowToStep', position: 3, name: 'Click Format/Minify', text: 'The formatted output appears with syntax highlighting in the output panel.' },
        { '@type': 'HowToStep', position: 4, name: 'Copy or download', text: 'Copy the output to clipboard or download it as a .sql file.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this SQL formatter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
        { '@type': 'Question', name: 'What SQL dialects are supported?', acceptedAnswer: { '@type': 'Answer', text: 'Standard SQL compatible with MySQL, PostgreSQL, SQLite, SQL Server, and Oracle.' } },
        { '@type': 'Question', name: 'Does it change query logic?', acceptedAnswer: { '@type': 'Answer', text: 'No. Only formatting is changed — whitespace, indentation, and letter case.' } },
        { '@type': 'Question', name: 'Can I download the formatted SQL?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Download as a .sql file with one click.' } },
        { '@type': 'Question', name: 'What is minify mode?', acceptedAnswer: { '@type': 'Answer', text: 'Compresses SQL into a single line by removing whitespace.' } },
        { '@type': 'Question', name: 'Does it handle comments?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Single-line comments (--) are preserved and highlighted.' } },
        { '@type': 'Question', name: 'Does it send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Everything runs in your browser.' } },
        { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive layout.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'SQL Formatter', item: 'https://omniwebkit.com/tools/sql-formatter' },
    ],
};

export default function SqlFormatterLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="sql-formatter" category="dev" />
        </>
    );
}
