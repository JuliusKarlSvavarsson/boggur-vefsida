import { FormEvent, useEffect, useMemo, useState } from "react";

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string | null;
  phone: string | null;
  email: string | null;
  sort_order: number | null;
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

export default function TeamAdminSection() {
  const [items, setItems] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 12;

  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    image: "",
    phone: "",
    email: "",
    sortOrder: "",
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/team_members", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load team members");
      const data: TeamMember[] = await res.json();
      setItems(data);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load team members");
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
    return items.filter((m) =>
      [m.name, m.role, m.phone, m.email]
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
    setForm({ name: "", role: "", image: "", phone: "", email: "", sortOrder: "" });
    setFormError(null);
  }

  function startEdit(member: TeamMember) {
    setEditing(member);
    setForm({
      name: member.name,
      role: member.role,
      image: member.image ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      sortOrder:
        member.sort_order != null && !Number.isNaN(member.sort_order)
          ? String(member.sort_order)
          : "",
    });
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const name = form.name.trim();
    const role = form.role.trim();
    if (!name || !role) {
      setFormError("Name and role are required.");
      return;
    }

    const phone = form.phone.trim();
    const email = form.email.trim();
    const sortOrderRaw = form.sortOrder.trim();
    let sort_order: number | null = null;
    if (sortOrderRaw) {
      const parsed = Number(sortOrderRaw);
      if (!Number.isFinite(parsed)) {
        setFormError("Order must be a number.");
        return;
      }
      sort_order = parsed;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        role,
        image: form.image.trim() || null,
        phone: phone || null,
        email: email || null,
        sort_order,
      };

      const isEdit = Boolean(editing);
      const url = isEdit
        ? `/api/admin/team_members/${editing!.id}`
        : "/api/admin/team_members";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = "Failed to save team member.";
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
    const confirmed = window.confirm("Delete this team member?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/team_members/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete team member");
      await load();
      if (editing?.id === id) resetForm();
    } catch (e) {
      alert((e as Error).message ?? "Failed to delete team member");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900">Team members</h2>
          <p className="text-xs text-slate-600">
            Owners and team members displayed in a responsive 2×3 grid on the
            home page and /team.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team..."
            className="h-9 w-full rounded-full border border-slate-200 px-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary sm:w-64"
          />
          <button
            type="button"
            onClick={resetForm}
            className="h-9 rounded-full border border-slate-200 bg-white px-4 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50"
          >
            Add new member
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Name</th>
                <th className="px-3 py-2 font-semibold">Role</th>
                <th className="px-3 py-2 font-semibold">Phone</th>
                <th className="px-3 py-2 font-semibold">Email</th>
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
                    Loading team members...
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-4 text-center text-xs text-slate-500"
                  >
                    No team members found.
                  </td>
                </tr>
              )}
              {paged.map((member) => (
                <tr key={member.id} className="align-top">
                  <td className="px-3 py-3 text-xs text-slate-900">
                    <div className="font-medium">{member.name}</div>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {member.role}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {member.phone ?? ""}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {member.email ?? ""}
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-600">
                    {member.image ? "Custom" : "Default / none"}
                  </td>
                  <td className="px-3 py-3 text-right text-[11px]">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(member)}
                        className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(member.id)}
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

      {/* Live grid preview to mimic the public layout (2 rows of 3 on desktop). */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner">
        <h3 className="text-sm font-semibold text-slate-900">Grid preview</h3>
        <p className="text-xs text-slate-600">
          This simulates the public 2×3 grid (on large screens). On smaller
          screens it collapses to 2 per row, then 1 per row, matching the
          production layout.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 6).map((member) => (
            <div
              key={member.id}
              className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-3 text-center text-xs text-slate-700 shadow-sm"
            >
              <div className="mb-2 h-20 w-20 overflow-hidden rounded-full bg-slate-100">
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                    No image
                  </div>
                )}
              </div>
              <div className="font-semibold text-slate-900">{member.name}</div>
              <div className="text-[11px] text-slate-500">{member.role}</div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-xs text-slate-500">
              Add at least 6 members to fully demonstrate the 2×3 grid.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner">
        <h3 className="mb-2 text-sm font-semibold text-slate-900">
          {editing ? "Edit team member" : "Add new team member"}
        </h3>
        <p className="mb-4 text-xs text-slate-600">
          Recommended headshots are square (e.g. 600×600). Any size is accepted
          but will be center-cropped into a circle to avoid breaking the layout.
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
              Name*
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              maxLength={120}
              required
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Role*
            </label>
            <input
              type="text"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              maxLength={160}
              required
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Phone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              maxLength={32}
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. +354 ..."
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              maxLength={160}
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="name@example.is"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-medium text-slate-800">
              Image URL
              <span className="ml-1 text-[10px] text-slate-500">
                (recommended square headshot, e.g. 600×600)
              </span>
            </label>
            <input
              type="text"
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="/images/team/name.jpg or https://..."
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <ImagePreview
              url={form.image}
              recommended="Preview is cropped to a circle on the public site."
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-800">
              Order
              <span className="ml-1 text-[10px] text-slate-500">
                (optional)
              </span>
            </label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
              className="h-9 w-full rounded-md border border-slate-200 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="1, 2, 3..."
            />
            <p className="text-[10px] text-slate-500">
              Lower numbers appear first. Leave empty to use created date.
            </p>
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
                  : "Creating team member..."
                : editing
                  ? "Save changes"
                  : "Create team member"}
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
