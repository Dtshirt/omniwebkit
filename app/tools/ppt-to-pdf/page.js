export const metadata = {
  title: 'PowerPoint to PDF Converter | Pixel-Perfect Slides | OmniWebKit',
  description: 'Convert PowerPoint presentations (PPT, PPTX) to PDF with pixel-perfect slide rendering. Uses advanced server-side engine to preserve fonts, charts, layouts, and visuals flawlessly.',
  keywords: [
    'powerpoint to pdf', 'convert ppt to pdf', 'convert pptx to pdf',
    'presentation to pdf', 'ppt slides to pdf',
    'free powerpoint to pdf converter', 'online pptx to pdf'
  ],
  openGraph: {
    title: 'PowerPoint to PDF Converter | Pixel-Perfect Slides | OmniWebKit',
    description: 'Convert PowerPoint presentations (PPT, PPTX) to PDF with pixel-perfect slide rendering. Secure, fast, and free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/ppt-to-pdf',
  },
};

import PptToPdfClient from './PptToPdfClient';

export default function PptToPdfPage() {
  return <PptToPdfClient />;
}
