import { resource, Service, signal } from '@angular/core';
import type {
  SudokuCallResult,
  SudokuFunctionName,
  SudokuFunctions,
  WasmResponseMessage,
} from './sudoku-protocol';

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

  readonly input = signal<number | null>(null);

  readonly factorial = resource<SudokuCallResult<'get_factorial'>, number | undefined>({
    params: () => {
      const n = this.input();
      return n !== null && n > 0 ? n : undefined;
    },
    loader: ({ params, abortSignal }) => this.call('get_factorial', params, abortSignal),
  });

  constructor() {
    this.worker.postMessage({
      type: 'init',
      wasmUrl: new URL('index_bg.wasm', document.baseURI).href,
    });

    this.worker.addEventListener('message', (event: MessageEvent<WasmResponseMessage>) => {
      const msg = event.data;
      const pending = this.pending.get(msg.id);
      if (!pending) return;
      this.pending.delete(msg.id);
      if ('error' in msg) {
        pending.reject(new Error(msg.error));
      } else {
        pending.resolve({ value: msg.result, durationMs: msg.durationMs });
      }
    });
  }

  private call<K extends SudokuFunctionName>(
    fn: K,
    args: SudokuFunctions[K]['args'],
    abortSignal: AbortSignal,
  ): Promise<SudokuCallResult<K>> {
    return new Promise<SudokuCallResult<K>>((resolve, reject) => {
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
