import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { SudokuService } from './sudoku.service';

type FactorialState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; value: string; durationMs: number }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styles: ``,
})
export class AppComponent {
  private readonly sudoku = inject(SudokuService);

  private readonly factorialInput$ = new Subject<number>();

  protected readonly title = signal('sudoku-web');
  protected readonly factorialState = toSignal(
    this.factorialInput$.pipe(
      switchMap(n =>
        from(this.sudoku.factorial(n)).pipe(
          map(r => ({ status: 'success' as const, value: r.value, durationMs: r.durationMs })),
          catchError(e => of<FactorialState>({ status: 'error', message: String(e) })),
          startWith<FactorialState>({ status: 'loading' }),
        ),
      ),
    ),
    { initialValue: { status: 'idle' } as FactorialState },
  );

  jsResult = signal<string>('');
  jsTime = signal<string>('');
  jsCalculating = signal(false);

  calculate(inp: number | string) {
    const n = typeof inp === 'number' ? inp : parseInt(inp, 10);
    this.factorialInput$.next(n);

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

function factorial(x: number): number {
  return x === 0 ? 1 : x * factorial(x - 1);
}
