"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type StreetViewBuilding = {
  id: string;
  slug: string;
  street_svg_id?: string | null;
};

export type StreetViewProps = {
  streetImageUrl: string | null;
  streetName: string;
  streetSvgUrl: string | null;
  buildings: StreetViewBuilding[];
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
}: StreetViewProps) {
  const router = useRouter();
  const svgContainerRef = useRef<HTMLDivElement | null>(null);

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

        // Only allow http(s) or root-relative URLs; skip anything else (e.g. Windows paths)
        const isHttp = svgUrl.startsWith("http://") || svgUrl.startsWith("https://");
        const isRootRelative = svgUrl.startsWith("/");
        if (!isHttp && !isRootRelative) {
          return;
        }
        const res = await fetch(svgUrl, { cache: "no-store" });
        if (!res.ok) return;
        const svgText = await res.text();
        if (cancelled || !svgContainerRef.current) return;

        svgContainerRef.current.innerHTML = svgText;

        const svgRoot = svgContainerRef.current.querySelector("svg");
        if (!svgRoot) return;

        // Ensure SVG scales to the same box as the background image
        svgRoot.setAttribute("width", "100%");
        svgRoot.setAttribute("height", "100%");
        if (!svgRoot.getAttribute("preserveAspectRatio")) {
          svgRoot.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }

        buildings.forEach((b) => {
          const targetId = (b.street_svg_id ?? b.slug ?? "").trim();
          if (!targetId) return;
          const selector = `#${escapeId(targetId)}`;
          const el = svgRoot.querySelector<SVGGraphicsElement>(selector);
          if (!el) return;

          // Basic interactive styling
          el.style.cursor = "pointer";
          el.style.transition =
            "fill 150ms ease, stroke 150ms ease, opacity 150ms ease, filter 150ms ease";

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

          const handleEnter = () => {
            el.dataset.__origOpacity = el.style.opacity || "";
            el.dataset.__origStroke = el.style.stroke || "";
            el.dataset.__origStrokeWidth = el.style.strokeWidth || "";
            el.dataset.__origFill = el.style.fill || "";
            el.dataset.__origFilter = el.style.filter || "";

            // Highlight: soft amber fill + dark outline + slight emphasis
            el.style.opacity = "0.95";
            el.style.fill = "rgba(252, 211, 77, 0.45)"; // amber-300 @ ~45%
            el.style.stroke = "#0f172a"; // slate-900
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
            router.push(
              `/building/${encodeURIComponent(b.slug)}?id=${encodeURIComponent(
                b.id,
              )}`,
            );
          };

          el.addEventListener("mouseenter", handleEnter);
          el.addEventListener("mouseleave", handleLeave);
          el.addEventListener("click", handleClick);
          el.addEventListener("touchstart", handleEnter, { passive: true });
          el.addEventListener("touchend", handleLeave, { passive: true });

          // Note: we rely on React unmounting/innerHTML reset to remove listeners
        });
      } catch {
        // swallow errors – street view is optional visual enhancement
      }
    }

    void loadSvg();

    return () => {
      cancelled = true;
      if (!svgContainerRef.current) return;
      svgContainerRef.current.innerHTML = "";
    };
  }, [streetSvgUrl, buildings, router]);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
        Götu yfirlit
      </p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 h-80 sm:h-96">
        <div className="relative h-full w-full">
          {/* Background street image (not clickable) */}
          {streetImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={streetImageUrl}
              alt={streetName}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-500">
              Engin götumynd skilgreind fyrir þessa götu.
            </div>
          )}

          {/* SVG overlay container – receives injected SVG */}
          <div
            ref={svgContainerRef}
            className="absolute inset-0"
            aria-hidden="true"
          />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-900">
        {streetName || "Óþekkt gata"}
      </p>
    </div>
  );
}
