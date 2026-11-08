// Building blocks shared by the driver and circuit detail pages.
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
      {children}
    </Link>
  );
}

export function SectionTitle({ kicker, title, aside }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && <p className="kicker mb-1">{kicker}</p>}
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">{title}</h2>
      </div>
      {aside && <div className="shrink-0 text-sm text-muted">{aside}</div>}
    </div>
  );
}

export function StatTile({ label, value, hint, loading }) {
  return (
    <div className="panel flex flex-col gap-2 p-4">
      <p className="kicker text-[0.7rem]">{label}</p>
      {loading ? (
        <span className="h-9 w-14 animate-pulse rounded bg-raised" />
      ) : (
        <p
          className={
            /^[\d\s.,P–-]+$/.test(String(value ?? "—")) || value == null
              ? "num text-3xl font-bold leading-none text-ink sm:text-4xl"
              : "truncate font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-ink sm:text-4xl"
          }
        >
          {value ?? "—"}
        </p>
      )}
      {hint && !loading && <p className="mt-auto truncate text-xs text-faint">{hint}</p>}
    </div>
  );
}

export function WikiCard({ wiki, loading, title = "En bref" }) {
  if (loading) {
    return (
      <div className="panel space-y-3 p-5">
        <div className="h-4 w-24 animate-pulse rounded bg-raised" />
        <div className="h-4 w-full animate-pulse rounded bg-raised" />
        <div className="h-4 w-11/12 animate-pulse rounded bg-raised" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-raised" />
      </div>
    );
  }
  if (!wiki?.extract) return null;

  return (
    <section className="panel p-5">
      <p className="kicker mb-3">{title}</p>
      <p className="text-[0.95rem] leading-relaxed text-ink/90">{wiki.extract}</p>
      {wiki.url && (
        <a
          href={wiki.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
        >
          Source : Wikipédia{wiki.lang === "en" ? " (en anglais)" : ""}
          <ArrowUpRight size={14} />
        </a>
      )}
    </section>
  );
}

export const total = (data) => {
  const t = data?.MRData?.total;
  return t === undefined ? undefined : Number(t);
};
