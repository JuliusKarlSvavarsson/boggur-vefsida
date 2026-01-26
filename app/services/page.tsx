import { headers } from "next/headers";

type Service = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
};

async function fetchServices(): Promise<Service[]> {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/services`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch services");
  }

  return res.json();
}

export default async function ServicesPage() {
  const services = await fetchServices();

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Services
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Services are loaded dynamically from the Neon database. The final
          content will mirror the current boggur.is services while keeping this
          modern layout.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.id}
            className="rounded-xl border border-slate-200 bg-surface p-4 text-sm text-slate-600 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <h2 className="mb-2 text-lg font-semibold text-slate-900">
              {service.title}
            </h2>
            <p className="text-sm text-slate-600">
              {service.description ?? "Service description coming soon."}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
