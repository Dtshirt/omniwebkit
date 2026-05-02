import KeywordDensityClient from "./KeywordDensityClient";

export const metadata = {
  title: "Free Keyword Density Checker - TF-IDF Analyzer Tool",
  description: "Analyze keyword frequency and density percentage instantly. Extract the most important 1-word, 2-word, and 3-word phrases from any text or URL.",
  keywords: ["keyword density checker", "keyword frequency tool", "tf-idf analyzer", "seo text analysis", "bulk keyword density"],
  openGraph: {
    title: "Free Keyword Density Checker - TF-IDF Analyzer Tool",
    description: "Analyze keyword frequency and density percentage instantly. Extract the most important phrases from any text or URL.",
    type: "website",
  },
};

export default function KeywordDensityPage() {
  return <KeywordDensityClient />;
}
