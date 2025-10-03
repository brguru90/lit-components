import type { TestRunnerConfig } from '@storybook/test-runner';
import type { Page } from 'playwright';
import {runLighthouseAudit, type LighthouseParams} from './utils/test-runner-utils';

const config: TestRunnerConfig = {
  // Optional: Setup before all tests
  setup() {
    console.log('\n🚀 Starting Lighthouse audits for Storybook stories...\n');
  },

  // Run after each story is rendered
  async postVisit(page: Page, context: any) {
    const lighthouseParams: LighthouseParams =
      context.parameters?.lighthouse || {};

    // Get the story URL
    const storyUrl = page.url();
    const storyName = context.title;
    const storyId = context.id;

    // Fetch story file path from index.json
    let storyFilePath: string | undefined;
    try {
      const indexUrl = new URL('/index.json', page.url()).href;
      const resp = await page.request.get(indexUrl);
      const indexJson = await resp.json();
      
      // Get the import path from the index.json
      const importPath = indexJson?.['entries']?.[storyId]?.importPath;
      if (importPath) {
        // Convert relative path to absolute path
        const { resolve } = await import('path');
        storyFilePath = resolve(process.cwd(), importPath);
      }
    } catch (error) {
      console.warn(`⚠️  Could not fetch story file path for ${storyId}:`, error);
    }

    try {
      const { passed } = await runLighthouseAudit(
        storyUrl,
        storyName,
        lighthouseParams,
        storyFilePath,
        storyId
      );

      // Fail the test if thresholds are not met
      // if (!passed) {
      //   throw new Error(
      //     `Lighthouse audit failed for ${storyName}. Check the report above for details.`
      //   );
      // }
    } catch (error) {
      console.error(`\n❌ Error running Lighthouse for ${storyName}:`, error);
      throw error;
    }
  },
};

export default config;
