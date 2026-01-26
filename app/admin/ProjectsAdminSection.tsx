import { FormEvent, useEffect, useMemo, useState } from "react";

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  location: string | null;
  status: string | null;
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

export default function ProjectsAdminSection() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [editing, setEditing] = useState<Project | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    location: "",
    status: "",
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/projects", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load projects");
      const data: Project[] = await res.json();
      setItems(data);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((p) =>
      [p.title, p.slug, p.location ?? "", p.status ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [items, search]);

  const paged = useMemo(() => {
    const start = page * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  function resetForm() {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      description: "",
      image: "",
      location: "",
      status: "",
    });
    setFormError(null);
  }

  function startEdit(project: Project) {
    setEditing(project);
    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description ?? "",
      image: project.image ?? "",
      location: project.location ?? "",
      status: project.status ?? "",
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
      const payload = {
        title,
        slug,
        description: form.description.trim() || null,
        image: form.image.trim() || null,
        location: form.location.trim() || null,
        status: form.status.trim() || null,
      };

      const isEdit = Boolean(editing);
      const url = isEdit
        ? `/api/admin/projects/${editing!.id}`
        : "/api/admin/projects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to save project.";
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
      "Delete this project? This will also delete its apartments.",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      await load();
      if (editing?.id === id) resetForm();
    } catch (e) {
      alert((e as Error).message ?? "Failed to delete project");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Projects</h2>
          <p className="text-xs text-slate-600">
            Manage projects that appear on the home page and /projects listing.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug, location, status..."
            className="h-9 w-full rounded-full border border-slate-200 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
          />
          <button
            type="button"
            onClick={resetForm}
            className="h-9 rounded-full border border-slate-200 bg-white px-4 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Add new project
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Title</th>
                <th className="px-3 py-2 font-semibold">Slug</th>
                <th className="px-3 py-2 font-semibold">Location</th>
                <th className="px-3 py-2 font-semibold">Status</th>
                <th className="px-3 py-2 font-semibold">Image</th>
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
                    Loading projects...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    No projects found.
                  </td>
                </tr>
              )}
              {paged.map((project) => (
                <tr key={project.id} className="align-top">
                  <td className="px-3 py-3 text-xs text-slate-900">
                    <div className="font-medium">{project.title}</div>
                    {project.description && (
                      <div className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">
                        {project.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {project.slug}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {project.location ?? ""}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {project.status ?? ""}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {project.image ? (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5">
                        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate">Custom</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Default / none</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-[11px]">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(project.id)}
                        className="rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
          {editing ? "Edit project" : "Add new project"}
        </h3>
        <p className="mb-4 text-xs text-slate-600">
          Title and slug are required. Slug should match the public URL (e.g.
          <span className="mx-1 rounded bg-slate-200 px-1 py-0.5 text-[10px] font-mono">
            hraunbudir
          </span>{" "}
          for <span className="font-mono">/projects/hraunbudir</span>.
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
              maxLength={120}
              required
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Slug* (no spaces)
            </label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: e.target.value.replace(/\s+/g, "-") }))
              }
              maxLength={80}
              required
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              maxLength={160}
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Status (e.g. Coming soon, In sales)
            </label>
            <input
              type="text"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              maxLength={80}
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
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
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-slate-800">
              Hero / card image URL
              <span className="ml-1 text-[10px] text-slate-500">
                (recommended ~1920×1080 hero, 1200×800 card)
              </span>
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="/images/projects/hraunbudir.jpg or https://..."
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <ImagePreview
              url={form.image}
              recommended="Image is displayed in a wide card; very tall images will be center-cropped."
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
                  : "Creating project..."
                : editing
                  ? "Save changes"
                  : "Create project"}
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
