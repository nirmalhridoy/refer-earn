const CACHE_NAME = "refer-earn-cache-v8";

// এই ফাইলগুলো ঘনঘন আপডেট হয় (কোড/ডিজাইন বদলায়) — তাই এগুলো সবসময়
// আগে ইন্টারনেট থেকে আনার চেষ্টা করা হয় (Network-First), যাতে নতুন কোনো
// আপডেট দিলে সাথে সাথেই ইউজার সেটা দেখতে পায়, পুরোনো ক্যাশড ভার্সন আটকে না থাকে।
const NETWORK_FIRST_FILES = [
  "index.html",
  "style.css",
  "app.js",
  "firebase.js",
  "admin.html",
  "admin.js"
];

// এই ফাইলগুলো সহজে বদলায় না (ছবি, আইকন, manifest) — তাই এগুলো আগে ক্যাশ
// থেকে দেখানো হয়, পারফরম্যান্স ও অফলাইন সাপোর্টের জন্য।
const CACHE_FIRST_ASSETS = [
  "./manifest.json",
  "./assets/logo.png",
  "./assets/favicon.png",
  "./assets/user.png"
];

const STATIC_ASSETS = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./firebase.js",
  ...CACHE_FIRST_ASSETS
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
  // নতুন Service Worker Install হওয়ার সাথে সাথেই "waiting" অবস্থায় না রেখে
  // app.js থেকে পাঠানো "SKIP_WAITING" মেসেজ পেলে সাথে সাথে Activate হয়ে যাবে।
});

// app.js (register হওয়ার সময়) পাঠানো মেসেজ শুনে সাথে সাথে নতুন Version
// Activate করে দেওয়া হয় — ইউজারকে ট্যাব বন্ধ করে আবার খোলার দরকার হয় না,
// এবং "আগের বাগ আবার ফিরে আসা" সমস্যাটা স্থায়ীভাবে বন্ধ হয়ে যায়।
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })))
      .then(() => self.clients.claim())
  );
});

function isNetworkFirst(url) {
  // root path (/) মানেও index.html, তাই সেটাও Network-First এ ধরা হচ্ছে।
  const path = url.pathname;
  if (path.endsWith("/")) return true;
  return NETWORK_FIRST_FILES.some((name) => path.endsWith("/" + name) || path.endsWith(name));
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // ===== Network-First: index.html / style.css / app.js / firebase.js ইত্যাদি =====
  // সবসময় আগে নতুন ভার্সন আনার চেষ্টা হয়। ইন্টারনেট থাকলে ইউজার সবসময়
  // সর্বশেষ আপডেট করা ফাইলটাই দেখবে। ইন্টারনেট না থাকলে (অফলাইন) তখনই
  // শুধু ক্যাশে রাখা শেষ ভার্সনটা দেখানো হবে।
  if (event.request.mode === "navigate" || isNetworkFirst(url)) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // ===== Cache-First: ছবি, favicon, manifest ইত্যাদি (খুব কম বদলায়) =====
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })
  );
});
