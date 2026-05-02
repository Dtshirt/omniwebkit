import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Remote server returned ${res.status} ${res.statusText}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    return NextResponse.json({
      content: text,
      contentType,
      status: res.status,
      finalUrl: res.url,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out (20s)' }, { status: 504 });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch URL' }, { status: 502 });
  }
}
