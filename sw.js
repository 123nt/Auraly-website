const CACHE_NAME = "auraly-v1";
const urlsToCache = [
  "/search.html",
  "/styles.css",
  "/manifest.json",
  "/icons/icons8-logo-500.svg",
  "/icons/icons8-logo-250.svg",
  "/icons/icons8-logo-150.svg",
  "/icons/icons8-logo-100.svg",
  "/icons/icons8-logo-50.svg",
  "/artish/country-playlist.html",
  "/artish/hip-hop.html",
  "/artish/nepaliplaylist.html",
  "/artish/uk-playlist.html",
  "/artish/styles.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});
