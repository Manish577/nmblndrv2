import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

interface MoveInput {
  moveNumber: number;
  san: string;
  uci?: string | null;
  color: "w" | "b";
  timeSpentMs?: number | null;
  evalCp?: number | null;
  bestMoveUci?: string | null;
  moveQuality?: string | null;
  fenAfter?: string | null;
}

interface SummaryInput {
  accuracyOpening?: number | null;
  accuracyMiddle?: number | null;
  accuracyEnd?: number | null;
  criticalMomentsJson?: string | null;
  biggestMistakesJson?: string | null;
  playerPersonasJson?: string | null;
  durationMs?: number | null;
}

function getGameIdFromReq(req: Request): string {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export async function GET(req: Request) {
  try {
    const gameId = getGameIdFromReq(req);
    const game = await prisma.game.findUnique({ where: { id: gameId }, include: { analysis: true } });
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ status: game.analysis?.completed ? "completed" : game.analysis ? "running" : "pending", analysis: game.analysis || null });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const gameId = getGameIdFromReq(req);
    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.analysis.upsert({
      where: { gameId },
      update: { completed: false },
      create: { gameId, completed: false },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const gameId = getGameIdFromReq(req);
    const body = (await req.json()) as { moves: MoveInput[]; summary?: SummaryInput };

    const moves = Array.isArray(body.moves) ? body.moves : [];

    if (moves.length > 0) {
      await prisma.move.deleteMany({ where: { gameId } });
      await prisma.$transaction(
        moves.map((m) =>
          prisma.move.create({
            data: {
              gameId,
              moveNumber: m.moveNumber,
              san: m.san,
              uci: m.uci ?? null,
              color: m.color,
              timeSpentMs: m.timeSpentMs ?? null,
              evalCp: m.evalCp ?? null,
              bestMoveUci: m.bestMoveUci ?? null,
              moveQuality: m.moveQuality ?? null,
              fenAfter: m.fenAfter ?? null,
            },
          })
        )
      );
    }

    const s = body.summary ?? {};

    await prisma.analysis.upsert({
      where: { gameId },
      update: {
        completed: true,
        accuracyOpening: s.accuracyOpening ?? null,
        accuracyMiddle: s.accuracyMiddle ?? null,
        accuracyEnd: s.accuracyEnd ?? null,
        criticalMomentsJson: s.criticalMomentsJson ?? null,
        biggestMistakesJson: s.biggestMistakesJson ?? null,
        playerPersonasJson: s.playerPersonasJson ?? null,
        durationMs: s.durationMs ?? null,
      },
      create: {
        gameId,
        completed: true,
        accuracyOpening: s.accuracyOpening ?? null,
        accuracyMiddle: s.accuracyMiddle ?? null,
        accuracyEnd: s.accuracyEnd ?? null,
        criticalMomentsJson: s.criticalMomentsJson ?? null,
        biggestMistakesJson: s.biggestMistakesJson ?? null,
        playerPersonasJson: s.playerPersonasJson ?? null,
        durationMs: s.durationMs ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
