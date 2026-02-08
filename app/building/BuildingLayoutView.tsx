"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getApartmentVisual } from "./apartmentVisual";

type LayoutApartment = {
  id: string;
  number: string;
  status?: string | null;
};

export type BuildingLayoutViewProps = {
  layoutImageUrl: string | null;
  buildingTitle: string;
  apartments: LayoutApartment[];
  onApartmentClick: (apartmentId: string) => void;
  selectedApartmentId?: string | null;
  hoveredApartmentId?: string | null;
  onApartmentHoverChange?: (apartmentId: string | null) => void;
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
  selectedApartmentId,
  hoveredApartmentId,
  onApartmentHoverChange,
}: BuildingLayoutViewProps) {
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const layoutSvgUrl = deriveSvgUrlFromImage(layoutImageUrl);

  const apartmentsKey = useMemo(
    () =>
      apartments
        .map((apt) => `${apt.id}:${apt.number}:${apt.status ?? ""}`)
        .join("|"),
    [apartments],
  );

  const [svgReady, setSvgReady] = useState(false);

  useEffect(() => {
    if (!layoutSvgUrl || !svgContainerRef.current) {
      setSvgReady(false);
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
        if (!svgRoot) {
          if (!cancelled) setSvgReady(false);
          return;
        }

        svgRoot.setAttribute("width", "100%");
        svgRoot.setAttribute("height", "100%");
        if (!svgRoot.getAttribute("preserveAspectRatio")) {
          svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }
        (svgRoot as SVGSVGElement).style.pointerEvents = "auto";

        apartments.forEach((apt) => {
          const key = (apt.number ?? "").trim();
          if (!key) return;
          const primarySelector = `#${escapeId(key)}`;
          let el = svgRoot.querySelector<SVGGraphicsElement>(primarySelector);
          if (!el) {
            const altSelector = `#${escapeId(`apt-${key}`)}`;
            el = svgRoot.querySelector<SVGGraphicsElement>(altSelector);
          }
          if (!el) return;

          const visual = getApartmentVisual(apt.status ?? null);

          el.dataset.apartmentId = apt.id;
          el.style.transition =
            "fill 150ms ease, stroke 150ms ease, opacity 150ms ease, filter 150ms ease";
          el.style.cursor = visual.isClickable ? "pointer" : "not-allowed";
          // Always allow pointer events so hover states and cross-highlighting
          // work even for non-clickable apartments; clicks are still gated
          // inside the handler.
          el.style.pointerEvents = "visiblePainted";

          try {
            const computed = window.getComputedStyle(el);
            if (!computed.fill || computed.fill === "none") {
              el.style.fill = "transparent";
            }
          } catch {
            // ignore style errors
          }

          if (!el.dataset.baseOpacity) {
            el.dataset.baseOpacity = el.style.opacity || "";
          }
          if (!el.dataset.baseStroke) {
            el.dataset.baseStroke = el.style.stroke || "";
          }
          if (!el.dataset.baseStrokeWidth) {
            el.dataset.baseStrokeWidth = el.style.strokeWidth || "";
          }
          if (!el.dataset.baseFill) {
            el.dataset.baseFill = el.style.fill || "";
          }
          if (!el.dataset.baseFilter) {
            el.dataset.baseFilter = el.style.filter || "";
          }

          const handleEnter = () => {
            if (onApartmentHoverChange) {
              onApartmentHoverChange(apt.id);
            }
          };

          const handleLeave = () => {
            if (onApartmentHoverChange) {
              onApartmentHoverChange(null);
            }
          };

          const handlePointerDown = () => {
            if (!visual.isClickable) return;
            onApartmentClick(apt.id);
          };

          el.addEventListener("pointerenter", handleEnter);
          el.addEventListener("pointerleave", handleLeave);
          el.addEventListener("pointerdown", handlePointerDown);
        });
        if (!cancelled) {
          setSvgReady(true);
        }
      } catch {
        if (!cancelled) {
          setSvgReady(false);
        }
      }
    }

    void loadSvg();

    return () => {
      cancelled = true;
      setSvgReady(false);
      if (!svgContainerRef.current) return;
      svgContainerRef.current.innerHTML = "";
    };
  }, [layoutSvgUrl, apartmentsKey]);

  // Apply clear default / hover / selected / dimmed states based on
  // hoveredApartmentId and selectedApartmentId, using shared visuals.
  useEffect(() => {
    if (!svgReady || !svgContainerRef.current) return;
    const svgRoot = svgContainerRef.current.querySelector("svg");
    if (!svgRoot) return;

    const hasSelected = Boolean(selectedApartmentId);
    const hasHover = Boolean(hoveredApartmentId);
    const hasFocus = hasSelected || hasHover;

    apartments.forEach((apt) => {
      const key = (apt.number ?? "").trim();
      if (!key) return;
      const primarySelector = `#${escapeId(key)}`;
      let el = svgRoot.querySelector<SVGGraphicsElement>(primarySelector);
      if (!el) {
        const altSelector = `#${escapeId(`apt-${key}`)}`;
        el = svgRoot.querySelector<SVGGraphicsElement>(altSelector);
      }
      if (!el) return;

      const visual = getApartmentVisual(apt.status ?? null);

      const baseOpacity = el.dataset.baseOpacity ?? "";
      const baseStroke = el.dataset.baseStroke ?? "";
      const baseStrokeWidth = el.dataset.baseStrokeWidth ?? "";
      const baseFill = el.dataset.baseFill ?? "";
      const baseFilter = el.dataset.baseFilter ?? "";

      const isSelected = selectedApartmentId === apt.id;
      const isHovered = hoveredApartmentId === apt.id;

      let state: "selected" | "hovered" | "dimmedFocus" | "inactive";
      if (isSelected) {
        state = "selected";
      } else if (isHovered) {
        state = "hovered";
      } else if (hasFocus) {
        state = "dimmedFocus";
      } else {
        state = "inactive";
      }

      if (el.dataset.highlightState === state) {
        return;
      }
      el.dataset.highlightState = state;

      if (!visual.isClickable) {
        // Muted, non-clickable apartments – keep them calm even when focused.
        if (state === "selected" || state === "hovered") {
          el.style.opacity = "0.7";
          el.style.stroke = visual.stroke;
          el.style.strokeWidth = "1.5";
          el.style.fill = visual.fillSelected;
          el.style.filter = `drop-shadow(0 0 6px ${visual.glow})`;
        } else {
          el.style.opacity = "0.55";
          el.style.stroke = visual.stroke;
          el.style.strokeWidth = "1";
          el.style.fill = visual.fillHover;
          el.style.filter = baseFilter || "none";
        }
        return;
      }

      if (state === "selected") {
        // Strong, clear highlight for the chosen apartment.
        el.style.opacity = "1";
        el.style.stroke = visual.stroke;
        el.style.strokeWidth = "2.5";
        el.style.fill = visual.fillSelected;
        el.style.filter = `drop-shadow(0 0 10px ${visual.glow})`;
      } else if (state === "hovered") {
        // Bright hover state so it's obvious which apartment you're on.
        el.style.opacity = "1";
        el.style.stroke = visual.stroke;
        el.style.strokeWidth = "2";
        el.style.fill = visual.fillHover;
        el.style.filter = `drop-shadow(0 0 6px ${visual.glow})`;
      } else if (state === "dimmedFocus") {
        // When something else is focused, keep others calm and close to the
        // original drawing so the selected one stands out.
        el.style.opacity = "0.35";
        el.style.stroke = baseStroke || "transparent";
        el.style.strokeWidth = baseStrokeWidth;
        el.style.fill = baseFill;
        el.style.filter = baseFilter;
      } else {
        // No selection/hover at all: revert to original SVG styling so the
        // main layout is not highlighted when idle.
        el.style.opacity = baseOpacity;
        el.style.stroke = baseStroke;
        el.style.strokeWidth = baseStrokeWidth;
        el.style.fill = baseFill;
        el.style.filter = baseFilter;
      }
    });
  }, [apartments, selectedApartmentId, hoveredApartmentId, svgReady]);

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
