import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BoardComponent } from './board.component';

const EMPTY = '0'.repeat(81);

describe('BoardComponent', () => {
  let fixture: ComponentFixture<BoardComponent>;

  function setup(puzzle = EMPTY, edits = EMPTY, selectedIndex: number | null = null) {
    fixture = TestBed.createComponent(BoardComponent);
    fixture.componentRef.setInput('puzzle', puzzle);
    fixture.componentRef.setInput('edits', edits);
    fixture.componentRef.setInput('selectedIndex', selectedIndex);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardComponent],
    }).compileComponents();
  });

  describe('cell rendering', () => {
    it('renders 81 cells', () => {
      setup();
      const cells = fixture.debugElement.queryAll(By.css('button[role="gridcell"]'));
      expect(cells.length).toBe(81);
    });

    it('renders 9 rows', () => {
      setup();
      const rows = fixture.debugElement.queryAll(By.css('[role="row"]'));
      expect(rows.length).toBe(9);
    });

    it('shows the given digit for a non-zero puzzle cell', () => {
      const puzzle = '5' + '0'.repeat(80);
      setup(puzzle);
      const firstCell = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(firstCell.nativeElement.textContent.trim()).toBe('5');
    });

    it('shows the edit digit when an edit is present', () => {
      const edits = '0'.repeat(10) + '7' + '0'.repeat(70);
      setup(EMPTY, edits);
      const cell = fixture.debugElement.query(By.css('[data-cell="10"]'));
      expect(cell.nativeElement.textContent.trim()).toBe('7');
    });

    it('shows nothing for an empty cell', () => {
      setup();
      const firstCell = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(firstCell.nativeElement.textContent.trim()).toBe('');
    });

    it('marks the selected cell with aria-selected', () => {
      setup(EMPTY, EMPTY, 5);
      const selected = fixture.debugElement.query(By.css('[data-cell="5"]'));
      expect(selected.nativeElement.getAttribute('aria-selected')).toBe('true');
    });

    it('does not set aria-selected on non-selected cells', () => {
      setup(EMPTY, EMPTY, 5);
      const other = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(other.nativeElement.getAttribute('aria-selected')).toBeNull();
    });
  });

  describe('tabindex (roving tabindex pattern)', () => {
    it('cell 0 has tabindex 0 when nothing is selected', () => {
      setup(EMPTY, EMPTY, null);
      const cell0 = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(cell0.nativeElement.tabIndex).toBe(0);
    });

    it('other cells have tabindex -1 when nothing is selected', () => {
      setup(EMPTY, EMPTY, null);
      const cell1 = fixture.debugElement.query(By.css('[data-cell="1"]'));
      expect(cell1.nativeElement.tabIndex).toBe(-1);
    });

    it('selected cell has tabindex 0', () => {
      setup(EMPTY, EMPTY, 40);
      const selectedCell = fixture.debugElement.query(By.css('[data-cell="40"]'));
      expect(selectedCell.nativeElement.tabIndex).toBe(0);
    });

    it('non-selected cells have tabindex -1 when a selection exists', () => {
      setup(EMPTY, EMPTY, 40);
      const otherCell = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(otherCell.nativeElement.tabIndex).toBe(-1);
    });
  });

  describe('aria labels', () => {
    it('labels an empty cell correctly', () => {
      setup();
      const cell = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(cell.nativeElement.getAttribute('aria-label')).toBe('Row 1, Column 1, empty');
    });

    it('labels a given cell correctly', () => {
      const puzzle = '5' + '0'.repeat(80);
      setup(puzzle);
      const cell = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(cell.nativeElement.getAttribute('aria-label')).toBe('Row 1, Column 1, 5, given');
    });

    it('labels an edit cell correctly', () => {
      const edits = '3' + '0'.repeat(80);
      setup(EMPTY, edits);
      const cell = fixture.debugElement.query(By.css('[data-cell="0"]'));
      expect(cell.nativeElement.getAttribute('aria-label')).toBe('Row 1, Column 1, 3, your entry');
    });

    it('includes the correct row and column in the label', () => {
      setup();
      // Cell 20 = row 3, col 3 (0-indexed → Row 3, Column 3)
      const cell = fixture.debugElement.query(By.css('[data-cell="20"]'));
      expect(cell.nativeElement.getAttribute('aria-label')).toBe('Row 3, Column 3, empty');
    });
  });

  describe('events — click and focus', () => {
    it('emits cellSelect with the cell index on click', () => {
      setup();
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      fixture.debugElement.query(By.css('[data-cell="5"]')).nativeElement.click();
      expect(selectSpy).toHaveBeenCalledWith(5);
    });

    it('emits cellSelect on focus when cell is not already selected', () => {
      setup(EMPTY, EMPTY, 5);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      // focus cell 10 (not currently selected)
      fixture.debugElement
        .query(By.css('[data-cell="10"]'))
        .nativeElement.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(selectSpy).toHaveBeenCalledWith(10);
    });

    it('does not re-emit cellSelect when focusing the already-selected cell', () => {
      setup(EMPTY, EMPTY, 5);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      fixture.debugElement
        .query(By.css('[data-cell="5"]'))
        .nativeElement.dispatchEvent(new FocusEvent('focus', { bubbles: true }));
      expect(selectSpy).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    function press(cellIndex: number, key: string, ctrlKey = false) {
      const el = fixture.debugElement.query(By.css(`[data-cell="${cellIndex}"]`)).nativeElement;
      el.dispatchEvent(
        new KeyboardEvent('keydown', { key, ctrlKey, bubbles: true, cancelable: true }),
      );
    }

    it('ArrowDown moves focus one row down', () => {
      setup(EMPTY, EMPTY, 0);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(0, 'ArrowDown');
      expect(selectSpy).toHaveBeenCalledWith(9);
    });

    it('ArrowUp moves focus one row up', () => {
      setup(EMPTY, EMPTY, 9);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(9, 'ArrowUp');
      expect(selectSpy).toHaveBeenCalledWith(0);
    });

    it('ArrowRight moves focus one column right', () => {
      setup(EMPTY, EMPTY, 0);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(0, 'ArrowRight');
      expect(selectSpy).toHaveBeenCalledWith(1);
    });

    it('ArrowLeft moves focus one column left', () => {
      setup(EMPTY, EMPTY, 1);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(1, 'ArrowLeft');
      expect(selectSpy).toHaveBeenCalledWith(0);
    });

    it('ArrowUp does not move beyond the first row', () => {
      setup(EMPTY, EMPTY, 0);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(0, 'ArrowUp');
      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('ArrowDown does not move beyond the last row', () => {
      setup(EMPTY, EMPTY, 72);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(72, 'ArrowDown');
      expect(selectSpy).not.toHaveBeenCalled();
    });

    it('Home moves to the beginning of the row', () => {
      setup(EMPTY, EMPTY, 5);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(5, 'Home');
      expect(selectSpy).toHaveBeenCalledWith(0);
    });

    it('Ctrl+Home moves to cell 0', () => {
      setup(EMPTY, EMPTY, 40);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(40, 'Home', true);
      expect(selectSpy).toHaveBeenCalledWith(0);
    });

    it('End moves to the end of the row', () => {
      setup(EMPTY, EMPTY, 2);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(2, 'End');
      expect(selectSpy).toHaveBeenCalledWith(8);
    });

    it('Ctrl+End moves to cell 80', () => {
      setup(EMPTY, EMPTY, 40);
      const selectSpy = vi.fn();
      fixture.componentInstance.cellSelect.subscribe(selectSpy);
      press(40, 'End', true);
      expect(selectSpy).toHaveBeenCalledWith(80);
    });

    it('Escape emits deselect', () => {
      setup(EMPTY, EMPTY, 5);
      const deselectSpy = vi.fn();
      fixture.componentInstance.deselect.subscribe(deselectSpy);
      press(5, 'Escape');
      expect(deselectSpy).toHaveBeenCalled();
    });

    it('digit key emits digitInput with the digit value', () => {
      setup(EMPTY, EMPTY, 5);
      const digitSpy = vi.fn();
      fixture.componentInstance.digitInput.subscribe(digitSpy);
      press(5, '7');
      expect(digitSpy).toHaveBeenCalledWith(7);
    });

    it('Backspace emits digitInput with 0', () => {
      setup(EMPTY, EMPTY, 5);
      const digitSpy = vi.fn();
      fixture.componentInstance.digitInput.subscribe(digitSpy);
      press(5, 'Backspace');
      expect(digitSpy).toHaveBeenCalledWith(0);
    });

    it('Delete emits digitInput with 0', () => {
      setup(EMPTY, EMPTY, 5);
      const digitSpy = vi.fn();
      fixture.componentInstance.digitInput.subscribe(digitSpy);
      press(5, 'Delete');
      expect(digitSpy).toHaveBeenCalledWith(0);
    });
  });
});
