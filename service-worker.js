const CACHE_NAME = "refer-earn-cache-v13";
const SDK_CACHE = "refer-earn-firebase-sdk-v1"; // Firebase SDK files are versioned (immutable) -> cache-first

// ঘনঘন আপডেট হওয়া ফাইল: Network-First, কিন্তু নেটওয়ার্ক ধীর হলে (৩ সেকেন্ড) ক্যাশ থেকে সাথে সাথে খুলে যাবে
// এবং ব্যাকগ্রাউন্ডে নতুন ভার্সন ক্যাশে আপডেট হয়ে পরের বার দেখা যাবে।
const NETWORK_FIRST_FILES = [
  "index.html", "style.css", "app.js", "firebase.js", "admin.html", "admin.js",
  "premium.js", "premium.css", "premium2.js", "premium2.css", "premium3.js", "premium4.js", "premium4.css"
];
const NETWORK_TIMEOUT_MS = 3000;

const CACHE_FIRST_ASSETS = [
  "./manifest.json",
  "./assets/logo.png",
  "./assets/favicon.png",
  "./assets/user.png"
];

const STATIC_ASSETS = [
  "./index.html", "./style.css", "./app.js", "./firebase.js",
  "./premium.js", "./premium.css", "./premium2.js", "./premium2.css", "./premium3.js", "./premium4.js", "./premium4.css",
  ...CACHE_FIRST_ASSETS
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => { if (key !== CACHE_NAME && key !== SDK_CACHE) return caches.delete(key); }))
    )
  );
  self.clients.claim();
});

function isNetworkFirst(url) {
  const path = url.pathname;
  if (path.endsWith("/")) return true;
  return NETWORK_FIRST_FILES.some((name) => path.endsWith("/" + name) || path.endsWith(name));
}

function networkAndCache(request) {
  return fetch(request).then((resp) => {
    if (resp && resp.status === 200) {
      const clone = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
    }
    return resp;
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Firebase SDK (gstatic, versioned URL): serve from cache, fetch once.
  if (url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/")) {
    event.respondWith(
      caches.open(SDK_CACHE).then((cache) =>
        cache.match(req).then((hit) => hit || fetch(req).then((resp) => {
          if (resp && resp.status === 200) cache.put(req, resp.clone());
          return resp;
        }))
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate" || isNetworkFirst(url)) {
    event.respondWith(
      caches.match(req, { ignoreSearch: req.mode === "navigate" }).then((cached) => {
        const net = networkAndCache(req);
        if (!cached) return net;
        return Promise.race([
          net,
          new Promise((resolve) => setTimeout(() => resolve(cached), NETWORK_TIMEOUT_MS))
        ]).catch(() => cached);
      })
    );
    return;
  }

  // Images / manifest: cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = networkAndCache(req).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
