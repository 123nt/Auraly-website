const CACHE_NAME = "auraly-cache-v1";
const urlsToCache = [
  "./search.html",
  "./styles.css",
  "./icons/adaptive-favicon.svg",
  "./icons/icons8-logo-50.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
