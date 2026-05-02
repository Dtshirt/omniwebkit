import DnsLookupClient from "./DnsLookupClient";

export const metadata = {
  title: "Free DNS Lookup Tool - Query A, AAAA, MX, TXT, NS Records",
  description: "Perform instant DNS lookups online. Check A, AAAA, MX, TXT, and NS records for any domain. Support for single queries and bulk CSV batch lookups.",
  keywords: ["dns lookup", "check dns records", "mx record lookup", "txt record lookup", "bulk dns lookup", "domain dns check", "nslookup online"],
  openGraph: {
    title: "Free DNS Lookup Tool - Query A, AAAA, MX, TXT, NS Records",
    description: "Perform instant DNS lookups online. Check A, AAAA, MX, TXT, and NS records for any domain.",
    type: "website",
  },
};

export default function DnsLookupPage() {
  return <DnsLookupClient />;
}
