import type { TestRunnerConfig } from '@storybook/test-runner';
import type { Page } from 'playwright';
import { DEFAULT_THRESHOLDS, type LighthouseThresholds } from './lighthouse-config';
import { execSync } from 'child_process';
import { resolve } from 'path';

interface LighthouseParams {
  enabled?: boolean;
  thresholds?: LighthouseThresholds;
  printReport?: boolean;
}

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
  try {
    // Run Lighthouse in a separate Node.js process to avoid Jest's module resolution
    const runnerScript = resolve(__dirname, 'lighthouse-runner.mjs');
    const thresholdsJson = JSON.stringify(thresholds);
    
    const command = `node "${runnerScript}" "${url}" '${thresholdsJson}'`;
    const output = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 60000, // 60 second timeout
    });

    const result = JSON.parse(output);

    if (result.error) {
      throw new Error(result.error);
    }

    const { passed, scores, failures } = result;

    // Store results
    lighthouseResults.push({
      story: storyName,
      scores,
      passed,
    });

    // Print report
    console.log(`\n📊 Lighthouse Report for: ${storyName}`);
    console.log('─'.repeat(60));
    
    // Print category scores
    console.log('\n🎯 Category Scores (0-100):');
    const categoryScores = {
      performance: scores.performance,
      accessibility: scores.accessibility,
      'best-practices': scores['best-practices'],
      seo: scores.seo,
    };

    Object.entries(categoryScores).forEach(([category, score]) => {
      const threshold = thresholds[category as keyof LighthouseThresholds] || 0;
      const status = score >= threshold ? '✓' : '✗';
      const color = score >= threshold ? '\x1b[32m' : '\x1b[31m';
      console.log(
        `${color}${status} ${category.padEnd(20)}: ${score}% (threshold: ${threshold}%)\x1b[0m`
      );
    });

    // Print Core Web Vitals
    console.log('\n⚡ Core Web Vitals:');
    const metrics = {
      'first-contentful-paint': scores['first-contentful-paint'],
      'largest-contentful-paint': scores['largest-contentful-paint'],
      'cumulative-layout-shift': scores['cumulative-layout-shift'],
      'total-blocking-time': scores['total-blocking-time'],
      'speed-index': scores['speed-index'],
      interactive: scores.interactive,
    };

    Object.entries(metrics).forEach(([metric, value]) => {
      const threshold = thresholds[metric as keyof LighthouseThresholds];
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
        console.log(
          `${color}${status} ${metric.padEnd(28)}: ${displayValue}${unit} (threshold: ${displayThreshold}${unit})\x1b[0m`
        );
      }
    });

    if (!passed) {
      console.log('\n❌ Failed thresholds:');
      failures.forEach((failure: string) => console.log(`   - ${failure}`));
    } else {
      console.log('\n✅ All thresholds passed!');
    }

    return { passed, scores };
  } catch (error: any) {
    // Try to parse error output as JSON
    if (error.stdout) {
      try {
        const errorData = JSON.parse(error.stdout);
        throw new Error(errorData.error || 'Unknown error');
      } catch {
        // If not JSON, throw original error
      }
    }
    throw error;
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
    //   const { passed } = await runLighthouseAudit(
    //     storyUrl,
    //     thresholds,
    //     storyName
    //   );

    //   // Fail the test if thresholds are not met
    //   if (!passed) {
    //     throw new Error(
    //       `Lighthouse audit failed for ${storyName}. Check the report above for details.`
    //     );
    //   }
    } catch (error) {
      console.error(`\n❌ Error running Lighthouse for ${storyName}:`, error);
      throw error;
    }
  },
};

export default config;
