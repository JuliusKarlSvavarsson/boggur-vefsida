"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Street = {
  id: string;
  name: string;
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

function ImagePreview({ url, label }: { url: string; label: string }) {
  if (!url) return null;
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="overflow-hidden rounded border border-slate-200 bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt="Preview" className="h-24 w-full object-cover" />
      </div>
    </div>
  );
}

export default function BuildingsAdminSection() {
  const [streets, setStreets] = useState<Street[]>([]);
  const [items, setItems] = useState<Building[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [streetFilter, setStreetFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [editing, setEditing] = useState<Building | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    street_id: "",
    description: "",
    thumbnail: "",
    layout_image: "",
    minimap_svg: "",
    status: "",
    is_featured: false,
    display_order: "" as string | number,
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [streetsRes, buildingsRes] = await Promise.all([
        fetch("/api/admin/streets", { cache: "no-store" }),
        fetch("/api/admin/buildings", { cache: "no-store" }),
      ]);
      if (!streetsRes.ok || !buildingsRes.ok) {
        throw new Error("Failed to load streets or buildings");
      }
      const streetsData: { id: string; name: string }[] = await streetsRes.json();
      const buildingsData: Building[] = await buildingsRes.json();
      setStreets(streetsData);
      setItems(buildingsData);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load buildings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((b) => {
      if (streetFilter !== "all" && b.street_id !== streetFilter) return false;
      if (!term) return true;
      const street = streets.find((s) => s.id === b.street_id);
      return [b.title, b.slug, b.status ?? "", street?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [items, streets, streetFilter, search]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [search, streetFilter]);

  function resetForm() {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      street_id: "",
      description: "",
      thumbnail: "",
      layout_image: "",
      minimap_svg: "",
      status: "",
      is_featured: false,
      display_order: "",
    });
    setFormError(null);
  }

  function startEdit(building: Building) {
    setEditing(building);
    setForm({
      title: building.title,
      slug: building.slug,
      street_id: building.street_id ?? "",
      description: building.description ?? "",
      thumbnail: building.thumbnail ?? "",
      layout_image: building.layout_image ?? "",
      minimap_svg: building.minimap_svg ?? "",
      status: building.status ?? "",
      is_featured: building.is_featured ?? false,
      display_order:
        building.display_order != null && !Number.isNaN(building.display_order)
          ? String(building.display_order)
          : "",
    });
    setFormError(null);
  }

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

      const isEdit = Boolean(editing);
      const url = isEdit
        ? `/api/admin/buildings/${editing!.id}`
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

      await load();
      resetForm();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this building? Apartments linked to it will also be removed.",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/buildings/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete building");
      await load();
      if (editing?.id === id) resetForm();
    } catch (e) {
      alert((e as Error).message ?? "Failed to delete building");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Buildings</h2>
          <p className="text-xs text-slate-600">
            Buildings belong to streets and define thumbnails and 2D layout
            images used for interactive apartment selectors.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search buildings..."
            className="h-9 w-full rounded-full border border-slate-200 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
          />
          <select
            value={streetFilter}
            onChange={(e) => setStreetFilter(e.target.value)}
            className="h-9 rounded-full border border-slate-200 bg-white px-3 text-[11px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All streets</option>
            {streets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Title</th>
                <th className="px-3 py-2 font-semibold">Street</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Thumb</th>
                <th className="px-3 py-2 font-semibold">Layout</th>
                <th className="px-3 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    Loading buildings...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    No buildings found.
                  </td>
                </tr>
              )}
              {paged.map((b) => {
                const street = streets.find((s) => s.id === b.street_id);
                return (
                  <tr key={b.id} className="align-top">
                    <td className="px-3 py-3 text-xs text-slate-900">
                      <div className="font-medium">{b.title}</div>
                      <div className="text-[11px] text-slate-500">{b.slug}</div>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {street?.name ?? "Unknown"}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {b.status ?? ""}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {b.thumbnail ? "Custom" : "None"}
                    </td>
                    <td className="px-3 py-3 text-[11px] text-slate-600">
                      {b.layout_image ? "Custom" : "None"}
                    </td>
                    <td className="px-3 py-3 text-right text-[11px]">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(b)}
                          className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(b.id)}
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
          {editing ? "Edit building" : "Add new building"}
        </h3>
        <p className="mb-4 text-xs text-slate-600">
          Buildings reference a street, a thumbnail (for the selector), and a
          full 2D layout image (for clickable apartments).
        </p>
        {formError && (
          <p className="mb-3 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {formError}
          </p>
        )}
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Title*
            </label>
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
            <label className="block text-xs font-medium text-slate-800">
              Slug*
            </label>
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
              onChange={(e) =>
                setForm((f) => ({ ...f, street_id: e.target.value }))
              }
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
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={3}
              maxLength={600}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="block text-xs font-medium text-slate-800">
              Thumbnail image URL
            </label>
            <input
              type="text"
              value={form.thumbnail}
              onChange={(e) =>
                setForm((f) => ({ ...f, thumbnail: e.target.value }))
              }
              placeholder="/images/buildings/thumb.jpg or https://..."
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <ImagePreview
              url={form.thumbnail}
              label="Thumbnail is used in the horizontal selector; landscape works best."
            />
          </div>
          <div className="space-y-1 md:col-span-1">
            <label className="block text-xs font-medium text-slate-800">
              2D layout image URL
            </label>
            <input
              type="text"
              value={form.layout_image}
              onChange={(e) =>
                setForm((f) => ({ ...f, layout_image: e.target.value }))
              }
              placeholder="/images/buildings/layout.jpg or https://..."
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <ImagePreview
              url={form.layout_image}
              label="This is the base 2D plan. Apartment overlays use percentage coordinates so any aspect ratio is safe."
            />
          </div>
          <div className="space-y-1 md:col-span-1">
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
            <ImagePreview
              url={form.minimap_svg}
              label="Optional: separate SVG used for the sidebar minimap overview. If empty, a default SVG path based on slug is used."
            />
          </div>
          <div className="mt-2 flex items-center gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? editing
                  ? "Saving changes..."
                  : "Creating building..."
                : editing
                  ? "Save changes"
                  : "Create building"}
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
