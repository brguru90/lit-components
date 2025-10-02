import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@Component({
  selector: 'app-with-value',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <vg-dropdown
        label="Country"
        placeholder="Select your country"
        helper-text="This affects your shipping options"
        [options]="countryOptions"
        [value]="value"
        (vg-change)="onChange($event)"
        required
        data-testid="country-dropdown"
      ></vg-dropdown>
      <p style="margin-top: 12px;">
        Selected: <strong>{{ value }}</strong>
      </p>
    </div>
  `,
})
export class WithValueComponent {
  public value = 'us'
  public countryOptions = [
    { label: 'United States', value: 'us', description: 'North America' },
    { label: 'United Kingdom', value: 'uk', description: 'Europe' },
    { label: 'Canada', value: 'ca', description: 'North America' },
    { label: 'Australia', value: 'au', description: 'Oceania' },
    { label: 'Germany', value: 'de', description: 'Europe' },
  ]

  onChange(event: Event) {
    const customEvent = event as CustomEvent
    this.value = customEvent.detail.value
  }
}
