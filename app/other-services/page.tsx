import { headers } from "next/headers";

type OtherService = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
};

async function fetchOtherServices(): Promise<OtherService[]> {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/other_services`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch other services");
  }

  return res.json();
}

export default async function OtherServicesPage() {
  const otherServices = await fetchOtherServices();

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Önnur þjónusta
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Other services are loaded from their own Neon table and can grow
          independently of the primary services list.
        </p>
      </div>
      {otherServices.length === 0 ? (
        <p className="text-sm text-slate-500">
          No other services have been defined yet.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {otherServices.map((service) => (
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
      )}
    </section>
  );
}
