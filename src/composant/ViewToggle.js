import React from 'react';

export default function ViewToggle({ views, currentView, onViewChange }) {
  return (
    <div className="flex gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit shadow mb-4">
      {views.map((view) => (
        <button
          key={view.value}
          onClick={() => onViewChange(view.value)}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            currentView === view.value
              ? "bg-red-600 dark:bg-gray-700 shadow text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}