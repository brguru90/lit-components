---
mode: agent
---
Please setup the storybook for current Lit component(its a framework built on top of web component) project and follow the below instructions,

reference,
https://jamesiv.es/blog/frontend/javascript/2025/02/19/documenting-web-components-with-storybook

if you are running any npm command then run it in verbose mode.


# Working example — Showcasing **Lit** components in **Storybook** (Vite)

Below is a small, *copy-pasteable* example that gets a Lit component into Storybook using the **Web Components + Vite** framework. I’ll provide the project layout, the exact files you need, the commands to run, and a short explanation of how stories + controls map to Lit element attributes/properties. This follows Storybook’s Web Components (Vite) guidance. ([Storybook][1])

---

## Quick steps (summary)

1. Create a project and install deps.
2. Add a small Lit component.
3. Configure Storybook for `@storybook/web-components-vite`.
4. Write a story that uses `lit`'s `html` template and Storybook args/controls.
5. Run Storybook.

(Full files follow.) ([Storybook][1])

---

## 1) Start a new project & install Storybook (recommended)

In a folder run:

```bash
mkdir lit-storybook-demo
cd lit-storybook-demo
npm init -y
# install lit and vite (peer), plus storybook web-components for vite
npm install lit
npm install --save-dev @storybook/web-components-vite vite
# initialize storybook (optional: interactive). The docs recommend:
npx storybook@latest init
```

> The Storybook docs recommend using the `web-components-vite` framework for Lit + Vite projects (Vite ≥ 5.0). ([Storybook][1])

---

## 2) Project layout

```
lit-storybook-demo/
├─ package.json
├─ src/
│  └─ components/
│     └─ my-button.ts
├─ .storybook/
│  ├─ main.ts
│  └─ preview.ts
└─ stories/
   └─ my-button.stories.ts
```

---

## 3) Example Lit component (`src/components/my-button.ts`)

```ts
// src/components/my-button.ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-button')
export class MyButton extends LitElement {
  static styles = css`
    button {
      font-family: inherit;
      padding: 8px 14px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-size: 14px;
    }
    button.primary { background: #0ea5a4; color: white; }
    button.secondary { background: #e5e7eb; color: #111827; }
    button[disabled] { opacity: 0.5; cursor: not-allowed; }
  `;

  @property({ type: String }) label = 'Button';
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: String }) variant: 'primary' | 'secondary' = 'primary';

  render() {
    return html`
      <button
        class=${this.variant}
        ?disabled=${this.disabled}
        @click=${() => this._onClick()}
      >
        <slot>${this.label}</slot>
      </button>
    `;
  }

  _onClick() {
    const ev = new CustomEvent('my-button-click', { bubbles: true, composed: true });
    this.dispatchEvent(ev);
  }
}
```

Notes:

* We use `@property({ type: ... })` so Storybook controls can map to the component properties.
* `reflect: true` for `disabled` is useful if you want attribute reflection in DOM.

---

## 4) Storybook config

### `.storybook/main.ts`

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|ts|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@thecaffeinateddev/storybook-addon-web-component-html' // optional: shows rendered HTML
  ],
  framework: '@storybook/web-components-vite',
};

export default config;
```

(If you prefer webpack, Storybook also has a `web-components-webpack5` framework.) ([Storybook][1])

### `.storybook/preview.ts`

Import your components globally so stories can use them without importing in every story:

```ts
// .storybook/preview.ts
import '../src/components/my-button.ts';

export const parameters = {
  actions: { argTypesRegex: '^on.*' },
};
```

---

## 5) Story file for the component (`stories/my-button.stories.ts`)

```ts
// stories/my-button.stories.ts
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import '../src/components/my-button';

const meta: Meta = {
  title: 'Example/MyButton',
  component: 'my-button',
  argTypes: {
    label: { control: 'text' },
    disabled: { control: 'boolean' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
    // event action mapping: Storybook will show clicks
    onMyButtonClick: { action: 'my-button-click' },
  },
};
export default meta;

type Story = StoryObj;

export const Primary: Story = {
  args: {
    label: 'Primary button',
    disabled: false,
    variant: 'primary',
  },
  render: (args) =>
    html`<my-button
      .label=${args.label}
      ?disabled=${args.disabled}
      .variant=${args.variant}
      @my-button-click=${() => {
        // Storybook actions will also pick this up from argTypes mapping,
        // but you can dispatch or log here if needed.
      }}
    ></my-button>`,
};
```

Key points:

* Use `lit`'s `html` template to create story previews (Storybook supports rendering `lit-html`). ([Storybook][2])
* Controls (argTypes) let users tweak `label`, `disabled`, and `variant` in the Storybook UI. ([Storybook][3])

---

## 6) Scripts in `package.json`

Add scripts so you can run/ build Storybook:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

Run:

```bash
npm run storybook
# open http://localhost:6006
```

---

## 7) Optional: show source HTML in docs

There is a handy addon to display syntax-highlighted HTML that web components produce:

```bash
npm install --save-dev @thecaffeinateddev/storybook-addon-web-component-html
```

Add it to `.storybook/main.ts` under `addons` (example shown above). This makes it easy for designers/devs to copy the final markup. ([Storybook][4])

---

## 8) Practical tips & troubleshooting

* Storybook’s Web Components target uses `lit-html` rendering under the hood for story templates — so `html` from `lit` works cleanly. If a story renders nothing, confirm your component is imported (either in the story or in `preview.ts`). ([Storybook][1])
* Controls map to component **properties**, not attributes — using `.` binding notation (e.g. `.label=${args.label}`) ensures property binding. For boolean attributes use the `?` boolean binding (e.g. `?disabled=${args.disabled}`).
* If you need global CSS or theme providers, add decorators in `preview.ts`.
* If you run into older blog/issue examples online, check Storybook version compatibility (docs currently reference the `web-components-vite` framework; use `npx storybook@latest upgrade` if migrating). ([Storybook][1])

---

## Sources / further reading

* Storybook — Web components & Vite (official docs). (Use this to configure framework and options.) ([Storybook][1])
* Storybook — Writing stories & Args/Controls (official guide). ([Storybook][2])
* Storybook Controls (how to set up controls in stories). ([Storybook][3])
* Addon: `storybook-addon-web-component-html` — show HTML of web-component stories. ([Storybook][4])
* Community examples & tips (StackOverflow / blog posts) — good for troubleshooting Lit-specific issues. ([Stack Overflow][5])

---

If you want, I can:

* convert the example to TypeScript-only (with typed component props),
* show an MDX docs page for the same component, or
* scaffold a small GitHub repo with these files (I’ll paste full files here so you can copy them). Which would you like next?

[1]: https://storybook.js.org/docs/get-started/frameworks/web-components-vite "Storybook for Web components & Vite | Storybook docs"
[2]: https://storybook.js.org/docs/writing-stories?utm_source=chatgpt.com "How to write stories | Storybook docs - JS.ORG"
[3]: https://storybook.js.org/docs/essentials/controls?utm_source=chatgpt.com "Controls | Storybook docs"
[4]: https://storybook.js.org/addons/%40thecaffeinateddev/storybook-addon-web-component-html?utm_source=chatgpt.com "Storybook Addon Web Component HTML"
[5]: https://stackoverflow.com/questions/71999979/storybook-web-component-code-examples-extra-comment-tags?utm_source=chatgpt.com "Storybook web component code examples extra comment tags"
