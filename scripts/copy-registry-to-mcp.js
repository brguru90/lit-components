#!/usr/bin/env node

/**
 * Script to copy component-registry.json from storybook-static to MCP data directory
 * This is used at build time to embed the registry in the Python package
 */

const fs = require('fs');
const path = require('path');

// Define paths
const sourceFile = path.join(__dirname, '..', 'storybook-static', 'stories_doc', 'component-registry.json');
const targetDir = path.join(__dirname, '..', 'mcp', 'src', 'lit_components_mcp', 'data');
const targetFile = path.join(targetDir, 'component-registry.json');

console.log('📦 Copying component-registry.json to MCP data directory...');
console.log(`Source: ${sourceFile}`);
console.log(`Target: ${targetFile}`);

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
    console.error(`❌ Error: Source file not found at ${sourceFile}`);
    console.error('💡 Make sure to run "npm run build-storybook" first to generate the component registry.');
    process.exit(1);
}

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
    console.log(`📁 Creating target directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy the file
try {
    fs.copyFileSync(sourceFile, targetFile);
    
    // Get file size
    const stats = fs.statSync(targetFile);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ Successfully copied component-registry.json (${fileSizeInKB} KB)`);
    console.log(`📍 File location: ${targetFile}`);
} catch (error) {
    console.error(`❌ Error copying file: ${error.message}`);
    process.exit(1);
}
