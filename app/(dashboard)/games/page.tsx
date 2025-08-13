"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GameItem = {
  id: string;
  opponent: string;
  endTime: string;
  openingName?: string | null;
  ecoCode?: string | null;
  timeClass: string;
};

export default function GamesPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [games, setGames] = useState<GameItem[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);

  async function fetchGamesFromChessCom() {
    if (!username) return;
    setLoading(true);
    setMessage(null);
    const res = await fetch(`/api/chess-com/${encodeURIComponent(username)}`);
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      setMessage(`Fetched ${data.count} games`);
      void loadMyGames();
    } else setMessage(data?.error || "Failed");
  }

  async function loadMyGames() {
    setLoadingGames(true);
    const res = await fetch("/api/stats/me");
    if (res.ok) {
      const data = await res.json();
      setGames(data.games || []);
    }
    setLoadingGames(false);
  }

  useEffect(() => {
    void loadMyGames();
  }, []);

  async function startAnalysis(gameId: string) {
    await fetch(`/api/analysis/${gameId}`, { method: "POST" });
    window.location.href = `/analysis/${gameId}`;
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Games</h1>
        <p className="text-sm text-neutral-400">Enter your Chess.com username to import your latest games.</p>
        <div className="mt-4 flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Chess.com username"
            className="p-2 bg-transparent border border-neutral-700 rounded"
          />
          <button onClick={fetchGamesFromChessCom} disabled={loading} className="px-3 py-2 bg-emerald-400 text-black rounded">
            {loading ? "Fetching..." : "Fetch last 100"}
          </button>
          <Link href="/analysis" className="px-3 py-2 border border-neutral-600 rounded">Go to Analysis</Link>
        </div>
        {message && <p className="mt-3 text-sm text-neutral-300">{message}</p>}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">My games</h2>
        {loadingGames ? (
          <div className="text-sm text-neutral-400">Loading games...</div>
        ) : games.length === 0 ? (
          <div className="text-sm text-neutral-400">No games stored yet.</div>
        ) : (
          <div className="grid gap-3">
            {games.map((g) => (
              <div key={g.id} className="bg-[#1a1a1a] border border-neutral-800 p-4 rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">{g.openingName || g.ecoCode || g.timeClass}</div>
                  <div className="text-sm text-neutral-400">{new Date(g.endTime).toLocaleString()} — vs {g.opponent}</div>
                </div>
                <div className="flex gap-2">
                  <Link className="px-3 py-2 border border-neutral-600 rounded" href={`/analysis/${g.id}`}>Open</Link>
                  <button onClick={() => startAnalysis(g.id)} className="px-3 py-2 bg-emerald-400 text-black rounded">Analyze</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
