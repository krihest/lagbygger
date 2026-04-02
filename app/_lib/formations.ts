import type { Position } from "./types";

export interface FormationSlot {
  position: Position;
  label: string;
  x: number; // 0–100, left to right
  y: number; // 0–100, top (attack) to bottom (own goal)
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
      { position: "Keeper",   label: "Keeper",   x: 50, y: 87 },
      { position: "Forsvar",  label: "Forsvar",  x: 27, y: 70 },
      { position: "Forsvar",  label: "Forsvar",  x: 73, y: 70 },
      { position: "Midtbane", label: "Midtbane", x: 18, y: 52 },
      { position: "Midtbane", label: "Midtbane", x: 50, y: 52 },
      { position: "Midtbane", label: "Midtbane", x: 82, y: 52 },
      { position: "Angrep",   label: "Spiss",    x: 50, y: 28 },
    ],
  },
  {
    id: "2-1-2-1",
    name: "2-1-2-1",
    format: 7,
    description: "Diamant — kontroll på midtbane",
    slots: [
      { position: "Keeper",   label: "Keeper",      x: 50, y: 87 },
      { position: "Forsvar",  label: "Forsvar",     x: 27, y: 72 },
      { position: "Forsvar",  label: "Forsvar",     x: 73, y: 72 },
      { position: "Midtbane", label: "Defensiv MF", x: 50, y: 58 },
      { position: "Midtbane", label: "Offensiv MF", x: 25, y: 42 },
      { position: "Midtbane", label: "Offensiv MF", x: 75, y: 42 },
      { position: "Angrep",   label: "Spiss",       x: 50, y: 25 },
    ],
  },
  {
    id: "3-2-1",
    name: "3-2-1",
    format: 7,
    description: "Solid forsvar",
    slots: [
      { position: "Keeper",   label: "Keeper",   x: 50, y: 87 },
      { position: "Forsvar",  label: "Forsvar",  x: 18, y: 70 },
      { position: "Forsvar",  label: "Forsvar",  x: 50, y: 70 },
      { position: "Forsvar",  label: "Forsvar",  x: 82, y: 70 },
      { position: "Midtbane", label: "Midtbane", x: 33, y: 52 },
      { position: "Midtbane", label: "Midtbane", x: 67, y: 52 },
      { position: "Angrep",   label: "Spiss",    x: 50, y: 28 },
    ],
  },
  {
    id: "1-3-2",
    name: "1-3-2",
    format: 7,
    description: "Offensiv — to spisser",
    slots: [
      { position: "Keeper",   label: "Keeper",    x: 50, y: 87 },
      { position: "Forsvar",  label: "Forsvarer", x: 50, y: 70 },
      { position: "Midtbane", label: "Midtbane",  x: 18, y: 52 },
      { position: "Midtbane", label: "Midtbane",  x: 50, y: 52 },
      { position: "Midtbane", label: "Midtbane",  x: 82, y: 52 },
      { position: "Angrep",   label: "Spiss",     x: 30, y: 28 },
      { position: "Angrep",   label: "Spiss",     x: 70, y: 28 },
    ],
  },
  {
    id: "2-2-2",
    name: "2-2-2",
    format: 7,
    description: "Balansert — to angripere",
    slots: [
      { position: "Keeper",   label: "Keeper",   x: 50, y: 87 },
      { position: "Forsvar",  label: "Forsvar",  x: 30, y: 70 },
      { position: "Forsvar",  label: "Forsvar",  x: 70, y: 70 },
      { position: "Midtbane", label: "Midtbane", x: 30, y: 52 },
      { position: "Midtbane", label: "Midtbane", x: 70, y: 52 },
      { position: "Angrep",   label: "Spiss",    x: 30, y: 28 },
      { position: "Angrep",   label: "Spiss",    x: 70, y: 28 },
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
