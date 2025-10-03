import { type TestRunnerConfig, getStoryContext } from '@storybook/test-runner'
import * as ts from 'typescript'
import fs from 'fs'
import {getDoc} from "./doc-parser"

const process = require('process')

const stories = {}
const STORIES_DIR = `./storybook-static/stories_doc`
fs.mkdirSync(STORIES_DIR, { recursive: true })



const config: TestRunnerConfig = {
  async postVisit(page, context) {
    // the #storybook-root element wraps the story. In Storybook 6.x, the selector is #root
    // const elementHandler = await page.$('#storybook-root');
    // const innerHTML = await elementHandler?.innerHTML();
    // expect(innerHTML).toMatchSnapshot()
    const elementHandler = await page.$('#storybook-root')
    const storyContext = await getStoryContext(page, context) // storybook internally uses vue-component-meta & vue-docgen-api(fallback & sometime together) to get documentation, can be run it standalone

    const indexUrl = new URL('/index.json', page.url()).href
    const resp = await page.request.get(indexUrl)
    const indexJson = await resp.json()

    const story_path=indexJson?.['entries']?.[context.id].importPath

    const sourceFilePath=storyContext?.component?.__docgenInfo?.sourceFiles || storyContext?.component?.__docgenInfo?.sourceFiles
    const doc_errors:string[]=[]
    if(!sourceFilePath){
      doc_errors.push(`meta.component: EsComponentName, is incorrect(avoid typecast) or not present in story file - ${story_path}`)
    }


    const descriptions=[
      storyContext?.parameters?.docs?.description?.component,
      storyContext?.parameters?.docs?.description?.story
    ]

    const descriptions_str=descriptions.filter(item=>!!item).join('\n')
    if(!descriptions_str){
      doc_errors.push(`description missing for component in story file - ${story_path}\n,In meta?.parameters?.docs?.description?.component or meta?.parameters?.docs?.description?.story`)
    } else if(!descriptions_str.includes("#### AI Instruction:")){
      doc_errors.push(`"#### AI Instruction:" missing within description for component in story file - ${story_path}\n,In meta?.parameters?.docs?.description?.component or meta?.parameters?.docs?.description?.story`)
    }

    if(!storyContext?.parameters?.docs?.component_hierarchies){
      doc_errors.push(`component_hierarchies missing for component in story file - ${story_path}\n,In meta?.parameters?.docs?.component_hierarchies`)
    }

    if(!storyContext?.parameters?.docs?.component_type){
      doc_errors.push(`component_type missing for component in story file - ${story_path}\n,In meta?.parameters?.docs?.component_type`)
    }

    if(doc_errors.length){
      throw new Error(doc_errors.join("\n"))
    }

    const doc=await getDoc(context.id,sourceFilePath)
    const props_type_intact:any={}
    const orig_event:any={}
    doc.props_parsed.forEach((prop)=>{
      props_type_intact[prop.name]=prop.type
    })
    doc.events.forEach((event)=>{
      orig_event[event.name]=event
    })
    // console.log({doc:doc,storyContext:storyContext,props_type_intact:props_type_intact})

    // have to try this running single playwright instance (import type { PreviewWeb } from 'storybook/preview-api')
    // but anyway it will only works after render, so no advantage of using it over test-runner
    // globalThis.__STORYBOOK_PREVIEW__.storyStore.loadStory({ storyId })


    const props:any = {}
    const slots:any = {}
    const events:any = {}
    const exposed:any={}
    const unknownArgs:any = {}
 
    for (const [key, curArg] of Object.entries(storyContext.argTypes)) {
      if (curArg.table?.category?.toLowerCase() === 'slots') {
        let description=curArg.description
        if(!description){
          const matchedSlot=storyContext?.component?.__docgenInfo?.slots?.find((slot: any) => slot?.name === key)
          description=matchedSlot?.description || ''
        }
        slots[key] = {
          name: curArg.name,
          type: curArg.type,
          descriptions: description
        }
      } else if (curArg.table?.category?.toLowerCase() === 'events') {
        events[key] = {
          name: curArg.name,
          description: curArg.description || orig_event[curArg.action]?.description || '',
        }
        const matchedEvent=storyContext?.component?.__docgenInfo?.events?.find((event: any) => event?.name === key)
        if (matchedEvent) {
          events[key].signature = matchedEvent?.signature  // signature is better understandable than type
          events[key].parameters = matchedEvent.schema
        } else{
          events[key].type = curArg.type
          events[key].signature = typeof(orig_event[curArg.action]?.signature)=="string"?orig_event[curArg.action]?.signature:undefined  // signature is better understandable than type
        }
      } else if (curArg.table?.category?.toLowerCase() === 'props' || (!curArg.table?.category && curArg.type?.name!='function')) {
        props[key] = {
          name: curArg.name,
          type: curArg.type,
          defaultValue: curArg?.defaultValue || curArg.table?.defaultValue,
          description: curArg.description || ''
        }
        if(curArg.options){
          props[key].type=props[key].type || {name:"enum"}
          props[key].type.value=curArg.options
        } else if(typeof(props[key]?.type?.value)=='string' && props[key]?.type?.value.includes("more ...")){
          props[key].type.__value=props[key].type.value
          props[key].type.value=props_type_intact[key]          
        }
      }         
      else {
        unknownArgs[key] = curArg
      }
    }

    if(storyContext?.component?.__docgenInfo?.exposed && Array.isArray(storyContext?.component?.__docgenInfo?.exposed)){
      storyContext?.component?.__docgenInfo?.exposed.forEach((item)=>{
        if(unknownArgs[item.name]){
          exposed[item.name]=unknownArgs[item.name]
          delete unknownArgs[item.name]
        }
        else if(!props[item.name]){
          exposed[item.name]=item
        }
      })
    }

    // const componentTsCode=storyContext.parameters.docs.source.originalSource ?? storyContext?.moduleExport?.parameters?.docs?.source?.originalSource
    // const componentJjsCode = ts.transpileModule(componentTsCode, {
    //     compilerOptions: { module: ts.ModuleKind.CommonJS,isolatedModules: true, noLib:true, target: ts.ScriptTarget.ESNext ,noEmitHelpers:true,importHelpers:true},
    // }).outputText;
    // console.log({componentJjsCode:componentJjsCode})

    const originalSource =
      storyContext.parameters.docs.source.originalSource ??
      storyContext?.moduleExport?.parameters?.docs?.source?.originalSource
    let onlyTemplate = originalSource.match(/template\:\s+\`([\s|\S]+)\`/)?.[1]?.trim()
    const story_name = indexJson?.['entries']?.[context.id]?.importPath
      ?.match(/\/?(Es(!\s|\S)+)\.stories\.ts/)?.[1]
      ?.trim()

    if(!onlyTemplate){
      // in case of default story, there might not be template, so have to fetch from the story definition
      // mostly the first template is from the story definition
      const source=fs.readFileSync(storyContext.parameters.fileName, 'utf-8')
      onlyTemplate = source.match(/template\:\s+\`([\s\S]+?)\`/)?.[1]?.trim()
    }
    

    let component_tag =
      storyContext.component?.__name ?? storyContext.component?.__docgenInfo?.displayName // component name for EsCardStyleOne is StyleOne basically its the file display name, which might not work always

    try {
      const program = ts.createProgram([storyContext.parameters.fileName], {})
      program.getTypeChecker() // it should be called
      const sourceFile = program.getSourceFile(storyContext.parameters.fileName)!
      ts.forEachChild(sourceFile, function find(node) {
        if (ts.isVariableStatement(node)) {
          const decl = node.declarationList.declarations[0]

          // Check if the variable has a type annotation of Meta<typeof ComponentName>
          if (decl.type && ts.isTypeReferenceNode(decl.type)) {
            const typeName = decl.type.typeName
            if (ts.isIdentifier(typeName) && typeName.getText() === 'Meta') {
              const typeArgs = decl.type.typeArguments
              if (typeArgs && typeArgs.length > 0) {
                const firstTypeArg = typeArgs[0]
                if (ts.isTypeQueryNode(firstTypeArg) && ts.isIdentifier(firstTypeArg.exprName)) {
                  component_tag = firstTypeArg.exprName.getText()
                }
              }
              return
            }
          }

          // Fallback to original logic if type annotation approach doesn't work
          if (node.declarationList.declarations[0].name.getText() === 'meta') {
            const init = decl.initializer
            if (init && ts.isObjectLiteralExpression(init)) {
              for (const prop of init.properties) {
                if (ts.isPropertyAssignment(prop) && prop.name.getText() === 'component') {
                  const expr = prop.initializer
                  if (ts.isIdentifier(expr)) {
                    const name = expr.getText()
                    component_tag = name
                    return
                  }
                }
              }
            }
            return
          }
        }
        // ts.forEachChild(node, find) // it mostly not nested meta is the first level variable
      })
    } catch (error) {
      console.error(storyContext?.parameters?.fileName, 'parse error', error)
    }



    stories[context.id] = {
      context,
      component_tag,
      story_name, 
      descriptions: descriptions_str, 
      component_hierarchy: storyContext?.parameters?.docs?.component_hierarchies,
      component_type: storyContext?.parameters?.docs?.component_type,
      source: onlyTemplate || (originalSource.match(/template/) ? originalSource : ""), // provide original source if regex on template fails
      meta: indexJson?.['entries']?.[context.id],
      props,
      slots,
      events,
      exposed,
      unknownArgs,
      currentArgs: storyContext.initialArgs,
      design: storyContext?.parameters?.design,
      rendered_source: await elementHandler?.innerHTML(),
      // argTypes: storyContext.argTypes,
      // __storyContext: storyContext,
    }
    const STORIES_PATH = `${STORIES_DIR}/chunk_${process.pid}_${context.id}.json`
    fs.writeFileSync(STORIES_PATH, JSON.stringify(stories))
  }
}

export default config
