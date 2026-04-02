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
  const hasTwoKeepers = keeper1 !== null && keeper2 !== null;
  const keeperSet = new Set([keeper1, keeper2].filter(Boolean) as string[]);
  const halftime = durationMinutes / 2;

  // Players available for regular (non-keeper) rotation
  const rotationIds = playerIds.filter((p) => !keeperSet.has(p));
  // Field spots for rotation players (keeper takes 1 spot when keeperIds is set)
  const rotFieldSpots = keeperSet.size > 0 ? format - 1 : format;

  const shuffled = shuffleArray(rotationIds);
  const startingRotation = shuffled.slice(0, rotFieldSpots);
  const benchRotation = shuffled.slice(rotFieldSpots);

  const startingLineup = keeper1
    ? [keeper1, ...startingRotation]
    : shuffled.slice(0, format);

  const noRotationNeeded = rotationIds.length <= rotFieldSpots;

  // If no rotation needed and no keeper swap needed: empty events
  if (noRotationNeeded && !hasTwoKeepers) {
    const lineup = keeper1
      ? [keeper1, ...rotationIds]
      : shuffleArray(playerIds);
    return { matchConfigId: id, startingLineup: lineup, events: [] };
  }

  // Build event minutes; add halftime for keeper swap if not already there
  const subMinutes: number[] = [];
  for (let m = subIntervalMinutes; m < durationMinutes; m += subIntervalMinutes) {
    subMinutes.push(m);
  }
  const allMinutes =
    hasTwoKeepers && !subMinutes.includes(halftime)
      ? [...subMinutes, halftime].sort((a, b) => a - b)
      : subMinutes;

  const fieldIntervals: Record<string, number> = {};
  rotationIds.forEach((pid) => (fieldIntervals[pid] = 0));

  let onFieldRotation = [...startingRotation];
  let onBenchRotation = [...benchRotation];
  let currentKeeper = keeper1;

  const events: SubEvent[] = [];

  for (const minute of allMinutes) {
    onFieldRotation.forEach((pid) => (fieldIntervals[pid] += 1));

    const isKeeperSwap = hasTwoKeepers && minute === halftime;

    // Regular rotation subs (skipped if everyone always plays)
    const subsCount = noRotationNeeded
      ? 0
      : Math.min(onBenchRotation.length, rotFieldSpots, subsPerRound);

    let playersOff: string[] = [];
    let playersOn: string[] = [];

    if (subsCount > 0) {
      const sortedField = [...onFieldRotation].sort(
        (a, b) => fieldIntervals[b] - fieldIntervals[a]
      );
      playersOff = sortedField.slice(0, subsCount);

      const sortedBench = [...onBenchRotation].sort(
        (a, b) => fieldIntervals[a] - fieldIntervals[b]
      );
      playersOn = sortedBench.slice(0, subsCount);

      onFieldRotation = [
        ...onFieldRotation.filter((p) => !playersOff.includes(p)),
        ...playersOn,
      ];
      onBenchRotation = [
        ...onBenchRotation.filter((p) => !playersOn.includes(p)),
        ...playersOff,
      ];
    }

    // Keeper swap at halftime
    if (isKeeperSwap) {
      playersOff = [...playersOff, keeper1!];
      playersOn = [...playersOn, keeper2!];
      currentKeeper = keeper2;
    }

    if (playersOff.length > 0) {
      const onFieldAfter = currentKeeper
        ? [currentKeeper, ...onFieldRotation]
        : [...onFieldRotation];
      events.push({ atMinute: minute, playersOn, playersOff, onFieldAfter });
    }
  }

  return { matchConfigId: id, startingLineup, events };
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
