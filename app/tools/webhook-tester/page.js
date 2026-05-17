import WebhookTesterClient from "./WebhookTesterClient";

export const metadata = {
  title: "Free Webhook Tester - Inspect HTTP Requests in Real Time",
  description: "Generate a unique webhook URL and inspect incoming POST requests in real time. View headers, body, query params, and HTTP method for any webhook call.",
  keywords: ["webhook tester", "test webhook online", "webhook inspector", "http request inspector", "webhook receiver", "test http requests", "webhook debugger", "requestbin alternative"],
  openGraph: {
    title: "Free Webhook Tester - Inspect HTTP Requests in Real Time",
    description: "Get a unique URL, send HTTP requests to it, and inspect headers, body, and parameters in real time.",
    type: "website",
  },
};

export default function WebhookTesterPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Webhook Tester",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Lazydesigners",
      "url": "https://lazydesigners.com/"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <WebhookTesterClient />
    </>
  );
}
