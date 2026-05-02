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
  return <RedirectCheckerClient />;
}
