"use client";

import { useState, useEffect, useCallback } from "react";
import { storage } from "../_lib/storage";
import { generateId } from "../_lib/utils";
import type { Coach, Player, Position } from "../_lib/types";

export function useCoaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);

  useEffect(() => {
    setCoaches(storage.getCoaches());
  }, []);

  const createCoach = useCallback((name: string): Coach => {
    const coach: Coach = {
      id: generateId(),
      name,
      players: [],
      createdAt: Date.now(),
    };
    const updated = [...storage.getCoaches(), coach];
    storage.saveCoaches(updated);
    setCoaches(updated);
    return coach;
  }, []);

  const deleteCoach = useCallback((id: string) => {
    const updated = storage.getCoaches().filter((c) => c.id !== id);
    storage.saveCoaches(updated);
    setCoaches(updated);
  }, []);

  return { coaches, createCoach, deleteCoach };
}

export function useCoach(coachId: string) {
  const [coach, setCoach] = useState<Coach | null>(null);

  const load = useCallback(() => {
    const found = storage.getCoaches().find((c) => c.id === coachId) ?? null;
    setCoach(found);
  }, [coachId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback((updated: Coach) => {
    const all = storage.getCoaches();
    const next = all.map((c) => (c.id === coachId ? updated : c));
    storage.saveCoaches(next);
    setCoach(updated);
  }, [coachId]);

  const addPlayer = useCallback(
    (name: string, positions: Position[]) => {
      if (!coach) return;
      const player: Player = { id: generateId(), name, positions };
      save({ ...coach, players: [...coach.players, player] });
    },
    [coach, save]
  );

  const removePlayer = useCallback(
    (playerId: string) => {
      if (!coach) return;
      save({ ...coach, players: coach.players.filter((p) => p.id !== playerId) });
    },
    [coach, save]
  );

  const updatePlayer = useCallback(
    (playerId: string, name: string, positions: Position[]) => {
      if (!coach) return;
      save({
        ...coach,
        players: coach.players.map((p) =>
          p.id === playerId ? { ...p, name, positions } : p
        ),
      });
    },
    [coach, save]
  );

  const renameCoach = useCallback(
    (newName: string) => {
      if (!coach) return;
      save({ ...coach, name: newName });
    },
    [coach, save]
  );

  return { coach, addPlayer, removePlayer, updatePlayer, renameCoach };
}
