"use client";

import StreetView from "@/app/building/StreetView";

type PreviewBuilding = {
  id: string;
  slug: string;
  street_svg_id?: string | null;
};

type StreetSvgPreviewProps = {
  streetName: string;
  streetImageUrl: string | null;
  buildings: PreviewBuilding[];
  mode?: "card" | "overlay";
};

export default function StreetSvgPreview({
  streetName,
  streetImageUrl,
  buildings,
  mode = "card",
}: StreetSvgPreviewProps) {
  if (mode === "overlay") {
    return (
      <div className="h-full w-full">
        <StreetView
          streetImageUrl={streetImageUrl}
          streetName={streetName}
          streetSvgUrl={null}
          buildings={buildings}
          variant="overlay"
        />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <div className="relative h-[320px] w-full sm:h-[400px]">
        <StreetView
          streetImageUrl={streetImageUrl}
          streetName={streetName}
          streetSvgUrl={null}
          buildings={buildings}
          variant="default"
        />
      </div>
    </div>
  );
}
