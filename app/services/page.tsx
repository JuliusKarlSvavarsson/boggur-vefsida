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
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Services
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          This page outlines placeholder services for Boggur 2.0. The final
          content and layout will reference the current boggur.is site while
          adopting a clean, modern presentation.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            className="rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              {service.title}
            </h2>
            <p className="text-sm text-slate-600">{service.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
