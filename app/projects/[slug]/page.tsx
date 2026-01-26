type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = params;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-primary">
          Project Placeholder
        </p>
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Project: {slug}
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          This is a placeholder for the future interactive apartment selector
          and detailed project information view. The layout will eventually
          include a 2D/3D apartment map, floor selector, and apartment detail
          panel.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-lg border border-dashed border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
          Interactive SVG apartment selector placeholder. This area will host
          the SVG-based apartment and floor plan visualization.
        </div>
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-300">
          <h2 className="text-base font-semibold text-slate-50">
            Apartment details
          </h2>
          <p>
            Placeholder sidebar for apartment details (size, rooms, price,
            status, floorplan, parking spots). This will be populated
            dynamically later.
          </p>
        </div>
      </div>
    </section>
  );
}
