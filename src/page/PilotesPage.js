import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";

export default function PilotesEtClassement() {
  const [view, setView] = useState("pilotes"); 

  const pilotesReq = useFetch(
    "https://api.jolpi.ca/ergast/f1/2025/drivers/"
  );
  const classementReq = useFetch(
    "https://api.jolpi.ca/ergast/f1/current/driverStandings/"
  );

  const loading = pilotesReq.loading || classementReq.loading;
  const error = pilotesReq.error || classementReq.error;

  const pilotes = pilotesReq.data?.MRData?.DriverTable?.Drivers ?? [];
  const standings =
    classementReq.data?.MRData?.StandingsTable?.StandingsLists?.[0]
      ?.DriverStandings ?? [];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Pilotes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Infos pilotes et classement en temps réel
        </p>
      </div>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit shadow">
        <button
          onClick={() => setView("pilotes")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === "pilotes"
              ? "bg-red-600 dark:bg-gray-700 shadow text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          Pilotes engagés
        </button>

        <button
          onClick={() => setView("classement")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === "classement"
              ? "bg-red-600 dark:bg-gray-700 shadow text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          Classement actuel
        </button>
      </div>

      {loading && (
        <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
      )}
      {error && <p className="text-red-500">Erreur : {error}</p>}

      {!loading && !error && (
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn"
        >
          {view === "pilotes" ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Naissance
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Nationalité
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pilotes.map((p, i) => (
                  <tr
                    key={p.driverId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">                       
                        {p.givenName} {p.familyName}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">                       
                        {p.dateOfBirth}
                    </td>
                   <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
                    {getFlagImg(p.nationality) && (
                        <img
                        src={getFlagImg(p.nationality)}
                        alt={p.nationality}
                        className="w-6 h-4 object-contain"
                        />
                    )}
                    {p.nationality}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Position
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Pilote
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Points
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Victoires
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {standings.map((s, i) => (
                  <tr
                    key={s.Driver.driverId}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn ${
                      s.position === "1" ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20" :
                      s.position === "2" ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50" :
                      s.position === "3" ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" : ""
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                      <div className="flex items-center gap-3">
                        {s.position === "1" && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg animate-bounce-slow">
                              <span className="text-white font-bold text-lg">1</span>
                            </div>
                          </div>
                        )}
                        {s.position === "2" && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-gray-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 flex items-center justify-center shadow-lg animate-bounce-slow">
                              <span className="text-white font-bold text-lg">2</span>
                            </div>
                          </div>
                        )}
                        {s.position === "3" && (
                          <div className="relative">
                            <div className="absolute inset-0 bg-orange-400 rounded-full blur-md opacity-50 animate-pulse"></div>
                            <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-orange-300 via-orange-500 to-orange-700 flex items-center justify-center shadow-lg animate-bounce-slow">
                              <span className="text-white font-bold text-lg">3</span>
                            </div>
                          </div>
                        )}
                        {s.position !== "1" && s.position !== "2" && s.position !== "3" && (
                          <span className="w-10 text-center">{s.position}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                    <div className="flex items-center gap-2">
                        <img
                        src={`/team-img/${s.Constructors[0].name.toLowerCase().replace(/\s+/g, '')}.avif`}
                        alt={s.Constructors[0].name}
                        className="w-6 h-auto"
                        />
                        <span>{s.Driver.givenName} {s.Driver.familyName}</span>
                    </div>
                    </td>

                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                      {s.points}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold">
                      {s.wins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}