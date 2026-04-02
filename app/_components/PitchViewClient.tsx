"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMatch } from "../_hooks/useMatch";
import { useMatchTimer } from "../_hooks/useMatchTimer";
import { useCoach } from "../_hooks/useCoach";
import { formatTime } from "../_lib/utils";
import { FORMATIONS } from "../_lib/formations";
import { assignPositions } from "../_lib/positions";

const POSITION_COLORS: Record<string, string> = {
  Keeper:   "#f59e0b", // amber
  Forsvar:  "#3b82f6", // blue
  Midtbane: "#22c55e", // green
  Angrep:   "#ef4444", // red
};

export default function PitchViewClient({
  coachId,
  matchId,
}: {
  coachId: string;
  matchId: string;
}) {
  const { config, schedule, state, saveState } = useMatch(matchId);
  const { coach } = useCoach(coachId);
  const [simSpeed, setSimSpeed] = useState(1);
  const { liveView, start, pause, resume, reset } = useMatchTimer(state, config, schedule, saveState, simSpeed);
  const router = useRouter();

  if (!config || !schedule || !state || !coach) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Laster...
      </div>
    );
  }

  const formation = FORMATIONS.find((f) => f.id === (config.formationId ?? "ingen"));
  const hasStarted = state.startedAt !== null;
  const currentOnField = liveView?.onField ?? schedule.startingLineup;

  // Determine active keeper
  const keeperSwapMinute = schedule.keeperSwapAtMinute ?? null;
  const elapsedMin = liveView?.elapsedMinutes ?? 0;
  const activeKeeperId =
    config.keeperIds?.length === 2
      ? elapsedMin >= (keeperSwapMinute ?? Infinity)
        ? config.keeperIds[1]
        : config.keeperIds[0]
      : config.keeperIds?.[0];

  const assignments = assignPositions(
    currentOnField,
    coach.players,
    config.formationId ?? "ingen",
    activeKeeperId
  );

  function playerName(id: string) {
    return coach?.players.find((p) => p.id === id)?.name ?? id;
  }

  // Map each on-field player to their pitch coordinates using slotIndex (not label)
  const playerDots = assignments
    .filter((a) => formation?.id !== "ingen" || true)
    .map((a) => {
      const slot = formation?.slots[a.slotIndex];
      const x = slot?.x ?? 50;
      const y = slot?.y ?? 50;
      const color = POSITION_COLORS[a.position] ?? "#71717a";
      return { playerId: a.playerId, name: playerName(a.playerId), x, y, color, label: a.slotLabel };
    });

  // Players on bench (no formation slot)
  const onBench = liveView?.onBench ?? [];

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <button
          onClick={() => router.push(`/${coachId}/kamp/${matchId}`)}
          className="text-zinc-500 hover:text-white text-sm"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold">Banevisning</h1>
          <p className="text-zinc-400 text-xs">{config.formationId} · {config.format}v{config.format}</p>
        </div>
        <span className="text-sm font-mono text-zinc-300 font-bold">
          {liveView ? formatTime(liveView.elapsedSeconds) : "00:00"}
        </span>
      </div>

      {/* Pitch SVG */}
      <div className="px-3 flex-1">
        <svg
          viewBox="0 0 300 420"
          className="w-full"
          style={{ maxHeight: "65vh" }}
        >
          {/* Pitch background */}
          <rect x="0" y="0" width="300" height="420" rx="8" fill="#166534" />

          {/* Grass stripes */}
          {[0,1,2,3,4,5].map((i) => (
            <rect
              key={i}
              x="0" y={i * 70} width="300" height="35"
              fill="rgba(0,0,0,0.06)"
            />
          ))}

          {/* Outer border */}
          <rect x="10" y="10" width="280" height="400" rx="4"
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

          {/* Centre line */}
          <line x1="10" y1="210" x2="290" y2="210"
            stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

          {/* Centre circle */}
          <circle cx="150" cy="210" r="35"
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="150" cy="210" r="2" fill="rgba(255,255,255,0.6)" />

          {/* Our penalty area (bottom) */}
          <rect x="75" y="340" width="150" height="70" rx="2"
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          {/* Our goal */}
          <rect x="110" y="405" width="80" height="12" rx="2"
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

          {/* Opponent penalty area (top) */}
          <rect x="75" y="10" width="150" height="70" rx="2"
            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
          {/* Opponent goal */}
          <rect x="110" y="3" width="80" height="12" rx="2"
            fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />

          {/* Player dots */}
          {playerDots.map((dot) => {
            const cx = (dot.x / 100) * 280 + 10;
            const cy = (dot.y / 100) * 400 + 10;
            const isKeeper = dot.label === "Keeper";
            return (
              <g key={dot.playerId}>
                {/* Shadow */}
                <circle cx={cx + 1} cy={cy + 1} r={isKeeper ? 18 : 16}
                  fill="rgba(0,0,0,0.3)" />
                {/* Circle */}
                <circle cx={cx} cy={cy} r={isKeeper ? 18 : 16}
                  fill={dot.color} stroke="white" strokeWidth={isKeeper ? 2.5 : 2} />
                {/* Position label inside */}
                <text
                  x={cx} y={cy - 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={isKeeper ? "7" : "6.5"}
                  fontWeight="bold"
                  fill="white"
                  style={{ userSelect: "none" }}
                >
                  {dot.label.length > 6 ? dot.label.slice(0, 5) + "…" : dot.label}
                </text>
                {/* Player name below */}
                <text
                  x={cx} y={cy + 10}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="6"
                  fill="white"
                  opacity="0.9"
                  style={{ userSelect: "none" }}
                >
                  {dot.name.length > 8 ? dot.name.slice(0, 7) + "…" : dot.name}
                </text>
              </g>
            );
          })}

          {/* "Motstandere" label top */}
          <text x="150" y="6" textAnchor="middle" fontSize="7"
            fill="rgba(255,255,255,0.3)" fontStyle="italic">
            Motstandere
          </text>
        </svg>
      </div>

      {/* Bench */}
      {onBench.length > 0 && (
        <div className="px-4 py-3 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">På benken</p>
          <div className="flex flex-wrap gap-2">
            {onBench.map((id) => (
              <span
                key={id}
                className="px-3 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium"
              >
                {playerName(id)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-4 pb-6 pt-3 space-y-3">
        <div className="flex gap-3">
          {!hasStarted ? (
            <button
              onClick={start}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors"
            >
              ▶ Start kamp
            </button>
          ) : state.isPaused ? (
            <button
              onClick={resume}
              className="flex-1 py-3 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors"
            >
              ▶ Fortsett
            </button>
          ) : (
            <button
              onClick={pause}
              className="flex-1 py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
            >
              ⏸ Pause
            </button>
          )}
          <button
            onClick={reset}
            className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-colors"
          >
            ↺
          </button>
        </div>

        {/* Simulation speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Hastighet:</span>
          {[1, 10, 60, 120].map((speed) => (
            <button
              key={speed}
              onClick={() => setSimSpeed(speed)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                simSpeed === speed
                  ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                  : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {speed === 1 ? "1×" : speed === 120 ? "120× (sim)" : `${speed}×`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
