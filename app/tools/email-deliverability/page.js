import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EmailDeliverabilityClient from './EmailDeliverabilityClient';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

export default function EmailDeliverabilityPage() {
  return (
    <div className="max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className='my-2'>
          <Breadcrumbs
            items={[
              { name: 'Email Deliverability Analyzer', href: '/tools/email-deliverability' }
            ]}
          />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-4 mb-2">
          Free Email Deliverability Analyzer
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Enter your domain to see exactly why your emails land in spam — real-time SPF, DKIM, DMARC, blacklist, and DNS checks with copy-paste fixes.
        </p>
      </div>

      {/* ── Tool — always visible above the fold ── */}
      <EmailDeliverabilityClient />

      {/* ── SEO Content ── */}
      <div className="mt-16 prose-premium max-w-5xl mx-auto space-y-8">

        {/* 1. About the Tool */}
        <div className={`${cardCls} p-8`}>
          <h2>Email Deliverability Analyzer — What This Tool Actually Does</h2>
          <p>
            If your emails keep landing in the spam folder, the problem is almost always in your DNS — not your email content. Inbox providers like Gmail and Outlook check three things before they decide where to put your message: <strong>SPF</strong>, <strong>DKIM</strong>, and <strong>DMARC</strong>. If any of those are missing, broken, or too weak, your email goes straight to spam — no matter how good the message is.
          </p>
          <p>
            This free <strong>email deliverability analyzer</strong> runs 8 checks at once against your domain. It checks your SPF record for errors (including the dangerous <code>+all</code> tag and the "too many DNS lookups" PermError), validates your DKIM signature across 14+ provider-specific selectors, reads your DMARC policy and grades its strength, and scans your domain and mail server IPs against <strong>50+ global blacklists</strong> — all in real time.
          </p>
          <p>
            But here's the part that makes it different from most email testing tools: it also generates <strong>exact, copy-paste DNS records</strong> tailored to your email provider. Whether you're on Google Workspace, Microsoft 365, Zoho, SendGrid, or Mailgun — the fix suggestions match your setup. You don't have to guess.
          </p>
          <p>
            Type your domain into the tool above and you'll have a full diagnostic report in about 10–15 seconds.
          </p>
        </div>

        {/* 2. How to Use */}
        <div className={`${cardCls} p-8`}>
          <h2>How to Use the Email Deliverability Checker</h2>
          <p>
            The tool is built to get you answers fast. No login. No configuration. Just your domain name.
          </p>
          <ol>
            <li>
              <strong>Enter your domain or email address.</strong> Type something like <code>yourdomain.com</code> or <code>hello@yourdomain.com</code> — if you enter an email, the tool pulls the domain automatically. Hit the <strong>Analyze</strong> button.
            </li>
            <li>
              <strong>Watch the checks run in real time.</strong> The tool doesn't make you wait for all 8 checks to finish. Results stream in as each check completes — SPF first, then DKIM, DMARC, MX, blacklist, PTR, BIMI, and MTA-STS. You'll see the pass/fail cards fill in live.
            </li>
            <li>
              <strong>Read your deliverability score.</strong> The score ring shows a grade from A to F. A is excellent — all checks passed, strong policies in place. F means something critical is broken. Expand any Check Card to see the raw DNS data the tool found for that record.
            </li>
            <li>
              <strong>Copy the fix suggestions.</strong> Scroll down to the Fix Suggestions panel. If anything failed, the tool generates the exact TXT or MX records you need. These aren't generic examples — they're built around your detected email provider, so the records are ready to paste straight into your registrar's DNS panel.
            </li>
            <li>
              <strong>Re-test after you make changes.</strong> DNS changes take time to spread — usually 5 to 30 minutes, sometimes up to 48 hours. Wait a bit, then run the analyzer again to confirm your fixes worked.
            </li>
          </ol>
          <p>
            One thing worth knowing: the tool detects your email provider automatically from your MX records. That's what makes the provider-specific DKIM check possible — it looks for the right selector (<code>selector1</code> for Microsoft, <code>google</code> for Gmail) instead of just trying generic ones.
          </p>
        </div>

        {/* 3. Privacy & Security */}
        <div className={`${cardCls} p-8`}>
          <h2>Your Data Stays Private — Here's How</h2>
          <p>
            When you run a check, the tool sends your domain name to a DNS resolver and a blacklist API to get the records. That's it. It does <strong>not</strong> store your domain, your results, or anything else in a database. There's no account, no tracking, and no email required.
          </p>
          <p>
            The DNS data that comes back — your SPF record, DMARC policy, MX records — is all public information. Anyone who knows your domain can query it. This tool just collects all of it in one place and gives you a clear picture instead of making you run 8 separate commands in a terminal.
          </p>
          <p>
            The blacklist check works the same way. It queries each DNSBL (DNS-based blacklist) with your IP address using standard DNS lookups — the same method any mail server uses to check your reputation. Nothing about the check itself flags your domain.
          </p>
          <p>
            One honest note: your fix suggestions are generated based on your detected email provider. If the tool guesses your provider wrong — or can't detect it — the suggested records will still be technically correct, but double-check them against your provider's official documentation before publishing to DNS.
          </p>
        </div>

        {/* 4. Features */}
        <div className={`${cardCls} p-8`}>
          <h2>What Makes This Email Deliverability Tool Different</h2>
          <p>
            Most email checking tools run one or two checks and give you a vague pass/fail. This one runs 8 specific checks — and explains what each result means for your actual inbox placement.
          </p>
          <ul>
            <li>
              <strong>Provider-aware DKIM detection.</strong> Most tools try a handful of generic DKIM selectors and give up. This one detects your email provider from your MX records first — then checks the exact selectors that provider uses. Google, Microsoft 365, Zoho, SendGrid, Mailgun, and Amazon SES all have different selector conventions. The tool handles each one differently.
            </li>
            <li>
              <strong>SPF PermError and +all detection.</strong> A valid SPF record that uses <code>+all</code> at the end is almost as bad as having no SPF at all — it tells the world that any IP can send mail as you. The tool flags this specifically. It also detects when you've exceeded the 10-lookup limit, which causes a silent PermError that most senders never notice.
            </li>
            <li>
              <strong>DMARC policy strength grading.</strong> The tool doesn't just check if DMARC exists. It grades the policy. A record with <code>p=none</code> earns a warning — it's monitoring-only and gives you zero spam protection. You need <code>p=quarantine</code> or <code>p=reject</code> to actually protect your domain reputation and satisfy Google's 2024+ bulk sender rules.
            </li>
            <li>
              <strong>50+ blacklist parallel scan.</strong> The tool checks Spamhaus, Barracuda, SORBS, SpamCop, and more than 45 others at the same time. If your IP is listed, you get a direct link to the delisting page for that specific blacklist — no hunting around.
            </li>
            <li>
              <strong>PTR (reverse DNS) forward-confirmed lookup.</strong> The tool resolves your MX record to an IP, then does a reverse DNS lookup to get the hostname, then does a forward lookup to confirm the hostname points back to the same IP. This forward-confirmed reverse DNS (FCrDNS) is what strict mail servers check. If it doesn't match, some servers drop the connection immediately.
            </li>
            <li>
              <strong>BIMI and MTA-STS checks.</strong> Beyond the basics, the tool checks for a BIMI record (which lets you show your brand logo in Gmail and Yahoo inboxes) and an MTA-STS policy (which forces TLS encryption on all email sent to your domain). Both are optional but increasingly important for brand trust and security.
            </li>
            <li>
              <strong>Real-time streaming results.</strong> Checks run in parallel and display as they finish — you don't sit at a loading spinner for 30 seconds. The score ring updates live as each check comes in.
            </li>
            <li>
              <strong>Copy-paste DNS records for your provider.</strong> The Fix Suggestions panel generates ready-to-use TXT records, not generic placeholders. If you're on Google Workspace, you get the actual SPF include string for Google. Same for Microsoft, Zoho, and the others.
            </li>
          </ul>
        </div>

        {/* 5. Technical */}
        <div className={`${cardCls} p-8`}>
          <h2>Technical Specifications</h2>
          <p>Here's exactly how the email deliverability analyzer works under the hood — useful if you're debugging or want to understand why a specific check passed or failed.</p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Check</th><th>What It Does</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>SPF</strong></td>
                  <td>Fetches the TXT record at your domain root. Parses the <code>v=spf1</code> directive. Counts DNS lookups (<code>include:</code>, <code>a:</code>, <code>mx:</code>) to detect the 10-lookup PermError. Flags <code>+all</code> as a critical risk. Confirms <code>-all</code> or <code>~all</code> as the correct end directive.</td>
                </tr>
                <tr>
                  <td><strong>DKIM</strong></td>
                  <td>Resolves MX to identify provider. Queries <code>selector._domainkey.domain</code> using provider-specific selectors — <code>selector1</code> / <code>selector2</code> for Microsoft, <code>google</code> for Gmail, <code>zoho</code> for Zoho, <code>s1</code> / <code>s2</code> for SendGrid, <code>mta</code> for Mailgun — plus 7 generic fallback selectors. Reads <code>p=</code> tag and warns on 1024-bit keys (recommends 2048-bit).</td>
                </tr>
                <tr>
                  <td><strong>DMARC</strong></td>
                  <td>Fetches TXT at <code>_dmarc.domain</code>. Reads <code>p=</code> (none / quarantine / reject), <code>pct=</code>, <code>rua=</code>, and <code>ruf=</code> tags. Grades <code>p=none</code> as a warning, <code>p=quarantine</code> / <code>p=reject</code> as passing. Checks <code>pct</code> — values below 100 reduce enforcement scope.</td>
                </tr>
                <tr>
                  <td><strong>MX</strong></td>
                  <td>Queries MX records and resolves each to an IP. Matches MX hostnames against known provider patterns to detect Google Workspace, Microsoft 365, Zoho, SendGrid, Mailgun, Amazon SES, or custom servers.</td>
                </tr>
                <tr>
                  <td><strong>Blacklist</strong></td>
                  <td>Reverses each MX IP (e.g. 1.2.3.4 becomes 4.3.2.1) and queries it against 50+ DNSBL zones simultaneously. An A-record response means listed. Returns the specific blacklist name and a direct delisting URL for any hits.</td>
                </tr>
                <tr>
                  <td><strong>PTR (Reverse DNS)</strong></td>
                  <td>Queries the PTR record at the reversed IP under <code>.in-addr.arpa.</code>. Then does a forward A-record lookup on the returned hostname. Passes only if the forward and reverse lookups resolve to the same IP (FCrDNS).</td>
                </tr>
                <tr>
                  <td><strong>BIMI</strong></td>
                  <td>Queries the TXT record at <code>default._bimi.domain</code>. Reads <code>v=BIMI1</code> and the <code>l=</code> (logo URL) and <code>a=</code> (VMC certificate) tags. Warns if DMARC is not strict enough to support BIMI display.</td>
                </tr>
                <tr>
                  <td><strong>MTA-STS</strong></td>
                  <td>Fetches the TXT record at <code>_mta-sts.domain</code> and the policy file at <code>https://mta-sts.domain/.well-known/mta-sts.txt</code>. Reads <code>mode:</code> (none / testing / enforce). Warns on <code>mode: none</code> or missing files.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3>Scoring System</h3>
          <p>
            Each of the 8 checks carries a weight. SPF, DKIM, DMARC, and the blacklist check are weighted heaviest — they're the four that inbox providers care about most. MX, PTR, BIMI, and MTA-STS count for less but still affect the final grade.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Grade</th><th>Score Range</th><th>Meaning</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>A</strong></td><td>90–100</td><td>All critical checks pass. Strong DMARC policy. Clean blacklists.</td></tr>
                <tr><td><strong>B</strong></td><td>75–89</td><td>Core setup is good but one secondary check is weak or missing.</td></tr>
                <tr><td><strong>C</strong></td><td>60–74</td><td>Some issues. DMARC may be on <code>p=none</code> or DKIM is unverified.</td></tr>
                <tr><td><strong>D</strong></td><td>40–59</td><td>SPF or DKIM problem. High risk of landing in spam.</td></tr>
                <tr><td><strong>F</strong></td><td>0–39</td><td>Critical failure. Blacklisted, missing SPF, or no DMARC at all.</td></tr>
              </tbody>
            </table>
          </div>

          <h3>Browser &amp; Infrastructure</h3>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr><th>Spec</th><th>Detail</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Framework</strong></td><td>Next.js (React) — client-side UI with server-side API routes for DNS resolution</td></tr>
                <tr><td><strong>DNS Resolution</strong></td><td>Cloudflare DNS over HTTPS (<code>1.1.1.1/dns-query</code>) for consistent, fast results</td></tr>
                <tr><td><strong>Blacklist Queries</strong></td><td>50+ DNSBL zones checked in parallel using Promise.allSettled</td></tr>
                <tr><td><strong>Streaming</strong></td><td>Results streamed per-check as they complete — no waiting for all 8 to finish</td></tr>
                <tr><td><strong>Data Storage</strong></td><td>None — no domain or result is logged or stored</td></tr>
                <tr><td><strong>Browser Support</strong></td><td>Chrome, Firefox, Safari, Edge — requires JavaScript</td></tr>
                <tr><td><strong>Device Support</strong></td><td>Desktop, tablet, and mobile responsive</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 6. FAQ */}
        <div className={`${cardCls} p-8`}>
          <h2>Frequently Asked Questions About Email Deliverability</h2>

          <h3>What is an email deliverability analyzer?</h3>
          <p>
            It's a tool that checks your domain's DNS settings to find out why emails might be landing in spam. It tests your SPF record, DKIM signatures, DMARC policy, MX records, reverse DNS, and whether your IP is on any global blacklists. Think of it as a health check for your email infrastructure.
          </p>

          <h3>Why are my emails going to spam even though I didn't do anything wrong?</h3>
          <p>
            The most common causes aren't about your email content — they're DNS misconfigurations. A missing SPF record, a DMARC policy stuck on <code>p=none</code>, or an IP that got added to a blacklist by a previous tenant can all cause your emails to fail silently. The analyzer finds these issues in seconds.
          </p>

          <h3>Does Gmail require DMARC now?</h3>
          <p>
            Yes. Since early 2024, Google and Yahoo both require bulk senders — anyone sending over 5,000 messages a day — to have valid SPF, DKIM, and at least a DMARC record in place. If you're a smaller sender, the requirement isn't enforced as strictly, but having all three still helps your inbox placement significantly.
          </p>

          <h3>What does p=none mean in DMARC — is it bad?</h3>
          <p>
            A DMARC record with <code>p=none</code> means "monitor but don't block anything." It collects reports on who is sending email from your domain but doesn't actually stop spoofed or unauthenticated messages. It's a good starting point for getting data, but it won't protect your domain reputation. You need to move to <code>p=quarantine</code> or <code>p=reject</code> to get real protection and pass strict sender requirements.
          </p>

          <h3>What is the "too many DNS lookups" SPF error?</h3>
          <p>
            SPF records are allowed a maximum of 10 DNS lookups. Every <code>include:</code> statement in your SPF record uses one or more lookups. If you've added Google, Mailchimp, SendGrid, HubSpot, and Zendesk all in one record, you've likely exceeded the limit. The result is a PermError — your SPF check fails silently, and inbox providers treat it the same as having no SPF at all. The fix is SPF flattening (converting all the includes into static IPs) or using subdomains for different sending services.
          </p>

          <h3>How do I fix a blacklist listing?</h3>
          <p>
            Fix the root cause first — stop sending cold spam, clean your mailing list, or secure a compromised mail server. Then use the direct delisting link in the Fix Suggestions panel. Each blacklist has its own process: Spamhaus has a self-service lookup, Barracuda needs you to fill out a form, and others may require manual review. Requesting removal before fixing the problem usually results in getting re-listed within a few days.
          </p>

          <h3>Why can't the tool find my Amazon SES DKIM record?</h3>
          <p>
            Amazon SES uses a randomly generated string as its DKIM selector — something like <code>abc123xyz._domainkey.yourdomain.com</code>. Because that hash is random, no external tool can guess it. You have to log into your AWS SES console to check your DKIM verification status directly. The same applies to some Brevo (formerly Sendinblue) setups.
          </p>

          <h3>What is PTR reverse DNS and why does it matter?</h3>
          <p>
            A PTR record maps your mail server's IP address back to a hostname. Strict mail servers check that the hostname in your PTR record resolves back to the same IP — this is called forward-confirmed reverse DNS (FCrDNS). If it doesn't match, some servers will reject your connection before your email even gets delivered. Most major ISPs and cloud hosts let you set PTR records through your hosting control panel.
          </p>

          <h3>Is this email deliverability test free?</h3>
          <p>
            Yes, completely free. No account needed, no API key, no daily limit. The tool is free to use as many times as you need — every time you update your DNS, run it again to confirm the change took effect.
          </p>
        </div>

      </div>
    </div>
  );
}
