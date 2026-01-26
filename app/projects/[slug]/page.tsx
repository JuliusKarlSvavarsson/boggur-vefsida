import { headers } from "next/headers";
import ProjectDetailClient from "./ProjectDetailClient";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

type ApiProject = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
};

type ApiApartment = {
  id: string;
  project_id: string;
  floor: number;
  number: string;
  status: string;
  size: number | null;
  rooms: number | null;
  layout_image: string | null;
  parking_spot: string | null;
};

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

function mapApartmentStatus(status: string | null): ApartmentStatus {
  if (!status) return "reserved";
  const normalized = status.toLowerCase();
  if (normalized === "available") return "available";
  if (normalized === "sold") return "sold";
  if (normalized === "reserved") return "reserved";
  return "reserved";
}

function formatFloorLabel(floor: number): string {
  if (floor === 0) return "Ground floor";
  if (floor === 1) return "1st floor";
  if (floor === 2) return "2nd floor";
  if (floor === 3) return "3rd floor";
  return `${floor}th floor`;
}

async function fetchProjectWithApartments(slug: string): Promise<{
  project: ApiProject;
  apartments: ApiApartment[];
}> {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/projects/${slug}`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch project details");
  }

  return res.json();
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { project, apartments } = await fetchProjectWithApartments(params.slug);

  if (!apartments.length) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          {project.title}
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          No apartments are currently defined for this project.
        </p>
      </section>
    );
  }

  const floorsMap = new Map<number, BuildingFloor>();

  apartments.forEach((apt) => {
    const floorNumber = apt.floor;
    let floor = floorsMap.get(floorNumber);
    if (!floor) {
      floor = {
        floorNumber,
        label: formatFloorLabel(floorNumber),
        apartments: [],
      };
      floorsMap.set(floorNumber, floor);
    }

    floor.apartments.push({
      id: apt.id,
      name: `Apartment ${apt.number}`,
      size: apt.size ?? 0,
      rooms: apt.rooms ?? 0,
      status: mapApartmentStatus(apt.status),
      priceLabel: "",
      floorplanImage: apt.layout_image ?? undefined,
      parkingSpotLabel: apt.parking_spot ?? undefined,
    });
  });

  const floors: BuildingFloor[] = Array.from(floorsMap.values()).sort(
    (a, b) => b.floorNumber - a.floorNumber,
  );

  return (
    <ProjectDetailClient
      slug={params.slug}
      buildingName={project.title}
      floors={floors}
    />
  );
}
