import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import type { ButtonSizeType } from "./components/Button"

import styles from '@/my-element.scss?inline';

import "./index"

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = unsafeCSS(styles);

  @state()
  selectedSize: ButtonSizeType = "md"

  render() {
    return html`
      <vg-button size="${this.selectedSize}"  @tick=${(e: Event) => console.log(e)}>
        Test
      </vg-button>
      
      <select @change=${(e: Event) => this.selectedSize=e.target!.value}>
        <option value="lg" ?selected=${this.selectedSize=="lg"}>lg</option>
        <option value="md" ?selected=${this.selectedSize=="md"}>md</option>
        <option value="sm" ?selected=${this.selectedSize=="sm"}>sm</option>
      </select><br /><br />

      <vg-button></vg-button>
      `
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
