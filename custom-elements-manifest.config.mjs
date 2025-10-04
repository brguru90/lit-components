import { generateCustomData } from "cem-plugin-vs-code-custom-data-generator";
import { customElementVsCodePlugin } from "custom-element-vs-code-integration";
import { customElementReactWrapperPlugin } from "custom-element-react-wrappers";
// import { getTsProgram, expandTypesPlugin } from "cem-plugin-expanded-types";
import { customElementVuejsPlugin } from "custom-element-vuejs-integration";
import { jsDocTagsPlugin } from "@wc-toolkit/jsdoc-tags";
import { jsxTypesPlugin } from "@wc-toolkit/jsx-types";
import { getTsProgram, typeParserPlugin } from "@wc-toolkit/type-parser";


import reactify from "cem-plugin-reactify";
import {dynamicRenameEventsPlugin} from './scripts/event_rename.js'
// import { customJSDocTagsPlugin } from "cem-plugin-custom-jsdoc-tags";
// import { updateCemInheritance } from "custom-elements-manifest-inheritance";


import fs from "fs"


function myPlugin() {
  return {
    name: 'my-plugin',
    packageLinkPhase({ customElementsManifest, context }) {
      fs.writeFileSync("dist/vue/index.js", "import \"../index.js\";\nimport \"../index.css\";\n");
      fs.writeFileSync("dist/jsx/index.js", "import \"../index.js\";\nimport \"../index.css\";\n");
      // fs.copyFileSync('./vg-package.json', './dist/package.json');
      // fs.copyFileSync('./vg-package-lock.json', './dist/package-lock.json');
    }
  }
}

export default {
  globs: ["src/**/*.{js,ts}"],
  exclude: ["node_modules", "dist", "public", "types"],
  outdir: "dist",
  litelement: true,
  packagejson: true,
  dev: false,
  fast: false,
  stencil: false,
  catalyst: false,
  plugins: [
    typeParserPlugin({ propertyName: "expandedType" }),
    jsDocTagsPlugin({
      tags: {
        figma: {
          description: "Link to the Figma design",
          type: "string",
          tagMapping: "figma",
        },
        github: {
          description: "Link to the GitHub repo",
          type: "string",
          tagMapping: "github",
        },
      },
    }),
    jsxTypesPlugin({
      outdir: "dist/jsx",
      fileName: "index.d.ts",
      globalTypePath: "../index",
    }),
    customElementReactWrapperPlugin({
      outdir: "dist/react",
      modulePath: (className, tagName) => `../index.js`,
      attributeMapping: {
        for: "_for",
      },
      ssrSafe: false,
      reactProps: true,
    }),
    // reactify({
    //   outdir: "dist/react2",
    //   attributeMapping: {
    //     for: "_for",
    //   },
    // }),
    // generateCustomData({
    //   outdir: "dist",
    //   htmlFileName: "vg.html-custom-data.json",
    //   cssFileName: "vg.css-custom-data.json",
    //   descriptionSrc: "description",
    //   slotDocs: true,
    //   eventDocs: true,
    //   cssPropertiesDocs: true,
    //   cssPartsDocs: true,
    //   methodDocs: true,
    // }),
    customElementVsCodePlugin({
      outdir: "dist",
      htmlFileName: "vg.html-custom-data.json",
      cssFileName: "vg.css-custom-data.json",
      descriptionSrc: "description",
    }),
    dynamicRenameEventsPlugin({ // fix for vue event names
      transform: (name) =>name.includes("-") ? `-${name}` : name
    }),
    customElementVuejsPlugin({
      outdir: "./dist/vue",
      fileName: "index.d.ts",
      typesSrc: "./dist/vue",
      globalTypePath: "../index",
    }),
    dynamicRenameEventsPlugin({ // reset event name after vuejs plugin
      transform: (name) =>name.startsWith("-") ? name.slice(1) : name
    }),
    myPlugin(),
  ],
  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, "tsconfig-module.json");
    return program
      .getSourceFiles()
      .filter((sf) => globs.find((glob) => sf.fileName.includes(glob)));
  },
};
