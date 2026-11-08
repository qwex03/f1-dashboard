import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import SeasonSelector from "./SeasonSelector";
import { InstallButton } from "./PwaUI";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Gauge,
  UserIcon,
  UsersIcon,
  MapPinIcon,
  NewspaperIcon,
  FlagIcon,
  EarthIcon,
} from "lucide-react";

export const LINKS = [
  { to: "/", label: "Accueil", icon: Gauge },
  { to: "/drivers", label: "Pilotes", icon: UserIcon },
  { to: "/teams", label: "Équipes", icon: UsersIcon },
  { to: "/results", label: "Résultats", icon: FlagIcon },
  { to: "/tracks", label: "Circuits", icon: MapPinIcon },
  { to: "/news", label: "Actualités", icon: NewspaperIcon },
  { to: "/calendrier", label: "Calendrier 3D", icon: EarthIcon },
];

export function Logo({ collapsed }) {
  return (
    <NavLink to="/" className="flex items-center gap-2.5 select-none" title="Apex F1">
      <span className="relative flex h-8 w-9 shrink-0 items-center justify-center">
        <span className="absolute inset-0 bg-accent [clip-path:polygon(28%_0,100%_0,72%_100%,0_100%)]" />
        <span className="relative font-display text-lg font-extrabold italic leading-none text-accent-ink">A</span>
      </span>
      {!collapsed && (
        <span className="font-display text-2xl font-extrabold italic uppercase leading-none tracking-tight text-ink">
          Apex<span className="text-accent">F1</span>
        </span>
      )}
    </NavLink>
  );
}

export default function Navbar({ collapsed, setCollapsed }) {
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;

  return (
    <nav
      className={`navbar-scrollbar fixed inset-y-0 left-0 z-30 hidden md:flex flex-col
        border-r border-line bg-surface
        overflow-y-auto overflow-x-hidden transition-[width] duration-300
        ${collapsed ? "w-20 px-3" : "w-64 px-4"}`}
    >
      <div className={`flex h-20 shrink-0 items-center ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && <Logo collapsed={collapsed} />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-raised hover:text-ink transition-colors"
          aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
        >
          <ToggleIcon size={20} />
        </button>
      </div>

      {collapsed && (
        <div className="mb-4 flex justify-center">
          <Logo collapsed />
        </div>
      )}

      {!collapsed && <p className="kicker mb-2 px-3 text-[0.7rem]">Navigation</p>}

      <ul className="flex flex-col gap-1">
        {LINKS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `group relative flex h-11 items-center gap-3 rounded-lg transition-colors
                ${collapsed ? "justify-center" : "px-3"}
                ${isActive ? "bg-raised text-ink" : "text-muted hover:bg-raised/60 hover:text-ink"}`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-accent transition-opacity ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon size={20} className={isActive ? "text-accent" : ""} />
                  {!collapsed && (
                    <span className="font-display text-[1.05rem] font-semibold uppercase tracking-wide">
                      {label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto flex flex-col gap-2 border-t border-line py-5">
        {!collapsed && <p className="kicker mb-1 px-1 text-[0.7rem]">Réglages</p>}
        <SeasonSelector collapsed={collapsed} />
        <ThemeToggle collapsed={collapsed} />
        <InstallButton collapsed={collapsed} />
      </div>
    </nav>
  );
}
