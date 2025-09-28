import { create } from 'storybook/theming'
import type { ThemeVars } from 'storybook/theming'

// Theme mapping based on your UI library's theme tokens
const baseTheme = {
  // Typography
  fontBase: "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  fontCode: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',

  // Branding
  brandTitle: 'VG Design System',
  brandUrl: 'https://github.com/brguru90/lit-components',
  brandTarget: '_self',
}

export const darkTheme = create({
  base: 'dark',
  ...baseTheme,

  // Colors mapping to your dark theme tokens
  colorPrimary: '#38bdf8', // text-color-primary
  colorSecondary: '#22d3ee', // accent-color

  // UI
  appBg: '#020617', // background-color
  appContentBg: '#0f172a', // background-color-primary
  appPreviewBg: '#0f172a', // background-color-primary
  appBorderColor: 'rgba(148, 163, 184, 0.4)', // border-color
  appBorderRadius: 8,

  // Text colors
  textColor: '#f8fafc', // text-color
  textInverseColor: '#0f172a',
  textMutedColor: '#94a3b8', // text-color-secondary

  // Toolbar
  barTextColor: '#94a3b8', // text-color-secondary
  barSelectedColor: '#38bdf8', // text-color-primary
  barHoverColor: '#22d3ee', // accent-color
  barBg: '#1e293b', // background-color-secondary

  // Form colors
  inputBg: '#334155', // background-color-tertiary
  inputBorder: 'rgba(148, 163, 184, 0.4)', // border-color
  inputTextColor: '#f8fafc', // text-color
  inputBorderRadius: 6,

  // Buttons
  buttonBg: '#38bdf8', // text-color-primary
  buttonBorder: 'rgba(148, 163, 184, 0.4)', // border-color
  booleanBg: '#334155', // background-color-tertiary
  booleanSelectedBg: '#38bdf8', // text-color-primary
} as ThemeVars)

export const lightTheme = create({
  base: 'light',
  ...baseTheme,

  // Colors mapping to your light theme tokens
  colorPrimary: '#2563eb', // text-color-primary
  colorSecondary: '#7c3aed', // accent-color

  // UI
  appBg: '#ffffff', // background-color
  appContentBg: '#f8fafc', // background-color-primary
  appPreviewBg: '#f8fafc', // background-color-primary
  appBorderColor: 'rgba(15, 23, 42, 0.18)', // border-color
  appBorderRadius: 8,

  // Text colors
  textColor: '#0f172a', // text-color
  textInverseColor: '#ffffff',
  textMutedColor: '#475569', // text-color-secondary

  // Toolbar
  barTextColor: '#475569', // text-color-secondary
  barSelectedColor: '#2563eb', // text-color-primary
  barHoverColor: '#7c3aed', // accent-color
  barBg: '#e2e8f0', // background-color-secondary

  // Form colors
  inputBg: '#ffffff', // background-color
  inputBorder: 'rgba(15, 23, 42, 0.18)', // border-color
  inputTextColor: '#0f172a', // text-color
  inputBorderRadius: 6,

  // Buttons
  buttonBg: '#2563eb', // text-color-primary
  buttonBorder: 'rgba(15, 23, 42, 0.18)', // border-color
  booleanBg: '#e2e8f0', // background-color-secondary
  booleanSelectedBg: '#2563eb', // text-color-primary
} as ThemeVars)

export const glassTheme = create({
  base: 'dark',
  ...baseTheme,

  // Colors mapping to your glass theme tokens
  colorPrimary: '#60a5fa', // text-color-primary
  colorSecondary: 'rgba(94, 234, 212, 0.85)', // accent-color

  // UI
  appBg: 'rgba(15, 23, 42, 0.35)', // background-color
  appContentBg: 'rgba(15, 23, 42, 0.65)', // background-color-primary
  appPreviewBg: 'rgba(15, 23, 42, 0.65)', // background-color-primary
  appBorderColor: 'rgba(148, 163, 184, 0.35)', // border-color
  appBorderRadius: 12,

  // Text colors
  textColor: 'rgba(255, 255, 255, 0.88)', // text-color
  textInverseColor: 'rgba(15, 23, 42, 0.9)',
  textMutedColor: 'rgba(226, 232, 240, 0.85)', // text-color-secondary

  // Toolbar
  barTextColor: 'rgba(226, 232, 240, 0.85)', // text-color-secondary
  barSelectedColor: '#60a5fa', // text-color-primary
  barHoverColor: 'rgba(94, 234, 212, 0.85)', // accent-color
  barBg: 'rgba(30, 41, 59, 0.48)', // background-color-secondary

  // Form colors
  inputBg: 'rgba(100, 116, 139, 0.3)', // background-color-tertiary
  inputBorder: 'rgba(148, 163, 184, 0.35)', // border-color
  inputTextColor: 'rgba(255, 255, 255, 0.88)', // text-color
  inputBorderRadius: 8,

  // Buttons
  buttonBg: '#60a5fa', // text-color-primary
  buttonBorder: 'rgba(148, 163, 184, 0.35)', // border-color
  booleanBg: 'rgba(100, 116, 139, 0.3)', // background-color-tertiary
  booleanSelectedBg: '#60a5fa', // text-color-primary
} as ThemeVars)

export const cartoonTheme = create({
  base: 'light',
  ...baseTheme,

  // Colors mapping to your cartoon theme tokens
  colorPrimary: '#9a3412', // text-color-primary
  colorSecondary: '#2563eb', // accent-color

  // UI
  appBg: '#fefae0', // background-color
  appContentBg: '#ffd166', // background-color-primary
  appPreviewBg: '#ffd166', // background-color-primary
  appBorderColor: 'rgba(31, 10, 42, 0.35)', // border-color
  appBorderRadius: 12,

  // Text colors
  textColor: '#1f0a2a', // text-color
  textInverseColor: '#fefae0',
  textMutedColor: '#92400e', // text-color-secondary

  // Toolbar
  barTextColor: '#92400e', // text-color-secondary
  barSelectedColor: '#9a3412', // text-color-primary
  barHoverColor: '#2563eb', // accent-color
  barBg: '#fcbf49', // background-color-secondary

  // Form colors
  inputBg: '#fefae0', // background-color
  inputBorder: 'rgba(31, 10, 42, 0.35)', // border-color
  inputTextColor: '#1f0a2a', // text-color
  inputBorderRadius: 8,

  // Buttons
  buttonBg: '#9a3412', // text-color-primary
  buttonBorder: 'rgba(31, 10, 42, 0.35)', // border-color
  booleanBg: '#fcbf49', // background-color-secondary
  booleanSelectedBg: '#9a3412', // text-color-primary
} as ThemeVars)

// Export theme mapping for easy access
export const themes = {
  dark: darkTheme,
  light: lightTheme,
  glass: glassTheme,
  cartoon: cartoonTheme,
}

export type ThemeMode = keyof typeof themes