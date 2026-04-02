"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoach } from "../_hooks/useCoach";
import { PositionBadge } from "./Badge";
import type { Position } from "../_lib/types";

const ALL_POSITIONS: Position[] = ["Keeper", "Forsvar", "Midtbane", "Angrep"];

export default function SquadPageClient({ coachId }: { coachId: string }) {
  const { coach, addPlayer, removePlayer } = useCoach(coachId);
  const [name, setName] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  if (!coach) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Laster...
      </div>
    );
  }

  function togglePosition(pos: Position) {
    setPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    addPlayer(name.trim(), positions);
    setName("");
    setPositions([]);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/")} className="text-zinc-500 hover:text-white text-sm">
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold">{coach.name}</h1>
          <p className="text-zinc-400 text-sm">{coach.players.length} spillere i troppen</p>
        </div>
      </div>

      {/* Player list */}
      <div className="space-y-2 mb-6">
        {coach.players.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">
            Ingen spillere ennå. Legg til spillere for å begynne.
          </p>
        )}
        {coach.players.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800"
          >
            <div className="flex items-center gap-3">
              <span className="text-zinc-600 text-sm w-5 text-right">{i + 1}</span>
              <div>
                <p className="font-medium text-sm">{p.name}</p>
                {p.positions.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {p.positions.map((pos) => (
                      <PositionBadge key={pos} pos={pos} />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => removePlayer(p.id)}
              className="text-zinc-600 hover:text-red-400 text-lg px-2 transition-colors"
              aria-label="Fjern spiller"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add player form */}
      {showForm ? (
        <form onSubmit={handleAdd} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-4 mb-4">
          <input
            autoFocus
            type="text"
            placeholder="Spillerens navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none text-sm"
          />
          <div>
            <p className="text-zinc-400 text-xs mb-2">Posisjon (valgfritt)</p>
            <div className="flex gap-2 flex-wrap">
              {ALL_POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => togglePosition(pos)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    positions.includes(pos)
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors"
            >
              Legg til
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setName(""); setPositions([]); }}
              className="px-4 py-3 rounded-lg bg-zinc-800 text-zinc-300 text-sm"
            >
              Avbryt
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 text-sm hover:border-emerald-500 hover:text-emerald-400 transition-colors mb-4"
        >
          + Legg til spiller
        </button>
      )}

      {/* Start match button */}
      {coach.players.length >= 2 && (
        <button
          onClick={() => router.push(`/${coachId}/kamp`)}
          className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold text-base hover:bg-emerald-400 transition-colors mt-2"
        >
          Start kamp →
        </button>
      )}
    </div>
  );
}
