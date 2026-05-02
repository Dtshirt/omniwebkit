import HttpHeadersClient from "./HttpHeadersClient";

export const metadata = {
  title: "Free HTTP Header Checker - Inspect Server Security Headers",
  description: "Inspect the raw HTTP response headers of any URL. Check for critical security headers, Cache-Control, Server tags, and execute bulk CSV header audits.",
  keywords: ["http header checker", "check security headers", "server headers tool", "bulk header check", "seo tool", "cache control checker"],
  openGraph: {
    title: "Free HTTP Header Checker - Inspect Server Security Headers",
    description: "Inspect the raw HTTP response headers of any URL. Check for critical security headers and execute bulk CSV audits.",
    type: "website",
  },
};

export default function HttpHeadersPage() {
  return <HttpHeadersClient />;
}
