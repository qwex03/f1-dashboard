import { useState } from "react";
import useRssFeed from "../hooks/useRssFeed";
import ArticleCard from "../composant/ArticleCard";
import Pagination from "../composant/Pagination";
import PageHeader from "../composant/PageHeader";

export default function ActuPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 9;

  const {
    items: articles,
    loading,
    error,
  } = useRssFeed("https://fr.motorsport.com/rss/f1/news/");

  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = articles.slice(startIndex, endIndex);

  if (loading) return <p>Chargement des actualités …</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="overflow-x-hidden">
        <PageHeader 
          title="Actualités F1 2025"
          description="Restez à jour avec les dernières nouvelles et analyses de la saison de Formule 1 2025."
        />

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currentArticles.map((article) => (
          <ArticleCard key={article.guid} article={article} />
        ))}
        </ul>

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />

    </div>           
    )
}
