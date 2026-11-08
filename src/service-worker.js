/* eslint-disable no-restricted-globals */
// Service worker compiled by Create React App (Workbox InjectManifest).
// - Precaches the app shell (JS, CSS, fonts) so the app opens instantly, even offline.
// - Serves index.html for every in-app route (SPA), online or offline.
// - Caches API answers and images so already-visited pages work without a connection.

import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

clientsClaim();
cleanupOutdatedCaches();
// Fontsource ships every alphabet in two formats; browsers only ever load the
// latin woff2 files for this French UI, so precache those and fetch the rest on demand.
const isUnneededFont = (url) =>
  /\.woff$/.test(url) || (/\.woff2$/.test(url) && !/-latin(-ext)?-\d{3}-(normal|italic)\./.test(url));
precacheAndRoute(self.__WB_MANIFEST.filter((entry) => !isUnneededFont(entry.url)));

const DAY = 24 * 60 * 60;

// App shell for navigations (skip files such as /manifest.json or /icons/x.png)
registerRoute(
  new NavigationRoute(createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`), {
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  })
);

// F1 data: always try the network first for fresh results, fall back to the last copy offline
registerRoute(
  ({ url }) => url.hostname === "api.jolpi.ca",
  new NetworkFirst({
    cacheName: "f1-api",
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 14 * DAY, purgeOnQuotaError: true }),
    ],
  })
);

// News feed
registerRoute(
  ({ url }) => url.hostname === "api.rss2json.com",
  new NetworkFirst({
    cacheName: "f1-news",
    networkTimeoutSeconds: 8,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 2 * DAY }),
    ],
  })
);

// Wikipedia summaries used on driver and circuit pages
registerRoute(
  ({ url }) => /(^|\.)wikipedia\.org$/.test(url.hostname),
  new StaleWhileRevalidate({
    cacheName: "wikipedia",
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 14 * DAY }),
    ],
  })
);

// Any font file left out of the precache
registerRoute(
  ({ request }) => request.destination === "font",
  new CacheFirst({
    cacheName: "fonts",
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 365 * DAY })],
  })
);

// Driver photos, team logos and icons shipped with the site
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin && request.destination === "image",
  new CacheFirst({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * DAY, purgeOnQuotaError: true })],
  })
);

// Flags and Wikipedia pictures from other sites (opaque responses are fine for <img>)
registerRoute(
  ({ url, request }) =>
    request.destination === "image" && /flagcdn\.com$|upload\.wikimedia\.org$/.test(url.hostname),
  new CacheFirst({
    cacheName: "remote-images",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * DAY, purgeOnQuotaError: true }),
    ],
  })
);

// The page asks the new version to take over when the user accepts the update
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
