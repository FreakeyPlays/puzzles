/// <reference lib="webworker" />
import init, { get_factorial } from '@repo/sudoku-wasm';

interface InitMessage {
  type: 'init';
  wasmUrl: string;
}

interface CallMessage {
  type: 'call';
  id: number;
  fn: string;
  args: unknown;
}

type WorkerMessage = InitMessage | CallMessage;

let readyResolve!: () => void;
const ready = new Promise<void>((resolve) => {
  readyResolve = resolve;
});

addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  if (msg.type === 'init') {
    await init({ module_or_path: msg.wasmUrl });
    readyResolve();
    return;
  }

  await ready;

  const start = performance.now();
  try {
    let result: unknown;
    if (msg.fn === 'get_factorial') {
      result = get_factorial(msg.args as number);
    }
    postMessage({ id: msg.id, result, durationMs: performance.now() - start });
  } catch (err) {
    postMessage({ id: msg.id, error: String(err) });
  }
});
