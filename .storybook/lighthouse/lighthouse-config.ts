/**
 * Shared Lighthouse configuration for both test-runner and Storybook addon
 * TypeScript definitions and re-exports from lighthouse-config.cjs
 * Keep thresholds in sync across the project
 */

export interface LighthouseThresholds {
  performance?: number;
  accessibility?: number;
  'best-practices'?: number;
  seo?: number;
  // Core Web Vitals (in milliseconds or unitless for CLS)
  'first-contentful-paint'?: number;
  'largest-contentful-paint'?: number;
  'cumulative-layout-shift'?: number;
  'total-blocking-time'?: number;
  'speed-index'?: number;
  interactive?: number;
}

// Re-export from .cjs file for Jest/TypeScript compatibility
const config = require('./lighthouse-config.cjs');
export const CHROME_FLAGS = config.CHROME_FLAGS;
export const LIGHTHOUSE_OPTIONS = config.LIGHTHOUSE_OPTIONS;
export const LIGHTHOUSE_OPTIONS_DESKTOP = config.LIGHTHOUSE_OPTIONS_DESKTOP;
export const LIGHTHOUSE_OPTIONS_MOBILE = config.LIGHTHOUSE_OPTIONS_MOBILE;
export const DEFAULT_THRESHOLDS = config.DEFAULT_THRESHOLDS;
export const DEFAULT_THRESHOLDS_MOBILE = config.DEFAULT_THRESHOLDS_MOBILE;
