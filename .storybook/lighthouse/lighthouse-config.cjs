/**
 * Shared Lighthouse configuration for both test-runner and Storybook addon
 * Keep thresholds in sync across the project
 */

/**
 * Chrome flags optimized for Lighthouse testing
 * Shared between lighthouse-runner.mjs and Storybook addon server
 */
const CHROME_FLAGS = [
  '--headless',                          // Run without UI
  '--incognito',                         // Clean slate: no extensions, cache, cookies, or sync
  '--no-sandbox',                        // Required for Docker/CI environments
  '--disable-dev-shm-usage',            // Prevent shared memory issues in containers
  '--disable-gpu',                       // Disable GPU hardware acceleration
  '--window-size=1920,1080',            // Consistent viewport size
];

/**
 * Base Lighthouse configuration shared between desktop and mobile
 */
const LIGHTHOUSE_OPTIONS_BASE = {
  logLevel: 'error',
  output: 'json',
  onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  throttlingMethod: 'simulate',
};

/**
 * Desktop-specific Lighthouse configuration
 */
const LIGHTHOUSE_OPTIONS_DESKTOP = {
  ...LIGHTHOUSE_OPTIONS_BASE,
  formFactor: 'desktop',
  throttling: {
    rttMs: 40,
    throughputKbps: 10240,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
    cpuSlowdownMultiplier: 1
  },
  screenEmulation: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false
  },
  emulatedUserAgent: false, // Use default desktop user agent
};

/**
 * Mobile-specific Lighthouse configuration
 * Emulates a typical mobile device with 4G network
 */
const LIGHTHOUSE_OPTIONS_MOBILE = {
  ...LIGHTHOUSE_OPTIONS_BASE,
  formFactor: 'mobile',
  throttling: {
    rttMs: 150,              // 4G RTT
    throughputKbps: 1638,    // 4G download throughput (~1.6 Mbps)
    requestLatencyMs: 150,
    downloadThroughputKbps: 1638,
    uploadThroughputKbps: 675,
    cpuSlowdownMultiplier: 4
  },
  screenEmulation: {
    mobile: true,
    width: 360,
    height: 640,
    deviceScaleFactor: 2,
    disabled: false
  },
  emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Mobile Safari/537.36',
};

// Default to desktop (for backwards compatibility)
const LIGHTHOUSE_OPTIONS = LIGHTHOUSE_OPTIONS_DESKTOP;

// Component-level performance thresholds (stricter than full page)
// Since we're testing individual components, not complete pages, performance should be excellent
// Components have minimal overhead: no routing, fewer resources, smaller bundles
const DEFAULT_THRESHOLDS = {
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

// Mobile thresholds are more relaxed due to slower devices and networks
const DEFAULT_THRESHOLDS_MOBILE = {
  performance: 75,           // Mobile performance is naturally slower
  accessibility: 95,         // Same accessibility standards
  'best-practices': 90,      // Same best practices standards
  seo: 80,                   // Same SEO standards
  
  'first-contentful-paint': 1800,      // ≤ 1.8s (mobile 4G is slower)
  'largest-contentful-paint': 2500,    // ≤ 2.5s (Google's "Good" threshold)
  'cumulative-layout-shift': 0.1,      // ≤ 0.1 (Google's "Good" threshold)
  'total-blocking-time': 200,          // ≤ 200ms (Google's "Good" threshold)
  'speed-index': 3400,                 // ≤ 3.4s (Google's "Good" threshold)
  interactive: 3800,                   // ≤ 3.8s (Google's "Good" threshold)
};

module.exports = {
  CHROME_FLAGS,
  LIGHTHOUSE_OPTIONS,
  LIGHTHOUSE_OPTIONS_DESKTOP,
  LIGHTHOUSE_OPTIONS_MOBILE,
  DEFAULT_THRESHOLDS,
  DEFAULT_THRESHOLDS_MOBILE,
};
