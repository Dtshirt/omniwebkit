import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const mode = searchParams.get('mode'); // 'fetch' or 'check'

    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    try {
        if (mode === 'check') {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            try {
                // Try HEAD first
                const res = await fetch(url, {
                    method: 'HEAD',
                    signal: controller.signal,
                    headers: { 'User-Agent': 'OmniWebKit-Bot/1.0' }
                });
                clearTimeout(timeoutId);
                return NextResponse.json({ status: res.status, ok: res.ok, type: res.type });
            } catch (error) {
                clearTimeout(timeoutId);

                // If HEAD fails (e.g. 405 Method Not Allowed), try GET
                if (error.name !== 'AbortError') {
                    const controller2 = new AbortController();
                    const timeoutId2 = setTimeout(() => controller2.abort(), 8000);
                    try {
                        const res2 = await fetch(url, {
                            method: 'GET',
                            signal: controller2.signal,
                            headers: { 'User-Agent': 'OmniWebKit-Bot/1.0', 'Range': 'bytes=0-1024' } // Try to fetch only first 1KB
                        });
                        clearTimeout(timeoutId2);
                        return NextResponse.json({ status: res2.status, ok: res2.ok });
                    } catch (err2) {
                        return NextResponse.json({ status: 'Error', ok: false, error: err2.message });
                    }
                }
                return NextResponse.json({ status: 'Timeout', ok: false, error: 'Request timed out' });
            }
        } else {
            // mode = fetch (default) - Fetch page HTML
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; OmniWebKit-Bot/1.0; +https://omniwebkit.com/bot)'
                }
            });

            if (!res.ok) {
                return NextResponse.json({ error: `Failed to fetch: ${res.status} ${res.statusText}` }, { status: res.status });
            }

            const html = await res.text();
            return NextResponse.json({ html });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
