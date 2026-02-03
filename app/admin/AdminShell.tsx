"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS: { href: string; label: string; description?: string }[] = [
  {
    href: "/admin/projects",
    label: "Projects",
    description: "Streets, buildings, apartments hierarchy",
  },
  {
    href: "/admin/services",
    label: "Services",
    description: "Primary services shown on the site",
  },
  {
    href: "/admin/other-services",
    label: "Önnur þjónusta",
    description: "Vörur í sölu",
  },
  {
    href: "/admin/team",
    label: "Team Members",
    description: "Owners / team grid",
  },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-0 flex bg-slate-50">
      <aside className="hidden h-full w-64 flex-none border-r border-slate-200 bg-slate-50/80 p-4 sm:block">
        <div className="mb-6 flex items-center gap-2 px-1">
          <div className="h-8 w-8 rounded-xl bg-primary/10" />
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Boggur
            </div>
            <div className="text-sm font-medium text-slate-900">Admin</div>
          </div>
        </div>

        <nav className="space-y-1 text-sm">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group block rounded-xl px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary-dark"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  )}
                </div>
                {item.description && (
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {item.description}
                  </p>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:hidden">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Admin</h1>
            <p className="text-[11px] text-slate-500">
              Manage content for projects, services and team.
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-25/80 p-4 sm:p-6">
          <div className="space-y-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
