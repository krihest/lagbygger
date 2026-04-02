"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCoach } from "../_hooks/useCoach";
import { useCreateMatch } from "../_hooks/useMatch";
import { PositionBadge } from "./Badge";
import { FORMATIONS, getFormationsForFormat } from "../_lib/formations";
import type { MatchFormat } from "../_lib/types";

const FORMATS: MatchFormat[] = [5, 7, 9, 11];

export default function MatchSetupClient({ coachId }: { coachId: string }) {
  const { coach } = useCoach(coachId);
  const { createMatch } = useCreateMatch(coachId);
  const router = useRouter();

  const [duration, setDuration] = useState(60);
  const [format, setFormat] = useState<MatchFormat>(7);
  const [subInterval, setSubInterval] = useState(10);
  const [formationId, setFormationId] = useState("2-3-1");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Select all players by default on first render
  if (coach && !initialized) {
    setSelectedIds(coach.players.map((p) => p.id));
    setInitialized(true);
  }

  if (!coach) return <div className="min-h-screen flex items-center justify-center text-zinc-400">Laster...</div>;

  const availableFormations = getFormationsForFormat(format);
  const selectedCount = selectedIds.length;
  const tooFewPlayers = selectedCount < format;

  function togglePlayer(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleStart() {
    if (tooFewPlayers) return;
    const matchId = createMatch({
      durationMinutes: duration,
      format,
      subIntervalMinutes: subInterval,
      playerIds: selectedIds,
    });
    router.push(`/${coachId}/kamp/${matchId}`);
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push(`/${coachId}`)} className="text-zinc-500 hover:text-white text-sm">
          ←
        </button>
        <div>
          <h1 className="text-xl font-bold">Kampoppsett</h1>
          <p className="text-zinc-400 text-sm">{coach.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Format */}
        <div>
          <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3">Format</label>
          <div className="grid grid-cols-4 gap-2">
            {FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFormat(f);
                  const fmts = getFormationsForFormat(f);
                  setFormationId(fmts[0]?.id ?? "ingen");
                }}
                className={`py-3 rounded-xl text-sm font-semibold border transition-colors ${
                  format === f
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {f}v{f}
              </button>
            ))}
          </div>
        </div>

        {/* Formation */}
        <div>
          <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3">Formasjon</label>
          <div className="space-y-2">
            {availableFormations.map((fm) => (
              <button
                key={fm.id}
                onClick={() => setFormationId(fm.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors ${
                  formationId === fm.id
                    ? "bg-emerald-500/10 border-emerald-500/60 text-white"
                    : "border-zinc-800 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                <span className="font-semibold">{fm.name}</span>
                <span className="text-xs text-zinc-500">{fm.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration + Interval */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3">
              Kampvarighet (min)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDuration((d) => Math.max(10, d - 5))}
                className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 text-xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
              >
                −
              </button>
              <span className="flex-1 text-center font-mono text-lg font-bold">{duration}</span>
              <button
                onClick={() => setDuration((d) => Math.min(120, d + 5))}
                className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 text-xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 uppercase tracking-wider mb-3">
              Bytte hvert (min)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubInterval((s) => Math.max(5, s - 5))}
                className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 text-xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
              >
                −
              </button>
              <span className="flex-1 text-center font-mono text-lg font-bold">{subInterval}</span>
              <button
                onClick={() => setSubInterval((s) => Math.min(30, s + 5))}
                className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 text-xl font-bold hover:bg-zinc-700 transition-colors flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Player selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs text-zinc-400 uppercase tracking-wider">
              Tilgjengelige spillere
            </label>
            <span className={`text-xs font-mono ${tooFewPlayers ? "text-red-400" : "text-emerald-400"}`}>
              {selectedCount} valgt · trenger {format}+
            </span>
          </div>
          <div className="space-y-2">
            {coach.players.map((p) => (
              <button
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${
                  selectedIds.includes(p.id)
                    ? "border-zinc-700 bg-zinc-900"
                    : "border-zinc-800 bg-zinc-900/40 opacity-50"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    selectedIds.includes(p.id)
                      ? "bg-emerald-500 text-black"
                      : "border border-zinc-600"
                  }`}
                >
                  {selectedIds.includes(p.id) ? "✓" : ""}
                </div>
                <span className="font-medium text-sm flex-1">{p.name}</span>
                <div className="flex gap-1">
                  {p.positions.map((pos) => (
                    <PositionBadge key={pos} pos={pos} />
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Estimated playing time */}
        {!tooFewPlayers && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-400 mb-1">Estimert spilletid per spiller</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">
              ~{Math.round((format * duration) / selectedCount)} min
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              av {duration} min · bytte hvert {subInterval} min
            </p>
          </div>
        )}

        {tooFewPlayers && (
          <p className="text-red-400 text-sm text-center">
            Velg minst {format} spillere for {format}v{format}
          </p>
        )}

        <button
          onClick={handleStart}
          disabled={tooFewPlayers}
          className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold text-base hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Generer bytteplan →
        </button>
      </div>
    </div>
  );
}
