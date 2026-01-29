"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Street = {
  id: string;
  name: string;
  image: string | null;
};

type Building = {
  id: string;
  title: string;
  slug: string;
  street_id: string;
  description: string | null;
  thumbnail: string | null;
  layout_image: string | null;
  status: string | null;
};

type Apartment = {
  id: string;
  building_id: string;
  project_id: string | null;
  floor: number;
  number: string;
  status: string;
  size: number | null;
  rooms: number | null;
  layout_image: string | null;
  interior_images: string[] | null;
  parking_spot: string | null;
  x_position: number | null;
  y_position: number | null;
  width: number | null;
  height: number | null;
};

type BuildingDetailResponse = {
  building: Building;
  apartments: Apartment[];
};

function statusColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "available")
    return "bg-emerald-500/80 hover:bg-emerald-500";
  if (normalized === "sold") return "bg-red-500/80 hover:bg-red-500";
  return "bg-amber-400/80 hover:bg-amber-400";
}

function statusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "available") return "Laus";
  if (normalized === "sold") return "Seld";
  if (normalized === "reserved") return "Frátekin";
  return status;
}

export default function BuildingExplorer({
  initialSlug,
}: {
  initialSlug?: string;
}) {
  const [streets, setStreets] = useState<Street[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );
  const [detail, setDetail] = useState<BuildingDetailResponse | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStreets() {
      try {
        const res = await fetch("/api/streets", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load streets");
        const data: Street[] = await res.json();
        setStreets(data);
      } catch (e) {
        setError((e as Error).message ?? "Failed to load streets");
      }
    }

    void loadStreets();
  }, []);

  useEffect(() => {
    async function loadBuildings() {
      try {
        setError(null);
        const res = await fetch("/api/buildings", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to load buildings");
        const data: Building[] = await res.json();
        setBuildings(data);
        if (data.length > 0) {
          const fromSlug =
            initialSlug != null
              ? data.find((b) => b.slug === initialSlug)?.id ?? null
              : null;
          setSelectedBuildingId(
            (prev) => prev ?? fromSlug ?? data[0]?.id ?? null,
          );
        }
      } catch (e) {
        setError((e as Error).message ?? "Failed to load buildings");
      }
    }

    void loadBuildings();
  }, [initialSlug]);

  useEffect(() => {
    if (!selectedBuildingId) {
      setDetail(null);
      setSelectedApartmentId(null);
      return;
    }

    async function loadDetail() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/buildings/${selectedBuildingId}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to load building details");
        const data: BuildingDetailResponse = await res.json();
        setDetail(data);
        setSelectedApartmentId(null);
      } catch (e) {
        setError((e as Error).message ?? "Failed to load details");
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [selectedBuildingId]);

  const selectedStreet = useMemo(
    () => {
      const selectedBuilding =
        buildings.find((b) => b.id === selectedBuildingId) ?? null;
      if (!selectedBuilding) return null;
      return streets.find((s) => s.id === selectedBuilding.street_id) ?? null;
    },
    [streets, buildings, selectedBuildingId],
  );

  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId],
  );

  const selectedApartment = useMemo(
    () =>
      detail?.apartments.find((apt) => apt.id === selectedApartmentId) ?? null,
    [detail, selectedApartmentId],
  );

  return (
    <div className="space-y-8">
      {/* 1. Building selector (Type 2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Hús við {selectedStreet?.name ?? "götu"}
            </p>
            <p className="text-xs text-slate-600">
              Veldu hús til að sjá uppdrátt og íbúðir.
            </p>
          </div>
        </div>
        <div className="relative -mx-2 overflow-x-auto pb-2">
          <div className="flex gap-3 px-2">
            {buildings.map((building) => {
              const isActive = building.id === selectedBuildingId;
              return (
                <Link
                  key={building.id}
                  href={`/building/${encodeURIComponent(building.slug)}`}
                  className={`group flex min-w-[180px] max-w-[220px] flex-col overflow-hidden rounded-2xl border text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isActive
                      ? "border-primary/80 bg-primary/5"
                      : "border-slate-200 bg-white"
                  }`}
                  title={building.title}
                >
                  <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {building.thumbnail ? (
                      <img
                        src={building.thumbnail}
                        alt={building.title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[11px] text-slate-400">
                        Engin mynd
                      </div>
                    )}
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent transition-opacity ${
                        isActive
                          ? "opacity-80"
                          : "opacity-40 group-hover:opacity-60"
                      }`}
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2 text-xs text-white">
                      <div className="font-semibold leading-tight">
                        {building.title}
                      </div>
                      {building.status && (
                        <div className="text-[11px] text-slate-200">
                          {building.status}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
            {buildings.length === 0 && (
              <p className="text-xs text-slate-500">
                Engin hús skilgreind enn fyrir þessa götu.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 2. Building layout with clickable apartments (Type 1) and street image */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Uppdráttur húss
              </p>
              <p className="text-xs text-slate-600">
                Smelltu á íbúð í uppdrættinum til að sjá nánari upplýsingar.
              </p>
            </div>
            {selectedBuilding?.status && (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-50">
                {selectedBuilding.status}
              </span>
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {loading && (
              <div className="flex h-64 items-center justify-center text-xs text-slate-500">
                Hleð uppdrætti...
              </div>
            )}
            {!loading && !detail?.building?.layout_image && (
              <div className="flex h-64 items-center justify-center text-xs text-slate-500">
                Enginn uppdráttur skilgreindur fyrir þetta hús.
              </div>
            )}
            {!loading && detail?.building?.layout_image && (
              <div className="relative mx-auto max-w-3xl">
                {/* wrapper is relative so overlays use percentage-based positioning */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detail.building.layout_image!}
                  alt={detail.building.title}
                  className="w-full object-contain"
                />
                {detail.apartments.map((apt) => {
                  if (
                    apt.x_position == null ||
                    apt.y_position == null ||
                    apt.width == null ||
                    apt.height == null
                  ) {
                    return null;
                  }
                  const isSelected = apt.id === selectedApartmentId;
                  const color = statusColor(apt.status);
                  return (
                    <button
                      key={apt.id}
                      type="button"
                      onClick={() =>
                        setSelectedApartmentId((prev) =>
                          prev === apt.id ? null : apt.id,
                        )
                      }
                      style={{
                        position: "absolute",
                        left: `${apt.x_position}%`,
                        top: `${apt.y_position}%`,
                        width: `${apt.width}%`,
                        height: `${apt.height}%`,
                      }}
                      className={`group flex items-center justify-center rounded-sm border border-white/70 text-[10px] font-semibold text-white shadow-sm transition ${color} ${
                        isSelected
                          ? "ring-2 ring-offset-2 ring-offset-slate-900/40 ring-white"
                          : "opacity-80 hover:opacity-100"
                      }`}
                      title={`Íbúð ${apt.number} — ${apt.size ?? "?"} m²`}
                    >
                      <span className="pointer-events-none select-none drop-shadow">
                        {apt.number}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {selectedStreet && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Götu yfirlit
            </p>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {selectedStreet.image ? (
                <img
                  src={selectedStreet.image}
                  alt={selectedStreet.name}
                  className="h-40 w-full object-cover sm:h-56"
                />
              ) : (
                <div className="flex h-40 items-center justify-center text-xs text-slate-500">
                  Engin götumynd skilgreind fyrir þessa götu.
                </div>
              )}
            </div>
            <p className="text-xs text-slate-600">{selectedStreet.name}</p>
          </div>
        )}
      </div>

      {/* 4. Apartment detail slide-down panel */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Íbúðaupplýsingar
        </h2>
        <div
          className={`grid gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${
            selectedApartment ? "max-h-[900px] opacity-100" : "max-h-32 opacity-90"
          }`}
        >
          {!selectedApartment && (
            <p className="text-xs text-slate-500">
              Veldu íbúð í uppdrættinum til að sjá nánari upplýsingar.
            </p>
          )}
          {selectedApartment && (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary">
                    Íbúð {selectedApartment.number}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {selectedBuilding?.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Hæð {selectedApartment.floor}, {selectedApartment.rooms ?? "?"} herbergi, {" "}
                    {selectedApartment.size ?? "?"} m²
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-800">
                  {statusLabel(selectedApartment.status)}
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {/* Layout image */}
                <div className="space-y-2 md:col-span-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Uppdráttur íbúðar
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {selectedApartment.layout_image ? (
                      <img
                        src={selectedApartment.layout_image}
                        alt={`Íbúð ${selectedApartment.number}`}
                        className="h-40 w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center text-[11px] text-slate-400">
                        Enginn uppdráttur skilgreindur
                      </div>
                    )}
                  </div>
                </div>

                {/* Interior images carousel (simple) */}
                <div className="space-y-2 md:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Innanhúsmyndir
                  </p>
                  <div className="flex gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {selectedApartment.interior_images &&
                    selectedApartment.interior_images.length > 0 ? (
                      selectedApartment.interior_images.map((url) => (
                        <div
                          key={url}
                          className="relative h-32 w-40 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt="Innanhúsmynd"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center text-[11px] text-slate-400">
                        Engar innanhúsmyndir skilgreindar
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Parking and meta */}
              <div className="flex flex-col gap-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Bílastæði:</span>{" "}
                  {selectedApartment.parking_spot ?? "ekki skilgreint"}
                </div>
                <div className="text-slate-500">
                  Hægt verður að tengja þetta við bílageymslu-uppdrátt síðar.
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600">Villa: {error}</p>
      )}
    </div>
  );
}
