import RedirectCheckerClient from "./RedirectCheckerClient";

export const metadata = {
  title: "Free Redirect Chain Checker - Trace 301 & 302 Redirects",
  description: "Trace the exact path of any URL. Discover hidden 301 and 302 redirect chains, check final destination status codes, and perform bulk CSV redirect checks.",
  keywords: ["redirect checker", "301 redirect trace", "redirect chain checker", "bulk redirect checker", "where does this link go", "seo redirect analysis"],
  openGraph: {
    title: "Free Redirect Chain Checker - Trace 301 & 302 Redirects",
    description: "Trace the exact path of any URL. Discover hidden 301 and 302 redirect chains and perform bulk CSV redirect checks.",
    type: "website",
  },
};

export default function RedirectCheckerPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Redirect Chain Checker",
    "description": "Trace the exact path of any URL. Discover hidden 301 and 302 redirect chains, check final destination status codes, and perform bulk CSV redirect checks.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "url": "https://omniwebkit.com/tools/redirect-checker",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Lazydesigners",
      "url": "https://github.com/Dtshirt/omniwebkit"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <RedirectCheckerClient />
    </>
  );
}
