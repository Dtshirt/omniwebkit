import PhotoCollageClient from "./PhotoCollageClient";

export const metadata = {
  title: "Free High-Res Photo Collage Maker - Arrange Images Online",
  description: "Create stunning photo collages for free. Arrange multiple images in a flexible grid layout and export as a high-resolution PNG. Fast, secure, and professional.",
  keywords: ["photo collage maker", "grid photo editor", "arrange images online", "high res photo collage", "picture grid maker", "combine photos online"],
  openGraph: {
    title: "Free High-Res Photo Collage Maker - Arrange Images Online",
    description: "Create stunning photo collages for free. Arrange multiple images in a flexible grid layout and export as a high-resolution PNG.",
    type: "website",
  },
};

export default function PhotoCollagePage() {
  return <PhotoCollageClient />;
}
