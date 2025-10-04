import fs from 'fs';
import path from 'path';
import type * as TypeScript from 'typescript';
import { StoryEntry, ProcessedType } from './merge-docs';
import YAML from 'yaml';

// Import TypeScript dynamically
const ts = await (async (): Promise<typeof TypeScript | null> => {
  try {
    const tsModule = await import('typescript');
    // TypeScript module can be imported as default or as namespace
    const typescript = (tsModule.default || tsModule) as typeof TypeScript;
    return typescript;
  } catch (error) {
    console.warn('⚠️  Could not import TypeScript:', error);
    return null;
  }
})();

const STORIES_DIR = `./storybook-static/stories_doc`;

/**
 * Component registry types
 */
export interface SchemaDefinition {
  type?: string;
  enum?: string[];
  values?: any;
  description?: string;
  default?: any;
}

export interface ComponentProp {
  type?: string;
  enum?: string[];
  default?: any;
  description?: string;
  required?: boolean;
  $ref?: string;
}

export interface ComponentEvent {
  name: string;
  event: string;
  parameterType: string;
  description?: string;
}

export interface ComponentSlot {
  exposed_data?: string;
  description?: string;
}

export interface ComponentExample {
  id: string;
  name: string;
  sources: Record<string, string>;
  args: Record<string, any>;
}

export interface ComponentDefinition {
  lit_component_tag: string;
  category: string;
  descriptions?: string;
  component_hierarchy?: string;
  component_type?: string;
  props: Record<string, ComponentProp>;
  events: Record<string, ComponentEvent>;
  slots?: Record<string, ComponentSlot>;
  exposed?: Record<string, any>;
  examples?: ComponentExample[];
}

export interface CategoryDefinition {
  name: string;
  description?: string;
  components: string[];
}

export interface ComponentRegistry {
  version: string;
  framework: string;
  library: string;
  schemas: Record<string, SchemaDefinition>;
  components: Record<string, ComponentDefinition>;
  categories: Record<string, CategoryDefinition>;
  predefined_css_definitions?: string;
}

/**
 * Parse TypeScript definitions and extract schema information
 */
function parseDefinitions(defs: ProcessedType[]) {
  if (!ts) {
    throw new Error('TypeScript is not available');
  }
  
  // TypeScript is available at this point, assert non-null
  const typescript = ts as typeof TypeScript;
  
  const filename = 'defs.ts';
  const combinedSource = defs.map((d) => d.definition).join('\n');

  const sourceFile = typescript.createSourceFile(
    filename,
    combinedSource,
    typescript.ScriptTarget.Latest,
    true
  );

  const compilerOptions = typescript.getDefaultCompilerOptions();
  const defaultHost = typescript.createCompilerHost(compilerOptions, true);

  const customHost = {
    ...defaultHost,
    getSourceFile: (name: string, languageVersion: TypeScript.ScriptTarget) => {
      if (name === filename) {
        return sourceFile;
      }
      return defaultHost.getSourceFile(name, languageVersion);
    },
    fileExists: (f: string) => f === filename || defaultHost.fileExists(f),
    readFile: (f: string) => (f === filename ? combinedSource : defaultHost.readFile(f)),
  };

  const program = typescript.createProgram([filename], compilerOptions, customHost);
  const checker = program.getTypeChecker();

  return { program, sourceFile, checker };
}

/**
 * Extract literal union values from AST node
 */
function extractLiteralUnion(node: TypeScript.TypeAliasDeclaration): any[] | null {
  if (!ts) return null;
  
  // TypeScript is available at this point, assert non-null
  const typescript = ts as typeof TypeScript;
  
  const t = node.type;
  if (typescript.isUnionTypeNode(t)) {
    const literals: any[] = [];
    for (const member of t.types) {
      if (!typescript.isLiteralTypeNode(member)) {
        return null;
      }
      const lit = member.literal;
      if (typescript.isStringLiteral(lit)) {
        literals.push(lit.text);
      } else if (typescript.isNumericLiteral(lit)) {
        literals.push(Number(lit.text));
      } else if (lit.kind === typescript.SyntaxKind.TrueKeyword) {
        literals.push(true);
      } else if (lit.kind === typescript.SyntaxKind.FalseKeyword) {
        literals.push(false);
      } else if (
        typescript.isPrefixUnaryExpression(lit) &&
        lit.operator === typescript.SyntaxKind.MinusToken &&
        typescript.isNumericLiteral(lit.operand)
      ) {
        literals.push(-Number(lit.operand.text));
      } else {
        return null;
      }
    }
    return literals;
  }
  return null;
}

/**
 * Extract types from TypeScript AST
 */
function extractTypesFromAST(
  sourceFile: TypeScript.SourceFile,
  checker: TypeScript.TypeChecker
): Record<string, SchemaDefinition> {
  if (!ts) return {};
  
  // TypeScript is available at this point, assert non-null
  const typescript = ts as typeof TypeScript;
  
  const out: Record<string, SchemaDefinition> = {};

  function visit(node: TypeScript.Node) {
    if (typescript.isTypeAliasDeclaration(node)) {
      const name = node.name.text;
      const literalValues = extractLiteralUnion(node);
      
      if (literalValues) {
        out[name] = { values: literalValues };
      } else {
        let keyOfTypeExpressionText: string | undefined;
        
        if (
          node.type &&
          typescript.isTypeOperatorNode(node.type) &&
          node.type.operator === typescript.SyntaxKind.KeyOfKeyword
        ) {
          const inner = node.type.type;
          if (inner && typescript.isTypeQueryNode(inner)) {
            keyOfTypeExpressionText = node.type.getText(sourceFile);
          }
        }
        
        const type = checker.getTypeAtLocation(node.type || node);
        
        if (keyOfTypeExpressionText) {
          out[name] = { type: keyOfTypeExpressionText };
        } else {
          const props: Record<string, string> = {};
          for (const sym of type.getProperties()) {
            const propType = checker.getTypeOfSymbolAtLocation(sym, node);
            props[sym.getName()] = checker.typeToString(propType);
          }
          out[name] = props as any;
        }
      }
    } else if (typescript.isInterfaceDeclaration(node)) {
      // Handle interface declarations
      const name = node.name.text;
      const type = checker.getTypeAtLocation(node);
      const props: Record<string, any> = {};
      
      for (const sym of type.getProperties()) {
        const propType = checker.getTypeOfSymbolAtLocation(sym, node);
        const propTypeString = checker.typeToString(propType);
        
        // Get JSDoc description if available
        const propDeclaration = sym.valueDeclaration;
        let description: string | undefined;
        if (propDeclaration) {
          const jsdocs = (typescript as any).getJSDocCommentsAndTags?.(propDeclaration) || [];
          if (jsdocs.length > 0) {
            description = jsdocs[0].comment || undefined;
          }
        }
        
        props[sym.getName()] = {
          type: propTypeString,
          description,
          required: !sym.declarations?.some((d: any) => d.questionToken),
        };
      }
      
      out[name] = props as any;
    } else if (typescript.isEnumDeclaration(node)) {
      const name = node.name.text;
      const values: any[] = [];
      node.members.forEach((member) => {
        if (typescript.isIdentifier(member.name) || typescript.isStringLiteral(member.name)) {
          values.push(member.name.text);
        }
      });
      out[name] = { enum: values, type: 'enum' };
    }
    
    typescript.forEachChild(node, visit);
  }

  visit(sourceFile);
  return out;
}

/**
 * Transform schemas from processed types
 */
function transformSchemas(
  stories: Record<string, any>,
  transformed: ComponentRegistry
): void {
  const _types = (stories['processed_types'] || []) as ProcessedType[];
  
  if (_types.length === 0) {
    transformed.schemas = {};
    return;
  }
  
  try {
    const { sourceFile, checker } = parseDefinitions(_types);
    const extractedTypes = extractTypesFromAST(sourceFile, checker);
    
    // Remove unwanted types (Props types and HTMLElementTagNameMap)
    Object.entries(extractedTypes).forEach(([typeName]) => {
      if (typeName.endsWith('Props') || typeName === 'HTMLElementTagNameMap') {
        delete extractedTypes[typeName];
      }
    });
    
    transformed.schemas = extractedTypes;
  } catch (error) {
    console.warn('⚠️  Error transforming schemas:', error);
    transformed.schemas = {};
  }
}

/**
 * Transform components from stories
 */
function transformComponents(
  _stories: Record<string, any>,
  transformed: ComponentRegistry
): void {
  const excludeKeys = ['processed_css', 'processed_types'];
  const stories: Record<string, StoryEntry> = Object.fromEntries(
    Object.entries(_stories).filter(
      ([key, value]) => !excludeKeys.includes(key) && typeof value === 'object'
    )
  ) as Record<string, StoryEntry>;

  const registry: Record<string, ComponentDefinition> = {};
  const categories: Record<string, CategoryDefinition> = {};

  /**
   * Find relevant type schema for a type string
   */
  const findRelevantType = (_type: string): string => {
    let matchedType = '';
    let matchScore = 0;
    
    Object.entries(transformed.schemas || {}).forEach(([schemaKey]) => {
      if (_type.includes(schemaKey) && matchScore < schemaKey.length) {
        matchedType = schemaKey;
        matchScore = schemaKey.length;
      }
    });
    
    return matchedType;
  };

  Object.entries(stories).forEach(([storyKey, storyEntry]) => {
    const componentTag = storyEntry.component_tag;
    if (!componentTag) return;

    registry[componentTag] = registry[componentTag] || {
      lit_component_tag: componentTag,
      category: '',
      descriptions: '',
      component_hierarchy: '',
      component_type: '',
      props: {},
      events: {},
      slots: {},
      exposed: {},
      examples: [],
    };

    const currentReg = registry[componentTag];

    currentReg.lit_component_tag = componentTag;
    currentReg.descriptions = storyEntry.descriptions || '';
    currentReg.component_hierarchy = storyEntry.component_hierarchy || '';
    currentReg.component_type = storyEntry.component_type || '';
    currentReg.category = storyEntry.context.title.split('/')[1] || '';

    categories[currentReg.category] = categories[currentReg.category] || {
      name: currentReg.category,
      components: [],
    };
    if (!categories[currentReg.category].components.includes(componentTag)) {
      categories[currentReg.category].components.push(componentTag);
    }

    // Transform props
    Object.entries(storyEntry.props).forEach(([propKey, propEntry]: [string, any]) => {
      currentReg.props[propKey] = currentReg.props[propKey] || {};
      
      if (Array.isArray(propEntry.type?.value)) {
        currentReg.props[propKey].type = propEntry.type.name;
        currentReg.props[propKey].enum = propEntry.type.value;
      } else if (propEntry.type?.value && typeof propEntry.type.value === 'string') {
        const relevantType = findRelevantType(propEntry.type.value);
        if (relevantType) {
          currentReg.props[propKey].$ref = '#/schemas/' + relevantType;
        }
        currentReg.props[propKey].type = propEntry.type.value;
      } else if (propEntry.type?.name) {
        currentReg.props[propKey].type = propEntry.type.name;
      }
      
      currentReg.props[propKey].description = propEntry.description;
      currentReg.props[propKey].default = propEntry.defaultValue;
      currentReg.props[propKey].required = propEntry.type?.required;
    });

    // Transform events
    Object.entries(storyEntry.events).forEach(([eventKey, eventEntry]: [string, any]) => {
      currentReg.events[eventKey] = currentReg.events[eventKey] || {
        name: eventEntry.name,
        event: eventEntry.signature || eventEntry.name,
        parameterType: eventEntry.type,
        description: eventEntry.description,
      };
    });

    // Transform slots
    Object.entries(storyEntry.slots).forEach(([slotKey, slotEntry]: [string, any]) => {
      currentReg.slots = currentReg.slots || {};
      currentReg.slots[slotKey] = currentReg.slots[slotKey] || {};
      currentReg.slots[slotKey].exposed_data = (slotEntry.type as any)?.value;
      currentReg.slots[slotKey].description = slotEntry.description;
    });

    // Transform exposed
    Object.entries(storyEntry.exposed).forEach(([exposedKey, exposedEntry]) => {
      currentReg.exposed = currentReg.exposed || {};
      if (exposedEntry && typeof exposedEntry === 'object') {
        const cleaned = { ...exposedEntry };
        delete (cleaned as any).control;
        delete (cleaned as any).table;
        currentReg.exposed[exposedKey] = cleaned;
      } else {
        currentReg.exposed[exposedKey] = exposedEntry;
      }
    });

    // Add example
    currentReg.examples = currentReg.examples || [];
    currentReg.examples.push({
      id: storyKey,
      name: storyEntry.story_name || storyEntry.context.name,
      sources: storyEntry.sources || {},
      args: storyEntry.currentArgs || {},
    });
  });

  transformed.components = registry;
  transformed.categories = categories;
}

/**
 * Generate minimal documentation
 */
function generateMinimalDocs(stories: Record<string, any>): any {
  const minimalDoc: any = {};
  
  Object.entries(stories).forEach(([comp, compData]) => {
    if (comp === 'processed_css' || comp === 'processed_types') return;
    if (typeof compData !== 'object' || !compData.component_tag) return;
    
    const componentTag = compData.component_tag;
    if (!minimalDoc[componentTag]) {
      minimalDoc[componentTag] = {
        props: {},
        slots: {},
        events: {},
        exposed: {},
        unknownArgs: {},
      };
    }
    
    Object.assign(minimalDoc[componentTag].props, compData.props);
    minimalDoc[componentTag].component_hierarchy = compData.component_hierarchy;
    minimalDoc[componentTag].component_type = compData.component_type;
    minimalDoc[componentTag].descriptions = compData.descriptions;
    if (compData.category) minimalDoc[componentTag].category = compData.category;
    Object.assign(minimalDoc[componentTag].slots, compData.slots);
    Object.assign(minimalDoc[componentTag].events, compData.events);
    Object.assign(minimalDoc[componentTag].exposed, compData.exposed);
    Object.assign(minimalDoc[componentTag].unknownArgs, compData.unknownArgs);
  });
  
  // Clean up empty sections
  Object.entries(minimalDoc).forEach(([comp, compData]: [string, any]) => {
    if (comp === 'processed_css' || comp === 'processed_types') return;
    if (compData) {
      Object.entries(compData).forEach(([propKey, properties]) => {
        if (
          properties &&
          typeof properties === 'object' &&
          Object.values(properties).length === 0
        ) {
          delete compData[propKey];
        }
      });
    }
  });
  
  return minimalDoc;
}

/**
 * Main function to transform stories into component registry
 */
export function transformToRegistry(): void {
  console.log('\n🏗️  Generating component registry...');
  
  const docsPath = path.join(STORIES_DIR, 'docs.json');
  
  if (!fs.existsSync(docsPath)) {
    console.error('❌ docs.json not found at:', docsPath);
    console.log('   Run merge-docs first!');
    return;
  }

  const stories = JSON.parse(fs.readFileSync(docsPath, 'utf-8'));

  const transformed: ComponentRegistry = {
    version: '{{-VG_VERSION-}}',
    framework: 'lit',
    library: '@vg/components',
    schemas: {},
    components: {},
    categories: {},
  };

  transformSchemas(stories, transformed);
  transformComponents(stories, transformed);

  transformed.predefined_css_definitions = stories['processed_css'] || '';

  // Write full registry as JSON
  const registryPath = path.join(STORIES_DIR, 'component-registry.json');
  fs.writeFileSync(registryPath, JSON.stringify(transformed, null, 2));
  console.log(`✅ Component registry generated: ${registryPath}`);

  const doc = new YAML.Document();
  doc.contents = transformed
  fs.writeFileSync(`${STORIES_DIR}/component-registry.yml`, doc.toString())

  // Generate minimal docs
  const minimalDoc = generateMinimalDocs(stories);
  const minimalData = {
    components: minimalDoc,
    total_components: Object.keys(minimalDoc).length,
    types: { ...transformed.schemas },
  };

  const minimalPath = path.join(STORIES_DIR, 'docs-min.json');
  fs.writeFileSync(minimalPath, JSON.stringify(minimalData, null, 2));
  console.log(`✅ Minimal docs generated: ${minimalPath}`);

  console.log('\n✨ Component registry generation complete!\n');
}

// If this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  transformToRegistry();
}
