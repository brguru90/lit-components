import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-btn-wrapper',
  standalone: true,
  imports: [],
  templateUrl: './btn-wrapper.component.html',
  styleUrl: './btn-wrapper.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BtnWrapperComponent {
  public theme = 'dark';
  public variant = 'primary';
  public size = 'md';
  public label = 'Launch demo';
  public clicks = 0;

  public readonly themeOptions = [
    { label: 'Dark', value: 'dark' },
    { label: 'Light', value: 'light' },
    { label: 'Glass', value: 'glass' },
    { label: 'Cartoon', value: 'cartoon' },
  ];

  public readonly variantOptions = [
    { label: 'Primary', value: 'primary' },
    { label: 'Secondary', value: 'secondary' },
    { label: 'Ghost', value: 'ghost' },
  ];

  public readonly sizeOptions = [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ];

  onThemeChange(event: Event) {
    const detail = (event as CustomEvent<{ value?: string }>).detail;
    if (detail?.value) {
      this.theme = detail.value;
    }
  }

  onVariantChange(event: Event) {
    const detail = (event as CustomEvent<{ value?: string }>).detail;
    if (detail?.value) {
      this.variant = detail.value;
    }
  }

  onSizeChange(event: Event) {
    const detail = (event as CustomEvent<{ value?: string }>).detail;
    if (detail?.value) {
      this.size = detail.value;
    }
  }

  onLabelChange(event: Event) {
    console.log(event)
    const detail = (event as CustomEvent<{ value?: string }>).detail;
    if (detail?.value !== undefined) {
      this.label = detail.value;
    }
  }

  onButtonTick(event: Event) {
    this.clicks += 1;
    console.info('Button tick', (event as CustomEvent).detail);
  }
}
