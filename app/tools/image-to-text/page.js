import ImageOcrClient from "./ImageOcrClient";

export const metadata = {
  title: "Image to Text Online — Free OCR Tool Extract Text from Images",
  description: "Extract text from images, screenshots & scanned photos using free OCR technology. Convert image to editable text in seconds — supports JPG, PNG, PDF. No signup.",
  keywords: ["image to text", "ocr online", "extract text from image", "photo to text", "picture to text converter", "free ocr tool", "convert image to text"],
  openGraph: {
    title: "Image to Text Online — Free OCR Tool Extract Text from Images",
    description: "Extract text from images, screenshots & scanned photos using free OCR technology. Convert image to editable text in seconds — supports JPG, PNG, PDF. No signup.",
    type: "website",
  },
};

export default function ImageOcrPage() {
  return <ImageOcrClient />;
}
