<script setup>
import { ref } from "vue";
import "vg/vue";
const theme = ref("dark");
const variant = ref("primary");
const size = ref("md");
const label = ref("Launch demo");
const clicks = ref(0);

const themeOptions = [
  { label: "Dark", value: "dark" },
  { label: "Light", value: "light" },
  { label: "Glass", value: "glass" },
  { label: "Cartoon", value: "cartoon" },
];

const variantOptions = [
  { label: "Primary", value: "primary" },
  { label: "Secondary", value: "secondary" },
  { label: "Ghost", value: "ghost" },
];

const sizeOptions = [
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
];

const onThemeChange = (event) => {
  theme.value = event.detail.value;
};

const onVariantChange = (event) => {
  variant.value = event.detail.value;
};

const onSizeChange = (event) => {
  size.value = event.detail.value;
};

const onLabelChange = (event) => {
  label.value = event.detail.value;
};

const onButtonTick = (event) => {
  clicks.value += 1;
  console.info("Button tick", event.detail);
};
</script>

<template>
  <h1>Vue Demo</h1>
  <vg-theme-provider :mode="theme">
    <vg-card heading="Theme controls" variant="subtle">
      <vg-dropdown
        label="Theme"
        :value="theme"
        :options="themeOptions"
        @vg-change="onThemeChange"
      ></vg-dropdown>
      <vg-dropdown
        label="Button variant"
        :value="variant"
        :options="variantOptions"
        helper-text="Preview updates immediately"
        @vg-change="onVariantChange"
      ></vg-dropdown>
      <vg-dropdown
        label="Button size"
        :value="size"
        :options="sizeOptions"
        @vg-change="onSizeChange"
      ></vg-dropdown>
      <vg-input
        label="Button label"
        :value="label"
        placeholder="Type a label"
        helper-text="Try updating the label to see changes"
        @vg-change="onLabelChange"
      ></vg-input>
    </vg-card>

    <vg-card heading="Preview" variant="outlined">
      <vg-button
        :variant="variant"
        :size="size"
        @vg-click="onButtonTick"
      >
        {{ label }}
      </vg-button>
      <p role="status">Clicked {{ clicks }} times</p>
    </vg-card>
  </vg-theme-provider>
</template>
