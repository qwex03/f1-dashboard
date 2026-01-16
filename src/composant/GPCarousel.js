import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GPCarousel({ rounds, selectedRound, setSelectedRound }) {
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
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  useEffect(() => {
    if (selectedRound) {
      const index = rounds.findIndex(round => round.round === selectedRound);
      if (index !== -1) {
        setCurrentIndex(Math.max(0, index - Math.floor(visibleItems / 2)));
      }
    }
  }, [selectedRound, rounds, visibleItems]);

  const next = () => {
    setCurrentIndex(prev => 
      Math.min(prev + 1, rounds.length - visibleItems)
    );
  };

  const prev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
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
        aria-label="Grand Prix précédent"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      <div className="flex gap-3 justify-center items-center flex-1 min-w-0">
        {rounds.slice(currentIndex, currentIndex + visibleItems).map((round, index) => {
          return (
            <button
              key={round.round}
              onClick={() => setSelectedRound(round.round)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all whitespace-nowrap flex-1 min-w-0 text-center ${
                selectedRound === round.round
                  ? "bg-red-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
              title={round.raceName}
            >
              <div className="text-sm font-medium truncate">
                {round.raceName.replace('Grand Prix', 'GP')}
              </div>
              <div className="text-xs opacity-75 mt-1">
                R{round.round} • {new Date(round.date).toLocaleDateString('fr-FR')}
              </div>
            </button>
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
              currentIndex >= index * visibleItems && currentIndex < (index + 1) * visibleItems
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