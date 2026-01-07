import useFetch from "../hooks/useFetch";
import { getFlagImg } from "../utils/flags";
import { useSeason } from "../context/SeasonContext";

export default function CircuitPage() {
  const { season } = useSeason();
  const { data, loading, error } = useFetch(
    `https://api.jolpi.ca/ergast/f1/${season}/races/`
  );

  const circuits = data?.MRData?.RaceTable?.Races ?? [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 px-2">
        <div className="w-1 h-10 bg-red-600 rounded-full"></div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
           Circuit
        </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Infos sur les circuits de la saison
        </p>
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-400">Chargement...</p>}
      {error && <p className="text-red-500">Erreur : {error}</p>}

      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  #
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Nom du circuit
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Pays
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {circuits.map((circuit, i) => (
                <tr
                  key={circuit.round}
                  className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors animate-fadeIn"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                    {circuit.round}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                    {circuit.Circuit.circuitName}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium flex items-center gap-2">
                    {getFlagImg(circuit.Circuit.Location.country) && (
                      <img
                        src={getFlagImg(circuit.Circuit.Location.country)}
                        alt={circuit.Circuit.Location.country}
                        className="w-6 h-4 object-contain"
                      />
                    )}
                    {circuit.Circuit.Location.country}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium">
                    {circuit.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
