import { Component, input, output } from '@angular/core';

export interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select',
  imports: [],
  templateUrl: './select.component.html',
})
export class SelectComponent {
  readonly ariaLabel = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly value = input.required<string>();

  readonly valueChange = output<string>();

  onChange(event: Event) {
    this.valueChange.emit((event.target as HTMLSelectElement).value);
  }
}
