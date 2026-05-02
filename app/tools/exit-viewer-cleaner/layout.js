export const metadata = {
  title: 'Free EXIF Viewer & Metadata Cleaner — Remove Hidden Data from Photos Online',
  description:
    'Free online EXIF viewer and metadata cleaner. Upload a JPEG to view GPS location, camera settings, timestamps, and all embedded EXIF data. Strip metadata to protect your privacy. No upload — fully browser-based.',
  keywords: [
    'EXIF viewer online free',
    'remove EXIF data from photo',
    'image metadata viewer',
    'photo metadata remover',
    'strip EXIF data online',
    'GPS data remover from photo',
    'EXIF cleaner free',
    'image privacy scrubber',
    'view photo metadata online',
    'JPEG EXIF analyzer',
  ],
  openGraph: {
    title: 'Free EXIF Viewer & Metadata Cleaner — Remove GPS and Hidden Data from Photos',
    description:
      'View all hidden EXIF metadata in JPEG images — GPS location, camera settings, timestamps, device info — and remove it in one click to protect your privacy. Free, no upload.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/exit-viewer-cleaner',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'EXIF Viewer & Cleaner — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free EXIF Viewer & Metadata Cleaner — Remove Hidden GPS & Photo Metadata',
    description: 'View GPS coordinates, camera settings, timestamps, and all EXIF data in your images. Strip metadata to protect privacy. Free, browser-based.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/tools/exit-viewer-cleaner',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'EXIF Viewer & Metadata Cleaner',
  description:
    'Free browser-based EXIF viewer and metadata remover. Reads raw EXIF binary from JPEG files and displays: file info (format, size, dimensions), GPS coordinates (with OpenStreetMap link), camera make and model, full camera settings (exposure, aperture, ISO, focal length, flash, white balance, metering mode, exposure program, color space), date/time taken, and additional metadata (artist, copyright, image description, resolution). Privacy risk score (0–100%). One-click EXIF removal using canvas redraw. Download cleaned image, export EXIF as JSON, or copy all metadata to clipboard. No server upload — fully browser-based.',
  url: 'https://omniwebkit.com/tools/exit-viewer-cleaner',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Native EXIF binary parser (no external libraries)',
    'Drag-and-drop or click-to-upload image input',
    'GPS latitude, longitude, altitude display',
    'OpenStreetMap link for GPS location preview',
    'Camera make, model, software, orientation display',
    'Camera settings: exposure, aperture, ISO, focal length, flash, white balance, metering',
    'Timestamp fields: date taken, digitized, last modified',
    'Additional metadata: artist, copyright, description, resolution',
    'Privacy risk score (0–100%) with risk level indicator',
    'One-click EXIF removal using HTML canvas redraw',
    'Download EXIF-clean image as JPEG at 95% quality',
    'Export EXIF data as JSON file',
    'Copy all metadata to clipboard',
    'No server upload — all processing is local',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to View and Remove EXIF Metadata from a Photo Online for Free',
  description: 'Steps to read EXIF data and strip metadata using the OmniWebKit EXIF Viewer & Cleaner.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload the image', text: 'Click the upload area or drag and drop a JPEG image file onto it. Any image format is accepted but EXIF data is most common in JPEG files.' },
    { '@type': 'HowToStep', position: 2, name: 'Review the metadata', text: 'The tool displays all embedded EXIF data: GPS location, camera make and model, exposure settings, timestamps, and more. Check the privacy risk score to see how sensitive the data is.' },
    { '@type': 'HowToStep', position: 3, name: 'Check the GPS map link', text: 'If GPS coordinates are found, click the OpenStreetMap link to see exactly where the photo was taken on a map.' },
    { '@type': 'HowToStep', position: 4, name: 'Remove EXIF data', text: 'Click Remove EXIF to create a clean copy of the image with all metadata stripped. The image is redrawn on an HTML canvas at 95% JPEG quality.' },
    { '@type': 'HowToStep', position: 5, name: 'Download the clean image', text: 'Click Download to save the cleaned image. The file is named cleaned_[original filename].jpg.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this EXIF viewer and cleaner free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account, no subscription, no usage limits.' } },
    { '@type': 'Question', name: 'Is my image uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All EXIF parsing and metadata removal runs entirely in your browser using JavaScript. Your image never leaves your device.' } },
    { '@type': 'Question', name: 'What image formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'EXIF data is primarily embedded in JPEG files. PNG, WebP, and other formats typically do not contain EXIF. The tool will process any image and display file information, and will extract EXIF from any JPEG file.' } },
    { '@type': 'Question', name: 'Does removing EXIF affect image quality?', acceptedAnswer: { '@type': 'Answer', text: 'The removal process redraws the image on an HTML canvas and exports it at 95% JPEG quality. The visual difference is imperceptible. File size may change slightly.' } },
    { '@type': 'Question', name: 'What does the privacy risk score mean?', acceptedAnswer: { '@type': 'Answer', text: 'The score is calculated from which sensitive fields are present: GPS (40 points), timestamps (20 points), device info (15 points), personal fields like artist or copyright (15 points), and software (5 points). 60%+ is high risk — usually means GPS data is present.' } },
    { '@type': 'Question', name: 'Can I export the EXIF data?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Export JSON to download all parsed metadata as a .json file. Click Copy All to copy all fields as plain text to your clipboard.' } },
    { '@type': 'Question', name: 'Will social media remove EXIF automatically?', acceptedAnswer: { '@type': 'Answer', text: 'Many platforms like Instagram and Facebook strip EXIF on upload, but not all. Some platforms and file-sharing sites preserve metadata. Always remove EXIF yourself before uploading sensitive photos.' } },
    { '@type': 'Question', name: 'Does the GPS map link share my location?', acceptedAnswer: { '@type': 'Answer', text: 'No. The map link opens OpenStreetMap showing the coordinates found in the image EXIF data. It does not share your current real-world location with anyone.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'EXIF Viewer & Cleaner', item: 'https://omniwebkit.com/tools/exit-viewer-cleaner' },
  ],
};

export default function ExifViewerCleanerLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
