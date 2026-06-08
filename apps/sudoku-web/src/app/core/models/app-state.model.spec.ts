import { isActivePhase } from './app-state.model';

describe('isActivePhase', () => {
  it('returns true for playing', () => {
    expect(isActivePhase('playing')).toBe(true);
  });

  it('returns true for paused', () => {
    expect(isActivePhase('paused')).toBe(true);
  });

  it('returns false for idle', () => {
    expect(isActivePhase('idle')).toBe(false);
  });

  it('returns false for loading', () => {
    expect(isActivePhase('loading')).toBe(false);
  });

  it('returns false for initializing', () => {
    expect(isActivePhase('initializing')).toBe(false);
  });
});
