import { headers } from "next/headers";
import ServicesHero from "../components/ServicesHero";
import ServicesGrid, { type Service } from "../components/ServicesGrid";
import ServicesExamplesList from "../components/ServicesExamplesList";
import ServicesImageBand from "../components/ServicesImageBand";
import ServicesFinalCTA from "../components/ServicesFinalCTA";

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

export default async function ThjonusturPage() {
  const services = await fetchServices();

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-12">
      <ServicesHero />

      <main className="space-y-16 bg-white py-16 sm:py-20">
        <section className="bg-[#ece9e2] py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ServicesGrid services={services} />
          </div>
        </section>

        <ServicesImageBand />

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <ServicesExamplesList />
        </div>
      </main>

      <ServicesFinalCTA />
    </div>
  );
}
