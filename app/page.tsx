import Link from "next/link";
import Button from "./components/Button";
import ProjectCard from "./components/ProjectCard";
import TeamCard from "./components/TeamCard";
import HeroSlider from "./components/HeroSlider";

const homeProjects = [
  {
    name: "Urban Apartments",
    location: "Reykjavík — Placeholder",
    status: "Planned",
    slug: "urban-apartments",
  },
  {
    name: "Harbor View Residences",
    location: "Reykjavík — Placeholder",
    status: "Coming Soon",
    slug: "harbor-view-residences",
  },
  {
    name: "Suburban Family Homes",
    location: "Greater Reykjavík — Placeholder",
    status: "In Design",
    slug: "suburban-family-homes",
  },
  {
    name: "Commercial Complex",
    location: "Reykjavík — Placeholder",
    status: "Concept",
    slug: "commercial-complex",
  },
];

const priorityServices = [
  {
    title: "Project development",
    description:
      "End-to-end coordination from early studies through detailed design and construction.",
  },
  {
    title: "Sales & marketing",
    description:
      "Planning of apartment mix, pricing strategy, and sales material tailored to each project.",
  },
  {
    title: "Buyer guidance",
    description:
      "Support for buyers around floorplan selection, options, and communication.",
  },
  {
    title: "Advisory",
    description:
      "Support around financing and structuring real estate projects in cooperation with partners.",
  },
];

const teamMembers = [
  {
    name: "Owner 1",
    role: "Founder / Owner",
  },
  {
    name: "Owner 2",
    role: "Founder / Owner",
  },
  {
    name: "Owner 3",
    role: "Owner",
  },
  {
    name: "Owner 4",
    role: "Owner",
  },
  {
    name: "Owner 5",
    role: "Owner",
  },
  {
    name: "Owner 6",
    role: "Owner",
  },
];

const otherServices = [
  {
    title: "Consulting for investors",
    description: "Bespoke consulting services around specific projects or portfolios.",
  },
  {
    title: "Feasibility studies",
    description: "Early-stage analysis of location, zoning, and potential layouts.",
  },
  {
    title: "Partnership structures",
    description: "Structuring cooperation between different parties around a project.",
  },
  {
    title: "Other advisory",
    description: "Placeholder for additional services that may be added later.",
  },
];

export default function HomePage() {
  return (
    <div className="-mx-4 space-y-0 sm:-mx-6 lg:-mx-12">
      {/* 1. Hero / slider */}
      <HeroSlider />

      {/* 2. Projects section */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Our Projects
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Residential and mixed-use projects in development.
              </h2>
              <p className="max-w-2xl text-base text-slate-600 lg:text-lg lg:leading-relaxed">
                Placeholder examples of how Boggur will present current and
                upcoming buildings, apartments, and mixed-use developments.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button href="/projects">Browse all projects</Button>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {homeProjects.map((project) => (
              <Link key={project.slug} href={`/projects/${project.slug}`}>
                <ProjectCard
                  name={project.name}
                  location={project.location}
                  status={project.status}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Priority services */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 space-y-3 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Priority services
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Helstu þjónustur Boggur.
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-600 lg:max-w-3xl lg:text-lg lg:leading-relaxed">
              Overview of the primary services Boggur provides around planning,
              design, and execution of real estate projects.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {priorityServices.map((service) => (
              <div
                key={service.title}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {service.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Team section */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 space-y-3 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Our team
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Við eigendur.
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-600 lg:max-w-3xl lg:text-lg lg:leading-relaxed">
              Placeholder owners behind Boggur projects. In the live version,
              this section will pull data and photos for each owner.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <TeamCard
                key={member.name}
                name={member.name}
                role={member.role}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Other services */}
      <section id="other-services" className="bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mb-10 space-y-3 text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">
              Önnur þjónusta
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Additional services around each project.
            </h2>
            <p className="mx-auto max-w-2xl text-base text-slate-200 lg:max-w-3xl lg:text-lg lg:leading-relaxed">
              Placeholder overview of other services Boggur can offer. Each card
              can later link to a specific service page.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {otherServices.map((service) => (
              <Link
                key={service.title}
                href="/services"
                className="group flex flex-col rounded-2xl border border-slate-700 bg-slate-900/60 p-6 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-primary/40 via-primary/25 to-secondary/40 opacity-80 transition-opacity group-hover:opacity-100" />
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
