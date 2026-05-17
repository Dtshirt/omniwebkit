import React from 'react';
import CurlClient from './CurlClient';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Free cURL Converter Online - Translate Bash to Fetch & Axios',
  description: 'Instantly convert raw cURL bash commands into executable JavaScript Fetch, Node.js Axios, or Python code. Fast, free, and completely secure.',
  keywords: ["curl converter", "convert curl command online", "curl to fetch", "curl to axios", "bash to python requests", "curl syntax translator"],
  alternates: {
    canonical: 'https://omniwebkit.com/tools/curl-converter',
  },
};

export default function CurlConverterPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "cURL Converter",
    "description": "Instantly convert raw cURL bash commands into executable JavaScript Fetch, Node.js Axios, or Python code.",
    "url": "https://omniwebkit.com/tools/curl-converter",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Interactive Client Component */}
      <CurlClient />

      <div className="bg-slate-50 dark:bg-slate-900 pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <Breadcrumbs items={[{ name: 'cURL to Fetch/Axios Converter', href: '/tools/curl-converter' }]} />
          
          <div className="prose-premium max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2>About the Tool</h2>
            <p>Working with APIs usually means staring at long bash commands. You find a perfect example in the documentation, but it is written as a raw terminal string. Our <strong>curl converter</strong> fixes this problem instantly. It acts as an automatic translator that turns clunky bash text into clean, ready-to-run code.</p>
            <p>I built this tool because rewriting terminal commands by hand takes too much time. You have to hunt down headers, fix messy quote marks, and format JSON data just right. Now, you can <strong>convert curl command online</strong> in under a second. Just paste your command, and you get perfect JavaScript or Python code you can drop right into your app.</p>

            <h2>How to Use</h2>
            <p>Turning your terminal text into real code is dead simple. Here is the fast way to do it.</p>
            <ol>
              <li><strong>Copy your command:</strong> Grab a bash string from any API documentation or right-click a network request in your browser and choose "Copy as cURL".</li>
              <li><strong>Paste it in:</strong> Drop that string into the big left-side box labeled "Raw cURL Command".</li>
              <li><strong>Pick your language:</strong> Click the buttons at the top to choose between JavaScript Fetch, Node.js Axios, or Python Requests.</li>
              <li><strong>Grab the code:</strong> The tool instantly writes the exact code in the right box. Click the "Copy Code" button and paste it straight into your editor.</li>
            </ol>

            <h2>Privacy & Security</h2>
            <p>Here's the thing — network requests often contain very sensitive secrets. You might accidentally paste a command that holds your private passwords, user emails, or Bearer tokens.</p>
            <p>This is why we built our parsing engine to run completely inside your own web browser. Your sensitive data never leaves your computer. We do not use backend servers to read your strings, and we do not keep logs of what you paste. As soon as you hit the clear button or close your tab, the data vanishes permanently. Your enterprise secrets stay safe with you.</p>

            <h2>Features</h2>
            <p>Most basic translators just guess the syntax. This tool handles the messy details so your code actually runs.</p>
            <ul>
              <li><strong>Smart Data Parsing:</strong> It automatically spots raw JSON data and formats it perfectly into neat, indented objects.</li>
              <li><strong>Multi-Line Support:</strong> It fixes the annoying backslashes (<code>\</code>) found in large terminal strings, blending them into one clean code block.</li>
              <li><strong>Auto Header Mapping:</strong> It pulls out every single <code>-H</code> tag and builds the exact header objects needed for Fetch or Axios.</li>
              <li><strong>Language Switching:</strong> Swap between Fetch, Axios, Python, or raw JSON data with a single click.</li>
            </ul>

            <h2>Technical Specifications</h2>
            <p>For the developers who want to know exactly how the string logic works under the hood.</p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Engine Part</th>
                    <th>Specification Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Parsing Engine</strong></td>
                    <td>Client-side custom tokenizer</td>
                  </tr>
                  <tr>
                    <td><strong>Supported Flags</strong></td>
                    <td>-X, -H, -d, --data, -u, --user</td>
                  </tr>
                  <tr>
                    <td><strong>Output Formats</strong></td>
                    <td>ES6 Fetch, Axios, Python 3 Requests, JSON</td>
                  </tr>
                  <tr>
                    <td><strong>Security Level</strong></td>
                    <td>100% Offline / Browser Memory Only</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>Frequently Asked Questions</h2>

            <h3>Why doesn't my command work?</h3>
            <p>Make sure your pasted text actually starts with the word <code>curl</code>. If you just paste headers or random JSON data, the tool won't know what to do with it.</p>

            <h3>Does it support basic authentication?</h3>
            <p>Yes. If you use the <code>-u</code> or <code>--user</code> flag with a username and password, the tool automatically turns it into a base64 encoded Authorization header for you.</p>

            <h3>How do I copy a request from my browser?</h3>
            <p>Open Chrome or Firefox, right-click anywhere, and click "Inspect" to open the developer tools. Go to the "Network" tab. Find the request you want to save, right-click it, select "Copy", and choose "Copy as cURL". Paste that right into our tool.</p>

            <h3>Why did it change my GET request to a POST?</h3>
            <p>If the tool sees that you attached data (using a <code>-d</code> or <code>--data</code> flag), it knows that the request needs to be a POST method. Standard GET requests cannot hold a data body.</p>
          </div>
        </div>
      </div>
    </>
  );
}
