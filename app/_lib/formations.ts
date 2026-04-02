import type { Position } from "./types";

export interface FormationSlot {
  position: Position;
  label: string;
}

export interface Formation {
  id: string;
  name: string;
  format: number; // players on field including keeper
  description: string;
  slots: FormationSlot[];
}

export const FORMATIONS: Formation[] = [
  {
    id: "2-3-1",
    name: "2-3-1",
    format: 7,
    description: "Mest populær — balansert",
    slots: [
      { position: "Keeper", label: "Keeper" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Angrep", label: "Spiss" },
    ],
  },
  {
    id: "2-1-2-1",
    name: "2-1-2-1",
    format: 7,
    description: "Diamant — kontroll på midtbane",
    slots: [
      { position: "Keeper", label: "Keeper" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Midtbane", label: "Defensiv MF" },
      { position: "Midtbane", label: "Offensiv MF" },
      { position: "Midtbane", label: "Offensiv MF" },
      { position: "Angrep", label: "Spiss" },
    ],
  },
  {
    id: "3-2-1",
    name: "3-2-1",
    format: 7,
    description: "Solid forsvar",
    slots: [
      { position: "Keeper", label: "Keeper" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Angrep", label: "Spiss" },
    ],
  },
  {
    id: "1-3-2",
    name: "1-3-2",
    format: 7,
    description: "Offensiv — to spisser",
    slots: [
      { position: "Keeper", label: "Keeper" },
      { position: "Forsvar", label: "Forsvarer" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Angrep", label: "Spiss" },
      { position: "Angrep", label: "Spiss" },
    ],
  },
  {
    id: "2-2-2",
    name: "2-2-2",
    format: 7,
    description: "Balansert — to angripere",
    slots: [
      { position: "Keeper", label: "Keeper" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Forsvar", label: "Forsvar" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Midtbane", label: "Midtbane" },
      { position: "Angrep", label: "Spiss" },
      { position: "Angrep", label: "Spiss" },
    ],
  },
  {
    id: "ingen",
    name: "Ingen formasjon",
    format: 0,
    description: "Bare bytteplan uten posisjoner",
    slots: [],
  },
];

export function getFormationsForFormat(format: number): Formation[] {
  return FORMATIONS.filter((f) => f.format === format || f.id === "ingen");
}
