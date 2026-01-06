import { Link } from "react-router-dom";

export default function Top3Podium({ top3 }) {
  const sizes = {
    1: "h-80 w-72",
    2: "h-64 w-56",
    3: "h-60 w-52",
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
    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-2xl p-8 border border-red-200 dark:border-red-900">
      <div className="flex justify-between items-center mb-12 px-2">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-600 rounded-full"></div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
            Podium 2025
          </h3>
        </div>

        <Link
          to="/drivers"
          className="group flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          Classement complet
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      <div className="flex justify-center items-end gap-8 px-4">
        {top3.map((d) => {
          const driver = d.Driver;
          const isFirst = d.position === "1";

          return (
            <div
              key={driver.driverId}
              className={`relative ${sizes[d.position]} ${
                isFirst ? "scale-105" : ""
              } transition-transform hover:scale-110 duration-300`}
            >
              <div
                className={`h-full bg-gradient-to-br ${colors[d.position]} rounded-3xl shadow-2xl flex flex-col items-center justify-end p-6 border-4 ${
                  isFirst ? "border-yellow-300" : "border-white/50"
                }`}
              >
                <div className="absolute -top-16 w-40 h-40 bg-white dark:bg-gray-100 rounded-full shadow-2xl border-4 border-white"></div>

                <img
                  src={`/driver-img/${driver.familyName}.avif`}
                  alt={driver.familyName}
                  className="absolute -top-14 w-36 h-36 object-cover rounded-full border-4 border-white shadow-xl"
                />

                <div className="absolute -top-6 right-4 text-5xl">{badges[d.position]}</div>

                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                  <p className="text-sm font-bold text-gray-800">P{d.position}</p>
                </div>

                <div className="mt-24 text-center text-white space-y-2 w-full">
                  <p className="text-2xl font-bold drop-shadow-lg">{driver.familyName}</p>
                  <p className="text-lg opacity-95 font-medium">{driver.givenName}</p>
                  <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 inline-block">
                    <p className="text-lg font-bold">{d.points} pts</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
