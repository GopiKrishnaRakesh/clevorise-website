// CLEVORISE OS Service Worker v1.0.7
// Offline PWA Caching for Tablets, Counters & Kiosks

const CACHE_NAME = 'clevorise-os-v1.0.7';
const STATIC_ASSETS = [
  '/kallisto_os/index.html',
  '/kallisto_os/self-ordering.html',
  '/kallisto_os/kitchen-display.html',
  '/kallisto_os/stock-management.html',
  '/kallisto_os/menu-editor.html',
  '/kallisto_os/invoice-generator.html',
  '/kallisto_os/staff-deployment.html',
  '/kallisto_os/financial-forecast.html',
  '/kallisto_os/seo-marketing.html',
  '/kallisto_os/automation-rules.html',
  '/kallisto_os/manifest.webmanifest',
  '/kallisto_os/design-system/design-tokens.css',
  '/kallisto_os/design-system/components.css',
  '/kallisto_os/design-system/client-config.js',
  '/kallisto_os/assets/css/os-theme.css',
  '/kallisto_os/assets/js/os-core.js',
  '/kallisto_os/assets/js/payment-terminal.js',
  '/kallisto_os/assets/js/invoice-engine.js',
  '/kallisto_os/assets/js/stock-engine.js',
  '/kallisto_os/assets/js/order-engine.js',
  '/kallisto_os/assets/js/rota-engine.js',
  '/kallisto_os/assets/js/forecast-engine.js',
  '/kallisto_os/assets/js/autonomous-agent.js',
  '/assets/images/favicon-32x32.png',
  '/assets/images/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Kallisto SW] Pre-caching offline kiosk assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Kallisto SW] Some static assets failed to pre-cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Kallisto SW] Clearing legacy cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only intercept GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Stale-While-Revalidate for CLEVORISE OS pages and scripts
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached version when offline
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
