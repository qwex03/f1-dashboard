import { useEffect , useState } from "react";
import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";
import { useSeason } from "../context/SeasonContext";
import TeamImageWithFallback from "../composant/TeamImageWithFallback";
import PageHeader from "../composant/PageHeader";
import ViewToggle from "../composant/ViewToggle";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


export default function PilotesEtClassement() {
  const [view, setView] = useState("pilotes"); 
  const { season } = useSeason();

  const pilotesReq = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/drivers/`
  );
  const classementReq = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/driverStandings/`
  );

  const loading = pilotesReq.loading || classementReq.loading;
  const error = pilotesReq.error || classementReq.error;

  const pilotes = pilotesReq.data?.MRData?.DriverTable?.Drivers ?? [];
  const standings =
    classementReq.data?.MRData?.StandingsTable?.StandingsLists?.[0]
      ?.DriverStandings ?? [];

  return (
    <div className="space-y-8">

      <PageHeader 
        title="Pilotes et Classement"
        description="Infos pilotes et classement en temps réel"
      />

      <ViewToggle
        views={[
          { label: 'Pilotes engagés', value: 'pilotes' },
          { label: 'Classement actuel', value: 'classement' }
        ]}
        currentView={view}
        onViewChange={setView}
      />

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
                    className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn cursor-pointer"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">                       
                        {p.givenName} {p.familyName}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">                       
                        {p.dateOfBirth}
                    </td>
                   <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2 group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
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
          ) : standings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                La saison n'a pas encore commencé. Le classement sera disponible une fois que les courses auront débuté.
              </p>
            </div>
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
                    className={`group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn cursor-pointer ${
                      s.position === "1" ? "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20" :
                      s.position === "2" ? "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50" :
                      s.position === "3" ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20" : ""
                    }`}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
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
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                    <div className="flex items-center gap-2">
                        <TeamImageWithFallback
                          teamName={s.Constructors[0].name}
                          className="w-6 h-auto"
                        />
                        <span>{s.Driver.givenName} {s.Driver.familyName}</span>
                    </div>
                    </td>

                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
                      {s.points}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-semibold group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors">
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