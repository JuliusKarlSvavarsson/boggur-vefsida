"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type StreetViewBuilding = {
  id: string;
  slug: string;
  street_svg_id?: string | null;
  // Optional metadata for tooltip / availability
  title?: string | null;
  total_apartments?: number | string | null;
  available_apartments?: number | string | null;
};

export type StreetViewProps = {
  streetImageUrl: string | null;
  streetName: string;
  streetSvgUrl: string | null;
  buildings: StreetViewBuilding[];
  variant?: "default" | "overlay";
  selectedBuildingId?: string | null;
  hoveredBuildingId?: string | null;
  onBuildingSelect?: (buildingId: string) => void;
  onBuildingHoverChange?: (buildingId: string | null) => void;
};

function deriveSvgUrlFromImage(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const trimmed = imageUrl.trim();
  if (!trimmed) return null;
  const lastDot = trimmed.lastIndexOf(".");
  if (lastDot === -1) return `${trimmed}.svg`;
  return `${trimmed.slice(0, lastDot)}.svg`;
}

function escapeId(id: string): string {
  // Use CSS.escape when available to correctly target SVG elements by id
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  // Fallback: escape non-alphanumeric characters
  return id.replace(/([^a-zA-Z0-9_-])/g, "\\$1");
}

export default function StreetView({
  streetImageUrl,
  streetName,
  streetSvgUrl: explicitSvgUrl,
  buildings,
  variant = "default",
  selectedBuildingId,
  hoveredBuildingId,
  onBuildingSelect,
  onBuildingHoverChange,
}: StreetViewProps) {
  const router = useRouter();
  const svgContainerRef = useRef<HTMLDivElement | null>(null);
  const [internalHoveredId, setInternalHoveredId] = useState<string | null>(
    null,
  );
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [svgLoaded, setSvgLoaded] = useState(false);

  const streetSvgUrl = explicitSvgUrl ?? deriveSvgUrlFromImage(streetImageUrl);

  useEffect(() => {
    if (!streetSvgUrl || !svgContainerRef.current || buildings.length === 0) {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = "";
      }
      return;
    }

    let cancelled = false;

    async function loadSvg() {
      try {
        const svgUrl = streetSvgUrl;
        if (!svgUrl) return;

        const res = await fetch(svgUrl, { cache: "no-store" });
        if (!res.ok) return;
        const svgText = await res.text();
        if (cancelled || !svgContainerRef.current) return;

        svgContainerRef.current.innerHTML = svgText;
        setSvgLoaded(true);

        const svgRoot = svgContainerRef.current.querySelector("svg");
        if (!svgRoot) return;

        // Ensure SVG scales to the same box as the background image
        svgRoot.setAttribute("width", "100%");
        svgRoot.setAttribute("height", "100%");
        if (!svgRoot.getAttribute("preserveAspectRatio")) {
          svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }
        // Make sure the SVG itself can receive pointer events
        (svgRoot as SVGSVGElement).style.pointerEvents = "auto";

        buildings.forEach((b) => {
          const targetId = (b.street_svg_id ?? b.slug ?? "").trim();
          if (!targetId) return;
          const selector = `#${escapeId(targetId)}`;
          const el = svgRoot.querySelector<SVGGraphicsElement>(selector);
          if (!el) return;

          // Attach a stable data attribute for diagnostics / future use
          el.dataset.buildingId = b.id;

          // Basic interactive styling
          el.style.cursor = "pointer";
          el.style.transition =
            "fill 200ms ease, stroke 200ms ease, stroke-width 200ms ease, opacity 200ms ease";
          // Ensure pointer hits the painted shape (fill or stroke) and not the
          // entire bounding box, for more precise interactions.
          el.style.pointerEvents = "visiblePainted";

          // If the shape has no fill (common when SVG root has fill="none"),
          // use a transparent fill so the whole interior is clickable, not just the stroke.
          try {
            const computed = window.getComputedStyle(el);
            if (!computed.fill || computed.fill === "none") {
              el.style.fill = "transparent";
            }
          } catch {
            // getComputedStyle might not be available in some edge cases; ignore.
          }

          // Store base styles so we can restore them when removing highlights
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
            if (onBuildingHoverChange) {
              onBuildingHoverChange(b.id);
            } else {
              setInternalHoveredId(b.id);
            }
          };

          const handleLeave = () => {
            if (onBuildingHoverChange) {
              onBuildingHoverChange(null);
            } else {
              setInternalHoveredId(null);
            }
            setTooltipPos(null);
          };

          const handleMove = (event: PointerEvent) => {
            try {
              const rect = svgRoot.getBoundingClientRect();
              setTooltipPos({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
              });
            } catch {
              // ignore tooltip positioning errors
            }
          };

          const handlePointerDown = () => {
            if (onBuildingSelect) {
              onBuildingSelect(b.id);
            } else {
              router.push(
                `/building/${encodeURIComponent(
                  b.slug,
                )}?id=${encodeURIComponent(b.id)}`,
              );
            }
          };

          el.addEventListener("pointerenter", handleEnter);
          el.addEventListener("pointerleave", handleLeave);
          el.addEventListener("pointerdown", handlePointerDown);
          el.addEventListener("pointermove", handleMove);

          // Note: we rely on React unmounting/innerHTML reset to remove listeners
        });
      } catch {
        // swallow errors – street view is optional visual enhancement
      }
    }

    void loadSvg();

    return () => {
      cancelled = true;
      setSvgLoaded(false);
      if (!svgContainerRef.current) return;
      svgContainerRef.current.innerHTML = "";
    };
  }, [streetSvgUrl, buildings]);

  const effectiveHoveredBuildingId = hoveredBuildingId ?? internalHoveredId;

  // Apply a clear three-state highlight model once the SVG has loaded:
  // - Inactive: all buildings slightly dimmed so interaction feels intentional.
  // - Hover: strong amber outline + soft fill + glow on the hovered building.
  // - Selected: even stronger outline/fill + stronger glow on the selected building.
  //   When a selection exists, non-selected & non-hovered buildings are further dimmed.
  useEffect(() => {
    if (!svgLoaded || !svgContainerRef.current) return;
    const svgRoot = svgContainerRef.current.querySelector("svg");
    if (!svgRoot) return;

    const hasSelected = Boolean(selectedBuildingId);
    const hasHover = Boolean(effectiveHoveredBuildingId);
    const hasFocus = hasSelected || hasHover;

    buildings.forEach((b) => {
      const targetId = (b.street_svg_id ?? b.slug ?? "").trim();
      if (!targetId) return;
      const selector = `#${escapeId(targetId)}`;
      const el = svgRoot.querySelector<SVGGraphicsElement>(selector);
      if (!el) return;

      const baseOpacity = el.dataset.baseOpacity ?? "";
      const baseStroke = el.dataset.baseStroke ?? "";
      const baseStrokeWidth = el.dataset.baseStrokeWidth ?? "";
      const baseFill = el.dataset.baseFill ?? "";
      const baseFilter = el.dataset.baseFilter ?? "";

      const isSelected = selectedBuildingId === b.id;
      const isHovered = effectiveHoveredBuildingId === b.id;

      // Determine logical highlight state for this element
      // - selected: the chosen building, always strongly highlighted
      // - hovered: the building under pointer (only if different from the selected one)
      // - dimmedFocus: any non-target building while either hover or selection exists
      // - inactive: base state when there is no hover/selection focus
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

      // Avoid re-applying the same styles repeatedly to reduce flicker
      if (el.dataset.highlightState === state) {
        return;
      }
      el.dataset.highlightState = state;

      if (state === "selected") {
        // Selected – strongest emphasis, but still refined
        el.style.opacity = "1";
        el.style.stroke = "rgba(245, 158, 11, 1)";
        el.style.strokeWidth = "3";
        el.style.fill = "rgba(245, 158, 11, 0.35)";
        el.style.filter =
          "drop-shadow(0 0 10px rgba(245, 158, 11, 0.45))";
      } else if (state === "hovered") {
        // Hovered – lighter than selected, but clearly interactive
        el.style.opacity = "1";
        el.style.stroke = "rgba(245, 158, 11, 0.9)";
        el.style.strokeWidth = "2";
        el.style.fill = "rgba(245, 158, 11, 0.25)";
        el.style.filter =
          "drop-shadow(0 0 6px rgba(245, 158, 11, 0.35))";
      } else if (state === "dimmedFocus") {
        // Dim non-target buildings slightly when there is a hover or selection focus
        el.style.opacity = "0.35";
        el.style.stroke = baseStroke;
        el.style.strokeWidth = baseStrokeWidth;
        el.style.fill = baseFill;
        el.style.filter = baseFilter;
      } else {
        // Inactive baseline – restore original styling
        el.style.opacity = baseOpacity || "1";
        el.style.stroke = baseStroke;
        el.style.strokeWidth = baseStrokeWidth;
        el.style.fill = baseFill;
        el.style.filter = baseFilter;
      }
    });
  }, [svgLoaded, buildings, selectedBuildingId, effectiveHoveredBuildingId]);

  const isOverlayVariant = variant === "overlay";

  const tooltipBuildingId = effectiveHoveredBuildingId;
  const tooltipBuilding = tooltipBuildingId
    ? buildings.find((b) => b.id === tooltipBuildingId) ?? null
    : null;
  const tooltipAvailableCount = tooltipBuilding
    ? Number((tooltipBuilding.available_apartments ?? 0) as number) || 0
    : 0;

  return (
    <div className={isOverlayVariant ? "h-full" : "space-y-3"}>
      {!isOverlayVariant && (
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
          Götu yfirlit
        </p>
      )}
      <div
        className={
          isOverlayVariant
            ? "relative h-full w-full overflow-hidden bg-neutral-100"
            : "overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 h-80 sm:h-96"
        }
      >
        <div className="relative h-full w-full">
          {/* Background street image (not clickable) */}
          {streetImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={streetImageUrl}
              alt={streetName}
              className={
                isOverlayVariant
                  ? "pointer-events-none absolute inset-0 h-full w-full object-contain"
                  : "pointer-events-none absolute inset-0 h-full w-full object-contain"
              }
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500">
              Engin götumynd skilgreind fyrir þessa götu.
            </div>
          )}

          {/* SVG overlay container – receives injected SVG */}
          <div
            ref={svgContainerRef}
            className="absolute inset-0 z-10"
            aria-hidden="true"
          />

          {tooltipBuilding && tooltipPos && (
            <div
              className="pointer-events-none absolute z-20 transform-gpu rounded-xl border border-slate-200/80 bg-white/95 px-3 py-1.5 text-[11px] shadow-lg backdrop-blur-sm transition-opacity duration-150"
              style={{
                left: tooltipPos.x + 14,
                top: tooltipPos.y + 14,
              }}
            >
              <div className="flex items-center gap-1">
                <span className="font-medium text-slate-900">
                  {tooltipBuilding.title || tooltipBuilding.slug || "Ónefnt hús"}
                </span>
                {tooltipAvailableCount > 0 && (
                  <span className="text-[10px] font-medium text-emerald-700">
                    · {tooltipAvailableCount} laus
                    {tooltipAvailableCount === 1 ? "" : "ar"}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {!isOverlayVariant && (
        <p className="text-sm font-semibold text-slate-900">
          {streetName || "Óþekkt gata"}
        </p>
      )}
    </div>
  );
}
