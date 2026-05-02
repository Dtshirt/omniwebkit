export const metadata = {
  title: 'Terms of Service - OmniWebKit',
  description: 'Terms and conditions for using OmniWebKit.',
};

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="card p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Terms of Service
          </h1>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <h2>Acceptance of Terms</h2>
            <p>
              By accessing and using OmniWebKit, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>

            <h2>Use License</h2>
            <p>
              Permission is granted to use OmniWebKit for personal and commercial purposes.
              This license shall automatically terminate if you violate any of these restrictions.
            </p>

            <h2>Service Description</h2>
            <p>
              OmniWebKit provides free online utilities and tools for various purposes including
              but not limited to:
            </p>
            <ul>
              <li>Image processing and conversion</li>
              <li>Document manipulation and conversion</li>
              <li>Text processing and formatting</li>
              <li>Mathematical calculations</li>
              <li>Web development tools</li>
              <li>Miscellaneous utility tools</li>
            </ul>

            <h2>User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Use the service lawfully and in accordance with these terms</li>
              <li>Not use the service for any harmful or malicious purposes</li>
              <li>Not attempt to reverse engineer or hack the service</li>
              <li>Respect the intellectual property rights of others</li>
              <li>Not upload illegal, harmful, or copyrighted content</li>
            </ul>

            <h2>Service Availability</h2>
            <p>
              We strive to maintain high availability, but we do not guarantee uninterrupted
              service. The service is provided "as is" without warranties of any kind.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              OmniWebKit shall not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of the service.
            </p>

            <h2>Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also
              governs your use of the service.
            </p>

            <h2>Modifications</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective
              immediately upon posting on the website.
            </p>

            <h2>Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p>Email: legal@omniwebkit.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;