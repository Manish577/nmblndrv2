const BASE = process.env.CHESS_COM_API_BASE || "https://api.chess.com/pub";

export async function fetchUser(username: string) {
  const res = await fetch(`${BASE}/player/${encodeURIComponent(username)}`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function fetchMonthlyArchives(username: string) {
  const res = await fetch(`${BASE}/player/${encodeURIComponent(username)}/games/archives`, {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error("Failed to fetch archives");
  return res.json();
}

export async function fetchGamesByArchiveUrl(url: string) {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Failed to fetch games");
  return res.json();
}
