import { useEffect, useState, useRef } from "react";
import useFetch from "../hooks/useFetch";
import { ChevronLeft, ChevronRight } from "lucide-react"; 

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
      const futureRaces = races.filter((race) => new Date(race.date) >= today);
      setUpcomingRaces(futureRaces);
    }
  }, [data]);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const width = carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -width : width,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <p className="text-center py-4">Chargement...</p>;
  if (error) return <p className="text-center py-4 text-red-500">Erreur : {error}</p>;
  if (!upcomingRaces.length) return <p className="text-center py-4">Pas de course à venir</p>;

  return (
    <div className="w-full relative py-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
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
        className="flex overflow-x-auto scroll-smooth space-x-6 px-4 w-full hide-scrollbar"
      >
        {upcomingRaces.map((race, index) => {
          const isNext = index === 0; 
          return (
            <div
              key={race.round}
              className={`flex-shrink-0 w-80 p-6 rounded-xl shadow-lg border ${
                isNext
                  ? "bg-red-600 text-white border-red-700"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{race.raceName}</h3>
              <p className="text-sm mb-1">
                <span className="font-semibold">Circuit :</span> {race.Circuit.circuitName}
              </p>
              <p className="text-sm mb-1">
                <span className="font-semibold">Pays :</span> {race.Circuit.Location.country}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Date :</span>{" "}
                {new Date(race.date).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
