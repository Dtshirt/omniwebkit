import ImageOcrClient from "./ImageOcrClient";

export const metadata = {
  title: "Image to Text Converter (OCR) - Extract Text from Photos Free",
  description: "Instantly extract text from images and photos using advanced OCR technology. Supports 50+ languages. Fast, secure, and completely free online text extractor.",
  keywords: ["image to text", "ocr online", "extract text from image", "photo to text", "picture to text converter", "free ocr tool", "convert image to text"],
  openGraph: {
    title: "Image to Text Converter (OCR) - Extract Text from Photos Free",
    description: "Instantly extract text from images and photos using advanced OCR technology. Fast, secure, and completely free online text extractor.",
    type: "website",
  },
};

export default function ImageOcrPage() {
  return <ImageOcrClient />;
}
