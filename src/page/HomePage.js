import useFetch from "../hooks/useFetch";
import Top3Podium from "../composant/Top3Podium";
import NextGP from "../composant/NextGP";

export default function HomeTop3() {
  const { data, loading, error } = useFetch(
    "https://api.jolpi.ca/ergast/f1/2025/driverstandings/"
  );

  if (loading) return <p className="text-center py-4">Chargement...</p>;
  if (error) return <p className="text-center py-4 text-red-500">Erreur : {error}</p>;

  const standings =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
  const top3 = standings.slice(0, 3);

  return (
    <div className="space-y-12 pb-16">
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-1 h-10 bg-red-600 rounded-full"></div>
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Bienvenue sur ApexF1
          </h1>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Le tableau de bord ultime pour les passionnés de Formule 1 !
        </p>
      </div>

      <div className="mx-auto">
        <Top3Podium top3={top3} />
        <NextGP />
      </div>
    </div>
  );
}
