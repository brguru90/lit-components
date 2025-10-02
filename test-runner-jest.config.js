import { getJestConfig } from '@storybook/test-runner'

// The default Jest configuration comes from @storybook/test-runner
const testRunnerConfig = getJestConfig()

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
export default {
  ...testRunnerConfig,
  /** Add your own overrides below, and make sure
   *  to merge testRunnerConfig properties with your own
   * @see https://jestjs.io/docs/configuration
   */
  testTimeout: 60000,
  maxConcurrency: 1,
  // Force workers to exit gracefully and prevent resource leaks
  forceExit: true,
  // Ensure workers cleanup properly
  workerIdleMemoryLimit: '512MB'
}