// ============================================================
// FullStack Academy — Service Worker
// Strategy: Cache-first with offline fallback
// All app shell assets are pre-cached at install time.
// ============================================================

const VERSION   = 'fsa-v3';
const BROADCAST = new BroadcastChannel('sw-messages');

// ── Assets to pre-cache on install ─────────────────────────
// These are the "app shell" — everything needed to run offline.
// The build step appends the generated JS/CSS chunk names.
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './fonts/ui-regular.woff2',
  './fonts/ui-bold.woff2',
  './fonts/mono-regular.woff2',
  './fonts/mono-bold.woff2',
];

// ── Install: pre-cache everything ──────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch(err => {
        console.error('[SW] Pre-cache failed:', err);
        // Still skip waiting so the SW activates even on partial failure
        return self.skipWaiting();
      })
  );
});

// ── Activate: delete old caches ────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== VERSION).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first, network fallback ───────────────────
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ── External API calls (API tester) ──────────────────────
  // Let these through to network; show offline message on failure
  const isExternal = url.origin !== self.location.origin;
  if (isExternal) {
    event.respondWith(
      fetch(req).catch(() =>
        new Response(
          JSON.stringify({ error: 'You are offline. This request requires an internet connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )
      )
    );
    return;
  }

  // ── App shell + assets: cache-first ──────────────────────
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;

      // Not in cache — fetch from network and cache it
      return fetch(req)
        .then(response => {
          if (!response || response.status !== 200 || response.type === 'opaque') {
            return response;
          }
          const toCache = response.clone();
          caches.open(VERSION).then(cache => cache.put(req, toCache));
          return response;
        })
        .catch(() => {
          // Offline and not cached — return app shell for navigation requests
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
          // For other assets, return a basic offline response
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// ── Background sync message ─────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
