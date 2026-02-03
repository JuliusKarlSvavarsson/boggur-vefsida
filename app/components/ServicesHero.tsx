import Image from "next/image";
import Link from "next/link";

export default function ServicesHero() {
  return (
    <section className="relative h-[55vh] min-h-[320px] w-full overflow-hidden bg-[#111827]">
        <Image
          src="/images/hero/hero-projects.jpg"
          alt="Þjónusta í framkvæmdum"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Bottom gradient only, no full overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 via-black/20 to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full items-end">
          <div className="mx-auto flex w-full max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
            <div className="max-w-xl space-y-4 text-slate-50">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Þjónusta
              </h1>
              <p className="text-sm text-slate-100/90 sm:text-base sm:leading-snug">
                Framkvæmdir, viðhald og endurbætur — allt frá smáverkum til heildarlausna.
              </p>
              <div className="h-px w-16 bg-[#d6d2c8]/80" />
              <Link
                href="/hafa-samband"
                className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline hover:text-primary-dark transition-colors duration-200"
              >
                Hafa samband
              </Link>
            </div>
          </div>
        </div>
      </section>
  );
}
