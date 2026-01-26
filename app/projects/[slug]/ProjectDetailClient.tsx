"use client";

import { useState } from "react";
import FloorSelector from "@/components/FloorSelector";
import SvgApartmentSelector from "@/components/SvgApartmentSelector";
import ApartmentCard from "@/components/ApartmentCard";

type ApartmentStatus = "available" | "sold" | "reserved";

type BuildingApartment = {
  id: string;
  name: string;
  size: number;
  rooms: number;
  status: ApartmentStatus;
  priceLabel: string;
  floorplanImage?: string;
  parkingSpotLabel?: string;
  parkingImageSrc?: string;
};

type BuildingFloor = {
  floorNumber: number;
  label?: string;
  apartments: BuildingApartment[];
};

type ProjectDetailClientProps = {
  slug: string;
  buildingName: string;
  floors: BuildingFloor[];
};

export default function ProjectDetailClient({ slug, buildingName, floors }: ProjectDetailClientProps) {

  const [selectedFloor, setSelectedFloor] = useState<number>(
    floors[0]?.floorNumber ?? 1
  );

  const getFloorByNumber = (floorNumber: number): BuildingFloor | undefined =>
    floors.find((f) => f.floorNumber === floorNumber);

  const currentFloor = getFloorByNumber(selectedFloor) ?? floors[0];

  const [selectedApartmentId, setSelectedApartmentId] = useState<string | null>(
    currentFloor?.apartments[0]?.id ?? null
  );

  const handleFloorChange = (floorNumber: number) => {
    setSelectedFloor(floorNumber);
    const floor = getFloorByNumber(floorNumber);
    const firstApartment = floor?.apartments[0];
    setSelectedApartmentId(firstApartment?.id ?? null);
  };

  const handleApartmentSelect = (apartmentId: string) => {
    setSelectedApartmentId(apartmentId);
  };

  const selectedApartment =
    currentFloor?.apartments.find((apt) => apt.id === selectedApartmentId) ??
    currentFloor?.apartments[0] ??
    null;

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary">
          Project Placeholder
        </p>
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          {buildingName} — {slug}
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          This is an interactive placeholder for the future apartment selector.
          Floors and apartments are driven by temporary JSON data and will
          later be backed by Neon/Postgres and the Boggur admin panel.
        </p>
      </header>

      <div className="space-y-4">
        <FloorSelector
          floors={floors}
          selectedFloor={selectedFloor}
          onSelectFloor={handleFloorChange}
        />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
            <SvgApartmentSelector
              floorLabel={
                currentFloor?.label ??
                `Floor ${currentFloor?.floorNumber ?? ""}`
              }
              apartments={currentFloor?.apartments ?? []}
              selectedApartmentId={selectedApartment?.id ?? null}
              onSelectApartment={handleApartmentSelect}
            />
          </div>
          <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
            <h2 className="text-base font-semibold text-slate-50">
              Apartment details
            </h2>
            {selectedApartment ? (
              <ApartmentCard
                title={selectedApartment.name}
                description={`Placeholder description for ${selectedApartment.name}. Real content will describe orientation, materials, and key selling points.`}
                priceLabel={selectedApartment.priceLabel}
                size={selectedApartment.size}
                rooms={selectedApartment.rooms}
                status={selectedApartment.status}
                imageSrc={selectedApartment.floorplanImage}
                parkingSpotLabel={selectedApartment.parkingSpotLabel}
                parkingImageSrc={selectedApartment.parkingImageSrc}
              />
            ) : (
              <p className="text-sm text-slate-300">
                Select an apartment in the diagram to see details here.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
