import AudioTrimmerClient from "./AudioTrimmerClient";

export const metadata = {
  title: "Free Audio Trimmer Online - Cut MP3, WAV, AAC Instantly",
  description: "Trim audio files online. Set precise start and end times to cut any MP3, WAV, AAC or FLAC file. Small files trimmed instantly in-browser with no upload required.",
  keywords: ["audio trimmer online", "cut mp3 online", "trim audio file", "audio cutter", "mp3 trimmer", "wav trimmer", "cut audio online free", "audio clip maker"],
  openGraph: {
    title: "Free Audio Trimmer Online - Cut MP3, WAV, AAC Instantly",
    description: "Trim audio files with precise start and end times. Instant browser trimming for small files.",
    type: "website",
  },
};

export default function AudioTrimmerPage() {
  return <AudioTrimmerClient />;
}
