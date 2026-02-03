"use client";

import { useState } from "react";
import ServiceDrawer from "./ServiceDrawer";
import ServiceTile from "./ServiceTile";

export type Service = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
};

type ServicesGridProps = {
  services: Service[];
};

export default function ServicesGrid({ services }: ServicesGridProps) {
  const [selected, setSelected] = useState<Service | null>(null);

  if (!services.length) {
    return (
      <section className="space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Það sem við tökum að okkur
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Veldu þjónustu til að sjá nánar.
          </p>
        </header>
        <p className="text-sm text-slate-500">
          Þjónusta verður sett inn síðar. Hafðu samt samband ef þú þarft aðstoð með verkefni.
        </p>
      </section>
    );
  }

  const gridCols = "grid gap-8 sm:grid-cols-2";

  return (
    <section className="space-y-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Það sem við tökum að okkur
          </h2>
          <p className="text-sm text-slate-600 sm:text-base">
            Veldu þjónustu til að sjá nánar.
          </p>
        </header>

        <div className={gridCols}>
          {services.map((service) => (
            <ServiceTile
              key={service.id}
              service={service}
              onClick={() => setSelected(service)}
            />
          ))}
        </div>
      </div>

      <ServiceDrawer
        service={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
