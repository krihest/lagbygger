"use client";

import { useState, useEffect, useCallback } from "react";
import { storage } from "../_lib/storage";
import { generateId } from "../_lib/utils";
import { generateSchedule } from "../_lib/scheduler";
import type { MatchConfig, MatchFormat, MatchSchedule, MatchState } from "../_lib/types";

export function useMatch(matchId: string) {
  const [config, setConfig] = useState<MatchConfig | null>(null);
  const [schedule, setSchedule] = useState<MatchSchedule | null>(null);
  const [state, setState] = useState<MatchState | null>(null);

  useEffect(() => {
    const cfg = storage.getMatches().find((m) => m.id === matchId) ?? null;
    setConfig(cfg);
    setSchedule(storage.getSchedule(matchId));
    setState(storage.getMatchState(matchId));
  }, [matchId]);

  const saveState = useCallback((s: MatchState) => {
    storage.saveMatchState(s);
    setState(s);
  }, []);

  return { config, schedule, state, saveState };
}

export function useCreateMatch(coachId: string) {
  const createMatch = useCallback(
    (opts: {
      durationMinutes: number;
      format: MatchFormat;
      subIntervalMinutes: number;
      subsPerRound: number;
      formationId: string;
      playerIds: string[];
    }): string => {
      const config: MatchConfig = {
        id: generateId(),
        coachId,
        createdAt: Date.now(),
        ...opts,
      };
      const matches = [...storage.getMatches(), config];
      storage.saveMatches(matches);

      const schedule = generateSchedule(config);
      storage.saveSchedule(schedule);

      const initialState: MatchState = {
        matchConfigId: config.id,
        startedAt: null,
        isPaused: false,
        pausedAt: null,
        totalPausedMs: 0,
      };
      storage.saveMatchState(initialState);

      return config.id;
    },
    [coachId]
  );

  return { createMatch };
}
