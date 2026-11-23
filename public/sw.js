// ANATOMIX - Service Worker untuk Progressive Web App (PWA)
const CACHE_NAME = "anatomix-pwa-v1";

const STATIC_ASSETS = [
  "/",
  "/beranda",
  "/icon.png",
  "/apple-icon.png",
  "/logo-horizontal.png",
  "/logo.png",
  "/manifest.webmanifest",
];

// Install: Simpan aset statis dasar ke cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA: Beberapa aset tidak dapat di-cache saat instalasi", err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Bersihkan cache lama jika ada update versi
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first strategy dengan fallback ke cache
self.addEventListener("fetch", (event) => {
  // Hanya tangani request GET untuk http/https
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  // Lewati request chrome-extension atau API non-GET
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Jika respons valid, update cache untuk aset gambar atau halaman tertentu
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.includes("/assets/") ||
            event.request.url.endsWith(".png") ||
            event.request.url.endsWith(".svg") ||
            event.request.url.endsWith(".ico"))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        // Fallback jika offline: coba ambil dari cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Jika offline dan navigasi halaman, fallback ke /beranda jika tersedia
        if (event.request.mode === "navigate") {
          const fallback = await caches.match("/beranda");
          if (fallback) return fallback;
        }
        return new Response("Offline - ANATOMIX", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      })
  );
});
