import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import TeamCard from "../components/TeamCard";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  image: string | null;
  phone?: string | null;
  email?: string | null;
};

async function fetchTeam(): Promise<TeamMember[]> {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/team_members`, { cache: "no-store" });
  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function UmBoggurPage() {
  const team = await fetchTeam();
  const hasTeam = team.length > 0;

  return (
    <div
      className="flex flex-col"
      style={{ paddingTop: "var(--header-height)" }}
    >
     {/* Hero */}
<section className="relative overflow-hidden bg-slate-950 text-white">
  <div className="absolute inset-0">
    <Image
      src="/images/team/Pollamót.jpg"
      alt="Verkefni frá Böggur"
      fill
      priority
      sizes="100vw"
      className="h-full w-full object-cover object-[50%_22%]"
    />

    {/* Gradients container */}
    <div className="absolute inset-0">
      {/* Bottom gradient (your existing one) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-slate-950/25 to-slate-950/5" />

      {/* Side shading */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/50" />
    </div>
  </div>

  <div className="relative mx-auto flex max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
    <div className="max-w-3xl space-y-3 sm:space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
        Um Bögg
      </h1>
      <p className="text-sm font-medium text-slate-100 sm:text-base">
        Byggingar og fasteignaþróun.
      </p>
      <p className="max-w-xl text-sm text-slate-100/85 sm:text-base sm:leading-relaxed">
        Böggur sinnir þróun og uppbyggingu íbúðarverkefna ásamt framkvæmdum fyrir
        viðskiptavini.
      </p>
    </div>
  </div>
</section>

      {/* Company overview */}
      <section className="bg-[#F6F5F2]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-xl space-y-3">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Starfsemi
            </h2>
            <p className="text-sm text-slate-700 sm:text-base">
              Starfsemi Böggs skiptist í þróun eigin verkefna og verktakaþjónustu fyrir
              viðskiptavini.
            </p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 md:gap-x-12 md:divide-x md:divide-slate-200">
            <div className="space-y-3 text-sm text-slate-700 md:pr-8">
              <h3 className="text-base font-semibold text-slate-900">
                Fasteignaþróun og sala íbúða
              </h3>
              <ul className="space-y-1 list-disc pl-5">
                <li>Skipulagning og hönnun íbúðarverkefna í samvinnu við hönnuði.</li>
                <li>Framkvæmdir og verkstýring frá upphafi til afhendingar.</li>
                <li>Söluhald og eftirfylgni vegna afhentrar eignar.</li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/building"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-xs font-medium text-slate-900 transition-colors duration-200 ease-out hover:border-slate-400 hover:bg-slate-100"
                >
                  <span>Skoða íbúðir</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-700 md:pl-8">
              <h3 className="text-base font-semibold text-slate-900">
                Verktakaþjónusta fyrir viðskiptavini
              </h3>
              <ul className="space-y-1 list-disc pl-5">
                <li>Framkvæmdir fyrir einstaklinga, húsfélög og fyrirtæki.</li>
                <li>Viðhald, endurbætur og stakar sérverkefnir.</li>
                <li>Samvinna við aðra fagaðila á verkstað.</li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-xs font-medium text-slate-900 transition-colors duration-200 ease-out hover:border-slate-400 hover:bg-slate-100"
                >
                  <span>Skoða þjónustu</span>
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process / working method */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <header className="mb-8 max-w-xl space-y-2">
            <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              Vinnulag
            </h2>
            <p className="text-sm text-slate-600 sm:text-base">
              Skýr verkferill hjálpar til við að halda verkefnum á áætlun og innan
              ramma.
            </p>
          </header>
          <ol className="grid gap-6 text-sm text-slate-700 sm:grid-cols-2">
            <li className="space-y-1.5 rounded-md border border-slate-200 bg-[#F8F7F3] p-4 shadow-sm transition-colors transition-shadow duration-200 ease-out hover:border-slate-300 hover:bg-[#f5f3ed] hover:shadow-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                01
              </p>
              <p className="text-sm font-semibold text-slate-900">Áætlun</p>
              <p className="text-sm text-slate-600">
                Verkefni er skilgreint, umfang rammað inn og gerð raunhæf tíma- og kostnaðaráætlun.
              </p>
            </li>
            <li className="space-y-1.5 rounded-md border border-slate-200 bg-[#F8F7F3] p-4 shadow-sm transition-colors transition-shadow duration-200 ease-out hover:border-slate-300 hover:bg-[#f5f3ed] hover:shadow-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                02
              </p>
              <p className="text-sm font-semibold text-slate-900">Samvinna</p>
              <p className="text-sm text-slate-600">
                Haldnir eru reglulegir fundir með hönnuðum og verkkaupum um næstu skref.
              </p>
            </li>
            <li className="space-y-1.5 rounded-md border border-slate-200 bg-[#F8F7F3] p-4 shadow-sm transition-colors transition-shadow duration-200 ease-out hover:border-slate-300 hover:bg-[#f5f3ed] hover:shadow-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                03
              </p>
              <p className="text-sm font-semibold text-slate-900">Framkvæmd</p>
              <p className="text-sm text-slate-600">
                Verk eru unnin samkvæmt verklýsingu með eftirfylgni á gæðum og öryggi á verkstað.
              </p>
            </li>
            <li className="space-y-1.5 rounded-md border border-slate-200 bg-[#F8F7F3] p-4 shadow-sm transition-colors transition-shadow duration-200 ease-out hover:border-slate-300 hover:bg-[#f5f3ed] hover:shadow-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                04
              </p>
              <p className="text-sm font-semibold text-slate-900">Afhending</p>
              <p className="text-sm text-slate-600">
                Verk lokið, framkvæmd tekin formlega út með verkkaupum.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* Team section */}
      {hasTeam && (
        <section
          id="teymid"
          className="border-t border-slate-200 bg-[#EFEDE8]"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <header className="mb-8 space-y-2">
              <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                Teymið
              </h2>
              <p className="max-w-2xl text-sm text-slate-700 sm:text-base">
                Verkefni Böggs eru leidd af litlu teymi eigenda og lykilstarfsmanna með
                reynslu úr byggingum og fasteignaþróun.
              </p>
            </header>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
                <TeamCard
                  key={member.id}
                  name={member.name}
                  role={member.role}
                  imageSrc={member.image ?? undefined}
                  phone={member.phone ?? undefined}
                  email={member.email ?? undefined}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact block */}
      <section className="border-t border-slate-200 bg-[#f3f1eb]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
            Hafa samband
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
            Ef þú ert með verkefni í undirbúningi eða vilt fá frekari upplýsingar um
            starfsemi Böggs er hægt að senda fyrirspurn í gegnum síðu fyrirtækisins.
          </p>
          <div className="mt-3 text-sm text-slate-800">
            <Link
              href="/hafa-samband"
              className="font-medium text-slate-900 underline-offset-4 hover:underline"
            >
              Opna fyrirspurnarform
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
