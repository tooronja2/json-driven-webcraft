
const CACHE_NAME = 'barberia-estilo-v3'; // Incrementado para forzar actualización
const urlsToCache = [
  '/gestion',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing v3...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache v3');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache resources:', error);
      })
  );
  // Forzar activación inmediata del nuevo service worker
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating v3...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tomar control inmediato de todas las páginas
  self.clients.claim();
});

// Fetch event - Estrategia Network First para HTML, Cache First para assets
self.addEventListener('fetch', (event) => {
  // NO interceptar requests a Google Apps Script para evitar CORS
  if (event.request.url.includes('script.google.com')) {
    return;
  }
  
  // NO interceptar requests a otros dominios externos
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Para navegación (HTML), usar Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          console.log('Fetched navigation from network:', event.request.url);
          // Cachear la nueva respuesta
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          console.log('Network failed, serving from cache:', event.request.url);
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Para assets, usar Cache First
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
      })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push received');
  const options = {
    body: event.data ? event.data.text() : 'Nuevo turno programado',
    icon: '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
    badge: '/lovable-uploads/b7d8c7e7-9a7f-490f-a88f-8529bede7dea.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'Ver turnos'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Barbería Estilo', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked');
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/gestion')
    );
  } else {
    event.waitUntil(
      clients.openWindow('/gestion')
    );
  }
});

// Message handling para forzar actualizaciones
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
