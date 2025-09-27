import { LitElement, html, unsafeCSS } from "lit"
import { customElement, property } from "lit/decorators.js"
import { classMap } from "lit/directives/class-map.js"
import { ifDefined } from "lit/directives/if-defined.js"

import style from "./style.scss?inline"

/**
 * Available visual styles for {@link VgCard}.
 */
export type CardVariant = "elevated" | "outlined" | "subtle"

/**
 * Payload emitted by the {@link VgCard | card}'s `action` event when the card is interactive.
 */
export interface CardActionDetail {
	/**
	 * Original keyboard or pointer event initiating the action.
	 */
	readonly originalEvent: MouseEvent | KeyboardEvent
}

const CARD_ACTION_EVENT = "action"

/**
 * Theme-aware content container with optional header/footer slots.
 *
 * @slot header - Optional content rendered before the body, often containing a title or metadata.
 * @slot - Main card body content.
 * @slot footer - Optional actions or supporting content rendered after the body.
 * @fires {CustomEvent<CardActionDetail>} action - Fired when an interactive card is triggered.
 */
@customElement("vg-card")
export class VgCard extends LitElement {
	static styles = unsafeCSS(style)

	/**
	 * Display heading rendered above the default slot when provided.
	 */
	@property({ type: String })
	heading: string | null = null

	/**
	 * Visual variant for the card container.
	 */
	@property({ type: String })
	variant: CardVariant = "elevated"

	/**
	 * Enables hover/press affordances and makes the card keyboard activatable.
	 */
	@property({ type: Boolean, reflect: true })
	interactive = false

	protected render() {
		const classes = {
			card: true,
			[this.variant]: true,
			interactive: this.interactive,
		}

		return html`
			<article
				class=${classMap(classes)}
				role=${ifDefined(this.interactive ? "button" : "group")}
				tabindex=${ifDefined(this.interactive ? "0" : undefined)}
				@click=${this.handleClick}
				@keydown=${this.handleKeydown}
			>
				${this.heading ? html`<header class="card__header">${this.heading}</header>` : null}
				<slot name="header"></slot>
				<div class="card__body">
					<slot></slot>
				</div>
				<slot name="footer"></slot>
			</article>
		`
	}

	private handleClick(event: MouseEvent) {
		if (!this.interactive) {
			return
		}

		this.dispatchAction(event)
	}

	private handleKeydown(event: KeyboardEvent) {
		if (!this.interactive) {
			return
		}

		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault()
			this.dispatchAction(event)
		}
	}

	private dispatchAction(event: MouseEvent | KeyboardEvent) {
		this.dispatchEvent(new CustomEvent<CardActionDetail>(CARD_ACTION_EVENT, {
			detail: { originalEvent: event },
			bubbles: true,
			composed: true,
		}))
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"vg-card": VgCard
	}
}
