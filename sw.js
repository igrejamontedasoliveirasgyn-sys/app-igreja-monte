// sw.js - Service Worker

const CACHE_NAME = 'monte-app-v1';
const urlsToCache = [
  '/app-igreja-monte/',
  '/app-igreja-monte/index.html',
  '/app-igreja-monte/manifest.json',
  '/app-igreja-monte/icon-128x128.png',
  '/app-igreja-monte/icon-192x192.png',
  '/app-igreja-monte/icon-256x256.png',
  '/app-igreja-monte/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('✅ Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(function(err) {
        console.log('❌ Erro ao cachear:', err);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        return response || fetch(event.request);
      })
  );
});
