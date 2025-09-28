import { LitElement, html, unsafeCSS } from "lit"
import { customElement, property } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"

import style from "./style.scss?inline"

/**
 * Supported visual variants for {@link VgButton}.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost"

/**
 * Supported button size tokens.
 */
export type ButtonSize = "sm" | "md" | "lg"

/**
 * Supported button types that align with the native `HTMLButtonElement` contract.
 */
export type ButtonNativeType = "button" | "submit" | "reset"

/**
 * Event detail emitted alongside the {@link VgButton | button}'s `click` event.
 */
export interface ButtonClickDetail {
    /**
     * Original pointer event that triggered the handler.
     */
    readonly originalEvent: PointerEvent
}

const SUPPORTED_VARIANTS: readonly ButtonVariant[] = ["primary", "secondary", "ghost"]
const SUPPORTED_SIZES: readonly ButtonSize[] = ["sm", "md", "lg"]

/**
 * Accessible, theme-aware button component with size and variant controls.
 *
 * @tag vg-button
 * @tagname vg-button
 * @summary The Button component, used for calling attention to actions.
 *
 * @slot prefix - Optional leading icon or element rendered before the label
 * @slot - Button label content
 * @slot suffix - Optional trailing icon or element rendered after the label
 *
 * @csspart button - No input css variables
 *
 * @fires {CustomEvent<ButtonClickDetail>} vg-click - Fired when the button is activated
 *
 */
@customElement("vg-button")
export class VgButton extends LitElement {
    static styles = unsafeCSS(style)

    /**
     * Disables pointer interaction and visually indicates an unavailable state.
     */
    @property({ type: Boolean, reflect: true })
    public disabled = false

    /**
     * Renders a lightweight loading indicator and prevents interaction while true.
     */
    @property({ type: Boolean, reflect: true })
    public loading = false

    /**
     * Visual style variant for the button.
     */
    @property({ type: String })
    public variant: ButtonVariant = "primary"

    /**
     * Controls the paddings and font sizing of the button.
     */
    @property({ type: String })
    public size: ButtonSize = "md"

    /**
     * Button type attribute mirroring the native element contract.
     */
    @property({ type: String, attribute: "buttonType" })
    public buttonType: ButtonNativeType = "button"
    protected willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
        if (changedProperties.has("variant")) {
            const normalisedVariant = this.normaliseVariant(this.variant)
            if (this.variant !== normalisedVariant) {
                this.variant = normalisedVariant
            }
        }

        if (changedProperties.has("size")) {
            const normalisedSize = this.normaliseSize(this.size)
            if (this.size !== normalisedSize) {
                this.size = normalisedSize
            }
        }
    }

    /**
     * @inheritdoc
     */
    protected render() {
        const isDisabled = this.disabled || this.loading
        const classes = {
            [this.variant]: true,
            [this.size]: true,
            loading: this.loading,
        }

        return html`
            <button
                class=${classMap(classes)}
                type=${this["buttonType"]}
                ?disabled=${isDisabled}
                aria-live="polite"
                aria-busy=${this.loading}
                @click=${this.handleClick}
            >
                ${this.loading ? html`<span class="loader" aria-hidden="true"></span>` : null}
                <span class="content">
                    <slot name="prefix"></slot>
                    <span class="label"><slot></slot></span>
                    <slot name="suffix"></slot>
                </span>
            </button>
        `
    }

    private handleClick(event: PointerEvent) {
        if (this.disabled || this.loading) {
            event.preventDefault()
            event.stopImmediatePropagation()
            return
        }

        this.dispatchEvent(new CustomEvent<ButtonClickDetail>("vg-click", {
            detail: { originalEvent: event },
            bubbles: true,
            composed: true,
            cancelable: true,
        }))

    }

    private normaliseVariant(value: string): ButtonVariant {
        return SUPPORTED_VARIANTS.includes(value as ButtonVariant) ? (value as ButtonVariant) : "primary"
    }

    private normaliseSize(value: string): ButtonSize {
        return SUPPORTED_SIZES.includes(value as ButtonSize) ? (value as ButtonSize) : "md"
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "vg-button": VgButton
    }
}
