import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Url from '@/models/Url';

export async function GET(request, { params }) {
  const { slug } = params;

  try {
    await connectMongo();

    // Find the URL mapping
    const urlDoc = await Url.findOne({ slug });

    if (!urlDoc) {
      // If not found, redirect to the URL shortener homepage with an error
      return NextResponse.redirect(new URL('/tools/url-shortener?error=notfound', request.url));
    }

    // Check expiry
    if (urlDoc.expiresAt && urlDoc.expiresAt < new Date()) {
        return NextResponse.redirect(new URL('/tools/url-shortener?error=expired', request.url));
    }

    // Increment click counter
    // Use updateOne to avoid fetching and saving the whole document (faster)
    await Url.updateOne({ _id: urlDoc._id }, { $inc: { clicks: 1 } });

    // Ensure the original URL has a protocol
    let target = urlDoc.originalUrl;
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = 'https://' + target;
    }

    // Redirect to the original URL
    return NextResponse.redirect(target, 302); // Use 302 Temporary Redirect to ensure clicks are tracked

  } catch (error) {
    console.error('[Redirect] Error:', error.message);
    return NextResponse.redirect(new URL('/tools/url-shortener?error=server', request.url));
  }
}
