export const metadata = {
  title: 'Word to PDF Converter | True Formatting | OmniWebKit',
  description: 'Convert Word documents (DOC, DOCX) to PDF with 100% true formatting. Uses advanced server-side rendering to preserve fonts, margins, page breaks, and tables flawlessly.',
  keywords: [
    'word to pdf', 'convert doc to pdf', 'convert docx to pdf',
    'word to pdf true formatting', 'preserve formatting word to pdf',
    'free word to pdf converter', 'online word to pdf'
  ],
  openGraph: {
    title: 'Word to PDF Converter | True Formatting | OmniWebKit',
    description: 'Convert Word documents (DOC, DOCX) to PDF with 100% true formatting. Secure, fast, and free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/word-to-pdf',
  },
};

import WordToPdfClient from './WordToPdfClient';

export default function WordToPdfPage() {
  return <WordToPdfClient />;
}