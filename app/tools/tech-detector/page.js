import TechDetectorClient from "./TechDetectorClient";

export const metadata = {
  title: "Website Technology Detector — Find CMS, Framework & Analytics",
  description:
    "Instantly detect the technology stack of any website. Find CMS (WordPress, Shopify), frameworks (Next.js, React), analytics tools, CDN, server type, and security headers.",
  keywords: [
    "website technology detector",
    "tech stack checker",
    "what cms is this site using",
    "detect wordpress shopify",
    "website framework detector",
    "cdn checker",
    "web stack analyzer",
  ],
  openGraph: {
    title: "Website Technology Detector — Find CMS, Framework & Analytics",
    description:
      "Enter any URL to detect the CMS, framework, analytics, CDN, and server powering a website.",
    type: "website",
  },
};

export default function TechDetectorPage() {
  return <TechDetectorClient />;
}
