import Image from "next/image";

type ProjectCardProps = {
  name: string;
  location: string;
  status: string;
  description?: string;
  imageSrc?: string;
};

export default function ProjectCard({ name, location, status, description, imageSrc }: ProjectCardProps) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition hover:border-primary hover:shadow-lg">
      <div className="mb-3 overflow-hidden rounded-md border border-slate-800 bg-slate-900">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={name}
            width={640}
            height={360}
            className="h-40 w-full object-cover sm:h-48"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-slate-800 text-xs text-slate-300 sm:h-48">
            Image placeholder
          </div>
        )}
      </div>
      <header className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-50">{name}</h3>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-300">
          {status}
        </span>
      </header>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
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
