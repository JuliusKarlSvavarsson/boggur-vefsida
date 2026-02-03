import BuildingDetailClient from "../BuildingDetailClient";

export default function BuildingDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <section className="mt-24 sm:mt-28 space-y-6 mx-[-1rem] sm:mx-[-1.5rem] lg:mx-[-3rem]">
      <BuildingDetailClient slug={params.slug} />
    </section>
  );
}
