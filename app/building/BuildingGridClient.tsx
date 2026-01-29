"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Building = {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
};

export default function BuildingGridClient() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const res = await fetch("/api/buildings", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load buildings");
        const data = (await res.json()) as Building[];
        setBuildings(data);
      } catch (e) {
        setError((e as Error).message ?? "Failed to load buildings");
      }
    }

    void load();
  }, []);

  if (error) {
    return <p className="text-xs text-red-600">Villa: {error}</p>;
  }

  if (buildings.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Engin hús eru skilgreind enn. Bættu við húsum í stjórnborðinu.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {buildings.map((b) => (
        <Link
          key={b.id}
          href={`/building/${encodeURIComponent(b.slug)}?id=${encodeURIComponent(b.id)}`}
          className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {b.thumbnail ? (
              <img
                src={b.thumbnail}
                alt={b.title}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                Engin mynd
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent p-2 text-xs text-white">
              <div className="font-semibold leading-tight">{b.title}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
