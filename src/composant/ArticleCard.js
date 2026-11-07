import { ArrowUpRight } from "lucide-react";

function stripHtml(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

export default function ArticleCard({ article, featured = false }) {
  const date = new Date(article.pubDate?.replace(" ", "T"));
  const isToday = date.toDateString() === new Date().toDateString();
  const image = article.enclosure?.link || article.thumbnail;

  return (
    <li className={`group ${featured ? "sm:col-span-2 lg:row-span-2" : ""}`}>
      <a
        href={article.link}
        target="_blank"
        rel="noreferrer"
        className="panel flex h-full flex-col overflow-hidden transition-colors hover:border-ink/30"
      >
        <div className={`relative overflow-hidden bg-raised ${featured ? "aspect-[16/9] lg:aspect-auto lg:flex-1" : "aspect-[16/9]"}`}>
          {image ? (
            <img
              src={image}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="speedlines grid h-full w-full place-items-center">
              <span className="font-display text-5xl font-extrabold italic uppercase text-ink/10">F1</span>
            </div>
          )}
          {isToday && <span className="tag absolute left-3 top-3 bg-accent text-accent-ink">Aujourd'hui</span>}
        </div>

        <div className={`flex flex-col gap-3 p-5 ${featured ? "lg:flex-none" : "flex-1"}`}>
          <p className="kicker text-[0.7rem]">
            {isNaN(date)
              ? ""
              : date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h3
            className={`font-display font-bold uppercase leading-[1.05] tracking-tight text-ink transition-colors group-hover:text-accent ${
              featured ? "text-3xl lg:text-4xl" : "text-xl"
            }`}
          >
            {article.title}
          </h3>
          <p className="line-clamp-3 text-sm text-muted">{stripHtml(article.description)}</p>
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-ink">
            Lire l'article
            <ArrowUpRight size={16} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>
    </li>
  );
}
