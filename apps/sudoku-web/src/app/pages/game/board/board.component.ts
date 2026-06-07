import { Component, computed, input, output } from '@angular/core';

type Cell = {
  i: number;
  row: number;
  col: number;
  box: number;
  isGiven: boolean;
  value: string;
  isSelected: boolean;
  isPeer: boolean;
};

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.component.html',
})
export class BoardComponent {
  readonly puzzle = input.required<string>();
  readonly edits = input.required<string>();
  readonly selectedIndex = input<number | null>(null);

  readonly cellSelect = output<number>();

  protected readonly boxes = computed<Cell[][]>(() => {
    const puzzle = this.puzzle();
    const edits = this.edits();
    const selected = this.selectedIndex();

    const selRow = selected !== null ? Math.floor(selected / 9) : -1;
    const selCol = selected !== null ? selected % 9 : -1;
    const selBox =
      selected !== null ? Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3) : -1;

    const cells: Cell[] = Array.from({ length: 81 }, (_, i) => {
      const row = Math.floor(i / 9);
      const col = i % 9;
      const box = Math.floor(row / 3) * 3 + Math.floor(col / 3);
      const puzzleChar = puzzle.charAt(i);
      const editChar = edits.charAt(i);
      const isGiven = puzzleChar !== '0';
      const value = editChar !== '0' ? editChar : isGiven ? puzzleChar : '';
      const isSelected = i === selected;
      const isPeer =
        !isSelected &&
        selected !== null &&
        (row === selRow || col === selCol || box === selBox);

      return { i, row, col, box, isGiven, value, isSelected, isPeer };
    });

    return Array.from({ length: 9 }, (_, boxIndex) =>
      cells.filter((c) => c.box === boxIndex),
    );
  });

  onCellClick(index: number): void {
    this.cellSelect.emit(index);
  }
}
