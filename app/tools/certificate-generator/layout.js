import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Certificate Generator — Create & Download Professional Certificates Online',
  description:
    'Create professional certificates online for free. Choose from 6 templates — Classic, Modern, Elegant, Corporate, Academic, Achievement. Add logos, stamps, signatures. Download as PNG, JPG, or PDF. No login required.',
  keywords: [
    'certificate generator online free',
    'free certificate maker',
    'create certificate online',
    'professional certificate template',
    'course completion certificate generator',
    'certificate of achievement maker',
    'online certificate creator',
    'PDF certificate generator',
    'academic certificate template',
    'corporate training certificate maker',
  ],
  openGraph: {
    title: 'Free Certificate Generator — Create Professional Certificates Online',
    description:
      'Design and download professional certificates in PNG, JPG, or PDF format. 6 templates, custom logos, stamps, typography controls, and more. Free, no account needed.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/certificate-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Certificate Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Certificate Generator — 6 Templates, PNG/JPG/PDF Download',
    description: 'Create professional certificates online free. 6 templates, custom logos, stamps, typography. Download as PNG, JPG, or PDF. No login.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/certificate-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Certificate Generator',
  description:
    'Free online certificate generator. Choose from 6 professionally designed templates (Classic, Modern, Elegant, Corporate, Academic, Achievement). Customise recipient details, typography, colours, borders, and add institution logos, official stamps, custom text, and signature placeholders. Download as PNG, JPG, or PDF. All processing is browser-based — no data is uploaded to any server.',
  url: 'https://omniwebkit.com/tools/certificate-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    '6 professionally designed certificate templates',
    'Classic, Modern, Elegant, Corporate, Academic, Achievement templates',
    'Customisable recipient name, course, institution, date, grade, duration',
    'Certificate ID field for tracking',
    'Typography controls: font, size, style, colour for title, name, and body',
    '3 font colour inputs (primary, secondary, accent)',
    '6 border styles including double line and ornate',
    'Custom background colour or image upload',
    'Institution logo upload with drag-and-drop',
    'Official stamp or seal upload',
    'Add custom text elements to canvas',
    'Add signature placeholder elements',
    'Drag, resize, and rotate canvas elements',
    'Save custom designs as templates to localStorage',
    'Download as PNG (lossless), JPG (compressed), or PDF (landscape)',
    '100% browser-based — no server uploads',
    'No account or login required',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Professional Certificate Online for Free',
  description: 'Steps to create a certificate using the OmniWebKit Certificate Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a template', text: 'Select one of six certificate templates from the Templates panel. Classic and Academic suit educational programmes. Corporate and Modern suit training. Elegant and Achievement suit awards and recognition.' },
    { '@type': 'HowToStep', position: 2, name: 'Fill in the certificate details', text: 'Enter the recipient name, course name, institution, completion date, grade, instructor, duration, and certificate ID. The preview canvas updates live as you type.' },
    { '@type': 'HowToStep', position: 3, name: 'Customise design and typography', text: 'Set background colour or upload an image, choose border style and colours, and customise the font, size, style, and colour for the title, recipient name, and body text.' },
    { '@type': 'HowToStep', position: 4, name: 'Add logos and elements', text: 'Upload your institution logo and official stamp via drag-and-drop. Add custom text or signature elements and position them on the canvas by dragging.' },
    { '@type': 'HowToStep', position: 5, name: 'Download the certificate', text: 'Click Download PNG, JPG, or PDF. The PDF is generated as a landscape document sized to the canvas. The filename includes the recipient name automatically.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this certificate generator free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or login required. All certificate creation happens in your browser — no data is uploaded to any server.' },
    },
    {
      '@type': 'Question',
      name: 'What certificate templates are available?',
      acceptedAnswer: { '@type': 'Answer', text: 'There are six templates: Classic (traditional formal), Modern (clean contemporary), Elegant (ornate calligraphic), Corporate (dark header professional), Academic (university-style), and Achievement (badge and ribbon design).' },
    },
    {
      '@type': 'Question',
      name: 'What formats can I download the certificate in?',
      acceptedAnswer: { '@type': 'Answer', text: 'You can download as PNG (lossless, highest quality), JPG (compressed), or PDF (landscape, print-ready). The PDF is generated using jsPDF and sized to match the 1200×850 canvas dimensions.' },
    },
    {
      '@type': 'Question',
      name: 'Can I add my organisation logo?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the Institution Logo drag-and-drop zone in the Add Elements panel. Once added, the logo appears on the canvas and can be moved, resized, and rotated freely.' },
    },
    {
      '@type': 'Question',
      name: 'Can I save my certificate design?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Save Template to save your current design settings, colours, typography, and canvas elements to browser localStorage. Saved templates appear in the Saved Templates list and can be reloaded at any time.' },
    },
    {
      '@type': 'Question',
      name: 'Can I create certificates for multiple recipients?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. After downloading one certificate, update the Recipient Name and any other fields, then download again. The canvas re-renders instantly with the new information.' },
    },
    {
      '@type': 'Question',
      name: 'What is the resolution of the generated certificate?',
      acceptedAnswer: { '@type': 'Answer', text: 'The canvas renders at 1200×850 pixels in landscape orientation. For higher print resolution, download the PNG and upscale in an image editor before printing.' },
    },
    {
      '@type': 'Question',
      name: 'Are the generated certificates legally valid?',
      acceptedAnswer: { '@type': 'Answer', text: 'The certificates are digital image documents with no inherent legal authority. Their validity depends entirely on the credibility of the issuing institution. For official accreditation, consult the relevant regulatory authorities.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Certificate Generator', item: 'https://omniwebkit.com/tools/certificate-generator' },
  ],
};

export default function CertificateGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="certificate-generator" category="file" />
    </>
  );
}
