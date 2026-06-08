import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppService } from '../../core/services/app.service';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;
  let mockApp: {
    phase: ReturnType<typeof signal<'idle' | 'playing' | 'paused'>>;
    lastDifficulty: ReturnType<typeof signal<'medium'>>;
    isRestoring: ReturnType<typeof signal<boolean>>;
    startGame: ReturnType<typeof vi.fn>;
    continueGame: ReturnType<typeof vi.fn>;
    newGame: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    // jsdom does not implement showModal/close; define them so the directive works
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      value: vi.fn(),
      configurable: true,
      writable: true,
    });

    mockApp = {
      phase: signal('idle'),
      lastDifficulty: signal('medium'),
      isRestoring: signal(false),
      startGame: vi.fn().mockResolvedValue(undefined),
      continueGame: vi.fn(),
      newGame: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule],
      providers: [{ provide: AppService, useValue: mockApp }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  describe('when there is no active game', () => {
    it('renders a "Start Game" button', () => {
      const btn = fixture.debugElement.query(By.css('button'));
      expect(btn.nativeElement.textContent.trim()).toContain('Start Game');
    });

    it('does not render a "Continue Game" button', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const labels = buttons.map((b) => b.nativeElement.textContent.trim());
      expect(labels).not.toContain('Continue Game');
    });
  });

  describe('when there is an active game', () => {
    beforeEach(() => {
      mockApp.phase.set('playing');
      fixture.detectChanges();
    });

    it('renders a "Continue Game" button', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const labels = buttons.map((b) => b.nativeElement.textContent.trim());
      expect(labels.some((l) => l.includes('Continue Game'))).toBe(true);
    });

    it('renders a "New Game" button', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const labels = buttons.map((b) => b.nativeElement.textContent.trim());
      expect(labels.some((l) => l.includes('New Game'))).toBe(true);
    });
  });

  describe('modal', () => {
    it('shows the modal when openModal is called', () => {
      component.openModal();
      fixture.detectChanges();
      expect(component['showModal']()).toBe(true);
    });

    it('hides the modal when closeModal is called', () => {
      component.openModal();
      component.closeModal();
      expect(component['showModal']()).toBe(false);
    });
  });

  describe('continueGame', () => {
    it('calls app.continueGame and navigates to /game', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      component.continueGame();
      expect(mockApp.continueGame).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/game']);
    });
  });

  describe('onStartGame', () => {
    it('closes the modal, calls app.startGame, and navigates', async () => {
      component.openModal();
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      await component.onStartGame('hard');
      expect(component['showModal']()).toBe(false);
      expect(mockApp.startGame).toHaveBeenCalledWith('hard');
      expect(navigateSpy).toHaveBeenCalledWith(['/game']);
    });
  });

  describe('onNewGame', () => {
    it('closes the modal, calls app.newGame, and navigates', async () => {
      component.openModal();
      const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      await component.onNewGame('easy');
      expect(component['showModal']()).toBe(false);
      expect(mockApp.newGame).toHaveBeenCalledWith('easy');
      expect(navigateSpy).toHaveBeenCalledWith(['/game']);
    });
  });
});
