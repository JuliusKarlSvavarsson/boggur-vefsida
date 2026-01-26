import Image from "next/image";

type TeamCardProps = {
  name: string;
  role: string;
  imageSrc?: string;
};

export default function TeamCard({ name, role, imageSrc }: TeamCardProps) {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
      <div className="mb-3 flex items-center gap-3">
        <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-800">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={name}
              width={64}
              height={64}
              className="h-16 w-16 object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-300">
              Image placeholder
            </div>
          )}
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-50">{name}</h2>
          <p className="text-xs uppercase tracking-wide text-slate-400">{role}</p>
        </div>
      </div>
    </article>
  );
}
