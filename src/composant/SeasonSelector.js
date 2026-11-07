import { ChevronDown, Calendar } from "lucide-react";
import { useSeason } from "../context/SeasonContext";

function SeasonSelector({ collapsed }) {
  const { season, setSeason } = useSeason();
  const currentYear = new Date().getFullYear();
  const seasons = [];
  for (let y = currentYear; y >= 1950; y--) seasons.push(y);

  if (collapsed) {
    return (
      <div className="relative mx-auto w-10 h-10" title={`Saison ${season}`}>
        <div className="absolute inset-0 grid place-items-center rounded-lg border border-line font-display font-bold text-sm text-ink">
          {String(season).slice(2)}
        </div>
        <select
          aria-label="Saison"
          value={season}
          onChange={(e) => setSeason(+e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          {seasons.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <label className="relative flex items-center h-10 rounded-lg border border-line bg-canvas hover:border-ink/30 transition-colors">
      <Calendar size={16} className="absolute left-3 text-muted pointer-events-none" />
      <span className="sr-only">Saison</span>
      <select
        value={season}
        onChange={(e) => setSeason(+e.target.value)}
        className="w-full h-full appearance-none bg-transparent pl-9 pr-8 font-display font-bold text-base tracking-wide text-ink cursor-pointer focus:outline-none"
      >
        {seasons.map((year) => (
          <option key={year} value={year} className="bg-surface text-ink">
            Saison {year}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="absolute right-3 text-muted pointer-events-none" />
    </label>
  );
}

export default SeasonSelector;
