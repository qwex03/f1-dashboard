import useFetch from "../hooks/useFetch";
import Top3Podium from "../composant/Top3Podium";
import NextGP from "../composant/NextGP";
import PageHeader from "../composant/PageHeader";
import { Loading, Notice } from "../composant/RaceUI";
import { useSeason } from "../context/SeasonContext";

export default function HomePage() {
  const { season } = useSeason();
  const { data, loading, error, retry } = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/driverstandings/`
  );

  const standingsList = data?.MRData?.StandingsTable?.StandingsLists?.[0];
  const standings = standingsList?.DriverStandings || [];
  const top3 = standings.slice(0, 3);

  return (
    <div className="space-y-12 pb-16">
      <PageHeader
        kicker={`Saison ${season}${standingsList?.round ? ` · après ${standingsList.round} manches` : ""}`}
        title="Tableau de bord"
        description="Le prochain départ, le haut du championnat et le calendrier — en un coup d'œil."
      />

      <NextGP />

      {loading ? (
        <Loading rows={3} />
      ) : error ? (
        <Notice tone="error" onRetry={retry}>Impossible de charger le classement : {error}</Notice>
      ) : (
        <Top3Podium
          top3={top3}
          displayedSeason={season}
          fallbackMessage={top3.length ? null : `La saison ${season} n'a pas encore commencé.`}
        />
      )}
    </div>
  );
}
