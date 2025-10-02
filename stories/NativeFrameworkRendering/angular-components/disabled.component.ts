import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@Component({
  selector: 'app-disabled',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <vg-dropdown
        label="Disabled Dropdown"
        placeholder="Cannot select"
        value="option2"
        helper-text="This field is currently disabled"
        [options]="sampleOptions"
        disabled
        data-testid="disabled-dropdown"
      ></vg-dropdown>
    </div>
  `,
})
export class DisabledComponent {
  public sampleOptions = [
    { label: 'Option 1', value: 'option1', description: 'First option' },
    { label: 'Option 2', value: 'option2', description: 'Second option' },
    { label: 'Option 3', value: 'option3', description: 'Third option' },
    { label: 'Disabled Option', value: 'disabled', description: 'This option is disabled', disabled: true },
  ]
}
