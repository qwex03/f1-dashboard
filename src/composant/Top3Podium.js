import { Link } from "react-router-dom";
import { useSeason } from "../context/SeasonContext";
import DriverImageWithFallback from "./DriverImageWithFallback";

export default function Top3Podium({
  top3 = [],
  displayedSeason,
  fallbackMessage,
}) {
  const { season } = useSeason();
  const seasonToDisplay = displayedSeason ?? season;

  const sizes = {
    1: "h-64 w-60",
    2: "h-56 w-52",
    3: "h-52 w-48",
  };

  const colors = {
    1: "from-yellow-400 via-yellow-300 to-yellow-500",
    2: "from-slate-300 via-gray-200 to-slate-400",
    3: "from-amber-500 via-orange-400 to-orange-600",
  };

  const badges = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-4 md:p-6 border border-red-200 dark:border-red-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 px-1 md:px-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-600 rounded-full"></div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Podium {seasonToDisplay}
          </h3>
        </div>

        <Link
          to="/drivers"
          className="group flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Classement complet
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {fallbackMessage ? (
        <p className="mb-2 px-2 text-center text-sm font-medium text-red-700 dark:text-red-300">
          {fallbackMessage}
        </p>
      ) : null}

      {top3.length === 0 && !fallbackMessage ? (
        <p className="py-8 md:py-10 text-center text-gray-700 dark:text-gray-300">
          Le podium sera disponible apres le premier Grand Prix.
        </p>
      ) : null}

      {top3.length > 0 ? (
        <div className="flex justify-center items-end flex-wrap gap-4 md:gap-6 px-1 md:px-4">
          {top3.map((d) => {
            const driver = d.Driver;
            const isFirst = d.position === "1";

            return (
              <div
                key={driver.driverId}
                className={`relative ${sizes[d.position]} ${
                  isFirst ? "scale-105" : ""
                } transition-transform hover:scale-105 duration-300`}
              >
                <div
                  className={`h-full bg-gradient-to-br ${colors[d.position]} rounded-3xl shadow-2xl flex flex-col items-center justify-end p-4 border-4 ${
                    isFirst ? "border-yellow-300" : "border-white/50"
                  }`}
                >
                  <div className="absolute -top-12 w-32 h-32 bg-white dark:bg-gray-100 rounded-full shadow-2xl border-4 border-white"></div>

                  <DriverImageWithFallback
                    driverName={driver.givenName}
                    familyName={driver.familyName}
                    className="absolute -top-10 w-28 h-28 object-cover rounded-full border-4 border-white shadow-xl"
                  />

                  <div className="absolute -top-4 right-3 text-4xl">{badges[d.position]}</div>

                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
                    <p className="text-xs font-bold text-gray-800">P{d.position}</p>
                  </div>

                  <div className="mt-20 text-center text-white space-y-1 w-full">
                    <p className="text-xl font-bold drop-shadow-lg">{driver.familyName}</p>
                    <p className="text-base opacity-95 font-medium">{driver.givenName}</p>
                    <div className="mt-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 inline-block">
                      <p className="text-base font-bold">{d.points} pts</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
