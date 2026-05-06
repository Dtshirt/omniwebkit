import VideoToAudioClient from "./VideoToAudioClient";

export const metadata = {
  title: "Video to Audio Converter Free Online — Extract MP3 from Video",
  description: "Convert video files to MP3, AAC, WAV audio online for free. Extract audio track from MP4, MKV, AVI videos. Free video to audio converter — instant, no signup.",
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
