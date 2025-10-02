import { LitElement, html, unsafeCSS } from "lit"
import { customElement, property, query, state } from "lit/decorators.js"
import { repeat } from "lit/directives/repeat.js"
import { classMap } from "lit/directives/class-map.js"

import style from "./style.scss?inline"

/**
 * Option definition consumed by {@link VgDropdown}.
 */
export interface DropdownOption {
	/**
	 * Display label shown to the user.
	 */
	label: string
	/**
	 * Value returned when the option is selected.
	 */
	value: string
	/**
	 * Optional helper text displayed beneath the option label.
	 */
	description?: string
	/**
	 * Marks the option as disabled within the dropdown list.
	 */
	disabled?: boolean
}

/**
 * Detail payload for the {@link VgDropdown} change event.
 */
export interface DropdownChangeDetail {
	/**
	 * Selected option value.
	 */
	readonly value: string
	/**
	 * Full option object corresponding to the selected value, when available.
	 */
	readonly option?: DropdownOption
	/**
	 * Original change event from the native `<select>` element.
	 */
	readonly originalEvent: Event
}



let dropdownId = 0

const nextDropdownId = () => `vg-dropdown-${++dropdownId}`

/**
 * Theme-aware dropdown select element supporting helper text, errors, and descriptions per option.
 *
 * @tag vg-dropdown
 * @tagname vg-dropdown
 * @summary The Dropdown component, used for selecting options from a list.
 *
 * @slot prefix - Optional slot rendered before the native select
 * @slot suffix - Optional slot rendered after the native select (for badges, icons, etc.)
 *
 * @csspart select - Allows you to style the select element
 * @csspart label - Allows you to style the label element
 *
 * @fires {DropdownChangeDetail} vg-change - Emitted when the selected option changes
 *
 */
@customElement("vg-dropdown")
export class VgDropdown extends LitElement {
	static styles = unsafeCSS(style)

	/**
	 * Label displayed above the dropdown control.
	 */
	@property({ type: String })
	public label: string | null = null

	/**
	 * Optional text rendered below the control for guidance.
	 */
	@property({ type: String, attribute: "helper-text" })
	public helperText: string | null = null

	/**
	 * Error message displayed below the control; marks the dropdown as invalid.
	 */
	@property({ type: String })
	public error: string | null = null

	/**
	 * Placeholder rendered as the first option when no value is selected.
	 */
	@property({ type: String })
	public placeholder: string | null = null

	/**
	 * Currently selected value.
	 */
	@property({ type: String })
	public value: string | null = null

	/**
	 * Name attribute forwarded to the native select element.
	 */
	@property({ type: String })
	public name: string | null = null

	/**
	 * Disables the dropdown and prevents user interaction.
	 */
	@property({ type: Boolean, reflect: true })
	public disabled = false

	/**
	 * Marks the dropdown as required when used in forms.
	 */
	@property({ type: Boolean, reflect: true })
	public required = false

	/**
	 * Collection of options rendered by the dropdown.
	 */
	@property({ attribute: false })
	public options: DropdownOption[] = []

	@query("select")
	private selectElement!: HTMLSelectElement

	@state()
	private hasPrefixContent = false

	@state()
	private hasSuffixContent = false

	private readonly dropdownId = nextDropdownId()

	protected firstUpdated() {
		this.updateSlotState("prefix")
		this.updateSlotState("suffix")
	}

	protected updated() {
		if (this.selectElement) {
			const desired = this.value ?? ""
			if (this.selectElement.value !== desired) {
				this.selectElement.value = desired
			}
		}
	}

	/**
	 * @inheritdoc
	 */
	protected render() {
		const classes = {
			control: true,
			"has-prefix": this.hasPrefixContent,
			"has-suffix": this.hasSuffixContent,
			"has-error": !!this.error,
		}

		const describedBy = [
			this.helperText ? `${this.dropdownId}-helper` : null,
			this.error ? `${this.dropdownId}-error` : null,
		].filter((value): value is string => value !== null)

		return html`
			<label class="field" for=${this.dropdownId}>
				${this.label ? html`<span class="field__label">${this.label}</span>` : null}
				<div class=${classMap(classes)}>
					<slot name="prefix" @slotchange=${this.onSlotChange}></slot>
					<select
						id=${this.dropdownId}
						name=${this.name ?? ""}
						?disabled=${this.disabled}
						?required=${this.required}
						aria-invalid=${this.error ? "true" : "false"}
						aria-describedby=${describedBy.join(" ")}
						@change=${this.onChange}
					>
						${this.renderPlaceholder()}
						${repeat(
							this.options,
							(option) => option.value,
							(option) => html`
								<option
									value=${option.value}
									?disabled=${option.disabled}
									?selected=${option.value === this.value}
									title=${option.description ?? ""}
								>
									${option.label}
								</option>
							`,
						)}
					</select>
					<slot name="suffix" @slotchange=${this.onSlotChange}></slot>
				</div>
				${this.renderDescriptions()}
			</label>
		`
	}

	private renderPlaceholder() {
		if (!this.placeholder) {
			return null
		}

		const isSelected = !this.value

		return html`<option value="" ?selected=${isSelected} disabled hidden>${this.placeholder}</option>`
	}

	private renderDescriptions() {
		return html`
			${this.helperText ? html`<p id=${`${this.dropdownId}-helper`} class="field__helper">${this.helperText}</p>` : null}
			${this.error ? html`<p id=${`${this.dropdownId}-error`} class="field__error">${this.error}</p>` : null}
		`
	}

	private onChange(event: Event) {
		const target = event.target as HTMLSelectElement
		this.value = target.value || null
		const selected = this.options.find((option) => option.value === this.value)

		this.dispatchEvent(new CustomEvent<DropdownChangeDetail>("vg-change", {
			detail: {
				value: this.value ?? "",
				option: selected,
				originalEvent: event,
			},
			// bubbles: true,
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
		"vg-dropdown": VgDropdown
	}
}
