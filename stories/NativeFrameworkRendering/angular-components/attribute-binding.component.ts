import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@Component({
  selector: 'app-attribute-binding',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <h3>Angular Attribute Binding</h3>
      <vg-dropdown
        label="Dynamic Attributes"
        placeholder="Select an option"
        [options]="sampleOptions"
        [value]="value"
        (vg-change)="onChange($event)"
        [attr.required]="isRequired ? '' : null"
        [attr.error]="errorMessage || null"
        data-testid="attribute-dropdown"
      ></vg-dropdown>
      <p style="margin-top: 12px;">
        Value: <strong>{{ value || '(empty)' }}</strong>
      </p>
      <p *ngIf="errorMessage" style="color: red;">
        Error: <span>{{ errorMessage }}</span>
      </p>
    </div>
  `,
})
export class AttributeBindingComponent {
  public value = ''
  public isRequired = true
  public isDisabled = false
  public errorMessage = 'This field is required'
  public sampleOptions = [
    { label: 'Option 1', value: 'option1', description: 'First option' },
    { label: 'Option 2', value: 'option2', description: 'Second option' },
    { label: 'Option 3', value: 'option3', description: 'Third option' },
    { label: 'Disabled Option', value: 'disabled', description: 'This option is disabled', disabled: true },
  ]

  onChange(event: Event) {
    const customEvent = event as CustomEvent
    this.value = customEvent.detail.value
    this.errorMessage = this.value ? '' : 'This field is required'
  }
}
