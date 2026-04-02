import type { Player, Position } from "./types";
import { FORMATIONS, type Formation } from "./formations";

export interface PlayerAssignment {
  playerId: string;
  slotLabel: string;
  position: Position;
}

/**
 * Assigns players on the field to formation slots.
 * Prioritises players whose preferred positions match the slot.
 */
export function assignPositions(
  onFieldIds: string[],
  allPlayers: Player[],
  formationId: string
): PlayerAssignment[] {
  const formation = FORMATIONS.find((f) => f.id === formationId);
  if (!formation || formation.slots.length === 0) {
    // No formation — return players without position assignment
    return onFieldIds.map((id) => ({
      playerId: id,
      slotLabel: "",
      position: "Midtbane" as Position,
    }));
  }

  const slots = [...formation.slots];
  const available = onFieldIds.map((id) => allPlayers.find((p) => p.id === id)!).filter(Boolean);
  const assigned: PlayerAssignment[] = [];
  const usedPlayerIds = new Set<string>();
  const filledSlotIndices = new Set<number>();

  // Pass 1: assign players who have that position preference to a matching slot
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    const match = available.find(
      (p) =>
        !usedPlayerIds.has(p.id) &&
        p.positions.length > 0 &&
        p.positions.includes(slot.position)
    );
    if (match) {
      assigned.push({ playerId: match.id, slotLabel: slot.label, position: slot.position });
      usedPlayerIds.add(match.id);
      filledSlotIndices.add(i);
    }
  }

  // Pass 2: fill remaining slots with unassigned players (track by index, not label)
  const remainingSlots = slots.filter((_, i) => !filledSlotIndices.has(i));
  const remainingPlayers = available.filter((p) => !usedPlayerIds.has(p.id));

  for (let i = 0; i < remainingSlots.length; i++) {
    const slot = remainingSlots[i];
    const player = remainingPlayers[i];
    if (player) {
      assigned.push({ playerId: player.id, slotLabel: slot.label, position: slot.position });
    }
  }

  return assigned;
}

export function getAssignment(
  playerId: string,
  assignments: PlayerAssignment[]
): PlayerAssignment | undefined {
  return assignments.find((a) => a.playerId === playerId);
}
