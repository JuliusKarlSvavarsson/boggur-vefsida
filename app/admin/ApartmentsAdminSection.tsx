import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Project } from "./ProjectsAdminSection";

export type Apartment = {
  id: string;
  project_id: string;
  floor: number;
  number: string;
  status: string;
  size: number | null;
  rooms: number | null;
  layout_image: string | null;
  parking_spot: string | null;
  created_at: string;
};

function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const pageCount = Math.ceil(total / pageSize);
  if (pageCount <= 1) return null;

  const start = page * pageSize;
  const end = Math.min(start + pageSize, total);

  return (
    <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
      <span>
        Showing {start + 1}-{end} of {total}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount - 1}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ImagePreview({ url, recommended }: { url: string; recommended?: string }) {
  if (!url) return null;
  return (
    <div className="mt-2 space-y-1">
      {recommended && <p className="text-xs text-slate-500">{recommended}</p>}
      <div className="overflow-hidden rounded border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Preview" className="h-24 w-full object-cover" />
      </div>
    </div>
  );
}

export default function ApartmentsAdminSection() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [editing, setEditing] = useState<Apartment | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    project_id: "",
    floor: "",
    number: "",
    status: "available",
    size: "",
    rooms: "",
    layout_image: "",
    parking_spot: "",
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [apartmentsRes, projectsRes] = await Promise.all([
        fetch("/api/admin/apartments", { cache: "no-store" }),
        fetch("/api/admin/projects", { cache: "no-store" }),
      ]);
      if (!apartmentsRes.ok || !projectsRes.ok) {
        throw new Error("Failed to load apartments or projects");
      }
      const apartmentsData: Apartment[] = await apartmentsRes.json();
      const projectsData: Project[] = await projectsRes.json();
      setApartments(apartmentsData);
      setProjects(projectsData);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load apartments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function resetForm() {
    setEditing(null);
    setForm({
      project_id: "",
      floor: "",
      number: "",
      status: "available",
      size: "",
      rooms: "",
      layout_image: "",
      parking_spot: "",
    });
    setFormError(null);
  }

  function startEdit(apartment: Apartment) {
    setEditing(apartment);
    setForm({
      project_id: apartment.project_id,
      floor: String(apartment.floor ?? ""),
      number: apartment.number,
      status: apartment.status,
      size:
        apartment.size != null && !Number.isNaN(Number(apartment.size))
          ? String(apartment.size)
          : "",
      rooms:
        apartment.rooms != null && !Number.isNaN(Number(apartment.rooms))
          ? String(apartment.rooms)
          : "",
      layout_image: apartment.layout_image ?? "",
      parking_spot: apartment.parking_spot ?? "",
    });
    setFormError(null);
  }

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    for (const p of projects) map.set(p.id, p);
    return map;
  }, [projects]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return apartments.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (projectFilter !== "all" && a.project_id !== projectFilter) return false;
      if (!term) return true;
      const project = projectMap.get(a.project_id);
      return [
        a.number,
        String(a.floor),
        project?.title ?? "",
        project?.location ?? "",
        a.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [apartments, statusFilter, projectFilter, search, projectMap]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter, projectFilter]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.project_id) {
      setFormError("Project is required.");
      return;
    }

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

    setSaving(true);
    try {
      const payload = {
        project_id: form.project_id,
        floor,
        number,
        status,
        size,
        rooms,
        layout_image: form.layout_image.trim() || null,
        parking_spot: form.parking_spot.trim() || null,
      };

      const isEdit = Boolean(editing);
      const url = isEdit
        ? `/api/admin/apartments/${editing!.id}`
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

      await load();
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this apartment?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/apartments/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete apartment");
      await load();
      if (editing?.id === id) resetForm();
    } catch (e) {
      alert((e as Error).message ?? "Failed to delete apartment");
    }
  }

  function toggleStatus(apartment: Apartment) {
    const nextStatus = apartment.status === "sold" ? "available" : "sold";
    void (async () => {
      try {
        const res = await fetch(`/api/admin/apartments/${apartment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...apartment,
            status: nextStatus,
          }),
        });
        if (!res.ok) throw new Error("Failed to toggle status");
        await load();
      } catch (e) {
        alert((e as Error).message ?? "Failed to toggle status");
      }
    })();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Apartments</h2>
          <p className="text-xs text-slate-600">
            Manage apartments per project. Status drives the colors and labels
            on the public site.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by number, floor, project, status..."
            className="h-9 w-full rounded-full border border-slate-200 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
          />
          <div className="flex gap-2 text-[11px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-full border border-slate-200 bg-white px-3 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All statuses</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="h-9 max-w-[180px] rounded-full border border-slate-200 bg-white px-3 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Project</th>
                <th className="px-3 py-2 font-semibold">Number</th>
                <th className="px-3 py-2 font-semibold">Floor</th>
                <th className="px-3 py-2 font-semibold">Rooms</th>
                <th className="px-3 py-2 font-semibold">Size (m²)</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Layout image</th>
                <th className="px-3 py-2 font-semibold">Parking</th>
                <th className="px-3 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    Loading apartments...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    No apartments found.
                  </td>
                </tr>
              )}
              {paged.map((apt) => {
                const project = projectMap.get(apt.project_id);
                const statusClass =
                  apt.status === "available"
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                    : apt.status === "sold"
                    ? "bg-red-50 text-red-700 ring-red-100"
                    : "bg-amber-50 text-amber-700 ring-amber-100";
                return (
                  <tr key={apt.id} className="align-top">
                    <td className="px-3 py-3 text-xs text-slate-900">
                      <div className="font-medium">
                        {project?.title ?? "Unknown project"}
                      </div>
                      {project?.location && (
                        <div className="text-[11px] text-slate-500">
                          {project.location}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700">
                      {apt.number}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700">
                      {apt.floor}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700">
                      {apt.rooms ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-700">
                      {apt.size ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <button
                        type="button"
                        onClick={() => toggleStatus(apt)}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${statusClass}`}
                        title="Click to toggle between available and sold"
                      >
                        {apt.status}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {apt.layout_image ? "Custom" : "Default / none"}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {apt.parking_spot ?? "-"}
                    </td>
                    <td className="px-3 py-3 text-right text-[11px]">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(apt)}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(apt.id)}
                          className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-3 pb-3">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={setPage}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {editing ? "Edit apartment" : "Add new apartment"}
        </h3>
        <p className="mb-4 text-xs text-slate-600">
          Apartments are grouped by project and floor on the public site. Use a
          consistent apartment number format (e.g. 301, 3A).
        </p>
        {formError && (
          <p className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {formError}
          </p>
        )}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="grid gap-3 md:grid-cols-3"
        >
          <div className="space-y-1 md:col-span-1">
            <label className="block text-xs font-medium text-slate-800">
              Project*
            </label>
            <select
              value={form.project_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, project_id: e.target.value }))
              }
              required
              className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
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
            <label className="block text-xs font-medium text-slate-800">
              Rooms
            </label>
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
              onChange={(e) =>
                setForm((f) => ({ ...f, status: e.target.value }))
              }
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
              type="url"
              value={form.layout_image}
              onChange={(e) =>
                setForm((f) => ({ ...f, layout_image: e.target.value }))
              }
              placeholder="/images/apartments/layout-301.png or https://..."
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <ImagePreview
              url={form.layout_image}
              recommended="Image appears in apartment cards; it is center-cropped so extreme sizes will not break layout."
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
          <div className="mt-2 flex items-center gap-3 md:col-span-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? editing
                  ? "Saving changes..."
                  : "Creating apartment..."
                : editing
                  ? "Save changes"
                  : "Create apartment"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
