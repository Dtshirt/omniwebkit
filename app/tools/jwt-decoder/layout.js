import RelatedTools from '@/components/seo/RelatedTools';
﻿export const metadata = {
  title: 'JWT Decoder Online Free — Decode & Verify JSON Web Tokens',
  description:
    'Decode and debug JWT tokens instantly online. View JWT header, payload & signature. Verify JWT expiry and claims. Free JSON Web Token decoder — no data sent to server.',
  keywords: [
    'JWT decoder online free',
    'JSON Web Token decoder',
    'decode JWT online',
    'JWT inspector online',
    'JWT token parser free',
    'JWT payload decoder',
    'JWT claims viewer online',
    'decode JWT token online free',
    'JWT debugger online free',
    'JWT expiry checker online',
  ],
  openGraph: {
    title: 'Free JWT Decoder — Decode & Inspect JSON Web Tokens Online',
    description:
      'Decode any JWT instantly. See the header, payload claims, and signature with expiry status and human-readable timestamps. Free, browser-based, no signup.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/jwt-decoder',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JWT Decoder — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free JWT Decoder — Decode & Inspect JSON Web Tokens Online',
    description: 'Paste any JWT and see the decoded header, claims, and signature with expiry status. Free, browser-based, no server upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/jwt-decoder',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JWT Decoder & Inspector',
  description:
    'Free browser-based JWT decoder and inspector. Paste any JWT (JSON Web Token) and instantly decode the header, payload, and signature. Features: colour-coded token parts preview (header=red, payload=violet, signature=cyan); Claims view with human-readable labels for all standard registered claims (iss, sub, aud, exp, nbf, iat, jti, name, email, role, scope, given_name, family_name, kid, etc.); Unix timestamp conversion for exp, iat, nbf claims; live expiry status banner (expired/expires in); Raw JSON view for payload; algorithm and key ID info cards in header panel; security note in signature panel; sample tokens (Basic, Expired, Rich Claims); copy any individual claim or full section as JSON; token character count. All processing is browser-based — no token data is sent to any server.',
  url: 'https://omniwebkit.com/tools/jwt-decoder',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Decode JWT header, payload, and signature instantly',
    'Colour-coded token parts: header (red), payload (violet), signature (cyan)',
    'Claims view with human-readable labels for all standard JWT claims',
    'Unix timestamp to human-readable date conversion for exp, iat, nbf',
    'Live expiry status banner: expired or time remaining',
    'Algorithm and Key ID info cards in the header panel',
    'Switch between Claims view and Raw JSON view for payload',
    'Copy any individual claim value or full section to clipboard',
    'Three sample tokens: Basic, Expired, Rich Claims',
    'All processing browser-based — no JWT data sent to any server',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Decode a JWT Token Online',
  description: 'Steps to decode and inspect a JSON Web Token using the OmniWebKit JWT Decoder.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Paste your JWT', text: 'Paste your JWT into the Encoded Token text area, or click one of the sample token buttons to load a demo token.' },
    { '@type': 'HowToStep', position: 2, name: 'View the colour-coded preview', text: 'The three parts of the token (header, payload, signature) are shown in red, violet, and cyan on a dark background.' },
    { '@type': 'HowToStep', position: 3, name: 'Inspect the header', text: 'The Header panel shows the algorithm (alg), token type (typ), and key ID (kid) if present.' },
    { '@type': 'HowToStep', position: 4, name: 'Review payload claims', text: 'The Payload panel shows all claims with human-readable labels. Timestamp claims (exp, iat, nbf) are converted to local date/time. An expiry banner shows whether the token is valid or expired.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or inspect the signature', text: 'The Signature panel shows the raw Base64URL signature. Copy it if needed. Remember that signature verification requires the secret or public key and must be done server-side.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is it safe to paste my JWT here?', acceptedAnswer: { '@type': 'Answer', text: 'This tool decodes JWTs entirely in your browser. No data is sent to any server. That said, avoid pasting valid production tokens on any public website. Use sample or expired tokens for testing.' } },
    { '@type': 'Question', name: 'Can this tool verify the JWT signature?', acceptedAnswer: { '@type': 'Answer', text: 'No. Signature verification requires the secret key (HS256) or public key (RS256/ES256). This is a client-side decoder — verification must be done server-side.' } },
    { '@type': 'Question', name: 'What do the colours mean in the token preview?', acceptedAnswer: { '@type': 'Answer', text: 'Red = Header (algorithm and metadata), Violet = Payload (claims and user data), Cyan = Signature (cryptographic hash). This matches the colour convention used by jwt.io.' } },
    { '@type': 'Question', name: 'What is the difference between HS256 and RS256?', acceptedAnswer: { '@type': 'Answer', text: 'HS256 uses a shared symmetric secret — the same key signs and verifies. RS256 uses an asymmetric key pair: a private key to sign and a public key to verify. RS256 is preferred in distributed systems.' } },
    { '@type': 'Question', name: 'Are JWT claims encrypted?', acceptedAnswer: { '@type': 'Answer', text: 'No. The header and payload are Base64URL encoded (not encrypted). Anyone with the token can decode and read the claims. Never put passwords or sensitive data in a JWT payload.' } },
    { '@type': 'Question', name: 'What is the exp claim?', acceptedAnswer: { '@type': 'Answer', text: 'exp (Expiration Time) is a Unix timestamp after which the token is no longer valid. Servers check this on every request. This decoder shows the time remaining or how long ago the token expired.' } },
    { '@type': 'Question', name: 'Can I decode tokens from any provider?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. JWTs have a standard structure regardless of which provider or library created them (Auth0, Firebase, Cognito, Keycloak, custom servers, etc.).' } },
    { '@type': 'Question', name: 'What is the nbf claim?', acceptedAnswer: { '@type': 'Answer', text: 'nbf (Not Before) is a Unix timestamp before which the token must not be accepted. Servers reject tokens where the current time is before the nbf value.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'JWT Decoder', item: 'https://omniwebkit.com/tools/jwt-decoder' },
  ],
};

export default function JwtDecoderLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="jwt-decoder" category="dev" />
    </>
  );
}
