import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { fr } from "date-fns/locale";
import useFetch from "../hooks/useFetch";
import useWikiSummary from "../hooks/useWikiSummary";
import { useSeason } from "../context/SeasonContext";
import { API } from "../utils/api";
import { getFlagImg } from "../utils/flags";
import { constructorColor } from "../utils/teams";
import { DriverName, Loading, Notice, TableCard, TeamName, TeamStripe } from "../composant/RaceUI";
import { BackLink, SectionTitle, StatTile, WikiCard } from "../composant/DetailUI";

const TZ = "Europe/Paris";

function at(session) {
  return new Date(`${session.date}T${session.time || "12:00:00Z"}`);
}

function sessionsOf(race) {
  return [
    ["Essais libres 1", race.FirstPractice],
    ["Essais libres 2", race.SecondPractice],
    ["Essais libres 3", race.ThirdPractice],
    ["Qualifs sprint", race.SprintQualifying ?? race.SprintShootout],
    ["Sprint", race.Sprint],
    ["Qualifications", race.Qualifying],
    ["Course", race],
  ]
    .filter(([, s]) => s?.date)
    .sort((a, b) => at(a[1]) - at(b[1]));
}

function tally(races, key) {
  const map = new Map();
  for (const race of races) {
    const r = race.Results[0];
    const item = key === "driver" ? r.Driver : r.Constructor;
    const id = key === "driver" ? item.driverId : item.constructorId;
    const prev = map.get(id) ?? { item, constructor: r.Constructor, count: 0, years: [] };
    prev.count += 1;
    prev.years.push(race.season);
    map.set(id, prev);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || b.years.at(-1) - a.years.at(-1)).slice(0, 5);
}

function Leaderboard({ title, rows, kind }) {
  const max = rows[0]?.count ?? 1;
  return (
    <TableCard className="p-0">
      <p className="kicker border-b border-line px-4 py-3">{title}</p>
      <ol>
        {rows.map((row, i) => (
          <li key={i} className="flex items-center gap-3 border-b border-line/70 px-4 py-3 last:border-0">
            <span className="num w-4 text-sm text-faint">{i + 1}</span>
            <div className="min-w-0 flex-1">
              {kind === "driver" ? (
                <DriverName driver={row.item} constructor={row.constructor} />
              ) : (
                <TeamName constructor={row.item} />
              )}
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-raised">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(row.count / max) * 100}%`, backgroundColor: constructorColor(row.constructor) }}
                />
              </div>
            </div>
            <span className="num text-xl font-bold text-ink">{row.count}</span>
          </li>
        ))}
      </ol>
    </TableCard>
  );
}

function SeasonRace({ race, winner }) {
  const now = Date.now();
  const done = at(race).getTime() + 3 * 36e5 < now;

  return (
    <section className={`panel overflow-hidden ${!done ? "border-accent/60" : ""}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${!done ? "bg-accent text-accent-ink" : "border-b border-line"}`}>
        <div>
          <p className={`font-display text-xs font-semibold uppercase tracking-[0.2em] ${!done ? "text-white/80" : "text-muted"}`}>
            Saison {race.season} · Manche {race.round}
          </p>
          <p className="font-display text-2xl font-bold uppercase tracking-tight">{race.raceName}</p>
        </div>
        <span className={`tag ${!done ? "bg-white text-black" : "bg-raised text-muted"}`}>{done ? "Terminé" : "À venir"}</span>
      </div>

      {done && winner ? (
        <div className="flex items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="kicker mb-1 text-[0.7rem]">Vainqueur</p>
            <DriverName driver={winner.Driver} constructor={winner.Constructor} />
          </div>
          <Link to="/results" className="btn-ghost h-9 text-xs">Tous les résultats</Link>
        </div>
      ) : (
        <ol className="divide-y divide-line/70">
          {sessionsOf(race).map(([label, s]) => {
            const past = at(s).getTime() < now;
            return (
              <li key={label} className={`flex items-center justify-between px-5 py-2.5 ${past ? "text-faint" : "text-ink"}`}>
                <span className="font-display text-sm font-semibold uppercase tracking-wide">{label}</span>
                <span className="num text-sm">
                  {formatInTimeZone(at(s), TZ, "EEE d MMM", { locale: fr })}{" "}
                  <span className="font-bold">{s.time ? formatInTimeZone(at(s), TZ, "HH:mm") : "—"}</span>
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export default function CircuitDetailPage() {
  const { circuitId } = useParams();
  const { season } = useSeason();

  const circuitReq = useFetch(`${API}/circuits/${circuitId}/`);
  const winnersReq = useFetch(`${API}/circuits/${circuitId}/results/1/?limit=100`);
  const seasonReq = useFetch(`${API}/${season}/races/`);

  const circuit = circuitReq.data?.MRData?.CircuitTable?.Circuits?.[0];
  const wiki = useWikiSummary(circuit?.url);

  const winners = useMemo(() => winnersReq.data?.MRData?.RaceTable?.Races ?? [], [winnersReq.data]);
  const seasonRace = seasonReq.data?.MRData?.RaceTable?.Races?.find((r) => r.Circuit.circuitId === circuitId);
  const topDrivers = useMemo(() => tally(winners, "driver"), [winners]);
  const topTeams = useMemo(() => tally(winners, "constructor"), [winners]);
  const recent = [...winners].reverse().slice(0, 10);

  if (circuitReq.loading) return <Loading rows={6} />;
  if (circuitReq.error || !circuit) {
    return (
      <div>
        <BackLink to="/tracks">Tous les circuits</BackLink>
        <Notice tone="error" onRetry={circuitReq.error ? circuitReq.retry : undefined}>
          {circuitReq.error ? `Erreur : ${circuitReq.error}` : "Circuit introuvable."}
        </Notice>
      </div>
    );
  }

  const { country, locality, lat, long } = circuit.Location;
  const flag = getFlagImg(country);
  const first = winners[0];
  const last = winners[winners.length - 1];
  const delta = 0.06;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${long - delta}%2C${lat - delta / 2}%2C${
    Number(long) + delta
  }%2C${Number(lat) + delta / 2}&layer=mapnik&marker=${lat}%2C${long}`;

  return (
    <div className="space-y-10 pb-16">
      <div>
        <BackLink to="/tracks">Tous les circuits</BackLink>

        <header className="relative overflow-hidden rounded-xl border border-line bg-surface animate-rise">
          <div className="speedlines absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
          <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <p className="kicker mb-2 flex items-center gap-2 text-accent">
                {flag && <img src={flag} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />}
                {locality} · {country}
              </p>
              <h1 className="font-display text-4xl font-extrabold italic uppercase leading-[0.92] tracking-tight text-ink sm:text-6xl">
                {circuit.circuitName}
              </h1>
              {seasonRace && (
                <p className="mt-3 text-muted">
                  Accueille le <span className="font-semibold text-ink">{seasonRace.raceName}</span> en {season}.
                </p>
              )}
            </div>
            {wiki.data?.image && (
              <div className="hidden overflow-hidden rounded-lg border border-line bg-white p-2 lg:block">
                <img src={wiki.data.image} alt={`Tracé ou vue du ${circuit.circuitName}`} className="h-44 w-72 object-contain" />
              </div>
            )}
          </div>
        </header>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Grands Prix" value={winnersReq.data ? winners.length : undefined} loading={winnersReq.loading} />
        <StatTile label="Première édition" value={first?.season} loading={winnersReq.loading} />
        <StatTile
          label="Dernier vainqueur"
          value={last ? last.Results[0].Driver.familyName : undefined}
          hint={last ? `${last.season} · ${last.Results[0].Constructor.name}` : null}
          loading={winnersReq.loading}
        />
        <StatTile
          label="Recordman"
          value={topDrivers[0] ? topDrivers[0].item.familyName : undefined}
          hint={
            topDrivers[0]
              ? `${topDrivers[0].count} victoire${topDrivers[0].count > 1 ? "s" : ""}${
                  topDrivers[1]?.count === topDrivers[0].count ? " · ex æquo" : ""
                }`
              : null
          }
          loading={winnersReq.loading}
        />
      </section>

      <div className="grid gap-10 xl:grid-cols-[1fr_24rem]">
        <div className="space-y-10">
          {winnersReq.loading ? (
            <Loading rows={8} />
          ) : winnersReq.error ? (
            <Notice tone="error" onRetry={winnersReq.retry}>
              Impossible de charger le palmarès : {winnersReq.error}
            </Notice>
          ) : winners.length === 0 ? (
            <Notice>Aucun Grand Prix n'a encore été couru sur ce circuit.</Notice>
          ) : (
            <>
              <section>
                <SectionTitle kicker="Palmarès" title="Les plus titrés ici" />
                <div className="grid gap-4 md:grid-cols-2">
                  <Leaderboard title="Pilotes" rows={topDrivers} kind="driver" />
                  <Leaderboard title="Écuries" rows={topTeams} kind="team" />
                </div>
              </section>

              <section>
                <SectionTitle kicker="Historique" title="Derniers vainqueurs" />
                <TableCard>
                  <div className="overflow-x-auto">
                    <table className="f1-table">
                      <thead>
                        <tr>
                          <th className="w-20">Année</th>
                          <th>Pilote</th>
                          <th className="hidden sm:table-cell">Écurie</th>
                          <th className="hidden text-right md:table-cell">Temps</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.map((race) => {
                          const r = race.Results[0];
                          return (
                            <tr key={race.season + race.round}>
                              <td className="num font-bold text-ink">{race.season}</td>
                              <td>
                                <DriverName driver={r.Driver} constructor={r.Constructor} />
                              </td>
                              <td className="hidden sm:table-cell">
                                <TeamName constructor={r.Constructor} />
                              </td>
                              <td className="num hidden text-right text-muted md:table-cell">{r.Time?.time ?? "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </TableCard>
              </section>
            </>
          )}
        </div>

        <aside className="space-y-4 xl:pt-[3.75rem]">
          {seasonRace && (
            <SeasonRace
              race={seasonRace}
              winner={winners.find((w) => w.season === String(season))?.Results?.[0]}
            />
          )}
          <WikiCard wiki={wiki.data} loading={wiki.loading} title="Le circuit" />
          <section className="panel overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="kicker">Localisation</p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${long}#map=14/${lat}/${long}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-accent"
              >
                Ouvrir la carte <ExternalLink size={12} />
              </a>
            </div>
            <iframe
              title={`Carte du ${circuit.circuitName}`}
              src={mapSrc}
              loading="lazy"
              className="h-56 w-full border-0 grayscale-[30%] dark:opacity-90"
            />
          </section>
          <div className="flex items-center gap-2 text-xs text-faint">
            <TeamStripe color="rgb(var(--accent))" />
            Statistiques calculées sur tous les Grands Prix courus ici depuis {first?.season ?? "1950"}.
          </div>
        </aside>
      </div>
    </div>
  );
}
