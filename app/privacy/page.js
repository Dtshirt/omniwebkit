// src/app/privacy/page.js
export const metadata = {
  title: 'Privacy Policy - OmniWebKit',
  description: 'Our privacy policy and data protection practices.',
};

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>Our Commitment to Privacy</h2>
            <p>
              At OmniWebKit, we are committed to protecting your privacy. This privacy policy explains
              how we handle your information when you use our online tools and services.
            </p>

            <h2>Information We Don't Collect</h2>
            <p>
              OmniWebKit is designed with privacy in mind. We do not collect, store, or transmit any
              of your personal data or files. Here's what we don't collect:
            </p>
            <ul>
              <li>Personal information (name, email, address, phone number)</li>
              <li>Files you upload or process through our tools</li>
              <li>Content of your documents, images, or other data</li>
              <li>Search queries or tool usage patterns</li>
              <li>IP addresses or location data</li>
              <li>Browser fingerprints or tracking cookies</li>
            </ul>

            <h2>How Our Tools Work</h2>
            <p>
              Most of our tools process your data entirely within your browser (client-side processing). However, some specific tools may require server-side processing for complex operations. In all cases:
            </p>
            <ul>
              <li>For client-side tools, your files never leave your device.</li>
              <li>For server-side tools, files are only temporarily uploaded for processing and are immediately and securely deleted afterward.</li>
              <li>We never store, save, or share any of your uploaded files or data.</li>
              <li>You maintain complete control over your privacy and data.</li>
            </ul>

            <h2>Third-Party Services</h2>
            <p>
              We may use third-party services for website analytics and performance monitoring.
              These services may collect anonymous usage data to help us improve our service.
              No personal data or file content is shared with these services.
            </p>

            <h2>Cookies and Local Storage</h2>
            <p>
              We may use local storage and cookies only for:
            </p>
            <ul>
              <li>Remembering your preferences (dark/light mode, settings)</li>
              <li>Storing your tool usage history locally on your device</li>
              <li>Improving website functionality and user experience</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              Since we don't collect or store your data, there's no risk of data breaches involving
              your personal information or files. All processing happens securely within your browser
              using modern web technologies.
            </p>

            <h2>Children's Privacy</h2>
            <p>
              Our services are not directed at children under 13. We do not knowingly collect
              personal information from children under 13.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any
              changes by posting the new policy on this page with an updated "Last updated" date.
            </p>

            <h2>Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at:
            </p>
            <p>Email: privacy@omniwebkit.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;