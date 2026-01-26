import Image from "next/image";
import Button from "@/components/Button";

type HeroBannerProps = {
  title: string;
  subtitle: string;
  imageSrc?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
};

export default function HeroBanner({
  title,
  subtitle,
  imageSrc = "/images/hero/hero-banner.jpg",
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
}: HeroBannerProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-surface shadow-md">
      <div className="relative h-[22rem] w-full sm:h-[24rem] lg:h-[26rem]">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            width={1600}
            height={600}
            className="h-full w-full object-cover opacity-70 mix-blend-multiply"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-primary/30 via-primary/20 to-secondary/30 text-sm text-slate-100">
            Hero image placeholder
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/30 to-transparent" />
        <div className="absolute inset-y-0 inset-x-0 flex items-center">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:px-8 lg:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Boggur 2.0
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm text-slate-100/90 sm:text-base">
              {subtitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {ctaHref && ctaLabel && <Button href={ctaHref}>{ctaLabel}</Button>}
              {secondaryCtaHref && secondaryCtaLabel && (
                <Button href={secondaryCtaHref} variant="secondary">
                  {secondaryCtaLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
