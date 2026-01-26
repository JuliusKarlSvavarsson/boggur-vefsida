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
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-surface p-4 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-3 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
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
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-700">
          {status}
        </span>
      </header>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        {location}
      </p>
      {description && (
        <p className="text-sm text-slate-600 line-clamp-3">
          {description}
        </p>
      )}
      {!description && (
        <p className="text-sm text-slate-500">
          Placeholder project description. Future version will show dynamic
          data from the Boggur admin panel and Neon database.
        </p>
      )}
    </article>
  );
}
