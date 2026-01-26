import Image from "next/image";

type ApartmentCardProps = {
  title: string;
  description: string;
  priceLabel: string;
  imageSrc?: string;
};

export default function ApartmentCard({ title, description, priceLabel, imageSrc }: ApartmentCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60 shadow-sm">
      <div className="overflow-hidden border-b border-slate-800 bg-slate-900">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
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
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base font-semibold text-slate-50">{title}</h3>
        <p className="flex-1 text-sm text-slate-300">{description}</p>
        <p className="text-sm font-semibold text-primary">{priceLabel}</p>
      </div>
    </article>
  );
}
