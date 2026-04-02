import type { Position } from "../_lib/types";

const colors: Record<Position, string> = {
  Keeper: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Forsvar: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Midtbane: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Angrep: "bg-red-500/20 text-red-300 border-red-500/30",
};

export function PositionBadge({ pos }: { pos: Position }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${colors[pos]}`}>
      {pos}
    </span>
  );
}
