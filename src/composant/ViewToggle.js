import React from "react";

export default function ViewToggle({ views, currentView, onViewChange }) {
  return (
    <div
      role="tablist"
      className="mb-6 flex w-full gap-6 overflow-x-auto border-b border-line hide-scrollbar"
    >
      {views.map((view) => {
        const active = currentView === view.value;
        return (
          <button
            key={view.value}
            role="tab"
            aria-selected={active}
            onClick={() => onViewChange(view.value)}
            className={`relative -mb-px whitespace-nowrap pb-3 pt-1 font-display text-lg font-semibold uppercase tracking-wide transition-colors ${
              active ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {view.label}
            <span
              className={`absolute inset-x-0 bottom-0 h-[3px] bg-accent transition-transform origin-left ${
                active ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
