import { NextResponse } from 'next/server';

// Proxy media downloads to bypass CORS restrictions on CDN URLs
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const mediaUrl = searchParams.get('url');
        const filename = searchParams.get('filename') || 'download';

        if (!mediaUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Only allow proxying from known CDN domains
        const allowedDomains = [
            'scontent', 'cdninstagram', 'fbcdn', // Instagram CDN
            'video.twimg', 'pbs.twimg', 'abs.twimg', // Twitter CDN
            'v16', 'v19', 'v77', 'pull', // TikTok CDN patterns
            'tiktokcdn', 'musical',
            'img.youtube', // YouTube thumbnails
        ];

        const urlObj = new URL(mediaUrl);
        const isAllowed = allowedDomains.some(d => urlObj.hostname.includes(d));
        if (!isAllowed) {
            return NextResponse.json({ error: 'Domain not allowed' }, { status: 403 });
        }

        const res = await fetch(mediaUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Referer': urlObj.origin,
            },
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Failed to fetch media' }, { status: res.status });
        }

        const contentType = res.headers.get('content-type') || 'application/octet-stream';
        const contentLength = res.headers.get('content-length');

        // Determine file extension from content type
        let ext = 'mp4';
        if (contentType.includes('image/jpeg')) ext = 'jpg';
        else if (contentType.includes('image/png')) ext = 'png';
        else if (contentType.includes('image/webp')) ext = 'webp';
        else if (contentType.includes('video/mp4')) ext = 'mp4';
        else if (contentType.includes('video/webm')) ext = 'webm';

        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9\s-_.]/g, '').substring(0, 100);

        const headers = {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${sanitizedFilename}.${ext}"`,
        };
        if (contentLength) headers['Content-Length'] = contentLength;

        return new Response(res.body, { headers });

    } catch (error) {
        console.error('Media proxy error:', error.message);
        return NextResponse.json({ error: 'Failed to proxy media' }, { status: 500 });
    }
}

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
