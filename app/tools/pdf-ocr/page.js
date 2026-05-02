export const metadata = {
  title: 'PDF OCR | Convert Scanned PDF to Text | OmniWebKit',
  description: 'Fast, secure, hybrid PDF OCR. Extract text from scanned PDFs and images. Process small documents privately in your browser, or route large files to our secure servers.',
  keywords: [
    'pdf ocr', 'scanned pdf to text', 'pdf to text', 'ocr online',
    'extract text from pdf', 'free pdf ocr', 'convert scanned pdf',
    'image to text', 'optical character recognition'
  ],
  openGraph: {
    title: 'PDF OCR | Convert Scanned PDF to Text | OmniWebKit',
    description: 'Extract text from scanned PDFs safely. Process locally or use our secure servers for large files.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/pdf-ocr',
  },
};

import PdfOcrClient from './PdfOcrClient';

export default function PdfOcrPage() {
  return <PdfOcrClient />;
}
