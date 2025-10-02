import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@Component({
  selector: 'app-default-dropdown',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <vg-dropdown
        label="Select an Option"
        placeholder="Choose one..."
        [options]="sampleOptions"
        [value]="value"
        (vg-change)="onChange($event)"
        data-testid="default-dropdown"
      ></vg-dropdown>
      <p style="margin-top: 12px;">
        Selected: <strong>{{ value || '(none)' }}</strong>
      </p>
    </div>
  `,
})
export class DefaultDropdownComponent {
  public value = ''
  public sampleOptions = [
    { label: 'Option 1', value: 'option1', description: 'First option' },
    { label: 'Option 2', value: 'option2', description: 'Second option' },
    { label: 'Option 3', value: 'option3', description: 'Third option' },
    { label: 'Disabled Option', value: 'disabled', description: 'This option is disabled', disabled: true },
  ]

  onChange(event: Event) {
    const customEvent = event as CustomEvent
    this.value = customEvent.detail.value
  }
}
