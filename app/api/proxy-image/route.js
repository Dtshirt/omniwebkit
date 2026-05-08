import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  const tryFetch = async (targetUrl) => {
    try {
      const urlObj = new URL(targetUrl);
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': urlObj.origin,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        // We use a shorter timeout for the primary attempt to allow for fallback
        signal: AbortSignal.timeout(15000), 
      });
      return response;
    } catch (e) {
      console.error(`Proxy fetch failed for ${targetUrl}:`, e.message);
      return null;
    }
  };

  try {
    let response = await tryFetch(imageUrl);

    // Fallback logic for optimized images (Next.js)
    // If the optimized URL fails (400) or times out, try to fetch the original source
    if ((!response || !response.ok || response.status === 400) && (imageUrl.includes('/_next/image') || imageUrl.includes('?url='))) {
      try {
        const urlObj = new URL(imageUrl);
        const originalUrl = urlObj.searchParams.get('url');
        if (originalUrl) {
          // Construct absolute URL for the source image
          const fallbackUrl = originalUrl.startsWith('http') 
            ? originalUrl 
            : new URL(originalUrl, urlObj.origin).href;
            
          console.log(`Attempting fallback to original source: ${fallbackUrl}`);
          const fallbackRes = await tryFetch(fallbackUrl);
          if (fallbackRes && fallbackRes.ok) {
            response = fallbackRes;
          }
        }
      } catch (e) {
        console.error('Fallback attempt failed:', e.message);
      }
    }

    if (!response || !response.ok) {
      const status = response ? response.status : 500;
      const statusText = response ? response.statusText : 'Fetch failed';
      return new NextResponse(JSON.stringify({ error: `Target returned ${status}: ${statusText}` }), { 
        status: status === 200 ? 500 : status, // Ensure we don't return 200 on error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    
    return new NextResponse(arrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400'
      },
    });

  } catch (error) {
    console.error('Image Proxy Error:', error.message);
    return new NextResponse(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
