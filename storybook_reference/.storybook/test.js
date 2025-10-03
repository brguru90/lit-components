import { parse } from 'vue-docgen-api';
import fs from 'fs'
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { getProjectRoot } from 'storybook/internal/common';
import {
  TypeMeta,
  createChecker,
  createCheckerByJson,
} from 'vue-component-meta';
import * as ts from 'typescript'
const glob = require('glob');

const test_file="src/components/complex/table/EsTable.vue"
// const test_file="src/components/charts/EsBar.vue"


const metaData = await parse(test_file);








async function getTsConfigReferences(tsConfigPath) {
  try {
    const content = JSON.parse(await readFile(tsConfigPath, 'utf-8'));

    if (!('references' in content) || !Array.isArray(content.references)) {
      return [];
    }
    return content.references;
  } catch {
    // invalid project tsconfig
    return [];
  }
}

async function fileExists(fullPath) {
  try {
    await stat(fullPath);
    return true;
  } catch {
    return false;
  }
}


async function createVueComponentMetaChecker(tsconfigPath = 'tsconfig.json', _file) {
  const checkerOptions = {
    forceUseTs: true,
    noDeclarations: true,
    printer: { newLine: 1 },
    rawType: true,
  };

  const projectRoot = getProjectRoot();

  const projectTsConfigPath = join(projectRoot, tsconfigPath);

  const defaultChecker = createCheckerByJson(projectRoot, { include: [_file] }, checkerOptions);


  if (await fileExists(projectTsConfigPath)) {
    const references = await getTsConfigReferences(projectTsConfigPath);

    if (references.length > 0) {
      return defaultChecker;
    }
    return createChecker(projectTsConfigPath, checkerOptions);
  }

  return defaultChecker;
}

function getFullyQualifiedName(type,tsLs) {
    const program = tsLs.getProgram();
        const typeChecker = program.getTypeChecker();
        const str = typeChecker.typeToString(
            type,
            undefined,
            64 | 1 
        );
        if (str.includes('import(')) {
            return str.replace(/import\(.*?\)\./g, '');
        }
        return str;
    }



async function applyTempFixForEventDescriptions(filename, componentMeta, checker) {
  componentMeta.map((meta, index) => {
      meta["props_parsed"]=meta.props.map((prop) => {
        if(!prop.rawType) return {name:prop.name,type:prop.type}
        const type2 = getFullyQualifiedName(prop.rawType, checker.__internal__.tsLs);
        return {name:prop.name,type:type2}
      });
  })
  return componentMeta;
}



let checker

export async function getDoc(id,_file){
    checker =  checker || await createVueComponentMetaChecker('tsconfig.json',_file);
    // console.log({checker})
    // const exportNames = checker.getExportNames(id);
    // console.log({exportNames})
    let componentsMeta = [checker.getComponentMeta(_file)];
    // console.log({componentsMeta})
    return (await applyTempFixForEventDescriptions(id, componentsMeta,checker))[0];
}
 

 const doc=await getDoc("EsTable",test_file)
    const props_type_intact={}
    doc.props_parsed.forEach((prop)=>{
      props_type_intact[prop.name]=prop.type
    })




// console.log(JSON.stringify(metaData, null, 2));
console.log(doc)

// fs.writeFileSync(`docs/docs.json`, JSON.stringify(metaData, null, 2))