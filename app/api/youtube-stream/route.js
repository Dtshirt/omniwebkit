import { NextResponse } from 'next/server';
import { execFile } from 'child_process';

// Use the venv yt-dlp which supports --js-runtime node for YouTube signature solving
const ytDlpBinary = '/var/www/omni_backend/venv/bin/yt-dlp';
const cookiesFile = '/var/www/omni_backend/cookies.txt';

function extractVideoId(url) {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube-nocookie\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m?.[1]) return m[1];
    }
    return null;
}

const execPromise = (args) => {
    return new Promise((resolve, reject) => {
        execFile(ytDlpBinary, args, { maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
            if (error) {
                reject({ error, stderr });
                return;
            }
            resolve(stdout);
        });
    });
};

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const url       = searchParams.get('url');
        const formatId  = searchParams.get('itag') || searchParams.get('format');
        const title     = searchParams.get('title') || 'video';

        const videoId = extractVideoId(url);
        if (!videoId) {
            return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
        }

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Get fresh format URLs with Node.js runtime for proper signature decryption + cookies
        const stdout = await execPromise([
            '--dump-json',
            '--no-warnings',
            '--js-runtime', 'node',
            '--cookies', cookiesFile,
            videoUrl,
        ]);
        const info = JSON.parse(stdout);

        if (!info?.formats) {
            return NextResponse.json({ error: 'No formats available' }, { status: 404 });
        }

        // Find the requested format
        let format = info.formats.find(f => f.format_id === formatId && f.url);
        
        if (!format) {
            // Fallback: best combined format
            format = info.formats
                .filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.url)
                .sort((a, b) => (b.height || 0) - (a.height || 0))[0];
        }
        
        if (!format?.url) {
            return NextResponse.json({ error: 'Stream URL not available' }, { status: 404 });
        }

        // Pipe the stream from YouTube CDN
        const upstream = await fetch(format.url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Range': 'bytes=0-',
            },
        });

        if (!upstream.ok && upstream.status !== 206) {
            return NextResponse.json({ error: 'Failed to fetch stream from YouTube' }, { status: 502 });
        }

        const sanitizedTitle = title.replace(/[^a-zA-Z0-9\s\-_.]/g, '').substring(0, 100) || 'video';
        const ext = format.ext || 'mp4';

        const headers = {
            'Content-Type': upstream.headers.get('content-type') || `video/${ext}`,
            'Content-Disposition': `attachment; filename="${sanitizedTitle}.${ext}"`,
            'Accept-Ranges': 'bytes',
        };
        const cl = upstream.headers.get('content-length');
        if (cl) headers['Content-Length'] = cl;

        return new Response(upstream.body, {
            status: upstream.status === 206 ? 206 : 200,
            headers,
        });

    } catch (error) {
        console.error('YouTube stream error:', error.message || error);
        return NextResponse.json({ error: 'Failed to stream video' }, { status: 500 });
    }
}

export const maxDuration = 120;
export const dynamic = 'force-dynamic';
