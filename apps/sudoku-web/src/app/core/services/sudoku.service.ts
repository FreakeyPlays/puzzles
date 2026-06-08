import { Service } from '@angular/core';
import type { ArgsOf, ResultOf, WorkerFunctions, WorkerResponse } from '../workers/worker-protocol';
import type { Difficulty } from '@repo/sudoku-wasm';

export type CallResult<K extends keyof WorkerFunctions> = {
  value: ResultOf<K>;
  durationMs: number;
};

@Service()
export class SudokuService {
  private readonly worker = new Worker(new URL('../workers/sudoku.worker', import.meta.url), {
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
      const entry = this.pending.get(msg.id);
      if (!entry) return;
      this.pending.delete(msg.id);
      if (msg.type === 'ok') {
        entry.resolve({ value: msg.result, durationMs: msg.durationMs });
      } else {
        entry.reject(new Error(msg.error));
      }
    });
  }

  generate(args: { difficulty?: Difficulty; seed?: number }): Promise<CallResult<'generate'>> {
    return this.call('generate', args);
  }

  solve(board: string): Promise<CallResult<'solve'>> {
    return this.call('solve', board);
  }

  validate(board: string): Promise<CallResult<'validate'>> {
    return this.call('validate', board);
  }

  hint(board: string): Promise<CallResult<'hint'>> {
    return this.call('hint', board);
  }

  private call<K extends keyof WorkerFunctions>(fn: K, args: ArgsOf<K>): Promise<CallResult<K>> {
    return new Promise<CallResult<K>>((resolve, reject) => {
      const id = ++this.nextId;
      this.pending.set(id, { resolve: resolve as (value: unknown) => void, reject });
      this.worker.postMessage({ type: 'call', id, functionName: fn, args });
    });
  }
}
