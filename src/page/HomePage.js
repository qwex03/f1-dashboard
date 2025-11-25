import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";

export default function HomeTop3() {
  const { data, loading, error } = useFetch(
    "https://api.jolpi.ca/ergast/f1/2025/driverstandings/"
  );

  if (loading) return <p className="text-center py-4">Chargement...</p>;
  if (error) return <p className="text-center py-4 text-red-500">Erreur : {error}</p>;

  const standings =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

  const top3 = standings.slice(0, 3);

  const sizes = {
    1: "h-80 w-72",
    2: "h-64 w-56",
    3: "h-60 w-52",
  };

  const colors = {
    1: "from-yellow-300 to-yellow-500",
    2: "from-gray-300 to-gray-400",
    3: "from-orange-400 to-orange-600",
  };

  return (
    <div className="space-y-8">

      <div className="mb-20">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenue sur ApexF1
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Le tableau de bord ultime pour les passionnés de Formule 1 !
        </p>
      </div>

      <div className="mx-auto px-4 flex justify-between items-center mb-10">
        <h3 className="text-3xl font-bold dark:text-white">Top 3</h3>

        <Link
          to="/drivers"
          className="text-red-500 font-semibold hover:opacity-75 text-lg"
        >
          Voir le classement →
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 flex justify-center items-end gap-10">
        {top3.map((d) => {
          const driver = d.Driver;
          return (
            <div
              key={driver.driverId}
              className={`relative bg-gradient-to-b ${colors[d.position]} ${sizes[d.position]} rounded-2xl shadow-xl flex flex-col items-center justify-end p-4`}
            >
              <div className="absolute -top-14 w-36 h-36 bg-white rounded-full shadow-xl"></div>

              <img
                src={"/driver-img/" + driver.familyName + ".avif"}
                alt={driver.familyName}
                className="absolute -top-12 w-32 h-32 object-cover rounded-full border-4 border-white"
              />

              <p className="absolute top-2 right-3 text-xl font-bold text-white drop-shadow-lg">
                #{d.position}
              </p>

              <div className="mt-20 text-center text-white">
                <p className="text-xl font-semibold">
                  {driver.givenName} {driver.familyName}
                </p>
                <p className="opacity-90 text-sm">{d.points} pts</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
