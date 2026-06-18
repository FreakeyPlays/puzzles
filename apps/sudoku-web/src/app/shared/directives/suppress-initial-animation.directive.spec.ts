import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SuppressInitialAnimationDirective } from './suppress-initial-animation.directive';

@Component({
  template: '<div appSuppressInitialAnimation></div>',
  imports: [SuppressInitialAnimationDirective],
})
class TestHostComponent {}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

describe('SuppressInitialAnimationDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: HTMLElement;
  let directive: SuppressInitialAnimationDirective;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    const debugEl: DebugElement = fixture.debugElement.query(
      By.directive(SuppressInitialAnimationDirective),
    );
    host = debugEl.nativeElement;
    directive = debugEl.injector.get(SuppressInitialAnimationDirective);
  });

  it('should create', () => {
    expect(directive).toBeTruthy();
  });

  it('starts in the preloading state and reflects it as a host class', async () => {
    await fixture.whenStable();

    expect(directive.preloading()).toBe(true);
    expect(host.classList.contains('preloading')).toBe(true);
  });

  it('keeps the preloading class until the frame after the first render', async () => {
    await fixture.whenStable();

    // afterNextRender has run and scheduled the flip on the next animation
    // frame, but that frame has not happened yet.
    expect(host.classList.contains('preloading')).toBe(true);
  });

  it('removes the preloading class on the frame after the first render', async () => {
    await fixture.whenStable();

    await nextFrame();
    await fixture.whenStable();

    expect(directive.preloading()).toBe(false);
    expect(host.classList.contains('preloading')).toBe(false);
  });
});
