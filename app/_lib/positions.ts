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
  formationId: string,
  activeKeeperId?: string // if set, this player is assigned the keeper slot first
): PlayerAssignment[] {
  const formation = FORMATIONS.find((f) => f.id === formationId);
  if (!formation || formation.slots.length === 0) {
    return onFieldIds.map((id) => ({
      playerId: id,
      slotLabel: "",
      position: "Midtbane" as Position,
    }));
  }

  const slots = [...formation.slots];

  // If an active keeper is specified, assign them to the keeper slot before anything else
  const preAssigned: PlayerAssignment[] = [];
  const preUsedPlayerIds = new Set<string>();
  const preFilledSlotIndices = new Set<number>();

  if (activeKeeperId && onFieldIds.includes(activeKeeperId)) {
    const keeperSlotIdx = slots.findIndex((s) => s.position === "Keeper");
    if (keeperSlotIdx !== -1) {
      preAssigned.push({
        playerId: activeKeeperId,
        slotLabel: slots[keeperSlotIdx].label,
        position: slots[keeperSlotIdx].position,
      });
      preUsedPlayerIds.add(activeKeeperId);
      preFilledSlotIndices.add(keeperSlotIdx);
    }
  }
  const available = onFieldIds.map((id) => allPlayers.find((p) => p.id === id)!).filter(Boolean);
  const assigned: PlayerAssignment[] = [...preAssigned];
  const usedPlayerIds = new Set<string>(preUsedPlayerIds);
  const filledSlotIndices = new Set<number>(preFilledSlotIndices);

  // Pass 1: assign players who have that position preference to a matching slot
  for (let i = 0; i < slots.length; i++) {
    if (filledSlotIndices.has(i)) continue; // skip slots pre-assigned (e.g. active keeper)
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
