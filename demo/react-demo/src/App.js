import { useState } from "react";
import {
  ThemeProvider as VgThemeProvider,
  VgButton,
  VgCard,
  VgDropdown,
  VgInput,
} from "vg/react";

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
  const [theme, setTheme] = useState("dark");
  const [variant, setVariant] = useState("primary");
  const [size, setSize] = useState("md");
  const [label, setLabel] = useState("Launch demo");
  const [clicks, setClicks] = useState(0);

  return (
    <VgThemeProvider mode={theme}>
      <VgCard heading="Theme controls" variant="subtle">
        <VgDropdown
          label="Theme"
          value={theme}
          options={THEME_OPTIONS}
          onChange={(event) => setTheme(event.detail.value)}
        />
        <VgDropdown
          label="Button variant"
          value={variant}
          options={VARIANT_OPTIONS}
          helperText="Preview updates immediately"
          onChange={(event) => setVariant(event.detail.value)}
        />
        <VgDropdown
          label="Button size"
          value={size}
          options={SIZE_OPTIONS}
          onChange={(event) => setSize(event.detail.value)}
        />
        <VgInput
          label="Button label"
          value={label}
          placeholder="Type a label"
          helperText="Try updating the label to see changes"
          onChange={(event) => setLabel(event.detail.value)}
        />
      </VgCard>

      <VgCard heading="Preview" variant="outlined">
        <VgButton
          variant={variant}
          size={size}
          onTick={(event) => {
            setClicks((previous) => previous + 1);
            console.info("Button tick", event.detail);
          }}
        >
          {label}
        </VgButton>
        <p role="status">Clicked {clicks} times</p>
      </VgCard>
    </VgThemeProvider>
  );
}

export default App;
