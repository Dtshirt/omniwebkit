import QrScannerClient from "./QrScannerClient";

export const metadata = {
  title: "Free Online QR Code Scanner - Instant Camera & Image Decoder",
  description: "Quickly scan and decode QR codes directly in your browser. Use your webcam or upload an image. 100% free, fast, and secure barcode reader.",
  keywords: ["qr code scanner", "online qr scanner", "scan qr code from image", "qr code reader camera", "barcode scanner online", "read qr code"],
  openGraph: {
    title: "Free Online QR Code Scanner - Instant Camera & Image Decoder",
    description: "Quickly scan and decode QR codes directly in your browser using your camera or by uploading an image. Completely free and secure.",
    type: "website",
  },
};

export default function QrScannerPage() {
  return <QrScannerClient />;
}
