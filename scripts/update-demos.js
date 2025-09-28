#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Find the latest vg-*.tgz file in the root directory
 */
function findLatestTarFile() {
  const rootDir = path.resolve(__dirname, '..');
  const files = fs.readdirSync(rootDir);
  
  // Filter for vg-*.tgz files
  const tarFiles = files
    .filter(file => file.match(/^vg-\d+\.\d+\.\d+\.tgz$/))
    .sort((a, b) => {
      // Extract version numbers and compare
      const versionA = a.match(/vg-(\d+)\.(\d+)\.(\d+)\.tgz$/);
      const versionB = b.match(/vg-(\d+)\.(\d+)\.(\d+)\.tgz$/);
      
      if (!versionA || !versionB) return 0;
      
      const [, majorA, minorA, patchA] = versionA.map(Number);
      const [, majorB, minorB, patchB] = versionB.map(Number);
      
      // Compare major.minor.patch
      if (majorA !== majorB) return majorB - majorA;
      if (minorA !== minorB) return minorB - minorA;
      return patchB - patchA;
    });
  
  if (tarFiles.length === 0) {
    throw new Error('No vg-*.tgz files found in root directory');
  }
  
  return tarFiles[0]; // Return the latest version
}

/**
 * Update package.json file with new vg dependency
 */
function updatePackageJson(packageJsonPath, latestTarFile) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Update the vg dependency if it exists
    if (packageJson.dependencies && packageJson.dependencies.vg) {
      const oldDependency = packageJson.dependencies.vg;
      packageJson.dependencies.vg = `file:../../${latestTarFile}`;
      
      // Write back to file with proper formatting
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
      
      console.log(`✓ Updated ${packageJsonPath}`);
      console.log(`  ${oldDependency} → file:../../${latestTarFile}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error updating ${packageJsonPath}:`, error.message);
    return false;
  }
}

/**
 * Find all demo package.json files
 */
function findDemoPackageJsonFiles() {
  const demoDir = path.resolve(__dirname, '..', 'demo');
  const packageJsonFiles = [];
  
  function searchDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && item !== 'node_modules') {
        searchDirectory(itemPath);
      } else if (item === 'package.json') {
        packageJsonFiles.push(itemPath);
      }
    }
  }
  
  if (fs.existsSync(demoDir)) {
    searchDirectory(demoDir);
  }
  
  return packageJsonFiles;
}

/**
 * Run npm install in a directory
 */
function runNpmInstall(dir) {
  try {
    console.log(`Running npm install in ${dir}...`);
    execSync('npm install', { 
      cwd: dir, 
      stdio: 'inherit',
      timeout: 60000 // 60 second timeout
    });
    return true;
  } catch (error) {
    console.error(`Failed to run npm install in ${dir}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Finding latest vg tar file...');
  
  try {
    const latestTarFile = findLatestTarFile();
    console.log(`📦 Latest tar file: ${latestTarFile}`);
    
    const packageJsonFiles = findDemoPackageJsonFiles();
    console.log(`\n📝 Found ${packageJsonFiles.length} package.json files in demo directories`);
    
    let updatedCount = 0;
    const updatedDirs = new Set();
    
    for (const packageJsonPath of packageJsonFiles) {
      if (updatePackageJson(packageJsonPath, latestTarFile)) {
        updatedCount++;
        // Track the directory for npm install
        updatedDirs.add(path.dirname(packageJsonPath));
      }
    }
    
    if (updatedCount > 0) {
      console.log(`\n✅ Updated ${updatedCount} package.json files`);
      
      // Run npm install in each updated directory
      console.log('\n📦 Running npm install in updated directories...');
      for (const dir of updatedDirs) {
        runNpmInstall(dir);
      }
      
      console.log('\n🎉 All demo dependencies have been updated to the latest version!');
    } else {
      console.log('\n💡 No package.json files needed updating');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { findLatestTarFile, updatePackageJson, findDemoPackageJsonFiles };