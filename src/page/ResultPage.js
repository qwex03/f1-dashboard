import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { apiFetch } from "../utils/api";
import GPCarousel from "../composant/GPCarousel";
import PageHeader from "../composant/PageHeader";
import ViewToggle from "../composant/ViewToggle";
import { useSeason } from "../context/SeasonContext";
import { DriverName, Loading, Notice, Position, TableCard, TeamName } from "../composant/RaceUI";

export default function ResultPage() {
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewMode, setViewMode] = useState("global");
  const [sessionView, setSessionView] = useState("course");
  const { season } = useSeason();

  const {
    data: racesData,
    loading: loadingRaces,
    error: errorRaces,
  } = useFetch(`https://api.jolpi.ca/ergast/f1/${season}.json`);

  const {
    data: resultsData,
    loading: loadingResults,
    error: errorResults,
  } = useFetch(
    selectedRound
      ? `https://api.jolpi.ca/ergast/f1/${season}/${selectedRound}/results.json`
      : null
  );

  const {
    data: sprintData,
    loading: loadingSprint,
    error: errorSprint,
  } = useFetch(
    selectedRound
      ? `https://api.jolpi.ca/ergast/f1/${season}/${selectedRound}/sprint.json`
      : null
  );

  const {
    data: standingsData,
    loading: loadingStandings,
    error: errorStandings,
  } = useFetch(`https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json`);

  const races = racesData?.MRData?.RaceTable?.Races ?? [];
  const selectedRace = races.find((r) => r.round === selectedRound);
  const results = resultsData?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];
  const sprintResults = sprintData?.MRData?.RaceTable?.Races?.[0]?.SprintResults ?? [];
  const [seasonResultRaces, setSeasonResultRaces] = useState([]);
  const [seasonSprintRaces, setSeasonSprintRaces] = useState([]);
  const [loadingSeasonResults, setLoadingSeasonResults] = useState(false);
  const [loadingSeasonSprints, setLoadingSeasonSprints] = useState(false);
  const [errorSeasonResults, setErrorSeasonResults] = useState(null);
  const [errorSeasonSprints, setErrorSeasonSprints] = useState(null);
  const standings =
    standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  useEffect(() => {
    let cancelled = false;

    async function fetchJsonWithRetry(url, retries = 2, delayMs = 300) {
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          return await apiFetch(url);
        } catch (error) {
          if (attempt === retries) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
      throw new Error("Unknown fetch error");
    }

    async function fetchPaginatedRaces(urlPath, resultKey) {
      const pageSize = 100;
      let offset = 0;
      let total = Infinity;
      const racesByRound = new Map();

      while (offset < total) {
        const json = await fetchJsonWithRetry(
          `https://api.jolpi.ca/ergast/f1/${season}/${urlPath}.json?limit=${pageSize}&offset=${offset}`
        );
        const mrData = json?.MRData ?? {};
        const pageRaces = mrData?.RaceTable?.Races ?? [];
        total = Number(mrData.total ?? 0);
        const currentLimit = Number(mrData.limit ?? pageSize);

        pageRaces.forEach((race) => {
          const existing = racesByRound.get(race.round);
          if (!existing) {
            racesByRound.set(race.round, {
              ...race,
              [resultKey]: [...(race[resultKey] ?? [])],
            });
            return;
          }

          existing[resultKey] = [
            ...(existing[resultKey] ?? []),
            ...(race[resultKey] ?? []),
          ];
        });

        if (currentLimit <= 0) break;
        offset += currentLimit;
      }

      return Array.from(racesByRound.values()).sort(
        (a, b) => Number(a.round) - Number(b.round)
      );
    }

    async function fetchAllSeasonResults() {
      setLoadingSeasonResults(true);
      setErrorSeasonResults(null);

      try {
        const mergedRaces = await fetchPaginatedRaces("results", "Results");
        if (!cancelled) {
          setSeasonResultRaces(mergedRaces);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorSeasonResults(err.message);
          setSeasonResultRaces([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSeasonResults(false);
        }
      }
    }

    async function fetchAllSeasonSprints() {
      setLoadingSeasonSprints(true);
      setErrorSeasonSprints(null);

      try {
        const mergedRaces = await fetchPaginatedRaces("sprint", "SprintResults");
        if (!cancelled) {
          setSeasonSprintRaces(mergedRaces);
        }
      } catch (err) {
        if (!cancelled) {
          setErrorSeasonSprints(null);
          setSeasonSprintRaces([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingSeasonSprints(false);
        }
      }
    }

    fetchAllSeasonResults();
    fetchAllSeasonSprints();

    return () => {
      cancelled = true;
    };
  }, [season]);

  const pointsByDriverByRound = new Map();
  const driversById = new Map();

  seasonResultRaces.forEach((race) => {
    race.Results?.forEach((r) => {
      const driverId = r.Driver.driverId;
      if (!pointsByDriverByRound.has(driverId)) {
        pointsByDriverByRound.set(driverId, {});
      }
      const byRound = pointsByDriverByRound.get(driverId);
      byRound[race.round] = Number(byRound[race.round] || 0) + Number(r.points || 0);

      if (!driversById.has(driverId)) {
        driversById.set(driverId, r.Driver);
      }
    });
  });

  seasonSprintRaces.forEach((race) => {
    race.SprintResults?.forEach((r) => {
      const driverId = r.Driver.driverId;
      if (!pointsByDriverByRound.has(driverId)) {
        pointsByDriverByRound.set(driverId, {});
      }
      const byRound = pointsByDriverByRound.get(driverId);
      byRound[race.round] = Number(byRound[race.round] || 0) + Number(r.points || 0);

      if (!driversById.has(driverId)) {
        driversById.set(driverId, r.Driver);
      }
    });
  });

  standings.forEach((s) => {
    if (!driversById.has(s.Driver.driverId)) {
      driversById.set(s.Driver.driverId, s.Driver);
    }
  });

  const driverIds =
    standings.length > 0
      ? standings.map((s) => s.Driver.driverId)
      : Array.from(driversById.keys()).sort((a, b) => {
          const totalA = Object.values(pointsByDriverByRound.get(a) || {}).reduce(
            (sum, p) => sum + Number(p || 0),
            0
          );
          const totalB = Object.values(pointsByDriverByRound.get(b) || {}).reduce(
            (sum, p) => sum + Number(p || 0),
            0
          );
          return totalB - totalA;
        });

  const hasSprintWeekend = Boolean(selectedRace?.Sprint || sprintResults.length);

  const constructorByDriver = new Map(
    standings.map((s) => [s.Driver.driverId, s.Constructors?.[0]])
  );

  const pointsClass = (p) => {
    // Heat scale: the more points scored that weekend, the hotter the cell
    if (p >= 25) return "bg-accent text-accent-ink font-bold";
    if (p >= 15) return "bg-accent/30 text-ink font-bold";
    if (p >= 8) return "bg-accent/10 text-ink";
    if (p > 0) return "text-ink";
    return "text-faint";
  };

  const renderResultsTable = (rows, emptyMessage) =>
    rows.length === 0 ? (
      <Notice>{emptyMessage}</Notice>
    ) : (
      <TableCard>
        <div className="overflow-x-auto">
          <table className="f1-table">
            <thead>
              <tr>
                <th className="w-16">Pos</th>
                <th>Pilote</th>
                <th className="hidden md:table-cell">Écurie</th>
                <th className="text-right">Temps</th>
                <th className="text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => {
                const finished = Boolean(r.Time?.time);
                return (
                  <tr key={`${r.Driver.driverId}-${r.position}-${index}`}>
                    <td>
                      <Position value={r.position} />
                    </td>
                    <td>
                      <DriverName driver={r.Driver} constructor={r.Constructor} />
                    </td>
                    <td className="hidden md:table-cell">
                      <TeamName constructor={r.Constructor} />
                    </td>
                    <td className={`num text-right ${finished ? (index === 0 ? "text-ink font-bold" : "text-muted") : "text-faint"}`}>
                      {r.Time?.time || r.status}
                    </td>
                    <td className="num text-right font-bold text-ink">
                      {Number(r.points) > 0 ? `+${r.points}` : <span className="text-faint">0</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TableCard>
    );

  const globalLoading = loadingRaces || loadingSeasonResults || loadingSeasonSprints || loadingStandings;
  const globalError = errorRaces || errorSeasonResults || errorSeasonSprints || errorStandings;
  const winner = results[0];

  return (
    <div className="pb-16">
      <PageHeader
        kicker={`Saison ${season}`}
        title="Résultats"
        description="Les points marqués à chaque Grand Prix, ou le classement complet d'une course."
      />

      <ViewToggle
        views={[
          { label: "Grille de la saison", value: "global" },
          { label: "Par Grand Prix", value: "gp" },
        ]}
        currentView={viewMode}
        onViewChange={setViewMode}
      />

      {viewMode === "global" &&
        (globalLoading ? (
          <Loading rows={12} label="Chargement de la vue globale" />
        ) : globalError ? (
          <Notice tone="error">Erreur : {globalError}</Notice>
        ) : driverIds.length === 0 ? (
          <Notice>La saison n'a pas encore commencé. Les points apparaîtront après les premières courses.</Notice>
        ) : (
          <TableCard>
            <div className="overflow-x-auto main-scrollbar">
              <table className="f1-table text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 min-w-[8.5rem] sm:min-w-[15rem]">Pilote</th>
                    {races.map((race) => (
                      <th key={race.round} className="min-w-[3.5rem] !px-1 text-center" title={race.raceName}>
                        <span className="block text-faint">R{race.round}</span>
                        <span className="block text-ink">
                          {race.Circuit?.Location?.country?.slice(0, 3).toUpperCase()}
                        </span>
                      </th>
                    ))}
                    <th className="sticky right-0 z-10 min-w-[4.5rem] text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {driverIds.map((driverId, rowIndex) => {
                    const driver =
                      driversById.get(driverId) ||
                      standings.find((s) => s.Driver.driverId === driverId)?.Driver;
                    const byRound = pointsByDriverByRound.get(driverId) || {};
                    const total = races.reduce((sum, race) => sum + Number(byRound[race.round] || 0), 0);

                    return (
                      <tr key={driverId}>
                        <td className="sticky left-0 z-10 bg-surface">
                          <span className="flex items-center gap-2">
                            <span className="num w-6 text-right text-xs text-faint">{rowIndex + 1}</span>
                            <DriverName
                              driver={driver}
                              constructor={constructorByDriver.get(driverId) ?? null}
                              showFlag={false}
                            />
                          </span>
                        </td>
                        {races.map((race) => {
                          const pts = byRound[race.round];
                          return (
                            <td key={`${driverId}-${race.round}`} className="!px-1 text-center">
                              {typeof pts === "number" ? (
                                <span className={`num inline-block min-w-[2.25rem] rounded px-1 py-1 ${pointsClass(pts)}`}>
                                  {pts}
                                </span>
                              ) : (
                                <span className="text-faint">·</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="num sticky right-0 z-10 bg-surface text-right text-base font-bold text-ink">
                          {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TableCard>
        ))}

      {viewMode === "gp" &&
        (loadingRaces ? (
          <Loading rows={2} />
        ) : errorRaces ? (
          <Notice tone="error">Erreur : {errorRaces}</Notice>
        ) : (
          <GPCarousel
            rounds={races}
            selectedRound={selectedRound}
            setSelectedRound={setSelectedRound}
            sessionView={sessionView}
            setSessionView={setSessionView}
          />
        ))}

      {viewMode === "gp" && selectedRound && (
        <section className="mt-6 sm:mt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="kicker mb-1">
                Manche {selectedRound} · {sessionView === "sprint" ? "Sprint" : "Course"}
              </p>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink sm:text-3xl md:text-4xl">
                <Link to={`/tracks/${selectedRace?.Circuit?.circuitId}`} className="hover:text-accent">
                  {selectedRace?.raceName}
                </Link>
              </h2>
            </div>
            {sessionView !== "sprint" && winner && (
              <p className="text-sm text-muted">
                Vainqueur ·{" "}
                <span className="font-display text-lg font-bold uppercase text-ink">
                  {winner.Driver.familyName}
                </span>
              </p>
            )}
          </div>

          {loadingResults ? (
            <Loading rows={10} />
          ) : errorResults ? (
            <Notice tone="error">Erreur : {errorResults}</Notice>
          ) : sessionView === "sprint" && hasSprintWeekend ? (
            loadingSprint ? (
              <Loading rows={8} />
            ) : errorSprint ? (
              <Notice>Les résultats du sprint ne sont pas encore disponibles.</Notice>
            ) : (
              renderResultsTable(sprintResults, "Le sprint n'a pas encore eu lieu.")
            )
          ) : (
            renderResultsTable(results, "Ce Grand Prix n'a pas encore eu lieu.")
          )}
        </section>
      )}
    </div>
  );
}
