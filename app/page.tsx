import Button from "./components/Button";
import ProjectCard from "./components/ProjectCard";
import HeroBanner from "./components/HeroBanner";

export default function HomePage() {
  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-12">
      {/* Hero section */}
      <section className="bg-gradient-to-b from-white via-primary/5 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <HeroBanner
            title="Modern construction & real estate presentation for 2026."
            subtitle="Boggur 2.0 presents current and future developments with clear apartment availability, interactive selectors, and a streamlined experience for buyers."
            ctaLabel="View projects"
            ctaHref="/projects"
            secondaryCtaLabel="Contact Boggur"
            secondaryCtaHref="/contact"
          />
        </div>
      </section>

      {/* Featured projects */}
      <section className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Featured projects
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                Residential and mixed-use projects in the Boggur pipeline.
              </h2>
              <p className="max-w-2xl text-sm text-slate-600 sm:text-base">
                These cards are placeholders for live projects and will be
                connected to the Boggur admin panel and Neon database in later
                steps.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/projects">Browse all projects</Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>
    </div>
  );
}
