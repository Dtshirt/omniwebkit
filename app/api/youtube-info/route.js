import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import path from 'path';

// Using child_process directly to bypass Next.js bundling errors with yt-dlp-exec
const isWin = process.platform === 'win32';
const ytDlpBinary = path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', isWin ? 'yt-dlp.exe' : 'yt-dlp');

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

export async function POST(request) {
    try {
        const { url } = await request.json();
        if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 });

        const videoId = extractVideoId(url.trim());
        if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

        // Get video info
        const stdout = await execPromise(['--dump-json', '--no-warnings', '--no-check-certificates', videoUrl]);
        const info = JSON.parse(stdout);

        if (!info || !info.title) {
            return NextResponse.json({ error: 'Could not retrieve video information' }, { status: 404 });
        }

        const allFormats = info.formats || [];

        // Combined (video + audio)
        const formats = allFormats
            .filter(f => f.vcodec !== 'none' && f.acodec !== 'none' && f.url)
            .map(f => ({
                formatId: f.format_id,
                qualityLabel: f.format_note || f.resolution || 'Unknown',
                container: f.ext || 'mp4',
                contentLength: f.filesize || f.filesize_approx || null,
                mimeType: `video/${f.ext || 'mp4'}`,
                quality: f.quality || 0,
                fps: f.fps || null,
                hasAudio: true,
                hasVideo: true,
                width: f.width || null,
                height: f.height || null,
                url: f.url,
            }))
            .sort((a, b) => (b.height || 0) - (a.height || 0));

        // Video-only
        const videoOnlyFormats = allFormats
            .filter(f => f.vcodec !== 'none' && f.acodec === 'none' && f.url)
            .map(f => ({
                formatId: f.format_id,
                qualityLabel: f.format_note || f.resolution || 'Unknown',
                container: f.ext || 'mp4',
                contentLength: f.filesize || f.filesize_approx || null,
                mimeType: `video/${f.ext || 'mp4'}`,
                quality: f.quality || 0,
                fps: f.fps || null,
                hasAudio: false,
                hasVideo: true,
                width: f.width || null,
                height: f.height || null,
                url: f.url,
            }))
            .sort((a, b) => (b.height || 0) - (a.height || 0))
            .slice(0, 8);

        // Audio-only
        const audioFormats = allFormats
            .filter(f => f.acodec !== 'none' && f.vcodec === 'none' && f.url)
            .map(f => ({
                formatId: f.format_id,
                qualityLabel: f.abr ? `${Math.round(f.abr)}kbps` : (f.format_note || 'audio'),
                container: f.ext || 'webm',
                contentLength: f.filesize || f.filesize_approx || null,
                mimeType: `audio/${f.ext || 'webm'}`,
                quality: 'audio',
                hasAudio: true,
                hasVideo: false,
                audioBitrate: f.abr ? Math.round(f.abr) : null,
                url: f.url,
            }))
            .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))
            .slice(0, 5);

        // Thumbnail
        const thumbnail = info.thumbnail
            || (info.thumbnails?.length ? info.thumbnails[info.thumbnails.length - 1].url : null)
            || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

        return NextResponse.json({
            id: videoId,
            title: info.title,
            author: info.uploader || info.channel || 'Unknown',
            authorUrl: info.uploader_url || info.channel_url || '',
            duration: info.duration ? String(info.duration) : '0',
            viewCount: info.view_count ? String(info.view_count) : '0',
            thumbnail,
            formats,
            videoOnlyFormats,
            audioFormats,
        });

    } catch (error) {
        console.error('YouTube info error:', error.message || error);
        
        const errStr = String(error.stderr || error.message || '');
        if (errStr.includes('Private video') || errStr.includes('private')) {
            return NextResponse.json({ error: 'This video is private.' }, { status: 403 });
        }
        if (errStr.includes('Sign in') || errStr.includes('age')) {
            return NextResponse.json({ error: 'This video requires sign-in or age verification.' }, { status: 403 });
        }

        return NextResponse.json({
            error: 'Failed to fetch video info. Please check the URL and try again.',
        }, { status: 500 });
    }
}

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
