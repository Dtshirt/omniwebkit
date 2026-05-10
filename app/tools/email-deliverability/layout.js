export const metadata = {
  title: 'Email Deliverability Analyzer — Check SPF, DMARC, DKIM & Blacklists | OmniWebKit',
  description: 'Free email deliverability analyzer. Check SPF, DMARC, DKIM records, MX configuration, blacklist status, and PTR records. Get actionable fix suggestions and a deliverability score.',
  keywords: ['email deliverability', 'SPF check', 'DMARC check', 'DKIM checker', 'email blacklist check', 'email spam test', 'MX record check'],
  openGraph: {
    title: 'Email Deliverability Analyzer — Check Why Emails Land in Spam',
    description: 'Real-time SPF, DMARC, DKIM, blacklist and MX analysis with actionable fix suggestions and deliverability score.',
    type: 'website',
  },
};

export default function Layout({ children }) {
  return children;
}
