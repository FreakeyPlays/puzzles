import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AppComponent } from './app.component';
import { AppService } from './core/services/app.service';
import { routes } from './app.routes';

const mockAppService = {
  phase: signal('idle' as const),
  lastDifficulty: signal('medium' as const),
  isRestoring: signal(false),
  pauseGame: () => {},
  continueGame: () => {},
  startGame: () => Promise.resolve(),
  newGame: () => Promise.resolve(),
  endGame: () => {},
};

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        { provide: AppService, useValue: mockAppService },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
