#!/usr/bin/env node

/**
 * Create a Lighthouse CI project via API
 * Run: node scripts/create-lhci-project.js
 */

const serverUrl = 'http://localhost:9001';
const projectName = 'lit-components';
const repoUrl = 'https://github.com/brguru90/lit-components';
const mainBranch = 'main';

async function createProject() {
  console.log('🔦 Creating Lighthouse CI Project...\n');
  
  try {
    const response = await fetch(`${serverUrl}/v1/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        externalUrl: repoUrl,
        baseBranch: mainBranch,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create project: ${response.status} - ${error}`);
    }

    const project = await response.json();
    
    console.log('✅ Project created successfully!\n');
    console.log('📊 Project Details:');
    console.log('─────────────────────────────────────────');
    console.log(`Name:       ${project.name}`);
    console.log(`ID:         ${project.id}`);
    console.log(`Token:      ${project.token}`);
    console.log(`Server URL: ${serverUrl}`);
    console.log('─────────────────────────────────────────\n');
    
    console.log('📝 Next Steps:\n');
    console.log('1. Update your lighthouserc.json:');
    console.log('   {');
    console.log('     "ci": {');
    console.log('       "upload": {');
    console.log('         "target": "lhci",');
    console.log(`         "serverBaseUrl": "${serverUrl}",`);
    console.log(`         "token": "${project.token}"`);
    console.log('       }');
    console.log('     }');
    console.log('   }\n');
    console.log('2. Run: npm run lighthouse\n');
    console.log('3. View results at: ' + serverUrl + '/app/projects/' + project.id + '\n');
    
    // Save to a file for easy reference
    const fs = require('fs');
    const configPath = '.lighthouseci/project-config.json';
    
    if (!fs.existsSync('.lighthouseci')) {
      fs.mkdirSync('.lighthouseci', { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify({
      projectId: project.id,
      projectName: project.name,
      token: project.token,
      serverUrl: serverUrl,
      createdAt: new Date().toISOString()
    }, null, 2));
    
    console.log(`💾 Project config saved to: ${configPath}\n`);
    
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    console.error('\n💡 Make sure the Lighthouse CI server is running:');
    console.error('   npm run lighthouse:server\n');
    process.exit(1);
  }
}

createProject();
