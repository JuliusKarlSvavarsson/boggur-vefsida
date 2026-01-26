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
  floorplanImage: string;
  parkingSpotLabel: string;
  parkingImageSrc: string;
};

type BuildingFloor = {
  floorNumber: number;
  label?: string;
  apartments: BuildingApartment[];
};

type BuildingData = {
  buildingName: string;
  floors: BuildingFloor[];
};

type ProjectDetailClientProps = {
  slug: string;
};

const buildingData: BuildingData = {
  buildingName: "Boggur Towers",
  floors: [
    {
      floorNumber: 3,
      label: "3rd floor",
      apartments: [
        {
          id: "3A",
          name: "Apartment 3A",
          size: 78,
          rooms: 3,
          status: "available",
          priceLabel: "From 59.900.000 kr",
          floorplanImage: "/images/apartments/floorplan1.png",
          parkingSpotLabel: "P3",
          parkingImageSrc: "/images/apartments/parking1.png",
        },
        {
          id: "3B",
          name: "Apartment 3B",
          size: 65,
          rooms: 2,
          status: "reserved",
          priceLabel: "From 52.900.000 kr",
          floorplanImage: "/images/apartments/floorplan1.png",
          parkingSpotLabel: "P4",
          parkingImageSrc: "/images/apartments/parking1.png",
        },
        {
          id: "3C",
          name: "Apartment 3C",
          size: 92,
          rooms: 4,
          status: "sold",
          priceLabel: "Sold out",
          floorplanImage: "/images/apartments/floorplan1.png",
          parkingSpotLabel: "P5",
          parkingImageSrc: "/images/apartments/parking1.png",
        },
      ],
    },
    {
      floorNumber: 2,
      label: "2nd floor",
      apartments: [
        {
          id: "2A",
          name: "Apartment 2A",
          size: 72,
          rooms: 3,
          status: "available",
          priceLabel: "From 56.900.000 kr",
          floorplanImage: "/images/apartments/floorplan1.png",
          parkingSpotLabel: "P2",
          parkingImageSrc: "/images/apartments/parking1.png",
        },
        {
          id: "2B",
          name: "Apartment 2B",
          size: 60,
          rooms: 2,
          status: "available",
          priceLabel: "From 48.900.000 kr",
          floorplanImage: "/images/apartments/floorplan1.png",
          parkingSpotLabel: "P1",
          parkingImageSrc: "/images/apartments/parking1.png",
        },
      ],
    },
    {
      floorNumber: 1,
      label: "Ground floor",
      apartments: [
        {
          id: "1A",
          name: "Apartment 1A",
          size: 55,
          rooms: 2,
          status: "available",
          priceLabel: "From 44.900.000 kr",
          floorplanImage: "/images/apartments/floorplan1.png",
          parkingSpotLabel: "G1",
          parkingImageSrc: "/images/apartments/parking1.png",
        },
      ],
    },
  ],
};

export default function ProjectDetailClient({ slug }: ProjectDetailClientProps) {
  const floors = buildingData.floors;

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
          {buildingData.buildingName} — {slug}
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
