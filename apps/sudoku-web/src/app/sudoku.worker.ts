/// <reference lib="webworker" />
import init, { get_factorial } from '@repo/sudoku-wasm';
import type { SudokuFunctionName, SudokuFunctions, WorkerInboundMessage } from './sudoku-protocol';

type HandlerMap = {
  [K in SudokuFunctionName]: (args: SudokuFunctions[K]['args']) => SudokuFunctions[K]['result'];
};

const handlers: HandlerMap = {
  get_factorial: (args) => get_factorial(args),
};

// TypeScript can't correlate handlers[K] with args[K] through a dynamic key,
// so we use a single cast at this internal dispatch boundary.
function dispatch(fn: SudokuFunctionName, args: unknown): unknown {
  return (handlers[fn] as (args: unknown) => unknown)(args);
}

let readyResolve!: () => void;
const ready = new Promise<void>((resolve) => {
  readyResolve = resolve;
});

addEventListener('message', async (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data;

  if (msg.type === 'init') {
    await init({ module_or_path: msg.wasmUrl });
    readyResolve();
    return;
  }

  await ready;

  const start = performance.now();
  try {
    const result = dispatch(msg.fn, msg.args);
    postMessage({ id: msg.id, result, durationMs: performance.now() - start });
  } catch (err) {
    postMessage({ id: msg.id, error: String(err) });
  }
});
