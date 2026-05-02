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
  return <WebhookTesterClient />;
}
