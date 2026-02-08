"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import RightDrawer from "./RightDrawer";

// Minimal copies of types used in existing admin sections

type Street = {
  id: string;
  name: string;
  image: string | null;
  is_featured: boolean;
  featured_order: number;
  created_at: string;
};

type Building = {
  id: string;
  title: string;
  slug: string;
  street_id: string | null;
  description: string | null;
  thumbnail: string | null;
  layout_image: string | null;
  minimap_svg: string | null;
  status: string | null;
  is_featured: boolean;
  display_order: number | null;
  created_at: string;
};

type Apartment = {
  id: string;
  project_id: string | null;
  building_id: string | null;
  floor: number;
  number: string;
  status: "available" | "reserved" | "sold" | string;
  size: number | null;
  rooms: number | null;
  layout_image: string | null;
  interior_images: string[] | null;
  parking_spot: string | null;
  x_position: number | null;
  y_position: number | null;
  width: number | null;
  height: number | null;
  created_at: string;
};

type DrawerState =
  | { type: "street"; street: Street | null }
  | { type: "building"; building: Building | null; streetId?: string }
  | { type: "apartment"; apartment: Apartment | null; buildingId?: string }
  | null;

export default function ProjectsTreeAdminSection() {
  const [streets, setStreets] = useState<Street[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [drawer, setDrawer] = useState<DrawerState>(null);

  const [expandedStreets, setExpandedStreets] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedBuildings, setExpandedBuildings] = useState<Set<string>>(
    () => new Set(),
  );

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [streetsRes, buildingsRes, apartmentsRes] = await Promise.all([
        fetch("/api/admin/streets", { cache: "no-store" }),
        fetch("/api/admin/buildings", { cache: "no-store" }),
        fetch("/api/admin/apartments", { cache: "no-store" }),
      ]);

      if (!streetsRes.ok || !buildingsRes.ok || !apartmentsRes.ok) {
        throw new Error("Failed to load streets, buildings or apartments");
      }

      const streetsData: Street[] = await streetsRes.json();
      const buildingsData: Building[] = await buildingsRes.json();
      const apartmentsData: Apartment[] = await apartmentsRes.json();

      setStreets(streetsData);
      setBuildings(buildingsData);
      setApartments(apartmentsData);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load hierarchy");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  const buildingsByStreet = useMemo(() => {
    const map = new Map<string, Building[]>();
    for (const b of buildings) {
      const key = b.street_id || "__none__";
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [buildings]);

  const apartmentsByBuilding = useMemo(() => {
    const map = new Map<string, Apartment[]>();
    for (const apt of apartments) {
      if (!apt.building_id) continue;
      const arr = map.get(apt.building_id) ?? [];
      arr.push(apt);
      map.set(apt.building_id, arr);
    }
    return map;
  }, [apartments]);

  function toggleStreet(id: string) {
    setExpandedStreets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleBuilding(id: string) {
    setExpandedBuildings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openStreetDrawer(street: Street | null) {
    setDrawer({ type: "street", street });
  }

  function openBuildingDrawer(building: Building | null, streetId?: string) {
    setDrawer({ type: "building", building, streetId });
  }

  function openApartmentDrawer(
    apartment: Apartment | null,
    buildingId?: string,
  ) {
    setDrawer({ type: "apartment", apartment, buildingId });
  }

  async function handleDeleteStreet(id: string) {
    const confirmed = window.confirm(
      "Delete this street? Buildings linked to it will also be removed.",
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/streets/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete street");
      await loadAll();
    } catch (e) {
      alert((e as Error).message ?? "Failed to delete street");
    }
  }

  async function handleDeleteBuilding(id: string) {
    const confirmed = window.confirm(
      "Delete this building? Apartments linked to it will also be removed.",
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/buildings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete building");
      await loadAll();
    } catch (e) {
      alert((e as Error).message ?? "Failed to delete building");
    }
  }

  async function handleDeleteApartment(id: string) {
    const confirmed = window.confirm("Delete this apartment?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/apartments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete apartment");
      await loadAll();
    } catch (e) {
      alert((e as Error).message ?? "Failed to delete apartment");
    }
  }

  async function toggleApartmentStatus(apartment: Apartment) {
    const nextStatus =
      apartment.status === "sold" ? "available" : (apartment.status as any);
    try {
      const res = await fetch(`/api/admin/apartments/${apartment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...apartment, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      await loadAll();
    } catch (e) {
      alert((e as Error).message ?? "Failed to toggle status");
    }
  }

  const soloBuildings = useMemo(() => {
    return buildings.filter((b) => !b.street_id || !streets.some((s) => s.id === b.street_id));
  }, [buildings, streets]);

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Projects
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
          Manage the underlying structure of streets, buildings and apartments
          used for the public selectors. Everything is editable without leaving
          this page.
        </p>
      </header>

      {error && (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => openStreetDrawer(null)}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-primary-light"
            >
              Add street
            </button>
            <button
              type="button"
              onClick={() => openBuildingDrawer(null)}
              className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              Add building
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Streets and buildings
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {loading && (
                <div className="px-3 py-4 text-slate-500">Loading hierarchy...</div>
              )}
              {!loading && streets.length === 0 && buildings.length === 0 && (
                <div className="px-3 py-4 text-slate-500">
                  No streets or buildings yet. Start by adding a street.
                </div>
              )}

              {streets.map((street) => {
                const streetBuildings = buildingsByStreet.get(street.id) ?? [];
                const streetApartmentsCount = streetBuildings.reduce((total, b) => {
                  const list = apartmentsByBuilding.get(b.id) ?? [];
                  return total + list.length;
                }, 0);

                const isExpanded = expandedStreets.has(street.id);

                return (
                  <div key={street.id} className="px-3 py-2">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => toggleStreet(street.id)}
                        className="flex flex-1 items-center gap-2 text-left"
                      >
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[10px] text-slate-600">
                          {isExpanded ? "-" : "+"}
                        </span>
                        <div>
                          <div className="text-xs font-medium text-slate-900">
                            {street.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {streetBuildings.length} buildings · {streetApartmentsCount} apartments
                          </div>
                        </div>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openBuildingDrawer(null, street.id)}
                          className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                        >
                          + Building
                        </button>
                        <button
                          type="button"
                          onClick={() => openStreetDrawer(street)}
                          className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteStreet(street.id)}
                          className="rounded-full border border-red-100 bg-red-50 px-2 py-1 text-[11px] text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {isExpanded && streetBuildings.length > 0 && (
                      <div className="mt-2 space-y-1 border-l border-slate-200 pl-4">
                        {streetBuildings.map((building) => {
                          const buildingApartments =
                            apartmentsByBuilding.get(building.id) ?? [];
                          const isBuildingExpanded =
                            expandedBuildings.has(building.id);

                          return (
                            <div key={building.id} className="pt-1">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => toggleBuilding(building.id)}
                                  className="flex flex-1 items-center gap-2 text-left"
                                >
                                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] text-slate-600">
                                    {isBuildingExpanded ? "-" : "+"}
                                  </span>
                                  <div>
                                    <div className="text-[11px] font-medium text-slate-900">
                                      {building.title}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {buildingApartments.length} apartments · {building.status ?? ""}
                                    </div>
                                  </div>
                                </button>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openApartmentDrawer(null, building.id)}
                                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                                  >
                                    + Apt
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openBuildingDrawer(building, street.id)}
                                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void handleDeleteBuilding(building.id)}
                                    className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] text-red-700 hover:bg-red-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              {isBuildingExpanded && buildingApartments.length > 0 && (
                                <div className="mt-1 space-y-0.5 border-l border-slate-200 pl-4">
                                  {buildingApartments.map((apt) => {
                                    const statusClass =
                                      apt.status === "available"
                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                        : apt.status === "sold"
                                        ? "bg-red-50 text-red-700 ring-red-100"
                                        : "bg-amber-50 text-amber-700 ring-amber-100";
                                    return (
                                      <div
                                        key={apt.id}
                                        className="flex items-center justify-between gap-2 py-0.5"
                                      >
                                        <div className="text-[10px] text-slate-700">
                                          <span className="font-medium">{apt.number}</span>
                                          <span className="ml-1 text-slate-400">
                                            · {apt.floor}. hæð
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => void toggleApartmentStatus(apt)}
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusClass}`}
                                          >
                                            {apt.status}
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => openApartmentDrawer(apt, building.id)}
                                            className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => void handleDeleteApartment(apt.id)}
                                            className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] text-red-700 hover:bg-red-100"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {soloBuildings.length > 0 && (
                <div className="border-t border-slate-100 bg-slate-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Buildings without street
                </div>
              )}
              {soloBuildings.length > 0 && (
                <div className="px-3 py-2 text-xs">
                  <div className="space-y-1 border-l border-slate-200 pl-4">
                    {soloBuildings.map((building) => {
                      const buildingApartments =
                        apartmentsByBuilding.get(building.id) ?? [];
                      const isBuildingExpanded = expandedBuildings.has(building.id);
                      return (
                        <div key={building.id} className="pt-1">
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => toggleBuilding(building.id)}
                              className="flex flex-1 items-center gap-2 text-left"
                            >
                              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] text-slate-600">
                                {isBuildingExpanded ? "-" : "+"}
                              </span>
                              <div>
                                <div className="text-[11px] font-medium text-slate-900">
                                  {building.title}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {buildingApartments.length} apartments · {building.status ?? ""}
                                </div>
                              </div>
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openApartmentDrawer(null, building.id)}
                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                              >
                                + Apt
                              </button>
                              <button
                                type="button"
                                onClick={() => openBuildingDrawer(building)}
                                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDeleteBuilding(building.id)}
                                className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] text-red-700 hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {isBuildingExpanded && buildingApartments.length > 0 && (
                            <div className="mt-1 space-y-0.5 border-l border-slate-200 pl-4">
                              {buildingApartments.map((apt) => {
                                const statusClass =
                                  apt.status === "available"
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                    : apt.status === "sold"
                                    ? "bg-red-50 text-red-700 ring-red-100"
                                    : "bg-amber-50 text-amber-700 ring-amber-100";
                                return (
                                  <div
                                    key={apt.id}
                                    className="flex items-center justify-between gap-2 py-0.5"
                                  >
                                    <div className="text-[10px] text-slate-700">
                                      <span className="font-medium">{apt.number}</span>
                                      <span className="ml-1 text-slate-400">
                                        · {apt.floor}. hæð
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => void toggleApartmentStatus(apt)}
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${statusClass}`}
                                      >
                                        {apt.status}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => openApartmentDrawer(apt, building.id)}
                                        className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-slate-50"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => void handleDeleteApartment(apt.id)}
                                        className="rounded-full border border-red-100 bg-red-50 px-2 py-0.5 text-[10px] text-red-700 hover:bg-red-100"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3 text-xs text-slate-600">
          <p>
            Streets group buildings, and buildings group apartments. This view
            mirrors how the public interactive selectors work.
          </p>
          <p>
            Use the buttons on each row to quickly add, edit or delete items.
            Apartment status updates are immediate and reflected on the public
            site.
          </p>
        </div>
      </div>

      <RightDrawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        title={
          drawer?.type === "street"
            ? drawer.street
              ? "Edit street"
              : "Add street"
            : drawer?.type === "building"
            ? drawer.building
              ? "Edit building"
              : "Add building"
            : drawer?.type === "apartment"
            ? drawer.apartment
              ? "Edit apartment"
              : "Add apartment"
            : undefined
        }
        description={
          drawer?.type === "street"
            ? "Street overview images and featured flags drive the top-level selector."
            : drawer?.type === "building"
            ? "Buildings link a street to thumbnails and 2D layouts used in selectors."
            : drawer?.type === "apartment"
            ? "Apartments are tied to buildings and expose availability on the public site."
            : undefined
        }
      >
        {drawer?.type === "street" && (
          <StreetForm
            street={drawer.street}
            onClose={() => setDrawer(null)}
            onSaved={async () => {
              await loadAll();
              setDrawer(null);
            }}
          />
        )}
        {drawer?.type === "building" && (
          <BuildingForm
            building={drawer.building}
            streetId={drawer.streetId}
            streets={streets}
            onClose={() => setDrawer(null)}
            onSaved={async () => {
              await loadAll();
              setDrawer(null);
            }}
          />
        )}
        {drawer?.type === "apartment" && (
          <ApartmentForm
            apartment={drawer.apartment}
            buildingId={drawer.buildingId}
            buildings={buildings}
            onClose={() => setDrawer(null)}
            onSaved={async () => {
              await loadAll();
              setDrawer(null);
            }}
          />
        )}
      </RightDrawer>
    </section>
  );
}

function StreetForm({
  street,
  onClose,
  onSaved,
}: {
  street: Street | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    name: street?.name ?? "",
    image: street?.image ?? "",
    is_featured: street?.is_featured ?? false,
    featured_order: street?.featured_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      name: street?.name ?? "",
      image: street?.image ?? "",
      is_featured: street?.is_featured ?? false,
      featured_order: street?.featured_order ?? 0,
    });
    setFormError(null);
  }, [street]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    if (!name) {
      setFormError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        image: form.image.trim() || null,
        is_featured: form.is_featured,
        featured_order:
          form.featured_order != null && !Number.isNaN(Number(form.featured_order))
            ? Number(form.featured_order)
            : 0,
      };

      const isEdit = Boolean(street);
      const url = isEdit
        ? `/api/admin/streets/${street!.id}`
        : "/api/admin/streets";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to save street.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        setFormError(message);
        return;
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3 text-xs">
      {formError && (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </p>
      )}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">Name*</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          maxLength={160}
          required
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Overview image URL
        </label>
        <input
          type="text"
          value={form.image}
          onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
          placeholder="/images/streets/hraunbudir.jpg or https://..."
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Birta á forsíðu
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={form.is_featured}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_featured: e.target.checked }))
            }
            className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span>Sýna þessa götu í forsíðu-yfirliti.</span>
        </label>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Röðun á forsíðu
        </label>
        <input
          type="number"
          value={form.featured_order}
          onChange={(e) =>
            setForm((f) => ({ ...f, featured_order: Number(e.target.value) || 0 }))
          }
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-[10px] text-slate-500">
          Minni tala birtist vinstra megin. 0 er sjálfgefið.
        </p>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (street ? "Saving changes..." : "Creating street...") : street ? "Save changes" : "Create street"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function BuildingForm({
  building,
  streetId,
  streets,
  onClose,
  onSaved,
}: {
  building: Building | null;
  streetId?: string;
  streets: Street[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    title: building?.title ?? "",
    slug: building?.slug ?? "",
    street_id: building?.street_id ?? streetId ?? "",
    description: building?.description ?? "",
    thumbnail: building?.thumbnail ?? "",
    layout_image: building?.layout_image ?? "",
    minimap_svg: building?.minimap_svg ?? "",
    status: building?.status ?? "",
    is_featured: building?.is_featured ?? false,
    display_order:
      building?.display_order != null && !Number.isNaN(building.display_order)
        ? String(building.display_order)
        : "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      title: building?.title ?? "",
      slug: building?.slug ?? "",
      street_id: building?.street_id ?? streetId ?? "",
      description: building?.description ?? "",
      thumbnail: building?.thumbnail ?? "",
      layout_image: building?.layout_image ?? "",
      minimap_svg: building?.minimap_svg ?? "",
      status: building?.status ?? "",
      is_featured: building?.is_featured ?? false,
      display_order:
        building?.display_order != null && !Number.isNaN(building.display_order)
          ? String(building.display_order)
          : "",
    });
    setFormError(null);
  }, [building, streetId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const title = form.title.trim();
    const slug = form.slug.trim();
    if (!title || !slug) {
      setFormError("Title and slug are required.");
      return;
    }

    setSaving(true);
    try {
      const rawOrder =
        typeof form.display_order === "string"
          ? form.display_order.trim()
          : String(form.display_order);
      const displayOrderTmp =
        rawOrder !== "" && !Number.isNaN(Number(rawOrder))
          ? Number(rawOrder)
          : null;
      const display_order =
        displayOrderTmp !== null && Number.isFinite(displayOrderTmp)
          ? displayOrderTmp
          : null;

      const payload = {
        title,
        slug,
        street_id: form.street_id || null,
        description: form.description.trim() || null,
        thumbnail: form.thumbnail.trim() || null,
        layout_image: form.layout_image.trim() || null,
        minimap_svg: form.minimap_svg.trim() || null,
        status: form.status.trim() || null,
        is_featured: Boolean(form.is_featured),
        display_order,
      };

      const isEdit = Boolean(building);
      const url = isEdit
        ? `/api/admin/buildings/${building!.id}`
        : "/api/admin/buildings";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to save building.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        setFormError(message);
        return;
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="grid gap-3 text-xs md:grid-cols-2"
    >
      {formError && (
        <p className="md:col-span-2 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </p>
      )}
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">Title*</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          maxLength={160}
          required
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">Slug*</label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) =>
            setForm((f) => ({ ...f, slug: e.target.value.replace(/\s+/g, "-") }))
          }
          maxLength={100}
          required
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Street (optional)
        </label>
        <select
          value={form.street_id}
          onChange={(e) => setForm((f) => ({ ...f, street_id: e.target.value }))}
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">No street / none</option>
          {streets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Status (e.g. In sales, Completed)
        </label>
        <input
          type="text"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          maxLength={80}
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Aðalverkefni
        </label>
        <label className="inline-flex items-center gap-2 text-xs text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(form.is_featured)}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_featured: e.target.checked }))
            }
            className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span>Birtist sem stærsta kortið á yfirlitssíðu.</span>
        </label>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Röð
        </label>
        <input
          type="number"
          value={form.display_order}
          onChange={(e) =>
            setForm((f) => ({ ...f, display_order: e.target.value }))
          }
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <p className="text-[10px] text-slate-500">
          Lægri tala = birtist ofar.
        </p>
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-slate-800">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          rows={3}
          maxLength={600}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Thumbnail image URL
        </label>
        <input
          type="text"
          value={form.thumbnail}
          onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
          placeholder="/images/buildings/thumb.jpg or https://..."
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          2D layout image URL
        </label>
        <input
          type="text"
          value={form.layout_image}
          onChange={(e) => setForm((f) => ({ ...f, layout_image: e.target.value }))}
          placeholder="/images/buildings/layout.jpg or https://..."
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-slate-800">
          Minimap SVG URL
        </label>
        <input
          type="text"
          value={form.minimap_svg}
          onChange={(e) =>
            setForm((f) => ({ ...f, minimap_svg: e.target.value }))
          }
          placeholder="/images/projects/.../building-minimap.svg or https://..."
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="mt-3 flex items-center gap-3 md:col-span-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? building
              ? "Saving changes..."
              : "Creating building..."
            : building
            ? "Save changes"
            : "Create building"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ApartmentForm({
  apartment,
  buildingId,
  buildings,
  onClose,
  onSaved,
}: {
  apartment: Apartment | null;
  buildingId?: string;
  buildings: Building[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    building_id: apartment?.building_id ?? buildingId ?? "",
    floor: apartment?.floor != null ? String(apartment.floor) : "",
    number: apartment?.number ?? "",
    status: (apartment?.status as Apartment["status"]) ?? "available",
    size:
      apartment?.size != null && !Number.isNaN(Number(apartment.size))
        ? String(apartment.size)
        : "",
    rooms:
      apartment?.rooms != null && !Number.isNaN(Number(apartment.rooms))
        ? String(apartment.rooms)
        : "",
    layout_image: apartment?.layout_image ?? "",
    parking_spot: apartment?.parking_spot ?? "",
    x_position:
      apartment?.x_position != null &&
      !Number.isNaN(Number(apartment.x_position))
        ? String(apartment.x_position)
        : "",
    y_position:
      apartment?.y_position != null &&
      !Number.isNaN(Number(apartment.y_position))
        ? String(apartment.y_position)
        : "",
    width:
      apartment?.width != null && !Number.isNaN(Number(apartment.width))
        ? String(apartment.width)
        : "",
    height:
      apartment?.height != null && !Number.isNaN(Number(apartment.height))
        ? String(apartment.height)
        : "",
    interior_images: apartment?.interior_images
      ? apartment.interior_images.join("\n")
      : "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      building_id: apartment?.building_id ?? buildingId ?? "",
      floor: apartment?.floor != null ? String(apartment.floor) : "",
      number: apartment?.number ?? "",
      status: (apartment?.status as Apartment["status"]) ?? "available",
      size:
        apartment?.size != null && !Number.isNaN(Number(apartment.size))
          ? String(apartment.size)
          : "",
      rooms:
        apartment?.rooms != null && !Number.isNaN(Number(apartment.rooms))
          ? String(apartment.rooms)
          : "",
      layout_image: apartment?.layout_image ?? "",
      parking_spot: apartment?.parking_spot ?? "",
      x_position:
        apartment?.x_position != null &&
        !Number.isNaN(Number(apartment.x_position))
          ? String(apartment.x_position)
          : "",
      y_position:
        apartment?.y_position != null &&
        !Number.isNaN(Number(apartment.y_position))
          ? String(apartment.y_position)
          : "",
      width:
        apartment?.width != null && !Number.isNaN(Number(apartment.width))
          ? String(apartment.width)
          : "",
      height:
        apartment?.height != null && !Number.isNaN(Number(apartment.height))
          ? String(apartment.height)
          : "",
      interior_images: apartment?.interior_images
        ? apartment.interior_images.join("\n")
        : "",
    });
    setFormError(null);
  }, [apartment, buildingId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const floor = Number(form.floor);
    if (!Number.isFinite(floor)) {
      setFormError("Floor must be a number.");
      return;
    }

    const number = form.number.trim();
    if (!number) {
      setFormError("Apartment number is required.");
      return;
    }

    const status = form.status as "available" | "sold" | "reserved";
    if (!["available", "sold", "reserved"].includes(status)) {
      setFormError("Status must be available, sold, or reserved.");
      return;
    }

    const size = form.size.trim() ? Number(form.size) : null;
    const rooms = form.rooms.trim() ? Number(form.rooms) : null;
    if (size != null && (Number.isNaN(size) || size <= 0)) {
      setFormError("Size must be a positive number if provided.");
      return;
    }
    if (rooms != null && (Number.isNaN(rooms) || rooms <= 0)) {
      setFormError("Rooms must be a positive integer if provided.");
      return;
    }

    const interiorImages = form.interior_images
      .split(/\r?\n|,/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    setSaving(true);
    try {
      const payload = {
        project_id: null,
        building_id: form.building_id || null,
        floor,
        number,
        status,
        size,
        rooms,
        layout_image: form.layout_image.trim() || null,
        parking_spot: form.parking_spot.trim() || null,
        x_position: form.x_position.trim() || null,
        y_position: form.y_position.trim() || null,
        width: form.width.trim() || null,
        height: form.height.trim() || null,
        interior_images: interiorImages,
      };

      const isEdit = Boolean(apartment);
      const url = isEdit
        ? `/api/admin/apartments/${apartment!.id}`
        : "/api/admin/apartments";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to save apartment.";
        try {
          const data = await res.json();
          if (data?.error) message = data.error;
        } catch {
          // ignore
        }
        setFormError(message);
        return;
      }

      await onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="grid gap-3 text-xs md:grid-cols-3"
    >
      {formError && (
        <p className="md:col-span-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
          {formError}
        </p>
      )}
      <div className="space-y-1 md:col-span-1">
        <label className="block text-xs font-medium text-slate-800">
          Building
        </label>
        <select
          value={form.building_id}
          onChange={(e) =>
            setForm((f) => ({ ...f, building_id: e.target.value }))
          }
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">No building (project-only)</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Floor*
        </label>
        <input
          type="number"
          value={form.floor}
          onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
          required
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Apartment number*
        </label>
        <input
          type="text"
          value={form.number}
          onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          maxLength={20}
          required
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">Rooms</label>
        <input
          type="number"
          value={form.rooms}
          onChange={(e) => setForm((f) => ({ ...f, rooms: e.target.value }))}
          min={0}
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Size (m²)
        </label>
        <input
          type="number"
          step="0.1"
          value={form.size}
          onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
          min={0}
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Status*
        </label>
        <select
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          required
          className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>
      <div className="space-y-1 md:col-span-2">
        <label className="block text-xs font-medium text-slate-800">
          Layout image URL
          <span className="ml-1 text-[10px] text-slate-500">
            (recommended ~800×600, landscape)
          </span>
        </label>
        <input
          type="text"
          value={form.layout_image}
          onChange={(e) =>
            setForm((f) => ({ ...f, layout_image: e.target.value }))
          }
          placeholder="/images/apartments/layout-301.png or https://..."
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Parking spot label
        </label>
        <input
          type="text"
          value={form.parking_spot}
          onChange={(e) =>
            setForm((f) => ({ ...f, parking_spot: e.target.value }))
          }
          maxLength={20}
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1 md:col-span-3">
        <label className="block text-xs font-medium text-slate-800">
          Interior image URLs (one per line or comma-separated)
        </label>
        <textarea
          value={form.interior_images}
          onChange={(e) =>
            setForm((f) => ({ ...f, interior_images: e.target.value }))
          }
          rows={3}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          X position (% of width)
        </label>
        <input
          type="number"
          value={form.x_position}
          onChange={(e) =>
            setForm((f) => ({ ...f, x_position: e.target.value }))
          }
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Y position (% of height)
        </label>
        <input
          type="number"
          value={form.y_position}
          onChange={(e) =>
            setForm((f) => ({ ...f, y_position: e.target.value }))
          }
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Width (% of building)
        </label>
        <input
          type="number"
          value={form.width}
          onChange={(e) => setForm((f) => ({ ...f, width: e.target.value }))}
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-800">
          Height (% of building)
        </label>
        <input
          type="number"
          value={form.height}
          onChange={(e) => setForm((f) => ({ ...f, height: e.target.value }))}
          className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="mt-3 flex items-center gap-3 md:col-span-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? apartment
              ? "Saving changes..."
              : "Creating apartment..."
            : apartment
            ? "Save changes"
            : "Create apartment"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
