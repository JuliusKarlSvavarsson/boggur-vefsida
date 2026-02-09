"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { statusLabel } from "./apartmentVisual";

// Narrow apartment shape for the details panel; compatible with the main Apartment type.
export type ApartmentForDetails = {
  id: string;
  number: string;
  floor: number;
  status: string;
  size: number | null;
  rooms: number | null;
  layout_image: string | null;
  // Optional extended dossier fields (only used when present)
  address?: string | null;
  storageM2?: number | null;
  parking?: string | boolean | null;
  price?: number | null;
  description?: string | null;
};

export type BuildingForDetails = {
  title: string;
  description: string | null;
};

type ApartmentStatus = "available" | "reserved" | "sold" | "unavailable" | string;

type ApartmentSpec = {
  label: string;
  value: string;
};

type ApartmentDetails = {
  name: string;
  buildingName: string | null;
  floor: string | null;
  rooms: number | null;
  sizeM2: number | null;
  storageM2: number | null;
  address: string | null;
  parkingLabel: string | null;
  orientation: string | null;
  price: number | null;
  status: ApartmentStatus;
  planImageUrl: string | null;
  description: string | null;
  specs: ApartmentSpec[];
};

function normalizeStatus(raw: string | null | undefined): ApartmentStatus {
  const normalized = (raw ?? "").toLowerCase();
  if (!normalized) return "unavailable";
  if (normalized === "available") return "available";
  if (normalized === "reserved") return "reserved";
  if (normalized === "sold") return "sold";
  if (normalized === "unavailable") return "unavailable";
  return normalized;
}

function normalizeImageUrl(src: string | null): string | null {
  if (!src) return null;

  // Use forward slashes for URLs and trim whitespace
  let cleaned = src.trim().replace(/\\/g, "/");

  // Absolute URLs are passed through
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    return cleaned;
  }

  // Ensure we have a leading slash for public assets
  if (!cleaned.startsWith("/")) {
    cleaned = `/${cleaned}`;
  }

  return cleaned;
}

function getStatusTheme(status: ApartmentStatus) {
  const normalized = normalizeStatus(status);

  if (normalized === "available") {
    return {
      borderClass: "border-emerald-500",
      textClass: "text-emerald-700",
    };
  }

  if (normalized === "reserved") {
    return {
      borderClass: "border-amber-500",
      textClass: "text-amber-700",
    };
  }

  if (normalized === "sold") {
    return {
      borderClass: "border-slate-600",
      textClass: "text-slate-700",
    };
  }

  return {
    borderClass: "border-slate-300",
    textClass: "text-slate-600",
  };
}

function getApartmentDetails(
  apartment: ApartmentForDetails | null,
  building: BuildingForDetails | null,
): ApartmentDetails | null {
  if (!apartment) return null;

  const floorLine = Number.isFinite(apartment.floor)
    ? `${apartment.floor}. hæð`
    : null;

  const size = apartment.size ?? null;
  const rooms = apartment.rooms ?? null;

  const sizeText = size != null ? `${size} m²` : "ótilgreindri stærð";
  const roomsText = rooms != null ? `${rooms} herbergja` : "vel skipulögð";
  const floorText = floorLine ?? "ótilgreindri hæð";

  const autoDescription = `Vönduð ${roomsText} íbúð á ${floorText} með birtu stærð ${sizeText}. Nánari skilalýsing og tæknilegar upplýsingar liggja fyrir hjá framkvæmdaaðila.`;

  const description =
    apartment.description && apartment.description.trim().length > 0
      ? apartment.description.trim()
      : autoDescription;

  const address =
    apartment.address && apartment.address.trim().length > 0
      ? apartment.address.trim()
      : building?.title ?? null;

  const storageM2 =
    typeof apartment.storageM2 === "number" && !Number.isNaN(apartment.storageM2)
      ? apartment.storageM2
      : null;

  const price =
    typeof apartment.price === "number" && !Number.isNaN(apartment.price)
      ? apartment.price
      : null;

  let parkingLabel: string | null = null;
  if (typeof apartment.parking === "string" && apartment.parking.trim().length > 0) {
    parkingLabel = apartment.parking.trim();
  } else if (typeof apartment.parking === "boolean") {
    parkingLabel = apartment.parking ? "Já" : null;
  }

  const specs: ApartmentSpec[] = [
    {
      label: "Burðarvirki",
      value: "Steinsteypt burðarvirki með hljóðeinangruðum milligólfum.",
    },
    {
      label: "Útveggir",
      value: "Einangraðir steyptir útveggir klæddir sléttri málningar- eða álklæðningu.",
    },
    {
      label: "Gluggar",
      value: "Glerjaðir ál- eða PVC-gluggar með tvöföldu eða þreföldu gleri.",
    },
    {
      label: "Hitakerfi",
      value: "Vatnshitun með gólfhita í aðalrýmum og handklæðaofnum á baðherbergjum.",
    },
    {
      label: "Innréttingar",
      value: "Ljósar og tímalausar innréttingar með harðviðarlíkingum eða náttúrulegum við.",
    },
  ];

  return {
    name: `Íbúð ${apartment.number}`,
    buildingName: building?.title ?? null,
    floor: floorLine,
    rooms,
    sizeM2: size,
    storageM2,
    address,
    parkingLabel,
    orientation: null,
    price,
    status: normalizeStatus(apartment.status),
    planImageUrl: normalizeImageUrl(apartment.layout_image),
    description,
    specs,
  };
}

export type ApartmentDetailsPanelProps = {
  apartment: ApartmentForDetails | null;
  building: BuildingForDetails | null;
};

export default function ApartmentDetailsPanel({
  apartment,
  building,
}: ApartmentDetailsPanelProps) {
  const [isSpecsOpen, setIsSpecsOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const details = useMemo(
    () => getApartmentDetails(apartment, building),
    [apartment, building],
  );

  if (!details) {
    return null;
  }

  const statusTheme = getStatusTheme(details.status);
  const rows: { key: string; label: string; value: string | null }[] = [
    {
      key: "unit",
      label: "Íbúð",
      value: details.name,
    },
    {
      key: "address",
      label: "Staðfang",
      value: details.address,
    },
    {
      key: "floor",
      label: "Hæð",
      value: details.floor,
    },
    {
      key: "rooms",
      label: "Herbergi",
      value:
        details.rooms != null && details.rooms > 0
          ? String(details.rooms)
          : null,
    },
    {
      key: "size",
      label: "Birt stærð",
      value:
        details.sizeM2 != null
          ? `${details.sizeM2} m²`
          : null,
    },
    {
      key: "storage",
      label: "Þar af geymsla",
      value:
        details.storageM2 != null
          ? `${details.storageM2} m²`
          : null,
    },
    {
      key: "parking",
      label: "Stæði í bílageymslu",
      value: details.parkingLabel,
    },
    {
      key: "price",
      label: "Verð",
      value:
        details.price != null
          ? `${details.price.toLocaleString("is-IS")} kr.`
          : null,
    },
  ];

  const visibleRows = rows.filter(
    (row) => row.value != null && String(row.value).trim().length > 0,
  );

  const hasDetailText =
    (details.description && details.description.trim().length > 0) ||
    details.specs.length > 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-baseline sm:justify-end">
        <div className="mt-1 sm:mt-0">
          <p
            className={`border-l-2 pl-3 text-xs sm:text-sm ${statusTheme.borderClass} ${statusTheme.textClass}`}
          >
            {statusLabel(details.status)}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Skipta um íbúð með því að velja aðra í uppdrættinum.
      </p>

      <div className="mt-4 grid gap-5 md:grid-cols-[minmax(0,8fr)_minmax(0,3fr)]">
        {/* Left column – plan image */}
        <div className="flex flex-col justify-start">
          <div className="rounded-md border border-slate-200 bg-[#F7F6F3] px-3 py-3">
            {details.planImageUrl ? (
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(true)}
                className="group w-full focus:outline-none"
              >
                <div className="relative mx-auto aspect-[3/2] w-full max-w-[960px]">
                  <Image
                    src={details.planImageUrl}
                    alt={details.name}
                    fill
                    sizes="(min-width: 1280px) 900px, (min-width: 1024px) 720px, 100vw"
                    className="object-contain"
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  <span className="font-medium text-slate-700">Grunnmynd.</span>{" "}
                  <span className="text-slate-500">
                    Smelltu á mynd til að skoða í hærri upplausn.
                  </span>
                </p>
              </button>
            ) : (
              <div className="flex h-48 items-center justify-center text-xs text-slate-400">
                Enginn uppdráttur skilgreindur fyrir þessa íbúð.
              </div>
            )}
          </div>
        </div>

        {/* Right column – spec sheet and extended description */}
        <div className="space-y-4">
          {visibleRows.length > 0 && (
            <div className="divide-y divide-slate-100 text-sm text-slate-800">
              {visibleRows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)] gap-3 py-1.5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {row.label}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {hasDetailText && (
            <div className="border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => setIsSpecsOpen((open) => !open)}
                className="flex w-full items-center justify-between text-left text-xs font-medium text-slate-700 hover:text-slate-900"
              >
                <span>Nánari skilalýsing</span>
                <span className="text-[11px] text-slate-500">
                  {isSpecsOpen ? "–" : "+"}
                </span>
              </button>
              {isSpecsOpen && (
                <div className="mt-3 space-y-2 text-sm text-slate-700">
                  {details.description && (
                    <p>{details.description}</p>
                  )}
                  {details.specs.map((spec) => (
                    <p key={spec.label}>
                      <span className="font-medium text-slate-800">
                        {spec.label}: {" "}
                      </span>
                      <span>{spec.value}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isPlanModalOpen && details.planImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative max-h-[90vh] w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Loka
            </button>
            <div className="relative mt-4 h-[70vh] w-full">
              <Image
                src={details.planImageUrl}
                alt={details.name}
                fill
                sizes="(min-width: 1024px) 960px, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
