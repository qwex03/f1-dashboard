import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";
import { Link } from "react-router-dom";
import { useSeason } from "../context/SeasonContext";
import PageHeader from "../composant/PageHeader";
import { Loading, Notice } from "../composant/RaceUI";

function raceDate(r) {
  return new Date(`${r.date}T${r.time || "12:00:00Z"}`);
}

export default function CircuitPage() {
  const { season } = useSeason();
  const { data, loading, error } = useFetch(`https://api.jolpi.ca/ergast/f1/${season}/races/`);

  const races = data?.MRData?.RaceTable?.Races ?? [];
  const now = Date.now();
  const nextIndex = races.findIndex((r) => raceDate(r).getTime() + 3 * 36e5 >= now);

  return (
    <div className="pb-16">
      <PageHeader
        kicker={`Saison ${season} · ${races.length || "—"} manches`}
        title="Circuits"
        description="Toutes les étapes du calendrier, de la première à la dernière manche."
      />

      {loading ? (
        <Loading rows={10} />
      ) : error ? (
        <Notice tone="error">Erreur : {error}</Notice>
      ) : (
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {races.map((race, i) => {
            const country = race.Circuit.Location.country;
            const flag = getFlagImg(country);
            const isNext = i === nextIndex;
            const isPast = nextIndex === -1 || i < nextIndex;
            const d = raceDate(race);

            return (
              <li key={race.round}>
                <Link
                to={`/tracks/${race.Circuit.circuitId}`}
                className={`group relative flex h-full overflow-hidden rounded-xl border transition-colors animate-rise ${
                  isNext
                    ? "border-accent bg-accent/[0.06]"
                    : "border-line bg-surface hover:border-ink/30"
                } ${isPast ? "opacity-60 hover:opacity-100" : ""}`}
                style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
              >
                {/* Date block */}
                <div
                  className={`flex w-20 shrink-0 flex-col items-center justify-center border-r ${
                    isNext ? "border-accent/40 bg-accent text-accent-ink" : "border-line bg-raised/50 text-ink"
                  }`}
                >
                  <span className="num text-3xl font-bold leading-none">
                    {d.toLocaleDateString("fr-FR", { day: "2-digit" })}
                  </span>
                  <span className="mt-1 font-display text-sm font-semibold uppercase tracking-widest opacity-80">
                    {d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
                  </span>
                </div>

                <div className="min-w-0 flex-1 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="kicker text-[0.7rem]">Manche {race.round}</span>
                    {isNext ? (
                      <span className="tag bg-accent text-accent-ink">Prochaine</span>
                    ) : isPast ? (
                      <span className="kicker text-[0.65rem] text-faint">Terminée</span>
                    ) : race.Sprint ? (
                      <span className="tag bg-ink text-canvas">Sprint</span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate font-display text-xl font-bold uppercase leading-tight tracking-tight text-ink">
                    {race.raceName.replace("Grand Prix", "GP")}
                  </p>
                  <p className="mt-1 flex items-center gap-2 truncate text-sm text-muted">
                    {flag && <img src={flag} alt="" className="h-3 w-4 shrink-0 rounded-[2px]" />}
                    <span className="truncate">{race.Circuit.circuitName}</span>
                  </p>
                </div>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
