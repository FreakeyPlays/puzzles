import { DOCUMENT } from '@angular/common';
import { Service, inject, signal } from '@angular/core';

@Service()
export class VisibilityService {
  private readonly document = inject(DOCUMENT);

  readonly isVisible = signal(!this.document.hidden);

  constructor() {
    this.document.addEventListener('visibilitychange', () => {
      this.isVisible.set(!this.document.hidden);
    });
  }
}
