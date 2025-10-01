import { LitElement, unsafeCSS, html, PropertyValueMap } from "lit"
import { customElement, property } from "lit/decorators.js"
import theme from "./theme.scss?inline"

/**
 * Supported theme names that can be applied by {@link ThemeProvider}.
 */
export type ThemeMode = "dark" | "light" | "glass" | "cartoon"

/**
 * Detail payload for the {@link ThemeProvider | theme provider}'s `change` event.
 */
export interface ThemeChangeDetail {
    /**
     * Theme mode that is now active on the provider.
     */
    readonly mode: ThemeMode
    /**
     * Theme mode that was active before the change. `null` when no previous theme existed.
     */
    readonly previousMode: ThemeMode | null
}

const THEME_CLASS_PREFIX = "vg-theme-"
const SUPPORTED_THEMES: readonly ThemeMode[] = ["dark", "light", "glass", "cartoon"]
const SUPPORTED_THEME_SET = new Set<ThemeMode>(SUPPORTED_THEMES)
const THEME_CLASSES = SUPPORTED_THEMES.map((mode) => `${THEME_CLASS_PREFIX}${mode}`)

/**
 * Theme provider that exposes vg design tokens as CSS variables and toggles between predefined modes.
 *
 * @tag vg-theme-provider
 * @tagname vg-theme-provider
 * @summary The ThemeProvider component, used for managing application-wide theme and design tokens.
 *
 * @slot - Components that should inherit the active theme and design tokens
 *
 * @csspart provider - Allows you to style the theme provider container
 *
 * @fires {ThemeChangeDetail} vg-change - Emitted whenever the active theme mode changes
 *
 */
@customElement("vg-theme-provider")
export class ThemeProvider extends LitElement {
    static styles = unsafeCSS(theme)

    /**
     * Theme mode that controls which token values are exposed.
     * The value is normalised to one of ThemeMode. Unsupported values fall back to "dark".
     */
    @property({ type: String, reflect: true })
    public mode: ThemeMode = "dark"

    protected willUpdate(changedProperties: PropertyValueMap<this>) {
        if (changedProperties.has("mode")) {
            const normalised = this.normaliseTheme(this.mode)
            if (normalised !== this.mode) {
                this.mode = normalised
            }
        }
    }

    protected updated(changedProperties: PropertyValueMap<this>) {
        if (changedProperties.has("mode")) {
            const previousValue = changedProperties.get("mode") as ThemeMode | undefined
            const previousMode = previousValue === undefined ? null : this.normaliseTheme(previousValue)
            const nextMode = this.normaliseTheme(this.mode)
            this.applyThemeClass(nextMode)
            this.setThemeAttributes(nextMode)

            if (previousMode !== nextMode) {
                this.dispatchEvent(new CustomEvent<ThemeChangeDetail>("vg-change", {
                    detail: {
                        mode: nextMode,
                        previousMode,
                    },
                    bubbles: true,
                    composed: true,
                }))
            }
        }
    }

    /**
     * @inheritdoc
     */
    render() {
        return html`<slot></slot>`
    }

    private applyThemeClass(mode: ThemeMode) {
        this.classList.remove(...THEME_CLASSES)
        this.classList.add(`${THEME_CLASS_PREFIX}${mode}`)
    }

    private setThemeAttributes(mode: ThemeMode) {
        this.dataset.vgTheme = mode
        this.setAttribute("data-vg-theme", mode)
    }

    private normaliseTheme(value: ThemeMode | string | undefined): ThemeMode {
        const candidate = (value ?? "").toString().toLowerCase() as ThemeMode
        return SUPPORTED_THEME_SET.has(candidate) ? candidate : "dark"
    }
}


declare global {
    interface HTMLElementTagNameMap {
        'vg-theme-provider': ThemeProvider
    }
}
