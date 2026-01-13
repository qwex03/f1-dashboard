export default function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors hover:bg-red-700"
      >
        Précédent
      </button>

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 rounded-lg font-semibold transition-colors ${
              currentPage === page
                ? "bg-red-600 text-white"
                : "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors hover:bg-red-700"
      >
        Suivant
      </button>
    </div>
  );
}
