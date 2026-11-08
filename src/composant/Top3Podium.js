import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useSeason } from "../context/SeasonContext";
import DriverImageWithFallback from "./DriverImageWithFallback";
import { constructorColor } from "../utils/teams";
import { FlagImg } from "./RaceUI";

const MEDAL = { 1: "bg-gold", 2: "bg-silver", 3: "bg-bronze" };
// Display order on wide screens: P2 – P1 – P3
const ORDER = { 1: "md:order-2", 2: "md:order-1", 3: "md:order-3" };

function PodiumCard({ standing, leaderPoints }) {
  const { Driver: driver, Constructors = [], position, points, wins } = standing;
  const team = Constructors[0];
  const color = constructorColor(team);
  const isFirst = position === "1";
  const gap = Number(leaderPoints) - Number(points);

  return (
    <Link
      to={`/drivers/${driver.driverId}`}
      className={`group relative block w-[78%] shrink-0 snap-center overflow-hidden rounded-xl border border-line bg-surface md:w-auto ${ORDER[position]} ${
        isFirst ? "md:-mt-6" : ""
      } animate-rise`}
      style={{ animationDelay: `${Number(position) * 80}ms` }}
    >
      {/* livery wash */}
      <div
        className="absolute inset-0 opacity-[0.16] dark:opacity-25"
        style={{ background: `linear-gradient(160deg, ${color} 0%, transparent 65%)` }}
      />
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />

      {/* giant position numeral */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 -top-4 font-display text-[8rem] md:-top-6 md:text-[11rem] font-extrabold italic leading-none text-ink/[0.06]"
      >
        {position}
      </span>

      <div className="relative flex h-full flex-col p-5">
        <div className="flex items-center justify-between">
          <span
            className={`tag ${MEDAL[position]} text-black`}
          >
            P{position}
          </span>
          <span className="kicker text-[0.7rem]">{team?.name}</span>
        </div>

        <div className={`relative mx-auto mt-4 ${isFirst ? "h-32 w-32 md:h-44 md:w-44" : "h-28 w-28 md:h-36 md:w-36"}`}>
          <div className="absolute inset-0 rounded-full" style={{ backgroundColor: `${color}33` }} />
          <DriverImageWithFallback
            driverName={driver.givenName}
            familyName={driver.familyName}
            className="relative h-full w-full rounded-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm text-muted">
              <FlagImg nationality={driver.nationality} />
              {driver.givenName}
            </p>
            <p className="truncate font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-ink">
              {driver.familyName}
            </p>
          </div>
          <div className="text-right">
            <p className="num text-3xl font-bold leading-none text-ink">{points}</p>
            <p className="kicker mt-1 text-[0.65rem]">pts</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm">
          <span className="text-muted">
            <span className="num text-ink">{wins}</span> victoire{Number(wins) > 1 ? "s" : ""}
          </span>
          <span className="num text-muted">{isFirst ? "Leader" : `−${gap}`}</span>
        </div>
      </div>
    </Link>
  );
}

export default function Top3Podium({ top3 = [], displayedSeason, fallbackMessage }) {
  const { season } = useSeason();
  const seasonToDisplay = displayedSeason ?? season;

  return (
    <section>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="kicker mb-1">Championnat pilotes {seasonToDisplay}</p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">Le top 3</h2>
        </div>
        <Link to="/drivers" className="group inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-accent">
          Classement complet
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {top3.length === 0 ? (
        <div className="panel speedlines px-6 py-12 text-center text-muted">
          {fallbackMessage ?? "Le podium sera disponible après le premier Grand Prix."}
        </div>
      ) : (
        <div className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar md:mx-0 md:grid md:grid-cols-3 md:items-end md:gap-4 md:overflow-visible md:px-0 md:pb-0 md:pt-6">
          {top3.map((s) => (
            <PodiumCard key={s.Driver.driverId} standing={s} leaderPoints={top3[0].points} />
          ))}
        </div>
      )}
    </section>
  );
}
