import { useEffect, useState } from "react";
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

function EquipesPage() {
  const [view, setView] = useState("constructeurs");
  const { season } = useSeason();

  const [evolutionData, setEvolutionData] = useState([]);
  const [evolutionTeams, setEvolutionTeams] = useState([]);
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [errorEvolution, setErrorEvolution] = useState(null);

  const { data: constructorsData, loading: loadingConstructors, error: errorConstructors } = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/constructors/`
  );

  const { data: standingsData, loading: loadingStandings, error: errorStandings } = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/constructorStandings/`
  );

  const equipes = constructorsData?.MRData?.ConstructorTable?.Constructors ?? [];
  const classement = standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  const maxRound = Number(standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.round ?? 0);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvolution() {
      if (!maxRound) {
        setEvolutionData([]);
        setEvolutionTeams([]);
        setLoadingEvolution(false);
        setErrorEvolution(null);
        return;
      }

      setLoadingEvolution(true);
      setErrorEvolution(null);

      try {
        const roundRows = new Map();
        const teams = [];

        for (let round = 1; round <= maxRound; round += 1) {
          let json = null;

          for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
              const response = await fetch(
                `https://api.jolpi.ca/ergast/f1/${season}/${round}/constructorStandings/`
              );

              if (!response.ok) {
                continue;
              }

              json = await response.json();
              break;
            } catch {
              
            }
          }

          const standings = json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
          if (!standings || standings.length === 0) {
            continue;
          }

          const row = { round: `R${round}` };
          standings.forEach((team) => {
            const teamName = team?.Constructor?.name;
            if (!teamName) return;
            if (!teams.includes(teamName)) {
              teams.push(teamName);
            }
            row[teamName] = Number(team.points);
          });

          roundRows.set(round, row);
        }

        if (roundRows.size === 0) {
          throw new Error("Impossible de recuperer les standings par manche.");
        }

        const rows = [];
        const lastPointsByTeam = {};
        for (let i = 0; i < teams.length; i += 1) {
          lastPointsByTeam[teams[i]] = 0;
        }

        for (let round = 1; round <= maxRound; round += 1) {
          const row = roundRows.get(round) ?? { round: `R${round}` };

          teams.forEach((teamName) => {
            if (typeof row[teamName] === "number") {
              lastPointsByTeam[teamName] = row[teamName];
            } else {
              row[teamName] = lastPointsByTeam[teamName];
            }
          });

          rows.push(row);
        }

        if (!cancelled) {
          setEvolutionData(rows);
          setEvolutionTeams(teams);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorEvolution(error.message || "Erreur pendant le chargement de l'evolution.");
          setEvolutionData([]);
          setEvolutionTeams([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingEvolution(false);
        }
      }
    }

    fetchEvolution();

    return () => {
      cancelled = true;
    };
  }, [season, maxRound]);

  useEffect(() => {
    setEvolutionData([]);
    setEvolutionTeams([]);
    setErrorEvolution(null);
  }, [season]);

  const lineColors = [
    "#ef4444",
    "#3b82f6",
    "#22c55e",
    "#f59e0b",
    "#a855f7",
    "#06b6d4",
    "#e11d48",
    "#14b8a6",
    "#f97316",
    "#84cc16",
  ];

  
  

  return (
    <div>
      <PageHeader title="Equipes et Classement" description="Infos equipes et constructeurs en temps reel" />

      <ViewToggle
        views={[
          { label: "Constructeurs engages", value: "constructeurs" },
          { label: "Classement actuel", value: "classement" },
          { label: "Evolution du classement", value: "evolution" },
        ]}
        currentView={view}
        onViewChange={setView}
      />

      {view !== "evolution" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <table className="w-full">
            <thead>
              {view === "constructeurs" ? (
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Nom de l'equipe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Nationalite</th>
                </tr>
              ) : (
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Position</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Equipe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Points</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Victoires</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {view === "constructeurs"
                ? equipes.map((team, index) => (
                    <tr
                      key={team.constructorId}
                      className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 group-hover:text-red-600 text-black dark:text-white font-medium">
                        <div className="flex flex-row gap-2 items-center">
                          <TeamImageWithFallback teamName={team.name} className="w-8 h-8 object-contain" />
                          <span>{team.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 group-hover:text-red-600 text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
                        <div className="flex flex-row gap-2 items-center">
                          {getFlagImg(team.nationality) && (
                            <img src={getFlagImg(team.nationality)} alt={team.nationality} className="w-6 h-4 object-contain" />
                          )}
                          {team.nationality}
                        </div>
                      </td>
                    </tr>
                  ))
                : classement.length === 0
                  ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                          La saison n'a pas encore commence. Le classement sera disponible une fois que les courses auront debute.
                        </p>
                      </td>
                    </tr>
                    )
                  : classement.map((team, index) => (
                    <tr
                      key={team.Constructor.constructorId}
                      className="hover:bg-gray-50 group dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4 group-hover:text-red-600 text-gray-900 dark:text-gray-100 font-medium">{team.position}</td>
                      <td className="px-6 py-4 group-hover:text-red-600 text-gray-900 dark:text-gray-100 font-medium">
                        <div className="flex flex-row gap-2 items-center">
                          <TeamImageWithFallback teamName={team.Constructor.name} className="w-8 h-8 object-contain" />
                          <span>{team.Constructor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 group-hover:text-red-600 text-gray-900 dark:text-gray-100 font-medium">{team.points}</td>
                      <td className="px-6 py-4 group-hover:text-red-600 text-gray-900 dark:text-gray-100 font-medium">{team.wins}</td>
                    </tr>
                    ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "evolution" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Evolution du classement</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Evolution des points par equipe manche apres manche.</p>

          {evolutionData.length === 0 || evolutionTeams.length === 0 ? (
            <p className="mt-6 text-gray-600 dark:text-gray-400">Pas de donnees d'evolution disponibles pour cette saison.</p>
          ) : (
            <div className="mt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="round" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {evolutionTeams.map((teamName, index) => (
                    <Line
                      key={teamName}
                      type="monotone"
                      dataKey={teamName}
                      stroke={lineColors[index % lineColors.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
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
      `}</style>
    </div>
  );
}

export default EquipesPage;
