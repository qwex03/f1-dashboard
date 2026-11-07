export default function PageHeader({ title, description, kicker, actions }) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-line pb-5 md:mb-8 md:pb-6 md:flex-row md:items-end md:justify-between animate-rise">
      <div className="min-w-0">
        {kicker && (
          <p className="kicker mb-2 flex items-center gap-2 text-accent">
            <span className="inline-block h-[3px] w-6 bg-accent" />
            {kicker}
          </p>
        )}
        <h1 className="font-display text-4xl font-extrabold italic uppercase leading-[0.95] tracking-tight text-ink md:text-6xl">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted sm:mt-3 sm:text-base">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
