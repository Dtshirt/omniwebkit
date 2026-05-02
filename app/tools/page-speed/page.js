import PageSpeedClient from "./PageSpeedClient";

export const metadata = {
  title: "Free Page Speed Analyzer - Measure TTFB & Payload Size",
  description: "Test your website's performance instantly. Measure Time to First Byte (TTFB), total page payload size, and resource counts. Support for bulk CSV page speed testing.",
  keywords: ["page speed analyzer", "ttfb checker", "website performance test", "bulk page speed check", "seo tool", "check page payload"],
  openGraph: {
    title: "Free Page Speed Analyzer - Measure TTFB & Payload Size",
    description: "Test your website's performance instantly. Measure TTFB, total page payload size, and resource counts.",
    type: "website",
  },
};

export default function PageSpeedPage() {
  return <PageSpeedClient />;
}
