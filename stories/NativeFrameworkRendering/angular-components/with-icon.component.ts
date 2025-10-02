import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@Component({
  selector: 'app-with-icon',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <vg-dropdown
        label="Location"
        placeholder="Select location"
        [options]="locationOptions"
        [value]="value"
        (vg-change)="onChange($event)"
        data-testid="location-dropdown"
      >
        <svg 
          slot="prefix" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          style="margin-left: 12px;"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </vg-dropdown>
      <p style="margin-top: 12px;">
        Selected: <strong>{{ value || '(none)' }}</strong>
      </p>
    </div>
  `,
})
export class WithIconComponent {
  public value = ''
  public locationOptions = [
    { label: 'New York', value: 'ny', description: 'Eastern Time Zone' },
    { label: 'Los Angeles', value: 'la', description: 'Pacific Time Zone' },
    { label: 'Chicago', value: 'chi', description: 'Central Time Zone' },
  ]

  onChange(event: Event) {
    const customEvent = event as CustomEvent
    this.value = customEvent.detail.value
  }
}
