#!/usr/bin/env node
/**
 * Standalone Lighthouse runner script
 * This runs as a separate Node.js process to avoid Jest's module resolution issues
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

async function runLighthouse() {
  const url = process.argv[2];
  const thresholdsJson = process.argv[3];
  
  if (!url) {
    console.error(JSON.stringify({ error: 'URL is required' }));
    process.exit(1);
  }

  const thresholds = thresholdsJson ? JSON.parse(thresholdsJson) : {};
  let chrome = null;

  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',                          // Run without UI
        '--incognito',                         // Clean slate: no extensions, cache, cookies, or sync
        '--no-sandbox',                        // Required for Docker/CI environments
        '--disable-dev-shm-usage',            // Prevent shared memory issues in containers
        '--disable-gpu',                       // Disable GPU hardware acceleration
        '--window-size=1920,1080',            // Consistent viewport size
      ],
    });

    // Run Lighthouse
    const options = {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    const runnerResult = await lighthouse(url, options);

    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('Lighthouse failed to generate a report');
    }

    const { lhr } = runnerResult;

    // Extract category scores (0-100 scale)
    const scores = {
      performance: Math.round((lhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
      'best-practices': Math.round((lhr.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((lhr.categories.seo?.score || 0) * 100),
    };

    // Extract Core Web Vitals metrics (actual values in ms or unitless)
    const metrics = {
      'first-contentful-paint': lhr.audits['first-contentful-paint']?.numericValue || 0,
      'largest-contentful-paint': lhr.audits['largest-contentful-paint']?.numericValue || 0,
      'cumulative-layout-shift': lhr.audits['cumulative-layout-shift']?.numericValue || 0,
      'total-blocking-time': lhr.audits['total-blocking-time']?.numericValue || 0,
      'speed-index': lhr.audits['speed-index']?.numericValue || 0,
      interactive: lhr.audits['interactive']?.numericValue || 0,
    };

    // Combine scores and metrics
    const allMetrics = { ...scores, ...metrics };

    // Check thresholds
    let passed = true;
    const failures = [];

    Object.keys(thresholds).forEach((category) => {
      const threshold = thresholds[category];
      const value = allMetrics[category];

      if (threshold !== undefined) {
        // For category scores, check if value is below threshold (higher is better)
        // For metrics, check if value is above threshold (lower is better)
        const isCategoryScore = ['performance', 'accessibility', 'best-practices', 'seo'].includes(category);
        const thresholdFailed = isCategoryScore ? value < threshold : value > threshold;

        if (thresholdFailed) {
          passed = false;
          const displayValue = category.includes('shift') 
            ? value.toFixed(3) 
            : Math.round(value);
          const comparison = isCategoryScore ? '<' : '>';
          failures.push(`${category}: ${displayValue} ${comparison} ${threshold}`);
        }
      }
    });

    // Output result as JSON
    console.log(JSON.stringify({
      passed,
      scores: allMetrics,
      failures,
      thresholds,
    }));

  } catch (error) {
    console.error(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }));
    process.exit(1);
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

runLighthouse();
