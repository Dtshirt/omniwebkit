export const metadata = {
  title: 'PDF OCR Online Free — Convert Scanned PDF to Searchable Text',
  description: 'Make scanned PDFs searchable and editable using free online OCR. Extract text from scanned documents accurately. Supports multiple languages. No signup needed.',
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
