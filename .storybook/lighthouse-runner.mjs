#!/usr/bin/env node
/**
 * Standalone Lighthouse runner script
 * This runs as a separate Node.js process to avoid Jest's module resolution issues
 */
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { createRequire } from 'module';

// Load CommonJS config in ESM context
const require = createRequire(import.meta.url);
const { 
  CHROME_FLAGS, 
  LIGHTHOUSE_OPTIONS_DESKTOP, 
  LIGHTHOUSE_OPTIONS_MOBILE 
} = require('./lighthouse-config.cjs');

/**
 * Extract metrics from a Lighthouse report
 */
function extractMetrics(lhr) {
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

  // Extract failed audits (top 10)
  const failedAudits = [];
  Object.entries(lhr.audits).forEach(([key, audit]) => {
    if (audit.score !== null && audit.score < 1) {
      failedAudits.push({
        id: key,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
      });
    }
  });
  
  const topFailedAudits = failedAudits
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  return {
    scores,
    metrics,
    allMetrics: { ...scores, ...metrics },
    topFailedAudits,
  };
}

/**
 * Check thresholds for a given set of metrics
 */
function checkThresholds(allMetrics, thresholds) {
  let passed = true;
  const failures = [];

  Object.keys(thresholds).forEach((category) => {
    const threshold = thresholds[category];
    const value = allMetrics[category];

    if (threshold !== undefined) {
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

  return { passed, failures };
}

/**
 * Print report for a specific form factor
 */
function printReport(formFactor, scores, metrics, thresholds, topFailedAudits, passed, failures) {
  const icon = formFactor === 'desktop' ? '🖥️ ' : '📱';
  const title = formFactor.charAt(0).toUpperCase() + formFactor.slice(1);
  
  console.error(`\n${icon} ${title} Lighthouse Report`);
  console.error('─'.repeat(60));
  
  // Print category scores
  console.error('\n🎯 Category Scores (0-100):');
  Object.entries(scores).forEach(([category, score]) => {
    const threshold = thresholds[category] || 0;
    const status = score >= threshold ? '✓' : '✗';
    const color = score >= threshold ? '\x1b[32m' : '\x1b[31m';
    console.error(
      `${color}${status} ${category.padEnd(20)}: ${score}% (threshold: ${threshold}%)\x1b[0m`
    );
  });

  // Print Core Web Vitals
  console.error('\n⚡ Core Web Vitals:');
  Object.entries(metrics).forEach(([metric, value]) => {
    const threshold = thresholds[metric];
    if (threshold !== undefined) {
      const status = value <= threshold ? '✓' : '✗';
      const color = value <= threshold ? '\x1b[32m' : '\x1b[31m';
      const unit = metric === 'cumulative-layout-shift' ? '' : 'ms';
      const displayValue = metric === 'cumulative-layout-shift' 
        ? value.toFixed(3) 
        : Math.round(value);
      const displayThreshold = metric === 'cumulative-layout-shift'
        ? threshold.toFixed(3)
        : threshold;
      console.error(
        `${color}${status} ${metric.padEnd(28)}: ${displayValue}${unit} (threshold: ${displayThreshold}${unit})\x1b[0m`
      );
    }
  });

  if (!passed) {
    console.error('\n❌ Failed thresholds:');
    failures.forEach((failure) => console.error(`   - ${failure}`));
  } else {
    console.error('\n✅ All thresholds passed!');
  }

  // Print failed audits if any
  if (topFailedAudits.length > 0) {
    console.error('\n⚠️  Top Failed Audits:');
    topFailedAudits.forEach((audit, index) => {
      const scorePercent = Math.round(audit.score * 100);
      const color = scorePercent < 50 ? '\x1b[31m' : '\x1b[33m';
      console.error(`${color}${index + 1}. ${audit.title} (${scorePercent}%)\x1b[0m`);
      if (audit.displayValue) {
        console.error(`   ${audit.displayValue}`);
      }
    });
  }
}

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
    // Launch Chrome with shared configuration
    chrome = await chromeLauncher.launch({
      chromeFlags: CHROME_FLAGS,
    });

    // Run Lighthouse for Desktop
    console.error('\n🔍 Running Lighthouse audits...\n');
    const desktopOptions = {
      ...LIGHTHOUSE_OPTIONS_DESKTOP,
      port: chrome.port,
    };

    const desktopResult = await lighthouse(url, desktopOptions);

    if (!desktopResult || !desktopResult.lhr) {
      throw new Error('Lighthouse failed to generate desktop report');
    }

    // Run Lighthouse for Mobile
    const mobileOptions = {
      ...LIGHTHOUSE_OPTIONS_MOBILE,
      port: chrome.port,
    };

    const mobileResult = await lighthouse(url, mobileOptions);

    if (!mobileResult || !mobileResult.lhr) {
      throw new Error('Lighthouse failed to generate mobile report');
    }

    // Extract metrics for both
    const desktopMetrics = extractMetrics(desktopResult.lhr);
    const mobileMetrics = extractMetrics(mobileResult.lhr);

    // Check thresholds for both (use same thresholds for both by default)
    const desktopThresholdCheck = checkThresholds(desktopMetrics.allMetrics, thresholds.desktop || thresholds);
    const mobileThresholdCheck = checkThresholds(mobileMetrics.allMetrics, thresholds.mobile || thresholds);

    // Overall pass/fail (both must pass)
    const overallPassed = desktopThresholdCheck.passed && mobileThresholdCheck.passed;

    // Print reports for both
    printReport(
      'desktop',
      desktopMetrics.scores,
      desktopMetrics.metrics,
      thresholds.desktop || thresholds,
      desktopMetrics.topFailedAudits,
      desktopThresholdCheck.passed,
      desktopThresholdCheck.failures
    );

    printReport(
      'mobile',
      mobileMetrics.scores,
      mobileMetrics.metrics,
      thresholds.mobile || thresholds,
      mobileMetrics.topFailedAudits,
      mobileThresholdCheck.passed,
      mobileThresholdCheck.failures
    );

    // Print overall summary
    console.error('\n' + '═'.repeat(60));
    if (overallPassed) {
      console.error('✅ Overall Result: PASSED (Desktop & Mobile)');
    } else {
      console.error('❌ Overall Result: FAILED');
      if (!desktopThresholdCheck.passed) {
        console.error('   - Desktop: FAILED');
      }
      if (!mobileThresholdCheck.passed) {
        console.error('   - Mobile: FAILED');
      }
    }
    console.error('═'.repeat(60) + '\n');

    // Output combined result as JSON to stdout (for parsing)
    console.log(JSON.stringify({
      passed: overallPassed,
      desktop: {
        passed: desktopThresholdCheck.passed,
        scores: desktopMetrics.allMetrics,
        failures: desktopThresholdCheck.failures,
        audits: desktopMetrics.topFailedAudits,
      },
      mobile: {
        passed: mobileThresholdCheck.passed,
        scores: mobileMetrics.allMetrics,
        failures: mobileThresholdCheck.failures,
        audits: mobileMetrics.topFailedAudits,
      },
      lighthouseVersion: desktopResult.lhr.lighthouseVersion,
      fetchTime: desktopResult.lhr.fetchTime,
      url: url,
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
