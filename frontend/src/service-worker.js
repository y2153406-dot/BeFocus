
const CACHE_NAME = "befocus-v3";

// Core application files
const APP_FILES = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./js/clock.js",
    "./js/stopwatch.js",
    "./js/timer.js",
    "./js/wallpaper.js",
    "./js/pwa.js",
    "./assets/icons/icon-192.png",
"./assets/icons/icon-512.png",
"./assets/icons/apple-touch-icon.png"
];


// ========================================
// 1. Install Service Worker
// ========================================

self.addEventListener("install", (event) => {

    event.waitUntil(
        (async () => {

            const cache = await caches.open(CACHE_NAME);

            // Cache core application files
            await cache.addAll(APP_FILES);

            // Load wallpaper manifest
            try {

                const response = await fetch(
                    "./assets/wallpapers.json"
                );

                if (!response.ok) {
                    throw new Error("Wallpaper manifest not found");
                }

                // Cache wallpaper JSON
                await cache.put(
                    "./assets/wallpapers.json",
                    response.clone()
                );

                const wallpapers = await response.json();

                // Get all wallpaper image paths
                const wallpaperImages = wallpapers
                    .map((wallpaper) => wallpaper.src)
                    .filter(Boolean);

                // Cache wallpaper images
                await Promise.allSettled(

                    wallpaperImages.map(async (imagePath) => {

                        try {

                            await cache.add(imagePath);

                        } catch (error) {

                            console.warn(
                                "Unable to cache wallpaper:",
                                imagePath,
                                error
                            );

                        }

                    })

                );

                console.log(
                    "BeFocus wallpapers cached:",
                    wallpaperImages.length
                );

            } catch (error) {

                console.error(
                    "Wallpaper caching failed:",
                    error
                );

            }

        })()
    );

    self.skipWaiting();

});


// ========================================
// 2. Activate Service Worker
// ========================================

self.addEventListener("activate", (event) => {

    event.waitUntil(

        (async () => {

            const cacheNames = await caches.keys();

            await Promise.all(

                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))

            );

            await self.clients.claim();

            console.log("BeFocus Service Worker activated.");

        })()

    );

});


// ========================================
// 3. Fetch Cached Resources
// ========================================

self.addEventListener("fetch", (event) => {

    const request = event.request;

    // Only handle GET requests
    if (request.method !== "GET") return;

    const requestURL = new URL(request.url);

    // Ignore external requests
    if (requestURL.origin !== self.location.origin) return;

    event.respondWith(

        (async () => {

            // Check cache first
            const cachedResponse = await caches.match(request);

            if (cachedResponse) {
                return cachedResponse;
            }

            try {

                // Fetch from network
                const networkResponse = await fetch(request);

                // Cache successful same-origin responses
                if (networkResponse.ok) {

                    const cache = await caches.open(CACHE_NAME);

                    await cache.put(
                        request,
                        networkResponse.clone()
                    );

                }

                return networkResponse;

            } catch (error) {

                console.error(
                    "Network request failed:",
                    request.url
                );

                // Offline navigation fallback
                if (request.mode === "navigate") {

                    const cache = await caches.open(CACHE_NAME);

                    const offlinePage = await cache.match(
                        "./index.html"
                    );

                    if (offlinePage) {
                        return offlinePage;
                    }

                }

                return new Response(
                    "You are offline. This resource is not cached.",
                    {
                        status: 503,
                        statusText: "Service Unavailable",
                        headers: {
                            "Content-Type": "text/plain"
                        }
                    }
                );

            }

        })()

    );

});
