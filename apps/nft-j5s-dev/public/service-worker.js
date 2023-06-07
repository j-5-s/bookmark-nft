/**
 * This is a simple service worker that caches the IPFS requests.
 * @update, not needed cause ipfs sends cache headers and browser does it out of the box
 */

const CACHE_NAME = "ipfs-cache";
const TARGET_DOMAIN = "https://ipfs.io/ipfs/";

// Install event - cache the IPFS requests
self.addEventListener("install", function () {
  self.skipWaiting();
});

// Fetch event
self.addEventListener("fetch", (event) => {
  if (event.request.url.startsWith(TARGET_DOMAIN)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((fetchResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
