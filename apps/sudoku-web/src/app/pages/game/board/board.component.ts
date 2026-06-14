import { Component, ElementRef, computed, input, output, viewChild } from '@angular/core';

type Cell = {
  i: number;
  row: number;
  col: number;
  box: number;
  isGiven: boolean;
  value: string;
  isSelected: boolean;
  isPeer: boolean;
  isWrong: boolean;
};

@Component({
  selector: 'app-board',
  imports: [],
  templateUrl: './board.component.html',
})
export class BoardComponent {
  readonly puzzle = input.required<string>();
  readonly edits = input.required<string>();
  readonly solution = input<string>('');
  readonly selectedIndex = input<number | null>(null);

  readonly cellSelect = output<number>();
  readonly deselect = output<void>();
  readonly digitInput = output<number>();

  private readonly gridRef = viewChild.required<ElementRef<HTMLElement>>('gridRef');

  protected readonly rows = computed<Cell[][]>(() => {
    const puzzle = this.puzzle();
    const edits = this.edits();
    const solution = this.solution();
    const selected = this.selectedIndex();

    const selRow = selected !== null ? Math.floor(selected / 9) : -1;
    const selCol = selected !== null ? selected % 9 : -1;
    const selBox = selected !== null ? Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3) : -1;

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
        !isSelected && selected !== null && (row === selRow || col === selCol || box === selBox);
      const isWrong =
        !isGiven && editChar !== '0' && solution.length === 81 && editChar !== solution.charAt(i);

      return { i, row, col, box, isGiven, value, isSelected, isPeer, isWrong };
    });

    return Array.from({ length: 9 }, (_, rowIndex) => cells.filter((c) => c.row === rowIndex));
  });

  protected getCellTabindex(index: number): number {
    const selected = this.selectedIndex();
    return (selected === null ? 0 : selected) === index ? 0 : -1;
  }

  protected cellLabel(cell: Cell): string {
    const pos = `Row ${cell.row + 1}, Column ${cell.col + 1}`;
    if (!cell.value) return `${pos}, empty`;
    if (cell.isGiven) return `${pos}, ${cell.value}, given`;
    return `${pos}, ${cell.value}, your entry`;
  }

  onCellClick(index: number): void {
    this.cellSelect.emit(index);
  }

  onCellFocus(index: number): void {
    if (this.selectedIndex() !== index) {
      this.cellSelect.emit(index);
    }
  }

  onCellKeydown(event: KeyboardEvent, index: number): void {
    const row = Math.floor(index / 9);
    const col = index % 9;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        if (row > 0) this.moveFocusTo(index - 9);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (row < 8) this.moveFocusTo(index + 9);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (col > 0) this.moveFocusTo(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (col < 8) this.moveFocusTo(index + 1);
        break;
      case 'Home':
        event.preventDefault();
        this.moveFocusTo(event.ctrlKey ? 0 : row * 9);
        break;
      case 'End':
        event.preventDefault();
        this.moveFocusTo(event.ctrlKey ? 80 : row * 9 + 8);
        break;
      case 'Escape':
        event.preventDefault();
        this.deselect.emit();
        break;
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9': {
        if (this.selectedIndex() !== index) this.cellSelect.emit(index);
        this.digitInput.emit(parseInt(event.key, 10));
        break;
      }
      case 'Backspace':
      case 'Delete':
        if (this.selectedIndex() !== index) this.cellSelect.emit(index);
        this.digitInput.emit(0);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.cellSelect.emit(index);
        break;
    }
  }

  private moveFocusTo(index: number): void {
    this.cellSelect.emit(index);
    this.gridRef().nativeElement.querySelector<HTMLElement>(`[data-cell="${index}"]`)?.focus();
  }
}
