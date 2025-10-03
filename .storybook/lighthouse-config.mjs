/**
 * Shared Lighthouse configuration for both test-runner and Storybook addon
 * Keep thresholds in sync across the project
 */

/**
 * Chrome flags optimized for Lighthouse testing
 * Shared between lighthouse-runner.mjs and Storybook addon server
 */
export const CHROME_FLAGS = [
  '--headless',                          // Run without UI
  '--incognito',                         // Clean slate: no extensions, cache, cookies, or sync
  '--no-sandbox',                        // Required for Docker/CI environments
  '--disable-dev-shm-usage',            // Prevent shared memory issues in containers
  '--disable-gpu',                       // Disable GPU hardware acceleration
  '--window-size=1920,1080',            // Consistent viewport size
];

/**
 * Lighthouse configuration options
 * Shared between lighthouse-runner.mjs and Storybook addon server
 */
export const LIGHTHOUSE_OPTIONS = {
  logLevel: 'error',
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  // Desktop configuration to match manual DevTools testing
  formFactor: 'desktop',
  throttling: {
    rttMs: 40,
    throughputKbps: 10240,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
    cpuSlowdownMultiplier: 1
  },
  throttlingMethod: 'simulate',
  screenEmulation: {
    mobile: false,
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    disabled: true
  },
  emulatedUserAgent: false, // Use default desktop user agent
};

// Component-level performance thresholds (stricter than full page)
// Since we're testing individual components, not complete pages, performance should be excellent
// Components have minimal overhead: no routing, fewer resources, smaller bundles
export const DEFAULT_THRESHOLDS = {
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
