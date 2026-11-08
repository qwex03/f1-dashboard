import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { LINKS, Logo } from "./NavBar";
import SeasonSelector from "./SeasonSelector";
import ThemeToggle from "./ThemeToggle";
import { InstallButton } from "./PwaUI";
import { useSeason } from "../context/SeasonContext";

// The four destinations that get a permanent slot in the bottom tab bar.
const TABS = ["/", "/drivers", "/teams", "/results"];

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { season } = useSeason();

  // Close the drawer whenever the route changes
  useEffect(() => setOpen(false), [location.pathname]);

  // Lock background scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const inDrawer = !TABS.some((t) => (t === "/" ? location.pathname === "/" : location.pathname.startsWith(t)));

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-md pt-[env(safe-area-inset-top)] box-content">
        <Logo />
        <span className="num rounded-md border border-line px-2 py-1 text-xs text-muted">{season}</span>
      </header>

      {/* Bottom tab bar */}
      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid h-16 grid-cols-5">
          {LINKS.filter((l) => TABS.includes(l.to)).map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative flex h-full flex-col items-center justify-center gap-1 transition-colors ${
                    isActive ? "text-ink" : "text-muted"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute top-0 h-[3px] w-8 rounded-b bg-accent transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <Icon size={20} className={isActive ? "text-accent" : ""} />
                    <span className="font-display text-[0.7rem] font-semibold uppercase tracking-wide">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => setOpen(true)}
              aria-expanded={open}
              className={`relative flex h-full w-full flex-col items-center justify-center gap-1 ${
                inDrawer ? "text-ink" : "text-muted"
              }`}
            >
              <span
                className={`absolute top-0 h-[3px] w-8 rounded-b bg-accent transition-opacity ${
                  inDrawer ? "opacity-100" : "opacity-0"
                }`}
              />
              <Menu size={20} className={inDrawer ? "text-accent" : ""} />
              <span className="font-display text-[0.7rem] font-semibold uppercase tracking-wide">Plus</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Drawer (bottom sheet) */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface px-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-3 transition-transform duration-300 ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <p className="kicker">Menu</p>
          <button
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink"
            aria-label="Fermer le menu"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="grid grid-cols-2 gap-2">
          {LINKS.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex h-14 items-center gap-3 rounded-xl border px-3 transition-colors ${
                    isActive ? "border-accent bg-accent/10 text-ink" : "border-line text-muted"
                  }`
                }
              >
                <Icon size={20} />
                <span className="font-display text-base font-semibold uppercase tracking-wide">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2 border-t border-line pt-4">
          <p className="kicker mb-1">Réglages</p>
          <SeasonSelector />
          <ThemeToggle />
          <InstallButton />
        </div>
      </aside>
    </div>
  );
}
