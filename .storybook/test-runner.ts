import type { TestRunnerConfig } from '@storybook/test-runner';
import type { Page } from 'playwright';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

interface LighthouseThresholds {
  performance?: number;
  accessibility?: number;
  'best-practices'?: number;
  seo?: number;
}

interface LighthouseParams {
  enabled?: boolean;
  thresholds?: LighthouseThresholds;
  printReport?: boolean;
}

const DEFAULT_THRESHOLDS: LighthouseThresholds = {
  performance: 70,
  accessibility: 90,
  'best-practices': 80,
  seo: 70,
};

// Store results for summary report
const lighthouseResults: Array<{
  story: string;
  scores: Record<string, number>;
  passed: boolean;
}> = [];

async function runLighthouseAudit(
  url: string,
  thresholds: LighthouseThresholds,
  storyName: string
): Promise<{ passed: boolean; scores: Record<string, number> }> {
  let chrome: chromeLauncher.LaunchedChrome | null = null;

  try {
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    // Run Lighthouse
    const options = {
      logLevel: 'error' as const,
      output: 'json' as const,
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    const runnerResult = await lighthouse(url, options);

    if (!runnerResult || !runnerResult.lhr) {
      throw new Error('Lighthouse failed to generate a report');
    }

    const { lhr } = runnerResult;

    // Extract scores
    const scores: Record<string, number> = {
      performance: Math.round((lhr.categories.performance?.score || 0) * 100),
      accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
      'best-practices': Math.round((lhr.categories['best-practices']?.score || 0) * 100),
      seo: Math.round((lhr.categories.seo?.score || 0) * 100),
    };

    // Check thresholds
    let passed = true;
    const failures: string[] = [];

    Object.keys(thresholds).forEach((category) => {
      const threshold = thresholds[category as keyof LighthouseThresholds];
      const score = scores[category];

      if (threshold !== undefined && score < threshold) {
        passed = false;
        failures.push(`${category}: ${score} < ${threshold}`);
      }
    });

    // Store results
    lighthouseResults.push({
      story: storyName,
      scores,
      passed,
    });

    // Print report
    console.log(`\n📊 Lighthouse Report for: ${storyName}`);
    console.log('─'.repeat(60));
    Object.entries(scores).forEach(([category, score]) => {
      const threshold = thresholds[category as keyof LighthouseThresholds] || 0;
      const status = score >= threshold ? '✓' : '✗';
      const color = score >= threshold ? '\x1b[32m' : '\x1b[31m';
      console.log(
        `${color}${status} ${category.padEnd(20)}: ${score}% (threshold: ${threshold}%)\x1b[0m`
      );
    });

    if (!passed) {
      console.log('\n❌ Failed thresholds:');
      failures.forEach((failure) => console.log(`   - ${failure}`));
    } else {
      console.log('\n✅ All thresholds passed!');
    }

    return { passed, scores };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

const config: TestRunnerConfig = {
  // Optional: Setup before all tests
  setup() {
    console.log('\n🚀 Starting Lighthouse audits for Storybook stories...\n');
  },

  // Run after each story is rendered
  async postVisit(page: Page, context: any) {
    const lighthouseParams: LighthouseParams =
      context.parameters?.lighthouse || {};

    // Skip if Lighthouse is explicitly disabled
    if (lighthouseParams.enabled === false) {
      return;
    }

    // Get the story URL
    const storyUrl = page.url();
    const storyName = context.title;

    // Use custom thresholds or defaults
    const thresholds = {
      ...DEFAULT_THRESHOLDS,
      ...lighthouseParams.thresholds,
    };

    try {
      const { passed } = await runLighthouseAudit(
        storyUrl,
        thresholds,
        storyName
      );

      // Fail the test if thresholds are not met
      if (!passed) {
        throw new Error(
          `Lighthouse audit failed for ${storyName}. Check the report above for details.`
        );
      }
    } catch (error) {
      console.error(`\n❌ Error running Lighthouse for ${storyName}:`, error);
      throw error;
    }
  },

  // Optional: Cleanup and print summary after all tests
  async teardown() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 LIGHTHOUSE AUDIT SUMMARY');
    console.log('='.repeat(60));

    const passed = lighthouseResults.filter((r) => r.passed).length;
    const failed = lighthouseResults.filter((r) => !r.passed).length;

    console.log(`\nTotal Stories: ${lighthouseResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log('\n❌ Failed Stories:');
      lighthouseResults
        .filter((r) => !r.passed)
        .forEach((result) => {
          console.log(`\n  - ${result.story}`);
          Object.entries(result.scores).forEach(([category, score]) => {
            console.log(`    ${category}: ${score}%`);
          });
        });
    }

    console.log('\n' + '='.repeat(60) + '\n');
  },
};

export default config;
