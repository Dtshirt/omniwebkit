import PdfSplitterClient from "./PdfSplitterClient";

export const metadata = {
  title: "Free PDF Splitter Online - Split PDF by Page Range or Chunks",
  description: "Split any PDF file online for free. Extract specific pages, split by page range, or divide into equal chunks. Small PDFs split instantly in-browser with no upload.",
  keywords: ["pdf splitter", "split pdf online", "extract pdf pages", "pdf page extractor", "divide pdf", "pdf cutter online free", "split pdf by page range"],
  openGraph: {
    title: "Free PDF Splitter Online - Split PDF by Page Range or Chunks",
    description: "Split PDF files by page range, every N pages, or extract specific pages. Instant browser splitting for small files.",
    type: "website",
  },
};

export default function PdfSplitterPage() {
  return <PdfSplitterClient />;
}
