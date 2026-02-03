import Image from "next/image";

export function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/hero-project3.jpg"
          alt="Verkefni frá Böggur"
          fill
          sizes="100vw"
          priority
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/45 to-slate-950/10" />
      </div>
      <div className="relative mx-auto flex max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            Hafa samband
          </h1>
          <p className="text-sm text-slate-100/90 sm:text-base sm:leading-relaxed">
            Sendið okkur fyrirspurn eða hafið samband vegna verkefna og íbúða.
          </p>
        </div>
      </div>
    </section>
  );
}
