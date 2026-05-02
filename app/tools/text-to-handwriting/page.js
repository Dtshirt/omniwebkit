export const metadata = {
    title: 'Text to Handwriting Converter | Realistic PDF Generator | OmniWebKit',
    description: 'Convert typed text into realistic handwritten documents. Choose fonts, ink colors, and paper types. Features advanced algorithmic handwriting realism for essays and letters.',
    keywords: [
      'text to handwriting', 'convert text to handwriting', 'handwriting generator',
      'realistic handwriting pdf', 'typed to handwritten'
    ],
    openGraph: {
      title: 'Text to Handwriting Converter | OmniWebKit',
      description: 'Turn your typed text into realistic handwritten documents. Uses advanced engine processing for natural imperfections.',
      type: 'website',
      url: 'https://omniwebkit.com/tools/text-to-handwriting',
    },
  };
  
  import TextToHandwritingClient from './TextToHandwritingClient';
  
  export default function TextToHandwritingPage() {
    return <TextToHandwritingClient />;
  }
