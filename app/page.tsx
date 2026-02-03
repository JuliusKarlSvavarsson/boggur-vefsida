import Link from "next/link";
import { headers } from "next/headers";
import HeroSlider from "./components/HeroSlider";
import FeaturedStreetsSection from "./components/FeaturedStreetsSection";
import ArchitecturalImageBand from "./components/ArchitecturalImageBand";
import HomeFinalCta from "./components/HomeFinalCta";

type ApiFeaturedStreetBuilding = {
  id: string;
  slug: string;
  title: string;
  street_id: string;
  thumbnail: string | null;
  status: string | null;
  total_apartments: number;
  available_apartments: number;
  sold_apartments: number;
};

type ApiFeaturedStreet = {
  id: string;
  name: string;
  image: string | null;
  total_apartments: number;
  available_apartments: number;
  sold_apartments: number;
  buildings: ApiFeaturedStreetBuilding[];
};

export default async function HomePage() {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const featuredStreetsRes = await fetch(
    `${baseUrl}/api/featured_streets`,
    { cache: "no-store" },
  );

  let featuredStreets: ApiFeaturedStreet[] = [];
  if (featuredStreetsRes.ok) {
    featuredStreets = (await featuredStreetsRes.json()) as ApiFeaturedStreet[];
  }

  return (
    <div className="-mx-4 space-y-0 sm:-mx-6 lg:-mx-12">
      {/* 1. Hero / slider */}
      <HeroSlider />

      {/* 2. Featured streets / projects section */}
      <FeaturedStreetsSection streets={featuredStreets} />

      <ArchitecturalImageBand />

      {/* 3. Hvað Böggur gerir */}
      <section className="relative bg-[#f4f3f1] py-20">
        <div
          className="pointer-events-none absolute inset-x-0 -top-12 h-12 bg-[#f4f3f1]"
          style={{ clipPath: "polygon(0 100%, 100% 70%, 100% 100%, 0 100%)" }}
          aria-hidden="true"
        />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10 max-w-xl space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Hvað Böggur gerir
            </h2>
            <p className="text-sm text-slate-600 sm:text-base sm:leading-snug">
              Bygging og þróun eigin verkefna, ásamt þjónustu fyrir aðra.
            </p>
          </header>

          <div className="grid gap-10 md:grid-cols-3 md:gap-12">
            <div className="space-y-3 text-sm text-slate-600">
              <h3 className="text-base font-semibold text-slate-900">
                Framkvæmdir fyrir aðra
              </h3>
              <p>
                Bygging, viðhald og endurbætur fyrir einstaklinga, fyrirtæki og
                húsfélög.
              </p>
              <Link
                href="/thjonustur"
                className="inline-flex text-sm font-medium text-slate-900 underline-offset-4 hover:underline hover:text-slate-700 transition-colors duration-200"
              >
                Skoða þjónustu
              </Link>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <h3 className="text-base font-semibold text-slate-900">
                Önnur þjónusta
              </h3>
              <p>
                Sérsmíði og framleiðsla fyrir byggingariðnað.
                <br />
                Málmvinnsla og sérlausnir.
              </p>
              <Link
                href="/onnur-thjonusta"
                className="inline-flex text-sm font-medium text-slate-900 underline-offset-4 hover:underline hover:text-slate-700 transition-colors duration-200"
              >
                Skoða aðra þjónustu
              </Link>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <h3 className="text-base font-semibold text-slate-900">Fólkið</h3>
              <p>
                Reynsla, ábyrgð og skýr ferli.
                <br />
                Stór og samhentur hópur.
              </p>
              <Link
                href="/um-boggur#teymid"
                className="inline-flex text-sm font-medium text-slate-900 underline-offset-4 hover:underline hover:text-slate-700 transition-colors duration-200"
              >
                Kynnast teyminu
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeFinalCta />
    </div>
  );
}
