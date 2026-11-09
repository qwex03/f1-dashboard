import { useEffect, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { API, apiFetch } from "../utils/api";
import { constructorColor } from "../utils/teams";
import { Loading, Notice } from "./RaceUI";

const PRESETS = [
  { label: "Top 3", n: 3 },
  { label: "Top 5", n: 5 },
  { label: "Top 10", n: 10 },
  { label: "Tous", n: Infinity },
];

const axisTick = { fontFamily: "JetBrains Mono", fontSize: 12 };

/** Standings after every round, fetched together (the API layer paces them). */
function useStandingsByRound(season, maxRound) {
  const [state, setState] = useState({ rounds: [], loading: true, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (maxRound <= 0) {
      setState({ rounds: [], loading: false, error: null });
      return undefined;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);
    Promise.all(rounds.map((r) => apiFetch(`${API}/${season}/${r}/driverStandings/`)))
      .then((responses) => {
        if (cancelled) return;
        const list = responses.map((json, i) => {
          const sl = json?.MRData?.StandingsTable?.StandingsLists?.[0];
          return { round: i + 1, standings: sl?.DriverStandings ?? [] };
        });
        setState({ rounds: list, loading: false, error: null });
      })
      .catch((e) => !cancelled && setState({ rounds: [], loading: false, error: e.message || String(e) }));
    return () => {
      cancelled = true;
    };
  }, [season, maxRound, attempt]);

  return { ...state, retry: () => setAttempt((a) => a + 1) };
}

/**
 * Championship evolution for drivers: cumulative points (or championship position)
 * after each round, one line per driver, team-mates told apart by a dashed line.
 */
export default function DriversEvolution({ season, standings, maxRound, raceNames = {} }) {
  const { rounds, loading, error, retry } = useStandingsByRound(season, maxRound);
  const [mode, setMode] = useState("points");
  const [preset, setPreset] = useState(10);
  const [picked, setPicked] = useState(null); // null = follow the preset
  const [hover, setHover] = useState(null);

  // Drivers in current championship order, with their colour and line style
  const drivers = useMemo(() => {
    const seenTeams = {};
    return standings.map((s) => {
      const team = s.Constructors?.slice(-1)[0];
      const teamId = team?.constructorId ?? "?";
      const second = Boolean(seenTeams[teamId]);
      seenTeams[teamId] = true;
      return {
        id: s.Driver.driverId,
        code: s.Driver.code ?? s.Driver.familyName.slice(0, 3).toUpperCase(),
        name: `${s.Driver.givenName} ${s.Driver.familyName}`,
        color: constructorColor(team),
        dashed: second,
        position: Number(s.position),
      };
    });
  }, [standings]);

  const visible = useMemo(
    () => new Set(picked ?? drivers.slice(0, preset).map((d) => d.id)),
    [picked, preset, drivers]
  );

  const data = useMemo(
    () =>
      rounds.map(({ round, standings: list }) => {
        const row = { round };
        list.forEach((s) => {
          row[s.Driver.driverId] = mode === "points" ? Number(s.points) : Number(s.position);
        });
        return row;
      }),
    [rounds, mode]
  );

  const toggle = (id) => {
    const next = new Set(visible);
    next.has(id) ? next.delete(id) : next.add(id);
    setPicked([...next]);
  };
  const applyPreset = (n) => {
    setPreset(n);
    setPicked(null);
  };
  const byId = Object.fromEntries(drivers.map((d) => [d.id, d]));

  return (
    <div className="panel animate-rise p-4 sm:p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker mb-1">{mode === "points" ? "Points cumulés" : "Place au championnat"}</p>
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">Évolution du championnat</h2>
        </div>
        <div className="flex items-center gap-3">
          {maxRound > 0 && <span className="num whitespace-nowrap text-sm text-muted">{maxRound} manches</span>}
          <div className="flex rounded-lg border border-line p-0.5">
            {[
              ["points", "Points"],
              ["position", "Position"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMode(value)}
                className={`h-8 rounded-md px-3 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                  mode === value ? "bg-ink text-canvas" : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {maxRound === 0 ? (
        <p className="py-10 text-center text-muted">Pas encore de données d'évolution pour cette saison.</p>
      ) : loading ? (
        <Loading rows={4} label="Chargement de l'évolution" />
      ) : error ? (
        <Notice tone="error" onRetry={retry}>
          Impossible de charger l'évolution : {error}
        </Notice>
      ) : (
        <>
          <div className="h-80 sm:h-[28rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="round"
                  tickFormatter={(r) => `R${r}`}
                  stroke="rgb(var(--muted))"
                  tickLine={false}
                  axisLine={{ stroke: "rgb(var(--line))" }}
                  tick={axisTick}
                  interval="preserveStartEnd"
                  minTickGap={12}
                />
                <YAxis
                  stroke="rgb(var(--muted))"
                  tickLine={false}
                  axisLine={false}
                  tick={axisTick}
                  allowDecimals={false}
                  reversed={mode === "position"}
                  interval={0}
                  ticks={mode === "position" ? [1, 5, 10, 15, 20, 25].filter((n) => n <= drivers.length) : undefined}
                  domain={mode === "position" ? [1, "dataMax"] : [0, "auto"]}
                  tickFormatter={(v) => (mode === "position" ? `P${v}` : v)}
                  width={mode === "position" ? 52 : 60}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgb(var(--surface))",
                    border: "1px solid rgb(var(--line))",
                    borderRadius: 8,
                    fontFamily: "JetBrains Mono",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "rgb(var(--ink))", fontWeight: 700, marginBottom: 4 }}
                  labelFormatter={(r) => (raceNames[r] ? `R${r} · ${raceNames[r]}` : `Manche ${r}`)}
                  itemSorter={(item) => (mode === "points" ? -item.value : item.value)}
                  formatter={(v, id) => [mode === "points" ? `${v} pts` : `P${v}`, byId[id]?.code ?? id]}
                />
                {drivers
                  .filter((d) => visible.has(d.id))
                  .map((d) => (
                    <Line
                      key={d.id}
                      type={mode === "position" ? "linear" : "monotone"}
                      dataKey={d.id}
                      name={d.id}
                      stroke={d.color}
                      strokeWidth={hover === d.id ? 3.5 : 2.25}
                      strokeDasharray={d.dashed ? "6 4" : undefined}
                      strokeOpacity={hover && hover !== d.id ? 0.15 : 1}
                      dot={false}
                      activeDot={{ r: 4 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Driver picker / legend */}
          <div className="mt-5 border-t border-line pt-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="kicker mr-1 text-[0.7rem]">Afficher</span>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.n)}
                  className={`h-8 rounded-md border px-3 font-display text-sm font-bold uppercase tracking-wide transition-colors ${
                    !picked && preset === p.n
                      ? "border-ink bg-ink text-canvas"
                      : "border-line text-muted hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {picked && (
                <button
                  onClick={() => setPicked([])}
                  className="h-8 px-2 text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
                >
                  Aucun
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {drivers.map((d) => {
                const on = visible.has(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => toggle(d.id)}
                    onMouseEnter={() => on && setHover(d.id)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => on && setHover(d.id)}
                    onBlur={() => setHover(null)}
                    title={d.name}
                    aria-pressed={on}
                    className={`flex h-8 items-center gap-2 rounded-md border px-2.5 transition-colors ${
                      on ? "border-line bg-raised text-ink" : "border-line/60 text-faint hover:text-muted"
                    }`}
                  >
                    <svg width="18" height="6" aria-hidden className={on ? "" : "opacity-30"}>
                      <line
                        x1="0"
                        y1="3"
                        x2="18"
                        y2="3"
                        stroke={d.color}
                        strokeWidth="3"
                        strokeDasharray={d.dashed ? "5 3" : undefined}
                      />
                    </svg>
                    <span className="num text-xs text-faint">{d.position}</span>
                    <span className="font-display text-sm font-bold uppercase tracking-wide">{d.code}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-faint">
              Clique sur un pilote pour l'ajouter ou le retirer. Le second pilote de chaque écurie est en pointillés.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
