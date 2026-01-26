import ProjectCard from "../components/ProjectCard";

const placeholderProjects = [
  {
    name: "Harborfront Apartments",
    location: "Reykjavík — Placeholder",
    status: "Available Soon",
    imageSrc: "/images/projects/project1.jpg",
  },
  {
    name: "Skyline Residences",
    location: "Reykjavík — Placeholder",
    status: "In Planning",
  },
  {
    name: "Green Park Homes",
    location: "Greater Reykjavík — Placeholder",
    status: "Concept",
  },
];

export default function ProjectsPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
          Projects
        </h1>
        <p className="text-sm text-slate-300 sm:text-base">
          This page lists placeholder Boggur projects. In a future iteration,
          this will be populated from the Neon database and managed through the
          admin panel.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {placeholderProjects.map((project) => (
          <ProjectCard key={project.name} {...project} />
        ))}
      </div>
    </section>
  );
}
