import type { MatchConfig, MatchSchedule, SubEvent } from "./types";
import { shuffleArray } from "./utils";

export function generateSchedule(
  config: MatchConfig
): MatchSchedule {
  const { id, format, durationMinutes, subIntervalMinutes, playerIds } = config;
  const n = playerIds.length;
  const f = format;

  // Shuffle to randomise starting lineup
  const shuffled = shuffleArray(playerIds);

  const startingLineup = shuffled.slice(0, f);
  const initialBench = shuffled.slice(f);

  if (n <= f) {
    // Everyone plays — no subs needed
    return { matchConfigId: id, startingLineup: shuffled, events: [] };
  }

  const events: SubEvent[] = [];
  const subMinutes: number[] = [];
  for (let m = subIntervalMinutes; m < durationMinutes; m += subIntervalMinutes) {
    subMinutes.push(m);
  }

  // Track field time (in intervals) per player
  const fieldIntervals: Record<string, number> = {};
  playerIds.forEach((pid) => (fieldIntervals[pid] = 0));

  let onField = [...startingLineup];
  let onBench = [...initialBench];

  // Count initial interval
  onField.forEach((pid) => (fieldIntervals[pid] += 0)); // starts at 0 before first interval

  for (const minute of subMinutes) {
    // Add the interval that just completed
    onField.forEach((pid) => (fieldIntervals[pid] += 1));

    const benchSize = onBench.length;
    const subsCount = Math.min(benchSize, f);

    // Players going OFF: those with most field time
    const sortedField = [...onField].sort(
      (a, b) => fieldIntervals[b] - fieldIntervals[a]
    );
    const playersOff = sortedField.slice(0, subsCount);

    // Players coming ON: those with least field time (from bench)
    const sortedBench = [...onBench].sort(
      (a, b) => fieldIntervals[a] - fieldIntervals[b]
    );
    const playersOn = sortedBench.slice(0, subsCount);

    // Update rosters
    onField = [
      ...onField.filter((p) => !playersOff.includes(p)),
      ...playersOn,
    ];
    onBench = [
      ...onBench.filter((p) => !playersOn.includes(p)),
      ...playersOff,
    ];

    events.push({
      atMinute: minute,
      playersOn,
      playersOff,
      onFieldAfter: [...onField],
    });
  }

  return { matchConfigId: id, startingLineup, events };
}

export function getPlayingMinutes(
  schedule: MatchSchedule,
  config: MatchConfig
): Record<string, number> {
  const { playerIds, durationMinutes, subIntervalMinutes } = config;
  const result: Record<string, number> = {};
  playerIds.forEach((pid) => (result[pid] = 0));

  let onField = new Set(schedule.startingLineup);
  let prevMinute = 0;

  for (const evt of schedule.events) {
    const interval = evt.atMinute - prevMinute;
    onField.forEach((pid) => (result[pid] += interval));
    prevMinute = evt.atMinute;

    // Apply the sub
    evt.playersOff.forEach((p) => onField.delete(p));
    evt.playersOn.forEach((p) => onField.add(p));
  }

  // Last segment
  const lastInterval = durationMinutes - prevMinute;
  onField.forEach((pid) => (result[pid] += lastInterval));

  return result;
}
