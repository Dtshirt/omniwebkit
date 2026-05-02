import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import Url from '@/models/Url';

// Generate a random alphanumeric string
function generateSlug(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    let { url, customSlug, expiryHours } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 });
    }

    // Basic URL validation and normalization
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    try {
        new URL(url);
    } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    await connectMongo();

    let slug = customSlug ? customSlug.trim() : '';

    // Handle custom slug logic
    if (slug) {
        // Validate custom slug format (alphanumeric and hyphens only, 3-20 chars)
        if (!/^[a-zA-Z0-9-]{3,20}$/.test(slug)) {
            return NextResponse.json({ error: 'Custom slug must be 3-20 alphanumeric characters or hyphens' }, { status: 400 });
        }
        
        // Check if custom slug exists
        const existing = await Url.findOne({ slug });
        if (existing) {
            return NextResponse.json({ error: 'Custom alias is already taken' }, { status: 409 });
        }
    } else {
        // Generate random slug and ensure it's unique
        let isUnique = false;
        let attempts = 0;
        while (!isUnique && attempts < 5) {
            slug = generateSlug(6);
            const existing = await Url.findOne({ slug });
            if (!existing) {
                isUnique = true;
            }
            attempts++;
        }
        if (!isUnique) {
            return NextResponse.json({ error: 'Could not generate a unique short link. Please try again.' }, { status: 500 });
        }
    }

    // Handle expiry
    let expiresAt = null;
    if (expiryHours && !isNaN(expiryHours) && expiryHours > 0) {
        expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }

    // Save to DB
    const newUrl = await Url.create({
        slug,
        originalUrl: url,
        expiresAt,
    });

    return NextResponse.json({
        success: true,
        slug: newUrl.slug,
        originalUrl: newUrl.originalUrl,
        shortUrl: `/s/${newUrl.slug}`,
        expiresAt: newUrl.expiresAt
    }, { status: 201 });

  } catch (error) {
    console.error('[Shorten API] Error:', error.message);
    if (error.message.includes('MONGODB_URI')) {
         return NextResponse.json({ error: 'Database not configured. Cannot create short links.' }, { status: 501 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
