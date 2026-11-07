import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { fr } from "date-fns/locale";
import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";
import { Loading, Notice } from "./RaceUI";

const TZ = "Europe/Paris";

function sessionDate(session) {
  return new Date(`${session.date}T${session.time || "00:00:00Z"}`);
}

function fmt(session, pattern) {
  return formatInTimeZone(sessionDate(session), TZ, pattern, { locale: fr });
}

function sessionsOf(race) {
  const list = [{ label: "Essais libres 1", s: race.FirstPractice }];
  if (race.Sprint) {
    list.push({ label: "Qualifs sprint", s: race.SprintQualifying ?? race.SprintShootout });
    list.push({ label: "Sprint", s: race.Sprint });
  } else {
    list.push({ label: "Essais libres 2", s: race.SecondPractice });
    list.push({ label: "Essais libres 3", s: race.ThirdPractice });
  }
  list.push({ label: "Qualifications", s: race.Qualifying });
  list.push({ label: "Course", s: race, main: true });
  return list
    .filter((x) => x.s?.date)
    .sort((a, b) => sessionDate(a.s) - sessionDate(b.s));
}

function useCountdown(target) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor((diff / 36e5) % 24),
    m: Math.floor((diff / 6e4) % 60),
    s: Math.floor((diff / 1e3) % 60),
  };
}

function Countdown({ target }) {
  const t = useCountdown(target);
  const cells = [
    ["j", t.d],
    ["h", t.h],
    ["min", t.m],
    ["s", t.s],
  ];
  return (
    <div className="grid grid-cols-4 gap-2 sm:flex">
      {cells.map(([unit, v]) => (
        <div key={unit} className="rounded-lg bg-black/25 px-2 py-2 sm:min-w-[4.25rem] sm:px-3 text-center backdrop-blur-sm">
          <div className="num text-3xl font-bold leading-none text-white md:text-4xl">
            {String(v).padStart(2, "0")}
          </div>
          <div className="mt-1 font-display text-xs uppercase tracking-widest text-white/70">{unit}</div>
        </div>
      ))}
    </div>
  );
}

function NextRaceHero({ race }) {
  const country = race.Circuit.Location.country;
  const flag = getFlagImg(country);
  const now = Date.now();

  return (
    <article className="relative overflow-hidden rounded-xl bg-accent text-white animate-rise">
      <div className="absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(-62deg,rgba(0,0,0,.25)_0_2px,transparent_2px_16px)]" />
      <div className="absolute right-0 top-0 h-full w-40 checker opacity-[0.08] [--ink:255_255_255]" />

      <div className="relative grid gap-6 p-5 sm:gap-8 md:p-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="flex flex-col">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Prochain Grand Prix · Manche {race.round}
          </p>
          <h2 className="mt-2 font-display text-[2.6rem] font-extrabold italic uppercase leading-[0.9] tracking-tight sm:text-5xl md:text-7xl">
            {race.raceName.replace("Grand Prix", "").trim() || race.raceName}
            <span className="block text-white/60">Grand Prix</span>
          </h2>
          <p className="mt-4 flex items-center gap-2 text-white/85">
            {flag && <img src={flag} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />}
            {race.Circuit.circuitName} · {race.Circuit.Location.locality ?? country}
          </p>
          <div className="mt-auto pt-6 sm:pt-8">
            <p className="mb-2 font-display text-xs uppercase tracking-[0.2em] text-white/70">Départ dans</p>
            <Countdown target={sessionDate(race).getTime()} />
          </div>
        </div>

        <ol className="self-end rounded-lg bg-black/20 p-2 backdrop-blur-sm">
          {sessionsOf(race).map(({ label, s, main }) => {
            const past = sessionDate(s).getTime() < now;
            return (
              <li
                key={label}
                className={`flex items-center justify-between gap-4 rounded-md px-3 py-2.5 ${
                  main ? "bg-white text-black" : past ? "text-white/45" : "text-white"
                }`}
              >
                <span className="font-display text-sm font-semibold uppercase tracking-wide sm:text-base">{label}</span>
                <span className="num text-sm">
                  {fmt(s, "EEE d MMM")} <span className="font-bold">{s.time ? fmt(s, "HH:mm") : "—"}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </article>
  );
}

function UpcomingCard({ race }) {
  const country = race.Circuit.Location.country;
  return (
    <li className="panel group flex min-w-[14rem] flex-1 snap-start flex-col gap-3 p-4 transition-colors hover:border-ink/30">
      <div className="flex items-center justify-between">
        <span className="kicker text-[0.7rem]">R{race.round}</span>
        {race.Sprint && <span className="tag bg-ink text-canvas">Sprint</span>}
      </div>
      <div>
        <p className="font-display text-xl font-bold uppercase leading-tight tracking-tight text-ink">
          {race.raceName.replace("Grand Prix", "GP")}
        </p>
        <p className="mt-1 flex items-center gap-2 truncate text-sm text-muted">
          {getFlagImg(country) && <img src={getFlagImg(country)} alt="" className="h-3 w-4 rounded-[2px]" />}
          {race.Circuit.circuitName}
        </p>
      </div>
      <p className="num mt-auto text-sm text-ink">
        {fmt(race, "d MMM")} · <span className="text-muted">{race.time ? fmt(race, "HH:mm") : "—"}</span>
      </p>
    </li>
  );
}

export default function NextGP() {
  const { data, loading, error } = useFetch("https://api.jolpi.ca/ergast/f1/current/races/");

  const upcoming = useMemo(() => {
    const races = data?.MRData?.RaceTable?.Races || [];
    const now = new Date();
    // Keep a race "next" until ~3h after lights out
    return races.filter((r) => sessionDate(r).getTime() + 3 * 36e5 >= now.getTime());
  }, [data]);

  if (loading) return <Loading rows={4} />;
  if (error) return <Notice tone="error">Impossible de charger le calendrier : {error}</Notice>;
  if (!upcoming.length) return <Notice>La saison est terminée — rendez-vous l'an prochain.</Notice>;

  const [next, ...rest] = upcoming;

  return (
    <div className="space-y-10">
      <NextRaceHero race={next} />

      {rest.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="kicker mb-1">Calendrier</p>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl">À suivre</h2>
            </div>
            <span className="num text-sm text-muted">{rest.length} course{rest.length > 1 ? "s" : ""}</span>
          </div>
          <ul className="-mx-4 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar sm:mx-0 sm:px-0">
            {rest.map((race) => (
              <UpcomingCard key={race.round} race={race} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
