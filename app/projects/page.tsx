import Link from "next/link";
import { headers } from "next/headers";
import ProjectCard from "../components/ProjectCard";

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  location: string | null;
  status: string | null;
};

async function fetchProjects(): Promise<Project[]> {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const res = await fetch(`${baseUrl}/api/projects`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to fetch projects");
  }

  return res.json();
}

export default async function ProjectsPage() {
  const projects = await fetchProjects();

  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Projects
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Projects are loaded dynamically from the Neon database. Each card
          represents a project that can be managed from the future admin panel.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.slug}`}>
            <ProjectCard
              name={project.title}
              location={project.location ?? ""}
              status={project.status ?? ""}
              description={project.description ?? undefined}
              imageSrc={project.image ?? undefined}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
