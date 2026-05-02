import AudioMergerClient from "./AudioMergerClient";

export const metadata = {
  title: "Free Audio Merger - Combine MP3, WAV, AAC Files Online",
  description: "Merge multiple audio files into one. Combine MP3, WAV, AAC with optional crossfade transitions. Small files merged instantly in-browser; large files processed via server.",
  keywords: ["audio merger", "merge mp3 files", "combine audio files", "join audio", "audio joiner online", "mp3 merger", "wav merger", "crossfade audio merger"],
  openGraph: {
    title: "Free Audio Merger - Combine MP3, WAV, AAC Files Online",
    description: "Merge multiple audio files into one with optional crossfade. Supports MP3, WAV, AAC.",
    type: "website",
  },
};

export default function AudioMergerPage() {
  return <AudioMergerClient />;
}
