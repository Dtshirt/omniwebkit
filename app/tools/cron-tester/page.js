import CronTesterClient from "./CronTesterClient";

export const metadata = {
  title: "Free Cron Job Tester - Validate & Parse Cron Expressions Online",
  description: "Test your cron expressions online. Instantly see human-readable descriptions and the next 10 scheduled execution times. Real-time validation.",
  keywords: ["cron tester", "cron expression parser", "cron job checker", "cronstrue", "crontab generator", "cron validator online", "cron expression test", "cron schedule"],
  openGraph: {
    title: "Free Cron Job Tester - Parse Cron Expressions",
    description: "Instantly parse any cron expression to a human-readable description and see its next scheduled execution times.",
    type: "website",
  },
};

export default function CronTesterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Cron Job Tester",
        "operatingSystem": "All",
        "applicationCategory": "DeveloperApplication",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Organization",
          "name": "Lazydesigners",
          "url": "https://github.com/Dtshirt/omniwebkit"
        }
      }) }} />

      <CronTesterClient />

      <div className="prose-premium max-w-4xl mx-auto px-6 mt-4 mb-24">
        <h2>About the Tool</h2>
        <p>Writing a cron schedule can feel like guessing a secret code. You type a few stars and numbers, but you are never totally sure if your job will run every minute or just once a year. Our <strong>cron tester</strong> solves this problem. It acts as an instant translator that turns confusing cron schedules into plain English.</p>
        <p>I built this tool because I got tired of waiting for a scheduled task to fire just to see if I wrote the code correctly. Now, you can <strong>test cron job online</strong> without waiting. Just type your code, and the tool will show you exactly what it means and exactly when it will run next.</p>

        <h2>How to Use</h2>
        <p>Checking your schedule is fast and easy. Here is how you do it.</p>
        <ol>
          <li><strong>Enter your code:</strong> Type your five-part cron code into the big text box at the top.</li>
          <li><strong>Read the translation:</strong> The tool instantly reads your code and shows a plain English sentence right below it.</li>
          <li><strong>Check the dates:</strong> Look at the list to see the next 10 exact dates and times your job will run.</li>
          <li><strong>Verify on server (optional):</strong> Click the "Verify on Server" button to see the exact times your job will trigger in UTC time.</li>
        </ol>

        <h2>Privacy & Security</h2>
        <p>Testing your job schedules should be totally secure.</p>
        <p>When you use our cron expression parser, almost everything happens directly in your browser. This means your schedules stay on your device. If you use the "Verify on Server" feature, we only send the short string of characters to our backend to check the UTC math. We never save your schedules, log your activity, or track your IP address. As soon as the test is done, the data is gone forever.</p>

        <h2>Features</h2>
        <p>This is more than just a basic checker. Here is what makes this cron validator online special.</p>
        <ul>
          <li><strong>Instant Translation:</strong> See a simple, human-readable sentence as soon as you type.</li>
          <li><strong>Next 10 Runs:</strong> Automatically lists the next ten dates and times your job will fire.</li>
          <li><strong>Local Browser Time:</strong> Shows the schedule in your own computer's local time zone.</li>
          <li><strong>UTC Server Math:</strong> Provides a strict server check to make sure your job runs correctly in UTC time, which most real servers use.</li>
          <li><strong>Quick Buttons:</strong> Click common examples like "Every hour" to fill the box instantly.</li>
        </ul>

        <h2>Technical Specifications</h2>
        <p>For developers who want to know how the parsing engine works.</p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>System Part</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Local Parsing Engine</strong></td>
                <td>Browser-based JavaScript validation</td>
              </tr>
              <tr>
                <td><strong>Server Check Engine</strong></td>
                <td>Python croniter library</td>
              </tr>
              <tr>
                <td><strong>Time Formats</strong></td>
                <td>Local system time and UTC</td>
              </tr>
              <tr>
                <td><strong>Supported Parts</strong></td>
                <td>Minute, Hour, Day of Month, Month, Day of Week</td>
              </tr>
              <tr>
                <td><strong>Special Characters</strong></td>
                <td>Asterisk (*), Comma (,), Hyphen (-), Slash (/)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Frequently Asked Questions</h2>

        <h3>What does the asterisk (*) mean in a cron schedule?</h3>
        <p>An asterisk means "every". For example, an asterisk in the minute slot means the job runs every single minute. An asterisk in the hour slot means it runs every hour.</p>

        <h3>Why do I need to check my schedule on the server?</h3>
        <p>Your computer shows time differently than a cloud server. Your local computer uses your current timezone, but most cloud servers use UTC time. The server check shows you the exact UTC times to prevent nasty surprises.</p>

        <h3>What are the five parts of a basic cron code?</h3>
        <p>The standard format uses five spaces: Minute (0-59), Hour (0-23), Day of the Month (1-31), Month (1-12), and Day of the Week (0-6, where 0 is Sunday).</p>

        <h3>Can I use dashes and slashes?</h3>
        <p>Yes. A dash creates a range (like 1-5 for Monday through Friday). A slash skips numbers (like */15 to run something every 15 minutes). The tool handles both perfectly.</p>

      </div>
    </>
  );
}
