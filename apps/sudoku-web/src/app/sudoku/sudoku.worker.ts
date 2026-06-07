/// <reference lib="webworker" />
import init, { get_factorial } from '@repo/sudoku-wasm';
import type { ArgsOf, ResultOf, WorkerFunctions, WorkerInboundMessage } from './worker-protocol';

type HandlerMap = {
  [K in keyof WorkerFunctions]: (args: ArgsOf<K>) => ResultOf<K> | Promise<ResultOf<K>>;
};

const handlers: HandlerMap = {
  get_factorial: (args) => get_factorial(args),
};

function dispatch<K extends keyof WorkerFunctions>(fn: K, args: ArgsOf<K>): ResultOf<K> {
  return (handlers[fn] as (a: ArgsOf<K>) => ResultOf<K>)(args);
}

const {
  promise: ready,
  resolve: readyResolve,
  reject: readyReject,
} = Promise.withResolvers<void>();

addEventListener('message', async (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data;

  if (msg.type === 'init') {
    try {
      await init({ module_or_path: msg.wasmUrl });
      readyResolve();
    } catch (err) {
      readyReject(err);
      postMessage({ type: 'error', error: 'Failed to initialize WASM' });
    }
    return;
  }

  const start = performance.now();
  try {
    await ready;
    const args = 'args' in msg ? msg.args : undefined;
    const result = dispatch(msg.fn, args as never);
    postMessage({
      type: 'ok',
      id: msg.id,
      fn: msg.fn,
      result,
      durationMs: performance.now() - start,
    });
  } catch (err) {
    postMessage({ type: 'error', id: msg.id, error: String(err) });
  }
});
