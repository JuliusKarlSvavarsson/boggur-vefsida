import Image from "next/image";

type HeroBannerProps = {
  title: string;
  subtitle: string;
  imageSrc?: string;
};

export default function HeroBanner({
  title,
  subtitle,
  imageSrc = "/images/hero/hero-banner.jpg",
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
      <div className="relative h-56 w-full sm:h-72 lg:h-80">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            width={1600}
            height={600}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-slate-800 to-slate-900 text-sm text-slate-300">
            Hero image placeholder
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Boggur 2.0
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200 sm:text-base">
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
