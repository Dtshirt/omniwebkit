import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'EMI Calculator Online Free — Calculate Loan EMI & Interest Easily',
    description:
        'Calculate your loan EMI, total interest & payment schedule instantly. Home loan, car loan & personal loan EMI calculator online free. Fast, accurate results.',
    keywords: [
        'loan EMI calculator online free',
        'home loan EMI calculator',
        'car loan EMI calculator online',
        'personal loan EMI calculator free',
        'EMI calculator with amortization schedule',
        'loan calculator monthly payment online',
        'education loan EMI calculator free',
        'EMI calculator India free',
        'loan interest calculator online',
        'prepayment savings calculator online',
    ],
    openGraph: {
        title: 'Free Loan EMI Calculator — Home, Car & Personal Loan EMI Online',
        description:
            'Calculate monthly EMI, total interest, and amortization schedule for any loan. Includes prepayment savings calculator. Free, instant, no signup.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/loan-emi-calculator',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Loan EMI Calculator — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Loan EMI Calculator — Home, Car & Personal Loan EMI Online',
        description: 'Calculate monthly EMI, total interest, and amortization schedule for home, car, personal, and education loans. Includes prepayment calculator.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/loan-emi-calculator',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Loan EMI Calculator',
    description:
        'Free browser-based loan EMI calculator using standard reducing-balance formula. Calculates: monthly EMI; total interest; total payment amount; principal vs interest percentage breakdown bar; month-by-month amortization schedule (first 12 + last 12 months); year-by-year amortization summary; yearly prepayment impact (interest saved and months saved). Loan type presets: Home Loan (₹50L, 8.5%, 20yr), Car Loan (₹8L, 9.5%, 7yr), Personal Loan (₹5L, 13%, 5yr), Education Loan (₹15L, 10.5%, 10yr). Currency support: ₹ (INR), $ (USD), € (EUR), £ (GBP). Tenure in years or months. All calculations browser-based.',
    url: 'https://omniwebkit.com/tools/loan-emi-calculator',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Monthly EMI calculation using standard reducing-balance formula',
        'Total interest and total payment calculation',
        'Principal vs interest breakdown percentage bar',
        'Month-by-month amortization schedule',
        'Year-by-year amortization summary toggle',
        'Yearly prepayment impact: interest saved and months saved',
        'Loan type presets: Home, Car, Personal, Education',
        'Currency support: INR (₹), USD ($), EUR (€), GBP (£)',
        'Loan amount and interest rate sliders for quick adjustment',
        'Tenure input in years or months',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Loan EMI Online',
    description: 'Steps to calculate monthly EMI and amortization schedule using the OmniWebKit Loan EMI Calculator.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Select a loan type preset or enter custom values', text: 'Click Home Loan, Car Loan, Personal Loan, or Education Loan to load typical values. Or type your loan amount, interest rate, and tenure directly.' },
        { '@type': 'HowToStep', position: 2, name: 'Adjust with sliders', text: 'Use the sliders below the loan amount and interest rate fields to quickly adjust values and see results update instantly.' },
        { '@type': 'HowToStep', position: 3, name: 'Review the results', text: 'The Monthly EMI, Total Interest, and Total Payment cards on the right update instantly. The payment breakdown bar shows the principal/interest split.' },
        { '@type': 'HowToStep', position: 4, name: 'View the amortization schedule', text: 'Scroll down to see the month-by-month schedule. Toggle between Monthly and Yearly views.' },
        { '@type': 'HowToStep', position: 5, name: 'Add a prepayment amount', text: 'Enter an optional annual prepayment to see how much interest you can save and how many months earlier the loan closes.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'What is an EMI?', acceptedAnswer: { '@type': 'Answer', text: 'EMI (Equated Monthly Instalment) is the fixed monthly payment you make to repay a loan. Each EMI consists of a principal component and an interest component, calculated using the reducing-balance method.' } },
        { '@type': 'Question', name: 'How is EMI calculated?', acceptedAnswer: { '@type': 'Answer', text: 'EMI = P × R × (1+R)^N / [(1+R)^N − 1], where P is the principal, R is the monthly interest rate (annual rate ÷ 12 ÷ 100), and N is the tenure in months.' } },
        { '@type': 'Question', name: 'Does a longer tenure reduce EMI?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, a longer tenure reduces your monthly EMI but significantly increases total interest paid. Always choose the shortest tenure you can comfortably afford.' } },
        { '@type': 'Question', name: 'How does prepayment help?', acceptedAnswer: { '@type': 'Answer', text: 'Annual prepayment reduces the outstanding principal, which lowers interest for all future months. This can save significant interest and close the loan years earlier.' } },
        { '@type': 'Question', name: 'What is an amortization schedule?', acceptedAnswer: { '@type': 'Answer', text: 'An amortization schedule shows the breakdown of each monthly payment — how much goes toward principal, how much toward interest, and what the remaining balance is after each payment.' } },
        { '@type': 'Question', name: 'Is this EMI calculator accurate?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. This uses the standard reducing-balance formula used by all banks. Minor differences may occur due to disbursement date, rounding, and processing date conventions used by your lender.' } },
        { '@type': 'Question', name: 'Does the calculator support USD, EUR, and GBP?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Select ₹, $, €, or £ from the currency selector. The formula and calculations are identical regardless of currency.' } },
        { '@type': 'Question', name: 'What is the difference between fixed and floating interest rates?', acceptedAnswer: { '@type': 'Answer', text: 'A fixed rate stays constant for the loan term. A floating (variable) rate changes with market rates (MCLR/repo rate in India). This calculator assumes a fixed rate throughout the tenure.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Loan EMI Calculator', item: 'https://omniwebkit.com/tools/loan-emi-calculator' },
    ],
};

export default function LoanEmiCalculatorLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="loan-emi-calculator" category="math" />
        </>
    );
}
