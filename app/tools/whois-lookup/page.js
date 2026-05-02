import WhoisClient from "./WhoisClient";

export const metadata = {
  title: "Free WHOIS Lookup - Check Domain Owner, Registrar & Expiry",
  description: "Instantly look up WHOIS domain registration data. Find owner details, registrar, creation date, expiry date, nameservers, and run bulk domain lookups via CSV.",
  keywords: ["whois lookup", "domain owner checker", "domain expiry checker", "domain registration info", "bulk whois checker", "find domain registrar"],
  openGraph: {
    title: "Free WHOIS Lookup - Check Domain Owner, Registrar & Expiry",
    description: "Instantly look up WHOIS domain registration data including owner, registrar, expiry, and nameservers.",
    type: "website",
  },
};

export default function WhoisPage() {
  return <WhoisClient />;
}
