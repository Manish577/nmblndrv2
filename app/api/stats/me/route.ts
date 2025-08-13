import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const games = await prisma.game.findMany({ where: { userId: session.user.id }, orderBy: { endTime: "desc" } });
  return NextResponse.json({ games });
}
