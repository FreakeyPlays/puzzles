import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { AppService } from '../../core/services/app.service';
import { GameService } from '../../core/services/game.service';
import { SettingsService } from '../../core/services/settings.service';
import { GameComponent } from './game.component';

describe('GameComponent', () => {
  let fixture: ComponentFixture<GameComponent>;
  let component: GameComponent;
  let mockGame: {
    puzzle: ReturnType<typeof signal<string>>;
    edits: ReturnType<typeof signal<string>>;
    solution: ReturnType<typeof signal<string>>;
    difficulty: ReturnType<typeof signal<'medium'>>;
    status: ReturnType<typeof signal<'active' | 'solved'>>;
    elapsedSeconds: ReturnType<typeof signal<number>>;
    placeDigit: ReturnType<typeof vi.fn>;
    eraseDigit: ReturnType<typeof vi.fn>;
    requestHint: ReturnType<typeof vi.fn>;
  };
  let mockApp: {
    phase: ReturnType<typeof signal<'playing'>>;
    newGame: ReturnType<typeof vi.fn>;
    endGame: ReturnType<typeof vi.fn>;
  };
  const mockSettings = {
    game: signal({ highlightErrors: true }),
  };

  const EMPTY = '0'.repeat(81);
  const PUZZLE = '1' + '0'.repeat(80); // cell 0 is a given (value '1')

  beforeEach(async () => {
    mockGame = {
      puzzle: signal(EMPTY),
      edits: signal(EMPTY),
      solution: signal(''),
      difficulty: signal('medium'),
      status: signal('active'),
      elapsedSeconds: signal(0),
      placeDigit: vi.fn(),
      eraseDigit: vi.fn(),
      requestHint: vi.fn().mockResolvedValue(undefined),
    };
    mockApp = {
      phase: signal('playing'),
      newGame: vi.fn().mockResolvedValue(undefined),
      endGame: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GameComponent, RouterTestingModule],
      providers: [
        { provide: GameService, useValue: mockGame },
        { provide: AppService, useValue: mockApp },
        { provide: SettingsService, useValue: mockSettings },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('cell selection', () => {
    it('onCellSelect sets the selectedIndex', () => {
      component.onCellSelect(15);
      expect(component['selectedIndex']()).toBe(15);
    });

    it('onDeselect clears the selectedIndex', () => {
      component.onCellSelect(15);
      component.onDeselect();
      expect(component['selectedIndex']()).toBeNull();
    });
  });

  describe('onDigitInput', () => {
    it('does nothing when no cell is selected', () => {
      component.onDeselect();
      component.onDigitInput(5);
      expect(mockGame.placeDigit).not.toHaveBeenCalled();
      expect(mockGame.eraseDigit).not.toHaveBeenCalled();
    });

    it('calls eraseDigit when digit is 0', () => {
      mockGame.puzzle.set(EMPTY);
      component.onCellSelect(5);
      component.onDigitInput(0);
      expect(mockGame.eraseDigit).toHaveBeenCalledWith(5);
    });

    it('calls placeDigit with index and value', () => {
      mockGame.puzzle.set(EMPTY);
      component.onCellSelect(5);
      component.onDigitInput(7);
      expect(mockGame.placeDigit).toHaveBeenCalledWith(5, 7);
    });

    it('ignores input on a given cell (puzzle[index] !== "0")', () => {
      mockGame.puzzle.set(PUZZLE); // cell 0 is given
      component.onCellSelect(0);
      component.onDigitInput(9);
      expect(mockGame.placeDigit).not.toHaveBeenCalled();
    });
  });

  describe('formattedTime', () => {
    it('formats elapsed seconds as MM:SS', () => {
      mockGame.elapsedSeconds.set(125);
      fixture.detectChanges();
      expect(component['formattedTime']()).toBe('02:05');
    });

    it('formats zero seconds as 00:00', () => {
      mockGame.elapsedSeconds.set(0);
      fixture.detectChanges();
      expect(component['formattedTime']()).toBe('00:00');
    });
  });

  describe('difficultyLabel', () => {
    it('capitalizes the first letter of the difficulty', () => {
      mockGame.difficulty.set('medium');
      fixture.detectChanges();
      expect(component['difficultyLabel']()).toBe('Medium');
    });
  });
});
