import AudioTrimmerClient from "./AudioTrimmerClient";

export const metadata = {
  title: "Audio Trimmer Online Free — Cut & Trim MP3, WAV Files in Browser",
  description: "Trim and cut audio files online for free. Clip MP3, WAV, OGG without losing quality. Free audio cutter — no upload to server, works in browser, instant download.",
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
