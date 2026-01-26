type FloorSelectorProps = {
  floors: { floorNumber: number; label?: string }[];
  selectedFloor: number;
  onSelectFloor: (floorNumber: number) => void;
};

export default function FloorSelector({ floors, selectedFloor, onSelectFloor }: FloorSelectorProps) {
  if (!floors.length) return null;

  if (floors.length === 1) {
    const floor = floors[0];
    return (
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="font-medium uppercase tracking-wide">Floor</span>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-200">
          {floor.label ?? `Level ${floor.floorNumber}`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
        Floor
      </span>
      <div className="flex flex-wrap gap-2">
        {floors.map((floor) => {
          const isActive = floor.floorNumber === selectedFloor;
          return (
            <button
              key={floor.floorNumber}
              type="button"
              onClick={() => onSelectFloor(floor.floorNumber)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-primary bg-primary text-slate-950"
                  : "border-slate-700 bg-slate-900 text-slate-200 hover:border-primary hover:text-primary"
              }`}
            >
              {floor.label ?? `Level ${floor.floorNumber}`}
            </button>
          );
        })}
      </div>
    </div>
  );
}
