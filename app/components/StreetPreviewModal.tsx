"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const StreetSvgPreview = dynamic(() => import("./StreetSvgPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs text-slate-300">
      Hleð götuyfirliti...
    </div>
  ),
});

type ModalBuilding = {
  id: string;
  slug: string;
};

type StreetForPreview = {
  id: string;
  name: string;
  image: string | null;
  total_apartments: number;
  available_apartments: number;
  sold_apartments: number;
  buildings: ModalBuilding[];
};

type StreetPreviewModalProps = {
  street: StreetForPreview | null;
  onClose: () => void;
};

export default function StreetPreviewModal({ street, onClose }: StreetPreviewModalProps) {
  const open = Boolean(street);
  const [visible, setVisible] = useState(false);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || !street) return;

    if (typeof document !== "undefined") {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
    }

    const id = window.requestAnimationFrame(() => {
      if (backButtonRef.current) {
        backButtonRef.current.focus();
      }
      setVisible(true);
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.cancelAnimationFrame(id);
      setVisible(false);

      if (lastFocusedRef.current && typeof lastFocusedRef.current.focus === "function") {
        lastFocusedRef.current.focus();
      }
    };
  }, [open, street, onClose]);

  if (!open || !street) return null;

  const buildingsForSvg = street.buildings.map((b) => ({ id: b.id, slug: b.slug }));

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={`Götuyfirlit fyrir ${street.name}`}
    >
      <div
        className={`absolute inset-0 bg-slate-950/85 transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        className={`absolute inset-0 transition-opacity duration-200 ease-out ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <StreetSvgPreview
          mode="overlay"
          streetName={street.name}
          streetImageUrl={street.image}
          buildings={buildingsForSvg}
        />
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute left-4 top-4 space-y-1 text-slate-100 sm:left-6 sm:top-6">
          <button
            ref={backButtonRef}
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-100 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <span aria-hidden="true" className="text-sm">
              ←
            </span>
            <span>Til baka</span>
          </button>
          <p className="text-xs font-medium sm:text-sm">{street.name}</p>
          <p className="text-[11px] text-slate-200">
            {street.total_apartments} íbúð
            {street.total_apartments === 1 ? "" : "ir"} · {street.available_apartments} laus
            {street.available_apartments === 1 ? "" : "ar"}
          </p>
        </div>
      </div>
    </div>
  );
}
