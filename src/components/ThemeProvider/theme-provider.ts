import { LitElement, unsafeCSS, html } from "lit"
import { customElement, property } from "lit/decorators.js"
import theme from "./theme.scss?inline"

@customElement("vg-theme-provider")
export class ThemeProvider extends LitElement {
    static styles = unsafeCSS(theme)

    @property({ type: String })
    varient = "light"


    render() {
        return html`<slot></slot>`
    }
}


declare global {
    interface HTMLElementTagNameMap {
        'vg-theme-provider': ThemeProvider
    }
}
