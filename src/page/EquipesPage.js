import { useEffect, useState } from "react";
import useFetch from "../hooks/useFetch";
import { apiFetch } from "../utils/api";
import { useSeason } from "../context/SeasonContext";
import PageHeader from "../composant/PageHeader";
import ViewToggle from "../composant/ViewToggle";
import { FlagImg, Loading, Notice, Position, TableCard, TeamName } from "../composant/RaceUI";
import { teamColor } from "../utils/teams";
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
  const [view, setView] = useState("classement");
  const { season } = useSeason();

  const [evolutionData, setEvolutionData] = useState([]);
  const [evolutionTeams, setEvolutionTeams] = useState([]);
  const [evolutionTeamNames, setEvolutionTeamNames] = useState({});


  const { data: constructorsData, loading: loadingTeams, error: errorTeams, retry: retryTeams } = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/constructors/`
  );

  const { data: standingsData, loading: loadingStandings, error: errorStandings, retry: retryStandings } = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/constructorStandings/`
  );

  const equipes = constructorsData?.MRData?.ConstructorTable?.Constructors ?? [];
  const classement = standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
  const maxRound = Number(standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]?.round ?? 0);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvolution() {
      try {
        if (maxRound <= 0) {
          if (!cancelled) {
            setEvolutionData([]);
            setEvolutionTeams([]);
            setEvolutionTeamNames({});
          }
          return;
        }

        const roundRows = new Map();
        const teamsSet = new Set();
        const teamNamesById = {};

        // All rounds go out together; the API layer paces them at 4 req/s
        const rounds = Array.from({ length: maxRound }, (_, i) => i + 1);
        const responses = await Promise.all(
          rounds.map((round) => apiFetch(`https://api.jolpi.ca/ergast/f1/${season}/${round}/constructorStandings/`))
        );

        for (let round = 1; round <= maxRound; round += 1) {
          const json = responses[round - 1];
          const constructorStandings =
            json?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
          if (constructorStandings.length === 0) {
            continue;
          }

          const row = { round: `R${round}` };
          constructorStandings.forEach((team) => {
            const teamId = team?.Constructor?.constructorId;
            const teamName = team?.Constructor?.name;
            if (!teamId) return;

            teamsSet.add(teamId);
            if (teamName) {
              teamNamesById[teamId] = teamName;
            }
            row[teamId] = Number(team.points);
          });
          roundRows.set(round, row);

        }

        if (roundRows.size === 0) {
          throw new Error("Impossible de recuperer les standings par manche.");
        }

        const rows = [];
        const teams = Array.from(teamsSet);
        const lastPointsByTeam = {};
        for (let i = 0; i < teams.length; i += 1) {
          lastPointsByTeam[teams[i]] = 0;
        }

        for (let round = 1; round <= maxRound; round += 1) {
          const row = roundRows.get(round) ?? { round: `R${round}` };

          teams.forEach((teamId) => {
            if (typeof row[teamId] === "number") {
              lastPointsByTeam[teamId] = row[teamId];
            } else {
              row[teamId] = lastPointsByTeam[teamId];
            }
          });

          rows.push(row);
        }

        if (!cancelled) {
          setEvolutionData(rows);
          setEvolutionTeams(teams);
          setEvolutionTeamNames(teamNamesById);
        }
      } catch (error) {
       console.error("Erreur lors de la recuperation de l'evolution du classement :", error);
      } finally {
        console.log("Fin de la tentative de recuperation de l'evolution du classement.");
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
    setEvolutionTeamNames({});
  }, [season]);

  const loading = loadingTeams || loadingStandings;
  const error = errorTeams || errorStandings;
  const leader = Number(classement[0]?.points ?? 0);

  const chartTheme = {
    grid: "rgb(var(--line))",
    axis: "rgb(var(--muted))",
  };

  return (
    <div className="pb-16">
      <PageHeader
        kicker={`Saison ${season}`}
        title="Équipes"
        description="Le championnat constructeurs, les écuries engagées et l'évolution des points manche après manche."
      />

      <ViewToggle
        views={[
          { label: "Classement", value: "classement" },
          { label: "Écuries engagées", value: "constructeurs" },
          { label: "Évolution", value: "evolution" },
        ]}
        currentView={view}
        onViewChange={setView}
      />

      {loading ? (
        <Loading rows={10} />
      ) : error ? (
        <Notice
          tone="error"
          onRetry={() => {
            if (errorTeams) retryTeams();
            if (errorStandings) retryStandings();
          }}
        >
          Erreur : {error}
        </Notice>
      ) : view === "constructeurs" ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {equipes.map((team, i) => (
            <li
              key={team.constructorId}
              className="panel relative flex items-center gap-4 overflow-hidden p-4 animate-rise"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: teamColor(team.constructorId) }} />
              <div className="min-w-0 flex-1">
                <TeamName constructor={team} />
              </div>
              <span className="flex items-center gap-2 text-sm text-muted">
                <FlagImg nationality={team.nationality} />
                {team.nationality}
              </span>
            </li>
          ))}
        </ul>
      ) : view === "classement" ? (
        classement.length === 0 ? (
          <Notice>La saison n'a pas encore commencé. Le classement apparaîtra après la première course.</Notice>
        ) : (
          <TableCard>
            <div className="overflow-x-auto">
              <table className="f1-table">
                <thead>
                  <tr>
                    <th className="w-16">Pos</th>
                    <th>Écurie</th>
                    <th className="w-[35%] hidden md:table-cell" />
                    <th className="hidden text-right sm:table-cell">Vict.</th>
                    <th className="hidden text-right sm:table-cell">Écart</th>
                    <th className="text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {classement.map((team) => {
                    const pts = Number(team.points);
                    return (
                      <tr key={team.Constructor.constructorId}>
                        <td>
                          <Position value={team.position} />
                        </td>
                        <td>
                          <TeamName constructor={team.Constructor} />
                        </td>
                        <td className="hidden md:table-cell">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${leader ? (pts / leader) * 100 : 0}%`,
                                backgroundColor: teamColor(team.Constructor.constructorId),
                              }}
                            />
                          </div>
                        </td>
                        <td className="num hidden text-right text-muted sm:table-cell">{team.wins}</td>
                        <td className="num hidden text-right text-muted sm:table-cell">{team.position === "1" ? "—" : `−${leader - pts}`}</td>
                        <td className="num text-right text-lg font-bold text-ink">{team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </TableCard>
        )
      ) : (
        <div className="panel p-4 sm:p-5 md:p-6 animate-rise">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="kicker mb-1">Points cumulés</p>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">
                Évolution du championnat
              </h2>
            </div>
            {maxRound > 0 && <span className="num shrink-0 whitespace-nowrap text-sm text-muted">{maxRound} manches</span>}
          </div>

          {maxRound === 0 ? (
            <p className="py-10 text-center text-muted">Pas encore de données d'évolution pour cette saison.</p>
          ) : evolutionData.length === 0 || evolutionTeams.length === 0 ? (
            <Loading rows={4} label="Chargement de l'évolution" />
          ) : (
            <div className="h-80 sm:h-[26rem]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolutionData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid stroke={chartTheme.grid} vertical={false} />
                  <XAxis
                    dataKey="round"
                    stroke={chartTheme.axis}
                    tickLine={false}
                    axisLine={{ stroke: chartTheme.grid }}
                    tick={{ fontFamily: "JetBrains Mono", fontSize: 12 }}
                  />
                  <YAxis
                    stroke={chartTheme.axis}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontFamily: "JetBrains Mono", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(var(--surface))",
                      border: "1px solid rgb(var(--line))",
                      borderRadius: 8,
                      fontFamily: "JetBrains Mono",
                      fontSize: 12,
                    }}
                    labelStyle={{ color: "rgb(var(--ink))", fontWeight: 700 }}
                    itemSorter={(item) => -item.value}
                  />
                  <Legend
                    iconType="plainline"
                    wrapperStyle={{ fontFamily: "Titillium Web", fontSize: 12, paddingTop: 12 }}
                  />
                  {evolutionTeams.map((teamId) => (
                    <Line
                      key={teamId}
                      type="monotone"
                      dataKey={teamId}
                      name={evolutionTeamNames[teamId] ?? teamId}
                      stroke={teamColor(teamId)}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EquipesPage;
