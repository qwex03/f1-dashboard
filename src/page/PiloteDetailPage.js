import { useParams, Link } from "react-router-dom";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import useFetch from "../hooks/useFetch";
import useWikiSummary from "../hooks/useWikiSummary";
import { useSeason } from "../context/SeasonContext";
import { API } from "../utils/api";
import { constructorColor, readableOn } from "../utils/teams";
import DriverImageWithFallback from "../composant/DriverImageWithFallback";
import { FlagImg, Loading, Notice, Position, TableCard, TeamName } from "../composant/RaceUI";
import { BackLink, SectionTitle, StatTile, WikiCard, total } from "../composant/DetailUI";

function age(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a -= 1;
  return a;
}

function CareerStats({ driverId }) {
  const base = `${API}/drivers/${driverId}`;
  const starts = useFetch(`${base}/results/?limit=1`);
  const wins = useFetch(`${base}/results/1/?limit=1`);
  const p2 = useFetch(`${base}/results/2/?limit=1`);
  const p3 = useFetch(`${base}/results/3/?limit=1`);
  const poles = useFetch(`${base}/qualifying/1/?limit=1`);
  const titles = useFetch(`${base}/driverStandings/1/?limit=30`);
  const seasons = useFetch(`${base}/seasons/?limit=100`);

  const titleYears = (titles.data?.MRData?.StandingsTable?.StandingsLists ?? []).map((s) => s.season);
  const seasonList = (seasons.data?.MRData?.SeasonTable?.Seasons ?? []).map((s) => s.season);
  const podiums =
    [wins, p2, p3].every((r) => r.data) ? total(wins.data) + total(p2.data) + total(p3.data) : undefined;

  return (
    <section>
      <SectionTitle kicker="Toute sa carrière en F1" title="Palmarès" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile
          label="Titres"
          value={titles.data ? titleYears.length : undefined}
          hint={titleYears.length ? titleYears.join(" · ") : null}
          loading={titles.loading}
        />
        <StatTile label="Victoires" value={total(wins.data)} loading={wins.loading} />
        <StatTile label="Podiums" value={podiums} loading={wins.loading || p2.loading || p3.loading} />
        <StatTile label="Poles" value={total(poles.data)} loading={poles.loading} />
        <StatTile label="Grands Prix" value={total(starts.data)} loading={starts.loading} />
        <StatTile
          label="Saisons"
          value={seasons.data ? seasonList.length : undefined}
          hint={seasonList.length ? `${seasonList[0]} – ${seasonList[seasonList.length - 1]}` : null}
          loading={seasons.loading}
        />
      </div>
    </section>
  );
}

function SeasonSection({ driverId, season }) {
  const resultsReq = useFetch(`${API}/${season}/drivers/${driverId}/results/?limit=100`);
  const standingReq = useFetch(`${API}/${season}/drivers/${driverId}/driverStandings/`);

  const races = resultsReq.data?.MRData?.RaceTable?.Races ?? [];
  const standing = standingReq.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0];
  const team = races[races.length - 1]?.Results?.[0]?.Constructor ?? standing?.Constructors?.[0];
  const color = constructorColor(team);

  if (resultsReq.loading || standingReq.loading) return <Loading rows={6} />;
  if (resultsReq.error) return <Notice tone="error" onRetry={resultsReq.retry}>Impossible de charger la saison : {resultsReq.error}</Notice>;
  if (!races.length) return <Notice>Aucun résultat en course pour la saison {season}.</Notice>;

  const rows = races.map((race) => {
    const r = race.Results[0];
    return {
      round: race.round,
      name: race.raceName.replace(" Grand Prix", ""),
      raceName: race.raceName,
      circuitId: race.Circuit.circuitId,
      grid: r.grid,
      position: r.position,
      classified: /^\d+$/.test(r.positionText),
      positionText: r.positionText,
      points: Number(r.points),
      status: r.status,
      constructor: r.Constructor,
    };
  });
  const best = rows.filter((r) => r.classified).reduce((m, r) => Math.min(m, Number(r.position)), Infinity);

  return (
    <section className="space-y-4">
      <SectionTitle
        kicker={`Saison ${season}`}
        title="Course par course"
        aside={team && <TeamName constructor={team} withLogo={false} />}
      />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Championnat" value={standing ? `P${standing.position}` : "—"} />
        <StatTile label="Points" value={standing?.points ?? rows.reduce((s, r) => s + r.points, 0)} />
        <StatTile label="Meilleur résultat" value={Number.isFinite(best) ? `P${best}` : "—"} />
      </div>

      <div className="panel p-4 sm:p-5">
        <p className="kicker mb-3">Points marqués par Grand Prix</p>
        <div className="h-48">
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
                formatter={(v, _n, item) => [`${v} pts · arrivée ${item.payload.positionText}`, ""]}
                separator=""
              />
              <Bar dataKey="points" radius={[3, 3, 0, 0]}>
                {rows.map((r) => (
                  <Cell key={r.round} fill={r.points > 0 ? color : "rgb(var(--line))"} />
                ))}
              </Bar>
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
                <th className="hidden text-right sm:table-cell">Grille</th>
                <th className="w-16 text-center">Arrivée</th>
                <th className="hidden md:table-cell">Statut</th>
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
                  <td className="num hidden text-right text-muted sm:table-cell">{r.grid === "0" ? "Stand" : r.grid}</td>
                  <td className="text-center">
                    {r.classified ? <Position value={r.position} /> : <span className="num text-faint">{r.positionText}</span>}
                  </td>
                  <td className="hidden text-sm text-muted md:table-cell">{r.status}</td>
                  <td className="num text-right font-bold text-ink">
                    {r.points > 0 ? r.points : <span className="text-faint">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    </section>
  );
}

export default function PiloteDetailPage() {
  const { driverId } = useParams();
  const { season } = useSeason();
  const { data, loading, error, retry } = useFetch(`${API}/drivers/${driverId}/`);
  const standingReq = useFetch(`${API}/${season}/drivers/${driverId}/driverStandings/`);

  const driver = data?.MRData?.DriverTable?.Drivers?.[0];
  const team = standingReq.data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]?.Constructors?.slice(-1)[0];
  const color = constructorColor(team);
  const wiki = useWikiSummary(driver?.url);

  if (loading) return <Loading rows={6} />;
  if (error || !driver) {
    return (
      <div>
        <BackLink to="/drivers">Tous les pilotes</BackLink>
        <Notice tone="error" onRetry={error ? retry : undefined}>
          {error ? `Erreur : ${error}` : "Pilote introuvable."}
        </Notice>
      </div>
    );
  }

  const years = age(driver.dateOfBirth);

  return (
    <div className="space-y-10 pb-16">
      <div>
        <BackLink to="/drivers">Tous les pilotes</BackLink>

        {/* Hero */}
        <header className="relative overflow-hidden rounded-xl border border-line bg-surface animate-rise">
          <div
            className="absolute inset-0 opacity-20 dark:opacity-30"
            style={{ background: `linear-gradient(115deg, ${color} 0%, transparent 60%)` }}
          />
          <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
          {driver.permanentNumber && (
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-10 right-2 font-display text-[10rem] font-extrabold italic leading-none text-ink/[0.07] sm:text-[16rem]"
            >
              {driver.permanentNumber}
            </span>
          )}

          <div className="relative flex flex-col gap-6 p-5 sm:flex-row sm:items-center sm:p-8">
            <div className="relative h-32 w-32 shrink-0 sm:h-44 sm:w-44">
              <div className="absolute inset-0 rounded-full" style={{ backgroundColor: `${color}40` }} />
              <DriverImageWithFallback
                driverName={driver.givenName}
                familyName={driver.familyName}
                className="relative h-full w-full rounded-full object-cover object-top"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {driver.code && <span className="tag bg-ink text-canvas">{driver.code}</span>}
                {driver.permanentNumber && (
                  <span className="tag" style={{ backgroundColor: color, color: readableOn(color) }}>
                    #{driver.permanentNumber}
                  </span>
                )}
              </div>
              <p className="mt-3 text-lg text-muted">{driver.givenName}</p>
              <h1 className="font-display text-5xl font-extrabold italic uppercase leading-[0.9] tracking-tight text-ink sm:text-7xl">
                {driver.familyName}
              </h1>
              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <dt className="sr-only">Nationalité</dt>
                  <FlagImg nationality={driver.nationality} />
                  <dd className="text-ink">{driver.nationality}</dd>
                </div>
                {driver.dateOfBirth && (
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Né le</dt>
                    <dd className="text-ink">
                      {new Date(driver.dateOfBirth).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {years != null && <span className="text-muted"> ({years} ans)</span>}
                    </dd>
                  </div>
                )}
                {team && (
                  <div className="flex gap-1.5">
                    <dt className="text-muted">Écurie {season}</dt>
                    <dd>
                      <Link to={`/teams/${team.constructorId}`} className="font-semibold text-ink hover:text-accent">
                        {team.name}
                      </Link>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </header>
      </div>

      <CareerStats driverId={driverId} />

      <div className="grid gap-10 xl:grid-cols-[1fr_22rem]">
        <SeasonSection driverId={driverId} season={season} />
        <aside className="space-y-4 xl:pt-[3.75rem]">
          <WikiCard wiki={wiki.data} loading={wiki.loading} title="Biographie" />
        </aside>
      </div>
    </div>
  );
}
