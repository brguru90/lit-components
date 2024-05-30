import { LitElement, html, unsafeCSS,PropertyValues } from "lit"
import { customElement, property,state } from "lit/decorators.js"

import style from "./style.scss?inline"


type ButtonSizeType={
    [key:string]:'sm' | 'md' | 'lg'
}


const ButtonSize: ButtonSizeType = {
    sm: "sm",
    md: "md",
    lg: "lg",
}; 

const ButtonSizeValues={
    sm:"12px",
    md:"16px",
    lg:"22px"
}



@customElement("vg-button")
class VgButton extends LitElement {
    static styles = unsafeCSS(style)
    

    @property({ type: Boolean })
    disabled = false

    @property({ type: ButtonSize })
    size = ButtonSize.sm

    @state()
    fontSize=ButtonSizeValues[this.size]

    updated(changedProperties:PropertyValues) {
        if (changedProperties.has("size")) {
          this.fontSize = ButtonSizeValues[this.size]
        }
    }

    private _onClick(e: MouseEvent) {
        this.dispatchEvent(e)
    }

    render() {
        return html`
    <button @click=${this._onClick} style='font-size:${this.fontSize}'>
        <slot name="prefixIcon"></slot>
        <slot></slot>
        <slot name="postIcon"></slot>
   </button>
    `;
    }


}

declare global {
    interface HTMLElementTagNameMap {
      'vg-button': VgButton
    }
  }
  