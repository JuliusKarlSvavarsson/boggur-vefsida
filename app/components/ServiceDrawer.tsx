"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import RightDrawer from "../admin/RightDrawer";
import type { Service } from "./ServicesGrid";

type ServiceDrawerProps = {
  open: boolean;
  service: Service | null;
  onClose: () => void;
};

export default function ServiceDrawer({ open, service, onClose }: ServiceDrawerProps) {
  if (!service) return null;

  return (
    <RightDrawer
      open={open}
      onClose={onClose}
      title={service.title}
      description="Nánari upplýsingar um þjónustu."
    >
      <div className="space-y-4 text-sm text-slate-700">
        {service.image && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img
              src={service.image}
              alt={service.title}
              className="h-56 w-full object-cover"
            />
          </div>
        )}
        {service.description && (
          <p className="whitespace-pre-line leading-relaxed">
            {service.description}
          </p>
        )}
        {!service.description && (
          <p className="leading-relaxed text-slate-500">
            Nánari lýsing kemur síðar. Hafðu samt samband ef þú þarft aðstoð með verkefni.
          </p>
        )}
        <div className="pt-2">
          <Link
            href="/hafa-samband"
            className="font-semibold text-primary underline-offset-4 hover:underline hover:text-primary-dark transition-colors duration-200"
          >
            Hafa samband um þetta
          </Link>
        </div>
      </div>
    </RightDrawer>
  );
}
