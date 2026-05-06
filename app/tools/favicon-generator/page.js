import FaviconGeneratorClient from "./FaviconGeneratorClient";

export const metadata = {
  title: "Free Favicon Generator — Create Favicon from Image or Text",
  description: "Create favicons for your website in all sizes (16x16, 32x32, 64x64, 180x180). Convert any image to favicon ICO, PNG & Apple touch icon format. Free online.",
  keywords: ["favicon generator", "create favicon", "ico generator", "apple touch icon generator", "android chrome icon maker", "svg to ico", "png to ico", "website icon creator", "favicon maker"],
  openGraph: {
    title: "Free Favicon Generator — Create Favicon from Image or Text",
    description: "Create favicons for your website in all sizes (16x16, 32x32, 64x64, 180x180). Convert any image to favicon ICO, PNG & Apple touch icon format. Free online.",
    type: "website",
  },
};

export default function FaviconGeneratorPage() {
  return <FaviconGeneratorClient />;
}
