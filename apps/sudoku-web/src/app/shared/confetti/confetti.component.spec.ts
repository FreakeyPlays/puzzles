import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ConfettiComponent } from './confetti.component';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

describe('ConfettiComponent', () => {
  let component: ConfettiComponent;
  let fixture: ComponentFixture<ConfettiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfettiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfettiComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
