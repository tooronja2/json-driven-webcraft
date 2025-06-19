
const CACHE_NAME = 'barberia-gestion-v1';
const urlsToCache = [
  '/gestion',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver del cache si existe, sino hacer fetch de red
        return response || fetch(event.request);
      }
    )
  );
});
