import BuildingGridClient from "./BuildingGridClient";

export default function BuildingSelectorPage() {
  return (
    <section className="mt-20 py-6 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Byggingar og íbúðir
          </h1>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
            Veldu annaðhvort götu eða staka byggingu til að skoða íbúðir.
          </p>
          <p className="text-xs text-slate-500">
            Gata inniheldur fleiri byggingar. Stök bygging er sjálfstætt verkefni.
          </p>
        </header>

        <BuildingGridClient />
      </div>
    </section>
  );
}
