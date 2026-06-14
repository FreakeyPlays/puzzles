import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.component.html',
})
export class SwitchComponent {
  readonly ariaLabel = input.required<string>();
  readonly checked = input<boolean>(false);

  readonly checkedChange = output<boolean>();

  toggle() {
    this.checkedChange.emit(!this.checked());
  }
}
