import { Component, input, output } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-switch',
  imports: [],
  templateUrl: './switch.component.html',
})
export class SwitchComponent {
  readonly label = input.required<string>();
  readonly description = input<string>();
  readonly checked = input<boolean>(false);

  readonly checkedChange = output<boolean>();

  readonly labelId = `app-switch-label-${nextId++}`;

  toggle() {
    this.checkedChange.emit(!this.checked());
  }
}
