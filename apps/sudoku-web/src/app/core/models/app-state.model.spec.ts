import { isActiveAppStatus } from './app-state.model';

describe('isActivePhase', () => {
  it('returns true for playing', () => {
    expect(isActiveAppStatus('playing')).toBe(true);
  });

  it('returns true for paused', () => {
    expect(isActiveAppStatus('paused')).toBe(true);
  });

  it('returns false for idle', () => {
    expect(isActiveAppStatus('idle')).toBe(false);
  });

  it('returns false for loading', () => {
    expect(isActiveAppStatus('loading')).toBe(false);
  });

  it('returns false for initializing', () => {
    expect(isActiveAppStatus('initializing')).toBe(false);
  });
});
