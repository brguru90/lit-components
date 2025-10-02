import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

@Component({
  selector: 'app-component-demo',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div>
      <h3>Angular Template Demo</h3>
      <vg-theme-provider [attr.mode]="theme">
        <vg-card heading="Settings" variant="subtle">
          <vg-dropdown
            label="Theme"
            [options]="themeOptions"
            [value]="theme"
            (vg-change)="onThemeChange($event)"
            data-testid="theme-dropdown"
          >
            <svg slot="prefix" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 2a7 7 0 1 0 10 10"/>
            </svg>
          </vg-dropdown>
          
          <vg-dropdown
            label="Country"
            helper-text="Select your country"
            [options]="countryOptions"
            [value]="country"
            (vg-change)="onCountryChange($event)"
            data-testid="country-dropdown"
          ></vg-dropdown>
        </vg-card>
        
        <vg-card heading="State" variant="outlined">
          <p>Theme: <strong>{{ theme }}</strong></p>
          <p>Country: <strong>{{ country }}</strong></p>
          <p>Total Changes: <strong data-testid="change-count">{{ changeCount }}</strong></p>
        </vg-card>
      </vg-theme-provider>
    </div>
  `,
})
export class ComponentDemoComponent {
  public theme = 'dark'
  public country = 'us'
  public changeCount = 0
  public themeOptions = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'Glass', value: 'glass' },
  ]
  public countryOptions = [
    { label: 'United States', value: 'us', description: 'North America' },
    { label: 'United Kingdom', value: 'uk', description: 'Europe' },
    { label: 'Canada', value: 'ca', description: 'North America' },
    { label: 'Australia', value: 'au', description: 'Oceania' },
    { label: 'Germany', value: 'de', description: 'Europe' },
  ]

  onThemeChange(event: Event) {
    const customEvent = event as CustomEvent
    this.theme = customEvent.detail.value
    this.changeCount++
  }

  onCountryChange(event: Event) {
    const customEvent = event as CustomEvent
    this.country = customEvent.detail.value
    this.changeCount++
  }
}
