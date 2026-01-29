import BuildingExplorer from "./BuildingExplorer";

export default function BuildingSelectorPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Íbúðir eftir götu og húsi.
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Veldu hús við götuna og skoðaðu íbúðirnar beint í teikningunni. Allar
          upplýsingar koma beint úr gagnagrunni Boggur.
        </p>
      </header>
      <BuildingExplorer />
    </section>
  );
}
