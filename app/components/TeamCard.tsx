import Image from "next/image";

type TeamCardProps = {
  name: string;
  role: string;
  imageSrc?: string;
};

export default function TeamCard({ name, role, imageSrc }: TeamCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              width={64}
              height={64}
              className="h-16 w-16 object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
              Image placeholder
            </div>
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-900">{name}</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500">{role}</p>
        </div>
      </div>
    </article>
  );
}
