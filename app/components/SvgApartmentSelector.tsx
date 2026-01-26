type ApartmentStatus = "available" | "sold" | "reserved";

type SvgApartment = {
  id: string;
  name: string;
  status: ApartmentStatus;
};

type SvgApartmentSelectorProps = {
  floorLabel?: string;
  apartments: SvgApartment[];
  selectedApartmentId?: string | null;
  onSelectApartment: (apartmentId: string) => void;
};

const statusFill: Record<ApartmentStatus, string> = {
  available: "#10B981",
  sold: "#EF4444",
  reserved: "#FACC15",
};

export default function SvgApartmentSelector({
  floorLabel,
  apartments,
  selectedApartmentId,
  onSelectApartment,
}: SvgApartmentSelectorProps) {
  if (!apartments.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-800 bg-slate-900/40 text-xs text-slate-400">
        No apartments defined for this floor yet.
      </div>
    );
  }

  const cols = Math.min(apartments.length, Math.max(2, Math.ceil(Math.sqrt(apartments.length))));
  const rows = Math.ceil(apartments.length / cols);
  const cellWidth = 100 / cols;
  const cellHeight = 100 / Math.max(rows, 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium uppercase tracking-wide">
          {floorLabel ?? "Current floor"}
        </span>
        <span>Click an apartment to see details</span>
      </div>
      <svg
        viewBox="0 0 100 100"
        className="h-64 w-full rounded-lg border border-slate-800 bg-slate-950/60"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="building-bg" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
        </defs>
        <rect x={2} y={2} width={96} height={96} rx={4} fill="url(#building-bg)" stroke="#E5E7EB" strokeWidth={0.6} />
        {apartments.map((apt, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const paddingX = 4;
          const paddingY = 6;

          const x = col * cellWidth + paddingX;
          const y = row * cellHeight + paddingY;
          const w = cellWidth - paddingX * 2;
          const h = cellHeight - paddingY * 2;

          const isSelected = apt.id === selectedApartmentId;
          const fill = statusFill[apt.status];

          return (
            <g
              key={apt.id}
              className="cursor-pointer"
              onClick={() => onSelectApartment(apt.id)}
            >
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                rx={2}
                ry={2}
                fill={fill}
                opacity={isSelected ? 0.98 : 0.9}
                stroke={isSelected ? "#F97316" : "#E5E7EB"}
                strokeWidth={isSelected ? 1.6 : 0.8}
                className="transition-transform transition-opacity duration-200 hover:opacity-100 hover:translate-y-[-0.5]"
              />
              <text
                x={x + w / 2}
                y={y + h / 2 - 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={4}
                fill="#020617"
                fontWeight={600}
              >
                {apt.id}
              </text>
              <text
                x={x + w / 2}
                y={y + h / 2 + 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={3}
                fill="#020617"
              >
                {apt.status === "available"
                  ? "Available"
                  : apt.status === "sold"
                  ? "Sold"
                  : "Reserved"}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Available
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-rose-500" /> Sold
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-amber-400" /> Reserved
        </span>
      </div>
    </div>
  );
}
