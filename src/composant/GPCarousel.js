import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";

const FRENCH_TIME_ZONE = "Europe/Paris";

function getRaceDateTime(round) {
  return new Date(`${round.date}T${round.time || "00:00:00Z"}`);
}

function getRaceTimeLabel(round) {
  return formatInTimeZone(getRaceDateTime(round), FRENCH_TIME_ZONE, "HH:mm");
}

export default function GPCarousel({
  rounds,
  selectedRound,
  setSelectedRound,
  sessionView,
  setSessionView,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(4);

  useEffect(() => {
    const updateVisibleItems = () => {
      const width = window.innerWidth;
      if (width < 640) setVisibleItems(2);
      else if (width < 768) setVisibleItems(3);
      else if (width < 1024) setVisibleItems(4);
      else setVisibleItems(5);
    };

    updateVisibleItems();
    window.addEventListener("resize", updateVisibleItems);
    return () => window.removeEventListener("resize", updateVisibleItems);
  }, []);

  useEffect(() => {
    const today = new Date();
    const nextRound = rounds.find((round) => new Date(round.date) > today);

    if (nextRound) {
      setSelectedRound(nextRound.round);
      setSessionView("course");
      const index = rounds.findIndex((round) => round.round === nextRound.round);
      if (index !== -1) {
        setCurrentIndex(Math.max(0, index - Math.floor(visibleItems / 2)));
      }
    }
  }, [rounds, setSelectedRound, setSessionView, visibleItems]);

  const next = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, rounds.length - visibleItems));
  };

  const prev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const selectSession = (round, session) => {
    setSelectedRound(round.round);
    setSessionView(session);
  };

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < rounds.length - visibleItems;

  if (!rounds?.length) return null;

  return (
    <div className="relative flex items-center justify-center gap-2 w-full">
      <button
        onClick={prev}
        disabled={!canGoPrev}
        className={`z-10 flex-shrink-0 p-3 rounded-full transition-all ${
          canGoPrev
            ? "bg-white dark:bg-gray-800 shadow-lg hover:scale-110 border border-gray-200 dark:border-gray-600 cursor-pointer"
            : "bg-gray-100 dark:bg-gray-900 opacity-50 cursor-not-allowed"
        }`}
        aria-label="Grand Prix precedent"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      <div className="flex gap-3 justify-center items-stretch flex-1 min-w-0">
        {rounds.slice(currentIndex, currentIndex + visibleItems).map((round) => {
          const localTime = getRaceTimeLabel(round);
          const isSelected = selectedRound === round.round;
          const hasSprint = Boolean(round.Sprint);

          return (
            <div
              key={round.round}
              className={`px-4 py-3 rounded-lg font-semibold transition-all flex-1 min-w-0 text-center ${
                isSelected
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
              title={round.raceName}
            >
              <div className="text-sm font-bold truncate">
                {round.raceName.replace("Grand Prix", "GP")}
              </div>
              <div className="text-xs opacity-75 mt-1">
                R{round.round} - {new Date(round.date).toLocaleDateString("fr-FR")}
              </div>
              <div
                className={`text-xs mt-1 ${
                  isSelected ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Heure FR : {localTime}
              </div>

              <div className={`mt-3 grid gap-2 ${hasSprint ? "grid-cols-2" : "grid-cols-1"}`}>
                <button
                  onClick={() => selectSession(round, "course")}
                  className={`rounded-md px-2 py-1.5 text-xs font-bold transition ${
                    isSelected && sessionView === "course"
                      ? "bg-white text-red-600"
                      : "bg-white/75 text-gray-800 hover:bg-white dark:bg-gray-900/70 dark:text-gray-100 dark:hover:bg-gray-900"
                  }`}
                >
                  Course
                </button>

                {hasSprint && (
                  <button
                    onClick={() => selectSession(round, "sprint")}
                    className={`rounded-md px-2 py-1.5 text-xs font-bold transition ${
                      isSelected && sessionView === "sprint"
                        ? "bg-white text-red-600"
                        : "bg-white/75 text-gray-800 hover:bg-white dark:bg-gray-900/70 dark:text-gray-100 dark:hover:bg-gray-900"
                    }`}
                  >
                    Sprint
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={next}
        disabled={!canGoNext}
        className={`z-10 flex-shrink-0 p-3 rounded-full transition-all ${
          canGoNext
            ? "bg-white dark:bg-gray-800 shadow-lg hover:scale-110 border border-gray-200 dark:border-gray-600 cursor-pointer"
            : "bg-gray-100 dark:bg-gray-900 opacity-50 cursor-not-allowed"
        }`}
        aria-label="Grand Prix suivant"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1">
        {Array.from({ length: Math.ceil(rounds.length / visibleItems) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * visibleItems)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentIndex >= index * visibleItems &&
              currentIndex < (index + 1) * visibleItems
                ? "bg-red-600"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
            aria-label={`Aller au groupe ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
