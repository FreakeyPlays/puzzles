import { afterNextRender, Directive, signal } from '@angular/core';

@Directive({
  selector: '[appSuppressInitialAnimation]',
  host: { '[class.preloading]': 'preloading()' },
})
export class SuppressInitialAnimationDirective {
  readonly preloading = signal(true);
  constructor() {
    afterNextRender(() => requestAnimationFrame(() => this.preloading.set(false)));
  }
}
