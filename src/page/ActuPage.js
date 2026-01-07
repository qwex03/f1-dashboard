import useRssFeed from "../hooks/useRssFeed";

export default function ActuPage() {
  const {
    items: articles,
    loading,
    error,
  } = useRssFeed("https://fr.motorsport.com/rss/f1/news/");

  if (loading) return <p>Chargement des actualités …</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="overflow-x-hidden">
        <div className="mb-6">
        <div className="flex items-center gap-3 px-2">
            <div className="w-1 h-10 bg-red-600 rounded-full"></div>
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Actualités F1 2025
            </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
            Restez à jour avec les dernières nouvelles et analyses de la saison de Formule 1 2025.
        </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
        <li
        key={article.guid}
        className="group overflow-hidden rounded-2xl dark:bg-gray-900 bg-white shadow-md transition hover:shadow-xl"
        >
        {article.enclosure?.link && (
            <div className="h-48 overflow-hidden">
            <img
                src={article.enclosure.link}
                alt={article.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />
            </div>
        )}

        <div className="flex flex-col gap-3 p-5">
            <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-semibold leading-snug text-gray-900 hover:text-red-600 dark:text-white dark:hover:text-red-400 transition-colors duration-300"
            >
            {article.title}
            </a>

            <p
            className="text-sm text-gray-600 line-clamp-3 dark:text-gray-400"
            dangerouslySetInnerHTML={{ __html: article.description }}
            />

            <p className="mt-auto text-xs text-gray-400">
            {new Date(article.pubDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            })}
            </p>

            {new Date(article.pubDate).toLocaleDateString("fr-FR") ===
          new Date().toLocaleDateString("fr-FR") && (
            <span className="text-xs font-semibold text-red-600">
              Publié aujourd’hui
            </span>
          )}
      </div>
    </li>
  ))}
</ul>

    </div>           
    )
}