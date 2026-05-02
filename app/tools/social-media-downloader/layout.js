import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Social Media Video Downloader — Instagram, Twitter/X, TikTok',
    description:
        'Free online social media video downloader. Download videos from Instagram Reels, Twitter/X, and TikTok. Multiple quality options. No signup.',
    keywords: [
        'social media video downloader free',
        'download instagram reels free',
        'twitter video downloader online',
        'tiktok video downloader free',
        'download video from instagram',
        'x video downloader free',
        'download tiktok without watermark',
        'instagram video saver online',
        'free social media downloader tool',
        'download twitter gif free',
    ],
    openGraph: {
        title: 'Free Social Media Video Downloader',
        description:
            'Download videos from Instagram, Twitter/X, and TikTok. Multiple quality options. Free.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/social-media-downloader',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Social Media Downloader — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Social Media Video Downloader',
        description: 'Download videos from Instagram, Twitter/X, TikTok. Free, no signup.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/social-media-downloader',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Social Media Video Downloader',
    description:
        'Free social media video downloader supporting Instagram (Reels, Posts, Stories, IGTV), Twitter/X (videos, GIFs, multiple qualities), and TikTok (videos, audio, thumbnails). Features: auto platform detection, thumbnail preview with title and author, CORS media proxy with fallback chain, direct download button, multiple quality variants for Twitter, toast notifications, responsive layout. Server-side API extraction. No signup.',
    url: 'https://omniwebkit.com/tools/social-media-downloader',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Download videos from Instagram, Twitter/X, TikTok',
        'Auto platform detection from URL',
        'Thumbnail preview with title and author',
        'Multiple quality options for Twitter videos',
        'CORS media proxy with fallback chain',
        'Instagram Reels, Posts, Stories, IGTV support',
        'TikTok video download without watermark',
        'Copy media URL to clipboard',
        'Toast notification system',
        'Fully responsive design',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Download Social Media Videos for Free',
    description: 'Steps to download videos from Instagram, Twitter/X, or TikTok using OmniWebKit.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Copy the URL', text: 'Open the video on Instagram, Twitter/X, or TikTok and copy the URL.' },
        { '@type': 'HowToStep', position: 2, name: 'Paste the URL', text: 'Paste the URL into the input field. The platform is detected automatically.' },
        { '@type': 'HowToStep', position: 3, name: 'Click Get Video', text: 'The tool extracts the video source and shows a thumbnail preview.' },
        { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Click Download to save the video to your device.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this downloader free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
        { '@type': 'Question', name: 'Does it work with private accounts?', acceptedAnswer: { '@type': 'Answer', text: 'No. Only publicly accessible posts can be downloaded.' } },
        { '@type': 'Question', name: 'What video formats are downloaded?', acceptedAnswer: { '@type': 'Answer', text: 'Videos as MP4, images as JPG, GIFs as their original format.' } },
        { '@type': 'Question', name: 'Why does it sometimes fail?', acceptedAnswer: { '@type': 'Answer', text: 'Platforms change their page structure frequently. Try again later.' } },
        { '@type': 'Question', name: 'Can I download Instagram Stories?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, if publicly accessible. Private or expired Stories cannot be downloaded.' } },
        { '@type': 'Question', name: 'Does TikTok download include watermark?', acceptedAnswer: { '@type': 'Answer', text: 'The tool attempts to download without watermark when available.' } },
        { '@type': 'Question', name: 'Is this legal?', acceptedAnswer: { '@type': 'Answer', text: 'Downloading public content for personal use is generally permitted. Respect copyright.' } },
        { '@type': 'Question', name: 'Does it store my data?', acceptedAnswer: { '@type': 'Answer', text: 'No. No URLs, videos, or personal data are stored.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Social Media Downloader', item: 'https://omniwebkit.com/tools/social-media-downloader' },
    ],
};

export default function SocialMediaDownloaderLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="social-media-downloader" category="media" />
        </>
    );
}
