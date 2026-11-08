import { Download, RefreshCw, Share, WifiOff, X } from "lucide-react";
import { applyUpdate, dismissUpdate, promptInstall, usePwa } from "../pwa";

/** "Installer l'app" in the settings area. On iPhone it explains the Share-sheet route instead. */
export function InstallButton({ collapsed = false }) {
  const { canInstall, installed, isIOS } = usePwa();
  if (installed) return null;

  if (canInstall) {
    return (
      <button
        onClick={promptInstall}
        title="Installer Apex F1 sur cet appareil"
        className={`flex h-10 items-center gap-3 rounded-lg bg-accent text-sm font-semibold text-accent-ink transition-colors hover:bg-accent/90 ${
          collapsed ? "mx-auto w-10 justify-center" : "w-full px-3"
        }`}
      >
        <Download size={18} />
        {!collapsed && <span>Installer l'app</span>}
      </button>
    );
  }

  if (isIOS && !collapsed) {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-line px-3 py-2.5 text-xs leading-relaxed text-muted">
        <Share size={14} className="mt-0.5 shrink-0" />
        <span>
          Pour installer l'app : bouton <span className="font-semibold text-ink">Partager</span>, puis{" "}
          <span className="font-semibold text-ink">Sur l'écran d'accueil</span>.
        </span>
      </p>
    );
  }

  return null;
}

/** Toast shown when a new version of the site has been downloaded in the background. */
export function UpdateToast() {
  const { updateReady } = usePwa();
  if (!updateReady) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-line bg-surface p-3 pl-4 shadow-2xl animate-rise md:bottom-6 md:left-auto md:right-6"
    >
      <RefreshCw size={18} className="shrink-0 text-accent" />
      <p className="flex-1 text-sm text-ink">Une nouvelle version d'Apex F1 est disponible.</p>
      <button onClick={applyUpdate} className="btn-accent h-9 text-xs">
        Mettre à jour
      </button>
      <button
        onClick={dismissUpdate}
        className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink"
        aria-label="Plus tard"
      >
        <X size={16} />
      </button>
    </div>
  );
}

/** Thin banner while the device has no connection. */
export function OfflineBanner() {
  const { online } = usePwa();
  if (online) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-center gap-2 rounded-lg border border-line bg-raised px-4 py-2.5 text-sm text-muted"
    >
      <WifiOff size={16} className="shrink-0 text-accent" />
      Hors ligne — tu consultes les dernières données enregistrées sur cet appareil.
    </div>
  );
}
