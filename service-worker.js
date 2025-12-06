const CACHE_NAME = 'muslimislamtv-v2.9'; // Har badlav ke baad version number badlein.
const urlsToCache = [
  // Core HTML and Manifest
  '/home.html', 
  '/', 
  '/manifest.json',
  
  // Splash & Core Images/Assets (Apne saare local files yahan daalein)
  '/3.png',
  '/4.gif',
  '/5.png',
  '/splash_video.mp4', 
  '/splash_audio.mp3', 
  '/placeholder.png',
  
  // External Scripts (Agar zaroori ho)
  'https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js',
  
  // Slider Images (Saare slider images yaqeenan yahan shamil hon)
  '/1.jpg', '/2.jpeg', '/2.jpg', '/3.jpeg', '/3.jpg', 
  '/4.jpg', '/4.jpeg', '/5.jpg', '/5.jpeg', '/6.jpg', 
  '/7.jpg', '/8.jpg', '/9.jpeg', '/10.webp',
  'https://via.placeholder.com/80x50?text=TV' 
];

// Installation: Cache saari zaroori files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)).catch(err => console.error('[SW] Caching failed:', err))
  );
});

// Activation: Purane caches ko saaf karna
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Sabse pehle cache mein dekho (Cache First Strategy)
self.addEventListener('fetch', event => {
  // Live streams ko hamesha network se laao
  if (event.request.url.includes('.m3u') || event.request.url.includes('iptv-org.github.io')) {
    return fetch(event.request);
  }

  // Baki files ke liye Cache First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Agar cache mein hai to wahi chalao (OFFLINE MODE)
        if (response) {
          return response;
        }

        // Agar cache mein nahi mili to network se laao aur use cache mein save kar lo
        return fetch(event.request).then(response => {
            if(!response || response.status !== 200 || response.type !== 'basic') return response;
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
            });
            return response;
        }).catch(error => console.error('[SW] Fetch failed:', error));
      })
  );
});
