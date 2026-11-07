import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFlagImg } from "../utils/flags";

function raceTime(round) {
  return new Date(`${round.date}T${round.time || "00:00:00Z"}`);
}

export default function GPCarousel({
  rounds,
  selectedRound,
  setSelectedRound,
  sessionView,
  setSessionView,
}) {
  const stripRef = useRef(null);

  // Default to the most recent race that has been run (or the first one)
  useEffect(() => {
    if (!rounds?.length || selectedRound) return;
    const now = new Date();
    const past = rounds.filter((r) => raceTime(r) < now);
    const target = past[past.length - 1] ?? rounds[0];
    setSelectedRound(target.round);
    setSessionView("course");
  }, [rounds, selectedRound, setSelectedRound, setSessionView]);

  // Keep the selected round in view
  useEffect(() => {
    const el = stripRef.current?.querySelector(`[data-round="${selectedRound}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selectedRound]);

  const scroll = (dir) => stripRef.current?.scrollBy({ left: dir * 480, behavior: "smooth" });

  if (!rounds?.length) return null;
  const now = new Date();

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between">
        <p className="kicker">Choisir un Grand Prix</p>
        <div className="flex gap-1">
          <button onClick={() => scroll(-1)} className="btn-ghost h-8 w-8 px-0" aria-label="Grands Prix précédents">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll(1)} className="btn-ghost h-8 w-8 px-0" aria-label="Grands Prix suivants">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={stripRef} className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar snap-x">
        {rounds.map((round) => {
          const isSelected = selectedRound === round.round;
          const isFuture = raceTime(round) > now;
          const hasSprint = Boolean(round.Sprint);
          const flag = getFlagImg(round.Circuit?.Location?.country);

          return (
            <div
              key={round.round}
              data-round={round.round}
              className={`snap-start w-44 shrink-0 rounded-xl border p-3 transition-colors ${
                isSelected
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-line bg-surface text-ink hover:border-ink/30"
              } ${isFuture && !isSelected ? "opacity-55" : ""}`}
            >
              <button
                onClick={() => {
                  setSelectedRound(round.round);
                  setSessionView("course");
                }}
                className="block w-full text-left"
                title={round.raceName}
              >
                <span className="flex items-center justify-between">
                  <span className={`num text-xs ${isSelected ? "text-white/75" : "text-faint"}`}>
                    R{String(round.round).padStart(2, "0")}
                  </span>
                  {flag && <img src={flag} alt="" className="h-3 w-4 rounded-[2px]" />}
                </span>
                <span className="mt-1 block truncate font-display text-lg font-bold uppercase leading-tight tracking-tight">
                  {round.raceName.replace(" Grand Prix", "")}
                </span>
                <span className={`num block text-xs ${isSelected ? "text-white/75" : "text-muted"}`}>
                  {raceTime(round).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                </span>
              </button>

              {hasSprint && (
                <div className={`mt-3 grid grid-cols-2 gap-1 rounded-md p-0.5 ${isSelected ? "bg-black/20" : "bg-raised"}`}>
                  {[
                    ["course", "Course"],
                    ["sprint", "Sprint"],
                  ].map(([value, label]) => {
                    const active = isSelected && sessionView === value;
                    return (
                      <button
                        key={value}
                        onClick={() => {
                          setSelectedRound(round.round);
                          setSessionView(value);
                        }}
                        className={`rounded px-2 py-1 font-display text-xs font-bold uppercase tracking-wide transition-colors ${
                          active ? "bg-white text-black" : isSelected ? "text-white/80 hover:text-white" : "text-muted hover:text-ink"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
