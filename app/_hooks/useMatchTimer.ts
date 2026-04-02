"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { MatchConfig, MatchSchedule, MatchState, LiveMatchView } from "../_lib/types";

function computeLiveView(
  state: MatchState,
  config: MatchConfig,
  schedule: MatchSchedule,
  now: number
): LiveMatchView {
  let elapsedMs = 0;
  if (state.startedAt !== null) {
    if (state.isPaused && state.pausedAt !== null) {
      elapsedMs = state.pausedAt - state.startedAt - state.totalPausedMs;
    } else {
      elapsedMs = now - state.startedAt - state.totalPausedMs;
    }
  }

  elapsedMs = Math.max(0, elapsedMs);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const elapsedMinutes = elapsedSeconds / 60;

  // Count how many events have fired
  const completedEventCount = schedule.events.filter(
    (e) => elapsedMinutes >= e.atMinute
  ).length;

  // Current lineup based on completed events
  const currentEvent = completedEventCount > 0
    ? schedule.events[completedEventCount - 1]
    : null;
  const onField = currentEvent
    ? currentEvent.onFieldAfter
    : schedule.startingLineup;

  const allPlayerIds = [
    ...schedule.startingLineup,
    ...schedule.events.flatMap((e) => e.playersOn),
  ];
  const uniqueIds = [...new Set(allPlayerIds)];
  const onBench = uniqueIds.filter((p) => !onField.includes(p));

  // Next sub
  const nextEvent = schedule.events[completedEventCount] ?? null;
  const nextSubAtMinute = nextEvent ? nextEvent.atMinute : null;
  const secondsUntilNextSub = nextSubAtMinute !== null
    ? Math.max(0, Math.round(nextSubAtMinute * 60 - elapsedSeconds))
    : null;

  return {
    elapsedSeconds,
    elapsedMinutes,
    nextSubAtMinute,
    secondsUntilNextSub,
    onField,
    onBench,
    completedEventCount,
  };
}

export function useMatchTimer(
  state: MatchState | null,
  config: MatchConfig | null,
  schedule: MatchSchedule | null,
  saveState: (s: MatchState) => void,
  simulationSpeed: number = 1
) {
  const [liveView, setLiveView] = useState<LiveMatchView | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!state || !config || !schedule) return;

    const tick = () => {
      const s = stateRef.current;
      if (!s || s.startedAt === null) {
        setLiveView(computeLiveView(s ?? state, config, schedule, Date.now()));
        return;
      }
      // Scale elapsed wall-clock time by simulationSpeed
      const realElapsed = Date.now() - s.startedAt;
      const virtualNow = s.startedAt + realElapsed * simulationSpeed;
      setLiveView(computeLiveView(s, config, schedule, virtualNow));
    };

    tick();
    const id = setInterval(tick, 100); // faster tick for smooth simulation
    return () => clearInterval(id);
  }, [config, schedule, state?.isPaused, state?.startedAt, simulationSpeed]);

  const start = useCallback(() => {
    if (!state) return;
    const next: MatchState = {
      ...state,
      startedAt: Date.now(),
      isPaused: false,
      pausedAt: null,
    };
    saveState(next);
  }, [state, saveState]);

  const pause = useCallback(() => {
    if (!state || state.isPaused) return;
    const next: MatchState = {
      ...state,
      isPaused: true,
      pausedAt: Date.now(),
    };
    saveState(next);
  }, [state, saveState]);

  const resume = useCallback(() => {
    if (!state || !state.isPaused || state.pausedAt === null) return;
    const pausedDuration = Date.now() - state.pausedAt;
    const next: MatchState = {
      ...state,
      isPaused: false,
      pausedAt: null,
      totalPausedMs: state.totalPausedMs + pausedDuration,
    };
    saveState(next);
  }, [state, saveState]);

  const reset = useCallback(() => {
    if (!state) return;
    const next: MatchState = {
      ...state,
      startedAt: null,
      isPaused: false,
      pausedAt: null,
      totalPausedMs: 0,
    };
    saveState(next);
  }, [state, saveState]);

  return { liveView, start, pause, resume, reset };
}
