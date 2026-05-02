/**
 * OmniWebKit — Paste API Route
 *
 * POST /api/paste        → Create a new paste
 * GET  /api/paste?id=xxx → Retrieve a paste by ID
 *
 * Storage: Upstash Redis
 * Key format: paste:{id}
 * TTL: based on user-selected expiry (or 30 days default)
 */

import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

// ─── ID Generator ────────────────────────────────────────────────────────────
function generateId(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_PASTE_SIZE = 512 * 1024; // 512 KB
const DEFAULT_TTL = 30 * 24 * 60 * 60; // 30 days in seconds
const VALID_EXPIRY = {
  0: DEFAULT_TTL,           // "Never" → 30 days (prevent infinite storage)
  600: 600,                 // 10 min
  3600: 3600,               // 1 hour
  86400: 86400,             // 1 day
  604800: 604800,           // 1 week
  2592000: 2592000,         // 30 days
};

const LANGUAGES = new Set([
  'plaintext', 'javascript', 'python', 'html', 'css', 'json', 'typescript',
  'java', 'c', 'cpp', 'csharp', 'php', 'ruby', 'go', 'rust', 'sql', 'bash',
  'yaml', 'xml', 'markdown', 'swift', 'kotlin', 'dart', 'lua', 'perl', 'r',
  'scala', 'shell', 'toml',
]);


// ─── POST: Create Paste ──────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { code, title, language, expiry } = body;

    // Validate
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Code content is required' }, { status: 400 });
    }

    if (code.length > MAX_PASTE_SIZE) {
      return NextResponse.json(
        { error: `Paste too large. Max ${MAX_PASTE_SIZE / 1024} KB` },
        { status: 413 },
      );
    }

    const safeTitle = (title || 'Untitled').slice(0, 100);
    const safeLang = LANGUAGES.has(language) ? language : 'plaintext';

    // Resolve TTL
    const expirySeconds = typeof expiry === 'number' ? expiry : 0;
    const ttl = VALID_EXPIRY[expirySeconds] ?? DEFAULT_TTL;

    // Check Redis
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Server storage not configured', fallback: true }, { status: 501 });
    }

    // Generate unique ID
    let id;
    let attempts = 0;
    do {
      id = generateId();
      const exists = await redis.exists(`paste:${id}`);
      if (!exists) break;
      attempts++;
    } while (attempts < 5);

    if (attempts >= 5) {
      return NextResponse.json({ error: 'Failed to generate unique ID' }, { status: 500 });
    }

    // Store
    const paste = {
      id,
      title: safeTitle,
      code,
      language: safeLang,
      createdAt: Date.now(),
      expiresAt: expirySeconds > 0 ? Date.now() + expirySeconds * 1000 : null,
      views: 0,
    };

    await redis.set(`paste:${id}`, JSON.stringify(paste), { ex: ttl });

    return NextResponse.json({
      id,
      url: `/tools/pastebin/${id}`,
      expiresAt: paste.expiresAt,
    }, { status: 201 });

  } catch (error) {
    console.error('[Paste API] Create error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


// ─── GET: Retrieve Paste ─────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || id.length > 20) {
      return NextResponse.json({ error: 'Valid paste ID is required' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Server storage not configured', fallback: true }, { status: 501 });
    }
    
    const raw = await redis.get(`paste:${id}`);

    if (!raw) {
      return NextResponse.json({ error: 'Paste not found or expired' }, { status: 404 });
    }

    const paste = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // Increment view count (fire and forget)
    paste.views = (paste.views || 0) + 1;
    redis.set(`paste:${id}`, JSON.stringify(paste), { keepttl: true }).catch(() => {});

    return NextResponse.json(paste);

  } catch (error) {
    console.error('[Paste API] Retrieve error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
