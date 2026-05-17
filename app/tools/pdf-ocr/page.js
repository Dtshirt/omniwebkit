import PdfOcrClient from './PdfOcrClient';

export const metadata = {
  title: 'Free PDF OCR — Extract Text from Scanned PDFs Instantly',
  description: 'Convert scanned PDFs into editable text right in your browser. Fast, free, and secure PDF OCR tool. No signup required.',
  keywords: [
    'pdf ocr', 'scanned pdf to text', 'pdf to text', 'ocr online',
    'extract text from pdf', 'free pdf ocr', 'convert scanned pdf',
    'image to text', 'optical character recognition'
  ],
  openGraph: {
    title: 'Free PDF OCR | Extract Text from Scanned PDF',
    description: 'Pull text from scanned documents instantly. Small files process safely in your browser.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/pdf-ocr',
  },
};

export default function PdfOcrPage() {
  return (
    <>
      <PdfOcrClient />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="prose-premium">
          <h2>About the Tool: Real Text from Flat Scans</h2>
          <p>A scanned PDF is just a picture of a document. You can't click it, you can't search it, and you definitely can't copy the text. That's a problem when you need to grab quotes from an old book or pull data from a printed invoice.</p>
          <p>Our <strong>PDF OCR</strong> tool fixes that. It looks at the shapes in your PDF image and translates them back into real words. You get clean, plain text that you can copy to your clipboard or download as a text file.</p>
          <p>I built this because I kept finding old research papers that were just scanned images. Retyping them took hours. Now, you can just drop the file in and let the computer do the reading.</p>

          <h2>How to Use This PDF OCR Tool</h2>
          <p>You don't need to install anything. Just follow these steps to extract your text.</p>
          <ol>
            <li><strong>Upload your PDF.</strong> Drag your file into the dashed box above.</li>
            <li><strong>Click "Extract Text".</strong> The tool will start reading your pages one by one.</li>
            <li><strong>Copy or Download.</strong> Once the text appears, hit the copy button or save it as a <code>.txt</code> file.</li>
          </ol>
          <p>If your file is under 5MB, the whole process happens right inside your browser window. You'll see a small "Browser" badge. For files over 5MB, we send them to our fast servers to prevent your computer from freezing.</p>

          <h2>Privacy &amp; Security: Your Data Stays Yours</h2>
          <p>Here's the truth about most online OCR tools — they upload every single file to their servers. We don't do that unless we have to.</p>
          <p>If your PDF is smaller than 5MB, we use a web-based OCR engine. That means your document never leaves your device. It gets processed locally, using your computer's memory. It's the most secure way to convert scanned pdf to text.</p>
          <p>If you upload a massive 40MB file, we do send it to our server. Why? Because heavy OCR tasks will crash your browser tab. But don't worry. Our server reads the text, sends it back to you, and deletes your file automatically after 60 seconds.</p>

          <h2>Features That Actually Help</h2>
          <p>We skipped the useless features and focused on what you actually need to read pdf text fast.</p>
          <ul>
            <li><strong>Smart Routing.</strong> Small files run locally for privacy. Big files use our server for speed.</li>
            <li><strong>Live Progress.</strong> You see exactly which page the tool is reading right now. No guessing.</li>
            <li><strong>Clean Text Output.</strong> We strip out weird formatting so you get plain, ready-to-use text.</li>
            <li><strong>One-Click Copy.</strong> Grab your text instantly without highlighting hundreds of lines.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <p>Curious about how the optical character recognition works under the hood? Here are the details.</p>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Specification</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Browser Engine</td>
                <td>Tesseract.js with WebAssembly</td>
              </tr>
              <tr>
                <td>Server Limit</td>
                <td>Files larger than 5MB (up to 50MB)</td>
              </tr>
              <tr>
                <td>Local Processing</td>
                <td>Files under 5MB</td>
              </tr>
              <tr>
                <td>File Support</td>
                <td>.pdf format only</td>
              </tr>
              <tr>
                <td>Output Format</td>
                <td>Plain Text (.txt) or Clipboard</td>
              </tr>
            </tbody>
          </table>
          <p>One catch — OCR isn't magic. If your scanned document has coffee stains, blurry text, or terrible handwriting, the extracted text might have a few typos. For the best results, use clean, high-contrast scans.</p>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                "name": "PDF OCR Tool",
                "url": "https://omniwebkit.com/tools/pdf-ocr",
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "All",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD"
                },
                "description": "Extract text from scanned PDFs instantly using local or server-based OCR.",
                "author": {
                  "@type": "Organization",
                  "name": "Lazydesigners",
                  "url": "https://lazydesigners.com"
                }
              },
              {
                "@type": "WebPage",
                "@id": "https://omniwebkit.com/tools/pdf-ocr",
                "url": "https://omniwebkit.com/tools/pdf-ocr",
                "name": "Free PDF OCR — Extract Text from Scanned PDFs Instantly",
                "isPartOf": {
                  "@type": "WebSite",
                  "@id": "https://omniwebkit.com/#website",
                  "name": "OmniWebKit",
                  "url": "https://omniwebkit.com"
                },
                "about": {
                  "@type": "Thing",
                  "name": "PDF OCR"
                }
              }
            ]
          })
        }}
      />
    </>
  );
}
