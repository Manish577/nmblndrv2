/* global self */
// This worker expects /public/stockfish/stockfish.js to exist (WASM build).
// It proxies messages to and from Stockfish.

self.importScripts('/stockfish/stockfish.js');

const engine = self.STOCKFISH ? self.STOCKFISH() : undefined;

if (!engine) {
  self.postMessage({ type: 'error', message: 'Stockfish not available. Place stockfish.js in /public/stockfish.' });
}

// Relay stdout from engine to main thread
engine?.addMessageListener?.((line) => {
  self.postMessage({ type: 'stdout', line });
});

self.onmessage = function (e) {
  const { cmd } = e.data || {};
  if (!engine) {
    self.postMessage({ type: 'error', message: 'Engine not initialized' });
    return;
  }
  if (typeof cmd === 'string') {
    engine.postMessage(cmd);
  } else if (Array.isArray(cmd)) {
    for (const c of cmd) engine.postMessage(c);
  }
};
