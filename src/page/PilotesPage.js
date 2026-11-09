import { useState } from "react";
import useFetch from "../hooks/useFetch";
import { useSeason } from "../context/SeasonContext";
import PageHeader from "../composant/PageHeader";
import DriversEvolution from "../composant/DriversEvolution";
import ViewToggle from "../composant/ViewToggle";
import { DriverName, FlagImg, Loading, Notice, Position, TableCard, TeamName } from "../composant/RaceUI";
import { constructorColor } from "../utils/teams";

function age(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const now = new Date();
  let a = now.getFullYear() - d.getFullYear();
  if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a -= 1;
  return a;
}

function DriversTable({ pilotes }) {
  return (
    <TableCard>
      <div className="overflow-x-auto">
        <table className="f1-table">
          <thead>
            <tr>
              <th className="w-16">N°</th>
              <th>Pilote</th>
              <th className="hidden sm:table-cell">Nationalité</th>
              <th className="text-right">Naissance</th>
            </tr>
          </thead>
          <tbody>
            {pilotes.map((p) => (
              <tr key={p.driverId}>
                <td className="num text-muted">{p.permanentNumber ?? "—"}</td>
                <td>
                  <DriverName driver={p} showFlag={false} />
                  {p.code && <span className="num ml-2 text-xs text-faint">{p.code}</span>}
                </td>
                <td className="hidden sm:table-cell">
                  <span className="flex items-center gap-2 text-muted">
                    <FlagImg nationality={p.nationality} />
                    {p.nationality}
                  </span>
                </td>
                <td className="num text-right text-muted">
                  {p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString("fr-FR") : "—"}
                  {age(p.dateOfBirth) != null && <span className="ml-2 hidden text-faint sm:inline">({age(p.dateOfBirth)} ans)</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}

function StandingsTable({ standings }) {
  const leader = Number(standings[0]?.points ?? 0);
  return (
    <TableCard>
      <div className="overflow-x-auto">
        <table className="f1-table">
          <thead>
            <tr>
              <th className="w-16">Pos</th>
              <th>Pilote</th>
              <th className="hidden md:table-cell">Écurie</th>
              <th className="w-[28%] hidden lg:table-cell" />
              <th className="hidden text-right sm:table-cell">Vict.</th>
              <th className="hidden text-right sm:table-cell">Écart</th>
              <th className="text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s) => {
              const team = s.Constructors?.[0];
              const pts = Number(s.points);
              const pct = leader ? (pts / leader) * 100 : 0;
              return (
                <tr key={s.Driver.driverId}>
                  <td>
                    <Position value={s.position} />
                  </td>
                  <td>
                    <DriverName driver={s.Driver} constructor={team} />
                  </td>
                  <td className="hidden md:table-cell">
                    <TeamName constructor={team} />
                  </td>
                  <td className="hidden lg:table-cell">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-raised">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: constructorColor(team) }}
                      />
                    </div>
                  </td>
                  <td className="num hidden text-right text-muted sm:table-cell">{s.wins}</td>
                  <td className="num hidden text-right text-muted sm:table-cell">{s.position === "1" ? "—" : `−${leader - pts}`}</td>
                  <td className="num text-right text-lg font-bold text-ink">{s.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TableCard>
  );
}

export default function PilotesPage() {
  const [view, setView] = useState("classement");
  const { season } = useSeason();

  const pilotesReq = useFetch(`https://api.jolpi.ca/ergast/f1/${season}/drivers/`);
  const classementReq = useFetch(`https://api.jolpi.ca/ergast/f1/${season}/driverStandings/`);

  const loading = pilotesReq.loading || classementReq.loading;
  const error = pilotesReq.error || classementReq.error;

  const standingsList = classementReq.data?.MRData?.StandingsTable?.StandingsLists?.[0];
  const standings = standingsList?.DriverStandings ?? [];
  const maxRound = Number(standingsList?.round ?? 0);
  const scheduleReq = useFetch(view === "evolution" ? `https://api.jolpi.ca/ergast/f1/${season}/races/?limit=100` : null);
  const raceNames = Object.fromEntries(
    (scheduleReq.data?.MRData?.RaceTable?.Races ?? []).map((r) => [r.round, r.raceName.replace(" Grand Prix", "")])
  );
  // The API also lists drivers who only drove an FP1 or a qualifying session.
  // Keep the ones with a Grand Prix start, i.e. the ones in the championship standings
  // (before the first race, there are no standings: show the whole entry list).
  const racers = new Set(standings.map((s) => s.Driver.driverId));
  const pilotes = (pilotesReq.data?.MRData?.DriverTable?.Drivers ?? []).filter(
    (d) => racers.size === 0 || racers.has(d.driverId)
  );

  return (
    <div className="pb-16">
      <PageHeader
        kicker={`Saison ${season}`}
        title="Pilotes"
        description="Le classement du championnat et la grille complète de la saison."
      />

      <ViewToggle
        views={[
          { label: "Classement", value: "classement" },
          { label: "Pilotes engagés", value: "pilotes" },
          { label: "Évolution", value: "evolution" },
        ]}
        currentView={view}
        onViewChange={setView}
      />

      {loading ? (
        <Loading />
      ) : error ? (
        <Notice
          tone="error"
          onRetry={() => {
            if (pilotesReq.error) pilotesReq.retry();
            if (classementReq.error) classementReq.retry();
          }}
        >
          Erreur : {error}
        </Notice>
      ) : view === "pilotes" ? (
        <DriversTable pilotes={pilotes} />
      ) : view === "classement" ? (
        standings.length === 0 ? (
          <Notice>La saison n'a pas encore commencé. Le classement apparaîtra après la première course.</Notice>
        ) : (
          <StandingsTable standings={standings} />
        )
      ) : (
        <DriversEvolution season={season} standings={standings} maxRound={maxRound} raceNames={raceNames} />
      )}
    </div>
  );
}
