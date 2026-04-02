import type { MatchConfig, MatchSchedule, SubEvent } from "./types";
import { shuffleArray } from "./utils";

export function generateSchedule(config: MatchConfig): MatchSchedule {
  const {
    id,
    format,
    durationMinutes,
    subIntervalMinutes,
    subsPerRound = 2,
    playerIds,
    keeperIds = [],
  } = config;

  const keeper1 = keeperIds[0] ?? null;
  const keeper2 = keeperIds[1] ?? null;
  const hasTwoKeepers = !!(keeper1 && keeper2);

  // Both keepers always play (neither ever sits on bench).
  // Regular rotation happens among the remaining players only.
  const keeperSet = new Set([keeper1, keeper2].filter(Boolean) as string[]);
  const rotationIds = playerIds.filter((p) => !keeperSet.has(p));

  // Field spots available for rotation players
  // (both keepers occupy 2 spots when hasTwoKeepers, else 1 spot per keeper)
  const keeperSpotsUsed = Math.min(keeperSet.size, format);
  const rotFieldSpots = format - keeperSpotsUsed;

  const shuffled = shuffleArray(rotationIds);
  const startingRotation = shuffled.slice(0, rotFieldSpots);
  const benchRotation = shuffled.slice(rotFieldSpots);

  // Starting lineup: keeper1 (+ keeper2 if two keepers) + rotation starters
  const startingLineup = hasTwoKeepers
    ? [keeper1!, keeper2!, ...startingRotation]
    : keeper1
    ? [keeper1, ...startingRotation]
    : shuffled.slice(0, format);

  // No rotation needed if everyone fits on field
  const noRotation = rotationIds.length <= rotFieldSpots;
  if (noRotation && !hasTwoKeepers) {
    return {
      matchConfigId: id,
      startingLineup: keeper1 ? [keeper1, ...rotationIds] : shuffleArray(playerIds),
      events: [],
    };
  }

  const subMinutes: number[] = [];
  for (let m = subIntervalMinutes; m < durationMinutes; m += subIntervalMinutes) {
    subMinutes.push(m);
  }

  const fieldIntervals: Record<string, number> = {};
  rotationIds.forEach((pid) => (fieldIntervals[pid] = 0));

  let onFieldRotation = [...startingRotation];
  let onBenchRotation = [...benchRotation];
  const events: SubEvent[] = [];

  for (const minute of subMinutes) {
    onFieldRotation.forEach((pid) => (fieldIntervals[pid] += 1));

    if (noRotation || onBenchRotation.length === 0) continue;

    const subsCount = Math.min(onBenchRotation.length, rotFieldSpots, subsPerRound);

    const sortedField = [...onFieldRotation].sort(
      (a, b) => fieldIntervals[b] - fieldIntervals[a]
    );
    const playersOff = sortedField.slice(0, subsCount);

    const sortedBench = [...onBenchRotation].sort(
      (a, b) => fieldIntervals[a] - fieldIntervals[b]
    );
    const playersOn = sortedBench.slice(0, subsCount);

    onFieldRotation = [
      ...onFieldRotation.filter((p) => !playersOff.includes(p)),
      ...playersOn,
    ];
    onBenchRotation = [
      ...onBenchRotation.filter((p) => !playersOn.includes(p)),
      ...playersOff,
    ];

    const onFieldAfter = hasTwoKeepers
      ? [keeper1!, keeper2!, ...onFieldRotation]
      : keeper1
      ? [keeper1, ...onFieldRotation]
      : [...onFieldRotation];

    events.push({ atMinute: minute, playersOn, playersOff, onFieldAfter });
  }

  return {
    matchConfigId: id,
    startingLineup,
    events,
    keeperSwapAtMinute: hasTwoKeepers ? durationMinutes / 2 : undefined,
  };
}

export function getPlayingMinutes(
  schedule: MatchSchedule,
  config: MatchConfig
): Record<string, number> {
  const { playerIds, durationMinutes } = config;
  const result: Record<string, number> = {};
  playerIds.forEach((pid) => (result[pid] = 0));

  let onField = new Set(schedule.startingLineup);
  let prevMinute = 0;

  for (const evt of schedule.events) {
    const interval = evt.atMinute - prevMinute;
    onField.forEach((pid) => (result[pid] += interval));
    prevMinute = evt.atMinute;
    evt.playersOff.forEach((p) => onField.delete(p));
    evt.playersOn.forEach((p) => onField.add(p));
  }

  const lastInterval = durationMinutes - prevMinute;
  onField.forEach((pid) => (result[pid] += lastInterval));

  return result;
}
