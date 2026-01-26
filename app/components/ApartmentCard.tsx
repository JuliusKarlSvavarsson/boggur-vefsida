import Image from "next/image";
import ParkingVisualizer from "./ParkingVisualizer";

type ApartmentStatus = "available" | "sold" | "reserved";

type ApartmentCardProps = {
  title: string;
  description: string;
  priceLabel: string;
  size?: number;
  rooms?: number;
  status?: ApartmentStatus;
  imageSrc?: string; // floorplan
  parkingSpotLabel?: string;
  parkingImageSrc?: string;
};

const statusClassMap: Record<ApartmentStatus, string> = {
  available: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  sold: "border-rose-500/40 bg-rose-500/10 text-rose-300",
  reserved: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

const statusLabelMap: Record<ApartmentStatus, string> = {
  available: "Available",
  sold: "Sold",
  reserved: "Reserved",
};

export default function ApartmentCard({
  title,
  description,
  priceLabel,
  size,
  rooms,
  status,
  imageSrc,
  parkingSpotLabel,
  parkingImageSrc,
}: ApartmentCardProps) {
  const statusClass = status ? statusClassMap[status] : undefined;

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
      <div className="overflow-hidden rounded-md border border-slate-800 bg-slate-900">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            width={640}
            height={360}
            className="h-40 w-full object-cover sm:h-48"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center bg-slate-800 text-xs text-slate-300 sm:h-48">
            Floorplan placeholder
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-slate-50">{title}</h3>
          {status && (
            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${statusClass}`}
            >
              {statusLabelMap[status]}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-300">
          {typeof size === "number" && (
            <span className="rounded-full bg-slate-800 px-2 py-1">~{size} m²</span>
          )}
          {typeof rooms === "number" && (
            <span className="rounded-full bg-slate-800 px-2 py-1">{rooms} rooms</span>
          )}
        </div>
        <p className="text-sm text-slate-300">{description}</p>
        <p className="text-sm font-semibold text-primary">{priceLabel}</p>
      </div>
      {(parkingImageSrc || parkingSpotLabel) && (
        <div className="pt-2">
          <ParkingVisualizer imageSrc={parkingImageSrc} spotLabel={parkingSpotLabel} />
        </div>
      )}
    </article>
  );
}
