import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

@Directive({
  selector: 'dialog[appAutoShow]',
})
export class AutoShowDialogDirective {
  constructor() {
    const el = inject<ElementRef<HTMLDialogElement>>(ElementRef);
    afterNextRender(() => el.nativeElement.showModal());
  }
}
