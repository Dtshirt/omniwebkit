import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EmailDeliverabilityClient from './EmailDeliverabilityClient';
import { Mail, Shield, AlertTriangle, CheckCircle, Database, Server, Info } from 'lucide-react';

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

      {/* SEO Content Section */}
      <div className="mt-16 max-w-4xl mx-auto space-y-12 text-slate-700 dark:text-slate-300">
        
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Why Are My Emails Going to Spam?
          </h2>
          <p className="mb-4">
            If your important emails are landing in the spam or junk folders of your recipients, the problem usually lies in your domain's DNS and email authentication setup. Major email providers like Google Workspace (Gmail) and Microsoft 365 now enforce strict security policies to prevent phishing and spoofing.
          </p>
          <p className="mb-4">
            To ensure your emails reach the inbox, you must correctly configure three core authentication protocols: <strong>SPF</strong>, <strong>DKIM</strong>, and <strong>DMARC</strong>. Furthermore, you need to ensure your mail server's IP address is not listed on any major <strong>DNS Blacklists (DNSBL)</strong> and that your reverse DNS (PTR records) are properly mapped.
          </p>
          <p>
            Our Free Email Deliverability Analyzer acts as an all-in-one diagnostic tool. It runs over 8 parallel checks against your domain in real-time, scanning over 50 blacklists, validating your security protocols, and providing you with exact, copy-paste configurations to fix any issues.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            The Core Pillars of Email Deliverability
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-indigo-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">SPF (Sender Policy Framework)</h3>
              </div>
              <p className="text-sm">
                SPF is a DNS record that lists exactly which IP addresses and services are authorized to send emails on behalf of your domain. Without a valid SPF record (or if your record contains the dangerous <code>+all</code> tag), receiving servers will assume the email is forged and send it straight to spam.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-emerald-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">DKIM (DomainKeys Identified Mail)</h3>
              </div>
              <p className="text-sm">
                DKIM adds a cryptographic, invisible digital signature to your outgoing emails. When Gmail or Outlook receives your message, they check this signature against the public key in your DNS records to verify that the email was not altered in transit. We check for 2048-bit secure keys across all common provider selectors.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">DMARC Policy</h3>
              </div>
              <p className="text-sm">
                DMARC ties SPF and DKIM together. It tells receiving servers what to do if an email fails authentication. A policy of <code>p=none</code> is for monitoring, but to truly protect your domain reputation and ensure deliverability, you should aim for <code>p=quarantine</code> or <code>p=reject</code>.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">DNS Blacklists (DNSBL)</h3>
              </div>
              <p className="text-sm">
                If your domain or mail server IP gets flagged for sending spam, it may be added to global blacklists like Spamhaus, Barracuda, or SORBS. Our tool checks your domain and MX IP addresses against over 50 major blacklists and provides direct delisting URLs if you are flagged.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            How Our Deliverability Analyzer Works
          </h2>
          <ul className="space-y-4">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">1</span>
              <div>
                <strong>Deep DNS Resolution:</strong> We resolve your MX records to detect your email provider (e.g., Google Workspace, Microsoft 365, Zoho, SendGrid).
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">2</span>
              <div>
                <strong>Provider-Aware DKIM Checking:</strong> We scan your domain for DKIM signatures using provider-specific selectors (like <code>selector1</code> for Microsoft or <code>google</code> for Gmail), alongside generic fallbacks.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">3</span>
              <div>
                <strong>Parallel Blacklist Scanning:</strong> We take your domain and mail server IPs and run them simultaneously against over 50 global anti-spam databases.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">4</span>
              <div>
                <strong>Actionable Fix Generation:</strong> Instead of just telling you what's broken, our tool generates exact, copy-paste TXT and MX records tailored to your specific email provider.
              </div>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Advanced Checks: PTR, BIMI, and MTA-STS
          </h2>
          <p className="mb-4">
            While SPF, DKIM, and DMARC are the mandatory baseline, modern email deliverability optimization requires going further. 
          </p>
          <ul className="list-disc pl-6 space-y-3 mb-4">
            <li><strong>Reverse DNS (PTR):</strong> A PTR record maps your mail server's IP address back to its hostname. Strict email servers will drop connections immediately if the forward (A) and reverse (PTR) records do not match perfectly.</li>
            <li><strong>BIMI (Brand Indicators for Message Identification):</strong> If you have a strict DMARC policy, you can configure BIMI to display your verified company logo next to your messages in the inbox. This builds trust and increases open rates.</li>
            <li><strong>MTA-STS:</strong> Mail Transfer Agent Strict Transport Security ensures that emails sent to your domain are securely encrypted via TLS, preventing man-in-the-middle attacks.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-indigo-500" />
                Why does Google/Gmail require DMARC now?
              </h3>
              <p className="text-sm">
                As of 2024, Google and Yahoo implemented strict requirements for bulk senders (those sending over 5,000 emails a day). You must have SPF, DKIM, and a DMARC policy in place, and you must maintain a spam complaint rate below 0.3%. Failure to comply results in emails being outright rejected.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-indigo-500" />
                What is the "Too many DNS lookups" SPF error?
              </h3>
              <p className="text-sm">
                The SPF protocol strictly limits you to 10 DNS lookups per record. If you have too many <code>include:</code> statements (e.g., including Google, Mailchimp, SendGrid, and Zendesk all at once), you will exceed the limit, causing your SPF check to "PermError" and fail. You must use SPF flattening or dedicated subdomains for different services.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-indigo-500" />
                How do I fix a blacklist listing?
              </h3>
              <p className="text-sm">
                If our analyzer flags your domain or IP as blacklisted, check the "Suggestions" panel. We provide direct links to the delisting pages for the specific blacklists you are on (like Spamhaus or Barracuda). You must fix the root cause (e.g., stop sending cold spam, secure your compromised server) before requesting a delisting.
              </p>
            </div>
            
             <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-indigo-500" />
                Why can't you find my Amazon SES DKIM record?
              </h3>
              <p className="text-sm">
                Amazon SES, Brevo, and some other marketing platforms generate random, custom strings for their DKIM selectors (for example: <code>abc123xyz._domainkey.yourdomain.com</code>). Because it is a randomized hash, external tools cannot guess the selector over DNS. If you use SES, you must log into your AWS console to verify your DKIM status.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
