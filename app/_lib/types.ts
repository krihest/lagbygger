export type Position = "Keeper" | "Forsvar" | "Midtbane" | "Angrep";

export interface Player {
  id: string;
  name: string;
  positions: Position[];
}

export interface Coach {
  id: string;
  name: string;
  players: Player[];
  createdAt: number;
}

export type MatchFormat = 5 | 7 | 9 | 11;

export interface MatchConfig {
  id: string;
  coachId: string;
  durationMinutes: number;
  format: MatchFormat;
  subIntervalMinutes: number;
  subsPerRound: number;
  formationId: string;
  playerIds: string[];
  keeperIds: string[]; // up to 2; [0] plays first half, [1] plays second half
  createdAt: number;
}

export interface SubEvent {
  atMinute: number;
  playersOn: string[];
  playersOff: string[];
  onFieldAfter: string[];
}

export interface MatchSchedule {
  matchConfigId: string;
  startingLineup: string[];
  events: SubEvent[];
}

export interface MatchState {
  matchConfigId: string;
  startedAt: number | null;
  isPaused: boolean;
  pausedAt: number | null;
  totalPausedMs: number;
}

export interface LiveMatchView {
  elapsedSeconds: number;
  elapsedMinutes: number;
  nextSubAtMinute: number | null;
  secondsUntilNextSub: number | null;
  onField: string[];
  onBench: string[];
  completedEventCount: number;
}
