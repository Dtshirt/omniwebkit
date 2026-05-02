import VideoToAudioClient from "./VideoToAudioClient";

export const metadata = {
  title: "Free Video to Audio Converter - Extract MP3, WAV, AAC, FLAC",
  description: "Convert any video to audio instantly. Extract MP3, WAV, AAC, or FLAC from MP4, MOV, AVI, MKV and more. Small files processed in-browser, large files via secure server conversion.",
  keywords: ["video to audio converter", "mp4 to mp3", "video to mp3", "extract audio from video", "mp4 to flac", "video to aac", "video to wav", "free audio extractor"],
  openGraph: {
    title: "Free Video to Audio Converter - Extract MP3, WAV, AAC, FLAC",
    description: "Convert any video to audio. Extract MP3, WAV, AAC, or FLAC instantly.",
    type: "website",
  },
};

export default function VideoToAudioPage() {
  return <VideoToAudioClient />;
}
