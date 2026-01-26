import Button from "./components/Button";
import ProjectCard from "./components/ProjectCard";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Boggur 2.0
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl lg:text-5xl">
            Modern construction & real estate presentation for 2026.
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            This is the new foundation for Boggur&apos;s digital presence. The
            current layout mirrors the structure of boggur.is but is rebuilt
            using a modern, component-based Next.js 14 + Tailwind stack.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/projects">View Projects</Button>
            <Button href="/contact" variant="secondary">
              Contact Boggur
            </Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProjectCard
            name="Urban Apartments"
            location="Reykjavík — Placeholder"
            status="Planned"
          />
          <ProjectCard
            name="Harbor View Residences"
            location="Reykjavík — Placeholder"
            status="Coming Soon"
          />
          <ProjectCard
            name="Suburban Family Homes"
            location="Greater Reykjavík — Placeholder"
            status="In Design"
          />
          <ProjectCard
            name="Commercial Complex"
            location="Reykjavík — Placeholder"
            status="Concept"
          />
        </div>
      </section>
    </div>
  );
}
