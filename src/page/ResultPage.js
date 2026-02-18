import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";
import GPCarousel from "../composant/GPCarousel";
import TeamImageWithFallback from "../composant/TeamImageWithFallback";
import PageHeader from "../composant/PageHeader";
import ViewToggle from "../composant/ViewToggle";
import { useSeason } from "../context/SeasonContext";

export default function ResultPage() {
  const [selectedRound, setSelectedRound] = useState(null);
  const [viewMode, setViewMode] = useState("global");
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
    data: standingsData,
    loading: loadingStandings,
    error: errorStandings,
  } = useFetch(`https://api.jolpi.ca/ergast/f1/${season}/driverStandings.json`);

  const races = racesData?.MRData?.RaceTable?.Races ?? [];
  const results = resultsData?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];
  const [seasonResultRaces, setSeasonResultRaces] = useState([]);
  const [loadingSeasonResults, setLoadingSeasonResults] = useState(false);
  const [errorSeasonResults, setErrorSeasonResults] = useState(null);
  const standings =
    standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

  useEffect(() => {
    let cancelled = false;

    async function fetchJsonWithRetry(url, retries = 2, delayMs = 300) {
      for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
          const res = await fetch(url);
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          return await res.json();
        } catch (error) {
          if (attempt === retries) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
      throw new Error("Unknown fetch error");
    }

    async function fetchAllSeasonResults() {
      setLoadingSeasonResults(true);
      setErrorSeasonResults(null);

      try {
        const pageSize = 100;
        let offset = 0;
        let total = Infinity;
        const racesByRound = new Map();

        while (offset < total) {
          const json = await fetchJsonWithRetry(
            `https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=${pageSize}&offset=${offset}`
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
                Results: [...(race.Results ?? [])],
              });
              return;
            }

            existing.Results = [...(existing.Results ?? []), ...(race.Results ?? [])];
          });

          if (currentLimit <= 0) break;
          offset += currentLimit;
        }

        const mergedRaces = Array.from(racesByRound.values()).sort(
          (a, b) => Number(a.round) - Number(b.round)
        );

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

    fetchAllSeasonResults();

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
      pointsByDriverByRound.get(driverId)[race.round] = Number(r.points);

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

  return (
    <div className="overflow-x-hidden">
      <PageHeader
        title={`Resultats des Grands Prix ${season}`}
        description="Cliquez sur un Grand Prix pour afficher le classement complet"
      />

      <ViewToggle
        views={[
          { label: "Vue globale", value: "global" },
          { label: "Vue par GP", value: "gp" },
        ]}
        currentView={viewMode}
        onViewChange={setViewMode}
      />

      {viewMode === "global" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mt-4">
          {loadingRaces || loadingSeasonResults || loadingStandings ? (
            <p className="text-gray-600">Chargement de la vue globale...</p>
          ) : errorRaces || errorSeasonResults || errorStandings ? (
            <p className="text-red-500">
              Erreur : {errorRaces || errorSeasonResults || errorStandings}
            </p>
          ) : driverIds.length === 0 ? (
            <p className="text-gray-600">
              La saison n'a pas encore commence. Les points apparaitront apres les premieres courses.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                    <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-900 px-4 py-3 text-left font-semibold dark:text-white min-w-56">
                      Pilote
                    </th>
                    {races.map((race) => (
                      <th
                        key={race.round}
                        className="px-3 py-3 text-center font-semibold dark:text-white min-w-28"
                        title={race.raceName}
                      >
                        {race.raceName.replace("Grand Prix", "GP")}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center font-semibold dark:text-white min-w-20">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {driverIds.map((driverId, rowIndex) => {
                    const driver =
                      driversById.get(driverId) ||
                      standings.find((s) => s.Driver.driverId === driverId)?.Driver;
                    const byRound = pointsByDriverByRound.get(driverId) || {};
                    const totalPoints = races.reduce(
                      (sum, race) => sum + Number(byRound[race.round] || 0),
                      0
                    );

                    return (
                      <tr
                        key={driverId}
                        className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                      >
                        <td className="sticky left-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 font-medium dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-6">
                              {rowIndex + 1}
                            </span>
                            {driver?.nationality && getFlagImg(driver.nationality) ? (
                              <img
                                src={getFlagImg(driver.nationality)}
                                className="w-6 h-4"
                                alt={driver.nationality}
                              />
                            ) : null}
                            <span>
                              {driver?.givenName} {driver?.familyName}
                            </span>
                          </div>
                        </td>

                        {races.map((race) => {
                          const pts = byRound[race.round];
                          return (
                            <td
                              key={`${driverId}-${race.round}`}
                              className="px-3 py-3 text-center dark:text-white"
                            >
                              {typeof pts === "number" ? pts : "-"}
                            </td>
                          );
                        })}

                        <td className="px-4 py-3 text-center font-bold dark:text-white">
                          {totalPoints}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewMode === "gp" &&
        (loadingRaces ? (
          <p className="text-gray-600">Chargement des Grands Prix...</p>
        ) : errorRaces ? (
          <p className="text-red-500">Erreur : {errorRaces}</p>
        ) : (
          <GPCarousel
            rounds={races}
            selectedRound={selectedRound}
            setSelectedRound={setSelectedRound}
          />
        ))}

      {viewMode === "gp" && selectedRound && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mt-4">
          {loadingResults && <p className="text-gray-600">Chargement des resultats...</p>}

          {errorResults && <p className="text-red-500">Erreur : {errorResults}</p>}

          {!loadingResults && !errorResults && (
            <>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                Resultats du GP {races.find((r) => r.round === selectedRound)?.raceName} {season}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Pos</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Pilote</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Ecurie</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Temps</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {results.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-6 text-center text-gray-600 dark:text-gray-300 font-medium"
                        >
                          Le Grand Prix n'a pas encore eu lieu
                        </td>
                      </tr>
                    ) : (
                      results.map((r, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 hover:text-red-600 group dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <td className="px-4 py-3 font-medium dark:text-white group-hover:text-red-600">
                            {r.position}
                          </td>

                          <td className="px-4 py-3 font-medium flex items-center gap-2 dark:text-white group-hover:text-red-600">
                            {getFlagImg(r.Driver.nationality) && (
                              <img
                                src={getFlagImg(r.Driver.nationality)}
                                className="w-6 h-4"
                                alt={r.Driver.nationality}
                              />
                            )}
                            {r.Driver.givenName} {r.Driver.familyName}
                          </td>

                          <td className="px-4 py-3 dark:text-white group-hover:text-red-600">
                            <div className="flex flex-row gap-2 items-center">
                              <TeamImageWithFallback
                                teamName={r.Constructor.name}
                                className="w-6 h-auto"
                              />
                              <span>{r.Constructor.name}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3 dark:text-white group-hover:text-red-600">
                            {r.Time?.time || r.status}
                          </td>
                          <td className="px-4 py-3 dark:text-white group-hover:text-red-600">
                            {r.points}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
