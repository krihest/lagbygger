import type { Coach, MatchConfig, MatchSchedule, MatchState } from "./types";

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const storage = {
  getCoaches: () => get<Coach[]>("lb_coaches", []),
  saveCoaches: (c: Coach[]) => set("lb_coaches", c),

  getMatches: () => get<MatchConfig[]>("lb_matches", []),
  saveMatches: (m: MatchConfig[]) => set("lb_matches", m),

  getSchedule: (matchId: string) =>
    get<MatchSchedule | null>(`lb_schedule_${matchId}`, null),
  saveSchedule: (s: MatchSchedule) =>
    set(`lb_schedule_${s.matchConfigId}`, s),

  getMatchState: (matchId: string) =>
    get<MatchState | null>(`lb_state_${matchId}`, null),
  saveMatchState: (s: MatchState) =>
    set(`lb_state_${s.matchConfigId}`, s),
};
