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
  return <BgRemoverClient />;
}