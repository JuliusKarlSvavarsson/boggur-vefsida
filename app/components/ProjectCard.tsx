type ProjectCardProps = {
  name: string;
  location: string;
  status: string;
  description?: string;
};

export default function ProjectCard({ name, location, status, description }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition hover:border-primary hover:shadow-lg">
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-50">{name}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
          {status}
        </span>
      </header>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">
        {location}
      </p>
      {description && (
        <p className="text-sm text-slate-300 line-clamp-3">
          {description}
        </p>
      )}
      {!description && (
        <p className="text-sm text-slate-400">
          Placeholder project description. Future version will show dynamic
          data from the Boggur admin panel and Neon database.
        </p>
      )}
    </article>
  );
}
