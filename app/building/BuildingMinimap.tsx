"use client";

import { useEffect, useMemo, useRef } from "react";
import { getApartmentVisual } from "./apartmentVisual";

type MinimapApartment = {
  id: string;
  number: string;
  status?: string | null;
};

export type BuildingMinimapProps = {
  svgSrc: string | null;
  apartments: MinimapApartment[];
  selectedApartmentId: string | null;
  hoveredApartmentId: string | null;
  onApartmentHoverChange?: (apartmentId: string | null) => void;
  onApartmentSelect?: (apartmentId: string) => void;
};

function escapeId(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

export default function BuildingMinimap({
  svgSrc,
  apartments,
  selectedApartmentId,
  hoveredApartmentId,
  onApartmentHoverChange,
  onApartmentSelect,
}: BuildingMinimapProps) {
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

  const apartmentsKey = useMemo(
    () =>
      apartments
        .map((apt) => `${apt.id}:${apt.number}:${apt.status ?? ""}`)
        .join("|"),
    [apartments],
  );

  useEffect(() => {
    const src = svgSrc;
    if (!src || !svgContainerRef.current) {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = "";
      }
      return;
    }

    let cancelled = false;

    async function loadSvg(url: string) {
      try {
        // Clear previous content before attempting to load a new SVG
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = "";
        }

        const res = await fetch(url, { cache: "no-store" });
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
        (svgRoot as SVGSVGElement).style.pointerEvents = "auto";

        apartments.forEach((apt) => {
          const key = (apt.number ?? "").trim();
          if (!key) return;
          const selector = `#${escapeId(`apt-${key}`)}`;
          const el = svgRoot.querySelector<SVGGraphicsElement>(selector);
          if (!el) return;

          const visual = getApartmentVisual(apt.status ?? null);

          el.dataset.apartmentId = apt.id;
          el.style.transition =
            "fill 180ms ease-out, stroke 180ms ease-out, opacity 180ms ease-out, filter 180ms ease-out";
          el.style.cursor = visual.isClickable ? "pointer" : "not-allowed";
          // Always allow pointer events so hover syncing works for all
          // apartments; clicks are still gated on visual.isClickable.
          el.style.pointerEvents = "visiblePainted";

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

          // Add a small apartment number label in the center of the
          // apartment shape so the minimap reads like a technical
          // drawing. Labels are non-interactive and use muted styling.
          try {
            const bbox = el.getBBox();
            if (bbox && isFinite(bbox.x) && isFinite(bbox.y)) {
              const svgNs = "http://www.w3.org/2000/svg";
              const label = document.createElementNS(svgNs, "text");
              label.textContent = key;
              const cx = bbox.x + bbox.width / 2;
              const cy = bbox.y + bbox.height / 2;
              label.setAttribute("x", String(cx));
              label.setAttribute("y", String(cy));
              label.setAttribute("text-anchor", "middle");
              label.setAttribute("dominant-baseline", "central");
              label.setAttribute("pointer-events", "none");
              label.dataset.apartmentLabel = "true";

              // Use a tiny, neutral font so the label feels like
              // annotation, not a big UI element.
              label.style.fontSize = "6px";
              label.style.fill = "#4b5563"; // slate-600

              svgRoot.appendChild(label);
            }
          } catch {
            // ignore label placement errors – shapes will still work
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
            if (onApartmentSelect) {
              onApartmentSelect(apt.id);
            }
          };

          el.addEventListener("pointerenter", handleEnter);
          el.addEventListener("pointerleave", handleLeave);
          el.addEventListener("pointerdown", handlePointerDown);
        });
      } catch {
      }
    }

    void loadSvg(src);

    return () => {
      cancelled = true;
      if (!svgContainerRef.current) return;
      svgContainerRef.current.innerHTML = "";
    };
    // Deliberately only depend on svgSrc so that we don't reload and
    // rebind on every hover/selection. This mirrors BuildingLayoutView
    // and keeps the DOM stable while visual state is managed by the
    // separate highlighting effect below.
  }, [svgSrc, apartmentsKey]);

  useEffect(() => {
    if (!svgContainerRef.current) return;
    const svgRoot = svgContainerRef.current.querySelector("svg");
    if (!svgRoot) return;

    apartments.forEach((apt) => {
      const key = (apt.number ?? "").trim();
      if (!key) return;
      const selector = `#${escapeId(`apt-${key}`)}`;
      const el = svgRoot.querySelector<SVGGraphicsElement>(selector);
      if (!el) return;

      const visual = getApartmentVisual(apt.status ?? null);

      const baseOpacity = el.dataset.baseOpacity ?? "";
      const baseStroke = el.dataset.baseStroke ?? "";
      const baseStrokeWidth = el.dataset.baseStrokeWidth ?? "";
      const baseFill = el.dataset.baseFill ?? "";
      const baseFilter = el.dataset.baseFilter ?? "";

      const isSelected = selectedApartmentId === apt.id;
      const isHovered = hoveredApartmentId === apt.id;

      // On the minimap we only highlight the hovered/selected apartment.
      // All other apartments stay in their original SVG style even while
      // one is focused.
      let state: "selected" | "hovered" | "inactive";
      if (isSelected) {
        state = "selected";
      } else if (isHovered) {
        state = "hovered";
      } else {
        state = "inactive";
      }

      if (el.dataset.highlightState === state) {
        return;
      }
      el.dataset.highlightState = state;

      if (!visual.isClickable) {
        if (state === "selected" || state === "hovered") {
          el.style.opacity = "0.7";
          el.style.stroke = visual.stroke;
          el.style.strokeWidth = "2";
          el.style.fill = visual.fillSelected;
          el.style.filter = `drop-shadow(0 0 6px ${visual.glow})`;
        } else {
          // No hover/selection focus: keep original SVG styling.
          el.style.opacity = baseOpacity;
          el.style.stroke = baseStroke;
          el.style.strokeWidth = baseStrokeWidth;
          el.style.fill = baseFill;
          el.style.filter = baseFilter;
        }
        return;
      }

      if (state === "selected") {
        el.style.opacity = "1";
        el.style.stroke = visual.stroke;
        el.style.strokeWidth = "3";
        el.style.fill = visual.fillSelected;
        el.style.filter = `drop-shadow(0 0 10px ${visual.glow})`;
      } else if (state === "hovered") {
        el.style.opacity = "1";
        el.style.stroke = visual.stroke;
        el.style.strokeWidth = "2.5";
        el.style.fill = visual.fillHover;
        el.style.filter = `drop-shadow(0 0 6px ${visual.glow})`;
      } else {
        // No selection/hover at all: revert to original SVG styling so
        // the minimap is not highlighted when idle.
        el.style.opacity = baseOpacity;
        el.style.stroke = baseStroke;
        el.style.strokeWidth = baseStrokeWidth;
        el.style.fill = baseFill;
        el.style.filter = baseFilter;
      }
    });
  }, [apartments, selectedApartmentId, hoveredApartmentId]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={svgContainerRef}
        className="absolute inset-y-1 inset-x-2"
        aria-hidden="true"
      />
    </div>
  );
}
