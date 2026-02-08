"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import StreetView from "./StreetView";
import BuildingLayoutView from "./BuildingLayoutView";
import BuildingMinimap from "./BuildingMinimap";
import ApartmentDetailsPanel from "./ApartmentDetailsPanel";

type Street = {
  id: string;
  name: string;
  image: string | null;
};

type Building = {
  id: string;
  title: string;
  slug: string;
  street_id: string | null;
  description: string | null;
  thumbnail: string | null;
  layout_image: string | null;
  minimap_svg?: string | null;
  street_svg_id?: string | null;
  // Optional aggregates from /api/buildings
  total_apartments?: number | string | null;
  available_apartments?: number | string | null;
  sold_apartments?: number | string | null;
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

function resolveMinimapSvgUrl(building: Building | null, floor: number | null) {
  if (!building) return null;

  // Prefer an explicit minimap SVG path from the database when provided.
  if (typeof building.minimap_svg === "string") {
    let src = building.minimap_svg.trim();
    if (src) {
      src = src.replace(/\\/g, "/");
      const isHttp = src.startsWith("http://") || src.startsWith("https://");
      const isRootRelative = src.startsWith("/");
      if (!isHttp && !isRootRelative) {
        src = `/${src.replace(/^\/+/, "")}`;
      }
      return src;
    }
  }

  if (!building.slug) return null;
  const slug = building.slug;
  const basePath = `/images/buildings/${slug}`;

  // Special-case Hagaflöt 2: slug is 'hagaflot-2' but assets live under
  // /images/projects/Hagaflot/hagaflot2/hagaflot-2.svg.
  if (slug === "hagaflot-2") {
    return "/images/projects/Hagaflot/hagaflot2/hagaflot-2.svg";
  }

  // Floor-specific SVGs (convention-based)
  if (floor != null) {
    return `${basePath}/floor-${floor}.svg`;
  }

  // Default convention: /images/buildings/{slug}/{slug}.svg
  return `${basePath}/${slug}.svg`;
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
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    null,
  );
  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(
    null,
  );
  const [hoveredApartmentId, setHoveredApartmentId] = useState<string | null>(
    null,
  );
  const [hoveredBuildingId, setHoveredBuildingId] = useState<string | null>(
    null,
  );
  const [detailReloadToken, setDetailReloadToken] = useState(0);
  const infoPanelRef = useRef<HTMLDivElement | null>(null);
  const buildingStageRef = useRef<HTMLDivElement | null>(null);
  const streetSidebarListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setLoading(true);
        const [buildingsRes, streetsRes] = await Promise.all([
          fetch("/api/buildings", { cache: "no-store" }),
          fetch("/api/streets", { cache: "no-store" }),
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

  const buildingFromId = useMemo(
    () =>
      idFromQuery
        ? buildings.find((b) => b.id === idFromQuery) ?? null
        : null,
    [buildings, idFromQuery],
  );

  const buildingFromSlug = useMemo(
    () => buildings.find((b) => b.slug === slug) ?? null,
    [buildings, slug],
  );

  const streetFromQuery = useMemo(
    () =>
      idFromQuery
        ? streets.find((s) => s.id === idFromQuery) ?? null
        : null,
    [streets, idFromQuery],
  );

  const isStreetMode = Boolean(streetFromQuery);

  const baseBuilding = useMemo(
    () => buildingFromId ?? buildingFromSlug ?? null,
    [buildingFromId, buildingFromSlug],
  );

  useEffect(() => {
    if (isStreetMode) {
      // Street mode: start with only the street selected, user picks building.
      setSelectedBuildingId(null);
      setDetail(null);
      setSelectedApartmentId(null);
      setHoveredBuildingId(null);
      setHoveredApartmentId(null);
      return;
    }

    // Building mode: default to the resolved building if we don't have one yet.
    setSelectedBuildingId((prev) => prev ?? baseBuilding?.id ?? null);
  }, [isStreetMode, baseBuilding?.id]);

  const selectedBuilding = useMemo(
    () => {
      if (selectedBuildingId) {
        return buildings.find((b) => b.id === selectedBuildingId) ?? null;
      }
      if (!isStreetMode) {
        return baseBuilding;
      }
      return null;
    },
    [buildings, selectedBuildingId, baseBuilding, isStreetMode],
  );

  const street = useMemo(
    () => {
      if (streetFromQuery) return streetFromQuery;
      const sourceBuilding = selectedBuilding ?? baseBuilding;
      if (!sourceBuilding || !sourceBuilding.street_id) return null;
      return streets.find((s) => s.id === sourceBuilding.street_id) ?? null;
    },
    [streetFromQuery, selectedBuilding, baseBuilding, streets],
  );

  const streetBuildings = useMemo(
    () =>
      street
        ? buildings.filter((b) => b.street_id === street.id)
        : [],
    [buildings, street],
  );

  const handleSelectBuilding = (id: string) => {
    setSelectedBuildingId((prev) => {
      if (prev === id) {
        // Same building re-selected – force a detail reload.
        setDetailReloadToken((token) => token + 1);
        return prev;
      }
      return id;
    });
    setSelectedApartmentId(null);
    setHoveredBuildingId(null);
  };

  useEffect(() => {
    if (!selectedBuilding || !selectedBuilding.id) {
      setDetail(null);
      setSelectedApartmentId(null);
      return;
    }

    const currentBuilding = selectedBuilding;
    const currentBuildingId = selectedBuilding.id;

    async function loadDetail() {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const res = await fetch(
          `/api/buildings/${encodeURIComponent(currentBuildingId)}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error("Failed to load apartments for building");
        const data = (await res.json()) as {
          building: Building;
          apartments: Apartment[];
        };

        setDetail({ building: currentBuilding, apartments: data.apartments });
        setSelectedApartmentId(null);
        setHoveredApartmentId(null);
      } catch (e) {
        setDetailError((e as Error).message ?? "Failed to load details");
      } finally {
        setDetailLoading(false);
      }
    }

    void loadDetail();
  }, [selectedBuilding, detailReloadToken]);

  // Smoothly scroll the building stage into view when a building is picked
  // from the street stage in street mode.
  useEffect(() => {
    if (!isStreetMode || !selectedBuildingId || !buildingStageRef.current) {
      return;
    }
    try {
      const el = buildingStageRef.current;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      // Scroll so that the building stage appears just below the header/nav,
      // with a small breathing margin.
      let headerOffset = 0;
      const headerEl = document.querySelector("header");
      if (headerEl) {
        headerOffset = headerEl.getBoundingClientRect().height;
      }
      const offset = headerOffset + 16;
      const startY = scrollY;
      const targetY = scrollY + rect.top - offset;
      const distance = targetY - startY;
      const duration = 500;
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
  }, [isStreetMode, selectedBuildingId]);

  // Keep the selected building row visible inside the Stage 1 sidebar
  useEffect(() => {
    if (!isStreetMode || !selectedBuildingId || !streetSidebarListRef.current) {
      return;
    }
    try {
      const container = streetSidebarListRef.current;
      const row = container.querySelector<HTMLButtonElement>(
        `[data-street-building-row-id="${selectedBuildingId}"]`,
      );
      if (!row) return;
      row.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } catch {
      // ignore scrolling errors
    }
  }, [isStreetMode, selectedBuildingId]);

  useEffect(() => {
    if (!selectedApartmentId || !infoPanelRef.current) return;
    try {
      const el = infoPanelRef.current;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;

      // Aim to place the Stage 3 panel close under the header so it doesn't scroll too far down.
      let headerOffset = 0;
      const headerEl = document.querySelector("header");
      if (headerEl) {
        headerOffset = headerEl.getBoundingClientRect().height;
      }
      const offset = headerOffset + 8; // just under the header, with minimal extra space

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

  const floors = useMemo(() => {
    if (!detail?.apartments || detail.apartments.length === 0) return [];
    const map = new Map<
      number,
      {
        floor: number;
        apartments: Apartment[];
      }
    >();

    for (const apt of detail.apartments) {
      const floorNumber = apt.floor ?? 0;
      const existing = map.get(floorNumber);
      if (existing) {
        existing.apartments.push(apt);
      } else {
        map.set(floorNumber, { floor: floorNumber, apartments: [apt] });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.floor - a.floor);
  }, [detail]);

  const [activeFloor, setActiveFloor] = useState<number | null>(null);

  useEffect(() => {
    if (!floors.length) {
      setActiveFloor(null);
      return;
    }
    setActiveFloor((prev) =>
      prev != null && floors.some((f) => f.floor === prev)
        ? prev
        : floors[0].floor,
    );
  }, [floors]);

  useEffect(() => {
    setHoveredApartmentId(null);
  }, [activeFloor]);

  const activeFloorGroup = useMemo(
    () =>
      activeFloor != null
        ? floors.find((f) => f.floor === activeFloor) ?? null
        : null,
    [floors, activeFloor],
  );

  const minimapSvgUrl = useMemo(
    () => resolveMinimapSvgUrl(selectedBuilding ?? null, activeFloor),
    [selectedBuilding, activeFloor],
  );

  if (loading) {
    return (
      <p className="text-sm text-slate-500">
        Hleð húsi og götu...
      </p>
    );
  }

  if (!streetFromQuery && !buildingFromId && !buildingFromSlug) {
    return (
      <p className="text-sm text-red-600">
        Finn ekki hús eða götu fyrir þessa slóð.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stage 1 – Street view (only in street mode) */}
      {street && isStreetMode && (
        <section className="relative flex flex-col lg:flex-row lg:min-h-[calc(100vh-var(--header-height))] bg-neutral-100 overflow-hidden">
          <div className="relative w-full lg:flex-1 h-[260px] sm:h-[320px] md:h-[360px] lg:h-[calc(100vh-var(--header-height))]">
            <StreetView
              streetImageUrl={street.image}
              streetName={street.name}
              streetSvgUrl={null}
              buildings={streetBuildings}
              variant="overlay"
              selectedBuildingId={selectedBuilding?.id ?? null}
              hoveredBuildingId={hoveredBuildingId}
              onBuildingSelect={handleSelectBuilding}
              onBuildingHoverChange={setHoveredBuildingId}
            />
          </div>

          <aside className="w-full lg:w-[280px] xl:w-[360px] border-t lg:border-t-0 lg:border-l border-slate-200 bg-white/95">
            <div className="flex flex-col p-4 sm:p-5 lg:sticky lg:top-[var(--header-height)] lg:h-[calc(100vh-var(--header-height))]">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-500">
                  BYGGINGAR
                </p>
                <h1 className="text-sm font-semibold text-slate-900 sm:text-base">
                  {street.name}
                </h1>
                <p className="text-xs text-slate-600">
                  Smelltu á hús á mynd eða veldu hér.
                </p>
              </div>

              <div
                ref={streetSidebarListRef}
                className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1"
              >
                {streetBuildings.map((b) => {
                  const isActive = selectedBuilding?.id === b.id;
                  const isHoveredRow = hoveredBuildingId === b.id;
                  const totalCount =
                    Number((b.total_apartments ?? 0) as number) || 0;
                  const availableCount =
                    Number((b.available_apartments ?? 0) as number) || 0;
                  const baseRowClasses =
                    "group flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors";
                  const stateClasses = isActive
                    ? "border-l-4 border-[var(--map-accent)] bg-amber-50/50 shadow-sm"
                    : isHoveredRow
                      ? "border-l-2 border-slate-300 bg-slate-50"
                      : "border-l border-transparent hover:bg-slate-50";
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBuilding(b.id)}
                      onMouseEnter={() => setHoveredBuildingId(b.id)}
                      onMouseLeave={() => setHoveredBuildingId(null)}
                      data-street-building-row-id={b.id}
                      className={`${baseRowClasses} ${stateClasses}`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs sm:text-sm font-semibold ${
                              isActive || isHoveredRow
                                ? "text-slate-900"
                                : "text-slate-800 group-hover:text-slate-900"
                            }`}
                          >
                            {b.title}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-700">
                              <span
                                aria-hidden="true"
                                className="text-[10px] leading-none"
                              >
                                ✓
                              </span>
                              <span>Valið</span>
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1">
                          {availableCount > 0 && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                              {availableCount} laus
                              {availableCount === 1 ? "" : "ar"}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">
                            {totalCount} íbúð
                            {totalCount === 1 ? "" : "ir"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {streetBuildings.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Engin hús skilgreind enn fyrir þessa götu.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </section>
      )}

      {/* Stage 2 – Building layout + apartments overview */}
      {selectedBuilding && (
        <section
          ref={buildingStageRef}
          className="relative flex flex-col lg:flex-row lg:min-h-[calc(100vh-6rem)] bg-neutral-100"
        >
          <div className="w-full lg:flex-1">
            <div className="relative w-full h-[300px] sm:h-[380px] md:h-[420px] lg:h-[calc(100vh-6rem)]">
              {selectedBuilding.layout_image &&
              detail?.apartments &&
              detail.apartments.length > 0 ? (
                <BuildingLayoutView
                  layoutImageUrl={selectedBuilding.layout_image}
                  buildingTitle={selectedBuilding.title}
                  apartments={detail.apartments.map((apt) => ({
                    id: apt.id,
                    number: apt.number,
                    status: apt.status,
                  }))}
                  selectedApartmentId={selectedApartmentId}
                  hoveredApartmentId={hoveredApartmentId}
                  onApartmentClick={(apartmentId) =>
                    setSelectedApartmentId((prev) =>
                      prev === apartmentId ? null : apartmentId,
                    )
                  }
                  onApartmentHoverChange={setHoveredApartmentId}
                />
              ) : selectedBuilding.layout_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedBuilding.layout_image}
                  alt={selectedBuilding.title}
                  className="h-full w-full object-contain"
                />
              ) : selectedBuilding.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedBuilding.thumbnail}
                  alt={selectedBuilding.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">
                  Engin mynd eða uppdráttur skilgreindur fyrir þetta hús.
                </div>
              )}
            </div>
          </div>

          <aside className="w-full lg:w-[280px] xl:w-[360px] border-t lg:border-t-0 lg:border-l border-slate-200 bg-white/95">
            <div className="flex flex-col p-4 sm:p-5 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]">
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                  ÍBÚÐIR
                </p>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  {selectedBuilding.title}
                </h2>
              </div>

              <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                {detailLoading && (
                  <p className="text-sm text-slate-500">
                    Hleð íbúðaupplýsingum...
                  </p>
                )}
                {detailError && (
                  <p className="text-sm text-red-600">Villa: {detailError}</p>
                )}

                {!detailLoading && !detailError && floors.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Engar íbúðir skilgreindar fyrir þetta hús.
                  </p>
                )}

                {floors.length > 0 && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Hæð
                      </p>
                      <p className="text-sm text-slate-600">
                        Hæð: {(activeFloor ?? floors[0]?.floor) ?? "?"}. hæð
                      </p>
                    </div>

                    {activeFloorGroup && minimapSvgUrl && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-slate-500">
                          Yfirlit íbúða – Hæð {(activeFloor ?? activeFloorGroup.floor) ?? "?"}
                        </p>
                        <div className="relative w-full overflow-hidden rounded-sm border border-slate-200 bg-[#F7F8F9] shadow">
                          <div className="aspect-[4/3] w-full">
                            <BuildingMinimap
                              svgSrc={minimapSvgUrl}
                              apartments={activeFloorGroup.apartments.map((apt) => ({
                                id: apt.id,
                                number: apt.number,
                                status: apt.status,
                              }))}
                              selectedApartmentId={selectedApartmentId}
                              hoveredApartmentId={hoveredApartmentId}
                              onApartmentHoverChange={setHoveredApartmentId}
                              onApartmentSelect={(apartmentId) =>
                                setSelectedApartmentId((prev) =>
                                  prev === apartmentId ? null : apartmentId,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                            Staða íbúða
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-sm bg-emerald-400" />
                              <span className="text-slate-600">Til sölu</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-sm bg-slate-500" />
                              <span className="text-slate-600">Selt</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-sm bg-amber-400" />
                              <span className="text-slate-600">Frátekin</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="h-4 w-4 rounded-sm bg-sky-400" />
                              <span className="text-slate-600">Í fjármögnun</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      )}

      {/* Stage 3 – Apartment details */}
      <section ref={infoPanelRef} className="space-y-2">
        <div
          className={`overflow-hidden rounded-2xl border border-slate-200 bg-white/95 transition-all duration-200 ease-out ${
            selectedApartment
              ? "max-h-[1400px] opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-1"
          }`}
        >
          {selectedApartment && selectedBuilding && (
            <ApartmentDetailsPanel
              apartment={{
                id: selectedApartment.id,
                number: selectedApartment.number,
                floor: selectedApartment.floor,
                status: selectedApartment.status,
                size: selectedApartment.size,
                rooms: selectedApartment.rooms,
                layout_image: selectedApartment.layout_image,
                address: selectedBuilding.title,
                parking:
                  selectedApartment.parking_spot &&
                  selectedApartment.parking_spot.trim().length > 0
                    ? selectedApartment.parking_spot
                    : null,
              }}
              building={{
                title: selectedBuilding.title,
                description: selectedBuilding.description ?? null,
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
