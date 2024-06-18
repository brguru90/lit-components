import { LitElement, html, unsafeCSS, PropertyValues } from "lit"
import { customElement, property, state } from "lit/decorators.js"

import style from "./style.scss?inline"


// type ButtonSizeType={
//     [key:string]:'sm' | 'md' | 'lg'
// }


// const ButtonSize: ButtonSizeType = {
//     sm: "sm",
//     md: "md",
//     lg: "lg",
// }; 


export type ButtonSizeType = 'sm' | 'md' | 'lg';

const ButtonSizeValues = {
    sm: "12px",
    md: "16px",
    lg: "22px"
}

/**
 * @event {CustomEvent} tick - event on click button
 * @slot "Test button" - child elements
 */

@customElement("vg-button")
export class VgButton extends LitElement {
    static styles = unsafeCSS(style)


    @property({ type: Boolean })
    disabled: boolean = false

    @property({ type: String })
    size: ButtonSizeType = "sm"

    @state()
    fontSize: string = ButtonSizeValues[this.size]

    updated(changedProperties: PropertyValues) {
        if (changedProperties.has("size")) {
            this.fontSize = ButtonSizeValues[this.size]
        }
    }
    private _onClick(e: MouseEvent) {
        let event = new CustomEvent('tick', {
            bubbles: true,
            cancelable: true,
            detail: {
                test:'This is awesome.',
                originalEvent:e,
            }
        });
        this.dispatchEvent(event);

        // this.dispatchEvent(new Event("click",e))
    }

    render() {
        return html`
    <button @click=${this._onClick} style='font-size:${this.fontSize}'>
        <slot name="prefixIcon"></slot>
        <slot>default value</slot>
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
