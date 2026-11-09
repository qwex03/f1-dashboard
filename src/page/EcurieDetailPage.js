import { Link, useParams } from "react-router-dom";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useFetch from "../hooks/useFetch";
import useWikiSummary from "../hooks/useWikiSummary";
import { useTitles } from "../utils/champions";
import { useSeason } from "../context/SeasonContext";
import useCarNumbers from "../hooks/useCarNumbers";
import { API } from "../utils/api";
import { constructorColor } from "../utils/teams";
import DriverImageWithFallback from "../composant/DriverImageWithFallback";
import TeamImageWithFallback from "../composant/TeamImageWithFallback";
import { FlagImg, Loading, Notice, Position, TableCard } from "../composant/RaceUI";
import { BackLink, SectionTitle, StatTile, WikiCard, total } from "../composant/DetailUI";

function CareerStats({ constructorId }) {
  const base = `${API}/constructors/${constructorId}`;
  const races = useFetch(`${base}/races/?limit=1`);
  const wins = useFetch(`${base}/results/1/?limit=1`);
  const p2 = useFetch(`${base}/results/2/?limit=1`);
  const p3 = useFetch(`${base}/results/3/?limit=1`);
  const poles = useFetch(`${base}/qualifying/1/?limit=1`);
  const titles = useTitles("constructor", constructorId);
  const seasons = useFetch(`${base}/seasons/?limit=100`);

  const titleYears = titles.years;
  const seasonList = (seasons.data?.MRData?.SeasonTable?.Seasons ?? []).map((s) => s.season);
  const podiums =
    [wins, p2, p3].every((r) => r.data) ? total(wins.data) + total(p2.data) + total(p3.data) : undefined;

  return (
    <section>
      <SectionTitle kicker="Toute son histoire en F1" title="Palmarès" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="Titres constructeurs"
          value={titleYears.length}
          hint={
            titleYears.length
              ? titleYears.length > 4
                ? `dernier en ${titleYears[titleYears.length - 1]}`
                : titleYears.join(" · ")
              : null
          }
          loading={titles.loading}
        />
        <StatTile label="Victoires" value={total(wins.data)} loading={wins.loading} />
        <StatTile label="Podiums" value={podiums} loading={wins.loading || p2.loading || p3.loading} />
        <StatTile label="Poles" value={total(poles.data)} loading={poles.loading} />
        <StatTile label="Grands Prix" value={total(races.data)} loading={races.loading} />
        <StatTile
          label="Saisons"
          value={seasons.data ? seasonList.length : undefined}
          hint={seasonList.length ? `depuis ${seasonList[0]}` : null}
          loading={seasons.loading}
        />
      </div>
      <p className="mt-2 text-xs text-faint">Le titre constructeurs existe depuis 1958. Les podiums comptent chaque voiture.</p>
    </section>
  );
}

function DriversLineup({ drivers, standings, color, season }) {
  const numberOf = useCarNumbers(season);
  if (!drivers.length) return null;
  const byId = new Map(standings.map((s) => [s.Driver.driverId, s]));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {drivers.map((d) => {
        const st = byId.get(d.driverId);
        return (
          <Link
            key={d.driverId}
            to={`/drivers/${d.driverId}`}
            className="panel group relative flex items-center gap-4 overflow-hidden p-4 transition-colors hover:border-ink/30"
          >
            <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
            <div className="relative h-16 w-16 shrink-0">
              <div className="absolute inset-0 rounded-full" style={{ backgroundColor: `${color}33` }} />
              <DriverImageWithFallback
                driverName={d.givenName}
                familyName={d.familyName}
                className="relative h-full w-full rounded-full object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm text-muted">
                <FlagImg nationality={d.nationality} />
                {d.givenName}
                {numberOf(d) && <span className="num text-faint">#{numberOf(d)}</span>}
              </p>
              <p className="truncate font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-ink group-hover:text-accent">
                {d.familyName}
              </p>
            </div>
            {st && (
              <div className="text-right">
                <p className="num text-xl font-bold text-ink">{st.points}</p>
                <p className="kicker text-[0.65rem]">P{st.position} · pts</p>
              </div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

function SeasonSection({ constructorId, season, color }) {
  const resultsReq = useFetch(`${API}/${season}/constructors/${constructorId}/results/?limit=100`);
  const standingReq = useFetch(`${API}/${season}/constructors/${constructorId}/constructorStandings/`);
  const driversReq = useFetch(`${API}/${season}/constructors/${constructorId}/drivers/`);
  const driverStandingsReq = useFetch(`${API}/${season}/driverStandings/`);

  const races = resultsReq.data?.MRData?.RaceTable?.Races ?? [];
  const standing = standingReq.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.[0];
  const drivers = driversReq.data?.MRData?.DriverTable?.Drivers ?? [];
  const driverStandings =
    driverStandingsReq.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  if (resultsReq.loading || standingReq.loading || driversReq.loading) return <Loading rows={6} />;
  if (resultsReq.error)
    return (
      <Notice tone="error" onRetry={resultsReq.retry}>
        Impossible de charger la saison : {resultsReq.error}
      </Notice>
    );
  if (!races.length && !drivers.length) return <Notice>L'écurie n'a pas couru en {season}.</Notice>;

  // One row per race, one column per driver (the drivers can change during a season)
  const driverIds = [...new Set(races.flatMap((r) => r.Results.map((x) => x.Driver.driverId)))];
  const driverInfo = new Map(races.flatMap((r) => r.Results.map((x) => [x.Driver.driverId, x.Driver])));
  const rows = races.map((race) => {
    const row = {
      round: race.round,
      name: race.raceName.replace(" Grand Prix", ""),
      raceName: race.raceName,
      circuitId: race.Circuit.circuitId,
      results: race.Results,
      total: race.Results.reduce((s, x) => s + Number(x.points), 0),
    };
    race.Results.forEach((x) => (row[x.Driver.driverId] = Number(x.points)));
    return row;
  });
  const best = Math.min(...races.flatMap((r) => r.Results.filter((x) => /^\d+$/.test(x.positionText)).map((x) => Number(x.position))));
  const shades = [color, `${color}80`, `${color}50`, `${color}30`];

  return (
    <section className="space-y-4">
      <SectionTitle kicker={`Saison ${season}`} title="Pilotes et résultats" />

      <DriversLineup drivers={drivers} standings={driverStandings} color={color} season={season} />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Championnat" value={standing ? `P${standing.position}` : "—"} />
        <StatTile label="Points" value={standing?.points ?? rows.reduce((s, r) => s + r.total, 0)} />
        <StatTile label="Meilleur résultat" value={Number.isFinite(best) ? `P${best}` : "—"} />
      </div>

      {rows.length > 0 && (
        <>
          <div className="panel p-4 sm:p-5">
            <p className="kicker mb-3">Points marqués par Grand Prix</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                  <XAxis
                    dataKey="round"
                    tickFormatter={(r) => `R${r}`}
                    tickLine={false}
                    axisLine={{ stroke: "rgb(var(--line))" }}
                    stroke="rgb(var(--muted))"
                    tick={{ fontFamily: "JetBrains Mono", fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    stroke="rgb(var(--muted))"
                    tick={{ fontFamily: "JetBrains Mono", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgb(var(--raised))" }}
                    contentStyle={{
                      background: "rgb(var(--surface))",
                      border: "1px solid rgb(var(--line))",
                      borderRadius: 8,
                      fontFamily: "JetBrains Mono",
                      fontSize: 12,
                    }}
                    labelFormatter={(r) => rows.find((x) => x.round === r)?.raceName}
                  />
                  <Legend iconType="square" wrapperStyle={{ fontFamily: "Titillium Web", fontSize: 12, paddingTop: 8 }} />
                  {driverIds.map((id, i) => (
                    <Bar
                      key={id}
                      dataKey={id}
                      stackId="pts"
                      name={driverInfo.get(id)?.familyName ?? id}
                      fill={shades[i % shades.length]}
                      radius={i === driverIds.length - 1 ? [3, 3, 0, 0] : 0}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <TableCard>
            <div className="overflow-x-auto">
              <table className="f1-table">
                <thead>
                  <tr>
                    <th className="w-14">R</th>
                    <th>Grand Prix</th>
                    <th>Arrivées</th>
                    <th className="text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {[...rows].reverse().map((r) => (
                    <tr key={r.round}>
                      <td className="num text-muted">{r.round}</td>
                      <td>
                        <Link
                          to={`/tracks/${r.circuitId}`}
                          className="font-display text-[1.05rem] font-bold uppercase tracking-wide text-ink hover:text-accent"
                        >
                          {r.name}
                        </Link>
                      </td>
                      <td>
                        <div className="flex flex-col gap-1.5 sm:flex-row sm:gap-5">
                          {[...r.results]
                            .sort((a, b) => driverIds.indexOf(a.Driver.driverId) - driverIds.indexOf(b.Driver.driverId))
                            .map((x) => (
                            <span key={x.Driver.driverId} className="flex items-center gap-2">
                              {/^\d+$/.test(x.positionText) ? (
                                <Position value={x.position} />
                              ) : (
                                <span className="num inline-block w-9 text-center text-faint">{x.positionText}</span>
                              )}
                              <span className="text-sm text-muted">{x.Driver.code ?? x.Driver.familyName}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="num text-right font-bold text-ink">
                        {r.total > 0 ? r.total : <span className="text-faint">0</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCard>
        </>
      )}
    </section>
  );
}

export default function EcurieDetailPage() {
  const { constructorId } = useParams();
  const { season } = useSeason();
  const { data, loading, error, retry } = useFetch(`${API}/constructors/${constructorId}/`);

  const team = data?.MRData?.ConstructorTable?.Constructors?.[0];
  const color = constructorColor(team ?? { constructorId });
  const wiki = useWikiSummary(team?.url);

  if (loading) return <Loading rows={6} />;
  if (error || !team) {
    return (
      <div>
        <BackLink to="/teams">Toutes les écuries</BackLink>
        <Notice tone="error" onRetry={error ? retry : undefined}>
          {error ? `Erreur : ${error}` : "Écurie introuvable."}
        </Notice>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      <div>
        <BackLink to="/teams">Toutes les écuries</BackLink>

        <header className="relative overflow-hidden rounded-xl border border-line bg-surface animate-rise">
          <div
            className="absolute inset-0 opacity-20 dark:opacity-30"
            style={{ background: `linear-gradient(115deg, ${color} 0%, transparent 65%)` }}
          />
          <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
          <div className="speedlines absolute inset-0" />

          <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-8">
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl border border-line bg-canvas/60 p-4 sm:h-36 sm:w-36">
              <TeamImageWithFallback teamName={team.name} className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="kicker mb-2 flex items-center gap-2">
                <FlagImg nationality={team.nationality} />
                {team.nationality}
              </p>
              <h1 className="font-display text-5xl font-extrabold italic uppercase leading-[0.9] tracking-tight text-ink sm:text-7xl">
                {team.name}
              </h1>
            </div>
          </div>
        </header>
      </div>

      <CareerStats constructorId={constructorId} />

      <div className="grid gap-10 xl:grid-cols-[1fr_22rem]">
        <SeasonSection constructorId={constructorId} season={season} color={color} />
        <aside className="space-y-4 xl:pt-[3.75rem]">
          <WikiCard wiki={wiki.data} loading={wiki.loading} title="Histoire" />
        </aside>
      </div>
    </div>
  );
}
