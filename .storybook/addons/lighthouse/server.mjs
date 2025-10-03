#!/usr/bin/env node

/**
 * Lighthouse API Server - Auto-start with Storybook
 * 
 * This server starts automatically when Storybook starts
 * It runs in the background and provides Lighthouse auditing
 */

import express from 'express';
import * as chromeLauncher from 'chrome-launcher';
import cors from 'cors';
import lighthouse from 'lighthouse';
import { 
  CHROME_FLAGS, 
  LIGHTHOUSE_OPTIONS_DESKTOP,
  LIGHTHOUSE_OPTIONS_MOBILE 
} from '../../lighthouse/lighthouse-config.cjs';

let server;

export async function startLighthouseServer() {
  // Check if server is already running
  if (server) {
    console.log('🔦 Lighthouse API server already running');
    return;
  }

  const app = express();
  const PORT = process.env.LIGHTHOUSE_API_PORT || 9002;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Store recent audits (in-memory cache)
  const auditCache = new Map();
  const MAX_CACHE_SIZE = 50;

  /**
   * Run Lighthouse audit on a URL
   */
  async function runLighthouseAudit(url, options = {}) {
    console.log(`🔦 Running Lighthouse audit for: ${url}`);
    
    let chrome;
    
    try {
      // Launch Chrome with shared configuration
      chrome = await chromeLauncher.launch({
        chromeFlags: CHROME_FLAGS,
      });

      // Configure Lighthouse with shared options and port
      const lighthouseOptions = {
        ...LIGHTHOUSE_OPTIONS,
        port: chrome.port,
        ...options,
      };

      // Run Lighthouse
      const runnerResult = await lighthouse(url, lighthouseOptions);
      
      if (!runnerResult) {
        throw new Error('Lighthouse returned no results');
      }

      const { lhr } = runnerResult;

      // Extract key metrics
      const results = {
        scores: {
          performance: Math.round((lhr.categories.performance?.score || 0) * 100),
          accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
          'best-practices': Math.round((lhr.categories['best-practices']?.score || 0) * 100),
          seo: Math.round((lhr.categories.seo?.score || 0) * 100),
        },
        metrics: extractMetrics(lhr),
        audits: extractFailedAudits(lhr),
        timestamp: new Date().toISOString(),
        url: url,
        lighthouseVersion: lhr.lighthouseVersion,
        fetchTime: lhr.fetchTime,
      };

      console.log(`✅ Audit complete - Performance: ${results.scores.performance}`);
      
      return results;
    } catch (error) {
      console.error('❌ Lighthouse audit failed:', error.message);
      throw error;
    } finally {
      if (chrome) {
        await chrome.kill();
      }
    }
  }

  /**
   * Extract performance metrics from Lighthouse results
   */
  function extractMetrics(lhr) {
    const metrics = {};
    
    const metricsToExtract = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'cumulative-layout-shift',
      'total-blocking-time',
      'speed-index',
      'interactive',
    ];

    metricsToExtract.forEach(metricKey => {
      const audit = lhr.audits[metricKey];
      if (audit && audit.numericValue !== undefined) {
        metrics[metricKey] = metricKey === 'cumulative-layout-shift' 
          ? audit.numericValue.toFixed(3)
          : Math.round(audit.numericValue);
      }
    });

    return metrics;
  }

  /**
   * Extract failed audits from Lighthouse results
   */
  function extractFailedAudits(lhr) {
    const failedAudits = [];
    
    Object.entries(lhr.audits).forEach(([key, audit]) => {
      if (audit.score !== null && audit.score < 1) {
        failedAudits.push({
          id: key,
          title: audit.title,
          description: audit.description,
          score: audit.score,
          passed: false,
          displayValue: audit.displayValue,
        });
      }
    });

    // Sort by score (lowest first) and limit to top 10 failures
    return failedAudits
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);
  }

  /**
   * POST /api/lighthouse
   * Run a Lighthouse audit
   * 
   * Body parameters:
   * - url: URL to audit (required)
   * - options: Lighthouse options (optional)
   * - skipCache: Set to true to bypass cache and force fresh audit (optional, default: false)
   */
  app.post('/api/lighthouse', async (req, res) => {
    const { url, options = {}, skipCache = false } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a URL to audit',
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid URL',
      });
    }

    // Check cache (unless skipCache is true)
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    if (!skipCache && auditCache.has(cacheKey)) {
      const cachedResult = auditCache.get(cacheKey);
      const age = Date.now() - new Date(cachedResult.timestamp).getTime();
      
      // Return cached result if less than 5 minutes old
      if (age < 5 * 60 * 1000) {
        console.log(`📦 Cached result (${Math.round(age / 1000)}s old)`);
        return res.json({
          ...cachedResult,
          cached: true,
          cacheAge: age,
        });
      }
    }
    
    // Log if cache was skipped
    if (skipCache) {
      console.log('🔄 Skipping cache - running fresh audit');
    }

    try {
      // Run audit
      const results = await runLighthouseAudit(url, options);
      
      // Cache results
      auditCache.set(cacheKey, results);
      
      // Limit cache size
      if (auditCache.size > MAX_CACHE_SIZE) {
        const firstKey = auditCache.keys().next().value;
        auditCache.delete(firstKey);
      }
      
      res.json(results);
    } catch (error) {
      console.error('Error running Lighthouse:', error);
      res.status(500).json({
        error: 'Audit failed',
        message: error.message,
        scores: {
          performance: 0,
          accessibility: 0,
          'best-practices': 0,
          seo: 0,
        },
      });
    }
  });

  /**
   * POST /api/lighthouse/dual
   * Run BOTH desktop and mobile Lighthouse audits efficiently
   * 
   * NOTE: Lighthouse MUST be called twice - once for desktop, once for mobile.
   * This is a fundamental limitation of Lighthouse's architecture.
   * However, we optimize by reusing the same Chrome instance for both runs.
   * 
   * Body parameters:
   * - url: URL to audit (required)
   * - skipCache: Set to true to bypass cache (optional, default: false)
   */
  app.post('/api/lighthouse/dual', async (req, res) => {
    const { url, skipCache = false } = req.body;

    if (!url) {
      return res.status(400).json({
        error: 'URL is required',
        message: 'Please provide a URL to audit',
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid URL',
      });
    }

    // Check cache for BOTH desktop and mobile
    const desktopCacheKey = `${url}_desktop`;
    const mobileCacheKey = `${url}_mobile`;
    
    if (!skipCache && auditCache.has(desktopCacheKey) && auditCache.has(mobileCacheKey)) {
      const desktopCached = auditCache.get(desktopCacheKey);
      const mobileCached = auditCache.get(mobileCacheKey);
      const desktopAge = Date.now() - new Date(desktopCached.timestamp).getTime();
      const mobileAge = Date.now() - new Date(mobileCached.timestamp).getTime();
      
      // Return cached if both are less than 5 minutes old
      if (desktopAge < 5 * 60 * 1000 && mobileAge < 5 * 60 * 1000) {
        console.log(`📦 Dual cached results (${Math.round(Math.max(desktopAge, mobileAge) / 1000)}s old)`);
        return res.json({
          desktop: { ...desktopCached, cached: true, cacheAge: desktopAge },
          mobile: { ...mobileCached, cached: true, cacheAge: mobileAge },
        });
      }
    }
    
    if (skipCache) {
      console.log('🔄 Skipping cache - running fresh dual audit');
    }

    let chrome;
    
    try {
      // Launch Chrome ONCE - we'll reuse it for both audits
      console.log(`🔦 Running DUAL audit (desktop + mobile) for: ${url}`);
      console.log('⏱️  This will run TWO audits sequentially using the same Chrome instance...');
      
      chrome = await chromeLauncher.launch({
        chromeFlags: CHROME_FLAGS,
      });

      // Run Desktop Audit
      console.log('\n📱 [1/2] Running DESKTOP audit...');
      const desktopOptions = {
        ...LIGHTHOUSE_OPTIONS_DESKTOP,
        port: chrome.port,
      };
      const desktopResult = await lighthouse(url, desktopOptions);
      
      if (!desktopResult || !desktopResult.lhr) {
        throw new Error('Desktop audit failed');
      }

      const desktopData = {
        formFactor: 'desktop',
        scores: {
          performance: Math.round((desktopResult.lhr.categories.performance?.score || 0) * 100),
          accessibility: Math.round((desktopResult.lhr.categories.accessibility?.score || 0) * 100),
          'best-practices': Math.round((desktopResult.lhr.categories['best-practices']?.score || 0) * 100),
          seo: Math.round((desktopResult.lhr.categories.seo?.score || 0) * 100),
        },
        metrics: extractMetrics(desktopResult.lhr),
        audits: extractFailedAudits(desktopResult.lhr),
        timestamp: new Date().toISOString(),
        url: url,
        lighthouseVersion: desktopResult.lhr.lighthouseVersion,
      };

      console.log(`✅ Desktop audit complete - Performance: ${desktopData.scores.performance}`);

      // Run Mobile Audit (reusing same Chrome instance)
      console.log('\n📱 [2/2] Running MOBILE audit...');
      const mobileOptions = {
        ...LIGHTHOUSE_OPTIONS_MOBILE,
        port: chrome.port,
      };
      const mobileResult = await lighthouse(url, mobileOptions);
      
      if (!mobileResult || !mobileResult.lhr) {
        throw new Error('Mobile audit failed');
      }

      const mobileData = {
        formFactor: 'mobile',
        scores: {
          performance: Math.round((mobileResult.lhr.categories.performance?.score || 0) * 100),
          accessibility: Math.round((mobileResult.lhr.categories.accessibility?.score || 0) * 100),
          'best-practices': Math.round((mobileResult.lhr.categories['best-practices']?.score || 0) * 100),
          seo: Math.round((mobileResult.lhr.categories.seo?.score || 0) * 100),
        },
        metrics: extractMetrics(mobileResult.lhr),
        audits: extractFailedAudits(mobileResult.lhr),
        timestamp: new Date().toISOString(),
        url: url,
        lighthouseVersion: mobileResult.lhr.lighthouseVersion,
      };

      console.log(`✅ Mobile audit complete - Performance: ${mobileData.scores.performance}`);
      console.log('\n✅ DUAL AUDIT COMPLETE\n');

      // Cache both results
      auditCache.set(desktopCacheKey, desktopData);
      auditCache.set(mobileCacheKey, mobileData);
      
      // Limit cache size
      if (auditCache.size > MAX_CACHE_SIZE) {
        const firstKey = auditCache.keys().next().value;
        auditCache.delete(firstKey);
      }
      
      // Return combined results
      res.json({
        desktop: desktopData,
        mobile: mobileData,
      });
      
    } catch (error) {
      console.error('❌ Dual audit failed:', error.message);
      res.status(500).json({
        error: 'Dual audit failed',
        message: error.message,
      });
    } finally {
      // Cleanup: Kill Chrome
      if (chrome) {
        await chrome.kill();
      }
    }
  });

  /**
   * GET /api/lighthouse/cache/:url
   * Get cached audit result for a specific URL without running audit
   */
  app.get('/api/lighthouse/cache/:encodedUrl', (req, res) => {
    const url = decodeURIComponent(req.params.encodedUrl);
    const options = req.query.options ? JSON.parse(req.query.options) : {};
    
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    if (auditCache.has(cacheKey)) {
      const cachedResult = auditCache.get(cacheKey);
      const age = Date.now() - new Date(cachedResult.timestamp).getTime();
      
      // Return cached result if less than 5 minutes old
      if (age < 5 * 60 * 1000) {
        console.log(`📦 Returning cached result for ${url} (${Math.round(age / 1000)}s old)`);
        return res.json({
          ...cachedResult,
          cached: true,
          cacheAge: age,
        });
      } else {
        console.log(`⏰ Cache expired for ${url} (${Math.round(age / 1000)}s old)`);
        return res.status(404).json({
          error: 'Cache expired',
          message: 'Cached result is older than 5 minutes',
        });
      }
    }
    
    console.log(`❌ No cache found for ${url}`);
    res.status(404).json({
      error: 'Not found',
      message: 'No cached result for this URL',
    });
  });

  /**
   * GET /api/lighthouse/health
   * Health check endpoint
   */
  app.get('/api/lighthouse/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'lighthouse-api',
      version: '1.0.0',
      cacheSize: auditCache.size,
    });
  });

  /**
   * DELETE /api/lighthouse/cache
   * Clear cache
   */
  app.delete('/api/lighthouse/cache', (req, res) => {
    const previousSize = auditCache.size;
    auditCache.clear();
    
    res.json({
      message: 'Cache cleared',
      previousSize,
      currentSize: auditCache.size,
    });
  });

  // Start server
  return new Promise((resolve, reject) => {
    server = app.listen(PORT, () => {
      console.log('');
      console.log('🔦 Lighthouse API server started at http://localhost:' + PORT);
      console.log('');
      resolve(server);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${PORT} already in use - Lighthouse API may already be running`);
        resolve(null);
      } else {
        reject(error);
      }
    });
  });
}

export async function stopLighthouseServer() {
  if (server) {
    return new Promise((resolve) => {
      server.close(() => {
        console.log('👋 Lighthouse API server stopped');
        server = null;
        resolve();
      });
    });
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await stopLighthouseServer();
  process.exit(0);
});

// Auto-start when imported (for Storybook integration)
if (process.env.STORYBOOK_LIGHTHOUSE_AUTO_START !== 'false') {
  startLighthouseServer().catch(console.error);
}
