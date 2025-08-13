import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";

function getGameIdFromReq(req: Request): string {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export async function GET(req: Request) {
  const gameId = getGameIdFromReq(req);
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(game);
}
