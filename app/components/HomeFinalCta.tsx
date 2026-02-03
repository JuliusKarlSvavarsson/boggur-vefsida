"use client";

import Link from "next/link";

export default function HomeFinalCta() {
  return (
    <section className="bg-[#e3e0d8] py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Hafa samband
          </h2>
          <p className="text-sm text-slate-600 sm:text-base sm:leading-snug">
            Hafðu samband ef þú hefur áhuga á íbúðum eða vilt ræða verkefni.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm sm:flex-row sm:gap-6">
            <Link
              href="/hafa-samband"
              className="font-semibold text-primary underline-offset-4 hover:underline hover:text-primary-dark transition-colors duration-200"
            >
              Hafa samband
            </Link>
            <Link
              href="/projects"
              className="text-slate-600 underline-offset-4 hover:underline hover:text-slate-800 transition-colors duration-200"
            >
              Skoða íbúðir
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
