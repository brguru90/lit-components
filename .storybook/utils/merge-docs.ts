import fs from 'fs';
import path from 'path';
import * as sass from 'sass';
import type * as TypeScript from 'typescript';
import { StoryEntry } from './documentation-extraction';

export type { StoryEntry } from './documentation-extraction';

// Import TypeScript dynamically
const ts = await (async (): Promise<typeof TypeScript | null> => {
  try {
    return await import('typescript');
  } catch (error) {
    console.warn('⚠️  Could not import TypeScript:', error);
    return null;
  }
})();

const STORIES_DIR = `./storybook-static/stories_doc`;

/**
 * Type definitions for merged documentation
 */
export interface ProcessedType {
  name: string;
  definition: string;
}

export interface StoriesObject {
  [storyId: string]: StoryEntry | string | ProcessedType[];
}

/**
 * Resolve all Lit components from custom-elements.json
 * Returns tag names (e.g., 'vg-button') instead of class names (e.g., 'VgButton')
 */
function resolveLitComponents(): string[] {
  console.log('Resolving Lit components from custom-elements.json...');
  
  const allComponents: string[] = [];
  
  try {
    const manifestPath = path.resolve(process.cwd(), 'dist/custom-elements.json');
    if (!fs.existsSync(manifestPath)) {
      console.warn('⚠️  custom-elements.json not found at:', manifestPath);
      return allComponents;
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const componentTags = new Set<string>();
    
    manifest.modules?.forEach((module: any) => {
      module.declarations?.forEach((decl: any) => {
        // Only include declarations with customElement flag and tagName
        if (decl.customElement && decl.tagName) {
          componentTags.add(decl.tagName);
        }
      });
    });
    
    allComponents.push(...Array.from(componentTags).sort());
    console.log(`Found ${allComponents.length} custom elements: ${allComponents.join(', ')}`);
  } catch (err) {
    console.warn('⚠️  Error reading custom-elements.json:', (err as Error).message);
  }
  
  return allComponents;
}

/**
 * Extract TypeScript types from the codebase
 */
function extractTypescriptTypes(): ProcessedType[] {
  const allTypes: ProcessedType[] = [];
  
  if (!ts) {
    console.warn('⚠️  TypeScript not available, skipping type extraction');
    return allTypes;
  }
  
  try {
    const srcFiles = fs.readdirSync('src/components', { recursive: true })
      .filter((file: any) => {
        const filePath = path.join('src/components', file.toString());
        return fs.statSync(filePath).isFile() && filePath.endsWith('.ts');
      })
      .map((file: any) => path.join('src/components', file.toString()));

    const program = ts.createProgram({
      rootNames: [...srcFiles, 'src/index.ts'],
      options: {
        allowJs: false,
        jsx: ts.JsxEmit.Preserve,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        baseUrl: '.',
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        skipLibCheck: true,
        noEmit: true,
      },
    });
    
    const checker = program.getTypeChecker();
    const printer = ts.createPrinter();

    for (const sf of program.getSourceFiles()) {
      if (sf.isDeclarationFile) continue;
      if (!sf.fileName.includes('src/')) continue;
      
      const visit = (node: TypeScript.Node) => {
        // Interfaces & Type aliases
        if (ts!.isInterfaceDeclaration(node) || ts!.isTypeAliasDeclaration(node)) {
          const typeName = node.name.text;
          const printed = printer.printNode(ts!.EmitHint.Unspecified, node, sf);
          allTypes.push({
            name: typeName,
            definition: printed,
          });
        }
        // Enums
        else if (ts!.isEnumDeclaration(node)) {
          const typeName = node.name.text;
          const printed = printer.printNode(ts!.EmitHint.Unspecified, node, sf);
          allTypes.push({
            name: typeName,
            definition: printed,
          });
        }
        // Exported const object maps (e.g., colorMap) -> convert to union type
        else if (
          ts!.isVariableStatement(node) &&
          node.modifiers?.some((m) => m.kind === ts!.SyntaxKind.ExportKeyword)
        ) {
          for (const decl of node.declarationList.declarations) {
            if (!decl.name || !ts!.isIdentifier(decl.name)) continue;
            const varName = decl.name.text;
            if (decl.initializer && ts!.isObjectLiteralExpression(decl.initializer)) {
              // Treat as map -> enum-like if every property value is true literal
              const props = decl.initializer.properties;
              let allTrueBoolean = true;
              const keys: string[] = [];
              
              for (const p of props) {
                if (
                  ts!.isPropertyAssignment(p) &&
                  (ts!.isIdentifier(p.name) || ts!.isStringLiteral(p.name))
                ) {
                  const keyName = ts!.isIdentifier(p.name) ? p.name.text : p.name.text;
                  if (p.initializer && p.initializer.kind === ts!.SyntaxKind.TrueKeyword) {
                    keys.push(keyName);
                  } else {
                    allTrueBoolean = false;
                    break;
                  }
                } else {
                  allTrueBoolean = false;
                  break;
                }
              }
              
              if (allTrueBoolean && keys.length) {
                const union = keys.map((k) => JSON.stringify(k)).join(' | ');
                const definition = `export type ${varName} = ${union}\nexport const ${varName}Map: Record<${varName}, true> = {\n${keys
                  .map((k) => `  ${JSON.stringify(k)}: true`)
                  .join(',\n')}\n}`;
                allTypes.push({
                  name: varName,
                  definition,
                });
              }
            }
          }
        }
        ts!.forEachChild(node, visit);
      };
      ts!.forEachChild(sf, visit);
    }
  } catch (error) {
    console.warn('⚠️  Error extracting TypeScript types:', (error as Error).message);
  }
  
  return allTypes;
}

/**
 * Process SCSS to extract CSS
 */
function processScss(): string {
  try {
    const scssPath = path.resolve(process.cwd(), '.storybook/all.scss');
    
    if (!fs.existsSync(scssPath)) {
      console.warn('⚠️  SCSS file not found, skipping CSS processing');
      return '';
    }
    
    const result = sass.compile(scssPath, {
      style: 'compressed',
      sourceMap: false,
    });
    
    return result.css.toString();
  } catch (error) {
    console.warn('⚠️  Error processing SCSS:', (error as Error).message);
    return '';
  }
}

/**
 * Merge all story documentation chunks into a single file
 */
export function mergeDocs(): void {
  console.log('\n📚 Merging documentation...');
  
  if (!fs.existsSync(STORIES_DIR)) {
    console.error('❌ Stories directory does not exist:', STORIES_DIR);
    return;
  }
  
  const files = fs.readdirSync(STORIES_DIR).filter((f) => f.startsWith('chunk_'));
  
  let all: StoriesObject = {};
  
  // If no chunks, try to read existing docs.json
  if (files.length === 0) {
    const docsPath = path.join(STORIES_DIR, 'docs.json');
    if (fs.existsSync(docsPath)) {
      console.log('📖 Loading existing docs.json');
      all = JSON.parse(fs.readFileSync(docsPath, 'utf-8'));
    } else {
      console.warn('⚠️  No documentation chunks or existing docs.json found');
      return;
    }
  } else {
    // Merge all chunks
    files.forEach((f) => {
      try {
        const data = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8'));
        all = { ...all, ...data };
        fs.unlinkSync(path.join(STORIES_DIR, f));
      } catch (error) {
        console.warn(`⚠️  Error processing chunk ${f}:`, error);
      }
    });
  }

  console.log(`✅ ${Object.keys(all).length} stories collected`);

  // Process CSS
  console.log('🎨 Processing SCSS...');
  const processedCss = processScss();
  if (processedCss) {
    all.processed_css = processedCss;
    console.log('✅ CSS processed successfully');
  }

  // Extract TypeScript types
  console.log('🔍 Extracting TypeScript types...');
  const processedTypes = extractTypescriptTypes();
  if (processedTypes.length > 0) {
    all.processed_types = processedTypes;
    console.log(`✅ Extracted ${processedTypes.length} types`);
  }

  // Validate components
  const componentsFromStories = new Set<string>();
  Object.entries(all).forEach(([key, story]) => {
    if (typeof story === 'object' && 'component_tag' in story && story.component_tag) {
      componentsFromStories.add(story.component_tag);
    }
  });

  const allLitComponents = resolveLitComponents();
  
  console.log('📊 Component counts:');
  console.log(`  - Components from stories: ${componentsFromStories.size}`);
  console.log(`  - Lit components found: ${allLitComponents.length}`);

  const exemptedComponents: string[] = [];
  const missingComponents = allLitComponents.filter(
    (c) => !componentsFromStories.has(c) && !exemptedComponents.includes(c)
  );
  
  if (missingComponents.length > 0) {
    console.warn(
      `⚠️  ${missingComponents.length} components without stories:\n${missingComponents.join('\n')}`
    );
  }

  // Write merged documentation
  const docsPath = path.join(STORIES_DIR, 'docs.json');
  fs.writeFileSync(docsPath, JSON.stringify(all, null, 2));
  console.log(`✅ Documentation merged to: ${docsPath}`);
  
  console.log('\n✨ Documentation merge complete!\n');
}

// If this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  mergeDocs();
}
