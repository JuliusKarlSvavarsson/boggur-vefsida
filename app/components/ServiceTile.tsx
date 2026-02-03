/* eslint-disable @next/next/no-img-element */

import type { Service } from "./ServicesGrid";

type ServiceTileProps = {
  service: Service;
  onClick: () => void;
};

export default function ServiceTile({ service, onClick }: ServiceTileProps) {
  const hasImage = Boolean(service.image);
  // Strip basic symbol/emoji range from titles so they feel more
  // architectural and less playful, without relying on the 'u' flag.
  const cleanTitle =
    service.title.replace(/[\u2600-\u27BF]/g, "").trim() || service.title;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/60 bg-white/90 p-4 text-left shadow-md shadow-slate-200/80 transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/90"
    >
      <div className="relative overflow-hidden rounded-xl bg-[#e3e0d8]">
        {hasImage ? (
          <img
            src={service.image ?? ""}
            alt={service.title}
            className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] group-hover:-translate-y-1"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center text-xs text-slate-500">
            Mynd kemur síðar.
          </div>
        )}
      </div>
      <div className="mt-5 space-y-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-slate-900">
          {cleanTitle}
        </h3>
        {service.description && (
          <p className="line-clamp-3 text-sm text-slate-600">
            {service.description}
          </p>
        )}
        <span className="inline-flex text-sm font-medium text-slate-900 underline-offset-4 group-hover:underline group-hover:text-slate-700 transition-colors duration-200">
          Skoða nánar
        </span>
      </div>
    </button>
  );
}
