/**
 * OmniWebKit — Upstash Redis Client (Singleton)
 * Used by API routes for persistent paste storage.
 *
 * Requires env vars:
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */

import { Redis } from '@upstash/redis';

let redis = null;

export function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn('[Redis] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Falling back to local storage.');
      return null;
    }

    redis = new Redis({ url, token });
  }
  return redis;
}
