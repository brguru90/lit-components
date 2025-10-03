/**
 * Type definitions for Lighthouse integration in Storybook
 * Add these to your story files for better TypeScript support
 */

declare module '@storybook/web-components' {
  interface Parameters {
    /**
     * Lighthouse configuration for this story
     * 
     * @example
     * ```typescript
     * parameters: {
     *   lighthouse: {
     *     thresholds: {
     *       performance: 90,
     *       accessibility: 100,
     *     }
     *   }
     * }
     * ```
     */
    lighthouse?: {
      /**
       * Enable or disable Lighthouse for this story
       * @default true
       */
      enabled?: boolean;

      /**
       * Score thresholds (0-100) that must be met for the story to pass
       * If a score is below the threshold, the test will fail
       */
      thresholds?: {
        /**
         * Performance score threshold (0-100)
         * Measures load performance, interactivity, and visual stability
         * @default 70
         */
        performance?: number;

        /**
         * Accessibility score threshold (0-100)
         * Checks for ARIA labels, color contrast, and keyboard navigation
         * @default 90
         */
        accessibility?: number;

        /**
         * Best practices score threshold (0-100)
         * Checks for HTTPS usage, console errors, and deprecated APIs
         * @default 80
         */
        'best-practices'?: number;

        /**
         * SEO score threshold (0-100)
         * Checks for meta tags, mobile-friendliness, and crawlability
         * @default 70
         */
        seo?: number;
      };

      /**
       * Print detailed Lighthouse report to console
       * @default false
       */
      printReport?: boolean;
    };
  }
}

export {};
