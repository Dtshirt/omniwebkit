import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'API Tester Online Free — Test REST APIs Without Postman',
    description:
        'Test REST APIs directly in your browser for free. Send GET, POST, PUT, DELETE requests. Inspect responses with headers & body. Free online API client — no download.',
    keywords: [
        'API tester online',
        'free API testing tool',
        'REST API tester',
        'HTTP client online',
        'test API online free',
        'online Postman alternative',
        'API debugging tool',
        'JSON API tester',
        'send HTTP request browser',
        'REST client browser',
    ],
    openGraph: {
        title: 'API Tester — Free Online REST API Testing Tool',
        description:
            'Send HTTP requests, inspect responses, and debug REST APIs directly in your browser. Free, no login, no installation. Supports all HTTP methods, custom headers, query params, and JSON highlighting.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/api-tester',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'API Tester — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Online API Tester — Test REST APIs in Your Browser',
        description:
            'Send GET, POST, PUT, DELETE and more. Add headers, query params, and JSON body. See status codes and responses instantly. No install needed.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/api-tester',
    },
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Test a REST API Online for Free',
    description: 'Step-by-step guide to sending HTTP requests and inspecting responses using the OmniWebKit API Tester.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Enter the API URL', text: 'Type or paste the full API endpoint URL into the address bar. Or click a Quick Preset to load a real working API.' },
        { '@type': 'HowToStep', position: 2, name: 'Select an HTTP method', text: 'Choose GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS from the dropdown.' },
        { '@type': 'HowToStep', position: 3, name: 'Add headers and query parameters', text: 'Use the Headers tab to add Authorization tokens or Content-Type. Use the Params tab to add query parameters like page or limit.' },
        { '@type': 'HowToStep', position: 4, name: 'Add a request body for POST/PUT/PATCH', text: 'Switch to the Body tab and enter your JSON payload. Click Beautify JSON to auto-format it.' },
        { '@type': 'HowToStep', position: 5, name: 'Click Send', text: 'Click the Send button or press Enter. The response appears with status code, time, size, and body.' },
        { '@type': 'HowToStep', position: 6, name: 'Inspect the response', text: 'View the colour-highlighted JSON body or switch to the Headers tab to see all response headers. Copy the response with one click.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'Is this API tester free?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% free. No account, no installation, no usage limits. All requests are made directly from your browser.' },
        },
        {
            '@type': 'Question',
            name: 'What is the difference between this API tester and Postman?',
            acceptedAnswer: { '@type': 'Answer', text: 'Postman is a full desktop application with teams, environments, and automated testing. This tool is a lightweight browser-based alternative — faster to access, no installation needed, and perfect for quick tests and learning REST APIs.' },
        },
        {
            '@type': 'Question',
            name: 'Why am I getting a CORS error in the API tester?',
            acceptedAnswer: { '@type': 'Answer', text: 'CORS errors happen when the server does not allow requests from browser-based clients. This is a server-side restriction. You can work around it by using a CORS proxy, testing from the same origin, or using Curl or Postman which are not browser-based.' },
        },
        {
            '@type': 'Question',
            name: 'How do I test an API that requires an API key or Bearer token?',
            acceptedAnswer: { '@type': 'Answer', text: 'Go to the Headers tab and add a row with Key = Authorization and Value = Bearer YOUR_TOKEN. For API keys, add Key = X-API-Key and Value = your-key. You can also add keys as query parameters in the Params tab.' },
        },
        {
            '@type': 'Question',
            name: 'How do I send a POST request with a JSON body?',
            acceptedAnswer: { '@type': 'Answer', text: 'Select POST from the method dropdown. Add a Content-Type: application/json header. Switch to the Body tab, enter your JSON payload, and click Send. Use the Beautify JSON button to auto-format the payload first.' },
        },
        {
            '@type': 'Question',
            name: 'Does the API tester save my requests?',
            acceptedAnswer: { '@type': 'Answer', text: 'Your last 20 requests are saved in the session as History. Click any item to restore that URL and method. No data is saved to any server — everything stays in your browser and is cleared when you close the tab.' },
        },
        {
            '@type': 'Question',
            name: 'Can I add query parameters like ?page=2&limit=10?',
            acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the Params tab to add key-value pairs. The tool automatically URL-encodes and appends them to the URL. A live preview shows the final URL with all parameters.' },
        },
        {
            '@type': 'Question',
            name: 'What HTTP status codes does the API tester show?',
            acceptedAnswer: { '@type': 'Answer', text: 'The API tester displays the exact HTTP status code and status text for every response. It colour-codes them: green for 2xx success, blue for 3xx redirects, amber for 4xx client errors, and red for 5xx server errors.' },
        },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'API Tester', item: 'https://omniwebkit.com/tools/api-tester' },
    ],
};

export default function ApiTesterLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="api-tester" category="dev" />
        </>
    );
}
