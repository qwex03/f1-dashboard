import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";

function EquipesPage() {
  const [view, setView] = useState("constructeurs"); 

  const { data: constructorsData, loading: loadingConstructors, error: errorConstructors } = useFetch(
    "https://api.jolpi.ca/ergast/f1/2025/constructors/"
  );

  const { data: standingsData, loading: loadingStandings, error: errorStandings } = useFetch(
    "https://api.jolpi.ca/ergast/f1/2025/constructorStandings/"
  );

  const equipes = constructorsData?.MRData?.ConstructorTable?.Constructors ?? [];
  const classement = standingsData?.MRData?.StandingsTable?.StandingsLists[0]?.ConstructorStandings ?? [];

  if ((view === "constructeurs" && loadingConstructors) || (view === "classement" && loadingStandings)) 
    return <p className="text-gray-600 dark:text-gray-400">Chargement...</p>;
  
  if ((view === "constructeurs" && errorConstructors) || (view === "classement" && errorStandings))
    return <p className="text-red-500">Erreur : {view === "constructeurs" ? errorConstructors : errorStandings}</p>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Équipes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Infos équipes et constructeurs en temps réel
        </p>
      </div>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit shadow mb-4">
        <button
          onClick={() => setView("constructeurs")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === "constructeurs"
              ? "bg-red-600 dark:bg-gray-700 shadow text-white"
              : "bg-white-600 text-gray-600 dark:text-gray-400"
          }`}
        >
          Constructeurs engagés
        </button>

        <button
          onClick={() => setView("classement")}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            view === "classement"
              ? "bg-red-600 dark:bg-gray-700 shadow text-white"
              : "bg-white-600 text-gray-600 dark:text-gray-400"
          }`}
        >
          Classement actuel
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="w-full">
          <thead>
            {view === "constructeurs" ? (
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Nom de l'équipe
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Nationalité
                </th>
              </tr>
            ) : (
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Position
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Équipe
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Points
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Victoires
                </th>
              </tr>
            )}
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {view === "constructeurs"
              ? equipes.map((team, index) => (
                  <tr
                    key={team.constructorId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                      <div className="flex flex-row gap-1">
                        <img
                          src={`team-img/${team.name.toLowerCase().replace(/\s+/g, '')}.avif`}
                          alt={team.name}
                          className="inline-block mr-1 align-middle"
                        />
                        <span>{team.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <div className="flex flex-row gap-2 items-center">
                        {getFlagImg(team.nationality) && (
                          <img
                          src={getFlagImg(team.nationality)}
                          alt={team.nationality}
                          className="w-6 h-4 object-contain"
                          />
                        )}
                        {team.nationality}
                      </div>
                    </td>
                  </tr>
                ))
              : classement.map((team, index) => (
                  <tr
                    key={team.Constructor.constructorId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                      {team.position}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                      <div className="flex flex-row gap-1">
                        <img
                          src={`team-img/${team.Constructor.name.toLowerCase().replace(/\s+/g, '')}.avif`}
                          alt={team.Constructor.name}
                          className="inline-block mr-1 align-middle"
                        />
                        <span>{team.Constructor.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {team.points}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {team.wins}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

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
      `}</style>
    </div>
  );
}

export default EquipesPage;
