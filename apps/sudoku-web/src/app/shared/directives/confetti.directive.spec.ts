import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ConfettiDirective } from './confetti.directive';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

@Component({ template: '<dialog appConfetti></dialog>', imports: [ConfettiDirective] })
class TestHostComponent {}

describe('ConfettiDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
