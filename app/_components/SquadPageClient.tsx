"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoach, useCoaches } from "../_hooks/useCoach";
import { PositionBadge } from "./Badge";
import type { Position } from "../_lib/types";

const ALL_POSITIONS: Position[] = ["Keeper", "Forsvar", "Midtbane", "Angrep"];

export default function SquadPageClient({ coachId }: { coachId: string }) {
  const { coach, addPlayer, removePlayer, updatePlayer, renameCoach } = useCoach(coachId);
  const { deleteCoach } = useCoaches();
  const [name, setName] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState("");
  const [editPlayerPositions, setEditPlayerPositions] = useState<Position[]>([]);
  const router = useRouter();

  function startEditPlayer(id: string, currentName: string, currentPositions: Position[]) {
    setEditingPlayerId(id);
    setEditPlayerName(currentName);
    setEditPlayerPositions(currentPositions);
  }

  function toggleEditPosition(pos: Position) {
    setEditPlayerPositions((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
  }

  function handleUpdatePlayer(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPlayerId || !editPlayerName.trim()) return;
    updatePlayer(editingPlayerId, editPlayerName.trim(), editPlayerPositions);
    setEditingPlayerId(null);
  }

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
    <div className="min-h-screen bg-zinc-950 px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/")} className="text-zinc-500 hover:text-white text-sm">
          ←
        </button>
        <div className="flex-1">
          {editingName ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newName.trim()) renameCoach(newName.trim());
                setEditingName(false);
              }}
              className="flex gap-2"
            >
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-sm outline-none border border-emerald-500 bg-zinc-800 text-white"
              />
              <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-sm font-semibold">Lagre</button>
              <button type="button" onClick={() => setEditingName(false)} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm">Avbryt</button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{coach.name}</h1>
              <button
                onClick={() => { setNewName(coach.name); setEditingName(true); }}
                className="text-zinc-600 hover:text-zinc-300 text-sm transition-colors"
                title="Endre lagnavn"
              >
                ✏️
              </button>
            </div>
          )}
          <p className="text-zinc-400 text-sm">{coach.players.length} spillere i troppen</p>
        </div>

        {/* Delete team */}
        {confirmDelete ? (
          <div className="flex gap-2">
            <button
              onClick={() => { deleteCoach(coachId); router.push("/"); }}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
            >
              Slett
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
            >
              Avbryt
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-zinc-600 hover:text-red-400 text-sm transition-colors"
            title="Slett lag"
          >
            🗑
          </button>
        )}
      </div>

      {/* Player list */}
      <div className="space-y-2 mb-6">
        {coach.players.length === 0 && (
          <p className="text-zinc-500 text-sm text-center py-8">
            Ingen spillere ennå. Legg til spillere for å begynne.
          </p>
        )}
        {coach.players.map((p, i) =>
          editingPlayerId === p.id ? (
            <form
              key={p.id}
              onSubmit={handleUpdatePlayer}
              className="bg-zinc-900 border border-emerald-500/50 rounded-xl p-4 space-y-3"
            >
              <input
                autoFocus
                type="text"
                value={editPlayerName}
                onChange={(e) => setEditPlayerName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none text-sm text-white"
              />
              <div>
                <p className="text-zinc-400 text-xs mb-2">Posisjon (valgfritt)</p>
                <div className="flex gap-2 flex-wrap">
                  {ALL_POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => toggleEditPosition(pos)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        editPlayerPositions.includes(pos)
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
                  className="flex-1 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition-colors"
                >
                  Lagre
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPlayerId(null)}
                  className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
                >
                  Avbryt
                </button>
              </div>
            </form>
          ) : (
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
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEditPlayer(p.id, p.name, p.positions)}
                  className="text-zinc-600 hover:text-zinc-200 px-2 py-1 rounded transition-colors text-sm"
                  aria-label="Rediger spiller"
                >
                  ✏️
                </button>
                <button
                  onClick={() => removePlayer(p.id)}
                  className="text-zinc-600 hover:text-red-400 text-lg px-2 transition-colors"
                  aria-label="Fjern spiller"
                >
                  ×
                </button>
              </div>
            </div>
          )
        )}
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
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 focus:border-emerald-500 outline-none text-sm text-white placeholder:text-zinc-500"
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
