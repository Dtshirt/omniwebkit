export const metadata = {
  title: 'Audio Extractor | Extract Audio from Video | OmniWebKit',
  description: 'Fast, secure, hybrid audio extractor. Extract MP3 or WAV audio tracks from any video (MP4, MKV, MOV, AVI) directly in your browser or on our secure servers.',
  keywords: [
    'audio extractor', 'extract audio from video', 'video to mp3', 'video to wav',
    'extract sound from video', 'free audio extractor', 'online audio extractor',
    'rip audio from video', 'mp4 to mp3'
  ],
  openGraph: {
    title: 'Audio Extractor | Extract Audio from Video | OmniWebKit',
    description: 'Fast, secure, hybrid audio extractor. Extract MP3 or WAV audio from video files.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/audio-extractor',
  },
};

import AudioExtractorClient from './AudioExtractorClient';

export default function AudioExtractorPage() {
  return <AudioExtractorClient />;
}
