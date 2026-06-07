import { Component, inject, resource, signal } from '@angular/core';
import { SudokuService } from './sudoku.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styles: ``,
})
export class AppComponent {
  private readonly sudoku = inject(SudokuService);

  protected readonly title = signal('sudoku-web');

  private readonly factorialInput = signal<number | undefined>(undefined);
  protected readonly factorialResult = resource({
    params: () => this.factorialInput(),
    loader: ({ params }) => this.sudoku.factorial(params),
  });

  jsResult = signal<string>('');
  jsTime = signal<string>('');
  jsCalculating = signal(false);

  calculate(inp: number | string) {
    const n = typeof inp === 'number' ? inp : parseInt(inp, 10);
    this.factorialInput.set(n);

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
