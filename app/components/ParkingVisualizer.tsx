import Image from "next/image";

type ParkingVisualizerProps = {
  spotLabel?: string;
  imageSrc?: string;
};

export default function ParkingVisualizer({ spotLabel, imageSrc }: ParkingVisualizerProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
      <div className="relative h-32 w-full sm:h-40">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={spotLabel ? `Parking layout for spot ${spotLabel}` : "Parking layout"}
            width={640}
            height={360}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-500">
            Parking layout placeholder
          </div>
        )}
        {spotLabel && (
          <div className="absolute bottom-3 left-3 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-semibold text-emerald-50 shadow">
            Spot {spotLabel}
          </div>
        )}
      </div>
    </div>
  );
}
