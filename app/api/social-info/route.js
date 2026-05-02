import { NextResponse } from 'next/server';

const BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};

function extractInstagramId(url) {
    const match = url.match(/instagram\.com\/(?:p|reel|reels|tv|stories\/[^/]+)\/([a-zA-Z0-9_-]+)/i);
    return match ? match[1] : null;
}

function cleanUrl(raw) {
    if (!raw) return null;
    return raw
        .replace(/\\u0026/g, '&')
        .replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>')
        .replace(/\\\//g, '/')
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '')
        .replace(/\\/g, '');
}

// Method 1: Fetch the actual Instagram post page and parse embedded JSON
async function method_pageFetch(shortcode) {
    try {
        const pageUrl = `https://www.instagram.com/p/${shortcode}/`;
        const res = await fetch(pageUrl, { headers: BROWSER_HEADERS, redirect: 'follow' });
        if (!res.ok) return null;
        const html = await res.text();

        // Try multiple JSON patterns embedded in the page

        // Pattern 1: window.__additionalDataLoaded
        const addDataMatch = html.match(/window\.__additionalDataLoaded\s*\(\s*['"][^'"]*['"]\s*,\s*(\{.+?\})\s*\)\s*;/s);
        if (addDataMatch) {
            try {
                const data = JSON.parse(addDataMatch[1]);
                const media = data?.graphql?.shortcode_media || data?.items?.[0];
                const result = extractFromMediaObj(media);
                if (result) return result;
            } catch { }
        }

        // Pattern 2: window._sharedData
        const sharedMatch = html.match(/window\._sharedData\s*=\s*(\{.+?\})\s*;/s);
        if (sharedMatch) {
            try {
                const data = JSON.parse(sharedMatch[1]);
                const media = data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
                const result = extractFromMediaObj(media);
                if (result) return result;
            } catch { }
        }

        // Pattern 3: __NEXT_DATA__ or require("ServerJS").handleWithCustomApplyEach
        const nextDataMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>(\{.+?\})<\/script>/s);
        if (nextDataMatch) {
            try {
                const data = JSON.parse(nextDataMatch[1]);
                // Navigate through Next.js data structure
                const props = data?.props?.pageProps;
                if (props) {
                    // Try various paths
                    const media = props?.graphql?.shortcode_media
                        || props?.media
                        || props?.post?.shortcode_media;
                    const result = extractFromMediaObj(media);
                    if (result) return result;
                }
            } catch { }
        }

        // Pattern 4: Regex for video_url / video_versions directly in the HTML
        const videoUrlMatch = html.match(/"video_url"\s*:\s*"(https?:[^"]+)"/);
        if (videoUrlMatch) {
            return {
                platform: 'instagram',
                type: 'video',
                downloadUrl: cleanUrl(videoUrlMatch[1]),
                title: 'Instagram Video',
            };
        }

        const videoVersionsMatch = html.match(/"video_versions"\s*:\s*\[\s*\{[^}]*"url"\s*:\s*"(https?:[^"]+)"/);
        if (videoVersionsMatch) {
            return {
                platform: 'instagram',
                type: 'video',
                downloadUrl: cleanUrl(videoVersionsMatch[1]),
                title: 'Instagram Video',
            };
        }

        // Pattern 5: display_url for images
        const displayUrlMatch = html.match(/"display_url"\s*:\s*"(https?:[^"]+)"/);
        if (displayUrlMatch) {
            return {
                platform: 'instagram',
                type: 'image',
                downloadUrl: cleanUrl(displayUrlMatch[1]),
                title: 'Instagram Post',
            };
        }

        // Pattern 6: og:video meta tag
        const ogVideoMatch = html.match(/<meta\s+(?:property|name)="og:video"\s+content="(https?:[^"]+)"/i)
            || html.match(/<meta\s+content="(https?:[^"]+)"\s+(?:property|name)="og:video"/i);
        if (ogVideoMatch) {
            return {
                platform: 'instagram',
                type: 'video',
                downloadUrl: cleanUrl(ogVideoMatch[1]),
                title: extractOgTitle(html) || 'Instagram Video',
                thumbnail: extractOgImage(html),
            };
        }

        // Pattern 7: og:image for image posts
        const ogImageMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="(https?:[^"]+)"/i)
            || html.match(/<meta\s+content="(https?:[^"]+)"\s+(?:property|name)="og:image"/i);
        if (ogImageMatch) {
            return {
                platform: 'instagram',
                type: 'image',
                downloadUrl: cleanUrl(ogImageMatch[1]),
                title: extractOgTitle(html) || 'Instagram Post',
            };
        }

    } catch (e) {
        console.error('Instagram page fetch failed:', e.message);
    }
    return null;
}

function extractOgTitle(html) {
    const m = html.match(/<meta\s+(?:property|name)="og:title"\s+content="([^"]+)"/i)
        || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:title"/i);
    return m ? m[1].substring(0, 100) : null;
}

function extractOgImage(html) {
    const m = html.match(/<meta\s+(?:property|name)="og:image"\s+content="(https?:[^"]+)"/i)
        || html.match(/<meta\s+content="(https?:[^"]+)"\s+(?:property|name)="og:image"/i);
    return m ? cleanUrl(m[1]) : null;
}

function extractFromMediaObj(media) {
    if (!media) return null;

    // Video content
    const videoUrl = media.video_url
        || media.video_versions?.[0]?.url
        || media.video_dash_manifest // fallback
        ;
    if (videoUrl && !videoUrl.includes('dash_manifest')) {
        return {
            platform: 'instagram',
            type: 'video',
            downloadUrl: cleanUrl(videoUrl),
            title: media.edge_media_to_caption?.edges?.[0]?.node?.text?.substring(0, 100)
                || media.caption?.text?.substring(0, 100)
                || 'Instagram Video',
            thumbnail: media.display_url || media.image_versions2?.candidates?.[0]?.url,
        };
    }

    // Image content
    const imageUrl = media.display_url
        || media.image_versions2?.candidates?.[0]?.url
        || media.display_resources?.[media.display_resources.length - 1]?.src;
    if (imageUrl) {
        return {
            platform: 'instagram',
            type: 'image',
            downloadUrl: cleanUrl(imageUrl),
            title: media.edge_media_to_caption?.edges?.[0]?.node?.text?.substring(0, 100)
                || media.caption?.text?.substring(0, 100)
                || 'Instagram Post',
        };
    }

    return null;
}

// Method 2: Instagram embed page
async function method_embed(shortcode) {
    try {
        const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
        const res = await fetch(embedUrl, {
            headers: {
                ...BROWSER_HEADERS,
                'Referer': 'https://www.instagram.com/',
            },
        });
        if (!res.ok) return null;
        const html = await res.text();

        // Extract from EmbeddedMediaImage / EmbeddedMediaVideo class
        const videoMatch = html.match(/"video_url"\s*:\s*"(https?:[^"]+)"/);
        if (videoMatch) {
            return {
                platform: 'instagram',
                type: 'video',
                downloadUrl: cleanUrl(videoMatch[1]),
                title: 'Instagram Video',
            };
        }

        // Look for class="EmbeddedMediaImage" src
        const embImgMatch = html.match(/class="EmbeddedMediaImage"[^>]*src="(https?:[^"]+)"/);
        if (embImgMatch) {
            return {
                platform: 'instagram',
                type: 'image',
                downloadUrl: cleanUrl(embImgMatch[1]),
                title: 'Instagram Post',
            };
        }

        // Broader search for any Instagram CDN video URL
        const cdnVideoMatch = html.match(/(https?:\/\/(?:scontent|video)[^"'\s]+\.(?:mp4|mov)[^"'\s]*)/i);
        if (cdnVideoMatch) {
            return {
                platform: 'instagram',
                type: 'video',
                downloadUrl: cleanUrl(cdnVideoMatch[1]),
                title: 'Instagram Video',
            };
        }

        // CDN image URL
        const cdnImgMatch = html.match(/"display_url"\s*:\s*"(https?:[^"]+)"/);
        if (cdnImgMatch) {
            return {
                platform: 'instagram',
                type: 'image',
                downloadUrl: cleanUrl(cdnImgMatch[1]),
                title: 'Instagram Post',
            };
        }

    } catch (e) {
        console.error('Instagram embed failed:', e.message);
    }
    return null;
}

// Method 3: Instagram ?__a=1 API
async function method_api(shortcode) {
    try {
        const apiUrl = `https://www.instagram.com/p/${shortcode}/?__a=1&__d=dis`;
        const res = await fetch(apiUrl, {
            headers: {
                'User-Agent': BROWSER_HEADERS['User-Agent'],
                'Accept': '*/*',
                'X-IG-App-ID': '936619743392459',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': 'https://www.instagram.com/',
                'X-ASBD-ID': '129477',
            },
        });
        if (!res.ok) return null;

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { return null; }

        const media = data?.items?.[0] || data?.graphql?.shortcode_media;
        return extractFromMediaObj(media);
    } catch (e) {
        console.error('Instagram API failed:', e.message);
    }
    return null;
}

// Method 4: Instagram oEmbed (at least gets thumbnail)
async function method_oembed(shortcode) {
    try {
        const url = `https://graph.facebook.com/v18.0/instagram_oembed?url=https://www.instagram.com/p/${shortcode}/&access_token=IGQV`;
        const res = await fetch(`https://noembed.com/embed?url=https://www.instagram.com/p/${shortcode}/`);
        if (!res.ok) return null;
        const data = await res.json();
        if (data.error) return null;

        return {
            platform: 'instagram',
            type: 'image',
            downloadUrl: data.thumbnail_url,
            title: data.title?.substring(0, 100) || 'Instagram Post',
            author: data.author_name,
        };
    } catch {
        return null;
    }
}

// Main Instagram extraction — tries all methods in order
async function extractInstagram(url) {
    const shortcode = extractInstagramId(url);
    if (!shortcode) {
        throw new Error('Invalid Instagram URL. Please use a link to a post, reel, or story.');
    }

    // Try methods in order of reliability
    const methods = [
        { name: 'page', fn: () => method_pageFetch(shortcode) },
        { name: 'embed', fn: () => method_embed(shortcode) },
        { name: 'api', fn: () => method_api(shortcode) },
        { name: 'oembed', fn: () => method_oembed(shortcode) },
    ];

    for (const method of methods) {
        try {
            const result = await method.fn();
            if (result && result.downloadUrl) {
                console.log(`Instagram: extracted via ${method.name}`);
                return result;
            }
        } catch (e) {
            console.error(`Instagram ${method.name} failed:`, e.message);
        }
    }

    throw new Error('Could not extract media. The post may be private, or Instagram has blocked server-side access. Try a different post or try again later.');
}

// Extract Twitter video URLs
async function extractTwitter(url) {
    try {
        // Extract tweet ID
        const tweetIdMatch = url.match(/status\/(\d+)/);
        if (!tweetIdMatch) throw new Error('Invalid Twitter URL');
        const tweetId = tweetIdMatch[1];

        // Use syndication API (public, no auth required)
        const syndicationUrl = `https://cdn.syndication.twimg.com/tweet-result?id=${tweetId}&token=0`;
        const res = await fetch(syndicationUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        if (!res.ok) {
            throw new Error('Could not fetch tweet data');
        }

        const data = await res.json();

        // Check for video
        if (data.mediaDetails && data.mediaDetails.length > 0) {
            for (const media of data.mediaDetails) {
                if (media.type === 'video' || media.type === 'animated_gif') {
                    const variants = media.video_info?.variants || [];

                    // Get MP4 variants sorted by bitrate
                    const mp4Variants = variants
                        .filter(v => v.content_type === 'video/mp4')
                        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

                    if (mp4Variants.length > 0) {
                        return {
                            platform: 'twitter',
                            type: media.type === 'animated_gif' ? 'gif' : 'video',
                            title: data.text?.substring(0, 100) || 'Twitter Video',
                            author: data.user?.name || 'Unknown',
                            authorHandle: data.user?.screen_name || '',
                            thumbnail: media.media_url_https,
                            variants: mp4Variants.map(v => ({
                                url: v.url,
                                bitrate: v.bitrate,
                                quality: v.bitrate > 2000000 ? 'High' : v.bitrate > 800000 ? 'Medium' : 'Low',
                                label: v.bitrate > 2000000 ? '720p+' : v.bitrate > 800000 ? '480p' : '360p',
                            })),
                            downloadUrl: mp4Variants[0].url,
                        };
                    }
                }

                // Image
                if (media.type === 'photo') {
                    return {
                        platform: 'twitter',
                        type: 'image',
                        title: data.text?.substring(0, 100) || 'Twitter Image',
                        author: data.user?.name || 'Unknown',
                        downloadUrl: media.media_url_https + '?name=orig',
                        thumbnail: media.media_url_https,
                    };
                }
            }
        }

        throw new Error('No downloadable media found in this tweet. Make sure the tweet contains a video or image.');

    } catch (error) {
        throw new Error(error.message || 'Failed to extract Twitter content');
    }
}

// Extract TikTok video URLs
async function extractTikTok(url) {
    try {
        // Use TikTok's oEmbed API
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
        });

        if (!res.ok) {
            throw new Error('Could not fetch TikTok data');
        }

        const data = await res.json();

        // Try to get the actual video page to extract the video URL
        const pageRes = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html',
            },
            redirect: 'follow',
        });

        if (pageRes.ok) {
            const html = await pageRes.text();

            // Try to find video URL in __UNIVERSAL_DATA_FOR_REHYDRATION__
            const dataMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);
            if (dataMatch) {
                try {
                    const pageData = JSON.parse(dataMatch[1]);
                    const videoData = pageData?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.itemInfo?.itemStruct;

                    if (videoData?.video?.playAddr) {
                        return {
                            platform: 'tiktok',
                            type: 'video',
                            title: data.title || videoData.desc || 'TikTok Video',
                            author: data.author_name || videoData.author?.nickname || 'Unknown',
                            thumbnail: data.thumbnail_url || videoData.video?.cover,
                            downloadUrl: videoData.video.playAddr,
                            duration: videoData.video.duration,
                        };
                    }

                    if (videoData?.video?.downloadAddr) {
                        return {
                            platform: 'tiktok',
                            type: 'video',
                            title: data.title || videoData.desc || 'TikTok Video',
                            author: data.author_name || videoData.author?.nickname || 'Unknown',
                            thumbnail: data.thumbnail_url || videoData.video?.cover,
                            downloadUrl: videoData.video.downloadAddr,
                            duration: videoData.video.duration,
                        };
                    }
                } catch (e) {
                    // JSON parse failed
                }
            }

            // Try SIGI_STATE approach
            const sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>([^<]+)<\/script>/);
            if (sigiMatch) {
                try {
                    const sigiData = JSON.parse(sigiMatch[1]);
                    const items = sigiData?.ItemModule;
                    if (items) {
                        const firstKey = Object.keys(items)[0];
                        if (firstKey && items[firstKey]?.video?.playAddr) {
                            return {
                                platform: 'tiktok',
                                type: 'video',
                                title: data.title || items[firstKey].desc || 'TikTok Video',
                                author: data.author_name || 'Unknown',
                                thumbnail: data.thumbnail_url,
                                downloadUrl: items[firstKey].video.playAddr,
                            };
                        }
                    }
                } catch (e) {
                    // JSON parse failed
                }
            }
        }

        // Return oembed info even if we can't get direct download
        return {
            platform: 'tiktok',
            type: 'video',
            title: data.title || 'TikTok Video',
            author: data.author_name || 'Unknown',
            thumbnail: data.thumbnail_url,
            downloadUrl: null,
            embedHtml: data.html,
            error: 'Direct download URL could not be extracted. TikTok frequently changes their page structure.',
        };

    } catch (error) {
        throw new Error(error.message || 'Failed to extract TikTok content');
    }
}

function detectPlatform(url) {
    if (/instagram\.com/i.test(url)) return 'instagram';
    if (/(?:twitter\.com|x\.com)/i.test(url)) return 'twitter';
    if (/tiktok\.com/i.test(url)) return 'tiktok';
    return null;
}

export async function POST(request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const platform = detectPlatform(url);
        if (!platform) {
            return NextResponse.json({ error: 'Unsupported platform. Please use an Instagram, Twitter/X, or TikTok URL.' }, { status: 400 });
        }

        let result;
        switch (platform) {
            case 'instagram':
                result = await extractInstagram(url);
                break;
            case 'twitter':
                result = await extractTwitter(url);
                break;
            case 'tiktok':
                result = await extractTikTok(url);
                break;
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Social media extraction error:', error.message);
        return NextResponse.json({ error: error.message || 'Failed to extract media' }, { status: 500 });
    }
}
