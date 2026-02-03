"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Building = {
  id: string;
  title: string;
  slug: string;
  street_id: string | null;
  thumbnail: string | null;
  status: string | null;
  is_featured: boolean;
  display_order: number | null;
  created_at: string;
};

type Street = {
  id: string;
  name: string;
  image: string | null;
  is_featured: boolean;
  featured_order: number | null;
  created_at: string;
};

export default function BuildingGridClient() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setIsLoading(true);
        const [buildingsRes, streetsRes] = await Promise.all([
          fetch("/api/buildings", { cache: "no-store" }),
          fetch("/api/streets", { cache: "no-store" }),
        ]);

        if (!buildingsRes.ok || !streetsRes.ok) {
          throw new Error("Failed to load buildings or streets");
        }

        const buildingsData = (await buildingsRes.json()) as Building[];
        const streetsData = (await streetsRes.json()) as Street[];

        setBuildings(buildingsData);
        setStreets(streetsData);
      } catch (e) {
        setError((e as Error).message ?? "Failed to load buildings");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, []);

  type PickerItem =
    | {
        kind: "street";
        building: Building;
        buildingCount: number;
        street: Street | null;
      }
    | { kind: "building"; building: Building };

  const items = useMemo<PickerItem[]>(() => {
    const streetMap = new Map<
      string,
      { building: Building; count: number }
    >();
    const soloBuildings: Building[] = [];

    const streetById = new Map<string, Street>(
      streets.map((s) => [s.id, s]),
    );

    for (const b of buildings) {
      if (b.street_id) {
        const existing = streetMap.get(b.street_id);
        if (!existing) {
          streetMap.set(b.street_id, { building: b, count: 1 });
        } else {
          existing.count += 1;
        }
      } else {
        soloBuildings.push(b);
      }
    }

    const streetItems: PickerItem[] = Array.from(streetMap.entries()).map(
      ([streetId, { building, count }]) => ({
        kind: "street" as const,
        building,
        buildingCount: count,
        street: streetById.get(streetId) ?? null,
      }),
    );

    const standaloneItems: PickerItem[] = soloBuildings.map((b) => ({
      kind: "building" as const,
      building: b,
    }));

    const all = [...streetItems, ...standaloneItems];

    all.sort((a, b) => {
      const aStreet = a.kind === "street" ? a.street : null;
      const bStreet = b.kind === "street" ? b.street : null;

      const aFeat =
        a.kind === "street"
          ? aStreet?.is_featured
            ? 1
            : 0
          : a.building.is_featured
            ? 1
            : 0;
      const bFeat =
        b.kind === "street"
          ? bStreet?.is_featured
            ? 1
            : 0
          : b.building.is_featured
            ? 1
            : 0;
      if (aFeat !== bFeat) return bFeat - aFeat; // featured first

      const aOrder =
        a.kind === "street"
          ? aStreet?.featured_order != null &&
            !Number.isNaN(aStreet.featured_order)
            ? aStreet.featured_order
            : Number.POSITIVE_INFINITY
          : a.building.display_order != null &&
              !Number.isNaN(a.building.display_order)
            ? a.building.display_order
            : Number.POSITIVE_INFINITY;
      const bOrder =
        b.kind === "street"
          ? bStreet?.featured_order != null &&
            !Number.isNaN(bStreet.featured_order)
            ? bStreet.featured_order
            : Number.POSITIVE_INFINITY
          : b.building.display_order != null &&
              !Number.isNaN(b.building.display_order)
            ? b.building.display_order
            : Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder; // lower order first, nulls last

      const aTime =
        a.kind === "street"
          ? new Date(aStreet?.created_at ?? a.building.created_at).getTime()
          : new Date(a.building.created_at).getTime();
      const bTime =
        b.kind === "street"
          ? new Date(bStreet?.created_at ?? b.building.created_at).getTime()
          : new Date(b.building.created_at).getTime();
      if (aTime !== bTime) return bTime - aTime; // newest first

      return a.building.title.localeCompare(b.building.title, "is", {
        sensitivity: "base",
      });
    });

    return all;
  }, [buildings, streets]);

  if (error) {
    return <p className="text-xs text-red-600">Villa: {error}</p>;
  }

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-slate-500">Sæki verkefni...</p>
      </div>
    );
  }

  if (!isLoading && buildings.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Engin verkefni í boði eins og er.
      </p>
    );
  }

  const [featured, ...rest] = items;
  const topSecondary = rest.slice(0, 2);
  const bottomSecondary = rest.slice(2);

  const renderCard = (
    item: (typeof items)[number],
    variant: "featured" | "secondary",
  ) => {
    const b = item.building;
    const isStreetProject = item.kind === "street";
    const street = item.kind === "street" ? item.street : null;
    const streetBuildingCount = item.kind === "street" ? item.buildingCount : 0;
    const imageHeightClass =
      variant === "featured" ? "h-72 sm:h-80" : "h-56 sm:h-64";
    const idParam = isStreetProject
      ? b.street_id ?? b.id
      : b.id;

    return (
      <Link
        key={b.id}
        href={`/building/${encodeURIComponent(b.slug)}?id=${encodeURIComponent(idParam)}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md"
      >
        <div className={`relative w-full overflow-hidden bg-slate-100 ${imageHeightClass}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {isStreetProject
            ? street?.image
              ? (
                  <img
                    src={street.image}
                    alt={street.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )
              : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                    Engin mynd
                  </div>
                )
            : b.thumbnail
              ? (
                  <img
                    src={b.thumbnail}
                    alt={b.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )
              : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                    Engin mynd
                  </div>
                )}
          <div className="pointer-events-none absolute left-3 top-3">
            <span className="inline-flex items-center rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-50">
              {isStreetProject ? "Gata" : "Stök bygging"}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1 px-3 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            {isStreetProject && street?.name ? street.name : b.title}
          </h2>
          {isStreetProject && streetBuildingCount > 1 && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>{streetBuildingCount} byggingar</span>
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] lg:items-stretch">
        <div>{renderCard(featured, "featured")}</div>

        {topSecondary.length > 0 && (
          <div className="space-y-4">
            {topSecondary.map((item) => renderCard(item, "secondary"))}
          </div>
        )}
      </div>

      {bottomSecondary.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          {bottomSecondary.map((item) => renderCard(item, "secondary"))}
        </div>
      )}

      <section className="mt-2 rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <h2 className="text-sm font-semibold text-slate-900">Næstu skref</h2>
        <p className="mt-1 text-xs text-slate-600 sm:text-sm">
          Skoðaðu íbúðir í verkefnum eða hafðu samband ef þú vilt fá ráðgjöf.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <Link
            href="/thjonustur"
            className="font-semibold text-slate-900 underline-offset-4 hover:underline hover:text-slate-700 transition-colors duration-200"
          >
            Skoða þjónustu
          </Link>
          <Link
            href="/hafa-samband"
            className="text-slate-600 underline-offset-4 hover:underline hover:text-slate-800 transition-colors duration-200"
          >
            Hafa samband
          </Link>
        </div>
      </section>
    </div>
  );
}
