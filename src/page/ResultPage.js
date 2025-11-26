import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";
import GPCarousel from "../composant/GPCarousel";

export default function ResultPage() {
  const [selectedRound, setSelectedRound] = useState(null);

  const { data: racesData, loading: loadingRaces, error: errorRaces } = useFetch(
    "https://api.jolpi.ca/ergast/f1/2025.json"
  );

  const { data: resultsData, loading: loadingResults, error: errorResults } = useFetch(
    selectedRound
      ? `https://api.jolpi.ca/ergast/f1/2025/${selectedRound}/results.json`
      : null
  );

  const races = racesData?.MRData?.RaceTable?.Races ?? [];
  const results = resultsData?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];

  return (
    <div className="overflow-x-hidden">
      <div className="mb-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-1 h-10 bg-red-600 rounded-full"></div>
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Résultats des Grands Prix 2025
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Cliquez sur un Grand Prix pour afficher le classement complet
        </p>
      </div>

      {loadingRaces ? (
        <p className="text-gray-600">Chargement des Grands Prix...</p>
      ) : errorRaces ? (
        <p className="text-red-500">Erreur : {errorRaces}</p>
      ) : (
        <GPCarousel
          rounds={races}
          selectedRound={selectedRound}
          setSelectedRound={setSelectedRound}
        />
      )}

      {selectedRound && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 mt-4">
          {loadingResults && (
            <p className="text-gray-600">Chargement des résultats...</p>
          )}

          {errorResults && (
            <p className="text-red-500">Erreur : {errorResults}</p>
          )}

          {!loadingResults && !errorResults && (
            <>
              <h2 className="text-2xl font-bold mb-4 dark:text-white">
                Résultats du GP {races.find(r => r.round === selectedRound)?.raceName}
              </h2>
              <div div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Pos</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Pilote</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Écurie</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold dark:text-white">Temps</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-6 text-center text-gray-600 dark:text-gray-300 font-medium"
                      >
                        Le Grand Prix n'a pas encore eu lieu
                      </td>
                    </tr>
                  ) : (
                    results.map((r, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                        style={{ animationDelay: `${index * 0.03}s` }}
                      >
                        <td className="px-4 py-3 font-medium dark:text-white">{r.position}</td>

                        <td className="px-4 py-3 font-medium flex items-center gap-2 dark:text-white">
                          {getFlagImg(r.Driver.nationality) && (
                            <img
                              src={getFlagImg(r.Driver.nationality)}
                              className="w-6 h-4"
                            />
                          )}
                          {r.Driver.givenName} {r.Driver.familyName}
                        </td>

                        <td className="px-4 py-3 dark:text-white">
                            <div className="flex flex-row gap-1">
                                <img
                                src={`team-img/${r.Constructor.name.toLowerCase().replace(/\s+/g, '')}.avif`}
                                alt={r.Constructor.name}
                                className="inline-block mr-1 align-middle"
                                />
                                <span>{r.Constructor.name}</span>
                            </div>
                        </td>

                        <td className="px-4 py-3 dark:text-white">
                          {r.Time?.time || r.status}
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
