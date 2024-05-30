import { LitElement, html,unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'

import styles from '@/my-element.scss?inline';

import "./components/index"

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = unsafeCSS(styles);


  render() {
    return html`
    svds
      <vg-button size='lg'>
        Test
      </vg-button>
      

      <!-- <slot></slot> -->

      <!-- <button>Test2</button> -->
      `
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
