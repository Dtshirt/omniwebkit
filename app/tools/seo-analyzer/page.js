import SeoAnalyzerClient from "./SeoAnalyzerClient";

export const metadata = {
  title: "Free Website SEO Analyzer - Audit On-Page SEO Instantly",
  description: "Perform a complete on-page SEO audit for free. Analyze meta tags, headings, image alt attributes, and more. Support for bulk CSV URL analysis.",
  keywords: ["seo analyzer", "website seo audit", "on page seo checker", "bulk seo check", "seo tool", "check meta tags"],
  openGraph: {
    title: "Free Website SEO Analyzer - Audit On-Page SEO Instantly",
    description: "Perform a complete on-page SEO audit for free. Analyze meta tags, headings, and image alt attributes.",
    type: "website",
  },
};

export default function SeoAnalyzerPage() {
  return <SeoAnalyzerClient />;
}
