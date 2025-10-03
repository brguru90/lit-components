import { execSync } from 'child_process';
import { resolve } from 'path';
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

// Import from CommonJS file for Jest compatibility
const { DEFAULT_THRESHOLDS } = require('./lighthouse-config.cjs');
import {LighthouseThresholds} from './lighthouse-config';

export interface LighthouseParams {
  enabled?: boolean;
  thresholds?: LighthouseThresholds;
  printReport?: boolean;
}

interface CacheEntry {
  hash: string;
  results: {
    [storyId: string]: {
      desktop: any;
      mobile: any;
    };
  };
  last_run: string;
  time_to_execute: number;
}

interface CacheData {
  [filePath: string]: CacheEntry;
}

const CACHE_FILE = resolve(__dirname, '../.lighthouse-cache.json');

// Calculate hash of file content
function calculateFileHash(filePath: string): string {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return createHash('sha256').update(content).digest('hex');
  } catch (error) {
    console.warn(`⚠️  Could not read file for hashing: ${filePath}`);
    return '';
  }
}

// Load cache from disk
function loadCache(): CacheData {
  try {
    if (existsSync(CACHE_FILE)) {
      const content = readFileSync(CACHE_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('⚠️  Could not load cache file, starting fresh');
  }
  return {};
}

// Save cache to disk
function saveCache(cache: CacheData): void {
  try {
    const dir = resolve(__dirname, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.warn('⚠️  Could not save cache file:', error);
  }
}

// Check if cached result is valid
function getCachedResult(
  storyFilePath: string,
  storyId: string
): { desktop: any; mobile: any } | null {
  const cache = loadCache();
  const entry = cache[storyFilePath];
  
  if (!entry) {
    return null;
  }
  
  const currentHash = calculateFileHash(storyFilePath);
  
  if (entry.hash !== currentHash) {
    console.log(`🔄 File hash changed for ${storyFilePath}, cache invalid`);
    return null;
  }
  
  const result = entry.results[storyId];
  if (!result) {
    return null;
  }
  
  console.log(`✨ Using cached result for story ${storyId} (last run: ${entry.last_run})`);
  return result;
}

// Save result to cache
function saveCachedResult(
  storyFilePath: string,
  storyId: string,
  result: { desktop: any; mobile: any },
  executionTime: number
): void {
  const cache = loadCache();
  const currentHash = calculateFileHash(storyFilePath);
  
  if (!cache[storyFilePath] || cache[storyFilePath].hash !== currentHash) {
    // New file or hash changed, create new entry
    cache[storyFilePath] = {
      hash: currentHash,
      results: {},
      last_run: new Date().toISOString(),
      time_to_execute: executionTime,
    };
  }
  
  // Update the specific story result
  cache[storyFilePath].results[storyId] = result;
  cache[storyFilePath].last_run = new Date().toISOString();
  cache[storyFilePath].time_to_execute = executionTime;
  
  saveCache(cache);
}

// Store results for summary report
const lighthouseResults: Array<{
  story: string;
  scores: Record<string, number>;
  passed: boolean;
}> = [];

async function runLighthouseAudit(
  url: string,
  storyName: string,
  lighthouseParams: LighthouseParams,
  storyFilePath?: string,
  storyId?: string
): Promise<{ passed: boolean; scores: Record<string, number> }> {
  // Skip if Lighthouse is explicitly disabled
  if (lighthouseParams.enabled === false) {
    return { passed: true, scores: {} };
  }

  // Check cache if we have story file path and ID
  if (storyFilePath && storyId) {
    const cachedResult = getCachedResult(storyFilePath, storyId);
    if (cachedResult) {
      // Use cached desktop result (you can modify to use mobile if needed)
      const { passed, scores } = cachedResult.desktop;
      
      // Store cached results for summary
      lighthouseResults.push({
        story: storyName,
        scores,
        passed,
      });
      
      console.log(`📊 Lighthouse Report for: ${storyName} (from cache)`);
      return { passed, scores };
    }
  }

  // Use custom thresholds or defaults
  const thresholds = {
    ...DEFAULT_THRESHOLDS,
    ...lighthouseParams.thresholds,
  };

  const startTime = Date.now();
  
  try {
    // Run Lighthouse in a separate Node.js process to avoid Jest's module resolution
    const runnerScript = resolve(__dirname, 'lighthouse-runner.mjs');
    const thresholdsJson = JSON.stringify(thresholds);
    
    console.log(`\n📊 Lighthouse Report for: ${storyName}`);
    
    const command = `node "${runnerScript}" "${url}" '${thresholdsJson}'`;
    const output = execSync(command, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      timeout: 60000, // 60 second timeout
      stdio: ['pipe', 'pipe', 'inherit'], // Inherit stderr to show reports
    });

    const result = JSON.parse(output);

    if (result.error) {
      throw new Error(result.error);
    }

    const { passed, scores } = result;

    // Store results
    lighthouseResults.push({
      story: storyName,
      scores,
      passed,
    });

    // Cache the result if we have story file path and ID
    if (storyFilePath && storyId) {
      const executionTime = (Date.now() - startTime) / 1000; // Convert to seconds
      const cacheData = {
        desktop: result,
        mobile: result, // For now, using same result for both. Modify if you run separate mobile tests
      };
      saveCachedResult(storyFilePath, storyId, cacheData, executionTime);
      console.log(`💾 Cached result for ${storyId} (took ${executionTime.toFixed(2)}s)`);
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

export {
    runLighthouseAudit
}