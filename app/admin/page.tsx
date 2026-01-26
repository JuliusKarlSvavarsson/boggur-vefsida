"use client";

import { useState } from "react";

import ProjectsAdminSection from "./ProjectsAdminSection";
import ApartmentsAdminSection from "./ApartmentsAdminSection";
import ServicesAdminSection from "./ServicesAdminSection";
import OtherServicesAdminSection from "./OtherServicesAdminSection";
import TeamAdminSection from "./TeamAdminSection";

type TabId =
  | "projects"
  | "apartments"
  | "services"
  | "other_services"
  | "team";

const TABS: { id: TabId; label: string; description: string }[] = [
  {
    id: "projects",
    label: "Projects",
    description: "Manage projects, slugs, locations, statuses, and hero images.",
  },
  {
    id: "apartments",
    label: "Apartments",
    description: "Manage apartments per project, floors, sizes, and status.",
  },
  {
    id: "services",
    label: "Services",
    description: "Primary services shown on the home page and /services.",
  },
  {
    id: "other_services",
    label: "Other Services",
    description: "Önnur þjónusta content for the home page and dedicated page.",
  },
  {
    id: "team",
    label: "Team Members",
    description: "Owners / team grid used on the home page and /team.",
  },
];

export default function AdminPage() {
  const [active, setActive] = useState<TabId>("projects");

  const activeTab = TABS.find((t) => t.id === active) ?? TABS[0];

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-600 sm:text-base">
          Manage projects, apartments, services, other services, and team data.
          Changes are stored in Neon and reflect on the live site without
          redeploys.
        </p>
      </header>

      <div className="overflow-hidden rounded-full border border-slate-200 bg-slate-50 p-1 text-xs shadow-sm">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={`flex-1 rounded-full px-3 py-2 font-medium transition-colors sm:flex-none sm:px-4 ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-slate-500">{activeTab.description}</p>

      <div className="rounded-2xl border border-slate-200 bg-surface p-4 shadow-sm sm:p-5">
        {active === "projects" && <ProjectsAdminSection />}
        {active === "apartments" && <ApartmentsAdminSection />}
        {active === "services" && <ServicesAdminSection />}
        {active === "other_services" && <OtherServicesAdminSection />}
        {active === "team" && <TeamAdminSection />}
      </div>
    </section>
  );}
