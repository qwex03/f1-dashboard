// Service worker registration + install prompt + update + connectivity state,
// exposed to React through the usePwa() hook.
import { useSyncExternalStore } from "react";

const listeners = new Set();
let state = {
  canInstall: false, // Chrome/Edge/Android: the browser offered an install prompt
  installed: false,
  isIOS: false,
  updateReady: false,
  online: typeof navigator === "undefined" ? true : navigator.onLine,
};
let deferredPrompt = null;
let waitingWorker = null;
let updateAccepted = false;

function set(patch) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true
  );
}

function watchForUpdate(registration) {
  if (registration.waiting && navigator.serviceWorker.controller) {
    waitingWorker = registration.waiting;
    set({ updateReady: true });
  }
  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    worker?.addEventListener("statechange", () => {
      // "installed" + an existing controller = a new version is waiting
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        waitingWorker = worker;
        set({ updateReady: true });
      }
    });
  });
}

export function initPwa() {
  if (typeof window === "undefined") return;

  const ua = window.navigator.userAgent;
  set({
    installed: isStandalone(),
    isIOS: /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1),
  });

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // we show our own button instead of the mini-infobar
    deferredPrompt = e;
    set({ canInstall: true });
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    set({ canInstall: false, installed: true });
  });
  window.addEventListener("online", () => set({ online: true }));
  window.addEventListener("offline", () => set({ online: false }));

  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(`${process.env.PUBLIC_URL}/service-worker.js`)
      .then((registration) => {
        watchForUpdate(registration);
        // Look for a new version when the app comes back to the foreground
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") registration.update().catch(() => {});
        });
      })
      .catch(() => {});

    // Reload only when the user asked for the new version (not on the very first install)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!updateAccepted) return;
      updateAccepted = false;
      window.location.reload();
    });
  });
}

export async function promptInstall() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice.catch(() => null);
  deferredPrompt = null;
  set({ canInstall: false });
}

export function applyUpdate() {
  if (!waitingWorker) return;
  updateAccepted = true;
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
}

export function dismissUpdate() {
  set({ updateReady: false });
}

export function usePwa() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state
  );
}
