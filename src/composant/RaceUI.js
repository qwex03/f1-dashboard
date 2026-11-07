// Shared building blocks for the "timing tower" look used across pages.
import { AlertTriangle, Flag } from "lucide-react";
import { getFlagImg } from "../utils/flags";
import { constructorColor } from "../utils/teams";
import TeamImageWithFallback from "./TeamImageWithFallback";

const PODIUM = { 1: "bg-gold text-black", 2: "bg-silver text-black", 3: "bg-bronze text-black" };

export function Position({ value }) {
  const n = Number(value);
  const podium = PODIUM[n];
  return (
    <span
      className={`inline-grid h-8 w-9 place-items-center font-display text-lg font-bold italic leading-none ${
        podium ? podium : "text-ink"
      } ${podium ? "[clip-path:polygon(18%_0,100%_0,82%_100%,0_100%)]" : ""}`}
    >
      {value}
    </span>
  );
}

export function TeamStripe({ constructor, color }) {
  return (
    <span
      aria-hidden
      className="inline-block h-6 w-1 shrink-0 rounded-full"
      style={{ backgroundColor: color ?? constructorColor(constructor) }}
    />
  );
}

export function FlagImg({ nationality, className = "" }) {
  const src = getFlagImg(nationality);
  if (!src) return null;
  return (
    <img
      src={src}
      alt={nationality}
      title={nationality}
      className={`h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-line ${className}`}
      onError={(e) => (e.currentTarget.style.display = "none")}
    />
  );
}

export function DriverName({ driver, constructor, showFlag = true }) {
  if (!driver) return null;
  return (
    <span className="flex min-w-0 items-center gap-3">
      {constructor !== undefined && <TeamStripe constructor={constructor} />}
      {showFlag && <FlagImg nationality={driver.nationality} />}
      <span className="min-w-0 truncate leading-tight">
        <span className="text-muted">{driver.givenName} </span>
        <span className="font-display text-[1.05rem] font-bold uppercase tracking-wide text-ink">
          {driver.familyName}
        </span>
      </span>
    </span>
  );
}

export function TeamName({ constructor, withLogo = true }) {
  if (!constructor) return null;
  return (
    <span className="flex min-w-0 items-center gap-3">
      <TeamStripe constructor={constructor} />
      {withLogo && (
        <TeamImageWithFallback teamName={constructor.name} className="h-7 w-7 shrink-0 object-contain" />
      )}
      <span className="truncate font-semibold text-ink">{constructor.name}</span>
    </span>
  );
}

export function TableCard({ children, className = "" }) {
  return <div className={`panel overflow-hidden animate-rise ${className}`}>{children}</div>;
}

export function Loading({ rows = 8, label = "Chargement…" }) {
  return (
    <div className="panel overflow-hidden" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-line/70 px-4 py-4 last:border-0">
          <span className="h-4 w-6 animate-pulse rounded bg-raised" />
          <span className="h-4 w-1 rounded bg-raised" />
          <span className="h-4 animate-pulse rounded bg-raised" style={{ width: `${30 + ((i * 37) % 35)}%` }} />
          <span className="ml-auto h-4 w-12 animate-pulse rounded bg-raised" />
        </div>
      ))}
    </div>
  );
}

export function Notice({ tone = "info", children }) {
  const Icon = tone === "error" ? AlertTriangle : Flag;
  return (
    <div
      className={`panel flex items-center gap-3 px-5 py-6 text-sm ${
        tone === "error" ? "border-accent/40 text-accent" : "text-muted"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <p>{children}</p>
    </div>
  );
}
