self.addEventListener('install', (e) => {
    console.log('Service Worker instalado');
});

self.addEventListener('fetch', (e) => {
    // Permite que o app funcione online normalmente
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

