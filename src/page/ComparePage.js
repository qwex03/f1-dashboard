import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeftRight, ChevronDown } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useFetch from "../hooks/useFetch";
import useCarNumbers from "../hooks/useCarNumbers";
import { useSeason } from "../context/SeasonContext";
import { API } from "../utils/api";
import { constructorColor, readableOn } from "../utils/teams";
import PageHeader from "../composant/PageHeader";
import DriverImageWithFallback from "../composant/DriverImageWithFallback";
import { FlagImg, Loading, Notice, Position, TableCard } from "../composant/RaceUI";
import { SectionTitle, total } from "../composant/DetailUI";

// ---------------------------------------------------------------------------
// Data

const isNum = (s) => /^\d+$/.test(String(s ?? ""));
const avg = (list) => (list.length ? list.reduce((s, n) => s + n, 0) / list.length : null);

/** Everything needed for one driver over one season. */
function useDriverSeason(driverId, season) {
  const base = driverId ? `${API}/${season}/drivers/${driverId}` : null;
  const results = useFetch(base && `${base}/results/?limit=100`);
  const quali = useFetch(base && `${base}/qualifying/?limit=100`);
  const sprint = useFetch(base && `${base}/sprint/?limit=100`);
  const standing = useFetch(base && `${base}/driverStandings/`);

  const reqs = [results, quali, sprint, standing];
  const loading = reqs.some((r) => r.loading);
  const error = results.error || standing.error;
  const retry = () => reqs.forEach((r) => r.error && r.retry());

  const data = useMemo(() => {
    const races = results.data?.MRData?.RaceTable?.Races ?? [];
    const qualis = quali.data?.MRData?.RaceTable?.Races ?? [];
    const sprints = sprint.data?.MRData?.RaceTable?.Races ?? [];
    const st = standing.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];

    const byRound = {};
    races.forEach((race) => {
      const r = race.Results[0];
      byRound[race.round] = {
        round: Number(race.round),
        raceName: race.raceName,
        circuitId: race.Circuit.circuitId,
        position: Number(r.position),
        positionText: r.positionText,
        classified: isNum(r.positionText),
        grid: Number(r.grid),
        points: Number(r.points),
        status: r.status,
        constructor: r.Constructor,
      };
    });
    qualis.forEach((race) => {
      const q = race.QualifyingResults?.[0];
      if (!q) return;
      byRound[race.round] = {
        round: Number(race.round),
        raceName: race.raceName,
        circuitId: race.Circuit.circuitId,
        ...byRound[race.round],
        quali: Number(q.position),
      };
    });
    sprints.forEach((race) => {
      const s = race.SprintResults?.[0];
      if (!s || !byRound[race.round]) return;
      byRound[race.round].sprintPoints = Number(s.points);
    });

    const rows = Object.values(byRound).sort((a, b) => a.round - b.round);
    const raced = rows.filter((r) => r.position);
    const classified = raced.filter((r) => r.classified);
    const racePoints = raced.reduce((s, r) => s + r.points + (r.sprintPoints ?? 0), 0);

    return {
      rows,
      team: raced[raced.length - 1]?.constructor ?? st?.Constructors?.slice(-1)[0],
      stats: {
        championship: st ? Number(st.position) : null,
        points: st ? Number(st.points) : racePoints,
        wins: raced.filter((r) => r.position === 1).length,
        podiums: raced.filter((r) => r.position <= 3).length,
        poles: rows.filter((r) => r.quali === 1).length,
        top10: raced.filter((r) => r.points > 0).length,
        dnf: raced.filter((r) => !r.classified).length,
        avgFinish: avg(classified.map((r) => r.position)),
        avgQuali: avg(rows.filter((r) => r.quali).map((r) => r.quali)),
        best: classified.length ? Math.min(...classified.map((r) => r.position)) : null,
        starts: raced.length,
      },
    };
  }, [results.data, quali.data, sprint.data, standing.data]);

  return { ...data, loading, error, retry };
}

function useCareer(driverId) {
  const base = driverId ? `${API}/drivers/${driverId}` : null;
  const starts = useFetch(base && `${base}/results/?limit=1`);
  const wins = useFetch(base && `${base}/results/1/?limit=1`);
  const p2 = useFetch(base && `${base}/results/2/?limit=1`);
  const p3 = useFetch(base && `${base}/results/3/?limit=1`);
  const poles = useFetch(base && `${base}/qualifying/1/?limit=1`);
  const titles = useFetch(base && `${base}/driverStandings/1/?limit=30`);
  const seasons = useFetch(base && `${base}/seasons/?limit=100`);

  const all = [starts, wins, p2, p3, poles, titles, seasons];
  const podiums = [wins, p2, p3].every((r) => r.data) ? total(wins.data) + total(p2.data) + total(p3.data) : undefined;
  return {
    loading: all.some((r) => r.loading),
    stats: {
      titles: titles.data ? (titles.data.MRData.StandingsTable.StandingsLists ?? []).length : undefined,
      wins: total(wins.data),
      podiums,
      poles: total(poles.data),
      starts: total(starts.data),
      seasons: seasons.data ? (seasons.data.MRData.SeasonTable.Seasons ?? []).length : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// UI pieces

function DriverPicker({ value, onChange, options, label, color }) {
  return (
    <label className="relative flex h-12 min-w-0 flex-1 items-center rounded-lg border border-line bg-surface transition-colors hover:border-ink/30">
      <span className="absolute inset-y-2 left-2 w-1 rounded-full" style={{ backgroundColor: color }} />
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-full w-full cursor-pointer appearance-none truncate bg-transparent pl-6 pr-9 font-display text-lg font-bold uppercase tracking-wide text-ink focus:outline-none"
      >
        {!value && <option value="">Choisir un pilote</option>}
        {options.map((o) => (
          <option key={o.driverId} value={o.driverId} className="bg-surface text-ink">
            {o.givenName} {o.familyName}
            {o.team ? ` · ${o.team}` : ""}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none absolute right-3 text-muted" />
    </label>
  );
}

function DriverCard({ driver, team, color, align = "left", standing, number }) {
  const right = align === "right";
  if (!driver) {
    return <div className="panel h-40 animate-pulse sm:h-56" />;
  }
  return (
    <Link
      to={`/drivers/${driver.driverId}`}
      className={`group relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-surface p-4 sm:p-6 ${
        right ? "items-end text-right" : ""
      }`}
    >
      <div
        className="absolute inset-0 opacity-20 dark:opacity-30"
        style={{ background: `linear-gradient(${right ? 245 : 115}deg, ${color} 0%, transparent 65%)` }}
      />
      <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      {number && (
        <span
          aria-hidden
          className={`pointer-events-none absolute -bottom-6 font-display text-[6rem] font-extrabold italic leading-none text-ink/[0.07] sm:text-[10rem] ${
            right ? "right-2" : "left-2"
          }`}
        >
          {number}
        </span>
      )}

      <div className={`relative flex items-center gap-4 ${right ? "flex-row-reverse" : ""}`}>
        <div className="relative h-16 w-16 shrink-0 sm:h-28 sm:w-28">
          <div className="absolute inset-0 rounded-full" style={{ backgroundColor: `${color}40` }} />
          <DriverImageWithFallback
            driverName={driver.givenName}
            familyName={driver.familyName}
            className="relative h-full w-full rounded-full object-cover object-top"
          />
        </div>
        <div className="min-w-0">
          <div className={`flex flex-wrap items-center gap-2 ${right ? "justify-end" : ""}`}>
            {driver.code && <span className="tag bg-ink text-canvas">{driver.code}</span>}
            {standing != null && (
              <span className="tag" style={{ backgroundColor: color, color: readableOn(color) }}>
                P{standing}
              </span>
            )}
          </div>
          <p className="mt-2 hidden text-sm text-muted sm:block">{driver.givenName}</p>
          <h2 className="truncate font-display text-2xl font-extrabold italic uppercase leading-[0.95] tracking-tight text-ink transition-colors group-hover:text-accent sm:text-5xl">
            {driver.familyName}
          </h2>
          <div className={`mt-2 flex items-center gap-2 text-sm text-muted ${right ? "justify-end" : ""}`}>
            <FlagImg nationality={driver.nationality} />
            <span className="truncate">{team?.name ?? driver.nationality}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function fmt(v, digits = 0) {
  if (v == null || Number.isNaN(v)) return "—";
  return Number(v).toLocaleString("fr-FR", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

/**
 * One line of the head-to-head: A's value on the left, B's on the right,
 * and a bar split by who leads. `lower` flips the winner for positions.
 */
function DuelRow({ label, a, b, colorA, colorB, lower = false, digits = 0, prefix = "", loading = false }) {
  const hasBoth = a != null && b != null && !Number.isNaN(a) && !Number.isNaN(b);
  const winner = !hasBoth || a === b ? null : (lower ? a < b : a > b) ? "a" : "b";
  // Share of the bar: for "lower is better" values, invert so the better one gets more
  let shareA = 0.5;
  if (hasBoth && a + b > 0) shareA = lower ? b / (a + b) : a / (a + b);

  const val = (v, side) =>
    v == null && loading ? (
      <span className="h-6 w-10 animate-pulse rounded bg-raised" />
    ) : (
      <span
        className={`num text-xl font-bold leading-none sm:text-2xl ${
          winner === side ? "text-ink" : winner ? "text-faint" : "text-ink"
        }`}
      >
        {v == null ? "—" : `${prefix}${fmt(v, digits)}`}
      </span>
    );

  return (
    <div className="border-b border-line/70 px-4 py-3 last:border-0 sm:px-5">
      <div className="flex items-baseline justify-between gap-3">
        {val(a, "a")}
        <span className="kicker truncate text-center text-[0.7rem]">{label}</span>
        {val(b, "b")}
      </div>
      <div className="mt-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-raised">
        {hasBoth && (
          <>
            <span
              className="h-full rounded-l-full transition-[width] duration-500"
              style={{ width: `${shareA * 100}%`, backgroundColor: colorA, opacity: winner === "b" ? 0.35 : 1 }}
            />
            <span
              className="h-full flex-1 rounded-r-full"
              style={{ backgroundColor: colorB, opacity: winner === "a" ? 0.35 : 1 }}
            />
          </>
        )}
      </div>
    </div>
  );
}

/** Big "X – Y" scoreboard for qualifying / race battles. */
function Battle({ label, a, b, colorA, colorB, sub }) {
  const sum = a + b;
  return (
    <div className="panel flex flex-col gap-3 p-4 sm:p-5">
      <p className="kicker text-[0.7rem]">{label}</p>
      <div className="flex items-baseline justify-center gap-3 sm:gap-4">
        <span
          className="num text-4xl font-bold leading-none text-ink sm:text-5xl"
          style={{ color: a >= b ? undefined : "rgb(var(--faint))" }}
        >
          {a}
        </span>
        <span className="font-display text-2xl font-bold text-faint">–</span>
        <span
          className="num text-4xl font-bold leading-none text-ink sm:text-5xl"
          style={{ color: b >= a ? undefined : "rgb(var(--faint))" }}
        >
          {b}
        </span>
      </div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-raised">
        {sum > 0 && (
          <>
            <span className="h-full" style={{ width: `${(a / sum) * 100}%`, backgroundColor: colorA }} />
            <span className="h-full flex-1" style={{ backgroundColor: colorB }} />
          </>
        )}
      </div>
      <p className="mt-auto text-center text-xs text-faint">{sub}</p>
    </div>
  );
}

const chartTooltip = {
  background: "rgb(var(--surface))",
  border: "1px solid rgb(var(--line))",
  borderRadius: 8,
  fontFamily: "JetBrains Mono",
  fontSize: 12,
};
const axisTick = { fontFamily: "JetBrains Mono", fontSize: 11 };

/** Team-mates share a livery colour: give driver B a lighter shade of it. */
function separate(colorA, colorB) {
  if (colorA.toLowerCase() !== colorB.toLowerCase()) return colorB;
  const n = parseInt(colorB.slice(1), 16);
  const mix = (c) => Math.round(c + (255 - c) * 0.55);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// ---------------------------------------------------------------------------
// Page

export default function ComparePage() {
  const { season } = useSeason();
  const [params, setParams] = useSearchParams();
  const numberOf = useCarNumbers(season);

  const listReq = useFetch(`${API}/${season}/driverStandings/`);
  const standings = listReq.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
  const options = standings.map((s) => ({
    ...s.Driver,
    team: s.Constructors?.slice(-1)[0]?.name,
  }));

  // Default duel: driver A (the leader if none) against his team-mate, else the best other driver
  const teamOf = (st) => st?.Constructors?.slice(-1)[0]?.constructorId;
  const idA = params.get("a") || standings[0]?.Driver.driverId;
  const stA = standings.find((s) => s.Driver.driverId === idA);
  const mate = stA && standings.find((s) => s !== stA && teamOf(s) === teamOf(stA));
  const idB = params.get("b") || (mate ?? standings.find((s) => s.Driver.driverId !== idA))?.Driver.driverId;

  // A driver from the URL may not be part of the selected season: fetch him anyway
  const extraA = useFetch(idA && !options.some((o) => o.driverId === idA) ? `${API}/drivers/${idA}/` : null);
  const extraB = useFetch(idB && !options.some((o) => o.driverId === idB) ? `${API}/drivers/${idB}/` : null);
  const findDriver = (id, extra) =>
    options.find((o) => o.driverId === id) ?? extra.data?.MRData?.DriverTable?.Drivers?.[0];
  const driverA = findDriver(idA, extraA);
  const driverB = findDriver(idB, extraB);
  const pickerOptions = [
    ...options,
    ...[driverA, driverB].filter((d) => d && !options.some((o) => o.driverId === d.driverId)),
  ];

  const A = useDriverSeason(idA, season);
  const B = useDriverSeason(idB, season);
  const careerA = useCareer(idA);
  const careerB = useCareer(idB);

  const colorA = constructorColor(A.team);
  const colorB = separate(colorA, constructorColor(B.team));
  const sameTeam = A.team && B.team && A.team.constructorId === B.team.constructorId;

  const select = (key, id) => {
    const next = { a: idA, b: idB, [key]: id };
    setParams({ a: next.a, b: next.b }, { replace: true });
  };
  const swap = () => setParams({ a: idB, b: idA }, { replace: true });

  // Rounds where both drivers took part, merged for the battles, chart and table
  const merged = useMemo(() => {
    const rounds = new Map();
    A.rows.forEach((r) => rounds.set(r.round, { round: r.round, raceName: r.raceName, circuitId: r.circuitId, a: r }));
    B.rows.forEach((r) => {
      const cur = rounds.get(r.round) ?? { round: r.round, raceName: r.raceName, circuitId: r.circuitId };
      rounds.set(r.round, { ...cur, b: r });
    });
    return [...rounds.values()].sort((x, y) => x.round - y.round);
  }, [A.rows, B.rows]);

  const battles = useMemo(() => {
    const q = { a: 0, b: 0 };
    const r = { a: 0, b: 0 };
    merged.forEach(({ a, b }) => {
      if (a?.quali && b?.quali) a.quali < b.quali ? q.a++ : q.b++;
      if (a?.position && b?.position) a.position < b.position ? r.a++ : r.b++;
    });
    return { q, r };
  }, [merged]);

  const chart = useMemo(() => {
    let ca = 0;
    let cb = 0;
    return merged.map(({ round, raceName, a, b }) => {
      ca += (a?.points ?? 0) + (a?.sprintPoints ?? 0);
      cb += (b?.points ?? 0) + (b?.sprintPoints ?? 0);
      return { round, raceName, a: ca, b: cb };
    });
  }, [merged]);

  const header = (
    <PageHeader
      kicker={`Saison ${season}`}
      title="Duel pilotes"
      description="Compare deux pilotes sur la saison choisie et sur toute leur carrière."
    />
  );

  if (listReq.loading && !params.get("a")) {
    return (
      <div>
        {header}
        <Loading rows={6} />
      </div>
    );
  }
  if (listReq.error && !params.get("a")) {
    return (
      <div>
        {header}
        <Notice tone="error" onRetry={listReq.retry}>
          Impossible de charger les pilotes : {listReq.error}
        </Notice>
      </div>
    );
  }
  if (!idA || !idB) {
    return (
      <div>
        {header}
        <Notice>Aucun pilote classé pour la saison {season}.</Notice>
      </div>
    );
  }

  const nameA = driverA?.code ?? driverA?.familyName ?? "A";
  const nameB = driverB?.code ?? driverB?.familyName ?? "B";
  const seasonLoading = A.loading || B.loading;
  const seasonError = A.error || B.error;
  const hasSeason = A.stats.starts > 0 || B.stats.starts > 0;
  const sa = A.stats;
  const sb = B.stats;
  const both = (k) => ({ a: sa[k], b: sb[k] });

  return (
    <div className="space-y-10 pb-16">
      <div>
        {header}

        {/* Pickers */}
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <DriverPicker
            label="Premier pilote"
            value={idA}
            onChange={(id) => select("a", id)}
            options={pickerOptions}
            color={colorA}
          />
          <button
            onClick={swap}
            className="btn-ghost h-12 shrink-0 self-center px-4"
            aria-label="Inverser les deux pilotes"
            title="Inverser"
          >
            <ArrowLeftRight size={18} />
          </button>
          <DriverPicker
            label="Second pilote"
            value={idB}
            onChange={(id) => select("b", id)}
            options={pickerOptions}
            color={colorB}
          />
        </div>

        {/* Face to face */}
        <div className="relative flex gap-2 animate-rise sm:gap-4">
          <DriverCard driver={driverA} team={A.team} color={colorA} standing={sa.championship} number={numberOf(driverA)} />
          <span className="absolute left-1/2 top-1/2 z-10 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center bg-accent font-display text-lg font-extrabold italic text-accent-ink [clip-path:polygon(18%_0,100%_0,82%_100%,0_100%)] sm:h-14 sm:w-16 sm:text-2xl">
            VS
          </span>
          <DriverCard driver={driverB} team={B.team} color={colorB} standing={sb.championship} number={numberOf(driverB)} align="right" />
        </div>
        {sameTeam && (
          <p className="mt-3 text-center text-sm text-muted">
            Coéquipiers chez <span className="font-semibold text-ink">{A.team.name}</span> : même voiture, la
            comparaison la plus juste.
          </p>
        )}
      </div>

      {idA === idB ? (
        <Notice>Choisis deux pilotes différents.</Notice>
      ) : (
        <>
          {/* Season */}
          <section className="space-y-4">
            <SectionTitle kicker={`Saison ${season}`} title="Face-à-face" />
            {seasonLoading ? (
              <Loading rows={6} />
            ) : seasonError ? (
              <Notice
                tone="error"
                onRetry={() => {
                  A.retry();
                  B.retry();
                }}
              >
                Impossible de charger la saison : {seasonError}
              </Notice>
            ) : !hasSeason ? (
              <Notice>Aucun de ces deux pilotes n'a couru en {season}.</Notice>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Battle
                    label="Duel en qualifications"
                    a={battles.q.a}
                    b={battles.q.b}
                    colorA={colorA}
                    colorB={colorB}
                    sub={`Devant l'autre sur la grille de qualif · ${battles.q.a + battles.q.b} séances communes`}
                  />
                  <Battle
                    label="Duel en course"
                    a={battles.r.a}
                    b={battles.r.b}
                    colorA={colorA}
                    colorB={colorB}
                    sub={`Arrivé devant l'autre · ${battles.r.a + battles.r.b} courses communes`}
                  />
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,26rem)_1fr]">
                  <div className="panel overflow-hidden">
                    <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                      <span className="font-display text-lg font-bold uppercase" style={{ color: colorA }}>
                        {nameA}
                      </span>
                      <span className="kicker text-[0.7rem]">Stats</span>
                      <span className="font-display text-lg font-bold uppercase" style={{ color: colorB }}>
                        {nameB}
                      </span>
                    </div>
                    <DuelRow label="Points" {...both("points")} colorA={colorA} colorB={colorB} />
                    <DuelRow
                      label="Classement"
                      {...both("championship")}
                      lower
                      prefix="P"
                      colorA={colorA}
                      colorB={colorB}
                    />
                    <DuelRow label="Victoires" {...both("wins")} colorA={colorA} colorB={colorB} />
                    <DuelRow label="Podiums" {...both("podiums")} colorA={colorA} colorB={colorB} />
                    <DuelRow label="Poles" {...both("poles")} colorA={colorA} colorB={colorB} />
                    <DuelRow label="Dans les points" {...both("top10")} colorA={colorA} colorB={colorB} />
                    <DuelRow
                      label="Qualif moyenne"
                      {...both("avgQuali")}
                      lower
                      digits={1}
                      colorA={colorA}
                      colorB={colorB}
                    />
                    <DuelRow
                      label="Arrivée moyenne"
                      {...both("avgFinish")}
                      lower
                      digits={1}
                      colorA={colorA}
                      colorB={colorB}
                    />
                    <DuelRow label="Abandons" {...both("dnf")} lower colorA={colorA} colorB={colorB} />
                  </div>

                  <div className="panel flex flex-col p-4 sm:p-5">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="kicker">Points cumulés</p>
                      <div className="flex gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-muted">
                          <span className="h-0.5 w-4 rounded" style={{ backgroundColor: colorA }} />
                          {nameA}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted">
                          <span
                            className="h-0.5 w-4 rounded border-t-2 border-dashed"
                            style={{ borderColor: colorB }}
                          />
                          {nameB}
                        </span>
                      </div>
                    </div>
                    <div className="h-64 lg:h-auto lg:min-h-[18rem] lg:flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chart} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid stroke="rgb(var(--line))" strokeDasharray="2 4" vertical={false} />
                          <XAxis
                            dataKey="round"
                            tickFormatter={(r) => `R${r}`}
                            tickLine={false}
                            axisLine={{ stroke: "rgb(var(--line))" }}
                            stroke="rgb(var(--muted))"
                            tick={axisTick}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            stroke="rgb(var(--muted))"
                            tick={axisTick}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={chartTooltip}
                            labelFormatter={(r) => chart.find((x) => x.round === r)?.raceName}
                            formatter={(v, key) => [`${v} pts`, key === "a" ? nameA : nameB]}
                          />
                          <Line
                            type="monotone"
                            dataKey="a"
                            stroke={colorA}
                            strokeWidth={2.5}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="b"
                            stroke={colorB}
                            strokeWidth={2.5}
                            strokeDasharray="6 3"
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Race by race */}
                <TableCard>
                  <div className="overflow-x-auto">
                    <table className="f1-table">
                      <thead>
                        <tr>
                          <th className="w-12">R</th>
                          <th>Grand Prix</th>
                          <th className="hidden text-center sm:table-cell">Qualif {nameA}</th>
                          <th className="hidden text-center sm:table-cell">Qualif {nameB}</th>
                          <th className="text-center">{nameA}</th>
                          <th className="text-center">{nameB}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...merged].reverse().map(({ round, raceName, circuitId, a, b }) => {
                          const qWin = a?.quali && b?.quali ? (a.quali < b.quali ? "a" : "b") : null;
                          const rWin = a?.position && b?.position ? (a.position < b.position ? "a" : "b") : null;
                          const cell = (r, side, win, field) => {
                            if (!r || !r[field]) return <span className="num text-faint">—</span>;
                            const mark =
                              win === side
                                ? { boxShadow: `inset 0 -2px 0 ${side === "a" ? colorA : colorB}` }
                                : undefined;
                            if (field === "quali") {
                              return (
                                <span
                                  className={`num inline-block px-1 pb-0.5 ${win === side ? "font-bold text-ink" : "text-muted"}`}
                                  style={mark}
                                >
                                  {r.quali}
                                </span>
                              );
                            }
                            return (
                              <span className="inline-block pb-0.5" style={mark}>
                                {r.classified ? (
                                  <Position value={r.position} />
                                ) : (
                                  <span
                                    className="num inline-grid h-8 w-9 place-items-center text-faint"
                                    title={r.status}
                                  >
                                    {r.positionText}
                                  </span>
                                )}
                              </span>
                            );
                          };
                          return (
                            <tr key={round}>
                              <td className="num text-muted">{round}</td>
                              <td>
                                <Link
                                  to={`/tracks/${circuitId}`}
                                  className="font-display text-[1.05rem] font-bold uppercase tracking-wide text-ink hover:text-accent"
                                >
                                  {raceName.replace(" Grand Prix", "")}
                                </Link>
                              </td>
                              <td className="hidden text-center sm:table-cell">{cell(a, "a", qWin, "quali")}</td>
                              <td className="hidden text-center sm:table-cell">{cell(b, "b", qWin, "quali")}</td>
                              <td className="text-center">{cell(a, "a", rWin, "position")}</td>
                              <td className="text-center">{cell(b, "b", rWin, "position")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TableCard>
              </>
            )}
          </section>

          {/* Career */}
          <section>
            <SectionTitle kicker="Toute leur carrière en F1" title="Palmarès" />
            {
              <div className="panel overflow-hidden lg:max-w-3xl">
                <div className="flex items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                  <span className="font-display text-lg font-bold uppercase" style={{ color: colorA }}>
                    {nameA}
                  </span>
                  <span className="kicker text-[0.7rem]">Carrière</span>
                  <span className="font-display text-lg font-bold uppercase" style={{ color: colorB }}>
                    {nameB}
                  </span>
                </div>
                {[
                  ["Titres", "titles"],
                  ["Victoires", "wins"],
                  ["Podiums", "podiums"],
                  ["Poles", "poles"],
                  ["Grands Prix", "starts"],
                  ["Saisons", "seasons"],
                ].map(([label, key]) => (
                  <DuelRow
                    key={key}
                    label={label}
                    a={careerA.stats[key]}
                    b={careerB.stats[key]}
                    loading={careerA.loading || careerB.loading}
                    colorA={colorA}
                    colorB={colorB}
                  />
                ))}
              </div>
            }
          </section>
        </>
      )}
    </div>
  );
}
