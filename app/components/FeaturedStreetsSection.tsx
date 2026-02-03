"use client";

import { useState } from "react";
import Link from "next/link";
import StreetPreviewModal from "./StreetPreviewModal";

type FeaturedStreetBuilding = {
  id: string;
  slug: string;
  title: string;
  street_id: string;
  thumbnail: string | null;
  status: string | null;
  total_apartments: number;
  available_apartments: number;
  sold_apartments: number;
};

type FeaturedStreet = {
  id: string;
  name: string;
  image: string | null;
  total_apartments: number;
  available_apartments: number;
  sold_apartments: number;
  buildings: FeaturedStreetBuilding[];
};

type FeaturedStreetsSectionProps = {
  streets: FeaturedStreet[];
};

export default function FeaturedStreetsSection({ streets }: FeaturedStreetsSectionProps) {
  const [previewStreet, setPreviewStreet] = useState<FeaturedStreet | null>(null);

  if (!streets.length) {
    return (
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            Íbúðir í sölu
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Íbúðir Boggur birtast hér síðar.
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 lg:text-base lg:leading-snug">
            Bættu við götum í stjórnborðinu og merktu þær "Birta á forsíðu" til að
            sýna valin verkefni og íbúðir hér á forsíðunni.
          </p>
        </div>
      </section>
    );
  }

  const visibleStreets = streets.slice(0, 3);
  const gridColsClass =
    visibleStreets.length <= 1 ? "md:grid-cols-1 lg:grid-cols-1" : "md:grid-cols-2 lg:grid-cols-2";

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 space-y-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Íbúðir í sölu
            </h2>
            <p className="max-w-xl text-sm text-slate-500 lg:text-base lg:leading-snug">
              Byggingar í byggingu á vegum Böggs.
            </p>
          </div>
        </div>
        <div className={`grid gap-6 ${gridColsClass} lg:auto-rows-[minmax(0,1fr)]`}>
          {visibleStreets.map((street) => {
            const primaryBuilding = street.buildings[0] ?? null;
            const primaryHref = primaryBuilding
              ? `/building/${encodeURIComponent(primaryBuilding.slug)}?id=${encodeURIComponent(street.id)}`
              : "/building";

            return (
              <article
                key={street.id}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="relative w-full overflow-hidden bg-slate-100 aspect-[16/10] md:h-[260px] lg:h-[320px] xl:h-[360px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {street.image ? (
                    <img
                      src={street.image}
                      alt={street.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                      Engin mynd skilgreind fyrir þessa götu.
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 text-xs text-white">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold leading-tight sm:text-base">
                          {street.name}
                        </div>
                        <p className="mt-1 text-[11px] text-slate-200/90">
                          Íbúðir til sölu.
                        </p>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 sm:mt-0 sm:justify-end">
                        <span className="inline-flex items-center rounded-full bg-emerald-400/90 px-2 py-0.5 text-[10px] font-medium text-emerald-950">
                          {street.available_apartments} laus
                          {street.available_apartments === 1 ? "" : "ar"}
                        </span>
                        <span className="text-[11px] text-slate-100/90">
                          {street.total_apartments} íbúð
                          {street.total_apartments === 1 ? "" : "ir"}
                        </span>
                        {street.sold_apartments > 0 && (
                          <span className="text-[11px] text-slate-300">
                            • {street.sold_apartments} seld
                            {street.sold_apartments === 1 ? "" : "ar"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                      {street.name}
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Glæsileg og vel hönnuð raðhús á vinsælum stað í Hagaflöt. Húsin eru björt, rúmgóð og byggð með vönduðum efnum og nútímalegum lausnum.þægilegt og nútímalegt heimili í rólegu umhverfi.
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Link
                      href={primaryHref}
                      className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                    >
                      <span>Skoða íbúðir</span>
                      <span aria-hidden="true" className="ml-1">
                        →
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setPreviewStreet(street)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                    >
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-slate-400"
                      />
                      <span>Skoða á korti</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <StreetPreviewModal street={previewStreet} onClose={() => setPreviewStreet(null)} />
      </div>
    </section>
  );
}
