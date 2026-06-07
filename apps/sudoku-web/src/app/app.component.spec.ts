import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { SudokuService } from './sudoku/sudoku.service';

const mockSudokuService = {
  factorial: () => Promise.resolve({ value: '1', durationMs: 0 }),
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: SudokuService, useValue: mockSudokuService }],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('sudoku-web');
  });
});
