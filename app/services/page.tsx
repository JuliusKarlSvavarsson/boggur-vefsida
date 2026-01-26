const services = [
  {
    title: "Residential Development",
    description:
      "Placeholder description for Boggur residential projects, from small apartment buildings to larger complexes.",
  },
  {
    title: "Commercial Construction",
    description:
      "Placeholder description for commercial and mixed-use developments, aligned with Boggur&apos;s portfolio.",
  },
  {
    title: "Project Management",
    description:
      "Placeholder description for planning, coordination, and delivery services across all construction phases.",
  },
];

export default function ServicesPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Services
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          This page outlines placeholder services for Boggur 2.0. The final
          content and layout will reference the current boggur.is site while
          adopting a clean, modern presentation.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 shadow-sm"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-50">
              {service.title}
            </h2>
            <p className="text-sm text-slate-300">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
