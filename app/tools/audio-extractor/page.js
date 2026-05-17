import AudioExtractorClient from './AudioExtractorClient';

export const metadata = {
  title: 'Free Audio Extractor | Pull MP3 & WAV from Video Quickly',
  description: 'Extract audio from any video instantly. A secure, free audio extractor that converts MP4, MKV, and MOV to MP3 or WAV entirely in your browser.',
  keywords: [
    'audio extractor', 'extract audio from video', 'video to mp3', 'video to wav',
    'extract sound from video', 'free audio extractor', 'online audio extractor',
    'rip audio from video', 'mp4 to mp3'
  ],
  openGraph: {
    title: 'Free Audio Extractor | Pull MP3 & WAV from Video Quickly',
    description: 'Extract audio from any video instantly. A secure, free audio extractor that converts MP4, MKV, and MOV to MP3 or WAV entirely in your browser.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/audio-extractor',
  },
};

export default function AudioExtractorPage() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Audio Extractor",
    "operatingSystem": "All",
    "applicationCategory": "MultimediaApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Extract audio from video files locally in your browser. Convert MP4, MKV, MOV to MP3 or WAV.",
    "author": {
      "@type": "Organization",
      "name": "Lazydesigners",
      "url": "https://github.com/Dtshirt/omniwebkit"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="prose-premium max-w-4xl mx-auto px-4 py-8">
        <h1>Audio Extractor</h1>
        <p>Pull MP3 or WAV files from any video directly in your browser. Fast, secure, and free.</p>
        
        <AudioExtractorClient />

        <h2>About the Tool</h2>
        <p>Sometimes you just need the audio. Maybe it's a podcast recorded as a video, a song from a music clip, or an important speech you want to listen to while running. That's exactly what an <strong>audio extractor</strong> does.</p>
        <p>This tool pulls the audio track right out of your video file. You feed it an MP4, MOV, or MKV, and it hands you back a clean MP3 or WAV file. No weird software to install, no limits on file size, and no confusing menus. I've used heavy video editors just to rip audio before, and it's a total pain. A dedicated, browser-based tool is just faster.</p>
        <p>Whether you're trying to save a lecture from a Zoom recording or grabbing a sound effect from a gameplay clip, having a reliable way to strip the video and keep the sound is a massive time-saver. You don't have to worry about complicated bitrates or codec settings. You drop your file in, and you get your sound out. It really is that simple.</p>

        <h2>How to Use This Extractor</h2>
        <p>We built this to be as straightforward as possible. Follow these simple steps to get your audio:</p>
        <ol>
          <li><strong>Upload your video:</strong> Drag and drop your video file into the box above. If you're on a phone or tablet, just tap the box to browse your device's files or camera roll.</li>
          <li><strong>Pick your format:</strong> Choose whether you want an MP3 or a WAV file. MP3 is great for everyday listening and sharing because it keeps file sizes tiny. WAV is perfect if you need uncompressed, studio-quality sound for editing later.</li>
          <li><strong>Hit Extract:</strong> Click the extract button. The tool starts processing the file instantly.</li>
          <li><strong>Download your audio:</strong> Once it finishes, save the new sound file straight to your device.</li>
        </ol>
        <p>That's pretty much it. Your audio track is ready to go, and you didn't have to jump through any hoops to get it.</p>

        <h2>Your Privacy and Security</h2>
        <p>Here's the thing &mdash; we don't want your files.</p>
        <p>When you use this tool to extract sound from video, the entire process happens right inside your web browser. Your video never uploads to our servers. It stays securely on your device the whole time.</p>
        <p>Why does this matter? First, it means your personal videos stay strictly private. If you're working with sensitive work recordings or private family videos, you don't have to trust a random server with your data.</p>
        <p>Second, you save a ton of time. You don't have to sit around waiting for a 2GB video file to upload over a slow internet connection, and then wait again for the final audio to download. The extraction is handled locally by your own machine's processor. No data collection, no weird tracking, and total peace of mind.</p>

        <h2>Audio Extractor Features</h2>
        <p>We kept the design simple, but there's a lot going on under the hood to make this tool work seamlessly.</p>
        <ul>
          <li><strong>Local Processing:</strong> Everything happens on your device. Zero upload time means much faster results compared to traditional cloud-based tools.</li>
          <li><strong>Multiple Video Formats:</strong> We support almost any video format you throw at it. You can convert MP4 to MP3, or handle MKV, MOV, AVI, and WebM files without any issues.</li>
          <li><strong>Smart Format Selection:</strong> Choose MP3 to save space, or pick WAV if you need the highest possible quality without any compression loss.</li>
          <li><strong>No Watermarks:</strong> Your final audio file is completely clean. We don't add audio watermarks, voiceovers, or metadata tags to your work.</li>
          <li><strong>Totally Free:</strong> There are no subscriptions, no hidden paywalls, and no annoying limits on how many times you can use the tool in a single day.</li>
        </ul>

        <h2>Technical Specifications</h2>
        <p>If you're wondering how this magic happens inside a web page, it comes down to WebAssembly.</p>
        <p>Our audio extractor uses a stripped-down version of FFmpeg &mdash; the industry standard for media processing &mdash; compiled specifically to run inside modern web browsers. When you click extract, your browser essentially acts as a mini video processing server. It reads the container format, locates the audio stream, and repackages it without relying on external software.</p>
        <p>For MP3 extraction, we use standard LAME encoding presets that balance sound quality and file size perfectly. Usually, a typical MP4 to MP3 conversion drops the overall file size by about 90%, making it much easier to share or store. For WAV, the process is even simpler. We pull the exact raw audio data directly from the video stream without compressing it further, ensuring bit-perfect quality.</p>
        <p>One catch &mdash; because the processing happens locally, the speed depends on your device's hardware. A brand new laptop will tear through a 4K video file much faster than an older smartphone. But since there's no upload bottleneck, it's still consistently faster than cloud alternatives.</p>

        <h2>Frequently Asked Questions</h2>
        
        <h3>Does this tool lower the audio quality?</h3>
        <p>No. If you choose WAV, you get the exact uncompressed audio stream from the original video. If you choose MP3, we use a high-quality variable bitrate that sounds completely identical to the original track to the human ear.</p>

        <h3>Is there a file size limit?</h3>
        <p>Because the processing happens directly on your device, the only real limit is your computer's available memory (RAM). Most modern laptops and phones can easily handle files up to 2GB or larger without breaking a sweat. If your browser runs out of memory, it might crash, but you won't lose your original file.</p>

        <h3>Can I extract audio from YouTube links?</h3>
        <p>No. This tool only works with local video files that you already have saved on your computer or phone. It doesn't download videos from streaming sites like YouTube or Vimeo.</p>

        <h3>Does it work on phones and tablets?</h3>
        <p>Yes. The extractor works perfectly on modern iOS and Android web browsers. Just tap the upload box to select a video from your camera roll or files app, and the extraction will happen right there on your mobile device.</p>

        <h3>How long does the extraction actually take?</h3>
        <p>It entirely depends on the size of your video and the speed of your device's processor. Since there is no upload time, a standard 5-minute video usually finishes processing in just a few seconds. Larger feature-length videos will take a bit longer.</p>
  </div>
    </>
  );
}
