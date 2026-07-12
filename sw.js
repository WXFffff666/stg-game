const CACHE_NAME = 'stg-game-v6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './js/config.js',
  './js/homing.js',
  './js/upgrade-track.js',
  './js/core.js',
  './js/storage.js',
  './js/audio.js',
  './js/codex.js',
  './js/faction-effects.js',
  './js/faction-talents.js',
  './js/faction-weapon-mods.js',
  './js/particles.js',
  './js/player.js',
  './js/bullets.js',
  './js/weapons.js',
  './js/enemies.js',
  './js/items.js',
  './js/skills.js',
  './js/ui.js',
  './js/main.js'
];

// Install: pre-cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches AND immediately take control of all clients
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => {
      self.clients.claim();
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
      });
    })
  );
});

// Fetch: Network First strategy (for development, prevents stale cache issues)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
