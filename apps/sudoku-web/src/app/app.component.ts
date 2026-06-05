import { Component, inject, signal } from '@angular/core';
import { WasmWorkerService } from './wasm-worker.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styles: ``,
})
export class AppComponent {
  protected readonly title = signal('sudoku-web');
  protected readonly wasm = inject(WasmWorkerService);

  jsResult = signal<string>('');
  jsTime = signal<string>('');
  jsCalculating = signal(false);

  calculate(inp: number | string) {
    const n = typeof inp === 'number' ? inp : parseInt(inp, 10);

    // Dispatch WASM call to the worker — non-blocking, result flows back via resource()
    this.wasm.input.set(n);

    // JS benchmark still runs on the main thread; defer to let the UI update first
    this.jsCalculating.set(true);
    setTimeout(() => {
      const start = performance.now();
      let f = 0;
      for (let i = 0; i < 10_000_000; i++) {
        f = factorial(n);
      }
      this.jsResult.set(f.toString());
      this.jsTime.set(((performance.now() - start) / 1000).toFixed(4) + 's');
      this.jsCalculating.set(false);
    }, 50);
  }
}

// recursive factorial for JS benchmark comparison
function factorial(x: number): number {
  return x === 0 ? 1 : x * factorial(x - 1);
}
