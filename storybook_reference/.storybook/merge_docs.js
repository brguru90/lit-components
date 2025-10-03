import fs from 'fs'
import path from 'path'
import * as sass from 'sass'
import lzma from 'lzma-native'
import ts from 'typescript'
import glob from 'glob'


const STORIES_DIR = `./storybook-static/stories_doc`

function resolveVueComponents() {
  console.log('Resolving Vue components using TypeScript analysis...')
  
  const allVueComponents = []
  
  try {
    // Use TypeScript to get all exports from src/index.ts
    const program = ts.createProgram({
      rootNames: ['src/index.ts'],
      options: {
        allowJs: true,
        jsx: ts.JsxEmit.Preserve,
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        baseUrl: '.',
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        skipLibCheck: true,
        noEmit: true
      }
    })
    
    function extractExportsFromFile(sourceFile, visited = new Set()) {
      const fileName = sourceFile.fileName
      if (visited.has(fileName) || sourceFile.isDeclarationFile) {
        return []
      }
      visited.add(fileName)
      
      const exports = []
      
      ts.forEachChild(sourceFile, (node) => {
        if (ts.isExportDeclaration(node)) {
          // Handle named exports: export { ComponentName } or export { default as ComponentName }
          if (node.exportClause && ts.isNamedExports(node.exportClause)) {
            node.exportClause.elements.forEach(element => {
              if (ts.isExportSpecifier(element)) {
                const exportName = element.name.text
                if (exportName.startsWith('Es') && exportName !== 'registerEsWebComponent') {
                  exports.push(exportName)
                }
              }
            })
          }
          
          // Handle re-exports: export * from './module'
          if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
            const modulePath = node.moduleSpecifier.text
            try {
              const resolvedModule = ts.resolveModuleName(
                modulePath,
                sourceFile.fileName,
                program.getCompilerOptions(),
                ts.sys
              )
              
              if (resolvedModule.resolvedModule) {
                const moduleSourceFile = program.getSourceFile(resolvedModule.resolvedModule.resolvedFileName)
                if (moduleSourceFile) {
                  exports.push(...extractExportsFromFile(moduleSourceFile, visited))
                }
              }
            } catch (err) {
              // Continue on resolution errors
            }
          }
        }
      })
      
      return exports
    }
    
    const mainSourceFile = program.getSourceFile('src/index.ts')
    if (mainSourceFile) {
      console.log('Analyzing TypeScript exports...')
      const exports = extractExportsFromFile(mainSourceFile)
      const vueComponents = [...new Set(exports)].sort()
      allVueComponents.push(...vueComponents)      
    }
    
  } catch (error) {
    console.warn('Error in TypeScript analysis:', error.message)
    console.log('Using regex fallback...')
    
    // Fallback: parse index files with regex
    const indexFiles = glob.sync('src/**/index.ts')
    const exportedComponentNames = new Set()
    
    indexFiles.forEach(indexFile => {
      try {
        const content = fs.readFileSync(indexFile, 'utf-8')
        const lines = content.split('\n')
        
        lines.forEach(line => {
          // Match both: export { ComponentName } and export { default as ComponentName }
          const exportMatch = line.match(/export\s+\{\s*(?:default\s+as\s+)?(\w+)\s*\}/)
          if (exportMatch) {
            const componentName = exportMatch[1]
            if (componentName.startsWith('Es') && componentName !== 'registerEsWebComponent') {
              exportedComponentNames.add(componentName)
            }
          }
        })
      } catch (err) {
        console.warn(`Error reading ${indexFile}:`, err.message)
      }
    })
    
    allVueComponents.push(...Array.from(exportedComponentNames).sort())
  }
  
  return allVueComponents
}

function mergeDocs() {
  const files = fs.readdirSync(STORIES_DIR).filter((f) => f.startsWith('chunk_'))
  let all = {}
  if (files.length === 0) {
    all = JSON.parse(fs.readFileSync(`${STORIES_DIR}/docs.json`, 'utf-8'))
  }
  files.forEach((f) => {
    const data = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8'))
    all = Object.assign(all, data)
    fs.unlinkSync(path.join(STORIES_DIR, f))
  })

  console.log(Object.keys(all).length, 'stories collected')
  fs.writeFileSync(`${STORIES_DIR}/docs.json`, JSON.stringify(all, null, 2))

  const result = sass.compile(`.storybook/all.scss`, {
    style: 'compressed',
    // style: 'expanded',
    sourceMap: true,
  })
  
  all['processed_css'] = result.css.toString() // since it has lot of data, may be hae to try some way to do callback to client LLM for indexing & proper categorization of css

  const componentsFromStories=new Set()
  Object.entries(all).forEach(([key, story])=>{
    if(story?.component_tag){
      componentsFromStories.add(story.component_tag)
    }
  })

  // Resolve all Vue components from exports
  const allVueComponents = resolveVueComponents()
  
  // Validation against stories
  console.log("component counts from stories:", componentsFromStories.size)
  console.log("actual vue3 components found:", allVueComponents.length)

  const exempted_components=[]

  const missingComponents = allVueComponents.filter(c => !componentsFromStories.has(c) && !exempted_components.includes(c))
  if(missingComponents.length > 0){
    throw new Error(`${missingComponents.length} components without stories:\n${missingComponents.join("\n")}`)
  }


  const allTypes = []
  try {
    const program = ts.createProgram({
      rootNames: [...glob.sync('src/**/*.ts'), ...glob.sync('src/**/*.vue')],
      options: {
        allowJs: false,
        jsx: 'preserve',
        moduleResolution: ts.ModuleResolutionKind.NodeJs,
        baseUrl: '.',
        paths: { '@/*': ['src/*'] }
      }
    })
    const checker = program.getTypeChecker()
    const printer = ts.createPrinter()

    for (const sf of program.getSourceFiles()) {
      if (sf.isDeclarationFile) continue
      const visit = (node) => {
        // Interfaces & Type aliases
        if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
          const typeName = node.name.text
          const printed = printer.printNode(ts.EmitHint.Unspecified, node, sf)
          allTypes.push({
            name: typeName,
            definition: printed
          })
        }
        // Enums
        else if (ts.isEnumDeclaration(node)) {
          const typeName = node.name.text
          const printed = printer.printNode(ts.EmitHint.Unspecified, node, sf)
          allTypes.push({
            name: typeName,
            definition: printed
          })
        }
        // Exported const object maps (e.g., graphColors) -> convert to union type
        else if (ts.isVariableStatement(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
          for (const decl of node.declarationList.declarations) {
            if (!decl.name || !ts.isIdentifier(decl.name)) continue
            const varName = decl.name.text
            if (decl.initializer && ts.isObjectLiteralExpression(decl.initializer)) {
              // We only treat it as a map -> enum-like if every property assignment value is true literal
              const props = decl.initializer.properties
              let allTrueBoolean = true
              const keys = []
              for (const p of props) {
                if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) {
                  const keyName = ts.isIdentifier(p.name) ? p.name.text : p.name.text
                  if (
                    p.initializer &&
                    (p.initializer.kind === ts.SyntaxKind.TrueKeyword)
                  ) {
                    keys.push(keyName)
                  } else {
                    allTrueBoolean = false
                    break
                  }
                } else if (ts.isShorthandPropertyAssignment(p)) {
                  // shorthand implies value is identifier; skip because not explicit true
                  allTrueBoolean = false
                  break
                } else {
                  allTrueBoolean = false
                  break
                }
              }
              if (allTrueBoolean && keys.length) {
                const union = keys.map(k => JSON.stringify(k)).join(' | ')
                const pascal = varName.charAt(0).toUpperCase() + varName.slice(1)
                // Provide two helpful definitions: union type and derived record-like map
                const definition = `export type ${varName} = ${union}\nexport const ${varName}Map: Record<${varName}, true> = {\n${keys.map(k=>`  ${JSON.stringify(k)}: true`).join(',\n')}\n}`
                allTypes.push({
                  name: `${varName}`,
                  definition
                })
              }
            }
          }
        }
        ts.forEachChild(node, visit)
      }
      ts.forEachChild(sf, visit)
    }
  } catch (error) {}

  const jsonRaw = fs.readFileSync('src/components/icons/IconList.json', 'utf-8');
  allTypes.push({
    name: 'IconList',
    definition: "export type IconList ="+JSON.stringify(JSON.parse(jsonRaw), null, 2),
  });

  all['processed_types'] = allTypes
  // all['vue_components'] = allVueComponents

  // special handling for icons
  const iconList = JSON.parse(jsonRaw)
  Object.entries(all).forEach(([comp, comp_data]) => {
    if(!comp_data?.props) return
    Object.entries(comp_data?.props).forEach(([prop_key, prop_data]) => {
      if(prop_data?.type?.name=="IconList") return
      if(!prop_data?.type?.value) return
      if(!Array.isArray(prop_data?.type?.value)) return
      const its_icons=prop_data?.type?.value.slice(0,5).every(item=>iconList[item])
      if(its_icons){
        prop_data.type.name="IconList"
        prop_data.type.value=undefined
      }
    })
  })


  const compressor = lzma.createCompressor({ mode: 9, flags: lzma.FILTER_LZMA2 })
  compressor.pipe(fs.createWriteStream(`${STORIES_DIR}/docs.xz`))
  compressor.end(JSON.stringify(all))

  fs.writeFileSync(`${STORIES_DIR}/docs.json`, JSON.stringify(all, null, 2))
}

mergeDocs()
