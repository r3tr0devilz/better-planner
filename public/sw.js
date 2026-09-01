const CACHE = "better-planner-shell-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

// v1 cached every GET — including dynamic, authenticated pages like
// /settings — so a single flaky fetch could fall back to a stale cached
// copy of a personalized page indefinitely (real bug, not just staleness:
// the same fallback could serve cached authenticated content after
// sign-out). Navigations are now network-only, no caching, so a page
// always reflects the real current deploy and auth state. Only same-origin
// static assets (icons, manifest) are cached, purely so the app stays
// installable with a minimal offline shell — never anything personalized.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request));
    return;
  }

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request)),
  );
});
