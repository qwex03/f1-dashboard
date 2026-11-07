import { useState } from "react";
import useRssFeed from "../hooks/useRssFeed";
import ArticleCard from "../composant/ArticleCard";
import Pagination from "../composant/Pagination";
import PageHeader from "../composant/PageHeader";
import { Notice } from "../composant/RaceUI";

const PER_PAGE = 9;

function CardsSkeleton() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Chargement des actualités">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="panel overflow-hidden">
          <div className="aspect-[16/9] animate-pulse bg-raised" />
          <div className="space-y-3 p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-raised" />
            <div className="h-5 w-full animate-pulse rounded bg-raised" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-raised" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ActuPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const { items: articles, loading, error } = useRssFeed("https://fr.motorsport.com/rss/f1/news/");

  const totalPages = Math.ceil(articles.length / PER_PAGE);
  const start = (currentPage - 1) * PER_PAGE;
  const currentArticles = articles.slice(start, start + PER_PAGE);

  return (
    <div className="pb-16">
      <PageHeader
        kicker="Paddock · via Motorsport.com"
        title="Actualités"
        description="Les dernières nouvelles et analyses de la Formule 1."
      />

      {loading ? (
        <CardsSkeleton />
      ) : error ? (
        <Notice tone="error">Impossible de charger les actualités : {error}</Notice>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {currentArticles.map((article, i) => (
              <ArticleCard key={article.guid} article={article} featured={currentPage === 1 && i === 0} />
            ))}
          </ul>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
}
