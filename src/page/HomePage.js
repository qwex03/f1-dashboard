import useFetch from "../hooks/useFetch";
import Top3Podium from "../composant/Top3Podium";
import NextGP from "../composant/NextGP";
import PageHeader from "../composant/PageHeader";
import { useSeason } from "../context/SeasonContext";

export default function HomeTop3() {
  const { season } = useSeason();
  const { data, loading, error } = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/driverstandings/`
  );

  if (loading) return <p className="text-center py-4">Chargement...</p>;
  if (error) return <p className="text-center py-4 text-red-500">Erreur : {error}</p>;

  const standings =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  const top3 = standings.slice(0, 3);

  return (
    <div className="space-y-12 pb-16">
      <PageHeader 
        title="Bienvenue sur Apex F1"
        description="Le tableau de bord ultime pour les fans de Formule 1 !"
      />

      <div className="mx-auto">
        <Top3Podium top3={top3} />
        <NextGP />
      </div>
    </div>
  );
}
