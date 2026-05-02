import { NextResponse } from "next/server";
import Jimp from "jimp";
import pngToIco from "png-to-ico";

export async function POST(request) {
  try {
    const { imageBase64 } = await request.json();
    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Strip prefix (e.g. data:image/png;base64,)
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Read image using Jimp
    const image = await Jimp.read(buffer);

    // Define standard sizes
    const sizes = [16, 32, 48, 180, 192, 512];
    const generatedImages = {};

    // Generate PNGs for all standard sizes
    for (const size of sizes) {
      const resized = image.clone().resize(size, size);
      const imgBuffer = await resized.getBufferAsync(Jimp.MIME_PNG);
      generatedImages[`favicon-${size}x${size}.png`] = imgBuffer.toString("base64");
    }

    // Prepare buffer array for png-to-ico
    // Standard sizes for .ico: 16x16, 32x32, 48x48
    const icoSizes = [16, 32, 48];
    const icoBuffers = [];
    for (const size of icoSizes) {
       const b64 = generatedImages[`favicon-${size}x${size}.png`];
       icoBuffers.push(Buffer.from(b64, "base64"));
    }

    // Generate .ico
    const icoBuffer = await pngToIco(icoBuffers);
    generatedImages["favicon.ico"] = icoBuffer.toString("base64");
    
    // Assign specific names required for Apple and Android
    generatedImages["apple-touch-icon.png"] = generatedImages[`favicon-180x180.png`];
    generatedImages["android-chrome-192x192.png"] = generatedImages[`favicon-192x192.png`];
    generatedImages["android-chrome-512x512.png"] = generatedImages[`favicon-512x512.png`];

    // Generate basic webmanifest
    const webmanifest = `{
  "name": "My App",
  "short_name": "App",
  "icons": [
      {
          "src": "/android-chrome-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
      },
      {
          "src": "/android-chrome-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
      }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}`;
    generatedImages["site.webmanifest"] = Buffer.from(webmanifest).toString("base64");

    return NextResponse.json({
      success: true,
      images: generatedImages
    });
  } catch (error) {
    console.error("Favicon generation error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate favicons" }, { status: 500 });
  }
}
