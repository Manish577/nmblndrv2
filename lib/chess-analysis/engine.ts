"use client";

export type EngineEval = { cp: number | null; mate: number | null; best: string | null };

export class StockfishEngine {
  private worker: Worker | null = null;
  private listeners: Array<(line: string) => void> = [];

  async init(): Promise<void> {
    if (this.worker) return;
    this.worker = new Worker("/stockfish/engine-worker.js");
    this.worker.onmessage = (e: MessageEvent) => {
      const { type, line, message } = e.data || {};
      if (type === "stdout" && line) this.listeners.forEach((l) => l(line));
      if (type === "error") console.warn("Engine error:", message);
    };
    this.send(["uci", "isready"]);
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
  }

  private send(cmd: string | string[]) {
    if (!this.worker) throw new Error("Engine not initialized");
    this.worker.postMessage({ cmd });
  }

  onOutput(cb: (line: string) => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  async analyzeFen(fen: string, movetimeMs = 500): Promise<EngineEval> {
    await this.init();
    const outputs: string[] = [];
    const off = this.onOutput((line) => outputs.push(line));

    this.send(["ucinewgame", `position fen ${fen}`, `go movetime ${movetimeMs}`]);

    const result = await new Promise<EngineEval>((resolve) => {
      const stopAt = Date.now() + movetimeMs + 200;
      const iv = setInterval(() => {
        if (Date.now() > stopAt) {
          clearInterval(iv);
          // Parse bestmove and last info score
          let best: string | null = null;
          let cp: number | null = null;
          let mate: number | null = null;
          for (const l of outputs) {
            if (l.startsWith("bestmove ")) {
              best = l.split(" ")[1] || null;
            }
            if (l.includes(" score ")) {
              // info ... score cp 23 ... OR score mate -2
              const m = l.match(/score\s+(cp|mate)\s+(-?\d+)/);
              if (m) {
                if (m[1] === "cp") cp = parseInt(m[2], 10);
                else mate = parseInt(m[2], 10);
              }
            }
          }
          off();
          resolve({ cp, mate, best });
        }
      }, 50);
    });

    return result;
  }
}
