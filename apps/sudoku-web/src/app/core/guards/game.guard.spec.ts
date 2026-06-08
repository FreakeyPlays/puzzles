import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import type { AppStatus } from '../models/app-state.model';
import { AppService } from '../services/app.service';
import { gameGuard } from './game.guard';

function runGuard(phase: AppStatus) {
  const mockApp = { phase: signal(phase) };
  TestBed.configureTestingModule({
    imports: [RouterTestingModule],
    providers: [{ provide: AppService, useValue: mockApp }],
  });
  return TestBed.runInInjectionContext(() =>
    gameGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
  );
}

describe('gameGuard', () => {
  it('allows activation when phase is playing', () => {
    expect(runGuard('playing')).toBe(true);
  });

  it('allows activation when phase is paused', () => {
    expect(runGuard('paused')).toBe(true);
  });

  it('redirects to "/" when phase is idle', () => {
    const result = runGuard('idle');
    expect(result).not.toBe(true);
  });

  it('redirects to "/" when phase is loading', () => {
    const result = runGuard('loading');
    expect(result).not.toBe(true);
  });

  it('redirects to "/" when phase is initializing', () => {
    const result = runGuard('initializing');
    expect(result).not.toBe(true);
  });
});
