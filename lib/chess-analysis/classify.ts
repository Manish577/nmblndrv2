import { Move, Analysis } from "@prisma/client";

export type MoveQuality = "Brilliant" | "Great" | "Good" | "Inaccuracy" | "Mistake" | "Blunder";

export function classifyFromCentipawnLoss(cpl: number): MoveQuality {
  if (cpl <= 10) return "Brilliant";
  if (cpl <= 30) return "Great";
  if (cpl <= 60) return "Good";
  if (cpl <= 100) return "Inaccuracy";
  if (cpl <= 300) return "Mistake";
  return "Blunder";
}

export type PersonaKey =
  | "Time Scrambler"
  | "Tactician"
  | "Endgame Specialist"
  | "Opening Scholar"
  | "Positional Player"
  | "Aggressive Attacker"
  | "Defensive Wall"
  | "Comeback Kid"
  | "Tilt Master";

export type PersonaScore = { key: PersonaKey; score: number };

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function computePersonas(moves: Move[], _analysis?: Analysis | null): PersonaScore[] {
  const scores: Record<PersonaKey, number> = {
    "Time Scrambler": 0,
    "Tactician": 0,
    "Endgame Specialist": 0,
    "Opening Scholar": 0,
    "Positional Player": 0,
    "Aggressive Attacker": 0,
    "Defensive Wall": 0,
    "Comeback Kid": 0,
    "Tilt Master": 0,
  };

  // Simple heuristics; can be improved with richer data
  const total = moves.length || 1;
  const blunders = moves.filter((m) => m.moveQuality === "Blunder").length;
  const inaccuracies = moves.filter((m) => m.moveQuality === "Inaccuracy").length;
  const mistakes = moves.filter((m) => m.moveQuality === "Mistake").length;

  // Time Scrambler: high blunders with low time data
  const lowTimeBlunders = moves.filter((m) => (m.timeSpentMs ?? 0) < 5000 && m.moveQuality === "Blunder").length;
  scores["Time Scrambler"] = (lowTimeBlunders / total) * 100;

  // Opening Scholar: small loss before move 12
  const openingMoves = moves.filter((m) => m.moveNumber <= 24);
  const openingAvgLoss = avg(openingMoves.map((m) => Math.abs(m.evalCp ?? 0)));
  scores["Opening Scholar"] = Math.max(0, 100 - openingAvgLoss / 2);

  // Positional Player: low overall loss
  const overallAvgLoss = avg(moves.map((m) => Math.abs(m.evalCp ?? 0)));
  scores["Positional Player"] = Math.max(0, 100 - overallAvgLoss / 2);

  // Endgame Specialist: better after move 60 or <7 pieces (approximate by move number)
  const endgameMoves = moves.filter((m) => m.moveNumber > 60);
  const endAvg = avg(endgameMoves.map((m) => Math.abs(m.evalCp ?? 0)));
  scores["Endgame Specialist"] = Math.max(0, 100 - endAvg / 2);

  // Tilt Master: many consecutive mistakes later in the game
  const lateMistakes = moves.filter((m) => m.moveNumber > 40 && (m.moveQuality === "Mistake" || m.moveQuality === "Blunder"));
  scores["Tilt Master"] = (lateMistakes.length / total) * 100;

  // Simple placeholders for others
  scores["Tactician"] = 50 - inaccuracies;
  scores["Aggressive Attacker"] = 50 + (mistakes - inaccuracies);
  scores["Defensive Wall"] = 50 - blunders;
  scores["Comeback Kid"] = 50; // needs game result history to refine

  const list: PersonaScore[] = Object.entries(scores).map(([key, score]) => ({ key: key as PersonaKey, score }));
  list.sort((a, b) => b.score - a.score);
  return list;
}

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
