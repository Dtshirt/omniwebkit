import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EmailDeliverabilityClient from './EmailDeliverabilityClient';

export default function EmailDeliverabilityPage() {
  return (
    <div className="w-full">
      <div className="mb-8">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Tools', href: '/tools' },
            { label: 'Email Deliverability Analyzer', href: '/tools/email-deliverability' },
          ]}
        />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
          Email Deliverability Analyzer
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Enter a domain or email address to get a comprehensive report on why your emails may be landing in spam — with real-time streaming results and copy-paste fix suggestions.
        </p>
      </div>
      <EmailDeliverabilityClient />
    </div>
  );
}
