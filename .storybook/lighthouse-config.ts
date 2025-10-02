/**
 * Shared Lighthouse configuration for both test-runner and Storybook addon
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

// Component-level performance thresholds (stricter than full page)
// Since we're testing individual components, not complete pages, performance should be excellent
// Components have minimal overhead: no routing, fewer resources, smaller bundles
export const DEFAULT_THRESHOLDS: LighthouseThresholds = {
  // Category scores (0-100) - Aiming for excellence in components
  performance: 90,           // Components should be highly performant (vs 70 for pages)
  accessibility: 95,         // Components should be highly accessible (vs 90 for pages)
  'best-practices': 90,      // Stricter best practices (vs 80 for pages)
  seo: 80,                   // Moderate SEO (less relevant for components)
  
  // Core Web Vitals - Component-level "Excellent" thresholds
  // These are significantly stricter than Google's "Good" thresholds for full pages
  'first-contentful-paint': 1000,      // ≤ 1.0s (vs 2.0s for pages) - First paint should be instant
  'largest-contentful-paint': 1500,    // ≤ 1.5s (vs 2.5s for pages) - Largest element loads fast
  'cumulative-layout-shift': 0.05,     // ≤ 0.05 (vs 0.1 for pages) - Minimal layout shift
  'total-blocking-time': 100,          // ≤ 100ms (vs 200ms for pages) - Minimal blocking
  'speed-index': 1500,                 // ≤ 1.5s (vs 3.4s for pages) - Visual completion is fast
  interactive: 2000,                   // ≤ 2.0s (vs 3.8s for pages) - Quick interactivity
};
