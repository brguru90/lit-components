#!/usr/bin/env node
/**
 * Cross-verification script for docs.json
 * Compares documentation with source definitions and custom-elements.json
 */

import fs from 'fs';
import path from 'path';

// Load files
const docsJson = JSON.parse(fs.readFileSync('storybook-static/stories_doc/docs.json', 'utf8'));
const customElements = JSON.parse(fs.readFileSync('dist/custom-elements.json', 'utf8'));

// Component mapping
const components = {
  'vg-input': 'src/components/Input/index.ts',
  'vg-button': 'src/components/Button/index.ts',
  'vg-dropdown': 'src/components/Dropdown/index.ts',
  'vg-card': 'src/components/Card/index.ts',
  'vg-theme-provider': 'src/components/ThemeProvider/theme-provider.ts'
};

// Extract component info from custom-elements.json
function getCustomElementInfo(tagName) {
  for (const module of customElements.modules) {
    for (const declaration of module.declarations || []) {
      if (declaration.tagName === tagName) {
        return {
          attributes: (declaration.attributes || []).map(a => a.name),
          slots: (declaration.slots || []).map(s => s.name),
          events: (declaration.events || []).map(e => e.name),
          members: declaration.members || []
        };
      }
    }
  }
  return null;
}

// Get first story for each component
function getFirstStoryForComponent(tagName) {
  for (const [storyId, story] of Object.entries(docsJson)) {
    if (story.component_tag === tagName) {
      return { storyId, story };
    }
  }
  return null;
}

// Main verification
console.log('📋 Documentation Cross-Verification Report\n');
console.log('=' .repeat(80) + '\n');

const issues = [];
const warnings = [];
const successes = [];

for (const [tagName, sourcePath] of Object.entries(components)) {
  console.log(`\n🔍 Analyzing: ${tagName}`);
  console.log('-'.repeat(80));
  
  const customElementInfo = getCustomElementInfo(tagName);
  const storyData = getFirstStoryForComponent(tagName);
  
  if (!customElementInfo) {
    issues.push(`${tagName}: Not found in custom-elements.json`);
    console.log(`❌ Not found in custom-elements.json`);
    continue;
  }
  
  if (!storyData) {
    warnings.push(`${tagName}: No story found in docs.json`);
    console.log(`⚠️  No story found in docs.json`);
    continue;
  }
  
  const { story, storyId } = storyData;
  const docsProps = Object.keys(story.props || {});
  const docsSlots = Object.keys(story.slots || {});
  const docsEvents = Object.keys(story.events || {});
  const currentArgs = Object.keys(story.currentArgs || {});
  
  // Check attributes/props
  console.log(`\n  Properties/Attributes:`);
  const ceAttributes = customElementInfo.attributes;
  
  // Missing from docs
  const missingInDocs = ceAttributes.filter(attr => !docsProps.includes(attr));
  if (missingInDocs.length > 0) {
    issues.push(`${tagName}: Missing props in docs.json: ${missingInDocs.join(', ')}`);
    console.log(`    ❌ Missing in docs.json: ${missingInDocs.join(', ')}`);
  }
  
  // Private members exposed
  const privateMembers = customElementInfo.members
    .filter(m => m.privacy === 'private')
    .map(m => m.name);
  const exposedPrivate = docsProps.filter(prop => privateMembers.includes(prop));
  if (exposedPrivate.length > 0) {
    issues.push(`${tagName}: Private members exposed: ${exposedPrivate.join(', ')}`);
    console.log(`    ❌ Private members exposed: ${exposedPrivate.join(', ')}`);
  }
  
  // Used in story but not documented
  const usedButNotDocumented = currentArgs.filter(arg => !ceAttributes.includes(arg));
  if (usedButNotDocumented.length > 0) {
    warnings.push(`${tagName}: Used in story but not in custom-elements: ${usedButNotDocumented.join(', ')}`);
    console.log(`    ⚠️  Used in story but not documented: ${usedButNotDocumented.join(', ')}`);
  }
  
  // Check type representation issues
  for (const [propName, propInfo] of Object.entries(story.props || {})) {
    if (propInfo.type?.value && Array.isArray(propInfo.type.value)) {
      const hasCorruptedType = propInfo.type.value.some(v => 
        typeof v === 'string' && (v === 'trin' || v === 'ul')
      );
      if (hasCorruptedType) {
        warnings.push(`${tagName}.${propName}: Corrupted type representation: ${JSON.stringify(propInfo.type.value)}`);
        console.log(`    ⚠️  ${propName}: Corrupted type representation`);
      }
    }
    
    // Check for empty type/defaultValue
    if (Object.keys(propInfo.type || {}).length === 0) {
      warnings.push(`${tagName}.${propName}: Empty type definition`);
      console.log(`    ⚠️  ${propName}: Empty type definition`);
    }
  }
  
  // Check slots
  console.log(`\n  Slots:`);
  const missingSlots = customElementInfo.slots.filter(slot => slot && !docsSlots.includes(slot));
  if (missingSlots.length > 0) {
    issues.push(`${tagName}: Missing slots in docs.json: ${missingSlots.join(', ')}`);
    console.log(`    ❌ Missing slots: ${missingSlots.join(', ')}`);
  } else {
    console.log(`    ✅ All slots documented (${customElementInfo.slots.length})`);
    successes.push(`${tagName}: All slots documented`);
  }
  
  // Check events
  console.log(`\n  Events:`);
  const missingEvents = customElementInfo.events.filter(event => !docsEvents.includes(event));
  if (missingEvents.length > 0) {
    issues.push(`${tagName}: Missing events in docs.json: ${missingEvents.join(', ')}`);
    console.log(`    ❌ Missing events: ${missingEvents.join(', ')}`);
  } else {
    console.log(`    ✅ All events documented (${customElementInfo.events.length})`);
    successes.push(`${tagName}: All events documented`);
  }
  
  // Summary for this component
  console.log(`\n  Summary:`);
  console.log(`    Props: ${docsProps.length} in docs, ${ceAttributes.length} in manifest`);
  console.log(`    Slots: ${docsSlots.length} in docs, ${customElementInfo.slots.length} in manifest`);
  console.log(`    Events: ${docsEvents.length} in docs, ${customElementInfo.events.length} in manifest`);
}

// Final summary
console.log('\n' + '='.repeat(80));
console.log('\n📊 FINAL SUMMARY\n');

console.log(`✅ Successes: ${successes.length}`);
if (successes.length > 0) {
  successes.forEach(s => console.log(`   - ${s}`));
}

console.log(`\n⚠️  Warnings: ${warnings.length}`);
if (warnings.length > 0) {
  warnings.slice(0, 10).forEach(w => console.log(`   - ${w}`));
  if (warnings.length > 10) {
    console.log(`   ... and ${warnings.length - 10} more`);
  }
}

console.log(`\n❌ Critical Issues: ${issues.length}`);
if (issues.length > 0) {
  issues.forEach(i => console.log(`   - ${i}`));
}

console.log('\n' + '='.repeat(80));

// Exit with appropriate code
if (issues.length > 0) {
  console.log('\n❌ Verification FAILED - Critical issues found\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  Verification PASSED with warnings\n');
  process.exit(0);
} else {
  console.log('\n✅ Verification PASSED - All checks successful\n');
  process.exit(0);
}
