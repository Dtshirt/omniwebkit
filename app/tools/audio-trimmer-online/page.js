import Script from "next/script";
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
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Audio Trimmer Online",
    "description": "A browser-based tool to cut and trim MP3, WAV, AAC, and other audio formats instantly without quality loss.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "Lazydesigners",
      "url": "https://github.com/Dtshirt/omniwebkit"
    }
  };

  return (
    <>
      <Script id="audio-trimmer-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <main>
        <AudioTrimmerClient />
        
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose-premium">
            <h2>About the Tool: Precise Audio Trimmer Online</h2>
            <p>
              A 5-minute song takes up unnecessary space if you only need a 10-second ringtone. This <strong>audio trimmer online</strong> lets you isolate exact audio segments instantly. You drag in a track, set your start and end times, and grab your clipped file. 
            </p>
            <p>
              Most audio cutter apps force you to download heavy software just to trim an MP3. I built this to work straight from your browser. Whether you need to cut MP3 online for a podcast intro, extract a sound bite for a video, or trim a WAV file for a music project, this tool gives you sample-accurate precision without the bloat. 
            </p>
            <p>
              I noticed a big problem with most free audio editors — they ruin your audio quality when you export. That is why I made sure this mp3 trimmer preserves your original bitrate. If you feed it a crisp 320kbps track, you get a crisp clip back. No unexpected compression. No muffled sound. 
            </p>

            <h2>How to Use This Free Audio Cutter</h2>
            <p>
              I designed this interface so you don't have to guess where to click. Everything happens on one screen. Here is how you trim your audio file in seconds:
            </p>
            <ol>
              <li><strong>Drop your file:</strong> Drag your MP3, WAV, or AAC file into the upload zone above. You can also tap the box to browse your device files.</li>
              <li><strong>Select the range:</strong> Once the visual waveform loads, drag the purple handles to pick your clip. You can also type the exact start and end times in the boxes below if you know the exact timestamps.</li>
              <li><strong>Choose your format:</strong> Keep the original format or switch the output to MP3, WAV, AAC, or FLAC. You can also adjust the bitrate if you need to shrink the final file size.</li>
              <li><strong>Click Trim:</strong> Hit the export button. The audio clip maker will process your file and give you a download link immediately. You can even preview the cut right there before you save it.</li>
            </ol>

            <h2>Your Privacy Matters</h2>
            <p>
              Uploading personal voice memos or unreleased tracks to random servers feels risky. I completely get it. That's why this tool processes small WAV files entirely locally inside your browser using JavaScript. The file never leaves your device. Your data stays yours.
            </p>
            <p>
              For formats like MP3 and AAC that web browsers can't encode naturally, or for massive files over 50MB, we have to use a secure background server. But here is the catch — we delete these files automatically the exact moment your download finishes. We don't listen to your audio, we don't store backups, and we never share your clips with anyone. 
            </p>

            <h2>Core Features of This MP3 Trimmer</h2>
            <p>
              You get professional-grade editing tools wrapped in a very simple layout. Here is exactly what this audio cutter brings to the table:
            </p>
            <ul>
              <li><strong>Visual waveform editing:</strong> See the physical peaks and valleys of your sound file. This makes it incredibly easy to see exactly where a beat drops or a sentence ends.</li>
              <li><strong>Zero quality loss:</strong> Lossless cutting means your audio stays clean. If you use the WAV to WAV setting, the output matches the input perfectly.</li>
              <li><strong>Multi-format support:</strong> Work comfortably with standard MP3, pristine WAV, Apple AAC, FLAC, and OGG formats without converting them first.</li>
              <li><strong>Built-in format conversion:</strong> Upload a heavy WAV file, select your trim points, and export the short clip directly as a lightweight MP3.</li>
              <li><strong>Sample-accurate cuts:</strong> Type in exact decimals to split audio exactly between frames. Perfect for looping samples.</li>
            </ul>

            <h2>Technical Specifications</h2>
            <p>
              For those who need to know exactly how the engine runs behind the scenes, here are the technical limits and processing capabilities of this tool:
            </p>
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Max Input File Size</td>
                  <td>500MB for server processing / 50MB for instant browser WAV trimming</td>
                </tr>
                <tr>
                  <td>Supported Input Formats</td>
                  <td>MP3, WAV, AAC, FLAC, OGG</td>
                </tr>
                <tr>
                  <td>Supported Export Formats</td>
                  <td>MP3, WAV, AAC, FLAC</td>
                </tr>
                <tr>
                  <td>Processing Engine</td>
                  <td>Local AudioContext (WAV) & FFmpeg Server-side (Others)</td>
                </tr>
                <tr>
                  <td>Audio Bitrate Output</td>
                  <td>64kbps up to 320kbps (Customizable for compressed formats)</td>
                </tr>
              </tbody>
            </table>

            <h2>Frequently Asked Questions</h2>
            <h3>Does this audio trimmer online cost money?</h3>
            <p>
              No. It is completely free to use. There are no hidden subscription fees, no locked features, and absolutely no watermarks added to your trimmed files.
            </p>

            <h3>Why does my MP3 file go to the server?</h3>
            <p>
              Modern web browsers natively decode almost any audio, but they lack the built-in tools to encode formats like MP3 and AAC back together. To give you those formats, we securely pass the file to a temporary server running FFmpeg. It handles the exact cut incredibly fast and hands the new file right back to you.
            </p>

            <h3>Can I cut audio online free on my phone?</h3>
            <p>
              Yes. The entire tool interface is fully responsive. You can upload a voice recording straight from your iPhone or Android, drag the touch-friendly waveform handles with your thumb, and save the clip directly to your phone.
            </p>

            <h3>Will I lose audio quality when I trim a file?</h3>
            <p>
              Not unless you tell it to compress the file. If you upload a WAV file and export a WAV file, the cut is 100% lossless. If you decide to export to MP3 to save space, just make sure to select a high bitrate (like 320k) from the options to maintain the maximum possible audio fidelity.
            </p>

            <h3>How precise is the cut?</h3>
            <p>
              The browser-based WAV trimming is sample-accurate, meaning it cuts down to 1/44100th of a second. The server-based trimming uses FFmpeg's time flags, which are frame-accurate for almost all major audio codecs. You won't hear any weird blips or pops at the start of your trimmed clip.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
