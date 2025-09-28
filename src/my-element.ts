import { LitElement, html, unsafeCSS } from "lit"
import { customElement, state } from "lit/decorators.js"
import type { ButtonClickDetail, ButtonSize, ButtonVariant } from "./components/Button"
import type { DropdownChangeDetail, DropdownOption } from "./components/Dropdown"
import type { InputChangeDetail } from "./components/Input"
import type { ThemeMode } from "./components/ThemeProvider/theme-provider"

import styles from "@/my-element.scss?inline"

import "./index"

@customElement("my-element")
export class MyElement extends LitElement {
  static styles = unsafeCSS(styles)

  @state()
  private theme: ThemeMode = "dark"

  @state()
  private buttonVariant: ButtonVariant = "primary"

  @state()
  private buttonSize: ButtonSize = "md"

  @state()
  private buttonLabel = "Launch demo"

  @state()
  private buttonClicks = 0

  private readonly themeOptions: DropdownOption[] = [
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
    { label: "Glass", value: "glass" },
    { label: "Cartoon", value: "cartoon" },
  ]

  private readonly variantOptions: DropdownOption[] = [
    { label: "Primary", value: "primary", description: "Accent-filled button" },
    { label: "Secondary", value: "secondary", description: "Surface button with border" },
    { label: "Ghost", value: "ghost", description: "Minimal text-style button" },
  ]

  private readonly sizeOptions: DropdownOption[] = [
    { label: "Small", value: "sm" },
    { label: "Medium", value: "md" },
    { label: "Large", value: "lg" },
  ]

  render() {
    return html`
     <h1>Lit Demo</h1>
      <vg-theme-provider mode=${this.theme}>
        <section class="playground">
          <vg-card heading="Theme controls" variant="subtle">
            <vg-dropdown
              label="Theme"
              .value=${this.theme}
              .options=${this.themeOptions}
              @vg-change=${this.onThemeChange}
            ></vg-dropdown>
            <vg-dropdown
              label="Button variant"
              .value=${this.buttonVariant}
              .options=${this.variantOptions}
              helper-text="Preview updates immediately"
              @vg-change=${this.onVariantChange}
            ></vg-dropdown>
            <vg-dropdown
              label="Button size"
              .value=${this.buttonSize}
              .options=${this.sizeOptions}
              @vg-change=${this.onSizeChange}
            ></vg-dropdown>
            <vg-input
              label="Button label"
              placeholder="Type something friendly"
              .value=${this.buttonLabel}
              helper-text="Try updating the label to see how the button adapts."
              @vg-change=${this.onLabelChange}
            ></vg-input>
          </vg-card>

          <vg-card heading="Preview" variant="outlined">
            <div class="preview">
              <vg-button
                variant=${this.buttonVariant}
                size=${this.buttonSize}
                @click=${this.onButtonClick}
              >
                ${this.buttonLabel}
              </vg-button>
              <p class="clicks" role="status">
                Clicked <strong>${this.buttonClicks}</strong> times
              </p>
            </div>
          </vg-card>
        </section>
      </vg-theme-provider>
    `
  }

  private onThemeChange(event: CustomEvent<DropdownChangeDetail>) {
    const nextTheme = event.detail.value as ThemeMode
    if (nextTheme) {
      this.theme = nextTheme
    }
  }

  private onVariantChange(event: CustomEvent<DropdownChangeDetail>) {
    const nextVariant = event.detail.value as ButtonVariant
    if (nextVariant) {
      this.buttonVariant = nextVariant
    }
  }

  private onSizeChange(event: CustomEvent<DropdownChangeDetail>) {
    const nextSize = event.detail.value as ButtonSize
    if (nextSize) {
      this.buttonSize = nextSize
    }
  }

  private onLabelChange(event: CustomEvent<InputChangeDetail>) {
    this.buttonLabel = event.detail.value
  }

  private onButtonClick(event: CustomEvent<ButtonClickDetail>) {
    this.buttonClicks += 1
    console.info("Button press", event.detail.originalEvent)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
