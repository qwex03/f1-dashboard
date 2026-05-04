import { useEffect, useRef, useState } from "react";
import useFetch from "../hooks/useFetch";
import { ChevronLeft, ChevronRight, Clock, Flag, Trophy } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { getFlagImg } from "../utils/flags";

const FRENCH_TIME_ZONE = "Europe/Paris";

function getSessionDateTime(session) {
  return new Date(`${session.date}T${session.time || "00:00:00Z"}`);
}

function formatFrenchDate(session) {
  return formatInTimeZone(getSessionDateTime(session), FRENCH_TIME_ZONE, "dd/MM/yyyy");
}

function formatFrenchSession(session) {
  if (!session) return "N/A";

  const format = session.time ? "dd/MM/yyyy 'à' HH:mm" : "dd/MM/yyyy";
  return formatInTimeZone(getSessionDateTime(session), FRENCH_TIME_ZONE, format);
}

export default function NextGPCarousel() {
  const { data, loading, error } = useFetch(
    "https://api.jolpi.ca/ergast/f1/current/races/"
  );

  const [upcomingRaces, setUpcomingRaces] = useState([]);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (data) {
      const races = data?.MRData?.RaceTable?.Races || [];
      const today = new Date();
      const futureRaces = races.filter((race) => getSessionDateTime(race) >= today);
      setUpcomingRaces(futureRaces);
    }
  }, [data]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const cardWidth = 320 + 24;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -(cardWidth * 2) : cardWidth * 2,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <p className="text-center py-4">Chargement...</p>;
  if (error) return <p className="text-center py-4 text-red-500">Erreur : {error}</p>;
  if (!upcomingRaces.length) return <p className="text-center py-4">Pas de course à venir</p>;

  return (
    <div className="w-full relative py-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Prochains Grands Prix
      </h2>

      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <ChevronLeft className="h-6 w-6 text-gray-800 dark:text-white" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 p-2 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <ChevronRight className="h-6 w-6 text-gray-800 dark:text-white" />
      </button>

      <div
        ref={carouselRef}
        className="flex overflow-x-auto scroll-smooth space-x-6 px-4 w-full hide-scrollbar scroll-snap-type-x-mandatory"
      >
        {upcomingRaces.map((race, index) => {
          const isNext = index === 0;
          return (
            <div
              key={race.round}
              className={`flex-shrink-0 w-80 p-6 rounded-xl shadow-xl border transition-transform scroll-snap-align-start ${
                isNext
                  ? "bg-gradient-to-br from-red-600 to-red-800 text-white border-red-700"
                  : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              }`}
            >
              <h3 className="text-xl font-bold mb-3">{race.raceName}</h3>
              <p className="text-sm mb-2">
                <span className="font-semibold">Circuit :</span> {race.Circuit.circuitName}
              </p>
              <p className="text-sm mb-3 flex items-center">
                <span className="font-semibold mr-1">Pays :</span>
                {getFlagImg(race.Circuit.Location.country) && (
                  <img
                    src={getFlagImg(race.Circuit.Location.country)}
                    className="w-5 h-4 mr-2 rounded-sm"
                    alt={race.Circuit.Location.country}
                  />
                )}
                {race.Circuit.Location.country}
              </p>
              <p className="text-sm mb-4">
                <span className="font-semibold">Date :</span> {formatFrenchDate(race)}
              </p>
              <div className="text-sm space-y-2">
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-semibold">FP1 :</span>{" "}
                  {formatFrenchSession(race.FirstPractice)}
                </p>
                {race.Sprint ? (
                  <>
                    <p className="flex items-center">
                      <Flag className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-semibold">Qualif Sprint :</span>{" "}
                      {formatFrenchSession(race.Qualifying)}
                    </p>
                    <p className="flex items-center">
                      <Trophy className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-semibold">Sprint :</span>{" "}
                      {formatFrenchSession(race.Sprint)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-semibold">FP2 :</span>{" "}
                      {formatFrenchSession(race.SecondPractice)}
                    </p>
                    <p className="flex items-center">
                      <Flag className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="font-semibold">Qualif :</span>{" "}
                      {formatFrenchSession(race.Qualifying)}
                    </p>
                  </>
                )}
                <p className="flex items-center">
                  <Flag className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="font-semibold">Course :</span>{" "}
                  {formatFrenchSession(race)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
