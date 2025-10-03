import fs from 'fs'
import path from 'path'
import * as sass from 'sass'
import lzma from 'lzma-native'
import ts from 'typescript'
import glob from 'glob'
import YAML from 'yaml';
import { parse as parseSFC } from '@vue/compiler-sfc'

/**
 * @param {string} storyKey 
 * @param {StoryEntry} story
 * @returns {any} 
 */
function transformStoryToUiJson(storyKey, story){
  try {
    if(!story || !story.source) return null

    // Helpers --------------------------------------------------
    const slugify = (s)=> (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
    const nowIso = new Date().toISOString()

    /**
     * Convert inline style="a: b;" to object { a: 'b' }
     * @param {string} styleStr
     */
    const parseStyle = (styleStr='') => {
      const out = {}
      styleStr.split(';').map(s=>s.trim()).filter(Boolean).forEach(rule=>{
        const [k,...rest]=rule.split(':')
        if(!k || !rest.length) return
        const key = k.trim()
        const val = rest.join(':').trim()
        out[key.replace(/-([a-z])/g,(m,g)=>g.toUpperCase())] = val
      })
      return Object.keys(out).length? out: undefined
    }

    /** Attempt to coerce primitive */
    const coerce = (raw) => {
      if(raw === undefined || raw === null) return raw
      if(raw === 'true') return true
      if(raw === 'false') return false
      if(raw === 'null') return null
      if(raw === 'undefined') return undefined
      if(/^[-+]?[0-9]+(\.[0-9]+)?$/.test(raw)) return Number(raw)
      return raw
    }

    /** Convert an expression inside v-bind to either a concrete value or a template placeholder */
    const expressionToValue = (expContent) => {
      if(!expContent) return undefined
      const trimmed = expContent.trim()
      // simple primitives
      if(['true','false','null','undefined'].includes(trimmed) || /^[-+]?[0-9]+(\.[0-9]+)?$/.test(trimmed)){
        return coerce(trimmed)
      }
      // quoted string
      if(((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) && trimmed.length >= 2){
        return trimmed.slice(1,-1)
      }
      // object / array literal
      if(trimmed.startsWith('{') || trimmed.startsWith('[')){
        const obj = safeEvalObjectLiteral(trimmed)
        if(obj !== undefined) return obj
      }
      // args.<prop> direct substitution from currentArgs when available
      if(/^args\./.test(trimmed) && story.currentArgs){
        const key = trimmed.slice(5)
        if(Object.prototype.hasOwnProperty.call(story.currentArgs, key)){
          return story.currentArgs[key]
        }
      }
      // fallback to template placeholder for dynamic runtime binding
      return '${' + trimmed + '}'
    }

    /** Parse simple JS object expression string (VERY limited) */
    const safeEvalObjectLiteral = (src) => {
      try {
        // only allow object/array/primitive JSON-like with quotes or single quotes
        // Replace single quotes with double (naive) for JSON.parse fallback
        const jsonLike = src.trim().replace(/'(.*?)'/g, (m, g)=>`"${g.replace(/"/g,'\\"')}"`)
        if(jsonLike.startsWith('{') || jsonLike.startsWith('[')) {
          return JSON.parse(jsonLike)
        }
      } catch(e){ /* ignore */ }
      return undefined
    }

    /** Extract v-for details */
    const parseFor = (expContent='') => {
      const m = expContent.match(/^(?:\(([^)]+)\)|([^\s]+))\s+in\s+(.+)$/)
      if(!m) return null
      const aliasRaw = (m[1]||m[2]).trim()
      const source = m[3].trim()
      // only first alias supported for now
      const alias = aliasRaw.split(',')[0].trim()
      return { alias, source }
    }

    const interpolate = (text) => {
      // Convert Vue {{ expr }} -> ${ expr }
  return text.replace(/{{([^}]+)}}/g,(m,g)=>'${'+g.trim()+'}')
    }

    // Wrap the raw source into a <template>
    const sfc = `<template>\n${story.source}\n</template>`
    const { descriptor } = parseSFC(sfc)
    if(!descriptor || !descriptor.template || !descriptor.template.ast) return null
    const rootChildren = descriptor.template.ast.children || []

    let idCounter = 0
    const nextId = (base) => `${base || 'el'}-${++idCounter}`

    /**
     * Transform AST element / text recursively
     * @param {any} node
     * @param {{ slot?: string, forAliasStack: string[] }} ctx
     */
    const transformNode = (node, ctx) => {
      if(!node) return null
      switch(node.type){
        case 2: { // TEXT
          const content = node.content.trim()
          if(!content) return null
          // handle interpolation inside text (Vue already splits interpolation nodes differently, but just in case)
          return { type: 'text', children: interpolate(content) }
        }
        case 5: { // INTERPOLATION (should not appear given provided AST dump but guard)
          const exp = node.content && node.content.content || ''
          return { type: 'text', children: '${'+exp+'}' }
        }
        case 1: { // ELEMENT or template
          const isTemplate = node.tag === 'template'
          // slot template (#name)
          let slotName
          // gather directives / attrs
          const props = {}
          const events = []
          let styleObj
          let repeatExp
          node.props && node.props.forEach(p=>{
            if(p.type === 6){ // attribute
              if(p.name === 'style' && p.value){
                styleObj = parseStyle(p.value.content)
              } else if(p.value){
                props[p.name] = coerce(p.value.content)
              } else {
                props[p.name] = true
              }
            } else if(p.type === 7){ // directive
              if(p.name === 'slot' && p.arg){
                slotName = p.arg.content
              } else if(p.name === 'bind'){
                if(!p.arg){
                  // v-bind="args" – merge currentArgs
                  if(p.exp && /^(args|props)$/i.test(p.exp.content) && story.currentArgs){
                    Object.assign(props, JSON.parse(JSON.stringify(story.currentArgs)))
                  } else if(p.exp && p.exp.content.startsWith('{')){
                    const obj = safeEvalObjectLiteral(p.exp.content)
                    if(obj && typeof obj === 'object') Object.assign(props, obj)
                  }
                } else if(p.arg && p.exp){
                  props[p.arg.content] = expressionToValue(p.exp.content)
                }
              } else if(p.name === 'on' && p.arg){
                const evName = p.arg.content
                const exp = (p.exp && p.exp.content) || ''
                let actions = []
                if(exp){
                  // Detect arrow fn wrapper: (val)=> state.key = val OR val => state.key = val
                  const arrowParamMatch = exp.match(/^\s*(?:\(([^)]+)\)|([a-zA-Z0-9_]+))\s*=>\s*(.*)$/)
                  let body = exp
                  let paramName
                  if(arrowParamMatch){
                    paramName = (arrowParamMatch[1]||arrowParamMatch[2]||'').trim()
                    body = arrowParamMatch[3].trim().replace(/^\{?|\}?$/g,'').trim()
                  }
                  // Extract state assignment: state.someKey = <expr>
                  const stateAssign = body.match(/state\.([a-zA-Z0-9_]+)\s*=\s*([^;]+)$/)
                  if(stateAssign){
                    const targetKey = stateAssign[1]
                    let valueExpr = stateAssign[2].trim()
                    // If value is the param, map to event.value placeholder else keep raw
                    if(paramName && valueExpr === paramName){
                      valueExpr = 'event.value'
                    }
                    actions.push({ type:'setState', target: targetKey, value: '${'+valueExpr+'}' })
                  } else {
                    // Fallback: store raw JS to run
                    actions.push({ type:'run', expression: exp })
                  }
                }
                if(actions.length){
                  events.push({ eventType: evName, actions })
                }
              } else if(p.name === 'for' && p.exp){
                const parsed = parseFor(p.exp.content)
                if(parsed){
                  repeatExp = { alias: parsed.alias, source: parsed.source }
                }
              }
            }
          })

          const childCtx = { ...ctx }
          if(repeatExp){
            childCtx.forAliasStack = [...(ctx.forAliasStack||[]), repeatExp.alias]
          }

          const children = []
          node.children && node.children.forEach(c=>{
            const transformed = transformNode(c, childCtx)
            if(transformed){
              if(Array.isArray(transformed)) children.push(...transformed)
              else children.push(transformed)
            }
          })

          // collapse single text child for text nodes
          if(children.length === 1 && children[0].type === 'text'){ 
            // keep as string for leaf simple elements
          }

          if(isTemplate){
            // Represent slot container – keep special handling for default slot as 'template'
            let slotType
            if(!slotName || slotName === 'default'){
              slotType = 'template'
            } else if(children.every(c=>typeof c === 'string' || (c.type==='text'))){
              slotType = 'text'
            } else {
              slotType = children.length ? (children[0].type || 'fragment') : 'template'
            }
            return [{
              ...(slotName ? { slot: slotName } : { slot: 'default' }),
              type: slotType,
              children: children.map(ch=> ch.type==='text' ? ch.children || ch : ch)
            }]
          }

          const out = {
            id: nextId(slugify(node.tag)),
            type: node.tag,
          }
          if(Object.keys(props).length) out.props = props
          if(styleObj) out.style = styleObj
          if(events.length) out.events = events
          if(children.length){
            out.children = children.map(ch=> ch.type==='text'? ch.children || ch : ch)
          }
          if(repeatExp){
            out.repeat = '${'+repeatExp.source+'}'
            if(repeatExp.alias && out.props){
              // mark alias usage placeholder
              Object.keys(out.props).forEach(k=>{
                if(out.props[k] === '${'+repeatExp.alias+'}'){
                  // already alias
                }
              })
            }
          }

          // If component contains named slot(s) and also raw (unslotted) native elements/text, wrap those in a synthesized default slot
          if(out.children && Array.isArray(out.children)){
            const hasNamedSlot = out.children.some(ch => ch && typeof ch === 'object' && ch.slot)
            if(hasNamedSlot){
              const unslotted = out.children.filter(ch => ch && typeof ch === 'object' && !ch.slot)
              if(unslotted.length){
                const firstIndex = out.children.findIndex(ch => ch && typeof ch === 'object' && !ch.slot)
                const slotNode = {
                  slot: 'default',
                  type: unslotted.every(c => (typeof c === 'string') || (c.type === 'text')) ? 'text' : 'template',
                  children: unslotted
                }
                const newChildren = []
                out.children.forEach((ch, idx)=>{
                  if(idx === firstIndex){
                    newChildren.push(slotNode)
                  }
                  if(ch && typeof ch === 'object' && !ch.slot){
                    // skip original unslotted (already grouped)
                  } else if(idx !== firstIndex){
                    newChildren.push(ch)
                  }
                })
                out.children = newChildren
              }
            }
          }
          return out
        }
      }
      return null
    }

    const transformedChildren = []
    rootChildren.forEach(rc=>{
      const t = transformNode(rc, { forAliasStack: [] })
      if(!t) return
      if(Array.isArray(t)) transformedChildren.push(...t)
      else transformedChildren.push(t)
    })

    // Build uiJson baseline
    const uiJson = {
      id: storyKey || story.component_tag || 'story',
      name: story.story_name || story.component_tag || storyKey,
      schemaInfo: {
        version: '1.0.0',
        schemaVersion: '1.0.0',
        timestamp: nowIso
      },
      config: {
        id: storyKey + '--root',
        type: 'Fragment',
        props: {},
        defaultState: {},
        children: transformedChildren
      }
    }

    // Infer defaultState keys from any props referencing ${state.key}
    const stateKeys = new Set()
    const scanForStateRefs = (node) => {
      if(Array.isArray(node)) return node.forEach(scanForStateRefs)
      if(!node || typeof node !== 'object') return
      if(node.props){
        Object.values(node.props).forEach(v=>{
          if(typeof v === 'string'){
            const m = v.match(/^\$\{state\.([a-zA-Z0-9_]+)\}$/)
            if(m) stateKeys.add(m[1])
          }
        })
      }
      if(node.children){
        if(Array.isArray(node.children)) node.children.forEach(scanForStateRefs)
        // string children could also have ${state.x} but we won't extract from free text yet
      }
    }
    transformedChildren.forEach(scanForStateRefs)
    stateKeys.forEach(k=>{
      if(uiJson.config.defaultState[k] === undefined){
        // Try seed from story.currentArgs if present else empty string
        uiJson.config.defaultState[k] = story.currentArgs && Object.prototype.hasOwnProperty.call(story.currentArgs, k) ? story.currentArgs[k] : ''
      }
    })

    return uiJson
  } catch(e){
    return { error: true, message: e.message }
  }
}



const STORIES_DIR = `./storybook-static/stories_doc`


// ---------- types starts here ------------ 
/**
 * @typedef {Object} StoryContext
 * @property {string} id
 * @property {string} title
 * @property {string} name
 */

/**
 * @typedef {Object} StoryMeta
 * @property {string} type
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} importPath
 * @property {string} componentPath
 * @property {string[]} tags
 */

/**
 * @typedef {Object} PropType
 * @property {string} name
 * @property {string|string[]} [value]
 * @property {boolean} required
 */

/**
 * @typedef {Object} PropDefaultValue
 * @property {string} summary
 */

/**
 * @typedef {Object} StoryProp
 * @property {string} name
 * @property {PropType} type
 * @property {PropDefaultValue|string|any} [defaultValue] - Can be object with summary or direct value
 * @property {string} description
 */

/**
 * @typedef {Object} SlotType
 * @property {string} name
 * @property {string} value
 */

/**
 * @typedef {Object} StorySlot
 * @property {string} name
 * @property {SlotType} type
 * @property {SlotType} descriptions
 */

/**
 * @typedef {Object} ControlConfig
 * @property {string} type - Control type (e.g., "select", "object", "text", "boolean", "number")
 * @property {boolean} [disable] - Whether control is disabled
 */

/**
 * @typedef {Object} UnknownArgType
 * @property {string} name - Type name (e.g., "string", "boolean", "number", "object")
 * @property {string} [value] - Type value for complex types
 */

/**
 * @typedef {Object} TableTypeConfig
 * @property {string} summary - Type summary for storybook table
 */

/**
 * @typedef {Object} TableConfig
 * @property {TableTypeConfig} type - Type configuration for table display
 * @property {string} category - Category for table grouping (e.g., "exposed")
 */

/**
 * @typedef {Object} UnknownArg
 * @property {ControlConfig} [control] - Storybook control configuration
 * @property {string} name - Argument name
 * @property {string[]} [options] - Options for select/enum controls
 * @property {string} [description] - Argument description
 * @property {UnknownArgType} [type] - Argument type information
 * @property {TableConfig} [table] - Storybook table configuration
 */

/**
 * @typedef {Object} StoryEvent
 * @property {string} name - Event name
 * @property {string} signature - Event signature/type definition
 * @property {string[]} parameters - Event parameter types
 */

/**
 * @typedef {Object} ProcessedType
 * @property {string} name
 * @property {string} definition
 */

/**
 * @typedef {Object} StoryEntry
 * @property {StoryContext} context
 * @property {string} component_tag
 * @property {string} component_hierarchy
 * @property {string} component_type
 * @property {string} story_name
 * @property {string} descriptions
 * @property {string} rendered_source
 * @property {string} source
 * @property {StoryMeta} meta
 * @property {Record<string, StoryProp>} props
 * @property {Record<string, StorySlot>} slots
 * @property {Record<string, any>} exposed
 * @property {Record<string, StoryEvent>} events
 * @property {Record<string, UnknownArg>} unknownArgs
 * @property {Record<string, any>} currentArgs
 */


/**
 * @typedef {Record<string, StoryEntry>} StoryMap
 */

/**
 * @typedef {StoryMap & {
 *   processed_types: ProcessedType[];
 *   processed_css: string;
 * }} StoriesObject
 */





/**
 * @typedef {Object} SchemaDefinition
 * @property {string} type - The type of the schema (e.g., "string", "boolean", "number")
 * @property {string[]} [enum] - Allowed values for enum types
 * @property {string} description - Description of the schema
 * @property {any} [default] - Default value
 */

/**
 * @typedef {Object} ComponentProp
 * @property {string} type - Type of the prop
 * @property {string[]} [enum] - Allowed values for enum props
 * @property {any} [default] - Default value
 * @property {string} description - Description of the prop
 * @property {boolean} required
 * @property {string} [$ref] - Reference to a schema definition
 */

/**
 * @typedef {Object} ComponentExample
 * @property {string} name - Name of the example
 * @property {Record<string, any>} props - Example props
 * @property {string} [children] - Example content/children
 */

/**
 * @typedef {Object} ComponentSlot
 * @property {string} description - Description of the slot
 * @property {string} exposed_data 
 */

/**
 * @typedef {Object} ComponentEvent
 * @property {string} name 
 * @property {string} description 
 */

/**
 * @typedef {Object} ComponentDefinition
 * @property {string} esentire_component - ESentire component name
 * @property {string} category - Component category
 * @property {string} descriptions - Component description
 * @property {string} component_hierarchy 
 * @property {string} component_type 
 * @property {Record<string, ComponentProp>} props - Component props
 * @property {Record<string, ComponentEvent>} events - Component events
 * @property {Record<string, ComponentSlot>} [slots] - Component slots
 * @property {Record<string, any>} exposed
 * @property {ComponentExample[]} [examples] - Usage examples
 */

/**
 * @typedef {Object} CategoryDefinition
 * @property {string} name - Category name
 * @property {string} description - Category description
 * @property {string} icon - Category icon
 */

/**
 * @typedef {Object} ComponentRegistry
 * @property {string} version - Registry version
 * @property {string} framework - Target framework (e.g., "vue")
 * @property {string} library - Library name (e.g., "@esentire/fabric")
 * @property {Record<string, SchemaDefinition>} schemas - Reusable schema definitions
 * @property {Record<string, ComponentDefinition>} components - Component definitions
 * @property {Record<string, CategoryDefinition>} categories - Component categories
 */

// ---------- types ends here ------------ 




function parseDefinitions(defs) {
  const filename = 'defs.ts';
  const combinedSource = defs.map(d => d.definition).join('\n');

  // Create a SourceFile AST node
  const sourceFile = ts.createSourceFile(
    filename,
    combinedSource,
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true
  );

  const compilerOptions = ts.getDefaultCompilerOptions();
  const defaultHost = ts.createCompilerHost(compilerOptions, true);

  // Custom host intercepts file reads for our in-memory source
  const customHost = {
    ...defaultHost,
    getSourceFile: (name, languageVersion, onCreate) => {
      if (name === filename) {
        return sourceFile;
      }
      return defaultHost.getSourceFile(name, languageVersion, onCreate);
    },
    fileExists: f => (f === filename) || defaultHost.fileExists(f),
    readFile: f => (f === filename ? combinedSource : defaultHost.readFile(f)),
    // You can leave writeFile, getDefaultLibFileName, etc., as default implementations
  };

  // Create a Program that knows about our virtual file
  const program = ts.createProgram([filename], compilerOptions, customHost);
  const checker = program.getTypeChecker();

  return { program, sourceFile, checker };
}

function extractLiteralUnion(node){
  const t = node.type;
  if (ts.isUnionTypeNode(t)) {
    const literals = [];
    for (const member of t.types) {
      if (!ts.isLiteralTypeNode(member)) {
        return null; // unsupported member kind inside union
      }
      const lit = member.literal;
      if (ts.isStringLiteral(lit)) {
        literals.push(lit.text);
      } else if (ts.isNumericLiteral(lit)) {
        literals.push(Number(lit.text));
      } else if (lit.kind === ts.SyntaxKind.TrueKeyword) {
        literals.push(true);
      } else if (lit.kind === ts.SyntaxKind.FalseKeyword) {
        literals.push(false);
      } else if (ts.isPrefixUnaryExpression(lit) && lit.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(lit.operand)) {
        // negative numeric literal type e.g. -1
        literals.push(-Number(lit.operand.text));
      } else {
        return null; // contains non-(string|number|boolean) literal → fallback to checker based extraction
      }
    }
    return literals;
  }
  return null;
}

function extractTypesFromAST(sourceFile, checker) {
  const out = {};

  function visit(node) {
    if (ts.isTypeAliasDeclaration(node)) {
      const name = node.name.text;
      const literalValues = extractLiteralUnion(node);
      if (literalValues) {
        out[name] = { values: literalValues };
      } else {
        // Attempt to resolve union literal values produced via constructs like `keyof typeof obj`
        // First, detect explicit `keyof typeof <identifier>` pattern and, if we cannot derive literals,
        // preserve the textual form instead of enumerating prototype members (toString, valueOf, ...)
        if (node.type && ts.isTypeOperatorNode(node.type) && node.type.operator === ts.SyntaxKind.KeyOfKeyword) {
          const inner = node.type.type; // underlying type
          if (inner && ts.isTypeQueryNode(inner)) {
            // Defer literal resolution attempt; store expression text as fallback marker
            var keyOfTypeExpressionText = node.type.getText(sourceFile);
          }
        }
        const type = checker.getTypeAtLocation(node.type || node);
        if (keyOfTypeExpressionText) {
            // Provide the textual alias expression instead of noisy prototype members
            out[name] = { type: keyOfTypeExpressionText };
          } else {
            // Fallback: treat as object-like type and enumerate its properties (original behavior)
            const props = {};
            for (const sym of type.getProperties()) {
              const propType = checker.getTypeOfSymbolAtLocation(sym, node);
              props[sym.getName()] = checker.typeToString(propType);
            }
            out[name] = props;
          }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return out;
}





/**
 * Transform stories object to extract schema information
 * @param {StoriesObject} stories - The raw stories object
 * @param {ComponentRegistry} transformed
 * @returns {ProcessedType[]} - Array of processed type definitions
 */
function transformSchemas(stories, transformed){
    // parses raw typescript types and converts them to JSON/Dictionary encoded schema definitions
    const _types=stories["processed_types"] || []
    const { program, sourceFile, checker } = parseDefinitions(_types);
    const extracted_types = extractTypesFromAST(sourceFile, checker);
    Object.entries(extracted_types).forEach(([typeName, typeDef])=>{
      if(typeName.endsWith("Props")){
        delete extracted_types[typeName]
      }
    })
    transformed["schemas"] = extracted_types; 
}


/**
 * Transform stories object to extract component entries only
 * @param {StoriesObject} _stories - The raw stories object
 * @param {ComponentRegistry} transformed
 * @returns {Record<string, StoryEntry>} - Filtered stories without processed_css and processed_types
 */
function transformComponents(_stories,transformed){
    const exclude_keys=["processed_css","processed_types"]
    /** @type {StoryMap} */
    const stories=Object.fromEntries(Object.entries(_stories).filter(([key])=>!exclude_keys.includes(key)))

     /** @type {Record<string, ComponentDefinition>} components */
    const registry={}
    const categories={}

    


    Object.entries(stories).forEach(([story_key,story_entry])=>{

        registry[story_entry.component_tag]=registry[story_entry.component_tag] || {}
        const current_reg=registry[story_entry.component_tag]

        current_reg.esentire_component_tag=story_entry.component_tag
        current_reg.description=story_entry.descriptions || ""
        current_reg.category_path=story_entry.context.title
        current_reg.component_hierarchy=story_entry.component_hierarchy
        current_reg.component_type=story_entry.component_type
        current_reg.category=story_entry.context.title.split("/")[1]
        categories[current_reg.category]=categories[current_reg.category] || {components:new Set()}
        categories[current_reg.category].components.add(story_entry.component_tag)

        current_reg.props=current_reg.props || {}
        current_reg.events=current_reg.events || {}
        current_reg.slots=current_reg.slots || {}
        current_reg.exposed=current_reg.exposed || {}


        /**
         * @param {string} _type 
         * @returns {string} 
         */
        const findRelevantType=(_type)=>{
            let matched_type=""
            let match_score=0
            Object.entries(transformed["schemas"] || {}).forEach(([schema_key,schema_entry])=>{
                if(_type.includes(schema_key) && match_score < schema_key.length){
                    matched_type=schema_key
                    match_score=schema_key.length
                }
            })
            return matched_type
        }


        Object.entries(story_entry.props).forEach(([prop_key,prop_entry])=>{
            current_reg.props[prop_key]= current_reg.props[prop_key] || {}
            if(Array.isArray(prop_entry.type?.value)){
                current_reg.props[prop_key].type=prop_entry.type.name
                current_reg.props[prop_key].enum=prop_entry.type.value
            }
            else if(["any"].includes(prop_entry.type?.value)){
                 current_reg.props[prop_key].type=prop_entry.type.value
            }
            else if(prop_entry.type?.value && typeof(prop_entry.type.value)=="string"){
                const relevant_type=findRelevantType(prop_entry.type.value)
                if(relevant_type){
                    current_reg.props[prop_key].$ref="#/schemas/"+relevant_type
                }
                current_reg.props[prop_key].type=prop_entry.type.value
            } 
            else if(prop_entry.type?.value && typeof(prop_entry.type.value)!="string"){
                current_reg.props[prop_key].type=prop_entry.type.value
            } 
            else if(prop_entry.type?.name){
                current_reg.props[prop_key].type=prop_entry.type.name
            }
            current_reg.props[prop_key].description=prop_entry.description
            current_reg.props[prop_key].default=prop_entry.defaultValue
            current_reg.props[prop_key].required=prop_entry.type?.required
        })

        Object.entries(story_entry.events).forEach(([event_key, event_entry])=>{
           current_reg.events[event_key]= current_reg.events[event_key] || {
              event:event_entry.signature || event_entry.name,
              description:event_entry.description
           }
        })

        Object.entries(story_entry.slots).forEach(([slot_key, slot_entry])=>{
            current_reg.slots[slot_key]= current_reg.slots[slot_key] || {}
            current_reg.slots[slot_key].exposed_data=slot_entry?.type?.value
            current_reg.slots[slot_key].description=slot_entry?.descriptions
        })

        Object.entries(story_entry.exposed).forEach(([exposed_key,exposed_entry])=>{
          exposed_entry.control=undefined
          exposed_entry.table=undefined
          current_reg.exposed[exposed_key]=exposed_entry
        })
                  


        try{
          current_reg.examples = current_reg.examples || {}
          // if(Object.keys(current_reg.examples).length > 0) return 
          const uiJson = transformStoryToUiJson(story_key, story_entry)

          if(uiJson && !uiJson.error){
            current_reg.examples[story_key] = uiJson
          }
        }catch(e){
          // swallow – we don't want to break registry generation
        }

    })

   

    transformed["components"]=registry
    transformed["categories"]=categories
}



/**
 * Main function to transform stories into component registry
 * @returns {void}
 */
function transformToRegistry(){
    /** @type {StoriesObject} */
    const stories = JSON.parse(fs.readFileSync(`${STORIES_DIR}/docs.json`, 'utf-8'))

    /** @type {ComponentRegistry} */
    const transformed={}
    transformed["version"]="{{-FABRIC_VERSION-}}"
    transformed["framework"]="vue"
    transformed["library"]="@esentire/fabric"

    transformSchemas(stories,transformed)
    transformComponents(stories,transformed)

     transformed["predefined_css_definitions"]=stories["processed_css"] || ""

    const doc = new YAML.Document();
    doc.contents = transformed;
    fs.writeFileSync(`${STORIES_DIR}/genui-registry.yml`, doc.toString())




  const minimal_doc={}
  Object.entries(stories).forEach(([comp, comp_data]) => {
    if(comp== 'processed_css' || comp=='processed_types') return
    if(!minimal_doc[comp_data.component_tag]){
      minimal_doc[comp_data.component_tag] = {
        props:{},
        slots:{},
        events:{},
        exposed:{},
        unknownArgs:{},
      }
    }
    Object.assign(minimal_doc[comp_data.component_tag].props, comp_data.props)
    minimal_doc[comp_data.component_tag].component_hierarchy=comp_data.component_hierarchy
    minimal_doc[comp_data.component_tag].component_type=comp_data.component_type
    minimal_doc[comp_data.component_tag].descriptions=comp_data.descriptions
    if(comp_data.category) minimal_doc[comp_data.component_tag].category=comp_data.category
    Object.assign(minimal_doc[comp_data.component_tag].slots, comp_data.slots)
    Object.assign(minimal_doc[comp_data.component_tag].events, comp_data.events)
    Object.assign(minimal_doc[comp_data.component_tag].exposed, comp_data.exposed)
    Object.assign(minimal_doc[comp_data.component_tag].unknownArgs, comp_data.unknownArgs)
  })
   Object.entries(minimal_doc).forEach(([comp, comp_data]) => {
    if(comp== 'processed_css' || comp=='processed_types') return
    if(comp_data){
      Object.entries(comp_data).forEach(([prop_key,properties])=>{
        if(Object.values(properties).length === 0){
          delete comp_data[prop_key]
        }       
      })         
    }
   })
  fs.writeFileSync(`${STORIES_DIR}/docs-min.json`, JSON.stringify({
    components: minimal_doc,
    total_components: Object.keys(minimal_doc).length,
    // processed_types: stories['processed_types'],
    types: {...transformed["schemas"]}
  })) // will be part of npm bundle

   const doc2 = new YAML.Document();
    doc2.contents = {
    components: minimal_doc,
    total_components: Object.keys(minimal_doc).length,
    // processed_types: stories['processed_types'],
    types: {...transformed["schemas"]}
  }
  fs.writeFileSync(`${STORIES_DIR}/docs-min.yml`, doc2.toString())
}

transformToRegistry()