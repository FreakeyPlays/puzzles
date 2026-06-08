import { DOCUMENT } from '@angular/common';
import { Service, computed, inject, signal } from '@angular/core';

@Service()
export class VisibilityService {
  private readonly document = inject(DOCUMENT);

  readonly isVisible = signal(!this.document.hidden);
  readonly isHidden = computed(() => !this.isVisible());

  constructor() {
    this.document.addEventListener('visibilitychange', () => {
      this.isVisible.set(!this.document.hidden);
    });
  }
}
