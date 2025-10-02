import { useState } from "react";
import "vg/jsx"
import type { ThemeMode, ButtonVariant, ButtonSize, DropdownChangeDetail, InputChangeDetail } from "vg";

const THEME_OPTIONS = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Glass", value: "glass" },
  { label: "Cartoon", value: "cartoon" },
];

const VARIANT_OPTIONS = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
  { label: "Ghost", value: "ghost" },
];

const SIZE_OPTIONS = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

function App() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [variant, setVariant] = useState<ButtonVariant>("primary");
  const [size, setSize] = useState<ButtonSize>("md");
  const [label, setLabel] = useState("Launch demo");
  const [clicks, setClicks] = useState(0);


  return (
    <vg-theme-provider mode={theme} onvg-change={e=>console.log(e)}>
      <vg-card heading="Theme controls" variant="subtle">
        <vg-dropdown
          label="Theme"
          value={theme}
          options={THEME_OPTIONS}
          onvg-change={(event: CustomEvent<DropdownChangeDetail>) => setTheme(event.detail.value as ThemeMode)}
        />
        <vg-dropdown
          label="Button variant"
          value={variant}
          options={VARIANT_OPTIONS}
          helperText="Preview updates immediately"
          onvg-change={(event: CustomEvent<DropdownChangeDetail>) => setVariant(event.detail.value as ButtonVariant)}
        />
        <vg-dropdown
          label="Button size"
          value={size}
          options={SIZE_OPTIONS}
          onvg-change={(event: CustomEvent<DropdownChangeDetail>) => setSize(event.detail.value as ButtonSize)}
        />
        <vg-input
          label="Button label"
          value={label}
          placeholder="Type a label"
          helperText="Try updating the label to see changes"
          onvg-change={(event: CustomEvent<InputChangeDetail>) => setLabel(event.detail.value)}
        />
      </vg-card>

      <vg-card heading="Preview" variant="outlined">
        <vg-button
          variant={variant}
          size={size}
          onvg-click={(event) => {
            console.info("onClick called with:", {
              type: event.type,
              detail: event.detail,
              target: event.target && 'tagName' in event.target ? event.target.tagName : undefined,
              currentTarget: event.currentTarget && 'tagName' in event.currentTarget ? event.currentTarget.tagName : undefined,
              timeStamp: event.timeStamp,
              stack: new Error().stack?.split('\n').slice(1, 4)
            });
            // event.stopPropagation();
            setClicks((previous) => previous + 1);
          }}
        >
          {label}
        </vg-button>
        <p role="status">Clicked {clicks} times</p>
      </vg-card>
    </vg-theme-provider>
  );
}

export default App;
