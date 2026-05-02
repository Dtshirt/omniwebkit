import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Email Validator — Check Email Address Format, Deliverability & Quality',
    description:
        'Free online email validator. Check any email address for RFC 5322 format, valid TLD, disposable provider, role-based address, and deliverability. Bulk check and CSV export. No login required.',
    keywords: [
        'email validator online free',
        'check email address validity',
        'email format checker',
        'bulk email validator',
        'email deliverability checker',
        'disposable email detector',
        'email address verification tool',
        'RFC 5322 email validator',
        'validate email address online',
        'email quality checker',
    ],
    openGraph: {
        title: 'Free Email Validator — Check Email Format, Deliverability & Quality Score',
        description:
            'Validate email addresses for format, valid domain, disposable provider detection, and quality score. Bulk check up to hundreds of emails at once and export results as CSV. Free, browser-based.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/email-validator',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Email Validator — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Email Validator — Format, Deliverability & Quality Score',
        description: 'Check email addresses for RFC 5322 format, valid TLD, disposable/role-based detection, and quality score. Bulk mode with CSV export. Free.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/email-validator',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Email Validator',
    description:
        'Free browser-based email address validator running ten checks: RFC 5322 format compliance, valid top-level domain, local part length (1–64 chars), no consecutive or edge dots, domain length (max 253 chars), domain hyphen placement, disposable email detection (40+ providers), role-based address detection (16 patterns), recognized consumer provider check, and a 0–100% quality score. Single mode with live real-time validation as you type. Bulk mode validates hundreds of addresses at once with filter (all/valid/invalid) and CSV download.',
    url: 'https://omniwebkit.com/tools/email-validator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'RFC 5322 email format validation',
        'Valid TLD check (2+ characters required)',
        'Local part length validation (1–64 chars)',
        'Consecutive dot and edge dot detection',
        'Domain length check (max 253 chars)',
        'Domain hyphen placement validation',
        'Disposable email provider detection (40+ providers)',
        'Role-based address detection (admin, info, noreply, etc.)',
        'Recognized consumer email provider check',
        '0–100% quality score',
        'Live real-time validation as you type (single mode)',
        'Bulk email validation for hundreds of addresses',
        'Filter results by valid / invalid',
        'Download results as CSV file',
        'Paste from clipboard in bulk mode',
        'No server upload — fully browser-based and private',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Validate an Email Address Online for Free',
    description: 'Steps to check email address validity using the OmniWebKit Email Validator.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Choose single or bulk mode', text: 'Select Single Email to check one address, or Bulk Check to validate multiple addresses at once.' },
        { '@type': 'HowToStep', position: 2, name: 'Enter the email address(es)', text: 'In single mode, type the email address in the input field. Validation happens live as you type. In bulk mode, paste one email per line — use the Paste from clipboard shortcut for convenience.' },
        { '@type': 'HowToStep', position: 3, name: 'Click Validate', text: 'Click Validate Email (single) or Validate All (bulk). Results appear immediately with a pass/fail status for each of the ten checks.' },
        { '@type': 'HowToStep', position: 4, name: 'Review the quality score and checks', text: 'Each address gets a quality score from 0–100%. Green indicates a high-quality address. Amber flagged warnings (like role-based). Red indicates critical failures.' },
        { '@type': 'HowToStep', position: 5, name: 'Export or filter results', text: 'In bulk mode, filter by valid or invalid addresses, then click Download CSV to export the results as a spreadsheet-compatible file.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this email validator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account, no subscription, no usage limits. Both single and bulk modes are fully available.' } },
        { '@type': 'Question', name: 'Does it check if an email inbox actually exists?', acceptedAnswer: { '@type': 'Answer', text: 'No — real-time SMTP mailbox verification requires server-side access and cannot be done in a browser. We validate format, domain structure, and known-bad addresses. This catches the vast majority of invalid emails.' } },
        { '@type': 'Question', name: 'What is a disposable email address?', acceptedAnswer: { '@type': 'Answer', text: 'A disposable email is a temporary address (like those from Mailinator or Guerrilla Mail) used to bypass registration. Our tool detects 40+ known disposable providers.' } },
        { '@type': 'Question', name: 'Can I validate multiple emails at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to Bulk Check mode and paste one email per line. After validation, filter by valid/invalid and download the results as a CSV file.' } },
        { '@type': 'Question', name: 'What does the quality score mean?', acceptedAnswer: { '@type': 'Answer', text: 'The quality score is a 0–100% rating based on how many of the ten validation checks the address passes. 80%+ is high quality; 50–79% has minor issues; below 50% indicates critical failures.' } },
        { '@type': 'Question', name: 'Is my data sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All validation runs entirely in your browser using JavaScript. Your email addresses are never uploaded to any external server.' } },
        { '@type': 'Question', name: 'What is a role-based email address?', acceptedAnswer: { '@type': 'Answer', text: 'Role-based addresses (admin@, info@, support@, noreply@) go to a team inbox rather than a specific person. They are flagged with a warning because they often have low engagement and may bounce for transactional emails.' } },
        { '@type': 'Question', name: 'Can I export the validation results?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. After bulk validation, click Download CSV to save the results as a .csv file containing the email, status, quality score, and domain for each entry.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Email Validator', item: 'https://omniwebkit.com/tools/email-validator' },
    ],
};

export default function EmailValidatorLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="email-validator" category="utility" />
        </>
    );
}
