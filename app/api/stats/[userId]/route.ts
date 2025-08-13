import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { computePersonas } from "@/lib/chess-analysis/classify";

function getUserIdFromReq(req: Request): string {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromReq(req);
    const games = await prisma.game.findMany({ where: { userId }, orderBy: { endTime: "asc" } });
    const movesByGame = await prisma.move.groupBy({ by: ["gameId"], _count: { _all: true } }).catch(() => [] as Array<{ gameId: string; _count: { _all: number } }[]>);
    const total = games.length;
    const wins = games.filter((g) => g.result === "win" || g.result === "won").length;
    const losses = games.filter((g) => g.result === "loss" || g.result === "lost").length;
    const draws = total - wins - losses;

    const totalMoves = (movesByGame as unknown as Array<{ gameId: string; _count: { _all: number } }>).reduce((acc, g) => acc + (g._count?._all || 0), 0);
    const avgLen = Math.round((totalMoves / (total || 1)) || 0);

    const last = await prisma.game.findFirst({ where: { userId, analysis: { is: {} } }, orderBy: { endTime: "desc" }, include: { moves: true, analysis: true } });
    const personas = computePersonas(last?.moves || [], last?.analysis || null);

    return NextResponse.json({ total, wins, losses, draws, avgLen, games, personas });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
