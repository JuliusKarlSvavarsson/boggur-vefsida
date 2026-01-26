export default function AdminPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Admin Dashboard (Placeholder)
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          This is a UI-only placeholder for the future Boggur admin panel. It
          will eventually manage projects, buildings, floors, apartments,
          parking spots, and analytics using data from Neon.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600 shadow-sm">
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            Projects
          </h2>
          <p>Placeholder for project list, filters, and quick actions.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600 shadow-sm">
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            Apartments & Parking
          </h2>
          <p>Placeholder for apartment and parking CRUD views.</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600 shadow-sm">
          <h2 className="mb-2 text-base font-semibold text-slate-900">
            Analytics
          </h2>
          <p>Placeholder for availability, sales, and occupancy metrics.</p>
        </div>
      </div>
    </section>
  );
}
