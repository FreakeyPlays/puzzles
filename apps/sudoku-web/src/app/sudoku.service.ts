import { resource, Service, signal } from '@angular/core';
import type { ArgsOf, ResultOf, WorkerFunctions, WorkerResponse } from './sudoku-protocol';

type CallResult<K extends keyof WorkerFunctions> = {
  value: ResultOf<K>;
  durationMs: number;
};

@Service()
export class SudokuService {
  private readonly worker = new Worker(new URL('./sudoku.worker', import.meta.url), {
    type: 'module',
  });
  private nextId = 0;
  private readonly pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();

  constructor() {
    this.worker.postMessage({
      type: 'init',
      wasmUrl: new URL('index_bg.wasm', document.baseURI).href,
    });

    this.worker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
      const msg = event.data;
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      switch (msg.type) {
        case 'ok':
          pending.resolve({ value: msg.result, durationMs: msg.durationMs });
          break;
        case 'error':
          pending.reject(new Error(msg.error));
          break;
      }
    });
  }

  factorial(args: ArgsOf<'get_factorial'>) {
    return resource<CallResult<'get_factorial'>, number | undefined>({
      params: () => {
        const n = args;
        return n !== null && n > 0 ? n : undefined;
      },
      loader: ({ params, abortSignal }) => this.call('get_factorial', params, abortSignal),
    });
  }

  private call<K extends keyof WorkerFunctions>(
    fn: K,
    args: ArgsOf<K>,
    abortSignal: AbortSignal,
  ): Promise<CallResult<K>> {
    return new Promise<CallResult<K>>((resolve, reject) => {
      const id = ++this.nextId;
      // The pending map can't encode per-entry generic types, so we cast at this boundary.
      // Type safety is enforced at the call site via K.
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.worker.postMessage({ type: 'call', id, fn, args });
      abortSignal.addEventListener('abort', () => {
        if (this.pending.delete(id)) {
          reject(new DOMException('Aborted', 'AbortError'));
        }
      });
    });
  }
}
