import Script from "next/script";
import BgRemoverClient from "./BgRemoverClient";

export const metadata = {
  title: "Free AI Background Remover - Make Image Backgrounds Transparent",
  description: "Instantly remove backgrounds from images online for free. AI-powered precision makes removing backgrounds easy. Download high-quality transparent PNGs.",
  keywords: ["background remover", "remove bg", "transparent background", "ai background removal", "free background remover", "make image transparent"],
  openGraph: {
    title: "Free AI Background Remover - Make Image Backgrounds Transparent",
    description: "Instantly remove backgrounds from images online for free. Download high-quality transparent PNGs securely.",
    type: "website",
  },
};

export default function BgRemoverPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AI Background Remover",
    "description": "An AI-powered tool to remove image backgrounds instantly and create transparent PNGs directly in the browser.",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
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
      <Script id="bg-remover-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <main>
        <BgRemoverClient />

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose-premium">
            <h2>About the Tool: Precise AI Background Remover</h2>
            <p>
              Cutting out an image by hand is a massive waste of time. I built this <strong>background remover</strong> to handle the tedious work for you. You drop your photo in, and a neural network instantly separates your subject from the background. 
            </p>
            <p>
              Many tools that <strong>remove bg</strong> elements either charge you money or force you to download low-resolution previews. I wanted a free background remover that respects your workflow. Whether you need a transparent background for a product shot, a clean headshot for LinkedIn, or an isolated graphic for a YouTube thumbnail, this tool gets it done in seconds. 
            </p>

            <h2>How to Use This Transparent Background Tool</h2>
            <p>
              You do not need graphic design skills or Photoshop experience. Just follow these quick steps:
            </p>
            <ol>
              <li><strong>Upload your photo:</strong> Drag a JPG, PNG, or WEBP file into the upload area above. You can also click the button to browse your device files.</li>
              <li><strong>Let the AI work:</strong> Our system immediately begins to process the image. If your file is under 5MB, the AI runs right inside your web browser.</li>
              <li><strong>Check the preview:</strong> A chequered pattern will appear behind your subject, confirming we made the image transparent successfully.</li>
              <li><strong>Download your file:</strong> Hit the green download button to save your high-quality, transparent PNG directly to your computer or phone.</li>
            </ol>

            <h2>Privacy & Security: 100% Secure AI Background Removal</h2>
            <p>
              Uploading personal photos to random websites feels risky. I completely understand. That is why this tool handles privacy differently than most. 
            </p>
            <p>
              For standard photos (under 5MB), we download an ONNX neural network directly into your browser using WebAssembly. This means the tool cuts out the background on your actual device. Your image never travels across the internet, and no server ever sees it. 
            </p>
            <p>
              If you upload a massive raw file over 5MB, we pass it to a secure backend server. We process the heavy image, send the transparent version back to you, and delete the original file immediately. We do not store your data.
            </p>

            <h2>Core Features That Make This Tool Different</h2>
            <p>
              You might wonder what sets this specific tool apart from other background erasers. Here is exactly what you get:
            </p>
            <ul>
              <li><strong>Zero resolution loss:</strong> We do not shrink your image. If you upload a 4000x4000 pixel photo, you get a 4000x4000 pixel transparent PNG back.</li>
              <li><strong>Local edge computing:</strong> Using WebAssembly intelligence, we bypass server bottlenecks entirely for smaller files, making the process incredibly fast.</li>
              <li><strong>Pixel-perfect edges:</strong> The U-Net architecture handles difficult details beautifully. It preserves flyaway hair, animal fur, and complex outlines that older tools usually chop off.</li>
              <li><strong>No hidden fees:</strong> This is a genuinely free tool. We do not ask for a credit card, and we do not stick a watermark on your final image.</li>
            </ul>

            <h2>Technical Specifications</h2>
            <p>
              If you are a developer or power user, here are the technical limits and engine details behind the tool:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Supported Input Formats</td>
                  <td>PNG, JPG, JPEG, WEBP</td>
                </tr>
                <tr>
                  <td>Output Format</td>
                  <td>Transparent PNG (Lossless)</td>
                </tr>
                <tr>
                  <td>Browser Processing Limit</td>
                  <td>Files under 5MB (WebAssembly)</td>
                </tr>
                <tr>
                  <td>Server Processing Limit</td>
                  <td>Files over 5MB (Python rembg Engine)</td>
                </tr>
                <tr>
                  <td>Max Resolution</td>
                  <td>Maintains original input resolution</td>
                </tr>
              </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>
            <h3>How does the AI background removal actually work?</h3>
            <p>
              We utilize advanced AI Vision models trained on millions of images. These models learn to recognize human faces, products, animals, and objects. The AI draws an invisible mathematical mask around the main subject and simply deletes the background scenery.
            </p>

            <h3>What types of images work best with this tool?</h3>
            <p>
              Photos with a clear, sharp contrast between the main subject and the background yield the best results. However, the AI is smart enough to handle complex hair, fur, and even semi-transparent objects like glasses. 
            </p>

            <h3>Do I need to pay to download the high-resolution image?</h3>
            <p>
              No. Unlike other tools that charge you for the full-size download, we give you the maximum resolution result for free.
            </p>

            <h3>Can I make an image transparent on my mobile phone?</h3>
            <p>
              Yes. The tool is fully responsive. You can snap a picture on your iPhone or Android and upload it directly. The AI will remove the background just as fast as it does on a desktop computer.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}