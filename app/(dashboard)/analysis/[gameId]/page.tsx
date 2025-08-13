/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chess } from "chess.js";
import dynamic from "next/dynamic";
import { analyzePgn, AnalyzedMove } from "@/lib/chess-analysis/analyzeGame";

const Chessboard: any = dynamic(() => import("react-chessboard").then((m: any) => m.Chessboard || m.default), { ssr: false });

type GameResponse = {
  id: string;
  pgn: string;
  opponent: string;
  endTime: string;
  openingName?: string | null;
  ecoCode?: string | null;
};

export default function GameAnalysisPage(props: any) {
  const gameId: string = props?.params?.gameId;
  const { data, isLoading } = useQuery<GameResponse>({ queryKey: ["game", gameId], queryFn: async () => {
    const res = await fetch(`/api/game/${gameId}`);
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }});

  const [fen, setFen] = useState("start");
  const [index, setIndex] = useState(0);
  const [moves, setMoves] = useState<AnalyzedMove[]>([]);
  const [running, setRunning] = useState(false);

  const chess = useMemo(() => new Chess(), []);

  useEffect(() => {
    if (!data?.pgn) return;
    chess.loadPgn(data.pgn);
    setFen(new Chess().fen());
    setIndex(0);
  }, [data?.pgn, chess]);

  function goto(targetIndex: number) {
    if (!data?.pgn) return;
    const sequence = new Chess(data.pgn).history({ verbose: true });
    const apply = new Chess();
    for (let k = 0; k < targetIndex; k++) {
      const m = sequence[k];
      if (!m) break;
      apply.move({ from: m.from, to: m.to, promotion: m.promotion });
    }
    setFen(apply.fen());
    setIndex(Math.max(0, Math.min(targetIndex, sequence.length)));
  }

  async function runAnalysis() {
    if (!data?.pgn) return;
    setRunning(true);
    const t0 = performance.now();
    const analyzed = await analyzePgn(data.pgn, 200);
    const durationMs = Math.round(performance.now() - t0);
    setMoves(analyzed);
    await fetch(`/api/analysis/${gameId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moves: analyzed, summary: { durationMs } }),
    });
    setRunning(false);
  }

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <Chessboard position={fen} arePiecesDraggable={false} boardWidth={480} />
        <div className="flex gap-2">
          <button className="px-2 py-1 border border-neutral-600 rounded" onClick={() => goto(Math.max(0, index-1))}>Prev</button>
          <button className="px-2 py-1 border border-neutral-600 rounded" onClick={() => goto(index+1)}>Next</button>
          <button className="px-3 py-1 bg-emerald-400 text-black rounded" onClick={runAnalysis} disabled={running}>{running?"Analyzing...":"Run analysis"}</button>
        </div>
      </div>
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded p-3 overflow-auto max-h-[75vh]">
        <h2 className="font-semibold mb-2">Moves</h2>
        <ol className="space-y-1 text-sm">
          {moves.map((m, idx) => (
            <li key={idx} className="flex justify-between gap-2">
              <span>{m.moveNumber}. {m.san}</span>
              <span className="text-neutral-400">{m.moveQuality}{m.evalCp!=null?` (${m.evalCp}cp)`:""}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
