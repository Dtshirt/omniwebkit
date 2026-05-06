import PhotoCollageClient from "./PhotoCollageClient";

export const metadata = {
  title: "Free Photo Collage Maker Online — Create Collages in Minutes",
  description: "Create beautiful photo collages online with free templates. Make Instagram, Facebook & WhatsApp collages with your photos. No download, 100% free.",
  keywords: ["photo collage maker", "grid photo editor", "arrange images online", "high res photo collage", "picture grid maker", "combine photos online"],
  openGraph: {
    title: "Free Photo Collage Maker Online — Create Collages in Minutes",
    description: "Create beautiful photo collages online with free templates. Make Instagram, Facebook & WhatsApp collages with your photos. No download, 100% free.",
    type: "website",
  },
};

export default function PhotoCollagePage() {
  return <PhotoCollageClient />;
}
