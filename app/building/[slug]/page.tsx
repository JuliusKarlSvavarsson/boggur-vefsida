import BuildingDetailClient from "../BuildingDetailClient";

export default function BuildingDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <section className="space-y-6">
      <BuildingDetailClient slug={params.slug} />
    </section>
  );
}
