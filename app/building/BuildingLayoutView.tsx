"use client";

import { useEffect, useRef } from "react";

type LayoutApartment = {
  id: string;
  number: string;
};

export type BuildingLayoutViewProps = {
  layoutImageUrl: string | null;
  buildingTitle: string;
  apartments: LayoutApartment[];
  onApartmentClick: (apartmentId: string) => void;
};

function deriveSvgUrlFromImage(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  let trimmed = imageUrl.trim();
  if (!trimmed) return null;

  // Normalize Windows-style backslashes to URL-style slashes
  trimmed = trimmed.replace(/\\/g, "/");

  const lastDot = trimmed.lastIndexOf(".");
  const base = lastDot === -1 ? trimmed : trimmed.slice(0, lastDot);
  let svgUrl = `${base}.svg`;

  const isHttp = svgUrl.startsWith("http://") || svgUrl.startsWith("https://");
  const isRootRelative = svgUrl.startsWith("/");

  // If it's not http(s) and not root-relative, treat it as root-relative
  if (!isHttp && !isRootRelative) {
    svgUrl = `/${svgUrl.replace(/^\/+/, "")}`;
  }

  return svgUrl;
}

function escapeId(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

export default function BuildingLayoutView({
  layoutImageUrl,
  buildingTitle,
  apartments,
  onApartmentClick,
}: BuildingLayoutViewProps) {
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const layoutSvgUrl = deriveSvgUrlFromImage(layoutImageUrl);

  useEffect(() => {
    if (!layoutSvgUrl || !svgContainerRef.current) {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = "";
      }
      return;
    }

    let cancelled = false;

    async function loadSvg() {
      try {
        const svgUrl = layoutSvgUrl;
        if (!svgUrl) return;
        const res = await fetch(svgUrl, { cache: "no-store" });
        if (!res.ok) return;
        const svgText = await res.text();
        if (cancelled || !svgContainerRef.current) return;

        svgContainerRef.current.innerHTML = svgText;

        const svgRoot = svgContainerRef.current.querySelector("svg");
        if (!svgRoot) return;

        svgRoot.setAttribute("width", "100%");
        svgRoot.setAttribute("height", "100%");
        if (!svgRoot.getAttribute("preserveAspectRatio")) {
          svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }

        apartments.forEach((apt) => {
          const targetId = (apt.number ?? "").trim();
          if (!targetId) return;
          const selector = `#${escapeId(targetId)}`;
          const el = svgRoot.querySelector<SVGGraphicsElement>(selector);
          if (!el) return;

          el.style.cursor = "pointer";
          el.style.transition =
            "fill 150ms ease, stroke 150ms ease, opacity 150ms ease, filter 150ms ease";

          try {
            const computed = window.getComputedStyle(el);
            if (!computed.fill || computed.fill === "none") {
              el.style.fill = "transparent";
            }
          } catch {
          }

          const handleEnter = () => {
            el.dataset.__origOpacity = el.style.opacity || "";
            el.dataset.__origStroke = el.style.stroke || "";
            el.dataset.__origStrokeWidth = el.style.strokeWidth || "";
            el.dataset.__origFill = el.style.fill || "";
            el.dataset.__origFilter = el.style.filter || "";

            el.style.opacity = "0.95";
            el.style.fill = "rgba(252, 211, 77, 0.45)";
            el.style.stroke = "#0f172a";
            el.style.strokeWidth = el.style.strokeWidth || "2";
            el.style.filter = "drop-shadow(0 0 6px rgba(15, 23, 42, 0.7))";
          };

          const handleLeave = () => {
            if (el.dataset.__origOpacity !== undefined) {
              el.style.opacity = el.dataset.__origOpacity;
            }
            if (el.dataset.__origStroke !== undefined) {
              el.style.stroke = el.dataset.__origStroke;
            }
            if (el.dataset.__origStrokeWidth !== undefined) {
              el.style.strokeWidth = el.dataset.__origStrokeWidth;
            }
            if (el.dataset.__origFill !== undefined) {
              el.style.fill = el.dataset.__origFill;
            }
            if (el.dataset.__origFilter !== undefined) {
              el.style.filter = el.dataset.__origFilter;
            }
          };

          const handleClick = () => {
            onApartmentClick(apt.id);
          };

          el.addEventListener("mouseenter", handleEnter);
          el.addEventListener("mouseleave", handleLeave);
          el.addEventListener("click", handleClick);
          el.addEventListener("touchstart", handleEnter, { passive: true });
          el.addEventListener("touchend", handleLeave, { passive: true });
        });
      } catch {
      }
    }

    void loadSvg();

    return () => {
      cancelled = true;
      if (!svgContainerRef.current) return;
      svgContainerRef.current.innerHTML = "";
    };
  }, [layoutSvgUrl, apartments, onApartmentClick]);

  return (
    <div className="relative h-full w-full">
      {layoutImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={layoutImageUrl}
          alt={buildingTitle}
          className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500">
          Enginn uppdráttur skilgreindur fyrir þetta hús.
        </div>
      )}
      <div
        ref={svgContainerRef}
        className="absolute inset-0"
        aria-hidden="true"
      />
    </div>
  );
}
