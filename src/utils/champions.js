import { useEffect, useState } from "react";
import { API, apiFetch } from "./api";

// World champions up to 2025. The API can only list standings season by season
// (a season is required: `/drivers/{id}/driverStandings/1` returns nothing), so
// counting someone's titles would cost one request per season. History doesn't
// change: keep it here, and only ask the API about seasons finished after 2025.
const LAST_KNOWN = 2025;

const DRIVERS = `farina fangio ascari ascari fangio fangio fangio fangio hawthorn jack_brabham jack_brabham
  phil_hill hill clark surtees clark jack_brabham hulme hill stewart rindt stewart emerson_fittipaldi stewart
  emerson_fittipaldi lauda hunt lauda mario_andretti scheckter jones piquet keke_rosberg piquet lauda prost prost
  piquet senna prost senna senna mansell prost michael_schumacher michael_schumacher damon_hill villeneuve
  hakkinen hakkinen michael_schumacher michael_schumacher michael_schumacher michael_schumacher michael_schumacher
  alonso alonso raikkonen hamilton button vettel vettel vettel vettel hamilton hamilton rosberg hamilton hamilton
  hamilton hamilton max_verstappen max_verstappen max_verstappen max_verstappen norris`.split(/\s+/); // 1950 →

const CONSTRUCTORS = `vanwall cooper-climax cooper-climax ferrari brm lotus-climax ferrari lotus-climax brabham-repco
  brabham-repco lotus-ford matra-ford lotus-ford tyrrell team_lotus team_lotus mclaren ferrari ferrari ferrari
  team_lotus ferrari williams williams ferrari ferrari mclaren mclaren williams williams mclaren mclaren mclaren
  mclaren williams williams williams benetton williams williams mclaren ferrari ferrari ferrari ferrari ferrari
  ferrari renault renault ferrari ferrari brawn red_bull red_bull red_bull red_bull mercedes mercedes mercedes
  mercedes mercedes mercedes mercedes mercedes red_bull red_bull mclaren mclaren`.split(/\s+/); // 1958 →

const KNOWN = {
  driver: DRIVERS.map((id, i) => ({ season: String(1950 + i), id })),
  constructor: CONSTRUCTORS.map((id, i) => ({ season: String(1958 + i), id })),
};

/** Champion of a season once it is over (null while it is still running). */
async function championOf(kind, season) {
  const path = kind === "driver" ? "driverStandings" : "constructorStandings";
  const [standings, races] = await Promise.all([
    apiFetch(`${API}/${season}/${path}/1/`),
    apiFetch(`${API}/${season}/races/?limit=1`),
  ]);
  const list = standings?.MRData?.StandingsTable?.StandingsLists?.[0];
  const totalRounds = Number(races?.MRData?.total ?? 0);
  if (!list || !totalRounds || Number(list.round) < totalRounds) return null;
  const row = kind === "driver" ? list.DriverStandings?.[0] : list.ConstructorStandings?.[0];
  return row ? { season: String(season), id: kind === "driver" ? row.Driver.driverId : row.Constructor.constructorId } : null;
}

const recent = new Map(); // kind -> Promise<[{season, id}]>, shared by every page
function recentChampions(kind) {
  if (!recent.has(kind)) {
    const years = [];
    for (let y = LAST_KNOWN + 1; y <= new Date().getFullYear(); y++) years.push(y);
    recent.set(kind, Promise.all(years.map((y) => championOf(kind, y).catch(() => null))).then((l) => l.filter(Boolean)));
  }
  return recent.get(kind);
}

/** Seasons a driver ("driver") or a team ("constructor") won the world championship. */
export function useTitles(kind, id) {
  const known = KNOWN[kind].filter((c) => c.id === id).map((c) => c.season);
  const [extra, setExtra] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setExtra(null);
    recentChampions(kind).then((list) => {
      if (!cancelled) setExtra(list.filter((c) => c.id === id).map((c) => c.season));
    });
    return () => {
      cancelled = true;
    };
  }, [kind, id]);

  return { years: [...known, ...(extra ?? [])], loading: extra === null };
}
