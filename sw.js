// sw.js - Service Worker
// CORREÇÃO: versão incrementada para forçar o navegador a instalar
// este novo worker e descartar o cache antigo (que travava a versão velha do site)
const CACHE_NAME = 'monte-app-v2';
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
  // CORREÇÃO: força este novo Service Worker a assumir o controle
  // imediatamente, sem esperar todas as abas antigas fecharem
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // CORREÇÃO: assume o controle de todas as abas abertas imediatamente
      return self.clients.claim();
    })
  );
});

// CORREÇÃO: estratégia "rede primeiro, cache como reserva"
// Antes: sempre usava o cache se existisse, e nunca buscava a versão nova.
// Agora: sempre tenta buscar a versão mais recente na rede primeiro;
// só usa o cache se o usuário estiver offline ou a rede falhar.
self.addEventListener('fetch', function(event) {
  // Não interceptar métodos que não sejam GET (evita erros com POST etc.)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(function(networkResponse) {
        // Atualiza o cache com a versão mais recente
        var responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(function() {
        // Sem internet ou falha na rede: usa o que tiver no cache
        return caches.match(event.request);
      })
  );
});
