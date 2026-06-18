import { Component, input, output } from '@angular/core';
import { SuppressInitialAnimationDirective } from '../../../../../shared/directives/suppress-initial-animation.directive';

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.component.html',
  hostDirectives: [SuppressInitialAnimationDirective],
})
export class SwitchComponent {
  readonly ariaLabel = input.required<string>();
  readonly checked = input<boolean>(false);

  readonly checkedChange = output<boolean>();

  toggle() {
    this.checkedChange.emit(!this.checked());
  }
}
