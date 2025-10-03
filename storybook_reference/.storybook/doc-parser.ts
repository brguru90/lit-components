import { readFile, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { getProjectRoot } from 'storybook/internal/common';
import {
  type ComponentMeta,
  type MetaCheckerOptions,
  type PropertyMetaSchema,
  TypeMeta,
  createChecker,
  createCheckerByJson,
} from 'vue-component-meta';
import { parseMulti } from 'vue-docgen-api';
import * as ts from 'typescript'

async function getTsConfigReferences(tsConfigPath: string) {
  try {
    const content = JSON.parse(await readFile(tsConfigPath, 'utf-8'));

    if (!('references' in content) || !Array.isArray(content.references)) {
      return [];
    }
    return content.references as unknown[];
  } catch {
    // invalid project tsconfig
    return [];
  }
}

async function fileExists(fullPath: string) {
  try {
    await stat(fullPath);
    return true;
  } catch {
    return false;
  }
}


async function createVueComponentMetaChecker(tsconfigPath = 'tsconfig.json', _file:string) {
  const checkerOptions: MetaCheckerOptions = {
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

function getFullyQualifiedName(type: ts.Type,tsLs:ts.LanguageService) {
    const program = tsLs.getProgram()!;
		const typeChecker = program.getTypeChecker();
		const str = typeChecker.typeToString(
			type,
			undefined,
			ts.TypeFormatFlags.UseFullyQualifiedType | ts.TypeFormatFlags.NoTruncation 
		);
		if (str.includes('import(')) {
			return str.replace(/import\(.*?\)\./g, '');
		}
		return str;
	}



async function applyTempFixForEventDescriptions(filename: string, componentMeta: ComponentMeta[], checker) {
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

export async function getDoc(id:string,_file:string){
    checker =  checker || await createVueComponentMetaChecker('tsconfig.json',_file);
    // console.log({checker})
    // const exportNames = checker.getExportNames(id);
    // console.log({exportNames})
    let componentsMeta = [checker.getComponentMeta(_file)];
    // console.log({componentsMeta})
    return (await applyTempFixForEventDescriptions(id, componentsMeta,checker))[0];
}