#!/usr/bin/env node

/**
 * Lighthouse API Server
 * 
 * Provides an HTTP API endpoint for running Lighthouse audits
 * Used by the Storybook Lighthouse addon panel
 * 
 * Usage:
 *   node scripts/lighthouse-server.js
 *   OR
 *   npm run lighthouse:api
 */

import express from 'express';
import * as chromeLauncher from 'chrome-launcher';
import cors from 'cors';
import lighthouse from 'lighthouse';

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
    // Launch Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox'],
    });

    // Configure Lighthouse options
    const lighthouseOptions = {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
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

    console.log(`✅ Audit complete - Performance: ${results.scores.performance}, Accessibility: ${results.scores.accessibility}`);
    
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
 */
app.post('/api/lighthouse', async (req, res) => {
  const { url, options = {} } = req.body;

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

  // Check cache
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  if (auditCache.has(cacheKey)) {
    const cachedResult = auditCache.get(cacheKey);
    const age = Date.now() - new Date(cachedResult.timestamp).getTime();
    
    // Return cached result if less than 5 minutes old
    if (age < 5 * 60 * 1000) {
      console.log(`📦 Returning cached result for: ${url} (age: ${Math.round(age / 1000)}s)`);
      return res.json({
        ...cachedResult,
        cached: true,
        cacheAge: age,
      });
    }
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
 * GET /api/lighthouse/cache
 * View cached audits
 */
app.get('/api/lighthouse/cache', (req, res) => {
  const cache = Array.from(auditCache.entries()).map(([key, value]) => ({
    url: value.url,
    timestamp: value.timestamp,
    scores: value.scores,
  }));
  
  res.json({
    size: auditCache.size,
    maxSize: MAX_CACHE_SIZE,
    audits: cache,
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
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     🔦 Lighthouse API Server                      ║');
  console.log('╚════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📡 Server running at: http://localhost:${PORT}`);
  console.log('');
  console.log('📋 Available endpoints:');
  console.log(`   POST   http://localhost:${PORT}/api/lighthouse`);
  console.log(`   GET    http://localhost:${PORT}/api/lighthouse/health`);
  console.log(`   GET    http://localhost:${PORT}/api/lighthouse/cache`);
  console.log(`   DELETE http://localhost:${PORT}/api/lighthouse/cache`);
  console.log('');
  console.log('💡 Usage:');
  console.log('   curl -X POST http://localhost:' + PORT + '/api/lighthouse \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"url":"http://localhost:6006"}\'');
  console.log('');
  console.log('🔗 For use with Storybook Lighthouse addon');
  console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down Lighthouse API server...');
  process.exit(0);
});
