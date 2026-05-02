import PdfRedactionClient from "./PdfRedactionClient";

export const metadata = {
  title: "Secure PDF Redaction Tool | OmniWebKit",
  description: "Permanently black out and remove sensitive text from PDF files. True content removal, not just a black overlay. Secure server-side processing.",
  keywords: ["pdf redaction", "redact pdf online", "remove text from pdf", "black out text pdf", "secure pdf editor", "privacy tool"],
  openGraph: {
    title: "Secure PDF Redaction Tool | OmniWebKit",
    description: "Permanently remove sensitive text from your PDFs with true content redaction.",
    type: "website",
  },
};

export default function PdfRedactionPage() {
  return <PdfRedactionClient />;
}
