
const CACHE_NAME = 'barberia-estilo-v1';
const urlsToCache = [
  '/gestion',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nuevo turno programado',
    icon: '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
    badge: '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Barbería Estilo', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/gestion')
  );
});
