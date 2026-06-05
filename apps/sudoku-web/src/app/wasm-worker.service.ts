import { resource, Service, signal } from '@angular/core';

export interface FactorialResult {
  value: string;
  durationMs: number;
}

@Service()
export class WasmWorkerService {
  private readonly worker = new Worker(new URL('./wasm.worker', import.meta.url), {
    type: 'module',
  });
  private nextId = 0;
  private readonly pending = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (error: Error) => void }
  >();

  readonly input = signal<number | null>(null);

  readonly factorial = resource<FactorialResult, number | undefined>({
    params: () => {
      const n = this.input();
      return n !== null && n > 0 ? n : undefined;
    },
    loader: ({ params, abortSignal }) =>
      this.callWorker<FactorialResult>('get_factorial', params, abortSignal),
  });

  constructor() {
    this.worker.postMessage({
      type: 'init',
      wasmUrl: new URL('index_bg.wasm', document.baseURI).href,
    });

    this.worker.addEventListener('message', (event: MessageEvent) => {
      const { id, result, durationMs, error } = event.data as {
        id: number;
        result?: unknown;
        durationMs?: number;
        error?: string;
      };
      const pending = this.pending.get(id);
      if (!pending) return;
      this.pending.delete(id);
      if (error !== undefined) {
        pending.reject(new Error(error));
      } else {
        pending.resolve({ value: String(result), durationMs: durationMs ?? 0 });
      }
    });
  }

  private callWorker<T>(fn: string, args: unknown, abortSignal: AbortSignal): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const id = ++this.nextId;
      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.worker.postMessage({ type: 'call', id, fn, args });
      abortSignal.addEventListener('abort', () => {
        if (this.pending.delete(id)) {
          reject(new DOMException('Aborted', 'AbortError'));
        }
      });
    });
  }
}
