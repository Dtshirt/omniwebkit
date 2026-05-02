import FaviconGeneratorClient from "./FaviconGeneratorClient";

export const metadata = {
  title: "Free Online Favicon Generator - Create Icons from PNG, JPG, SVG",
  description: "Instantly create high-quality, professional favicon packages for your website. Upload any image (PNG, JPG, SVG) and generate perfectly sized icons for all modern browsers and devices.",
  keywords: ["favicon generator", "create favicon", "ico generator", "apple touch icon generator", "android chrome icon maker", "svg to ico", "png to ico", "website icon creator", "favicon maker"],
  openGraph: {
    title: "Free Online Favicon Generator - Create Icons from PNG, JPG, SVG",
    description: "Instantly create high-quality, professional favicon packages for your website. Upload any image and generate perfectly sized icons for all modern browsers and devices.",
    type: "website",
  },
};

export default function FaviconGeneratorPage() {
  return <FaviconGeneratorClient />;
}
