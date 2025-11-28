const CACHE_NAME = 'muslimislamtv-cache-v1'; // Version number change karein jab files update hon

// Yeh woh sab files hain jo app ko offline chalane ke liye zaroori hain.
const urlsToCache = [
    '/', 
    '/home.html', 
    '/manifest.json', 
    
    // M3U files (Channel lists)
    '/p.m3u',
    '/i.m3u',
    '/a.m3u',
    '/ir.m3u',
    '/s.m3u',
    '/us.m3u',
    
    // Sound files
    '/s1.mp3',
    '/s2.mp3',
    '/s3.mp3',
    
    // External JS library
    'https://cdn.jsdelivr.net/npm/hls.js@1.4.0/dist/hls.min.js',
    
    // NOTE: Agar aapke paas local image files hain (jaise ki icon files, placeholder.png), unhe yahan add karein.
    '/1.png',
    '/2.png',
    '/3.png',
    '/4.gif',
    '/5.png',
    // Remote images (jo https://i.ibb.co se hain) ko offline cache karna mushkil hota hai.
];

// 1. Install Event: Cache all essential files
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching App Shell');
                // Saari files cache mein daali ja rahi hain
                return cache.addAll(urlsToCache); 
            })
    );
});

// 2. Fetch Event: Serve from cache first, then network
self.addEventListener('fetch', event => {
    // Live Streams, YouTube embeds, aur API calls ko hamesha network se laao
    const isStreamOrAPI = event.request.url.includes('.m3u8') || event.request.url.includes('youtube.com') || event.request.url.includes('countapi.xyz');

    if (isStreamOrAPI) {
        // Agar stream ya API call hai, to seedha network se laao (ye offline nahi chalega)
        return fetch(event.request);
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - response cache se return karo (offline chalao)
                if (response) {
                    return response;
                }
                // Cache miss - network se fetch karo
                return fetch(event.request);
            })
    );
});

// 3. Activate Event: Clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating and Cleaning Old Caches');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Purana cache delete kiya ja raha hai
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
