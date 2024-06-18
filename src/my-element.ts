import { LitElement, html,unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'

import styles from '@/my-element.scss?inline';

import "./index"

@customElement('my-element')
export class MyElement extends LitElement {
  static styles = unsafeCSS(styles);


  render() {
    return html`
      <vg-button size='sm'  @tick=${(e:Event)=>console.log(e)}>
        Test
      </vg-button><br /><br />

      <vg-button></vg-button>
      
      `
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
