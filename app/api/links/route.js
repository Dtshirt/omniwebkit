import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Url from '@/models/Url';

/**
 * GET /api/links?userId=<id>
 * Returns all non-expired short URLs belonging to the given userId.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId.trim().length === 0) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    await connectMongo();

    const now = new Date();
    const urls = await Url.find({
      userId: userId.trim(),
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    })
      .sort({ createdAt: -1 })
      .select('slug originalUrl shortUrl clicks createdAt expiresAt userId')
      .lean();

    // Normalise shortUrl (stored as `/s/slug` in DB — return full for convenience)
    const result = urls.map((u) => ({
      id: u._id.toString(),
      slug: u.slug,
      originalUrl: u.originalUrl,
      shortUrl: u.slug,   // frontend will prepend BASE
      clicks: u.clicks ?? 0,
      createdAt: u.createdAt,
      expiresAt: u.expiresAt,
      userId: u.userId,
    }));

    return NextResponse.json({ success: true, count: result.length, links: result });

  } catch (error) {
    console.error('[Links GET] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/links?userId=<id>&slug=<slug>
 * Deletes a specific short URL only if it belongs to the given userId.
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const slug   = searchParams.get('slug');

    if (!userId || !slug) {
      return NextResponse.json({ error: 'userId and slug query parameters are required' }, { status: 400 });
    }

    await connectMongo();

    const result = await Url.deleteOne({ slug: slug.trim(), userId: userId.trim() });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Link not found or you do not own it' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Link deleted successfully' });

  } catch (error) {
    console.error('[Links DELETE] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
