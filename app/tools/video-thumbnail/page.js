import VideoThumbnailClient from "./VideoThumbnailClient";

export const metadata = {
  title: "Free Video Thumbnail Extractor - Extract Frames from Any Video",
  description: "Extract frames from any video file at specific timestamps. Download high-quality PNG or JPG thumbnails instantly. Supports MP4, WebM, MOV, AVI, and more.",
  keywords: ["video thumbnail extractor", "extract frames from video", "video frame capture", "video screenshot tool", "mp4 frame extractor", "video to image"],
  openGraph: {
    title: "Free Video Thumbnail Extractor - Extract Frames from Any Video",
    description: "Extract frames from any video at specific timestamps. Download as PNG or JPG.",
    type: "website",
  },
};

export default function VideoThumbnailPage() {
  return <VideoThumbnailClient />;
}
