import BarcodeGeneratorClient from "./BarcodeGeneratorClient";

export const metadata = {
  title: "Free Online Barcode Generator - Create Code128, UPC, EAN, QR",
  description: "Instantly generate professional barcodes and QR codes online. Support for single generation or bulk CSV batch creation. Download as high-quality PNG or SVG.",
  keywords: ["barcode generator", "create barcode", "bulk barcode maker", "csv to barcode", "qr code generator", "upc generator", "code128 generator", "ean generator free"],
  openGraph: {
    title: "Free Online Barcode Generator - Create Code128, UPC, EAN, QR",
    description: "Instantly generate professional barcodes and QR codes online. Support for single generation or bulk CSV batch creation. Fast, secure, and free.",
    type: "website",
  },
};

export default function BarcodeGeneratorPage() {
  return <BarcodeGeneratorClient />;
}
