/**
 * Shared Lighthouse configuration for both test-runner and Storybook addon
 * TypeScript definitions and re-exports from lighthouse-config.mjs
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

// Re-export from .mjs file for TypeScript compatibility
export { CHROME_FLAGS, LIGHTHOUSE_OPTIONS, DEFAULT_THRESHOLDS } from './lighthouse-config.mjs';
