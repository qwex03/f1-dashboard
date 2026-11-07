export default function PageHeader({ title, description, kicker, actions }) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between animate-rise">
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
        {description && <p className="mt-3 max-w-2xl text-base text-muted">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
