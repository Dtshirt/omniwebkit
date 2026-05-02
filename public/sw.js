
const CACHE_NAME = 'multitools-v1';
const STATIC_CACHE_NAME = 'multitools-static-v1';

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/tools',
  '/offline',
  '/tools/password-generator',
  '/tools/basic-calculator',
  '/tools/unit-converter',
  '/tools/qr-generator',
  '/tools/image-converter',
  '/tools/json-formatter',
  '/tools/markdown-editor',
  '/tools/aspect-ratio-calculator',
  '/tools/case-converter',
  '/tools/typing-speed-test',
  '/tools/color-picker',
  '/tools/bmi-calculator',
  '/tools/regex-tester',
  '/tools/jwt-decoder',
  '/tools/word-counter',
  '/tools/base64-data-uri-converter',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip requests to external domains
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip API calls for ads and analytics
  if (event.request.url.includes('googlesyndication.com') ||
    event.request.url.includes('googletagmanager.com') ||
    event.request.url.includes('google-analytics.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseClone = response.clone();

            // Cache the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
          });
      })
  );
});

// Background sync for analytics
self.addEventListener('sync', (event) => {
  if (event.tag === 'analytics-sync') {
    event.waitUntil(syncAnalytics());
  }
});

// Push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      actions: data.actions,
      tag: data.tag,
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    clients.openWindow(`/${event.action}`);
  } else {
    // Open the app
    clients.openWindow('/');
  }
});

// Helper function to sync offline analytics
async function syncAnalytics() {
  try {
    // Get stored analytics events from IndexedDB
    // Send them to analytics API
    console.log('Syncing analytics data');
  } catch (error) {
    console.error('Failed to sync analytics:', error);
  }
}


