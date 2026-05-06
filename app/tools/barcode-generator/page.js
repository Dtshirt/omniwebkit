import BarcodeGeneratorClient from "./BarcodeGeneratorClient";

export const metadata = {
  title: "Barcode Generator Online Free — Create Barcodes in Any Format",
  description: "Generate barcodes online for free. Create EAN-13, UPC, Code 128, QR codes & more. Download barcode as PNG or SVG. Free barcode maker — instant, no registration.",
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
