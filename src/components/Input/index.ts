import { LitElement, html, unsafeCSS } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"

import style from "./style.scss?inline"

/**
 * Available HTML input types supported by {@link VgInput}.
 */
export type InputType = "text" | "email" | "password" | "search" | "number" | "tel"

/**
 * Detail payload emitted alongside the {@link VgInput} change event.
 */
export interface InputChangeDetail {
	/**
	 * Current value of the input field.
	 */
	readonly value: string
	/**
	 * Native event that triggered the update.
	 */
	readonly originalEvent: InputEvent
}


let idCounter = 0

const nextId = () => `vg-input-${++idCounter}`

/**
 * Theme-aware text input supporting helper and error messaging.
 *
 * @tag vg-input
 * @tagname vg-input
 * @summary The Input component, used for text input with validation support.
 *
 * @slot prefix - Optional content rendered before the native input (e.g. icons)
 * @slot suffix - Optional content rendered after the native input (e.g. actions)
 *
 * @csspart input - Allows you to style the input element
 * @csspart label - Allows you to style the label element
 *
 * @fires {InputChangeDetail} vg-change - Fired whenever the value changes via user input
 *
 */
@customElement("vg-input")
export class VgInput extends LitElement {
	static styles = unsafeCSS(style)

	/**
	 * Input label rendered above the control.
	 */
	@property({ type: String })
	public label: string | null = null

	/**
	 * Provides additional guidance displayed beneath the control.
	 */
	@property({ type: String, attribute: "helper-text" })
	public helperText: string | null = null

	/**
	 * Error message to display. When present the input is marked as invalid.
	 */
	@property({ type: String })
	public error: string | null = null

	/**
	 * Placeholder text forwarded to the native input element.
	 */
	@property({ type: String })
	public placeholder: string | null = null

	/**
	 * Current value of the input. Setting the property updates the native control.
	 */
	@property({ type: String })
	public value = ""

	/**
	 * Name attribute forwarded to the native input.
	 */
	@property({ type: String })
	public name: string | null = null

	/**
	 * Native input type.
	 */
	@property({ type: String })
	public type: InputType = "text"

	/**
	 * Disables user interaction with the input control.
	 */
	@property({ type: Boolean, reflect: true })
	public disabled = false

	/**
	 * Marks the input as required for form validation.
	 */
	@property({ type: Boolean, reflect: true })
	public required = false

	@query("input")
	private inputElement!: HTMLInputElement

	@state()
	private hasPrefixContent = false

	@state()
	private hasSuffixContent = false

	private readonly inputId = nextId()

	protected firstUpdated() {
		this.updateSlotState("prefix")
		this.updateSlotState("suffix")
	}

	protected updated() {
		if (this.inputElement && this.inputElement.value !== this.value) {
			this.inputElement.value = this.value
		}
	}

	/**
	 * @inheritdoc
	 */
	protected render() {
		const controlClasses = {
			control: true,
			"has-prefix": this.hasPrefixContent,
			"has-suffix": this.hasSuffixContent,
			"has-error": !!this.error,
		}

		const describedBy = [
			this.helperText ? `${this.inputId}-helper` : null,
			this.error ? `${this.inputId}-error` : null,
		].filter((value): value is string => value !== null)

		return html`
			<label class="field" for=${this.inputId}>
				${this.label ? html`<span class="field__label">${this.label}</span>` : null}
				<div class=${classMap(controlClasses)}>
					<slot name="prefix" @slotchange=${this.onSlotChange}></slot>
					<input
						id=${this.inputId}
						.value=${this.value}
						type=${this.type}
						name=${this.name ?? ""}
						placeholder=${this.placeholder ?? ""}
						?disabled=${this.disabled}
						?required=${this.required}
						aria-invalid=${this.error ? "true" : "false"}
						aria-describedby=${describedBy.join(" ")}
						@input=${this.onInput}
					/>
					<slot name="suffix" @slotchange=${this.onSlotChange}></slot>
				</div>
				${this.helperText ? html`<p id=${`${this.inputId}-helper`} class="field__helper">${this.helperText}</p>` : null}
				${this.error ? html`<p id=${`${this.inputId}-error`} class="field__error">${this.error}</p>` : null}
			</label>
		`
	}

	private onInput(event: InputEvent) {
		if (!this.inputElement) {
			return
		}

		this.value = this.inputElement.value

		this.dispatchEvent(new CustomEvent<InputChangeDetail>('vg-change', {
			detail: {
				value: this.value,
				originalEvent: event,
			},
			bubbles: true,
			composed: true,
		}))
	}

	private onSlotChange(event: Event) {
		const slot = event.target as HTMLSlotElement
		this.updateSlotState(slot.name as "prefix" | "suffix")
	}

	private updateSlotState(name: "prefix" | "suffix") {
		const slot = this.shadowRoot?.querySelector(`slot[name="${name}"]`) as HTMLSlotElement | null
		const hasContent = (slot?.assignedNodes({ flatten: true }).length ?? 0) > 0

		if (name === "prefix" && this.hasPrefixContent !== hasContent) {
			this.hasPrefixContent = hasContent
		}

		if (name === "suffix" && this.hasSuffixContent !== hasContent) {
			this.hasSuffixContent = hasContent
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"vg-input": VgInput
	}
}
