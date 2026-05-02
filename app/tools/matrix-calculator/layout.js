import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Matrix Calculator — Add, Subtract, Multiply, Transpose & Invert Matrices',
  description:
    'Free online matrix calculator. Perform matrix addition, subtraction, multiplication, transpose, determinant, inverse, and scalar multiplication. Supports any matrix size. Browser-based, no signup required.',
  keywords: [
    'matrix calculator online free',
    'matrix multiplication calculator online',
    'matrix inverse calculator online free',
    'matrix determinant calculator online',
    'matrix addition subtraction calculator',
    'transpose matrix calculator online',
    'linear algebra calculator online free',
    'matrix operations calculator free',
    'online matrix solver free',
    'scalar multiplication matrix calculator',
  ],
  openGraph: {
    title: 'Free Online Matrix Calculator — Add, Multiply, Transpose & Invert Matrices',
    description:
      'Perform matrix addition, subtraction, multiplication, transpose, determinant, inverse, and scalar multiplication. Any matrix size. Free, browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/matrix-calculator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Matrix Calculator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Matrix Calculator — Add, Multiply, Transpose & Invert Matrices',
    description: 'Matrix addition, subtraction, multiplication, transpose, determinant, inverse, and scalar multiply. Any size. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/matrix-calculator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Matrix Calculator',
  description:
    'Free browser-based matrix calculator. Operations: matrix addition (A+B), matrix subtraction (A−B), matrix multiplication (A×B), transpose of A, transpose of B, determinant of A, determinant of B, inverse of A (Gauss-Jordan elimination with partial pivoting), inverse of B, scalar multiplication (k×A, k×B). Dynamic matrix sizing: add/remove rows and columns. Quick size presets: 2×2, 3×3, 4×4, 2×3, 3×2. Copy result as CSV. All calculations browser-based with floating-point arithmetic.',
  url: 'https://omniwebkit.com/tools/matrix-calculator',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Matrix addition (A + B)',
    'Matrix subtraction (A − B)',
    'Matrix multiplication (A × B)',
    'Transpose of Matrix A and Matrix B',
    'Determinant of Matrix A and Matrix B',
    'Matrix inverse using Gauss-Jordan elimination with partial pivoting',
    'Scalar multiplication (k × A and k × B)',
    'Dynamic matrix sizing: add or remove rows and columns',
    'Quick size presets: 2×2, 3×3, 4×4, 2×3, 3×2',
    'Copy result as CSV to clipboard',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Matrix Calculator',
  description: 'Steps to perform matrix operations using the OmniWebKit Matrix Calculator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter matrix values', text: 'Type values into the Matrix A and Matrix B input grids. Use +Row, −Row, +Col, −Col to resize, or select a Quick Size preset to set both matrices to an identity matrix of that size.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose an operation', text: 'Click Add (A+B), Subtract (A−B), or Multiply (A×B) for two-matrix operations. Or click Transpose, det, or Inverse for individual matrix operations.' },
    { '@type': 'HowToStep', position: 3, name: 'Scalar multiply (optional)', text: 'Enter a scalar value k in the scalar field, then click k×A or k×B to multiply every element by that constant.' },
    { '@type': 'HowToStep', position: 4, name: 'View the result', text: 'The result matrix appears below the operations panel, labelled with the operation name.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy the result', text: 'Click "Copy CSV" to copy the result matrix to your clipboard as a comma-separated string, ready to paste into a spreadsheet or code editor.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What matrix sizes are supported?', acceptedAnswer: { '@type': 'Answer', text: 'Any size. Add rows and columns dynamically using the +Row, −Row, +Col, −Col buttons, or use the preset buttons (2×2 through 4×4). Practical on-screen limits are around 6–8 columns wide.' } },
    { '@type': 'Question', name: 'Why does matrix multiplication require specific dimensions?', acceptedAnswer: { '@type': 'Answer', text: 'Matrix multiplication requires the number of columns in A to equal the number of rows in B. A 2×3 matrix can multiply a 3×4 matrix (result is 2×4), but not a 2×4 matrix.' } },
    { '@type': 'Question', name: 'What makes a matrix singular (non-invertible)?', acceptedAnswer: { '@type': 'Answer', text: 'A matrix is singular if its determinant is 0. This means its rows (or columns) are linearly dependent and the matrix cannot be inverted. The inverse calculator will notify you if the matrix is singular.' } },
    { '@type': 'Question', name: 'How is the matrix inverse calculated?', acceptedAnswer: { '@type': 'Answer', text: 'Using Gauss-Jordan elimination with partial pivoting for numerical stability. The method augments the matrix as [A | I] and applies row operations until the left side becomes the identity matrix, leaving A⁻¹ on the right.' } },
    { '@type': 'Question', name: 'Is matrix multiplication commutative?', acceptedAnswer: { '@type': 'Answer', text: 'No. A×B and B×A generally produce different results. Matrix multiplication is associative but not commutative.' } },
    { '@type': 'Question', name: 'Can I use decimal numbers?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Type any decimal number into the matrix cells. All operations use floating-point arithmetic. Inverse results are rounded to 10 decimal places to avoid floating-point noise.' } },
    { '@type': 'Question', name: 'What is scalar multiplication?', acceptedAnswer: { '@type': 'Answer', text: 'Scalar multiplication multiplies every element in a matrix by a constant number k. Enter k in the scalar field, then click k×A or k×B.' } },
    { '@type': 'Question', name: 'Does the calculator work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The matrix grids scroll horizontally on small screens. All operations work on mobile and tablet browsers.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Matrix Calculator', item: 'https://omniwebkit.com/tools/matrix-calculator' },
  ],
};

export default function MatrixCalculatorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="matrix-calculator" category="math" />
    </>
  );
}
