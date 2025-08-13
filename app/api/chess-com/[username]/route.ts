import { NextResponse } from "next/server";
import { prisma } from "@/lib/database/prisma";
import { fetchMonthlyArchives, fetchGamesByArchiveUrl } from "@/lib/chess-com-api/client";

interface ChessComPlayerRef {
  username?: string;
  result?: string;
}

interface ChessComGameRaw {
  uuid?: string;
  url?: string;
  end_time?: number;
  white?: ChessComPlayerRef;
  black?: ChessComPlayerRef;
  pgn?: string;
  time_class?: string;
  rated?: boolean;
  eco?: string;
  opening?: string;
}

interface SimplifiedGameMeta {
  id: string;
  end_time: number;
  white?: ChessComPlayerRef;
  black?: ChessComPlayerRef;
  pgn: string;
  time_class: string;
  rated: boolean;
  url: string;
  eco?: string;
  opening?: string;
  result: string;
  opponent: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/").filter(Boolean);
    const username = decodeURIComponent(segments[segments.length - 1] || "").toLowerCase();

    const archives = await fetchMonthlyArchives(username);
    const archiveUrls: string[] = archives.archives || [];
    archiveUrls.sort();
    archiveUrls.reverse();

    const games: ChessComGameRaw[] = [];
    for (const url of archiveUrls) {
      if (games.length >= 120) break; // safety
      const data: { games?: ChessComGameRaw[] } = await fetchGamesByArchiveUrl(url);
      for (const g of data.games || []) {
        games.push(g);
        if (games.length >= 100) break;
      }
      if (games.length >= 100) break;
    }

    const simplified: SimplifiedGameMeta[] = [];
    for (const g of games) {
      const isWhite = (g.white?.username || "").toLowerCase() === username;
      const opponent = isWhite ? g.black?.username : g.white?.username;
      const result = isWhite ? g.white?.result : g.black?.result;
      simplified.push({
        id: g.uuid || g.url || `${g.end_time}`,
        end_time: g.end_time || 0,
        white: g.white,
        black: g.black,
        pgn: g.pgn || "",
        time_class: g.time_class || "",
        rated: !!g.rated,
        url: g.url || "",
        eco: g.eco,
        opening: g.opening,
        result: result || "",
        opponent: opponent || "unknown",
      });
    }

    let user = await prisma.user.findFirst({ where: { chessComUsername: username } });
    if (!user) {
      user = await prisma.user.create({ data: { email: `${username}@local.local`, passwordHash: "placeholder", chessComUsername: username } });
    }

    const writes = simplified.map((g) =>
      prisma.game.upsert({
        where: { chessComGameId: g.id },
        update: {
          opponent: g.opponent,
          pgn: g.pgn,
          result: g.result,
          timeClass: g.time_class,
          endTime: new Date(g.end_time * 1000),
          rated: g.rated,
          ecoCode: g.eco || null,
          openingName: g.opening || null,
          userId: user!.id,
        },
        create: {
          chessComGameId: g.id,
          opponent: g.opponent,
          pgn: g.pgn,
          result: g.result,
          timeClass: g.time_class,
          endTime: new Date(g.end_time * 1000),
          rated: g.rated,
          ecoCode: g.eco || null,
          openingName: g.opening || null,
          userId: user!.id,
        },
      })
    );

    await prisma.$transaction(writes);

    return NextResponse.json({ count: simplified.length });
  } catch {
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}
