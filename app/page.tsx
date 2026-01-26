import Link from "next/link";
import { headers } from "next/headers";
import Button from "./components/Button";
import ProjectCard from "./components/ProjectCard";
import TeamCard from "./components/TeamCard";
import HeroSlider from "./components/HeroSlider";

type ApiProject = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  location: string | null;
  status: string | null;
};

type ApiService = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
};

type ApiTeamMember = {
  id: string;
  name: string;
  role: string;
  image: string | null;
};

export default async function HomePage() {
  const headersList = headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const [projectsRes, servicesRes, otherServicesRes, teamRes] = await Promise.all([
    fetch(`${baseUrl}/api/projects`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/services`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/other_services`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/team_members`, { cache: "no-store" }),
  ]);

  if (!projectsRes.ok) throw new Error("Failed to fetch projects for Home page");
  if (!servicesRes.ok) throw new Error("Failed to fetch services for Home page");
  if (!otherServicesRes.ok) throw new Error("Failed to fetch other services for Home page");
  if (!teamRes.ok) throw new Error("Failed to fetch team for Home page");

  const projects: ApiProject[] = await projectsRes.json();
  const services: ApiService[] = await servicesRes.json();
  const otherServices: ApiService[] = await otherServicesRes.json();
  const team: ApiTeamMember[] = await teamRes.json();

  const priorityServices = services;

  // Show up to 3 featured projects on the home page
  const featuredProjects = projects.slice(0, 3);

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
            {featuredProjects.map((project) => (
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
                key={service.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 h-32 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10" />
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                  {service.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {service.description ?? "Service description coming soon."}
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
            {team.map((member) => (
              <TeamCard
                key={member.id}
                name={member.name}
                role={member.role}
                imageSrc={member.image ?? undefined}
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
                key={service.id}
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
