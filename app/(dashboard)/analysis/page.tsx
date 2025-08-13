"use client";

import { useQuery } from "@tanstack/react-query";

interface GameItem {
  id: string;
  opponent: string;
  endTime: string;
  openingName?: string | null;
  ecoCode?: string | null;
  timeClass: string;
}

export default function AnalysisListPage() {
  const { data, isLoading } = useQuery<{ games: GameItem[] }>({ queryKey: ["games"], queryFn: async () => {
    const res = await fetch("/api/stats/me");
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }});

  async function startAnalysis(gameId: string) {
    await fetch(`/api/analysis/${gameId}`, { method: "POST" });
    window.location.href = `/analysis/${gameId}`;
  }

  if (isLoading) return <div className="p-6">Loading...</div>;

  const games = data?.games || [];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Analysis</h1>
      <div className="grid gap-3">
        {games.map((g) => (
          <div key={g.id} className="bg-[#1a1a1a] border border-neutral-800 p-4 rounded flex items-center justify-between">
            <div>
              <div className="font-medium">{g.openingName || g.ecoCode || g.timeClass}</div>
              <div className="text-sm text-neutral-400">{new Date(g.endTime).toLocaleString()} — vs {g.opponent}</div>
            </div>
            <div className="flex gap-2">
              <a className="px-3 py-2 border border-neutral-600 rounded" href={`/analysis/${g.id}`}>Open</a>
              <button onClick={() => startAnalysis(g.id)} className="px-3 py-2 bg-emerald-400 text-black rounded">Analyze</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
