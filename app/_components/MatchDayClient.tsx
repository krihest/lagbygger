"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMatch } from "../_hooks/useMatch";
import { useMatchTimer } from "../_hooks/useMatchTimer";
import { useCoach } from "../_hooks/useCoach";
import { formatTime } from "../_lib/utils";
import { PositionBadge } from "./Badge";
import type { SubEvent } from "../_lib/types";
import { getPlayingMinutes } from "../_lib/scheduler";
import { assignPositions, getAssignment } from "../_lib/positions";

export default function MatchDayClient({
  coachId,
  matchId,
}: {
  coachId: string;
  matchId: string;
}) {
  const { config, schedule, state, saveState } = useMatch(matchId);
  const { coach } = useCoach(coachId);
  const { liveView, start, pause, resume, reset } = useMatchTimer(
    state,
    config,
    schedule,
    saveState
  );
  const router = useRouter();
  const [lastEventCount, setLastEventCount] = useState<number>(0);
  const [alertEvent, setAlertEvent] = useState<SubEvent | null>(null);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Detect new sub event and show alert
  useEffect(() => {
    if (!liveView || !schedule) return;
    if (liveView.completedEventCount > lastEventCount) {
      const event = schedule.events[liveView.completedEventCount - 1];
      setAlertEvent(event);
      setLastEventCount(liveView.completedEventCount);
      clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = setTimeout(() => setAlertEvent(null), 8000);
    }
  }, [liveView?.completedEventCount]);

  function playerName(id: string) {
    return coach?.players.find((p) => p.id === id)?.name ?? id;
  }

  function playerPositions(id: string) {
    return coach?.players.find((p) => p.id === id)?.positions ?? [];
  }

  if (!config || !schedule || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-400">
        Laster...
      </div>
    );
  }

  const hasStarted = state.startedAt !== null;
  const seconds = liveView?.secondsUntilNextSub ?? null;
  const isUrgent = seconds !== null && seconds <= 60;
  const isCritical = seconds !== null && seconds <= 15;

  const playingMinutes = schedule ? getPlayingMinutes(schedule, config) : {};
  const currentOnField = liveView?.onField ?? schedule.startingLineup;
  const positionAssignments = coach
    ? assignPositions(currentOnField, coach.players, config.formationId ?? "ingen")
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/${coachId}`)}
          className="text-zinc-500 hover:text-white text-sm"
        >
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Kamp</h1>
          <p className="text-zinc-400 text-xs">
            {config.format}v{config.format} · {config.durationMinutes} min · bytte hvert {config.subIntervalMinutes} min
          </p>
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          {liveView ? formatTime(liveView.elapsedSeconds) : "00:00"}
        </span>
      </div>

      {/* Sub Alert Banner */}
      {alertEvent && (
        <div className="mb-4 p-4 rounded-xl bg-amber-500/20 border border-amber-500/50 animate-pulse">
          <p className="text-amber-300 font-bold text-sm mb-1">🔔 BYTTE NÅ!</p>
          <p className="text-white text-sm">
            <span className="text-red-400 font-semibold">UT: </span>
            {alertEvent.playersOff.map(playerName).join(", ")}
          </p>
          <p className="text-white text-sm">
            <span className="text-emerald-400 font-semibold">INN: </span>
            {alertEvent.playersOn.map(playerName).join(", ")}
          </p>
        </div>
      )}

      {/* Countdown */}
      <div
        className={`rounded-2xl p-6 text-center mb-6 border transition-colors ${
          !hasStarted
            ? "bg-zinc-900 border-zinc-800"
            : isCritical
            ? "bg-red-950/60 border-red-500/50"
            : isUrgent
            ? "bg-amber-950/60 border-amber-500/50"
            : "bg-zinc-900 border-zinc-800"
        }`}
      >
        {seconds !== null && hasStarted ? (
          <>
            <p className="text-zinc-400 text-xs mb-1 uppercase tracking-wider">
              Neste bytte om
            </p>
            <p
              className={`text-6xl font-mono font-bold tabular-nums ${
                isCritical ? "text-red-400" : isUrgent ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {formatTime(seconds)}
            </p>
            <p className="text-zinc-500 text-xs mt-2">
              ved {liveView?.nextSubAtMinute} min
            </p>
          </>
        ) : hasStarted ? (
          <p className="text-zinc-400 text-sm">Ingen flere bytter planlagt</p>
        ) : (
          <p className="text-zinc-400 text-sm">Klar til start</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        {!hasStarted ? (
          <button
            onClick={start}
            className="flex-1 py-4 rounded-xl bg-emerald-500 text-black font-bold text-lg hover:bg-emerald-400 transition-colors"
          >
            ▶ Start kamp
          </button>
        ) : state.isPaused ? (
          <>
            <button
              onClick={resume}
              className="flex-1 py-4 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors"
            >
              ▶ Fortsett
            </button>
            <button
              onClick={reset}
              className="px-5 py-4 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-colors"
            >
              ↺
            </button>
          </>
        ) : (
          <>
            <button
              onClick={pause}
              className="flex-1 py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
            >
              ⏸ Pause
            </button>
            <button
              onClick={reset}
              className="px-5 py-4 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-colors"
            >
              ↺
            </button>
          </>
        )}
      </div>

      {/* On field */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">På banen</h2>
          <span className="text-xs text-emerald-400 font-mono">{liveView?.onField.length ?? schedule.startingLineup.length}</span>
        </div>
        <div className="space-y-1.5">
          {currentOnField.map((id) => {
            const assignment = getAssignment(id, positionAssignments);
            return (
              <div
                key={id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-medium text-sm">{playerName(id)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {assignment?.slotLabel && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-medium">
                      {assignment.slotLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* On bench */}
      {(liveView?.onBench.length ?? 0) > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">På benken</h2>
            <span className="text-xs text-zinc-500 font-mono">{liveView?.onBench.length}</span>
          </div>
          <div className="space-y-1.5">
            {liveView?.onBench.map((id) => (
              <div
                key={id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  <span className="text-zinc-400 text-sm">{playerName(id)}</span>
                </div>
                <div className="flex gap-1">
                  {playerPositions(id).map((pos) => (
                    <PositionBadge key={pos} pos={pos} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub schedule */}
      <div>
        <h2 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3">
          Bytteplan
        </h2>
        {schedule.events.length === 0 ? (
          <p className="text-zinc-500 text-sm">Ingen bytter — alle spiller hele kampen.</p>
        ) : (
          <div className="space-y-2">
            {schedule.events.map((evt, i) => {
              const isDone = liveView
                ? liveView.completedEventCount > i
                : false;
              const isNext = liveView
                ? liveView.completedEventCount === i
                : i === 0;
              return (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-xl border text-sm transition-colors ${
                    isDone
                      ? "border-zinc-800 opacity-40"
                      : isNext
                      ? "border-amber-500/40 bg-amber-950/20"
                      : "border-zinc-800 bg-zinc-900/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-zinc-300">
                      {evt.atMinute} min
                    </span>
                    {isNext && !isDone && (
                      <span className="text-xs text-amber-400">Neste</span>
                    )}
                    {isDone && <span className="text-xs text-zinc-500">✓</span>}
                  </div>
                  <p className="text-zinc-300">
                    <span className="text-red-400">UT:</span>{" "}
                    {evt.playersOff.map(playerName).join(", ")}
                  </p>
                  <p className="text-zinc-300">
                    <span className="text-emerald-400">INN:</span>{" "}
                    {evt.playersOn.map(playerName).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Playing time summary */}
      <div className="mt-6 mb-8">
        <h2 className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-3">
          Spilletid
        </h2>
        <div className="space-y-1.5">
          {config.playerIds.map((id) => {
            const mins = playingMinutes[id] ?? 0;
            const pct = Math.round((mins / config.durationMinutes) * 100);
            return (
              <div key={id} className="flex items-center gap-3">
                <span className="text-sm text-zinc-300 w-28 truncate">{playerName(id)}</span>
                <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-400 font-mono w-12 text-right">
                  {mins} min
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
