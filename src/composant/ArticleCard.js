export default function ArticleCard({ article }) {
  const isToday =
    new Date(article.pubDate).toLocaleDateString("fr-FR") ===
    new Date().toLocaleDateString("fr-FR");

  return (
    <li className="group overflow-hidden rounded-2xl dark:bg-gray-900 bg-white shadow-md transition hover:shadow-xl">
      {article.enclosure?.link && (
        <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
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

        {isToday && (
          <span className="text-xs font-semibold text-red-600">
            Publié aujourd'hui
          </span>
        )}
      </div>
    </li>
  );
}
