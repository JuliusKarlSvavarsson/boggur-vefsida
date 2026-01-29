"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import StreetView from "./StreetView";
import BuildingLayoutView from "./BuildingLayoutView";

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
  street_svg_id?: string | null;
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
};

type BuildingDetailResponse = {
  building: Building;
  apartments: Apartment[];
};

function statusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "available") return "Laus";
  if (normalized === "sold") return "Seld";
  if (normalized === "reserved") return "Frátekin";
  return status;
}

export default function BuildingDetailClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get("id");
  const [streets, setStreets] = useState<Street[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<BuildingDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(
    null,
  );
  const infoPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setLoading(true);
        const [buildingsRes, streetsRes] = await Promise.all([
          fetch("/api/buildings", { cache: "no-store" }),
          fetch("/api/admin/streets", { cache: "no-store" }),
        ]);
        if (!buildingsRes.ok || !streetsRes.ok) {
          throw new Error("Failed to load building or street data");
        }
        const buildingsData = (await buildingsRes.json()) as Building[];
        const streetsData = (await streetsRes.json()) as Street[];
        setBuildings(buildingsData);
        setStreets(streetsData);
      } catch (e) {
        setError((e as Error).message ?? "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [slug]);

  const building = useMemo(() => {
    const byId = idFromQuery
      ? buildings.find((b) => b.id === idFromQuery) ?? null
      : null;
    if (byId) return byId;
    return buildings.find((b) => b.slug === slug) ?? null;
  }, [buildings, slug, idFromQuery]);

  const street = useMemo(
    () =>
      building
        ? streets.find((s) => s.id === building.street_id) ?? null
        : null,
    [streets, building],
  );
  const streetBuildings = useMemo(
    () =>
      street
        ? buildings.filter((b) => b.street_id === street.id)
        : [],
    [buildings, street],
  );

  const buildingId = building?.id;

  useEffect(() => {
    if (!buildingId || !building) {
      setDetail(null);
      setSelectedApartmentId(null);
      return;
    }

    const currentBuilding = building;
    const currentBuildingId = buildingId;

    async function loadDetail() {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const res = await fetch(
          `/api/admin/apartments?building_id=${encodeURIComponent(
            currentBuildingId,
          )}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Failed to load apartments for building");
        const apartmentsData = (await res.json()) as Apartment[];

        setDetail({ building: currentBuilding, apartments: apartmentsData });
        setSelectedApartmentId(null);
      } catch (e) {
        setDetailError((e as Error).message ?? "Failed to load details");
      } finally {
        setDetailLoading(false);
      }
    }

    void loadDetail();
  }, [buildingId, building]);

  useEffect(() => {
    if (!selectedApartmentId || !infoPanelRef.current) return;
    try {
      const el = infoPanelRef.current;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      // Small offset so the heading is nicely visible even with any sticky header
      const offset = 16;
      const startY = scrollY;
      const targetY = scrollY + rect.top - offset;
      const distance = targetY - startY;
      const duration = 600; // ms – longer duration for smoother motion
      const startTime = performance.now();

      const easeInOutQuad = (t: number) =>
        t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

      const step = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const eased = easeInOutQuad(t);
        window.scrollTo(0, startY + distance * eased);
        if (t < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    } catch {
      // ignore scrolling errors
    }
  }, [selectedApartmentId]);

  const selectedApartment = useMemo(
    () =>
      detail?.apartments.find((apt) => apt.id === selectedApartmentId) ?? null,
    [detail, selectedApartmentId],
  );

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Hleð húsi og götu...
      </p>
    );
  }

  if (!building) {
    return (
      <p className="text-sm text-red-600">
        Finn ekki hús með þessu slóðarheiti.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 items-start">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Hús
        </p>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 h-80 sm:h-96">
          {building.layout_image && detail?.apartments ? (
            <BuildingLayoutView
              layoutImageUrl={building.layout_image}
              buildingTitle={building.title}
              apartments={detail.apartments.map((apt) => ({
                id: apt.id,
                number: apt.number,
              }))}
              onApartmentClick={(apartmentId) =>
                setSelectedApartmentId((prev) =>
                  prev === apartmentId ? null : apartmentId,
                )
              }
            />
          ) : building.layout_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={building.layout_image}
              alt={building.title}
              className="h-full w-full object-contain"
            />
          ) : building.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={building.thumbnail}
              alt={building.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              Engin mynd eða uppdráttur skilgreindur fyrir þetta hús.
            </div>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-900">{building.title}</p>
        {building.description && (
          <p className="text-xs text-slate-600">{building.description}</p>
        )}
      </div>

      {street && (
        <StreetView
          streetImageUrl={street.image}
          streetName={street.name}
          streetSvgUrl={null}
          buildings={streetBuildings}
        />
      )}
      <div ref={infoPanelRef} className="space-y-2 md:col-span-2">
        <h2 className="text-sm font-semibold text-slate-900">
          Íbúðaupplýsingar
        </h2>
        <div
          className={`grid gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 ${
            selectedApartment ? "max-h-[900px] opacity-100" : "max-h-32 opacity-90"
          }`}
        >
          {!selectedApartment && !detailLoading && !detailError && (
            <p className="text-xs text-slate-500">
              Veldu íbúð í uppdrættinum til að sjá nánari upplýsingar.
            </p>
          )}
          {detailLoading && (
            <p className="text-xs text-slate-500">Hleð íbúðaupplýsingum...</p>
          )}
          {detailError && (
            <p className="text-xs text-red-600">Villa: {detailError}</p>
          )}
          {selectedApartment && (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary">
                    Íbúð {selectedApartment.number}
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {building.title}
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
                      <div className="flex h-40 items-center justify-center text-xs text-slate-400">
                        Enginn uppdráttur skilgreindur
                      </div>
                    )}
                  </div>
                </div>

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
    </div>
  );
}
