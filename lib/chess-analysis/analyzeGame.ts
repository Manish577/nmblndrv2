"use client";

import { Chess } from "chess.js";
import { StockfishEngine } from "@/lib/chess-analysis/engine";
import { classifyFromCentipawnLoss } from "@/lib/chess-analysis/classify";

export type AnalyzedMove = {
  moveNumber: number;
  san: string;
  uci: string | null;
  color: "w" | "b";
  timeSpentMs: number | null;
  evalCp: number | null; // evaluation after the move from side to move perspective
  bestMoveUci: string | null;
  moveQuality: string;
  fenAfter: string;
};

export async function analyzePgn(pgn: string, movetimeMs = 300): Promise<AnalyzedMove[]> {
  const engine = new StockfishEngine();
  await engine.init();
  const chess = new Chess();
  chess.loadPgn(pgn);

  const history = chess.history({ verbose: true });
  const moves: AnalyzedMove[] = [];

  // Replay from start, evaluating positions
  const replay = new Chess();
  for (let i = 0; i < history.length; i++) {
    const move = history[i]!;
    const color = move.color as "w" | "b";

    // Evaluate position BEFORE making the move
    const fenBefore = replay.fen();
    const evalBefore = await engine.analyzeFen(fenBefore, movetimeMs);

    // Make move
    replay.move({ from: move.from, to: move.to, promotion: move.promotion });
    const fenAfter = replay.fen();

    // Evaluate AFTER
    const evalAfter = await engine.analyzeFen(fenAfter, movetimeMs);

    // centipawn loss: difference from before to after for side who moved
    const cpBefore = evalBefore.cp ?? 0;
    const cpAfter = evalAfter.cp ?? 0;
    const centipawnLoss = Math.abs(cpBefore - cpAfter);

    const quality = classifyFromCentipawnLoss(centipawnLoss);

    moves.push({
      moveNumber: i + 1,
      san: move.san,
      uci: move.from && move.to ? `${move.from}${move.to}${move.promotion || ""}` : null,
      color,
      timeSpentMs: null,
      evalCp: evalAfter.cp,
      bestMoveUci: evalBefore.best,
      moveQuality: quality,
      fenAfter,
    });
  }

  engine.dispose();
  return moves;
}
