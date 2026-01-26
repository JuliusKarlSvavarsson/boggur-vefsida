import ProjectDetailClient from "./ProjectDetailClient";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  return <ProjectDetailClient slug={params.slug} />;
}
