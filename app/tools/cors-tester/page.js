import CorsTesterClient from "./CorsTesterClient";

export const metadata = {
  title: "Free CORS Tester - Test Cross-Origin Resource Sharing Headers Online",
  description: "Test if a URL returns correct CORS headers for a given origin. Inspect Access-Control-Allow-Origin, preflight OPTIONS responses, credentials, and method permissions instantly.",
  keywords: ["cors tester", "test cors headers online", "cors checker", "access-control-allow-origin checker", "cors debugger", "preflight options test", "cors error fix", "cors policy checker"],
  openGraph: {
    title: "Free CORS Tester - Test CORS Headers Online",
    description: "Check if your API supports cross-origin requests. Inspect preflight OPTIONS responses and all CORS headers.",
    type: "website",
  },
};

export default function CorsTesterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "CORS Tester",
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

      <CorsTesterClient />

      <div className="prose-premium max-w-4xl mx-auto px-6 mt-4 mb-24">
        <h2>About the Tool</h2>
        <p>If you build web apps, you know the pain of cross-origin resource sharing errors. You make a fetch request, and the browser throws a red wall of text in your console. Our <strong>cors tester</strong> fixes this. It acts as an independent proxy that runs the exact same preflight checks your browser does, but actually shows you what went wrong instead of just blocking the connection.</p>
        <p>I built this because debugging Access-Control-Allow-Origin issues blindly takes way too much time. You need a fast way to <strong>test cors headers online</strong> without messing with browser extensions or opening Postman. This utility sends the OPTIONS request, reads the raw response headers, and tells you exactly what to change on your server.</p>

        <h2>How to Use</h2>
        <p>Testing your endpoint takes just three quick steps.</p>
        <ol>
          <li><strong>Drop in your URL:</strong> Paste the full endpoint you want to test into the Target URL box.</li>
          <li><strong>Set your Origin:</strong> Type the URL of the frontend app that is trying to make the request (like <code>https://localhost:3000</code>).</li>
          <li><strong>Run the test:</strong> Hit the button. The tool sends a preflight OPTIONS request followed by your chosen HTTP method.</li>
        </ol>
        <p>You'll immediately see a pass, fail, or warning verdict. If something fails, open the check card to see exactly how to fix your server config.</p>

        <h2>Privacy & Security</h2>
        <p>Here's the thing — testing APIs sometimes involves sensitive endpoints. Your security matters.</p>
        <p>When you use this tool, your request routes through a secure serverless function that acts as a pass-through proxy. We do not log your endpoints, we do not store your custom headers, and we never save your API responses. The data exists in memory just long enough to test the CORS policy and send the results back to your screen. The moment you close the tab, the test is gone permanently.</p>

        <h2>Features</h2>
        <p>Most tools just ping a URL and check for a 200 OK. This one digs deeper to catch the edge cases that actually break your app.</p>
        <ul>
          <li><strong>Preflight Analysis:</strong> Automatically sends an OPTIONS request to check what your server permits before the real request fires.</li>
          <li><strong>Credential Validation:</strong> Checks if your server safely allows cookies or authorization headers without using the dangerous wildcard origin.</li>
          <li><strong>Vary Header Detection:</strong> Ensures your caching layers won't accidentally serve a CORS response to the wrong domain.</li>
          <li><strong>Raw Header Inspection:</strong> Gives you full visibility into the raw response headers so you can verify exactly what your server sent back.</li>
        </ul>

        <h2>Technical Specifications</h2>
        <p>For the developers who want to know how the testing engine works under the hood.</p>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Check Component</th>
                <th>Specification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Request Engine</strong></td>
                <td>Server-side proxy bypass</td>
              </tr>
              <tr>
                <td><strong>Methods Tested</strong></td>
                <td>OPTIONS (Preflight) + Selected Method</td>
              </tr>
              <tr>
                <td><strong>Origin Matching</strong></td>
                <td>Strict string comparison vs Access-Control-Allow-Origin</td>
              </tr>
              <tr>
                <td><strong>Credential Check</strong></td>
                <td>Validates Access-Control-Allow-Credentials flag</td>
              </tr>
              <tr>
                <td><strong>Header Validation</strong></td>
                <td>Cross-checks requested vs allowed headers</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Frequently Asked Questions</h2>
        
        <h3>Why does my request work in Postman but fail in the browser?</h3>
        <p>Postman is a desktop app, so it ignores CORS policies completely. Browsers actively enforce CORS to stop malicious scripts from reading your data. That's why you need a dedicated tester to verify the headers.</p>

        <h3>What is a preflight request?</h3>
        <p>A preflight is a quick OPTIONS request the browser sends before a complex request (like a POST with JSON). It asks the server, "Are you okay with me sending this?" If the server doesn't reply with the right Access-Control headers, the browser cancels the real request.</p>

        <h3>Can I just set my origin to a wildcard (*)?</h3>
        <p>You can, but there's a catch. If you use a wildcard, browsers will not let you send credentials like cookies or secure auth tokens. If your app requires users to log in, you must specify the exact origin.</p>

        <h3>Why do I need the Vary: Origin header?</h3>
        <p>If you don't use this header, a CDN might cache a response meant for site A and accidentally serve it to site B. This causes random CORS errors that are a nightmare to debug. This tool automatically checks if you've set it correctly.</p>
      </div>
    </>
  );
}
