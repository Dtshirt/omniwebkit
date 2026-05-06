export const metadata = {
  title: 'Audio Converter Online Free — Convert MP3, WAV, FLAC, OGG',
  description: 'Convert audio files between formats online for free. Convert MP3 to WAV, FLAC to MP3, OGG to M4A & more. Free audio format converter — fast, secure, no limits.',
  keywords: [
    'audio converter', 'mp3 converter', 'wav converter', 'flac converter',
    'audio format converter', 'free audio converter', 'online audio converter',
    'convert mp3 to wav', 'convert wav to mp3', 'audio encoding'
  ],
  openGraph: {
    title: 'Audio Converter | OmniWebKit',
    description: 'Fast, secure, hybrid audio converter. Convert between MP3, WAV, AAC, FLAC, OGG, and M4A.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/audio-converter',
  },
};

import AudioConverterClient from './AudioConverterClient';

export default function AudioConverterPage() {
  return <AudioConverterClient />;
}
