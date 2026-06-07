import { resource, Service, signal } from '@angular/core';
import type { ArgsOf, ResultOf, WorkerFunctions, WorkerResponse } from './worker-protocol';

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

  private factorialArgs = signal(0);
  private $factorial = resource<CallResult<'get_factorial'>, number | undefined>({
    params: () => {
      const n = this.factorialArgs();
      return n !== null && n > 0 ? n : undefined;
    },
    loader: ({ params, abortSignal }) => this.call('get_factorial', params, abortSignal),
  });

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
    this.factorialArgs.set(args);
    return this.$factorial;
  }

  private call<K extends keyof WorkerFunctions>(
    fn: K,
    args: ArgsOf<K>,
    abortSignal: AbortSignal,
  ): Promise<CallResult<K>> {
    return new Promise<CallResult<K>>((resolve, reject) => {
      const id = ++this.nextId;
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
