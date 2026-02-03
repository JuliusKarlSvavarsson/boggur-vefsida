export type ApartmentVisual = {
  fillHover: string;
  fillSelected: string;
  stroke: string;
  glow: string;
  isClickable: boolean;
  badgeClasses: string;
  rowSelectedClasses: string;
  rowHoverClasses: string;
};

export function statusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "available") return "Laus";
  if (normalized === "sold") return "Seld";
  if (normalized === "reserved") return "Frátekin";
  return status;
}

export function getApartmentVisual(
  status: string | null | undefined,
): ApartmentVisual {
  const normalized = (status ?? "").toLowerCase();

  if (normalized === "available") {
    return {
      // Calm green for available
      fillHover: "rgba(76, 175, 80, 0.28)",
      fillSelected: "rgba(76, 175, 80, 0.55)",
      stroke: "rgba(76, 175, 80, 0.95)",
      glow: "rgba(76, 175, 80, 0.35)",
      isClickable: true,
      badgeClasses: "border-emerald-200 bg-emerald-50 text-emerald-800",
      rowSelectedClasses:
        "border-l-4 border-emerald-500 bg-emerald-50/80 shadow-sm",
      rowHoverClasses:
        "border-l-2 border-emerald-400 bg-emerald-50/50",
    };
  }

  if (normalized === "sold") {
    return {
      // Steel blue for sold
      fillHover: "rgba(59, 74, 107, 0.22)",
      fillSelected: "rgba(59, 74, 107, 0.45)",
      stroke: "rgba(59, 74, 107, 0.95)",
      glow: "rgba(59, 74, 107, 0.28)",
      isClickable: true,
      badgeClasses: "border-slate-300 bg-slate-100 text-slate-800",
      rowSelectedClasses:
        "border-l-4 border-slate-600 bg-slate-100/90 shadow-sm",
      rowHoverClasses:
        "border-l-2 border-slate-500 bg-slate-100/70",
    };
  }

  if (normalized === "reserved") {
    return {
      // Amber for reserved, but not harsh warning yellow
      fillHover: "rgba(245, 158, 11, 0.20)",
      fillSelected: "rgba(245, 158, 11, 0.42)",
      stroke: "rgba(245, 158, 11, 0.95)",
      glow: "rgba(245, 158, 11, 0.25)",
      isClickable: true,
      badgeClasses: "border-amber-200 bg-amber-50 text-amber-800",
      rowSelectedClasses:
        "border-l-4 border-amber-500 bg-amber-50/80 shadow-sm",
      rowHoverClasses:
        "border-l-2 border-amber-400 bg-amber-50/50",
    };
  }

  // Unavailable / hidden / unknown: muted gray, optionally non-clickable
  return {
    fillHover: "rgba(148, 163, 184, 0.12)",
    fillSelected: "rgba(148, 163, 184, 0.18)",
    stroke: "rgba(148, 163, 184, 0.30)",
    glow: "rgba(148, 163, 184, 0.18)",
    isClickable: false,
    badgeClasses: "border-slate-200 bg-slate-50 text-slate-500",
    rowSelectedClasses:
      "border-l-4 border-slate-300 bg-slate-50/90",
    rowHoverClasses:
      "border-l-2 border-slate-300 bg-slate-50/70",
  };
}
