import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="btn-ghost w-10 px-0"
        aria-label="Page précédente"
      >
        <ChevronLeft size={18} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={currentPage === page ? "page" : undefined}
          className={`h-10 w-10 rounded-lg font-mono text-sm tabular-nums transition-colors ${
            currentPage === page
              ? "bg-accent text-accent-ink"
              : "text-muted hover:bg-raised hover:text-ink"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="btn-ghost w-10 px-0"
        aria-label="Page suivante"
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
