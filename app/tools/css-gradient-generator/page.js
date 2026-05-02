export const metadata = {
    title: 'CSS Gradient Generator | Linear, Radial & Conic | OmniWebKit',
    description: 'Build beautiful CSS gradients instantly. Supports linear, radial, and conic types with advanced smooth scale generation powered by chroma.js.',
    keywords: [
      'css gradient generator', 'css background generator', 'linear gradient',
      'radial gradient', 'conic gradient', 'chroma.js scale'
    ],
    openGraph: {
      title: 'CSS Gradient Generator | OmniWebKit',
      description: 'Create perfect CSS gradients with advanced smooth scale generation.',
      type: 'website',
      url: 'https://omniwebkit.com/tools/css-gradient-generator',
    },
  };
  
  import CssGradientClient from './CssGradientClient';
  
  export default function CssGradientPage() {
    return <CssGradientClient />;
  }
